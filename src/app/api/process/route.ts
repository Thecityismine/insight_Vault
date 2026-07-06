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
  "title": "Clear, specific title that captures the core concept (not generic)",
  "summary": "3-4 sentence summary covering the main concept, the approach taken, and the key outcome or opportunity",
  "keyPoints": ["point 1", "point 2", "..."],
  "actionItems": [
    { "text": "specific action", "priority": "high|medium|low" }
  ],
  "implementationFramework": "...",
  "toolsMentioned": ["tool1", "tool2"],
  "personalRelevance": "...",
  "categories": ["category1", "category2"],
  "tags": ["tag1", "tag2"],
  "confidenceScore": 0.85
}

FIELD RULES:

keyPoints:
- Extract 7-10 key points minimum
- Each point must be a specific, standalone insight — not a vague restatement of the title
- Include concrete facts, numbers, comparisons, techniques, or quotes from the transcript
- Bad example: "Claude supports trading" — Good example: "Claude can connect to Liquid Trade to execute real stock, crypto, and forex trades automatically without manual input"

actionItems:
- Extract 5-8 action items minimum
- Each item must be immediately actionable — include the specific first step to take
- Bad example: "Set up Claude for trading" — Good example: "Go to liquidtrade.io, create a free account, then open Claude desktop and ask it to connect to Liquid Trade via the integrations panel"
- Assign priority: high = core to the implementation, medium = enhances it, low = optional optimization

implementationFramework:
- Write a DETAILED, self-contained guide a motivated beginner can follow without watching the video
- Start with a "Prerequisites:" line listing accounts, software, or knowledge needed before step 1
- Minimum 8 numbered steps; use as many as the content requires
- Each step must be at least 2-3 sentences: what to do, exactly how to do it, and why it matters
- Break complex steps into sub-steps: "1a. ..., 1b. ..."
- Name specific platforms, APIs, settings, commands, or UI elements mentioned in the transcript
- Never use vague language like "configure appropriately", "set up the tool", or "follow the instructions"
- If a step involves signing up for a service, name the service and describe what tier/plan is needed
- Format: plain numbered steps only (e.g. "Prerequisites: ... 1. Step: explanation. 2. Step: explanation.")

personalRelevance:
- Write 3-5 sentences specific to someone who wants to apply this practically
- Identify the single highest-leverage takeaway they should act on first
- Mention which parts are immediately usable vs. require more setup
- Be direct and prescriptive, not generic ("this is useful for entrepreneurs")

confidenceScore:
- Score how well the transcript supports a complete, verifiable implementation
- Factual technical tutorials with specific steps: 0.85-0.95
- Strategy or opinion content without concrete steps: 0.55-0.75
- Mixed content: 0.70-0.85
- Never assign 0.95+ unless the transcript contains explicit, verified technical instructions

toolsMentioned:
- Only include tools/platforms actually named and used in the transcript
- Do not infer or add tools not mentioned

categories:
- 2-4 specific categories (e.g. "AI Trading Automation" not just "Trading")

tags:
- 5-8 specific tags covering tools, techniques, and use cases mentioned`;

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
