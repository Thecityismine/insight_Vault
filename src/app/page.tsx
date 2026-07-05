"use client";
import { useEffect, useState } from "react";
import Link from "next/link";
import { BookOpen, Zap, TrendingUp, Clock, Plus, ArrowRight, Search, Lightbulb } from "lucide-react";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useAuth } from "@/lib/auth";
import { getUserInsights } from "@/lib/firestore";
import { getTopicTrends, getKnowledgeGaps } from "@/lib/intelligence";
import { getPlatformLabel, formatRelativeTime } from "@/lib/utils";
import type { Insight } from "@/types";

interface Stats { totalInsights: number; actionItems: number; highValueIdeas: number; inProgress: number; }
interface TopicTrend { topic: string; count: number; }

function StatsSkeleton() {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
      {[...Array(4)].map((_, i) => (
        <div key={i} className="bg-[#111821] border border-[#1E2A36] rounded-2xl p-5 animate-pulse">
          <div className="h-3 bg-[#1E2A36] rounded w-24 mb-3" />
          <div className="h-8 bg-[#1E2A36] rounded w-12" />
        </div>
      ))}
    </div>
  );
}

export default function DashboardPage() {
  const { user } = useAuth();
  const [stats, setStats] = useState<Stats | null>(null);
  const [recent, setRecent] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [trends, setTrends] = useState<TopicTrend[]>([]);
  const [gaps, setGaps] = useState<string[]>([]);

  useEffect(() => {
    if (!user) return;
    getUserInsights(user.uid).then((all) => {
      const allActions = all.flatMap((i) => i.actionItems);
      setStats({
        totalInsights: all.length,
        actionItems: allActions.filter((a) => !a.completed).length,
        highValueIdeas: all.filter((i) => i.confidenceScore >= 0.8).length,
        inProgress: all.filter((i) => i.status === "processing").length,
      });
      setRecent(all.slice(0, 5));
      setTrends(getTopicTrends(all));
      setGaps(getKnowledgeGaps(all));
    }).finally(() => setLoading(false));
  }, [user]);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#F5F7FA] tracking-tight">Command Center</h1>
          <p className="text-[#66717F] text-sm font-mono mt-0.5">INSIGHT TERMINAL — v1.0</p>
        </div>
        <Link href="/add-link" className="hidden sm:block"><Button><Plus size={16} />Process New Link</Button></Link>
      </div>

      {loading ? (
        <StatsSkeleton />
      ) : (
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          <MetricCard label="Total Insights" value={stats?.totalInsights ?? 0} icon={BookOpen} accent="green" trend="Your knowledge base" />
          <MetricCard label="Action Items" value={stats?.actionItems ?? 0} icon={Zap} accent="gold" trend="Pending tasks" />
          <MetricCard label="High Value Ideas" value={stats?.highValueIdeas ?? 0} icon={TrendingUp} accent="blue" trend="Score ≥ 80%" />
          <MetricCard label="In Progress" value={stats?.inProgress ?? 0} icon={Clock} accent="red" trend="Processing now" />
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <Card className="lg:col-span-2 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[#F5F7FA] font-semibold text-sm">Recent Insights</h2>
            <Link href="/library" className="text-[#00E676] text-xs hover:underline flex items-center gap-1">
              View all <ArrowRight size={11} />
            </Link>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[...Array(3)].map((_, i) => (
                <div key={i} className="h-12 bg-[#111821] rounded-xl animate-pulse" />
              ))}
            </div>
          ) : recent.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-12 h-12 rounded-2xl bg-[#00E676]/10 border border-[#00E676]/20 flex items-center justify-center mb-3">
                <BookOpen size={20} className="text-[#00E676]" />
              </div>
              <p className="text-[#F5F7FA] text-sm font-semibold mb-1">No insights yet</p>
              <p className="text-[#66717F] text-xs mb-4">Paste a YouTube, TikTok, X Space, or podcast link to start</p>
              <Link href="/add-link"><Button size="sm">Process your first link</Button></Link>
            </div>
          ) : (
            <div className="space-y-1">
              {recent.map((item) => (
                <Link key={item.id} href={`/insight/${item.id}`}>
                  <div className="flex items-center justify-between p-3 rounded-xl hover:bg-[#111821] transition-colors border border-transparent hover:border-[#1E2A36]">
                    <div className="min-w-0 flex-1">
                      <p className="text-[#F5F7FA] text-sm font-medium line-clamp-1">{item.title}</p>
                      <p className="text-[#66717F] text-xs font-mono mt-0.5">
                        {getPlatformLabel(item.platform)} · {formatRelativeTime(item.createdAt)}
                      </p>
                    </div>
                    <Badge variant="green">{Math.round(item.confidenceScore * 100)}%</Badge>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Card>

        <div className="space-y-4">
          <Card className="p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[#F5F7FA] font-semibold text-sm flex items-center gap-2">
                <TrendingUp size={14} className="text-[#3B82F6]" />
                Topic Trends
              </h2>
              <Link href="/digest" className="text-[#00E676] text-xs hover:underline">Digest</Link>
            </div>
            {trends.length === 0 ? (
              <p className="text-[#3D4D5C] text-xs py-2">No data yet</p>
            ) : (
              <div className="flex flex-wrap gap-1.5">
                {trends.map(({ topic, count }, i) => (
                  <div key={topic} className="flex items-center gap-1 px-2 py-1 rounded-full border border-[#3B82F6]/20 bg-[#3B82F6]/5" style={{ opacity: Math.max(0.4, 1 - i * 0.1) }}>
                    <span className="text-[#3B82F6] text-[10px] font-medium">{topic}</span>
                    <span className="text-[#3B82F6]/50 text-[9px] font-mono">{count}</span>
                  </div>
                ))}
              </div>
            )}
          </Card>

          {gaps.length > 0 && (
            <Card className="p-5">
              <h2 className="text-[#F5F7FA] font-semibold text-sm mb-3 flex items-center gap-2">
                <Lightbulb size={14} className="text-[#F5C542]" />
                Knowledge Gaps
              </h2>
              <p className="text-[#66717F] text-xs mb-3">Topics that appear in your insights but lack dedicated coverage:</p>
              <div className="flex flex-wrap gap-1.5">
                {gaps.map((gap) => (
                  <Link key={gap} href={`/search?q=${encodeURIComponent(gap)}`}>
                    <div className="px-2.5 py-1 rounded-full border border-[#F5C542]/20 bg-[#F5C542]/5 text-[#F5C542] text-[10px] hover:bg-[#F5C542]/10 transition-colors cursor-pointer">
                      {gap}
                    </div>
                  </Link>
                ))}
              </div>
            </Card>
          )}

          <Card className="p-5">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-[#F5F7FA] font-semibold text-sm">Ask Library</h2>
            </div>
            <Link href="/search">
              <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl border border-[#1E2A36] hover:border-[#2E4052] transition-colors group">
                <Search size={13} className="text-[#00E676]" />
                <span className="text-[#66717F] text-sm group-hover:text-[#A7B0BC] transition-colors">What have I learned about…</span>
              </div>
            </Link>
          </Card>

          <Card className="p-5">
            <h2 className="text-[#F5F7FA] font-semibold text-sm mb-3">Quick Actions</h2>
            <div className="space-y-0.5">
              {[
                { href: "/add-link", label: "Add YouTube Link", icon: Plus },
                { href: "/action-board", label: "View Action Board", icon: Zap },
                { href: "/library", label: "Browse Library", icon: BookOpen },
                { href: "/digest", label: "Weekly Digest", icon: TrendingUp },
              ].map(({ href, label, icon: Icon }) => (
                <Link key={label} href={href}>
                  <button className="w-full flex items-center gap-3 px-3 py-2 rounded-xl text-sm text-[#A7B0BC] hover:bg-[#111821] hover:text-[#F5F7FA] transition-all text-left">
                    <Icon size={13} className="text-[#00E676]" />{label}
                  </button>
                </Link>
              ))}
            </div>
            <div className="mt-3 pt-3 border-t border-[#1E2A36]">
              <div className="space-y-1">
                {[
                  { label: "Firebase", status: "connected" },
                  { label: "Auth", status: user ? "active" : "offline" },
                  { label: "AI Processing", status: "ready" },
                ].map(({ label, status }) => (
                  <div key={label} className="flex items-center justify-between text-xs">
                    <span className="text-[#A7B0BC]">{label}</span>
                    <span className="flex items-center gap-1.5 text-[#00E676]">
                      <span className="w-1.5 h-1.5 rounded-full bg-[#00E676] animate-pulse" />{status}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </Card>
        </div>
      </div>
    </div>
  );
}
