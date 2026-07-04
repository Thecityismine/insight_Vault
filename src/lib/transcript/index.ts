import type { TranscriptResult, LinkMetadata } from "./types";

// Step 1: Try YouTube public captions via a proxy/transcript API
async function tryYouTubePublicCaptions(
  videoId: string
): Promise<TranscriptResult | null> {
  try {
    const res = await fetch(`/api/transcript/youtube?videoId=${videoId}`);
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.transcript) return null;
    return {
      text: data.transcript,
      source: "youtube_public_captions",
      language: data.language ?? "en",
      hasTimestamps: data.hasTimestamps ?? false,
      confidenceScore: 0.9,
      processingWarnings: [],
    };
  } catch {
    return null;
  }
}

// Step 2: Try a third-party transcript service
async function tryThirdPartyTranscript(
  url: string
): Promise<TranscriptResult | null> {
  try {
    const res = await fetch(
      `/api/transcript/third-party?url=${encodeURIComponent(url)}`
    );
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.transcript) return null;
    return {
      text: data.transcript,
      source: "third_party_transcript",
      language: data.language ?? "en",
      hasTimestamps: false,
      confidenceScore: 0.75,
      processingWarnings: ["Source: third-party transcript service"],
    };
  } catch {
    return null;
  }
}

// Step 3: Extract audio and transcribe via OpenAI Whisper
async function tryAudioTranscription(
  url: string
): Promise<TranscriptResult | null> {
  try {
    const res = await fetch("/api/transcript/audio", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ url }),
    });
    if (!res.ok) return null;
    const data = await res.json();
    if (!data.transcript) return null;
    return {
      text: data.transcript,
      source: "audio_transcription",
      language: data.language ?? "en",
      hasTimestamps: false,
      confidenceScore: 0.85,
      processingWarnings: ["Transcribed from audio via Whisper"],
    };
  } catch {
    return null;
  }
}

export async function fetchTranscript(
  meta: LinkMetadata
): Promise<TranscriptResult> {
  const warnings: string[] = [];

  // YouTube: try official captions first
  if (meta.platform === "youtube" && meta.videoId) {
    const result = await tryYouTubePublicCaptions(meta.videoId);
    if (result) return result;
    warnings.push("YouTube public captions unavailable");
  }

  // Try third-party transcript
  const thirdParty = await tryThirdPartyTranscript(meta.url);
  if (thirdParty) {
    thirdParty.processingWarnings.push(...warnings);
    return thirdParty;
  }
  warnings.push("Third-party transcript unavailable");

  // Try audio transcription
  const audio = await tryAudioTranscription(meta.url);
  if (audio) {
    audio.processingWarnings.push(...warnings);
    return audio;
  }
  warnings.push("Audio transcription failed");

  // Final fallback: return empty with all warnings so caller can prompt manual paste
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
