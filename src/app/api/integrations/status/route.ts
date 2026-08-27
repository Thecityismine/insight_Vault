import { NextRequest, NextResponse } from "next/server";
import { verifyAuth } from "@/lib/server/verify-auth";
import { isScrapeCreatorsConfigured } from "@/lib/transcript/scrape-creators";

export async function GET(req: NextRequest) {
  const uid = await verifyAuth(req);
  if (!uid) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  return NextResponse.json({
    scrapeCreators: isScrapeCreatorsConfigured(),
    openAI: Boolean(process.env.OPENAI_API_KEY?.trim()),
  });
}
