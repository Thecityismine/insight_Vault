import type { Insight } from "@/types";
import { getPlatformLabel } from "./utils";

function fmtDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });
}

function slug(title: string) {
  return title
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-|-$/g, "")
    .slice(0, 50);
}

// ── Markdown ──────────────────────────────────────────────────────────────────

export function toMarkdown(insight: Insight): string {
  const lines: string[] = [
    `# ${insight.title}`,
    "",
    `**Platform:** ${getPlatformLabel(insight.platform)}  `,
    `**Processed:** ${fmtDate(insight.createdAt)}  `,
    `**Confidence:** ${Math.round(insight.confidenceScore * 100)}%`,
    "",
    "## Summary",
    "",
    insight.summary,
    "",
  ];

  if (insight.keyPoints.length) {
    lines.push("## Key Points", "");
    insight.keyPoints.forEach((p, i) => lines.push(`${i + 1}. ${p}`));
    lines.push("");
  }

  if (insight.actionItems.length) {
    lines.push("## Action Items", "");
    insight.actionItems.forEach((a) =>
      lines.push(`- [${a.completed ? "x" : " "}] **[${a.priority}]** ${a.text}`)
    );
    lines.push("");
  }

  if (insight.implementationFramework) {
    lines.push("## Implementation Framework", "", insight.implementationFramework, "");
  }

  if (insight.toolsMentioned?.length) {
    lines.push("## Tools Mentioned", "", insight.toolsMentioned.join(", "), "");
  }

  if (insight.personalRelevance) {
    lines.push("## Personal Relevance", "", insight.personalRelevance, "");
  }

  const meta: string[] = [];
  if (insight.categories?.length) meta.push(`**Categories:** ${insight.categories.join(", ")}`);
  if (insight.tags?.length) meta.push(`**Tags:** ${insight.tags.join(", ")}`);
  if (insight.url && !insight.url.startsWith("manual://"))
    meta.push(`**Source:** ${insight.url}`);
  if (meta.length) lines.push(...meta, "");

  lines.push("---", "*Exported from Insight Terminal*");
  return lines.join("\n");
}

// ── Plain text ────────────────────────────────────────────────────────────────

export function toPlainText(insight: Insight): string {
  const divider = "─".repeat(60);
  const lines: string[] = [
    insight.title,
    divider,
    `${getPlatformLabel(insight.platform)}  ·  ${fmtDate(insight.createdAt)}  ·  ${Math.round(insight.confidenceScore * 100)}% confidence`,
    "",
    "SUMMARY",
    insight.summary,
    "",
  ];

  if (insight.keyPoints.length) {
    lines.push("KEY POINTS", "");
    insight.keyPoints.forEach((p, i) => lines.push(`  ${i + 1}. ${p}`));
    lines.push("");
  }

  if (insight.actionItems.length) {
    lines.push("ACTION ITEMS", "");
    insight.actionItems.forEach((a) =>
      lines.push(`  ${a.completed ? "✓" : "○"} [${a.priority.toUpperCase()}]  ${a.text}`)
    );
    lines.push("");
  }

  if (insight.implementationFramework) {
    lines.push("IMPLEMENTATION FRAMEWORK", "", insight.implementationFramework, "");
  }

  if (insight.toolsMentioned?.length) {
    lines.push(`TOOLS:  ${insight.toolsMentioned.join(", ")}`, "");
  }

  lines.push(divider, "Exported from Insight Terminal");
  return lines.join("\n");
}

// ── Print / PDF ───────────────────────────────────────────────────────────────

