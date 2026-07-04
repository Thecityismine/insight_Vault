"use client";
import { useEffect, useState, useMemo } from "react";
import { Newspaper, Star, Zap, TrendingUp, ChevronRight, Loader2 } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useAuth } from "@/lib/auth";
import { getUserInsights } from "@/lib/firestore";
import { getTopicTrends } from "@/lib/intelligence";
import { getPlatformLabel, formatRelativeTime } from "@/lib/utils";
import type { Insight, ActionItem } from "@/types";

interface FlatAction extends ActionItem {
  insightId: string;
  insightTitle: string;
}

function isThisWeek(dateStr: string): boolean {
  const date = new Date(dateStr);
  const now = new Date();
  const weekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
  return date >= weekAgo;
}

export default function DigestPage() {
  const { user } = useAuth();
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    getUserInsights(user.uid).then(setInsights).finally(() => setLoading(false));
  }, [user]);

  const weekInsights = useMemo(
    () => insights.filter((i) => isThisWeek(i.createdAt)),
    [insights]
  );

  const pendingActions = useMemo<FlatAction[]>(() => {
    const flat: FlatAction[] = insights.flatMap((ins) =>
      ins.actionItems
        .filter((a) => !a.completed)
        .map((a) => ({ ...a, insightId: ins.id, insightTitle: ins.title }))
    );
    return flat.sort((a, b) => {
      const priorityOrder = { high: 0, medium: 1, low: 2 };
      return priorityOrder[a.priority] - priorityOrder[b.priority];
    });
  }, [insights]);

  const starredThisWeek = useMemo(
    () => weekInsights.filter((i) => i.starred),
    [weekInsights]
  );

  const trends = useMemo(() => getTopicTrends(insights), [insights]);

  const now = new Date();
  const weekRange = `${new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000).toLocaleDateString("en-US", { month: "short", day: "numeric" })} – ${now.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}`;

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-start justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#F5F7FA] tracking-tight">Weekly Digest</h1>
          <p className="text-[#66717F] text-sm font-mono mt-1">{weekRange}</p>
        </div>
        <div className="w-10 h-10 rounded-2xl bg-[#3B82F6]/10 border border-[#3B82F6]/20 flex items-center justify-center">
          <Newspaper size={18} className="text-[#3B82F6]" />
        </div>
      </div>

      {loading ? (
        <div className="flex items-center gap-3 text-[#66717F] py-12">
          <Loader2 size={16} className="animate-spin" />
          <span className="text-sm">Loading your digest…</span>
        </div>
      ) : (
        <>
          {/* Week summary stats */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: "Added this week", value: weekInsights.length, color: "#00E676" },
              { label: "Pending actions", value: pendingActions.length, color: "#F5C542" },
              { label: "Starred insights", value: starredThisWeek.length, color: "#3B82F6" },
            ].map(({ label, value, color }) => (
              <Card key={label} className="p-4 text-center">
                <p className="text-3xl font-bold font-mono" style={{ color }}>{value}</p>
                <p className="text-[#66717F] text-xs mt-1">{label}</p>
              </Card>
            ))}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
            {/* This week's insights */}
            <Card className="p-5">
              <h2 className="text-[#F5F7FA] font-semibold text-sm mb-4 flex items-center gap-2">
                <Newspaper size={14} className="text-[#00E676]" />
                This Week
              </h2>
              {weekInsights.length === 0 ? (
                <p className="text-[#3D4D5C] text-sm text-center py-6">No insights added this week.</p>
              ) : (
                <div className="space-y-1">
                  {weekInsights.map((ins) => (
                    <Link key={ins.id} href={`/insight/${ins.id}`}>
                      <div className="flex items-center gap-3 p-2.5 rounded-xl hover:bg-[#111821] transition-colors group">
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-[#A7B0BC] group-hover:text-[#F5F7FA] transition-colors line-clamp-1 font-medium">
                            {ins.title}
                          </p>
                          <p className="text-xs text-[#3D4D5C] font-mono mt-0.5">
                            {getPlatformLabel(ins.platform)} · {formatRelativeTime(ins.createdAt)}
                          </p>
                        </div>
                        <div className="flex items-center gap-1.5 flex-shrink-0">
                          {ins.starred && <Star size={11} className="text-[#F5C542]" fill="currentColor" />}
                          <Badge variant="green">{Math.round(ins.confidenceScore * 100)}%</Badge>
                        </div>
                      </div>
                    </Link>
                  ))}
                </div>
              )}
            </Card>

            {/* Pending action items */}
            <Card className="p-5">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-[#F5F7FA] font-semibold text-sm flex items-center gap-2">
                  <Zap size={14} className="text-[#F5C542]" />
                  Pending Actions
                </h2>
                <Link href="/action-board" className="text-[#00E676] text-xs hover:underline flex items-center gap-1">
                  All <ChevronRight size={11} />
                </Link>
              </div>
              {pendingActions.length === 0 ? (
                <p className="text-[#3D4D5C] text-sm text-center py-6">All caught up!</p>
              ) : (
                <div className="space-y-2">
                  {pendingActions.slice(0, 6).map((action) => (
                    <div key={action.id} className="flex items-start gap-2.5">
                      <div
                        className="w-1.5 h-1.5 rounded-full mt-1.5 flex-shrink-0"
                        style={{ background: action.priority === "high" ? "#EF4444" : action.priority === "medium" ? "#F5C542" : "#3B82F6" }}
                      />
                      <div className="min-w-0 flex-1">
                        <p className="text-xs text-[#A7B0BC] leading-relaxed">{action.text}</p>
                        <Link href={`/insight/${action.insightId}`} className="text-[10px] text-[#3D4D5C] hover:text-[#66717F] transition-colors line-clamp-1">
                          {action.insightTitle}
                        </Link>
                      </div>
                    </div>
                  ))}
                  {pendingActions.length > 6 && (
                    <Link href="/action-board" className="block text-center text-xs text-[#66717F] hover:text-[#00E676] transition-colors pt-1">
                      +{pendingActions.length - 6} more
                    </Link>
                  )}
                </div>
              )}
            </Card>
          </div>

          {/* Topic trends */}
          {trends.length > 0 && (
            <Card className="p-5">
              <h2 className="text-[#F5F7FA] font-semibold text-sm mb-4 flex items-center gap-2">
                <TrendingUp size={14} className="text-[#3B82F6]" />
                Your Topic Map
              </h2>
              <div className="flex flex-wrap gap-2">
                {trends.map(({ topic, count }, i) => {
                  const opacity = Math.max(0.4, 1 - i * 0.1);
                  return (
                    <div
                      key={topic}
                      className="flex items-center gap-1.5 px-3 py-1.5 rounded-full border border-[#3B82F6]/20 bg-[#3B82F6]/5"
                      style={{ opacity }}
                    >
                      <span className="text-[#3B82F6] text-xs font-medium">{topic}</span>
                      <span className="text-[#3B82F6]/50 text-[10px] font-mono">{count}</span>
                    </div>
                  );
                })}
              </div>
            </Card>
          )}

          {/* Starred this week */}
          {starredThisWeek.length > 0 && (
            <Card className="p-5">
              <h2 className="text-[#F5F7FA] font-semibold text-sm mb-4 flex items-center gap-2">
                <Star size={14} className="text-[#F5C542]" fill="currentColor" />
                Starred This Week
              </h2>
              <div className="space-y-1">
                {starredThisWeek.map((ins) => (
                  <Link key={ins.id} href={`/insight/${ins.id}`}>
                    <div className="flex items-center justify-between p-3 rounded-xl hover:bg-[#111821] transition-colors group">
                      <p className="text-sm text-[#A7B0BC] group-hover:text-[#F5F7FA] transition-colors line-clamp-1">{ins.title}</p>
                      <ChevronRight size={13} className="text-[#3D4D5C] group-hover:text-[#00E676] transition-colors flex-shrink-0" />
                    </div>
                  </Link>
                ))}
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
