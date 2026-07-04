import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

interface InsightSnippet {
  id: string;
  title: string;
  platform: string;
  summary: string;
  keyPoints: string[];
}

export async function POST(req: NextRequest) {
  try {
    const { query, snippets } = await req.json() as { query: string; snippets: InsightSnippet[] };

    if (!query?.trim()) {
      return NextResponse.json({ error: "Missing query" }, { status: 400 });
    }
    if (!snippets?.length) {
      return NextResponse.json({ answer: "Your library is empty. Process some links first.", sources: [] });
    }

    const context = snippets
      .map((ins, i) =>
        `[${i + 1}] "${ins.title}"\nSummary: ${ins.summary}\nKey points: ${ins.keyPoints.slice(0, 3).join("; ")}`
      )
      .join("\n\n");

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      temperature: 0.3,
      max_tokens: 400,
      messages: [
        {
          role: "system",
          content: `You are a personal knowledge assistant. Answer the user's question using ONLY the insights from their library below. Be concise (3-5 sentences). If the library doesn't contain relevant info, say so honestly. Reference specific insights by their number.`,
        },
        {
          role: "user",
          content: `My question: "${query}"\n\nMy library:\n\n${context}`,
        },
      ],
    });

    const answer = completion.choices[0]?.message?.content ?? "No answer generated.";
    return NextResponse.json({
      answer,
      sources: snippets.map((s) => ({ id: s.id, title: s.title, platform: s.platform })),
    });
  } catch (err) {
    console.error("Search error:", err);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
