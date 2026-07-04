import type { Insight } from "@/types";

export interface RelatedInsight {
  insight: Insight;
  score: number;
  reasons: string[];
}

export function getRelatedInsights(
  current: Insight,
  all: Insight[],
  limit = 3
): RelatedInsight[] {
  const others = all.filter((i) => i.id !== current.id);
  const currentCats = new Set(current.categories?.map((c) => c.toLowerCase()) ?? []);
  const currentTags = new Set(current.tags?.map((t) => t.toLowerCase()) ?? []);

  const scored = others.map((insight) => {
    const reasons: string[] = [];
    let score = 0;

    const catOverlap = (insight.categories ?? []).filter((c) =>
      currentCats.has(c.toLowerCase())
    );
    if (catOverlap.length > 0) {
      score += catOverlap.length * 3;
      reasons.push(`Same categor${catOverlap.length > 1 ? "ies" : "y"}: ${catOverlap.join(", ")}`);
    }

    const tagOverlap = (insight.tags ?? []).filter((t) =>
      currentTags.has(t.toLowerCase())
    );
    if (tagOverlap.length > 0) {
      score += tagOverlap.length * 2;
      reasons.push(`Shared tags: ${tagOverlap.slice(0, 3).join(", ")}`);
    }

    if (insight.platform === current.platform) {
      score += 1;
    }

    return { insight, score, reasons };
  });

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit);
}

export function getTopicTrends(insights: Insight[]): Array<{ topic: string; count: number }> {
  const freq = new Map<string, number>();
  for (const insight of insights) {
    for (const cat of insight.categories ?? []) {
      freq.set(cat, (freq.get(cat) ?? 0) + 1);
    }
    for (const tag of insight.tags ?? []) {
      freq.set(tag, (freq.get(tag) ?? 0) + 1);
    }
  }
  return [...freq.entries()]
    .map(([topic, count]) => ({ topic, count }))
    .sort((a, b) => b.count - a.count)
    .slice(0, 8);
}

export function getKnowledgeGaps(insights: Insight[]): string[] {
  const coveredTopics = new Set<string>();
  const mentionedTopics = new Map<string, number>();

  for (const insight of insights) {
    for (const cat of insight.categories ?? []) {
      coveredTopics.add(cat.toLowerCase());
    }
    for (const tag of insight.tags ?? []) {
      coveredTopics.add(tag.toLowerCase());
    }
    for (const point of insight.keyPoints ?? []) {
      const words = point.toLowerCase().match(/\b[a-z]{4,}\b/g) ?? [];
      for (const word of words) {
        if (!STOP_WORDS.has(word)) {
          mentionedTopics.set(word, (mentionedTopics.get(word) ?? 0) + 1);
        }
      }
    }
  }

  return [...mentionedTopics.entries()]
    .filter(([word, count]) => count >= 2 && !coveredTopics.has(word))
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([word]) => word);
}

const STOP_WORDS = new Set([
  "that", "this", "with", "from", "they", "have", "more", "will", "your",
  "when", "what", "which", "their", "than", "then", "been", "also", "into",
  "through", "about", "make", "like", "time", "just", "know", "take", "people",
  "year", "good", "some", "could", "them", "other", "many", "well", "need",
  "look", "work", "data", "each", "most", "over", "such", "used", "using",
  "these", "those", "very", "even", "back", "only", "come", "here", "both",
]);
