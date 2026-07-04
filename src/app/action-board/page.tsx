"use client";
import { Zap, Plus } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export default function ActionBoardPage() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#F5F7FA] tracking-tight">
            Action Board
          </h1>
          <p className="text-[#66717F] text-sm mt-1">
            Extracted action items from all your insights.
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="gold">0 pending</Badge>
          <Badge variant="muted">0 completed</Badge>
        </div>
      </div>

      {/* Priority columns */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {(["high", "medium", "low"] as const).map((priority) => (
          <Card key={priority} className="p-4">
            <div className="flex items-center gap-2 mb-4">
              <div
                className={`w-2 h-2 rounded-full ${
                  priority === "high"
                    ? "bg-[#EF4444]"
                    : priority === "medium"
                    ? "bg-[#F5C542]"
                    : "bg-[#3B82F6]"
                }`}
              />
              <span className="text-[#A7B0BC] text-xs uppercase tracking-widest font-mono">
                {priority} priority
              </span>
            </div>
            <div className="flex flex-col items-center justify-center py-8 text-center">
              <Zap size={20} className="text-[#1E2A36] mb-2" />
              <p className="text-[#66717F] text-xs">No {priority} priority tasks</p>
            </div>
          </Card>
        ))}
      </div>

      <Card className="p-8 text-center">
        <p className="text-[#A7B0BC] text-sm mb-4">
          Action items are automatically extracted when you process a link.
        </p>
        <Link href="/add-link">
          <Button>
            <Plus size={16} />
            Process a Link
          </Button>
        </Link>
      </Card>
    </div>
  );
}
