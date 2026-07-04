"use client";
import { useEffect, useState, useMemo } from "react";
import { Tag, Plus, ChevronRight } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { InsightCard } from "@/components/insight/InsightCard";
import { useAuth } from "@/lib/auth";
import { getUserInsights } from "@/lib/firestore";
import type { Insight } from "@/types";

export default function CategoriesPage() {
  const { user } = useAuth();
  const [insights, setInsights] = useState<Insight[]>([]);
  const [loading, setLoading] = useState(true);
  const [selected, setSelected] = useState<string | null>(null);

  useEffect(() => {
    if (!user) return;
    getUserInsights(user.uid).then(setInsights).finally(() => setLoading(false));
  }, [user]);

  const categoryMap = useMemo(() => {
    const map = new Map<string, Insight[]>();
    for (const insight of insights) {
      for (const cat of insight.categories ?? []) {
        if (!map.has(cat)) map.set(cat, []);
        map.get(cat)!.push(insight);
      }
    }
    return new Map([...map.entries()].sort((a, b) => b[1].length - a[1].length));
  }, [insights]);

  const selectedInsights = selected ? (categoryMap.get(selected) ?? []) : [];

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#F5F7FA] tracking-tight">Categories</h1>
          <p className="text-[#66717F] text-sm mt-1">
            {loading ? "Loading..." : `${categoryMap.size} categories across ${insights.length} insights`}
          </p>
        </div>
        <Link href="/add-link"><Button><Plus size={16} />Add Insight</Button></Link>
      </div>

      {loading ? (
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
          {[...Array(6)].map((_, i) => (
            <div key={i} className="bg-[#111821] border border-[#1E2A36] rounded-2xl p-4 animate-pulse">
              <div className="h-4 bg-[#1E2A36] rounded w-24 mb-2" />
              <div className="h-3 bg-[#1E2A36] rounded w-12" />
            </div>
          ))}
        </div>
      ) : categoryMap.size === 0 ? (
        <Card className="p-12 text-center">
          <div className="flex flex-col items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-[#3B82F6]/10 border border-[#3B82F6]/20 flex items-center justify-center">
              <Tag size={22} className="text-[#3B82F6]" />
            </div>
            <h2 className="text-[#F5F7FA] font-semibold">No categories yet</h2>
            <p className="text-[#66717F] text-sm max-w-xs">Categories are auto-generated when you process your first insight.</p>
            <Link href="/add-link" className="mt-2"><Button size="sm">Process a Link</Button></Link>
          </div>
        </Card>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
          {/* Category list */}
          <div className="space-y-2">
            {[...categoryMap.entries()].map(([cat, items]) => (
              <button
                key={cat}
                onClick={() => setSelected(selected === cat ? null : cat)}
                className={`w-full flex items-center justify-between p-4 rounded-xl border transition-all text-left ${
                  selected === cat
                    ? "bg-[#00E676]/10 border-[#00E676]/20 text-[#00E676]"
                    : "bg-[#111821] border-[#1E2A36] text-[#A7B0BC] hover:border-[#2E4052] hover:text-[#F5F7FA]"
                }`}
              >
                <div className="flex items-center gap-3">
                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${selected === cat ? "bg-[#00E676]/20" : "bg-[#1E2A36]"}`}>
                    <Tag size={14} className={selected === cat ? "text-[#00E676]" : "text-[#66717F]"} />
                  </div>
                  <span className="text-sm font-medium">{cat}</span>
                </div>
                <div className="flex items-center gap-2">
                  <Badge variant={selected === cat ? "green" : "muted"}>{items.length}</Badge>
                  <ChevronRight size={14} className={`transition-transform ${selected === cat ? "rotate-90" : ""}`} />
                </div>
              </button>
            ))}
          </div>

          {/* Insights for selected category */}
          <div className="lg:col-span-2">
            {selected ? (
              <div className="space-y-3">
                <p className="text-[#66717F] text-xs font-mono uppercase tracking-widest">
                  {selected} — {selectedInsights.length} insight{selectedInsights.length !== 1 ? "s" : ""}
                </p>
                {selectedInsights.map((insight) => (
                  <InsightCard key={insight.id} insight={insight} />
                ))}
              </div>
            ) : (
              <Card className="p-10 text-center h-full flex flex-col items-center justify-center">
                <Tag size={20} className="text-[#1E2A36] mb-2" />
                <p className="text-[#3D4D5C] text-sm">Select a category to browse its insights</p>
              </Card>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
