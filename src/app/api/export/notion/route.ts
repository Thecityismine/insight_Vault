import { NextRequest, NextResponse } from "next/server";
import { Client } from "@notionhq/client";
import { verifyAuth } from "@/lib/server/verify-auth";

export async function POST(req: NextRequest) {
  try {
    const uid = await verifyAuth(req);
    if (!uid) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const { notionToken, parentPageId, insight } = await req.json();

    if (!notionToken) {
      return NextResponse.json({ error: "Notion integration token required" }, { status: 400 });
    }
    if (!parentPageId) {
      return NextResponse.json({ error: "Notion parent page ID required" }, { status: 400 });
    }
    if (!insight) {
      return NextResponse.json({ error: "Insight data required" }, { status: 400 });
    }

    const notion = new Client({ auth: notionToken });

    const actionRows = (insight.actionItems ?? []).map((a: { text: string; priority: string; completed: boolean }) => ({
      object: "block" as const,
      type: "to_do" as const,
      to_do: {
        rich_text: [{ type: "text" as const, text: { content: `[${a.priority}] ${a.text}` } }],
        checked: a.completed,
      },
    }));

    const keyPointBlocks = (insight.keyPoints ?? []).map((p: string) => ({
      object: "block" as const,
      type: "numbered_list_item" as const,
      numbered_list_item: {
        rich_text: [{ type: "text" as const, text: { content: p } }],
      },
    }));

    const blocks = [
      // Summary
      { object: "block" as const, type: "heading_2" as const, heading_2: { rich_text: [{ type: "text" as const, text: { content: "Summary" } }] } },
      { object: "block" as const, type: "paragraph" as const, paragraph: { rich_text: [{ type: "text" as const, text: { content: insight.summary ?? "" } }] } },

      // Key Points
      ...(keyPointBlocks.length ? [
        { object: "block" as const, type: "heading_2" as const, heading_2: { rich_text: [{ type: "text" as const, text: { content: "Key Points" } }] } },
        ...keyPointBlocks,
      ] : []),

      // Action Items
      ...(actionRows.length ? [
        { object: "block" as const, type: "heading_2" as const, heading_2: { rich_text: [{ type: "text" as const, text: { content: "Action Items" } }] } },
        ...actionRows,
      ] : []),

      // Implementation Framework
      ...(insight.implementationFramework ? [
        { object: "block" as const, type: "heading_2" as const, heading_2: { rich_text: [{ type: "text" as const, text: { content: "Implementation Framework" } }] } },
        { object: "block" as const, type: "paragraph" as const, paragraph: { rich_text: [{ type: "text" as const, text: { content: insight.implementationFramework } }] } },
      ] : []),

      // Personal Relevance
      ...(insight.personalRelevance ? [
        { object: "block" as const, type: "heading_2" as const, heading_2: { rich_text: [{ type: "text" as const, text: { content: "Personal Relevance" } }] } },
        { object: "block" as const, type: "paragraph" as const, paragraph: { rich_text: [{ type: "text" as const, text: { content: insight.personalRelevance } }] } },
      ] : []),

      // Source
      ...(insight.url && !insight.url.startsWith("manual://") ? [
        { object: "block" as const, type: "paragraph" as const, paragraph: { rich_text: [{ type: "text" as const, text: { content: `Source: ${insight.url}`, link: { url: insight.url } } }] } },
      ] : []),
    ];

    const page = await notion.pages.create({
      parent: { page_id: parentPageId },
      properties: {
        title: {
          title: [{ type: "text", text: { content: insight.title ?? "Untitled Insight" } }],
        },
      },
      children: blocks as Parameters<typeof notion.pages.create>[0]["children"],
    });

    return NextResponse.json({ pageId: page.id, url: (page as { url?: string }).url });
  } catch (err) {
    console.error("Notion export error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Notion export failed" },
      { status: 500 }
    );
  }
}
