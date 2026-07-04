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
  orderBy,
  limit,
  Timestamp,
} from "firebase/firestore";
import { db } from "./firebase";
import type { Insight, ActionItem } from "@/types";

const INSIGHTS_COLLECTION = "insights";

export async function createInsight(
  data: Omit<Insight, "id" | "createdAt" | "updatedAt">
): Promise<string> {
  const now = new Date().toISOString();
  const ref = await addDoc(collection(db, INSIGHTS_COLLECTION), {
    ...data,
    createdAt: now,
    updatedAt: now,
  });
  return ref.id;
}

export async function getInsight(id: string): Promise<Insight | null> {
  const ref = doc(db, INSIGHTS_COLLECTION, id);
  const snap = await getDoc(ref);
  if (!snap.exists()) return null;
  return { id: snap.id, ...snap.data() } as Insight;
}

export async function getUserInsights(userId: string): Promise<Insight[]> {
  const q = query(
    collection(db, INSIGHTS_COLLECTION),
    where("userId", "==", userId),
    orderBy("createdAt", "desc")
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Insight));
}

export async function getRecentInsights(
  userId: string,
  count = 5
): Promise<Insight[]> {
  const q = query(
    collection(db, INSIGHTS_COLLECTION),
    where("userId", "==", userId),
    orderBy("createdAt", "desc"),
    limit(count)
  );
  const snap = await getDocs(q);
  return snap.docs.map((d) => ({ id: d.id, ...d.data() } as Insight));
}

export async function updateInsight(
  id: string,
  data: Partial<Insight>
): Promise<void> {
  const ref = doc(db, INSIGHTS_COLLECTION, id);
  await updateDoc(ref, { ...data, updatedAt: new Date().toISOString() });
}

export async function deleteInsight(id: string): Promise<void> {
  await deleteDoc(doc(db, INSIGHTS_COLLECTION, id));
}

export async function toggleActionItem(
  insightId: string,
  actionItemId: string,
  completed: boolean
): Promise<void> {
  const insight = await getInsight(insightId);
  if (!insight) return;
  const actionItems = insight.actionItems.map((item) =>
    item.id === actionItemId ? { ...item, completed } : item
  );
  await updateInsight(insightId, { actionItems });
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
