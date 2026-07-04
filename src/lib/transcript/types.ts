import type { TranscriptSource, Platform } from "@/types";

export interface TranscriptResult {
  text: string;
  source: TranscriptSource;
  language: string;
  hasTimestamps: boolean;
  confidenceScore: number;
  processingWarnings: string[];
}

export interface LinkMetadata {
  platform: Platform;
  videoId?: string;
  url: string;
  title?: string;
  thumbnail?: string;
  duration?: string;
}
