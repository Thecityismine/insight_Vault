"use client";
import Link from "next/link";
import {
  BookOpen,
  Zap,
  TrendingUp,
  Clock,
  Plus,
  ArrowRight,
} from "lucide-react";
import { MetricCard } from "@/components/dashboard/MetricCard";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

// Static demo data — replace with Firestore queries once auth is set up
const DEMO_STATS = {
  totalInsights: 0,
  actionItems: 0,
  highValueIdeas: 0,
  inProgress: 0,
};

const DEMO_RECENT: {
  id: string;
  title: string;
  platform: string;
  time: string;
  score: number;
}[] = [];

export default function DashboardPage() {
  return (
    <div className="max-w-6xl mx-auto space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#F5F7FA] tracking-tight">
            Command Center
          </h1>
          <p className="text-[#66717F] text-sm font-mono mt-0.5">
            INSIGHT TERMINAL — v1.0
          </p>
        </div>
        <Link href="/add-link">
          <Button>
            <Plus size={16} />
            Process New Link
          </Button>
        </Link>
      </div>

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <MetricCard
          label="Total Insights"
          value={DEMO_STATS.totalInsights}
          icon={BookOpen}
          accent="green"
          trend="Your knowledge base"
        />
        <MetricCard
          label="Action Items"
          value={DEMO_STATS.actionItems}
          icon={Zap}
          accent="gold"
          trend="Pending tasks"
        />
        <MetricCard
          label="High Value Ideas"
          value={DEMO_STATS.highValueIdeas}
          icon={TrendingUp}
          accent="blue"
          trend="Score ≥ 80%"
        />
        <MetricCard
          label="In Progress"
          value={DEMO_STATS.inProgress}
          icon={Clock}
          accent="red"
          trend="Processing now"
        />
      </div>

      {/* Recent Insights + Quick Actions */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Recent Insights */}
        <Card className="lg:col-span-2 p-5">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-[#F5F7FA] font-semibold text-sm">
              Recent Insights
            </h2>
            <Link
              href="/library"
              className="text-[#00E676] text-xs hover:underline flex items-center gap-1"
            >
              View all <ArrowRight size={11} />
            </Link>
          </div>

          {DEMO_RECENT.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-12 h-12 rounded-2xl bg-[#00E676]/10 border border-[#00E676]/20 flex items-center justify-center mb-3">
                <BookOpen size={20} className="text-[#00E676]" />
              </div>
              <p className="text-[#F5F7FA] text-sm font-semibold mb-1">
                No insights yet
              </p>
              <p className="text-[#66717F] text-xs mb-4">
                Paste a YouTube, TikTok, X Space, or podcast link to start
              </p>
              <Link href="/add-link">
                <Button size="sm">Process your first link</Button>
              </Link>
            </div>
          ) : (
            <div className="space-y-3">
              {DEMO_RECENT.map((item) => (
                <Link key={item.id} href={`/insight/${item.id}`}>
                  <div className="flex items-center justify-between p-3 rounded-xl hover:bg-[#111821] transition-colors border border-transparent hover:border-[#1E2A36]">
                    <div>
                      <p className="text-[#F5F7FA] text-sm font-medium line-clamp-1">
                        {item.title}
                      </p>
                      <p className="text-[#66717F] text-xs font-mono mt-0.5">
                        {item.platform} · {item.time}
                      </p>
                    </div>
                    <Badge variant="green">{item.score}%</Badge>
                  </div>
                </Link>
              ))}
            </div>
          )}
        </Card>

        {/* Quick Actions */}
        <Card className="p-5">
          <h2 className="text-[#F5F7FA] font-semibold text-sm mb-4">
            Quick Actions
          </h2>
          <div className="space-y-2">
            {[
              { href: "/add-link", label: "Add YouTube Link", icon: Plus },
              { href: "/add-link", label: "Add Podcast Link", icon: Plus },
              { href: "/action-board", label: "View Action Board", icon: Zap },
              { href: "/library", label: "Browse Library", icon: BookOpen },
            ].map(({ href, label, icon: Icon }) => (
              <Link key={label} href={href}>
                <button className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm text-[#A7B0BC] hover:bg-[#111821] hover:text-[#F5F7FA] transition-all text-left">
                  <Icon size={14} className="text-[#00E676]" />
                  {label}
                </button>
              </Link>
            ))}
          </div>

          <div className="mt-4 pt-4 border-t border-[#1E2A36]">
            <p className="text-[#66717F] text-xs font-mono uppercase tracking-widest mb-2">
              System Status
            </p>
            <div className="space-y-1.5">
              {[
                { label: "Firebase", status: "connected" },
                { label: "Transcript API", status: "ready" },
                { label: "AI Processing", status: "ready" },
              ].map(({ label, status }) => (
                <div
                  key={label}
                  className="flex items-center justify-between text-xs"
                >
                  <span className="text-[#A7B0BC]">{label}</span>
                  <span className="flex items-center gap-1.5 text-[#00E676]">
                    <span className="w-1.5 h-1.5 rounded-full bg-[#00E676] animate-pulse" />
                    {status}
                  </span>
                </div>
              ))}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}
