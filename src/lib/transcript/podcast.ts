import { transcribeAudioUrl } from "./audio";

function extractAudioUrl(xml: string): string | null {
  // <enclosure url="..." type="audio/..."> (attribute order varies)
  const patterns = [
    /<enclosure[^>]+url="([^"]+)"[^>]+type="audio[^"]*"/i,
    /<enclosure[^>]+type="audio[^"]*"[^>]+url="([^"]+)"/i,
    /<media:content[^>]+url="([^"]+)"[^>]+type="audio[^"]*"/i,
    /<media:content[^>]+type="audio[^"]*"[^>]+url="([^"]+)"/i,
  ];
  for (const pattern of patterns) {
    const match = xml.match(pattern);
    if (match) return match[1];
  }
  return null;
}

export async function fetchPodcastTranscript(url: string): Promise<string | null> {
  try {
    const res = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; InsightVault/1.0)" },
    });
    if (!res.ok) return null;
    const text = await res.text();

    if (!text.includes("<rss") && !text.includes("<feed") && !text.includes("<enclosure")) {
      return null;
    }

    const audioUrl = extractAudioUrl(text);
    if (!audioUrl) return null;

    return transcribeAudioUrl(audioUrl);
  } catch {
    return null;
  }
}
