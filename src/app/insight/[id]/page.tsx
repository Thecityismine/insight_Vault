"use client";
import { use, useEffect, useState } from "react";
import { ArrowLeft, ExternalLink, Clock, CheckSquare, Square, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { getInsight, toggleActionItem } from "@/lib/firestore";
import { getPlatformLabel, formatDate } from "@/lib/utils";
import type { Insight } from "@/types";

export default function InsightPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = use(params);
  const [insight, setInsight] = useState<Insight | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getInsight(id)
      .then(setInsight)
      .finally(() => setLoading(false));
  }, [id]);

  async function handleToggleAction(actionId: string, completed: boolean) {
    if (!insight) return;
    await toggleActionItem(insight.id, actionId, completed);
    setInsight((prev) => {
      if (!prev) return prev;
      return {
        ...prev,
        actionItems: prev.actionItems.map((a) =>
          a.id === actionId ? { ...a, completed } : a
        ),
      };
    });
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-[#00E676] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!insight) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card className="p-12 text-center">
          <AlertCircle size={24} className="text-[#EF4444] mx-auto mb-3" />
          <h2 className="text-[#F5F7FA] font-semibold mb-2">Insight not found</h2>
          <Link href="/library">
            <Button variant="secondary" size="sm">Back to Library</Button>
          </Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-start gap-4">
        <Link href="/library">
          <button className="w-9 h-9 rounded-xl border border-[#1E2A36] flex items-center justify-center text-[#A7B0BC] hover:text-[#F5F7FA] hover:border-[#2E4052] transition-all flex-shrink-0 mt-0.5">
            <ArrowLeft size={16} />
          </button>
        </Link>
        <div className="flex-1 min-w-0">
          <h1 className="text-xl font-bold text-[#F5F7FA] leading-tight">
            {insight.title}
          </h1>
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <Badge variant="default">{getPlatformLabel(insight.platform)}</Badge>
            {insight.categories.map((c) => (
              <Badge key={c} variant="muted">{c}</Badge>
            ))}
            <span className="text-[#66717F] text-xs font-mono flex items-center gap-1">
              <Clock size={11} />
              {formatDate(insight.createdAt)}
            </span>
            {insight.url && (
              <a
                href={insight.url}
                target="_blank"
                rel="noopener noreferrer"
                className="text-[#3B82F6] text-xs flex items-center gap-1 hover:underline"
              >
                <ExternalLink size={11} />
                Source
              </a>
            )}
          </div>
        </div>
        <Badge variant="green" className="flex-shrink-0">
          {Math.round(insight.confidenceScore * 100)}% match
        </Badge>
      </div>

      {/* Split panels */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left panel */}
        <div className="space-y-4">
          <Card className="p-5">
            <h2 className="text-[#66717F] text-xs uppercase tracking-widest font-mono mb-3">
              Summary
            </h2>
            <p className="text-[#A7B0BC] text-sm leading-relaxed">{insight.summary}</p>
          </Card>

          <Card className="p-5">
            <h2 className="text-[#66717F] text-xs uppercase tracking-widest font-mono mb-3">
              Key Points
            </h2>
            <ul className="space-y-2">
              {insight.keyPoints.map((point, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-[#A7B0BC]">
                  <span className="w-5 h-5 rounded-full bg-[#00E676]/10 border border-[#00E676]/20 flex items-center justify-center text-[#00E676] text-xs font-mono flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  {point}
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-5">
            <h2 className="text-[#66717F] text-xs uppercase tracking-widest font-mono mb-3">
              Action Items
            </h2>
            <div className="space-y-2">
              {insight.actionItems.map((action) => (
                <button
                  key={action.id}
                  onClick={() => handleToggleAction(action.id, !action.completed)}
                  className="w-full flex items-start gap-3 text-left p-2.5 rounded-xl hover:bg-[#111821] transition-colors group"
                >
                  {action.completed ? (
                    <CheckSquare size={16} className="text-[#00E676] flex-shrink-0 mt-0.5" />
                  ) : (
                    <Square size={16} className="text-[#66717F] group-hover:text-[#A7B0BC] flex-shrink-0 mt-0.5" />
                  )}
                  <span
                    className={`text-sm ${
                      action.completed
                        ? "line-through text-[#66717F]"
                        : "text-[#A7B0BC]"
                    }`}
                  >
                    {action.text}
                  </span>
                  <Badge
                    variant={
                      action.priority === "high"
                        ? "red"
                        : action.priority === "medium"
                        ? "gold"
                        : "blue"
                    }
                    className="ml-auto flex-shrink-0"
                  >
                    {action.priority}
                  </Badge>
                </button>
              ))}
            </div>
          </Card>
        </div>

        {/* Right panel */}
        <div className="space-y-4">
          <Card className="p-5">
            <h2 className="text-[#66717F] text-xs uppercase tracking-widest font-mono mb-3">
              Implementation Framework
            </h2>
            <p className="text-[#A7B0BC] text-sm leading-relaxed whitespace-pre-line">
              {insight.implementationFramework}
            </p>
          </Card>

          {insight.toolsMentioned.length > 0 && (
            <Card className="p-5">
              <h2 className="text-[#66717F] text-xs uppercase tracking-widest font-mono mb-3">
                Tools Mentioned
              </h2>
              <div className="flex flex-wrap gap-2">
                {insight.toolsMentioned.map((tool) => (
                  <Badge key={tool} variant="blue">{tool}</Badge>
                ))}
              </div>
            </Card>
          )}

          <Card className="p-5">
            <h2 className="text-[#66717F] text-xs uppercase tracking-widest font-mono mb-3">
              Personal Relevance
            </h2>
            <p className="text-[#A7B0BC] text-sm leading-relaxed">
              {insight.personalRelevance}
            </p>
          </Card>

          {insight.transcript && (
            <Card className="p-5">
              <h2 className="text-[#66717F] text-xs uppercase tracking-widest font-mono mb-3">
                Transcript
                <span className="ml-2 normal-case tracking-normal">
                  <Badge variant="muted">{insight.transcript.source}</Badge>
                </span>
              </h2>
              <div className="max-h-48 overflow-y-auto">
                <p className="text-[#66717F] text-xs leading-relaxed font-mono">
                  {insight.transcript.text}
                </p>
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
