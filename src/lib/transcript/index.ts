import { fetchYouTubeTranscript } from "./youtube";
import { transcribeAudioUrl } from "./audio";
import { fetchPodcastTranscript } from "./podcast";
import { cleanTranscript } from "./clean";
import type { TranscriptResult, LinkMetadata } from "./types";

export async function fetchTranscript(meta: LinkMetadata): Promise<TranscriptResult> {
  const warnings: string[] = [];

  // YouTube — use youtube-transcript package (handles auto-captions, most videos)
  if (meta.platform === "youtube" && meta.videoId) {
    const result = await fetchYouTubeTranscript(meta.videoId);
    if (result) {
      return {
        text: result.timedText,
        source: "youtube_public_captions",
        language: result.language,
        hasTimestamps: true,
        confidenceScore: 0.92,
        processingWarnings: [],
      };
    }
    warnings.push("YouTube captions unavailable");
  }

  // Podcast — try extracting audio from RSS feed and running Whisper
  if (meta.platform === "podcast") {
    const text = await fetchPodcastTranscript(meta.url);
    if (text) {
      return {
        text: cleanTranscript(text),
        source: "audio_transcription",
        language: "en",
        hasTimestamps: false,
        confidenceScore: 0.85,
        processingWarnings: ["Transcribed from podcast audio via Whisper"],
      };
    }
    warnings.push("Podcast audio transcript unavailable");
  }

  // Audio fallback — for TikTok, X Spaces, or any direct audio/video URL
  const audioText = await transcribeAudioUrl(meta.url);
  if (audioText) {
    return {
      text: cleanTranscript(audioText),
      source: "audio_transcription",
      language: "en",
      hasTimestamps: false,
      confidenceScore: 0.85,
      processingWarnings: [...warnings, "Transcribed from audio via Whisper"],
    };
  }
  warnings.push("Audio transcription failed");

  return {
    text: "",
    source: "manual_paste",
    language: "en",
    hasTimestamps: false,
    confidenceScore: 0,
    processingWarnings: [
      ...warnings,
      "All automatic methods failed — manual transcript paste required",
    ],
  };
}
