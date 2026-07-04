import { NextRequest, NextResponse } from "next/server";
import OpenAI from "openai";
import { getUserInsights } from "@/lib/firestore";

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

export async function POST(req: NextRequest) {
  try {
    const { query, userId } = await req.json();
    if (!query || !userId) {
      return NextResponse.json({ error: "Missing query or userId" }, { status: 400 });
    }

    const insights = await getUserInsights(userId);
    if (insights.length === 0) {
      return NextResponse.json({ answer: "Your library is empty. Process some links first.", sources: [] });
    }

    const q = query.toLowerCase();
    const relevant = insights
      .filter((i) => {
        const text = [
          i.title,
          i.summary,
          ...(i.keyPoints ?? []),
          ...(i.categories ?? []),
          ...(i.tags ?? []),
        ].join(" ").toLowerCase();
        return q.split(/\s+/).some((word) => word.length > 2 && text.includes(word));
      })
      .slice(0, 8);

    const context = relevant.length > 0
      ? relevant.map((ins, i) =>
          `[${i + 1}] "${ins.title}"\nSummary: ${ins.summary}\nKey points: ${ins.keyPoints.slice(0, 3).join("; ")}`
        ).join("\n\n")
      : insights.slice(0, 5).map((ins, i) =>
          `[${i + 1}] "${ins.title}"\nSummary: ${ins.summary}`
        ).join("\n\n");

    const sources = relevant.length > 0 ? relevant : insights.slice(0, 5);

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
      sources: sources.map((s) => ({ id: s.id, title: s.title, platform: s.platform })),
    });
  } catch (err) {
    console.error("Search error:", err);
    return NextResponse.json({ error: "Search failed" }, { status: 500 });
  }
}
