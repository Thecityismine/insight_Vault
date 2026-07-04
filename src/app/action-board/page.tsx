"use client";
import { useEffect, useState } from "react";
import { Zap, Plus, CheckSquare, Square, ExternalLink } from "lucide-react";
import Link from "next/link";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { useAuth } from "@/lib/auth";
import { getUserInsights, toggleActionItem } from "@/lib/firestore";
import type { Insight, ActionItem } from "@/types";
import toast from "react-hot-toast";

interface FlatAction extends ActionItem {
  insightId: string;
  insightTitle: string;
}

const PRIORITY_ORDER = { high: 0, medium: 1, low: 2 };

export default function ActionBoardPage() {
  const { user } = useAuth();
  const [actions, setActions] = useState<FlatAction[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    getUserInsights(user.uid).then((insights) => {
      const flat: FlatAction[] = insights.flatMap((ins) =>
        ins.actionItems.map((a) => ({
          ...a,
          insightId: ins.id,
          insightTitle: ins.title,
        }))
      );
      flat.sort((a, b) => PRIORITY_ORDER[a.priority] - PRIORITY_ORDER[b.priority]);
      setActions(flat);
    }).finally(() => setLoading(false));
  }, [user]);

  async function handleToggle(insightId: string, actionId: string, current: boolean) {
    const next = !current;
    setActions((prev) =>
      prev.map((a) => (a.id === actionId ? { ...a, completed: next } : a))
    );
    try {
      await toggleActionItem(insightId, actionId, next);
      toast.success(next ? "Marked complete" : "Marked incomplete");
    } catch {
      setActions((prev) =>
        prev.map((a) => (a.id === actionId ? { ...a, completed: current } : a))
      );
      toast.error("Failed to update");
    }
  }

  const pending = actions.filter((a) => !a.completed);
  const done = actions.filter((a) => a.completed);

  const byPriority = (priority: "high" | "medium" | "low") =>
    pending.filter((a) => a.priority === priority);

  const priorityColor = { high: "#EF4444", medium: "#F5C542", low: "#3B82F6" } as const;
  const priorityVariant = { high: "red", medium: "gold", low: "blue" } as const;

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-[#F5F7FA] tracking-tight">Action Board</h1>
          <p className="text-[#66717F] text-sm mt-1">Extracted action items from all your insights.</p>
        </div>
        {!loading && (
          <div className="flex items-center gap-2">
            <Badge variant="gold">{pending.length} pending</Badge>
            <Badge variant="muted">{done.length} completed</Badge>
          </div>
        )}
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-[#111821] border border-[#1E2A36] rounded-2xl p-4 animate-pulse space-y-3">
              <div className="h-3 bg-[#1E2A36] rounded w-24" />
              {[...Array(3)].map((_, j) => <div key={j} className="h-10 bg-[#1E2A36] rounded-xl" />)}
            </div>
          ))}
        </div>
      ) : actions.length === 0 ? (
        <Card className="p-12 text-center">
          <div className="flex flex-col items-center gap-3">
            <Zap size={24} className="text-[#1E2A36]" />
            <p className="text-[#A7B0BC] text-sm">No action items yet. Process a link to extract tasks.</p>
            <Link href="/add-link"><Button size="sm"><Plus size={14} />Process a Link</Button></Link>
          </div>
        </Card>
      ) : (
        <>
          {/* Priority columns */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {(["high", "medium", "low"] as const).map((priority) => {
              const items = byPriority(priority);
              return (
                <Card key={priority} className="p-4">
                  <div className="flex items-center justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full" style={{ background: priorityColor[priority] }} />
                      <span className="text-[#A7B0BC] text-xs uppercase tracking-widest font-mono">
                        {priority}
                      </span>
                    </div>
                    <Badge variant={priorityVariant[priority]}>{items.length}</Badge>
                  </div>

                  {items.length === 0 ? (
                    <p className="text-[#3D4D5C] text-xs text-center py-6">No {priority} priority tasks</p>
                  ) : (
                    <div className="space-y-2">
                      {items.map((action) => (
                        <div key={action.id} className="group p-3 rounded-xl border border-[#1E2A36] hover:border-[#2E4052] transition-colors">
                          <div className="flex items-start gap-2.5">
                            <button
                              onClick={() => handleToggle(action.insightId, action.id, action.completed)}
                              className="mt-0.5 flex-shrink-0 text-[#66717F] hover:text-[#00E676] transition-colors"
                            >
                              {action.completed
                                ? <CheckSquare size={15} className="text-[#00E676]" />
                                : <Square size={15} />}
                            </button>
                            <p className="text-[#A7B0BC] text-xs leading-relaxed flex-1">{action.text}</p>
                          </div>
                          <div className="mt-2 ml-6">
                            <Link href={`/insight/${action.insightId}`} className="text-[#3D4D5C] text-xs hover:text-[#66717F] flex items-center gap-1 transition-colors">
                              <ExternalLink size={10} />
                              <span className="line-clamp-1">{action.insightTitle}</span>
                            </Link>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </Card>
              );
            })}
          </div>

          {/* Completed section */}
          {done.length > 0 && (
            <Card className="p-5">
              <h2 className="text-[#66717F] text-xs uppercase tracking-widest font-mono mb-3">
                Completed — {done.length}
              </h2>
              <div className="space-y-1.5">
                {done.map((action) => (
                  <div key={action.id} className="flex items-start gap-2.5 p-2 rounded-lg group">
                    <button
                      onClick={() => handleToggle(action.insightId, action.id, action.completed)}
                      className="mt-0.5 flex-shrink-0"
                    >
                      <CheckSquare size={14} className="text-[#2E4052] group-hover:text-[#66717F] transition-colors" />
                    </button>
                    <p className="text-[#3D4D5C] text-xs line-through leading-relaxed">{action.text}</p>
                  </div>
                ))}
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
