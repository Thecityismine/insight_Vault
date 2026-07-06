import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { parseLink } from "@/lib/transcript/platform";
import { fetchTranscript } from "@/lib/transcript";
import { fetchYouTubeMetadata } from "@/lib/transcript/youtube";
import { stripTimestamps, cleanTranscript } from "@/lib/transcript/clean";
import type { ActionItem, Platform } from "@/types";

function getOpenAI() {
  return new OpenAI({ apiKey: process.env.OPENAI_API_KEY });
}

const SYSTEM_PROMPT = `You are an expert insight extractor for a personal intelligence dashboard.
Given a transcript, extract structured insights in JSON format.

Return a JSON object with these exact fields:
{
  "title": "Clear, descriptive title for the insight",
  "summary": "2-3 sentence summary of the main content",
  "keyPoints": ["point 1", "point 2", "..."],
  "actionItems": [
    { "text": "specific action", "priority": "high|medium|low" }
  ],
  "implementationFramework": "...",
  "toolsMentioned": ["tool1", "tool2"],
  "personalRelevance": "How these insights apply to building projects or businesses",
  "categories": ["category1", "category2"],
  "tags": ["tag1", "tag2"],
  "confidenceScore": 0.85
}

CRITICAL — implementationFramework rules:
- Write a DETAILED, self-contained guide someone can follow without watching the video
- Minimum 6 numbered steps; use as many as needed to cover everything
- Each step must include: what to do AND how to do it (specific tool names, URLs, settings, commands, config values, or code snippets mentioned in the transcript)
- Break complex steps into sub-steps using letters: "1a. ..., 1b. ..."
- Include prerequisites and setup steps the video assumes the reader already knows
- Explain WHY each step matters, not just what to click
- If the video mentions specific platforms, APIs, accounts, or services — name them and describe how to sign up or access them
- Do NOT use vague language like "configure appropriately" or "set up the tool" — be explicit
- Format: plain text with numbered steps only (e.g. "1. Step title: detailed explanation. 2. ...")
- Aim for the level of detail that would let a motivated beginner complete the full implementation`;

export async function POST(req: NextRequest) {
  try {
    const { url, manualTranscript } = await req.json();

    if (!url && !manualTranscript?.trim()) {
      return NextResponse.json({ error: "URL or transcript is required" }, { status: 400 });
    }

    const isManualOnly = url === "manual://transcript" || !url;
    const meta = isManualOnly
      ? { platform: "other" as const, url: "manual://transcript" }
      : parseLink(url);

    // Fetch transcript + YouTube metadata in parallel
    let transcriptData;
    let thumbnail: string | undefined;
    let videoTitle: string | undefined;

    if (manualTranscript?.trim()) {
      transcriptData = {
        text: manualTranscript,
        source: "manual_paste" as const,
        language: "en",
        hasTimestamps: false,
        confidenceScore: 1.0,
        fetchedAt: new Date().toISOString(),
        processingWarnings: [],
      };
    } else {
      const [result, ytMeta] = await Promise.all([
        fetchTranscript(meta),
        meta.platform === "youtube" && meta.videoId
          ? fetchYouTubeMetadata(meta.videoId)
          : Promise.resolve(null),
      ]);

      if (!result.text || result.source === "manual_paste") {
        return NextResponse.json(
          { needsManualTranscript: true, warnings: result.processingWarnings },
          { status: 422 }
        );
      }

      transcriptData = { ...result, fetchedAt: new Date().toISOString() };

      if (ytMeta) {
        thumbnail = ytMeta.thumbnail || undefined;
        videoTitle = ytMeta.title || undefined;
      }
    }

    // Prepare clean text for AI — strip timestamps and filler words
    const aiText = transcriptData.hasTimestamps
      ? cleanTranscript(stripTimestamps(transcriptData.text))
      : transcriptData.text;

    // Extract insights with AI
    const completion = await getOpenAI().chat.completions.create({
      model: "gpt-4o",
      messages: [
        { role: "system", content: SYSTEM_PROMPT },
        {
          role: "user",
          content: [
            `Platform: ${meta.platform}`,
            `URL: ${url ?? "manual"}`,
            videoTitle ? `Video title: ${videoTitle}` : "",
            `\nTranscript:\n${aiText.slice(0, 40000)}`,
          ]
            .filter(Boolean)
            .join("\n"),
        },
      ],
      response_format: { type: "json_object" },
      max_tokens: 4000,
    });

    const extracted = JSON.parse(completion.choices[0].message.content ?? "{}");

    const actionItems: ActionItem[] = (extracted.actionItems ?? []).map(
      (item: { text: string; priority: string }, i: number) => ({
        id: `action_${Date.now()}_${i}`,
        text: item.text,
        priority: item.priority ?? "medium",
        completed: false,
        createdAt: new Date().toISOString(),
      })
    );

    const insight = {
      url,
      platform: meta.platform as Platform,
      title: videoTitle || extracted.title || "Untitled Insight",
      ...(thumbnail ? { thumbnail } : {}),
      summary: extracted.summary ?? "",
      keyPoints: extracted.keyPoints ?? [],
      actionItems,
      implementationFramework: extracted.implementationFramework ?? "",
      toolsMentioned: extracted.toolsMentioned ?? [],
      personalRelevance: extracted.personalRelevance ?? "",
      categories: extracted.categories ?? [],
      tags: extracted.tags ?? [],
      status: "complete" as const,
      starred: false,
      transcript: transcriptData,
      confidenceScore: extracted.confidenceScore ?? 0.7,
    };

    return NextResponse.json({ insight });
  } catch (err) {
    console.error("Process error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Processing failed" },
      { status: 500 }
    );
  }
}
