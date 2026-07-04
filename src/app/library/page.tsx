"use client";
import { useState } from "react";
import { Search, Filter, Plus } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

const PLATFORMS = ["All", "YouTube", "TikTok", "X Spaces", "Podcast"];

export default function LibraryPage() {
  const [search, setSearch] = useState("");
  const [platform, setPlatform] = useState("All");

  return (
    <div className="max-w-6xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#F5F7FA] tracking-tight">
            Library
          </h1>
          <p className="text-[#66717F] text-sm mt-1 font-mono">
            0 insights collected
          </p>
        </div>
        <Link href="/add-link">
          <Button>
            <Plus size={16} />
            Add Link
          </Button>
        </Link>
      </div>

      {/* Filters */}
      <div className="flex items-center gap-3 flex-wrap">
        <div className="relative flex-1 min-w-48">
          <Search
            size={14}
            className="absolute left-3 top-1/2 -translate-y-1/2 text-[#66717F]"
          />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Search insights..."
            className="w-full bg-[#111821] border border-[#1E2A36] rounded-xl pl-9 pr-4 py-2.5 text-sm text-[#F5F7FA] placeholder:text-[#66717F] focus:outline-none focus:border-[#2E4052] transition-colors"
          />
        </div>
        <div className="flex items-center gap-2">
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

      {/* Empty state */}
      <Card className="p-16">
        <div className="flex flex-col items-center justify-center text-center">
          <div className="w-16 h-16 rounded-2xl bg-[#00E676]/10 border border-[#00E676]/20 flex items-center justify-center mb-4">
            <Search size={24} className="text-[#00E676]" />
          </div>
          <h2 className="text-[#F5F7FA] font-semibold text-lg mb-2">
            Your library is empty
          </h2>
          <p className="text-[#66717F] text-sm mb-6 max-w-sm">
            Process your first link to start building your personal intelligence library.
          </p>
          <Link href="/add-link">
            <Button>
              <Plus size={16} />
              Process First Link
            </Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
