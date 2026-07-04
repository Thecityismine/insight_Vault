import type { LinkMetadata } from "./types";
import type { Platform } from "@/types";

export function detectPlatform(url: string): Platform {
  if (/youtube\.com|youtu\.be/.test(url)) return "youtube";
  if (/tiktok\.com/.test(url)) return "tiktok";
  if (/twitter\.com|x\.com/.test(url)) return "x_spaces";
  if (/spotify\.com|anchor\.fm|buzzsprout|soundcloud/.test(url)) return "podcast";
  return "other";
}

export function extractYouTubeId(url: string): string | null {
  const patterns = [
    /[?&]v=([^&#]+)/,
    /youtu\.be\/([^?&#]+)/,
    /embed\/([^?&#]+)/,
    /shorts\/([^?&#]+)/,
  ];
  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export function parseLink(url: string): LinkMetadata {
  const platform = detectPlatform(url);
  const videoId = platform === "youtube" ? extractYouTubeId(url) ?? undefined : undefined;
  return { platform, videoId, url };
}
