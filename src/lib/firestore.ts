import {
  collection,
  doc,
  addDoc,
  getDoc,
  getDocs,
  updateDoc,
  deleteDoc,
  query,
  where,
} from "firebase/firestore";
import { db } from "./firebase";
import type { Insight, ActionItem } from "@/types";

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
  const ref = await addDoc(collection(db, INSIGHTS), {
    ...data,
    createdAt: now,
    updatedAt: now,
  });
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
  await updateDoc(doc(db, INSIGHTS, id), {
    ...data,
    updatedAt: new Date().toISOString(),
  });
}

export async function deleteInsight(id: string): Promise<void> {
  await deleteDoc(doc(db, INSIGHTS, id));
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
