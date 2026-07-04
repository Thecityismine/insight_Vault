"use client";
import { useState, useEffect, useRef } from "react";
import { X, Link2, Loader2, ArrowRight } from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { createInsight } from "@/lib/firestore";
import toast from "react-hot-toast";

interface QuickAddModalProps {
  open: boolean;
  onClose: () => void;
}

export function QuickAddModal({ open, onClose }: QuickAddModalProps) {
  const { user } = useAuth();
  const router = useRouter();
  const inputRef = useRef<HTMLInputElement>(null);
  const [url, setUrl] = useState("");
  const [processing, setProcessing] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (open) {
      setUrl("");
      setError("");
      setProcessing(false);
      setTimeout(() => inputRef.current?.focus(), 60);
    }
  }, [open]);

  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    if (open) document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, [open, onClose]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!url.trim() || !user || processing) return;
    setProcessing(true);
    setError("");
    try {
      const res = await fetch("/api/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ url: url.trim() }),
      });
      if (res.status === 422) {
        setError("Couldn't fetch transcript — paste it manually on the Add Link page.");
        setProcessing(false);
        return;
      }
      if (!res.ok) throw new Error("Processing failed");
      const data = await res.json();
      const insightId = await createInsight({ userId: user.uid, ...data.insight });
      onClose();
      toast.success("Insight saved");
      router.push(`/insight/${insightId}`);
    } catch {
      setError("Processing failed. Check the URL and try again.");
      setProcessing(false);
    }
  }

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-start justify-center pt-[18vh] px-4">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-sm" onClick={onClose} />
      <div className="relative w-full max-w-lg bg-[#0B0F14] border border-[#2E4052] rounded-2xl shadow-2xl shadow-black/50 overflow-hidden">
        {/* Header */}
        <div className="flex items-center gap-3 px-4 py-3 border-b border-[#1E2A36]">
          <Link2 size={14} className="text-[#00E676]" />
          <span className="text-[#66717F] text-xs font-mono tracking-widest">QUICK PROCESS</span>
          <div className="ml-auto flex items-center gap-3">
            <kbd className="text-[#3D4D5C] text-[10px] font-mono border border-[#1E2A36] rounded px-1.5 py-0.5">ESC</kbd>
            <button onClick={onClose} className="text-[#66717F] hover:text-[#A7B0BC] transition-colors">
              <X size={14} />
            </button>
          </div>
        </div>

        {/* Input */}
        <form onSubmit={handleSubmit} className="p-4">
          <div className="flex items-center gap-3 bg-[#111821] border border-[#1E2A36] rounded-xl px-4 py-3 focus-within:border-[#00E676]/40 transition-colors">
            <input
              ref={inputRef}
              type="text"
              value={url}
              onChange={(e) => { setUrl(e.target.value); setError(""); }}
              placeholder="Paste a YouTube, TikTok, or podcast URL..."
              className="flex-1 bg-transparent text-sm text-[#F5F7FA] placeholder:text-[#3D4D5C] focus:outline-none"
              disabled={processing}
            />
            <button
              type="submit"
              disabled={!url.trim() || processing}
              className="w-8 h-8 rounded-lg bg-[#00E676]/10 border border-[#00E676]/20 flex items-center justify-center text-[#00E676] hover:bg-[#00E676]/20 transition-all disabled:opacity-40 flex-shrink-0"
            >
              {processing
                ? <Loader2 size={14} className="animate-spin" />
                : <ArrowRight size={14} />}
            </button>
          </div>
          {processing && (
            <p className="text-[#66717F] text-xs mt-2.5 px-1 font-mono animate-pulse">
              Fetching transcript + extracting insights...
            </p>
          )}
          {error && (
            <p className="text-red-400 text-xs mt-2.5 px-1">{error}</p>
          )}
        </form>

        {/* Footer hints */}
        <div className="px-4 pb-4 flex items-center gap-2 flex-wrap">
          {["YouTube", "TikTok", "X Spaces", "Podcast"].map((p) => (
            <span key={p} className="text-[10px] font-mono text-[#3D4D5C] border border-[#1E2A36] rounded-lg px-2 py-1">
              {p}
            </span>
          ))}
          <a
            href="/add-link"
            onClick={onClose}
            className="ml-auto text-[10px] font-mono text-[#3D4D5C] hover:text-[#66717F] transition-colors"
          >
            Paste transcript →
          </a>
        </div>
      </div>
    </div>
  );
}
