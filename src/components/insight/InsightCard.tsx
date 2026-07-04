"use client";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ExternalLink, Clock, CheckSquare } from "lucide-react";
import { formatRelativeTime, getPlatformLabel, truncate } from "@/lib/utils";
import type { Insight } from "@/types";

interface InsightCardProps {
  insight: Insight;
}

const platformVariant: Record<string, "green" | "blue" | "gold" | "default"> = {
  youtube: "red" as never,
  tiktok: "blue",
  x_spaces: "blue",
  podcast: "gold",
  other: "default",
};

export function InsightCard({ insight }: InsightCardProps) {
  const pendingActions = insight.actionItems.filter((a) => !a.completed).length;

  return (
    <Link href={`/insight/${insight.id}`} className="block group">
      <Card className="p-5 hover:border-[#2E4052] transition-all duration-200 group-hover:shadow-[0_0_20px_rgba(0,230,118,0.06)]">
        <div className="flex items-start justify-between gap-3 mb-3">
          <div className="flex-1 min-w-0">
            <p className="text-[#F5F7FA] font-semibold text-sm leading-snug line-clamp-2 group-hover:text-[#00E676] transition-colors">
              {insight.title || "Untitled Insight"}
            </p>
          </div>
          <ExternalLink
            size={14}
            className="text-[#66717F] flex-shrink-0 mt-0.5 group-hover:text-[#00E676] transition-colors"
          />
        </div>

        <p className="text-[#A7B0BC] text-xs leading-relaxed mb-4 line-clamp-2">
          {truncate(insight.summary, 100)}
        </p>

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 flex-wrap">
            <Badge variant="default">
              {getPlatformLabel(insight.platform)}
            </Badge>
            {insight.categories.slice(0, 2).map((cat) => (
              <Badge key={cat} variant="muted">
                {cat}
              </Badge>
            ))}
          </div>

          <div className="flex items-center gap-3 text-xs text-[#66717F] font-mono flex-shrink-0">
            {pendingActions > 0 && (
              <span className="flex items-center gap-1 text-[#F5C542]">
                <CheckSquare size={11} />
                {pendingActions}
              </span>
            )}
            <span className="flex items-center gap-1">
              <Clock size={11} />
              {formatRelativeTime(insight.createdAt)}
            </span>
          </div>
        </div>
      </Card>
    </Link>
  );
}
