import OpenAI from "openai";

function getOpenAI() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

const WHISPER_SIZE_LIMIT = 25 * 1024 * 1024; // 25 MB

export async function transcribeAudioUrl(url: string): Promise<string | null> {
  try {
    const audioRes = await fetch(url, {
      headers: { "User-Agent": "Mozilla/5.0 (compatible; InsightVault/1.0)" },
    });
    if (!audioRes.ok) return null;

    const audioBuffer = await audioRes.arrayBuffer();
    if (audioBuffer.byteLength > WHISPER_SIZE_LIMIT) return null;

    const contentType = audioRes.headers.get("content-type") ?? "audio/mp4";
    const ext = contentType.includes("mpeg") ? "mp3" : contentType.includes("ogg") ? "ogg" : "mp4";
    const audioFile = new File([audioBuffer], `audio.${ext}`, { type: contentType });

    const transcription = await getOpenAI().audio.transcriptions.create({
      file: audioFile,
      model: "whisper-1",
      language: "en",
    });

    return transcription.text || null;
  } catch {
    return null;
  }
}
