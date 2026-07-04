import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { url } = await req.json();
    if (!url) {
      return NextResponse.json({ error: "url required" }, { status: 400 });
    }

    // Fetch audio stream
    const audioRes = await fetch(url);
    if (!audioRes.ok) {
      return NextResponse.json({ transcript: null }, { status: 200 });
    }

    const audioBuffer = await audioRes.arrayBuffer();
    const audioFile = new File([audioBuffer], "audio.mp4", { type: "audio/mp4" });

    const transcription = await openai.audio.transcriptions.create({
      file: audioFile,
      model: "whisper-1",
      language: "en",
    });

    return NextResponse.json({
      transcript: transcription.text,
      language: "en",
    });
  } catch (err) {
    return NextResponse.json({ transcript: null }, { status: 200 });
  }
}
