import { NextRequest, NextResponse } from "next/server";

export async function GET(req: NextRequest) {
  // Placeholder — wire up a third-party transcript API here (e.g. AssemblyAI, Deepgram, etc.)
  return NextResponse.json({ transcript: null }, { status: 200 });
}
