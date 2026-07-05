import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  setDoc,
  updateDoc,
  deleteDoc,
  query,
  where,
} from "firebase/firestore";
import { db } from "./firebase";
import type { Insight, ActionItem } from "@/types";

export interface UserSettings {
  autoCategories: boolean;
  extractActionItems: boolean;
  audioTranscription: boolean;
  stripFillerWords: boolean;
  notionToken?: string;
  notionPageId?: string;
}

const DEFAULT_SETTINGS: UserSettings = {
  autoCategories: true,
  extractActionItems: true,
  audioTranscription: true,
  stripFillerWords: true,
};

const USER_SETTINGS = "userSettings";

export async function getUserSettings(userId: string): Promise<UserSettings> {
  try {
    const snap = await getDoc(doc(db, USER_SETTINGS, userId));
    if (!snap.exists()) return { ...DEFAULT_SETTINGS };
    return { ...DEFAULT_SETTINGS, ...snap.data() } as UserSettings;
  } catch {
    return { ...DEFAULT_SETTINGS };
  }
}

export async function saveUserSettings(
  userId: string,
  settings: Partial<UserSettings>
): Promise<void> {
  await setDoc(doc(db, USER_SETTINGS, userId), settings, { merge: true });
}

const INSIGHTS = "insights";

function sortByDate(insights: Insight[]): Insight[] {
  return [...insights].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );
}


export async function createInsight(
  data: Omit<Insight, "id" | "createdAt" | "updatedAt">
): Promise<string> {
  const now = new Date().toISOString();
  // Build payload field-by-field — Firestore rejects undefined values and
  // optional fields (thumbnail, transcript, etc.) must be omitted when absent
  const payload: Record<string, unknown> = {
    userId: data.userId,
    url: data.url,
    platform: data.platform,
    title: data.title,
    summary: data.summary,
    keyPoints: data.keyPoints,
    actionItems: data.actionItems,
    implementationFramework: data.implementationFramework,
    toolsMentioned: data.toolsMentioned ?? [],
    personalRelevance: data.personalRelevance,
    categories: data.categories ?? [],
    tags: data.tags ?? [],
    status: data.status,
    starred: data.starred ?? false,
    confidenceScore: data.confidenceScore,
    createdAt: now,
    updatedAt: now,
  };
  if (data.thumbnail) payload.thumbnail = data.thumbnail;
  if (data.transcript) payload.transcript = data.transcript;
  if (data.viewCount != null) payload.viewCount = data.viewCount;
  if (data.duration) payload.duration = data.duration;
  const ref = await addDoc(collection(db, INSIGHTS), payload);
  return ref.id;
}

export async function getInsight(id: string): Promise<Insight | null> {
  const snap = await getDoc(doc(db, INSIGHTS, id));
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Insight;
}

export async function getUserInsights(userId: string): Promise<Insight[]> {
  const snap = await getDocs(
    query(collection(db, INSIGHTS), where("userId", "==", userId))
  );
  return sortByDate(
    snap.docs.map((d) => ({ id: d.id, ...d.data() } as Insight))
  );
}

export async function getRecentInsights(userId: string, count = 5): Promise<Insight[]> {
  const all = await getUserInsights(userId);
  return all.slice(0, count);
}

export async function updateInsight(id: string, data: Partial<Insight>): Promise<void> {
  await updateDoc(
    doc(db, INSIGHTS, id),
    JSON.parse(JSON.stringify({ ...data, updatedAt: new Date().toISOString() }))
  );
}

export async function deleteInsight(id: string): Promise<void> {
  await deleteDoc(doc(db, INSIGHTS, id));
}

export async function incrementViewCount(id: string): Promise<void> {
  const snap = await getDoc(doc(db, INSIGHTS, id));
  if (!snap.exists()) return;
  const current = (snap.data().viewCount as number) ?? 0;
  await updateDoc(doc(db, INSIGHTS, id), { viewCount: current + 1 });
}

export async function toggleActionItem(
  insightId: string,
  actionItemId: string,
  completed: boolean
): Promise<void> {
  const insight = await getInsight(insightId);
  if (!insight) return;
  await updateInsight(insightId, {
    actionItems: insight.actionItems.map((a) =>
      a.id === actionItemId ? { ...a, completed } : a
    ),
  });
}

export async function updateActionItemDueDate(
  insightId: string,
  actionItemId: string,
  dueDate: string | undefined
): Promise<void> {
  const insight = await getInsight(insightId);
  if (!insight) return;
  await updateInsight(insightId, {
    actionItems: insight.actionItems.map((a) =>
      a.id === actionItemId ? { ...a, dueDate } : a
    ),
  });
}

// ── Shares ────────────────────────────────────────────────────────────────────

const SHARES = "shares";

export interface SharedInsight {
  token: string;
  title: string;
  summary: string;
  keyPoints: string[];
  actionItems: ActionItem[];
  implementationFramework: string;
  toolsMentioned: string[];
  personalRelevance: string;
  categories: string[];
  tags: string[];
  platform: string;
  confidenceScore: number;
  thumbnail?: string;
  url?: string;
  sharedAt: string;
}

export async function createShare(insight: Insight): Promise<string> {
  const token = crypto.randomUUID().replace(/-/g, "").slice(0, 12);
  const shareData: SharedInsight = {
    token,
    title: insight.title,
    summary: insight.summary,
    keyPoints: insight.keyPoints,
    actionItems: insight.actionItems,
    implementationFramework: insight.implementationFramework,
    toolsMentioned: insight.toolsMentioned ?? [],
    personalRelevance: insight.personalRelevance,
    categories: insight.categories ?? [],
    tags: insight.tags ?? [],
    platform: insight.platform,
    confidenceScore: insight.confidenceScore,
    ...(insight.thumbnail ? { thumbnail: insight.thumbnail } : {}),
    ...(insight.url ? { url: insight.url } : {}),
    sharedAt: new Date().toISOString(),
  };
  await setDoc(doc(db, SHARES, token), JSON.parse(JSON.stringify(shareData)));
  return token;
}

export async function getSharedInsight(token: string): Promise<SharedInsight | null> {
  const snap = await getDoc(doc(db, SHARES, token));
  if (!snap.exists()) return null;
  return snap.data() as SharedInsight;
}

// ── Dashboard ─────────────────────────────────────────────────────────────────

export async function getDashboardStats(userId: string) {
  const insights = await getUserInsights(userId);
  const allActions = insights.flatMap((i) => i.actionItems);
  return {
    totalInsights: insights.length,
    actionItems: allActions.filter((a) => !a.completed).length,
    highValueIdeas: insights.filter((i) => i.confidenceScore >= 0.8).length,
    inProgress: insights.filter((i) => i.status === "processing").length,
  };
}
