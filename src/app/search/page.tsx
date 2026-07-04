"use client";
import { useState, useRef } from "react";
import { Search, Loader2, ArrowRight, Sparkles } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useAuth } from "@/lib/auth";
import { getPlatformLabel } from "@/lib/utils";

const SUGGESTIONS = [
  "What have I learned about productivity?",
  "What tools have been recommended?",
  "What are my most important action items?",
  "What topics come up most in my library?",
];

interface Source { id: string; title: string; platform: string }
interface Result { answer: string; sources: Source[] }

export default function SearchPage() {
  const { user } = useAuth();
  const [query, setQuery] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<Result | null>(null);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement>(null);

  async function handleSearch(q?: string) {
    const searchQuery = (q ?? query).trim();
    if (!searchQuery || !user) return;
    setQuery(searchQuery);
    setLoading(true);
    setResult(null);
    setError(null);
    try {
      const res = await fetch("/api/intelligence/search", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ query: searchQuery, userId: user.uid }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error ?? "Search failed");
      setResult(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Search failed");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#F5F7FA] tracking-tight">Ask Your Library</h1>
        <p className="text-[#66717F] text-sm mt-1">Search across everything you&apos;ve learned — powered by AI.</p>
      </div>

      {/* Search input */}
      <div className="relative">
        <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-[#66717F]" />
        <input
          ref={inputRef}
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => { if (e.key === "Enter") handleSearch(); }}
          placeholder="What have you learned about…"
          className="w-full bg-[#111821] border border-[#1E2A36] rounded-2xl pl-11 pr-32 py-4 text-[#F5F7FA] placeholder:text-[#3D4D5C] focus:outline-none focus:border-[#00E676]/40 transition-colors text-sm"
        />
        <button
          onClick={() => handleSearch()}
          disabled={!query.trim() || loading}
          className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-2 px-4 py-2 rounded-xl bg-[#00E676]/10 border border-[#00E676]/20 text-[#00E676] text-sm font-medium hover:bg-[#00E676]/20 transition-colors disabled:opacity-40"
        >
          {loading ? <Loader2 size={13} className="animate-spin" /> : <Sparkles size={13} />}
          Ask
        </button>
      </div>

      {/* Suggestion chips */}
      {!result && !loading && (
        <div className="flex flex-wrap gap-2">
          {SUGGESTIONS.map((s) => (
            <button
              key={s}
              onClick={() => handleSearch(s)}
              className="px-3 py-1.5 rounded-full border border-[#1E2A36] text-xs text-[#66717F] hover:border-[#2E4052] hover:text-[#A7B0BC] transition-all"
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Loading */}
      {loading && (
        <Card className="p-8">
          <div className="flex items-center gap-3 text-[#66717F]">
            <Loader2 size={16} className="animate-spin text-[#00E676]" />
            <span className="text-sm">Searching your library…</span>
          </div>
        </Card>
      )}

      {/* Error */}
      {error && (
        <Card className="p-6 border-[#EF4444]/20">
          <p className="text-[#EF4444] text-sm">{error}</p>
        </Card>
      )}

      {/* Result */}
      {result && !loading && (
        <div className="space-y-4">
          <Card className="p-6">
            <div className="flex items-start gap-3 mb-4">
              <div className="w-7 h-7 rounded-lg bg-[#00E676]/10 border border-[#00E676]/20 flex items-center justify-center flex-shrink-0 mt-0.5">
                <Sparkles size={13} className="text-[#00E676]" />
              </div>
              <div>
                <p className="text-[#66717F] text-[10px] font-mono uppercase tracking-widest mb-2">AI Answer</p>
                <p className="text-[#A7B0BC] text-sm leading-relaxed">{result.answer}</p>
              </div>
            </div>
          </Card>

          {result.sources.length > 0 && (
            <div>
              <p className="text-[#66717F] text-xs font-mono uppercase tracking-widest mb-2 px-1">Sources</p>
              <div className="space-y-2">
                {result.sources.map((source) => (
                  <Link key={source.id} href={`/insight/${source.id}`}>
                    <div className="flex items-center justify-between p-4 rounded-xl border border-[#1E2A36] hover:border-[#2E4052] hover:bg-[#111821] transition-all group">
                      <div className="flex items-center gap-3 min-w-0">
                        <Badge variant="default">{getPlatformLabel(source.platform as never)}</Badge>
                        <span className="text-sm text-[#A7B0BC] group-hover:text-[#F5F7FA] transition-colors line-clamp-1">
                          {source.title}
                        </span>
                      </div>
                      <ArrowRight size={14} className="text-[#3D4D5C] group-hover:text-[#00E676] transition-colors flex-shrink-0" />
                    </div>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <button
            onClick={() => { setResult(null); setQuery(""); inputRef.current?.focus(); }}
            className="text-[#66717F] text-xs hover:text-[#A7B0BC] transition-colors"
          >
            Clear and search again
          </button>
        </div>
      )}
    </div>
  );
}