export function printInsight(insight: Insight) {
  const actionRows = insight.actionItems
    .map(
      (a) => `
      <tr>
        <td style="padding:4px 8px;color:${a.completed ? "#999" : "#111"};text-decoration:${a.completed ? "line-through" : "none"}">
          ${a.completed ? "✓" : "○"} ${a.text}
        </td>
        <td style="padding:4px 8px;color:#666;font-size:11px;white-space:nowrap">${a.priority}</td>
      </tr>`
    )
    .join("");

  const keyPointsHtml = insight.keyPoints
    .map((p, i) => `<li style="margin:4px 0;color:#222">${p}</li>`)
    .join("");

  const html = `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <title>${insight.title} — Insight Terminal</title>
  <style>
    * { box-sizing: border-box; margin: 0; padding: 0; }
    body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif; font-size: 13px; color: #111; padding: 40px; max-width: 800px; margin: 0 auto; }
    h1 { font-size: 22px; font-weight: 700; color: #000; margin-bottom: 8px; }
    .meta { color: #666; font-size: 12px; margin-bottom: 24px; }
    .section { margin-bottom: 24px; }
    .section-title { font-size: 11px; font-weight: 700; letter-spacing: 0.08em; text-transform: uppercase; color: #666; margin-bottom: 8px; border-bottom: 1px solid #eee; padding-bottom: 4px; }
    p { color: #222; line-height: 1.6; }
    ol { padding-left: 20px; }
    li { color: #222; line-height: 1.6; margin: 3px 0; }
    table { width: 100%; border-collapse: collapse; }
    .badge { display: inline-block; padding: 2px 8px; border: 1px solid #ddd; border-radius: 12px; font-size: 11px; color: #555; margin: 2px; }
    .footer { margin-top: 32px; padding-top: 16px; border-top: 1px solid #eee; font-size: 11px; color: #999; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
  <h1>${insight.title}</h1>
  <p class="meta">${getPlatformLabel(insight.platform)} &nbsp;·&nbsp; ${fmtDate(insight.createdAt)} &nbsp;·&nbsp; ${Math.round(insight.confidenceScore * 100)}% confidence</p>

  <div class="section">
    <div class="section-title">Summary</div>
    <p>${insight.summary}</p>
  </div>

  ${insight.keyPoints.length ? `<div class="section"><div class="section-title">Key Points</div><ol>${keyPointsHtml}</ol></div>` : ""}

  ${insight.actionItems.length ? `<div class="section"><div class="section-title">Action Items</div><table>${actionRows}</table></div>` : ""}

  ${insight.implementationFramework ? `<div class="section"><div class="section-title">Implementation Framework</div><p>${insight.implementationFramework.replace(/\n/g, "<br>")}</p></div>` : ""}

  ${insight.toolsMentioned?.length ? `<div class="section"><div class="section-title">Tools Mentioned</div><p>${insight.toolsMentioned.map((t) => `<span class="badge">${t}</span>`).join(" ")}</p></div>` : ""}

  ${insight.personalRelevance ? `<div class="section"><div class="section-title">Personal Relevance</div><p>${insight.personalRelevance}</p></div>` : ""}

  <div class="footer">
    ${insight.categories?.length ? `Categories: ${insight.categories.join(", ")}<br>` : ""}
    ${insight.tags?.length ? `Tags: ${insight.tags.join(", ")}<br>` : ""}
    Exported from Insight Terminal
  </div>
</body>
</html>`;

  const w = window.open("", "_blank", "width=900,height=700");
  if (!w) return;
  w.document.write(html);
  w.document.close();
  w.focus();
  setTimeout(() => w.print(), 300);
}

// ── File downloads ────────────────────────────────────────────────────────────

function downloadFile(filename: string, content: string, mime = "text/plain") {
  const blob = new Blob([content], { type: mime });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  URL.revokeObjectURL(url);
}

export function downloadMarkdown(insight: Insight) {
  downloadFile(`${slug(insight.title)}.md`, toMarkdown(insight), "text/markdown");
}

export function downloadLibraryJSON(insights: Insight[]) {
  const data = insights.map(({ transcript: _t, ...rest }) => rest);
  const date = new Date().toISOString().split("T")[0];
  downloadFile(
    `insight-vault-${date}.json`,
    JSON.stringify(data, null, 2),
    "application/json"
  );
}
