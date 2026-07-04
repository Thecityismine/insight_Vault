export type TranscriptSource =
  | "youtube_official_oauth"
  | "youtube_public_captions"
  | "third_party_transcript"
  | "audio_transcription"
  | "manual_paste";

export type Platform = "youtube" | "tiktok" | "x_spaces" | "podcast" | "other";

export type InsightStatus = "pending" | "processing" | "complete" | "error";

export interface TranscriptData {
  text: string;
  source: TranscriptSource;
  language: string;
  hasTimestamps: boolean;
  confidenceScore: number;
  fetchedAt: string;
  processingWarnings: string[];
}

export interface ActionItem {
  id: string;
  text: string;
  priority: "high" | "medium" | "low";
  completed: boolean;
  createdAt: string;
}

export interface Insight {
  id: string;
  userId: string;
  url: string;
  platform: Platform;
  title: string;
  thumbnail?: string;
  duration?: string;
  summary: string;
  keyPoints: string[];
  actionItems: ActionItem[];
  implementationFramework: string;
  toolsMentioned: string[];
  personalRelevance: string;
  categories: string[];
  tags: string[];
  status: InsightStatus;
  transcript?: TranscriptData;
  confidenceScore: number;
  createdAt: string;
  updatedAt: string;
}

export interface DashboardStats {
  totalInsights: number;
  actionItems: number;
  highValueIdeas: number;
  inProgress: number;
}
