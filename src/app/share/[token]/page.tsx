"use client";
import { use, useEffect, useState } from "react";
import { CheckSquare, Square, Clock, ExternalLink, Terminal, AlertCircle } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { getSharedInsight } from "@/lib/firestore";
import type { SharedInsight } from "@/lib/firestore";
import { getPlatformLabel, formatDate } from "@/lib/utils";

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <Card className="p-5">
      <h2 className="text-[#66717F] text-xs uppercase tracking-widest font-mono mb-3">{title}</h2>
      {children}
    </Card>
  );
}

export default function SharePage({ params }: { params: Promise<{ token: string }> }) {
  const { token } = use(params);
  const [insight, setInsight] = useState<SharedInsight | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    getSharedInsight(token).then(setInsight).finally(() => setLoading(false));
  }, [token]);

  if (loading) {
    return (
      <div className="min-h-screen bg-[#05070A] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#00E676] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!insight) {
    return (
      <div className="min-h-screen bg-[#05070A] flex items-center justify-center px-4">
        <div className="text-center max-w-sm">
          <AlertCircle size={32} className="text-[#EF4444] mx-auto mb-4" />
          <h2 className="text-[#F5F7FA] font-semibold text-lg mb-2">Share not found</h2>
          <p className="text-[#66717F] text-sm">This link may have expired or been removed.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#05070A]">
      {/* Minimal top bar */}
      <header className="h-12 flex items-center justify-between px-6 border-b border-[#1E2A36] bg-[#0B0F14]/80">
        <div className="flex items-center gap-2">
          <div className="w-6 h-6 rounded-md bg-gradient-to-br from-[#00E676] to-[#00BFA5] flex items-center justify-center">
            <Terminal size={12} className="text-[#03100A]" />
          </div>
          <span className="text-[#66717F] text-xs font-mono tracking-widest">INSIGHT TERMINAL</span>
        </div>
        <Link
          href="/"
          className="text-xs text-[#00E676] hover:underline font-mono"
        >
          Build your own →
        </Link>
      </header>

      <main className="max-w-5xl mx-auto px-4 py-8 space-y-5">
        {/* Thumbnail */}
        {insight.thumbnail && (
          <div className="relative w-full h-44 rounded-2xl overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={insight.thumbnail} alt={insight.title} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-[#05070A]/70 via-transparent to-transparent" />
            <div className="absolute inset-0 bg-gradient-to-t from-[#05070A]/60 via-transparent to-transparent" />
          </div>
        )}

        {/* Header */}
        <div>
          <div className="flex items-center gap-2 mb-2 flex-wrap">
            <Badge variant="default">{getPlatformLabel(insight.platform as never)}</Badge>
            <span className="text-[#66717F] text-xs font-mono flex items-center gap-1">
              <Clock size={11} />{formatDate(insight.sharedAt)}
            </span>
            {insight.url && !insight.url.startsWith("manual://") && (
              <a href={insight.url} target="_blank" rel="noopener noreferrer"
                className="text-[#3B82F6] text-xs flex items-center gap-1 hover:underline">
                <ExternalLink size={11} />Source
              </a>
            )}
            <Badge variant="green">{Math.round(insight.confidenceScore * 100)}%</Badge>
          </div>
          <h1 className="text-2xl font-bold text-[#F5F7FA] leading-tight">{insight.title}</h1>
          {insight.categories?.length > 0 && (
            <div className="flex gap-2 mt-2 flex-wrap">
              {insight.categories.map((c) => <Badge key={c} variant="blue">{c}</Badge>)}
            </div>
          )}
        </div>

        {/* Split panels */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
          <div className="space-y-4">
            <Section title="Summary">
              <p className="text-[#A7B0BC] text-sm leading-relaxed">{insight.summary}</p>
            </Section>

            {insight.keyPoints.length > 0 && (
              <Section title="Key Points">
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
              </Section>
            )}

            {insight.actionItems.length > 0 && (
              <Section title="Action Items">
                <div className="space-y-1.5">
                  {insight.actionItems.map((action) => (
                    <div key={action.id} className="flex items-start gap-3 p-2.5 rounded-xl">
                      {action.completed
                        ? <CheckSquare size={16} className="text-[#00E676] flex-shrink-0 mt-0.5" />
                        : <Square size={16} className="text-[#66717F] flex-shrink-0 mt-0.5" />}
                      <span className={`text-sm flex-1 ${action.completed ? "line-through text-[#66717F]" : "text-[#A7B0BC]"}`}>
                        {action.text}
                      </span>
                      <Badge variant={action.priority === "high" ? "red" : action.priority === "medium" ? "gold" : "blue"}>
                        {action.priority}
                      </Badge>
                    </div>
                  ))}
                </div>
              </Section>
            )}
          </div>

          <div className="space-y-4">
            {insight.implementationFramework && (
              <Section title="Implementation Framework">
                <p className="text-[#A7B0BC] text-sm leading-relaxed whitespace-pre-line">
                  {insight.implementationFramework}
                </p>
              </Section>
            )}

            {insight.toolsMentioned?.length > 0 && (
              <Section title="Tools Mentioned">
                <div className="flex flex-wrap gap-2">
                  {insight.toolsMentioned.map((tool) => <Badge key={tool} variant="blue">{tool}</Badge>)}
                </div>
              </Section>
            )}

            {insight.personalRelevance && (
              <Section title="Personal Relevance">
                <p className="text-[#A7B0BC] text-sm leading-relaxed">{insight.personalRelevance}</p>
              </Section>
            )}
          </div>
        </div>

        {/* CTA */}
        <Card className="p-6 mt-4">
          <div className="flex items-center justify-between gap-4 flex-wrap">
            <div>
              <p className="text-[#F5F7FA] font-semibold text-sm">Build your own intelligence library</p>
              <p className="text-[#66717F] text-xs mt-1">
                Insight Terminal extracts key ideas and actions from YouTube, podcasts, X Spaces and more.
              </p>
            </div>
            <Link
              href="/"
              className="px-4 py-2 rounded-xl bg-[#00E676]/10 border border-[#00E676]/20 text-[#00E676] text-sm font-medium hover:bg-[#00E676]/20 transition-colors flex-shrink-0"
            >
              Get started →
            </Link>
          </div>
        </Card>
      </main>
    </div>
  );
}
