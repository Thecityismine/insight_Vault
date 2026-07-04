"use client";
import { use, useEffect, useRef, useState } from "react";
import {
  ArrowLeft, ExternalLink, Clock, CheckSquare, Square,
  AlertCircle, Star, Trash2, Copy, RefreshCw, Pencil,
  Check, X, Plus, Loader2, Timer,
} from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/auth";
import { getInsight, updateInsight, deleteInsight, toggleActionItem } from "@/lib/firestore";
import { getPlatformLabel, formatDate } from "@/lib/utils";
import { stripTimestamps } from "@/lib/transcript/clean";
import type { Insight } from "@/types";
import toast from "react-hot-toast";

export default function InsightPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = use(params);
  const { user } = useAuth();
  const router = useRouter();
  const [insight, setInsight] = useState<Insight | null>(null);
  const [loading, setLoading] = useState(true);

  // Editing state
  const [editingTitle, setEditingTitle] = useState(false);
  const [titleDraft, setTitleDraft] = useState("");
  const titleRef = useRef<HTMLInputElement>(null);

  // Tag / category editing
  const [editingTags, setEditingTags] = useState(false);
  const [tagInput, setTagInput] = useState("");
  const [editingCategories, setEditingCategories] = useState(false);
  const [categoryInput, setCategoryInput] = useState("");

  // Delete confirmation
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // Reprocess
  const [reprocessing, setReprocessing] = useState(false);

  // Transcript view
  const [showTimestamps, setShowTimestamps] = useState(false);

  useEffect(() => {
    getInsight(id).then(setInsight).finally(() => setLoading(false));
  }, [id]);

  useEffect(() => {
    if (editingTitle) titleRef.current?.focus();
  }, [editingTitle]);

  // ── Title editing ─────────────────────────────────────────────────────────
  function startEditTitle() {
    if (!insight) return;
    setTitleDraft(insight.title);
    setEditingTitle(true);
  }

  async function saveTitle() {
    if (!insight || !titleDraft.trim()) return;
    const title = titleDraft.trim();
    setInsight((p) => p ? { ...p, title } : p);
    setEditingTitle(false);
    await updateInsight(insight.id, { title });
    toast.success("Title updated");
  }

  function cancelTitle() {
    setEditingTitle(false);
    setTitleDraft("");
  }

  // ── Star toggle ───────────────────────────────────────────────────────────
  async function toggleStar() {
    if (!insight) return;
    const starred = !insight.starred;
    setInsight((p) => p ? { ...p, starred } : p);
    await updateInsight(insight.id, { starred });
    toast.success(starred ? "Starred" : "Unstarred");
  }

  // ── Delete ────────────────────────────────────────────────────────────────
  async function handleDelete() {
    if (!insight) return;
    setDeleting(true);
    await deleteInsight(insight.id);
    toast.success("Insight deleted");
    router.push("/library");
  }

  // ── Action items ──────────────────────────────────────────────────────────
  async function handleToggleAction(actionId: string, completed: boolean) {
    if (!insight) return;
    await toggleActionItem(insight.id, actionId, completed);
    setInsight((p) => p ? {
      ...p,
      actionItems: p.actionItems.map((a) => a.id === actionId ? { ...a, completed } : a),
    } : p);
  }

  // ── Copy transcript ───────────────────────────────────────────────────────
  function copyTranscript() {
    if (!insight?.transcript?.text) return;
    navigator.clipboard.writeText(insight.transcript.text);
    toast.success("Transcript copied");
  }

  // ── Tags ──────────────────────────────────────────────────────────────────
  async function addTag() {
    if (!insight || !tagInput.trim()) return;
    const tag = tagInput.trim();
    if (insight.tags.includes(tag)) { setTagInput(""); return; }
    const tags = [...insight.tags, tag];
    setInsight((p) => p ? { ...p, tags } : p);
    setTagInput("");
    await updateInsight(insight.id, { tags });
  }

  async function removeTag(tag: string) {
    if (!insight) return;
    const tags = insight.tags.filter((t) => t !== tag);
    setInsight((p) => p ? { ...p, tags } : p);
    await updateInsight(insight.id, { tags });
  }

  // ── Categories ────────────────────────────────────────────────────────────
  async function addCategory() {
    if (!insight || !categoryInput.trim()) return;
    const cat = categoryInput.trim();
    if (insight.categories.includes(cat)) { setCategoryInput(""); return; }
    const categories = [...insight.categories, cat];
    setInsight((p) => p ? { ...p, categories } : p);
    setCategoryInput("");
    await updateInsight(insight.id, { categories });
  }

  async function removeCategory(cat: string) {
    if (!insight) return;
    const categories = insight.categories.filter((c) => c !== cat);
    setInsight((p) => p ? { ...p, categories } : p);
    await updateInsight(insight.id, { categories });
  }

  // ── Re-process ────────────────────────────────────────────────────────────
  async function handleReprocess() {
    if (!insight?.transcript?.text || !user) return;
    setReprocessing(true);
    try {
      const res = await fetch("/api/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: insight.url,
          manualTranscript: insight.transcript.text,
          userId: user.uid,
        }),
      });
      if (!res.ok) throw new Error("Re-process failed");
      const data = await res.json();
      // Navigate to the newly created insight
      router.push(`/insight/${data.insightId}`);
      toast.success("Re-processed — new insight created");
    } catch {
      toast.error("Re-process failed");
    } finally {
      setReprocessing(false);
    }
  }

  // ── Render ────────────────────────────────────────────────────────────────
  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-6 h-6 border-2 border-[#00E676] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!insight) {
    return (
      <div className="max-w-4xl mx-auto">
        <Card className="p-12 text-center">
          <AlertCircle size={24} className="text-[#EF4444] mx-auto mb-3" />
          <h2 className="text-[#F5F7FA] font-semibold mb-2">Insight not found</h2>
          <Link href="/library"><Button variant="secondary" size="sm">Back to Library</Button></Link>
        </Card>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto space-y-5">
      {/* ── Header ── */}
      <div className="flex items-start gap-3">
        <Link href="/library">
          <button className="w-9 h-9 rounded-xl border border-[#1E2A36] flex items-center justify-center text-[#A7B0BC] hover:text-[#F5F7FA] hover:border-[#2E4052] transition-all flex-shrink-0 mt-0.5">
            <ArrowLeft size={16} />
          </button>
        </Link>

        <div className="flex-1 min-w-0">
          {/* Editable title */}
          {editingTitle ? (
            <div className="flex items-center gap-2">
              <input
                ref={titleRef}
                value={titleDraft}
                onChange={(e) => setTitleDraft(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") saveTitle(); if (e.key === "Escape") cancelTitle(); }}
                className="flex-1 bg-[#111821] border border-[#00E676]/40 rounded-xl px-3 py-1.5 text-[#F5F7FA] text-xl font-bold focus:outline-none"
              />
              <button onClick={saveTitle} className="w-8 h-8 rounded-lg bg-[#00E676]/10 border border-[#00E676]/20 flex items-center justify-center text-[#00E676] hover:bg-[#00E676]/20 transition-colors">
                <Check size={14} />
              </button>
              <button onClick={cancelTitle} className="w-8 h-8 rounded-lg border border-[#1E2A36] flex items-center justify-center text-[#66717F] hover:text-[#F5F7FA] transition-colors">
                <X size={14} />
              </button>
            </div>
          ) : (
            <div className="flex items-start gap-2 group/title">
              <h1 className="text-xl font-bold text-[#F5F7FA] leading-tight">{insight.title}</h1>
              <button
                onClick={startEditTitle}
                className="opacity-0 group-hover/title:opacity-100 transition-opacity mt-1 text-[#66717F] hover:text-[#A7B0BC]"
              >
                <Pencil size={14} />
              </button>
            </div>
          )}

          {/* Meta row */}
          <div className="flex items-center gap-3 mt-2 flex-wrap">
            <Badge variant="default">{getPlatformLabel(insight.platform)}</Badge>
            <span className="text-[#66717F] text-xs font-mono flex items-center gap-1">
              <Clock size={11} />{formatDate(insight.createdAt)}
            </span>
            {insight.url && !insight.url.startsWith("manual://") && (
              <a href={insight.url} target="_blank" rel="noopener noreferrer"
                className="text-[#3B82F6] text-xs flex items-center gap-1 hover:underline">
                <ExternalLink size={11} />Source
              </a>
            )}
          </div>
        </div>

        {/* Action buttons */}
        <div className="flex items-center gap-2 flex-shrink-0">
          <Badge variant="green">{Math.round(insight.confidenceScore * 100)}%</Badge>

          {/* Star */}
          <button
            onClick={toggleStar}
            title={insight.starred ? "Unstar" : "Star"}
            className={`w-8 h-8 rounded-lg border flex items-center justify-center transition-all ${
              insight.starred
                ? "bg-[#F5C542]/10 border-[#F5C542]/30 text-[#F5C542]"
                : "border-[#1E2A36] text-[#66717F] hover:text-[#F5C542] hover:border-[#F5C542]/30"
            }`}
          >
            <Star size={14} fill={insight.starred ? "currentColor" : "none"} />
          </button>

          {/* Re-process */}
          {insight.transcript?.text && (
            <button
              onClick={handleReprocess}
              disabled={reprocessing}
              title="Re-process with AI"
              className="w-8 h-8 rounded-lg border border-[#1E2A36] flex items-center justify-center text-[#66717F] hover:text-[#3B82F6] hover:border-[#3B82F6]/30 transition-all disabled:opacity-50"
            >
              {reprocessing ? <Loader2 size={14} className="animate-spin" /> : <RefreshCw size={14} />}
            </button>
          )}

          {/* Delete */}
          {confirmDelete ? (
            <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/30">
              <span className="text-[#EF4444] text-xs">Delete?</span>
              <button onClick={handleDelete} disabled={deleting} className="text-[#EF4444] hover:text-white text-xs font-semibold transition-colors">
                {deleting ? "…" : "Yes"}
              </button>
              <span className="text-[#EF4444]/50">·</span>
              <button onClick={() => setConfirmDelete(false)} className="text-[#66717F] hover:text-[#A7B0BC] text-xs transition-colors">No</button>
            </div>
          ) : (
            <button
              onClick={() => setConfirmDelete(true)}
              title="Delete insight"
              className="w-8 h-8 rounded-lg border border-[#1E2A36] flex items-center justify-center text-[#66717F] hover:text-[#EF4444] hover:border-[#EF4444]/30 transition-all"
            >
              <Trash2 size={14} />
            </button>
          )}
        </div>
      </div>

      {/* ── Thumbnail ── */}
      {insight.thumbnail && (
        <div className="relative w-full h-48 rounded-2xl overflow-hidden">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img
            src={insight.thumbnail}
            alt={insight.title}
            className="w-full h-full object-cover"
          />
          <div className="absolute inset-0 bg-gradient-to-r from-[#05070A]/70 via-transparent to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-t from-[#05070A]/60 via-transparent to-transparent" />
          {insight.duration && (
            <div className="absolute bottom-3 right-3">
              <Badge variant="muted">{insight.duration}</Badge>
            </div>
          )}
        </div>
      )}

      {/* ── Categories & Tags ── */}
      <div className="flex flex-wrap gap-4">
        {/* Categories */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[#66717F] text-xs font-mono uppercase tracking-widest">Categories</span>
          {insight.categories.map((cat) => (
            <div key={cat} className="flex items-center gap-1 group/cat">
              <Badge variant="blue">{cat}</Badge>
              <button onClick={() => removeCategory(cat)} className="opacity-0 group-hover/cat:opacity-100 text-[#66717F] hover:text-[#EF4444] transition-all">
                <X size={10} />
              </button>
            </div>
          ))}
          {editingCategories ? (
            <div className="flex items-center gap-1">
              <input
                autoFocus
                value={categoryInput}
                onChange={(e) => setCategoryInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") addCategory(); if (e.key === "Escape") setEditingCategories(false); }}
                placeholder="Add category..."
                className="bg-[#111821] border border-[#1E2A36] rounded-lg px-2 py-1 text-xs text-[#F5F7FA] focus:outline-none focus:border-[#3B82F6]/50 w-32"
              />
              <button onClick={addCategory} className="text-[#3B82F6] hover:text-[#60A5FA] transition-colors"><Check size={12} /></button>
              <button onClick={() => setEditingCategories(false)} className="text-[#66717F] hover:text-[#A7B0BC] transition-colors"><X size={12} /></button>
            </div>
          ) : (
            <button onClick={() => setEditingCategories(true)} className="text-[#66717F] hover:text-[#3B82F6] transition-colors">
              <Plus size={13} />
            </button>
          )}
        </div>

        {/* Tags */}
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-[#66717F] text-xs font-mono uppercase tracking-widest">Tags</span>
          {insight.tags.map((tag) => (
            <div key={tag} className="flex items-center gap-1 group/tag">
              <Badge variant="muted">{tag}</Badge>
              <button onClick={() => removeTag(tag)} className="opacity-0 group-hover/tag:opacity-100 text-[#66717F] hover:text-[#EF4444] transition-all">
                <X size={10} />
              </button>
            </div>
          ))}
          {editingTags ? (
            <div className="flex items-center gap-1">
              <input
                autoFocus
                value={tagInput}
                onChange={(e) => setTagInput(e.target.value)}
                onKeyDown={(e) => { if (e.key === "Enter") addTag(); if (e.key === "Escape") setEditingTags(false); }}
                placeholder="Add tag..."
                className="bg-[#111821] border border-[#1E2A36] rounded-lg px-2 py-1 text-xs text-[#F5F7FA] focus:outline-none focus:border-[#2E4052] w-28"
              />
              <button onClick={addTag} className="text-[#00E676] hover:text-[#33FF99] transition-colors"><Check size={12} /></button>
              <button onClick={() => setEditingTags(false)} className="text-[#66717F] hover:text-[#A7B0BC] transition-colors"><X size={12} /></button>
            </div>
          ) : (
            <button onClick={() => setEditingTags(true)} className="text-[#66717F] hover:text-[#00E676] transition-colors">
              <Plus size={13} />
            </button>
          )}
        </div>
      </div>

      {/* ── Split panels ── */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Left */}
        <div className="space-y-4">
          <Card className="p-5">
            <h2 className="text-[#66717F] text-xs uppercase tracking-widest font-mono mb-3">Summary</h2>
            <p className="text-[#A7B0BC] text-sm leading-relaxed">{insight.summary}</p>
          </Card>

          <Card className="p-5">
            <h2 className="text-[#66717F] text-xs uppercase tracking-widest font-mono mb-3">Key Points</h2>
            <ul className="space-y-2">
              {insight.keyPoints.map((point, i) => (
                <li key={i} className="flex items-start gap-2.5 text-sm text-[#A7B0BC]">
                  <span className="w-5 h-5 rounded-full bg-[#00E676]/10 border border-[#00E676]/20 flex items-center justify-center text-[#00E676] text-xs font-mono flex-shrink-0 mt-0.5">
                    {i + 1}
                  </span>
                  {point}
                </li>
              ))}
            </ul>
          </Card>

          <Card className="p-5">
            <h2 className="text-[#66717F] text-xs uppercase tracking-widest font-mono mb-3">Action Items</h2>
            {insight.actionItems.length === 0 ? (
              <p className="text-[#3D4D5C] text-sm">No action items extracted.</p>
            ) : (
              <div className="space-y-1.5">
                {insight.actionItems.map((action) => (
                  <button
                    key={action.id}
                    onClick={() => handleToggleAction(action.id, !action.completed)}
                    className="w-full flex items-start gap-3 text-left p-2.5 rounded-xl hover:bg-[#111821] transition-colors group"
                  >
                    {action.completed
                      ? <CheckSquare size={16} className="text-[#00E676] flex-shrink-0 mt-0.5" />
                      : <Square size={16} className="text-[#66717F] group-hover:text-[#A7B0BC] flex-shrink-0 mt-0.5" />}
                    <span className={`text-sm flex-1 ${action.completed ? "line-through text-[#66717F]" : "text-[#A7B0BC]"}`}>
                      {action.text}
                    </span>
                    <Badge variant={action.priority === "high" ? "red" : action.priority === "medium" ? "gold" : "blue"} className="ml-auto flex-shrink-0">
                      {action.priority}
                    </Badge>
                  </button>
                ))}
              </div>
            )}
          </Card>
        </div>

        {/* Right */}
        <div className="space-y-4">
          <Card className="p-5">
            <h2 className="text-[#66717F] text-xs uppercase tracking-widest font-mono mb-3">Implementation Framework</h2>
            <p className="text-[#A7B0BC] text-sm leading-relaxed whitespace-pre-line">{insight.implementationFramework}</p>
          </Card>

          {insight.toolsMentioned?.length > 0 && (
            <Card className="p-5">
              <h2 className="text-[#66717F] text-xs uppercase tracking-widest font-mono mb-3">Tools Mentioned</h2>
              <div className="flex flex-wrap gap-2">
                {insight.toolsMentioned.map((tool) => <Badge key={tool} variant="blue">{tool}</Badge>)}
              </div>
            </Card>
          )}

          <Card className="p-5">
            <h2 className="text-[#66717F] text-xs uppercase tracking-widest font-mono mb-3">Personal Relevance</h2>
            <p className="text-[#A7B0BC] text-sm leading-relaxed">{insight.personalRelevance}</p>
          </Card>

          {insight.transcript && (
            <Card className="p-5">
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2">
                  <h2 className="text-[#66717F] text-xs uppercase tracking-widest font-mono">Transcript</h2>
                  <Badge variant="muted">{insight.transcript.source}</Badge>
                  {insight.transcript.hasTimestamps && (
                    <Badge variant="green">timestamped</Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  {insight.transcript.hasTimestamps && (
                    <button
                      onClick={() => setShowTimestamps((v) => !v)}
                      className={`flex items-center gap-1 text-xs transition-colors ${
                        showTimestamps ? "text-[#00E676]" : "text-[#66717F] hover:text-[#A7B0BC]"
                      }`}
                      title="Toggle timestamps"
                    >
                      <Timer size={12} />
                      {showTimestamps ? "Hide" : "Show"}
                    </button>
                  )}
                  <button
                    onClick={copyTranscript}
                    className="flex items-center gap-1.5 text-[#66717F] hover:text-[#00E676] text-xs transition-colors"
                  >
                    <Copy size={12} />Copy
                  </button>
                </div>
              </div>
              {insight.transcript.processingWarnings?.length > 0 && (
                <div className="mb-3 p-2.5 rounded-lg bg-[#F5C542]/10 border border-[#F5C542]/20">
                  {insight.transcript.processingWarnings.map((w, i) => (
                    <p key={i} className="text-[#F5C542] text-xs">{w}</p>
                  ))}
                </div>
              )}
              <div className="max-h-52 overflow-y-auto">
                {insight.transcript.hasTimestamps && showTimestamps ? (
                  <div className="space-y-1">
                    {insight.transcript.text.split("\n").map((line, i) => {
                      const match = line.match(/^(\[\d+:\d+(?::\d+)?\])\s*(.*)/);
                      if (!match) return null;
                      return (
                        <div key={i} className="flex gap-2 text-xs font-mono">
                          <span className="text-[#00E676]/60 flex-shrink-0 w-14 text-right">{match[1]}</span>
                          <span className="text-[#66717F]">{match[2]}</span>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <p className="text-[#66717F] text-xs leading-relaxed font-mono whitespace-pre-wrap">
                    {insight.transcript.hasTimestamps
                      ? stripTimestamps(insight.transcript.text)
                      : insight.transcript.text}
                  </p>
                )}
              </div>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
}
