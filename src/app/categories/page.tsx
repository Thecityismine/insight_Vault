"use client";
import { Tag, Plus } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";

export default function CategoriesPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#F5F7FA] tracking-tight">
            Categories
          </h1>
          <p className="text-[#66717F] text-sm mt-1">
            Organize your insights by topic.
          </p>
        </div>
        <Link href="/add-link">
          <Button>
            <Plus size={16} />
            Add Insight
          </Button>
        </Link>
      </div>

      <Card className="p-12 text-center">
        <div className="flex flex-col items-center gap-3">
          <div className="w-14 h-14 rounded-2xl bg-[#3B82F6]/10 border border-[#3B82F6]/20 flex items-center justify-center">
            <Tag size={22} className="text-[#3B82F6]" />
          </div>
          <h2 className="text-[#F5F7FA] font-semibold">No categories yet</h2>
          <p className="text-[#66717F] text-sm max-w-xs">
            Categories are auto-generated when you process your first insight.
          </p>
          <Link href="/add-link" className="mt-2">
            <Button size="sm">Process a Link</Button>
          </Link>
        </div>
      </Card>
    </div>
  );
}
