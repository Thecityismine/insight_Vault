import { YoutubeTranscript } from "youtube-transcript";

function formatTimestamp(offsetMs: number): string {
  const s = Math.floor(offsetMs / 1000);
  const m = Math.floor(s / 60);
  const h = Math.floor(m / 60);
  if (h > 0) {
    return `[${h}:${String(m % 60).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}]`;
  }
  return `[${m}:${String(s % 60).padStart(2, "0")}]`;
}

export interface YouTubeTranscriptResult {
  timedText: string;
  plainText: string;
  language: string;
}

export async function fetchYouTubeTranscript(
  videoId: string
): Promise<YouTubeTranscriptResult | null> {
  try {
    const lines = await YoutubeTranscript.fetchTranscript(videoId, { lang: "en" });
    if (!lines?.length) return null;

    const timedText = lines
      .map((l) => {
        const offset = (l as { offset?: number; start?: number }).offset
          ?? (l as { offset?: number; start?: number }).start
          ?? 0;
        return `${formatTimestamp(offset)} ${l.text.trim()}`;
      })
      .join("\n");

    const plainText = lines.map((l) => l.text.trim()).join(" ");

    return { timedText, plainText, language: "en" };
  } catch {
    return null;
  }
}

export async function fetchYouTubeMetadata(
  videoId: string
): Promise<{ title: string; thumbnail: string } | null> {
  try {
    const oembedUrl = `https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v=${videoId}&format=json`;
    const res = await fetch(oembedUrl);
    if (!res.ok) return null;
    const data = await res.json();
    return {
      title: data.title ?? "",
      thumbnail: data.thumbnail_url ?? "",
    };
  } catch {
    return null;
  }
}
