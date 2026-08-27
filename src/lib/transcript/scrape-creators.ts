import type { LinkMetadata, TranscriptResult } from "./types";

const API_BASE_URL = "https://api.scrapecreators.com";
const REQUEST_TIMEOUT_MS = 45_000;

type JsonRecord = Record<string, unknown>;

interface YouTubeTranscriptLine {
  text?: string;
  startTimeText?: string;
}

function getApiKey(): string | null {
  return process.env.SCRAPE_CREATORS_API_KEY?.trim() || null;
}

function asRecord(value: unknown): JsonRecord {
  return value && typeof value === "object" ? (value as JsonRecord) : {};
}

function normalizeWebVtt(value: string): string {
  return value
    .replace(/^WEBVTT[^\n]*\n+/i, "")
    .replace(/^\d+\s*$/gm, "")
    .replace(
      /^(\d{2}:)?(\d{2}):(\d{2})[.,]\d{3}\s+-->\s+(?:\d{2}:)?\d{2}:\d{2}[.,]\d{3}.*$/gm,
      (_line, hours: string | undefined, minutes: string, seconds: string) =>
        hours
          ? `[${Number(hours.slice(0, -1))}:${minutes}:${seconds}]`
          : `[${Number(minutes)}:${seconds}]`
    )
    .replace(/\n{3,}/g, "\n\n")
    .trim();
}

function parseYouTube(data: JsonRecord): Pick<TranscriptResult, "text" | "hasTimestamps"> | null {
  const lines = Array.isArray(data.transcript)
    ? (data.transcript as YouTubeTranscriptLine[])
    : [];

  if (lines.length > 0) {
    const text = lines
      .map((line) => {
        const content = typeof line.text === "string" ? line.text.trim() : "";
        if (!content) return "";
        return line.startTimeText ? `[${line.startTimeText}] ${content}` : content;
      })
      .filter(Boolean)
      .join("\n");
    if (text) return { text, hasTimestamps: true };
  }

  const plainText = data.transcript_only_text;
  return typeof plainText === "string" && plainText.trim()
    ? { text: plainText.trim(), hasTimestamps: false }
    : null;
}

function parseTikTok(data: JsonRecord): Pick<TranscriptResult, "text" | "hasTimestamps"> | null {
  const transcript = data.transcript;
  if (typeof transcript !== "string" || !transcript.trim()) return null;
  return {
    text: normalizeWebVtt(transcript),
    hasTimestamps: /-->/.test(transcript),
  };
}

function parseInstagram(data: JsonRecord): Pick<TranscriptResult, "text" | "hasTimestamps"> | null {
  if (!Array.isArray(data.transcripts)) return null;
  const text = data.transcripts
    .map((item) => asRecord(item).text)
    .filter((value): value is string => typeof value === "string" && !!value.trim())
    .map((value) => value.trim())
    .join("\n\n");
  return text ? { text, hasTimestamps: false } : null;
}

function endpointFor(meta: LinkMetadata): URL | null {
  const endpoints = {
    youtube: "/v1/youtube/video/transcript",
    tiktok: "/v1/tiktok/video/transcript",
    instagram: "/v2/instagram/media/transcript",
  } as const;

  if (!(meta.platform in endpoints)) return null;
  const endpoint = endpoints[meta.platform as keyof typeof endpoints];
  const requestUrl = new URL(endpoint, API_BASE_URL);
  requestUrl.searchParams.set("url", meta.url);

  if (meta.platform === "youtube" || meta.platform === "tiktok") {
    requestUrl.searchParams.set("language", "en");
  }
  if (meta.platform === "tiktok") {
    requestUrl.searchParams.set("use_ai_as_fallback", "false");
  }
  if (meta.platform === "youtube" || meta.platform === "instagram") {
    requestUrl.searchParams.set("cache_max_age", "7d");
  }

  return requestUrl;
}

export async function fetchScrapeCreatorsTranscript(
  meta: LinkMetadata
): Promise<TranscriptResult | null> {
  const apiKey = getApiKey();
  const requestUrl = endpointFor(meta);
  if (!apiKey || !requestUrl) return null;

  try {
    const response = await fetch(requestUrl, {
      headers: { "x-api-key": apiKey },
      signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
      cache: "no-store",
    });
    if (!response.ok) {
      console.warn(`Scrape Creators transcript request failed (${response.status})`);
      return null;
    }

    const data = asRecord(await response.json());
    const parsed =
      meta.platform === "youtube"
        ? parseYouTube(data)
        : meta.platform === "tiktok"
          ? parseTikTok(data)
          : parseInstagram(data);

    if (!parsed?.text) return null;

    return {
      ...parsed,
      source: "third_party_transcript",
      language: "en",
      confidenceScore: meta.platform === "instagram" ? 0.85 : 0.9,
      processingWarnings: ["Transcript fetched through Scrape Creators"],
    };
  } catch (error) {
    console.warn(
      "Scrape Creators transcript request failed",
      error instanceof Error ? error.message : error
    );
    return null;
  }
}

export function isScrapeCreatorsConfigured(): boolean {
  return getApiKey() !== null;
}
