"use client";
import { useEffect, useState, useMemo } from "react";
import { Search, Plus, Loader2 } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { InsightCard } from "@/components/insight/InsightCard";
import { useAuth } from "@/lib/auth";
import { getUserInsights } from "@/lib/firestore";
import type { Insight } from "@/types";

const PLATFORMS = ["All", "YouTube", "TikTok", "X Spaces", "Podcast", "Other"];

const PLATFORM_MAP: Record<string, string> = {
  YouTube: "youtube",
  TikTok: "tiktok",
  "X Spaces": "x_spaces",
  Podcast: "podcast",
  Other: "other",
};

export default function LibraryPage() {
  const { user } = useAuth();
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [platform, setPlatform] = useState("All");

  useEffect(() => {
    if (!user) return;
    getUserInsights(user.uid)
      .then(setInsights)
      .finally(() => setLoading(false));
  }, [user]);

  const filtered = useMemo(() => {
    let result = insights;
    if (platform !== "All") {
      result = result.filter((i) => i.platform === PLATFORM_MAP[platform]);
    }
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (i) =>
          i.title?.toLowerCase().includes(q) ||
          i.summary?.toLowerCase().includes(q) ||
          i.categories?.some((c) => c.toLowerCase().includes(q)) ||
          i.tags?.some((t) => t.toLowerCase().includes(q))
      );
    }
    return result;
  }, [insights, search, platform]);

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#F5F7FA] tracking-tight">Library</h1>
          <p className="text-[#66717F] text-sm mt-1 font-mono">
            {loading ? "Loading..." : `${insights.length} insight${insights.length !== 1 ? "s" : ""} collected`}
          </p>
        </div>
        <Link href="/add-link"><Button><Plus size={16} />Add Link</Button></Link>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#66717F]" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search by title, summary, or category..."
            className="w-full bg-[#111821] border border-[#1E2A36] rounded-xl pl-9 pr-4 py-2.5 text-sm text-[#F5F7FA] placeholder:text-[#66717F] focus:outline-none focus:border-[#2E4052] transition-colors"
          />
        </div>
        <div className="flex items-center gap-1.5 flex-wrap">
          {PLATFORMS.map((p) => (
            <button
              key={p}
              onClick={() => setPlatform(p)}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${
                platform === p
                  ? "bg-[#00E676]/10 text-[#00E676] border border-[#00E676]/20"
                  : "text-[#A7B0BC] border border-[#1E2A36] hover:border-[#2E4052]"
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Loading skeletons */}
      {loading && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-[#111821] border border-[#1E2A36] rounded-2xl p-5 animate-pulse">
              <div className="h-4 bg-[#1E2A36] rounded w-3/4 mb-3" />
              <div className="h-3 bg-[#1E2A36] rounded w-full mb-2" />
              <div className="h-3 bg-[#1E2A36] rounded w-2/3 mb-4" />
              <div className="flex gap-2">
                <div className="h-5 bg-[#1E2A36] rounded-full w-16" />
                <div className="h-5 bg-[#1E2A36] rounded-full w-20" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Insights grid */}
      {!loading && filtered.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {filtered.map((insight) => (
            <InsightCard key={insight.id} insight={insight} />
          ))}
        </div>
      )}

      {/* No results */}
      {!loading && filtered.length === 0 && insights.length > 0 && (
        <Card className="p-12 text-center">
          <p className="text-[#A7B0BC] text-sm mb-2">No insights match your search.</p>
          <button onClick={() => { setSearch(""); setPlatform("All"); }} className="text-[#00E676] text-sm hover:underline">
            Clear filters
          </button>
        </Card>
      )}

      {/* Empty state */}
      {!loading && insights.length === 0 && (
        <Card className="p-16">
          <div className="flex flex-col items-center justify-center text-center">
            <div className="w-16 h-16 rounded-2xl bg-[#00E676]/10 border border-[#00E676]/20 flex items-center justify-center mb-4">
              <Search size={24} className="text-[#00E676]" />
            </div>
            <h2 className="text-[#F5F7FA] font-semibold text-lg mb-2">Your library is empty</h2>
            <p className="text-[#66717F] text-sm mb-6 max-w-sm">
              Process your first link to start building your personal intelligence library.
            </p>
            <Link href="/add-link"><Button><Plus size={16} />Process First Link</Button></Link>
          </div>
        </Card>
      )}
    </div>
  );
}
