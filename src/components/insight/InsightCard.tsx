"use client";
import { useState } from "react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { ExternalLink, Clock, CheckSquare, Star, Trash2 } from "lucide-react";
import { formatRelativeTime, getPlatformLabel, truncate } from "@/lib/utils";
import { deleteInsight } from "@/lib/firestore";
import type { Insight } from "@/types";

interface InsightCardProps {
  insight: Insight;
  onDelete?: (id: string) => void;
}

export function InsightCard({ insight, onDelete }: InsightCardProps) {
  const [confirmDelete, setConfirmDelete] = useState(false);
  const pendingActions = insight.actionItems.filter((a) => !a.completed).length;

  async function handleDelete(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    if (!confirmDelete) {
      setConfirmDelete(true);
      return;
    }
    await deleteInsight(insight.id);
    onDelete?.(insight.id);
  }

  function handleCancelDelete(e: React.MouseEvent) {
    e.preventDefault();
    e.stopPropagation();
    setConfirmDelete(false);
  }

  return (
    <Link href={`/insight/${insight.id}`} className="block group">
      <Card className="overflow-hidden p-0 hover:border-[#2E4052] transition-all duration-200 group-hover:shadow-[0_0_20px_rgba(0,230,118,0.06)] relative">
        {/* Thumbnail banner */}
        {insight.thumbnail ? (
          <div className="relative h-32 w-full overflow-hidden">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={insight.thumbnail}
              alt=""
              className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-gradient-to-b from-black/10 via-transparent to-[#111821]" />

            {/* Platform badge on thumbnail */}
            <div className="absolute bottom-2 left-3">
              <Badge variant="default">{getPlatformLabel(insight.platform)}</Badge>
            </div>

            {/* Star indicator */}
            {insight.starred && (
              <div className="absolute top-2 left-3">
                <Star size={13} className="fill-[#F5C542] text-[#F5C542] drop-shadow-sm" />
              </div>
            )}

            {/* Delete / confirm on thumbnail */}
            <div className="absolute top-2 right-2 hidden group-hover:flex items-center gap-1">
              {confirmDelete ? (
                <div className="flex items-center gap-1 bg-black/70 rounded-lg px-2 py-1 backdrop-blur-sm">
                  <span className="text-[10px] text-[#A7B0BC]">Delete?</span>
                  <button onClick={handleDelete} className="text-[10px] text-red-400 hover:text-red-300 font-medium px-1">Yes</button>
                  <span className="text-[#3A4550] text-[10px]">·</span>
                  <button onClick={handleCancelDelete} className="text-[10px] text-[#66717F] hover:text-[#A7B0BC] px-1">No</button>
                </div>
              ) : (
                <button
                  onClick={handleDelete}
                  className="w-6 h-6 flex items-center justify-center rounded-lg bg-black/60 text-[#A7B0BC] hover:text-red-400 backdrop-blur-sm transition-colors"
                  title="Delete insight"
                >
                  <Trash2 size={12} />
                </button>
              )}
            </div>
          </div>
        ) : (
          /* Star + delete when no thumbnail */
          <>
            {insight.starred && (
              <Star size={13} className="absolute top-3 right-3 fill-[#F5C542] text-[#F5C542]" />
            )}
            <div className="absolute top-3 right-3 hidden group-hover:flex items-center gap-1">
              {confirmDelete ? (
                <>
                  <span className="text-[10px] text-[#A7B0BC]">Delete?</span>
                  <button onClick={handleDelete} className="text-[10px] text-red-400 hover:text-red-300 font-medium px-1">Yes</button>
                  <span className="text-[#3A4550] text-[10px]">·</span>
                  <button onClick={handleCancelDelete} className="text-[10px] text-[#66717F] hover:text-[#A7B0BC] px-1">No</button>
                </>
              ) : (
                <button onClick={handleDelete} className="text-[#66717F] hover:text-red-400 transition-colors p-0.5" title="Delete insight">
                  <Trash2 size={13} />
                </button>
              )}
            </div>
          </>
        )}

        {/* Card body */}
        <div className="p-5">
          <div className="flex items-start justify-between gap-3 mb-3">
            <div className="flex-1 min-w-0">
              <p className="text-[#F5F7FA] font-semibold text-sm leading-snug line-clamp-2 group-hover:text-[#00E676] transition-colors">
                {insight.title || "Untitled Insight"}
              </p>
            </div>
            <ExternalLink
              size={14}
              className={`text-[#66717F] flex-shrink-0 mt-0.5 group-hover:text-[#00E676] transition-colors ${insight.thumbnail ? "" : "mr-5"}`}
            />
          </div>

          <p className="text-[#A7B0BC] text-xs leading-relaxed mb-4 line-clamp-2">
            {truncate(insight.summary, 100)}
          </p>

          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-wrap">
              {!insight.thumbnail && (
                <Badge variant="default">{getPlatformLabel(insight.platform)}</Badge>
              )}
              {insight.categories.slice(0, 2).map((cat) => (
                <Badge key={cat} variant="muted">{cat}</Badge>
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
        </div>
      </Card>
    </Link>
  );
}
