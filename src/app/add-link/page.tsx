"use client";
import { useState, useRef } from "react";
import { useAuth } from "@/lib/auth";
import {
  Link2,
  Loader2,
  AlertCircle,
  CheckCircle,
  ClipboardPaste,
  X,
  FileText,
} from "lucide-react";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";
import { parseLink } from "@/lib/transcript/platform";
import { getPlatformLabel } from "@/lib/utils";

type Step =
  | "idle"
  | "detecting"
  | "fetching_transcript"
  | "processing_ai"
  | "done"
  | "error"
  | "needs_manual";

type Mode = "link" | "transcript";

function wordCount(text: string) {
  return text.trim() === "" ? 0 : text.trim().split(/\s+/).length;
}

export default function AddLinkPage() {
  const { user } = useAuth();
  const [mode, setMode] = useState<Mode>("link");
  const [url, setUrl] = useState("");
  const [detected, setDetected] = useState<string | null>(null);
  const [step, setStep] = useState<Step>("idle");
  const [error, setError] = useState("");
  const [transcript, setTranscript] = useState("");
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  function handleUrlChange(val: string) {
    setUrl(val);
    setDetected(val.trim() ? parseLink(val.trim()).platform : null);
  }

  function handleClearTranscript() {
    setTranscript("");
    textareaRef.current?.focus();
  }

  async function handleProcess() {
    const hasUrl = url.trim().length > 0;
    const hasTranscript = transcript.trim().length > 0;

    if (mode === "link" && !hasUrl) return;
    if (mode === "transcript" && !hasTranscript) return;

    setStep("detecting");
    setError("");

    try {
      setStep("fetching_transcript");
      const body: Record<string, string> = {};
      if (hasUrl) body.url = url.trim();
      if (hasTranscript) body.manualTranscript = transcript.trim();
      if (!hasUrl) body.url = "manual://transcript";
      if (user) body.userId = user.uid;

      const res = await fetch("/api/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });

      if (!res.ok) {
        const data = await res.json();
        if (data.needsManualTranscript) {
          setStep("needs_manual");
          setMode("transcript");
          return;
        }
        throw new Error(data.error ?? "Processing failed");
      }

      setStep("processing_ai");
      const data = await res.json();
      setStep("done");

      setTimeout(() => {
        window.location.href = `/insight/${data.insightId}`;
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setStep("error");
    }
  }

  const isProcessing = ["detecting", "fetching_transcript", "processing_ai"].includes(step);
  const words = wordCount(transcript);
  const chars = transcript.length;

  const canProcess =
    !isProcessing &&
    step !== "done" &&
    (mode === "link" ? url.trim().length > 0 : transcript.trim().length > 0);

  return (
    <div className="max-w-2xl mx-auto space-y-5">
      <div>
        <h1 className="text-2xl font-bold text-[#F5F7FA] tracking-tight">
          Process New Insight
        </h1>
        <p className="text-[#66717F] text-sm mt-1">
          Paste a link for automatic extraction, or paste a transcript directly.
        </p>
      </div>

      {/* Mode tabs */}
      <div className="flex gap-1 bg-[#0B0F14] border border-[#1E2A36] rounded-xl p-1 w-fit">
        <button
          onClick={() => { setMode("link"); setStep("idle"); setError(""); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            mode === "link"
              ? "bg-[#111821] text-[#F5F7FA] border border-[#2E4052]"
              : "text-[#66717F] hover:text-[#A7B0BC]"
          }`}
        >
          <Link2 size={14} />
          Process Link
        </button>
        <button
          onClick={() => { setMode("transcript"); setStep("idle"); setError(""); }}
          className={`flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-all ${
            mode === "transcript"
              ? "bg-[#111821] text-[#F5F7FA] border border-[#2E4052]"
              : "text-[#66717F] hover:text-[#A7B0BC]"
          }`}
        >
          <ClipboardPaste size={14} />
          Paste Transcript
        </button>
      </div>

      <Card className="p-6 space-y-5">
        {/* URL field — always shown in link mode, optional in transcript mode */}
        {mode === "link" && (
          <div className="space-y-2">
            <label className="text-[#66717F] text-xs uppercase tracking-widest font-mono">
              Link URL
            </label>
            <div className="relative">
              <Link2
                size={15}
                className="absolute left-4 top-1/2 -translate-y-1/2 text-[#66717F]"
              />
              <input
                type="url"
                value={url}
                onChange={(e) => handleUrlChange(e.target.value)}
                placeholder="Paste a YouTube, TikTok, X Space, or podcast link..."
                disabled={isProcessing}
                className="w-full bg-[#0B0F14] border border-[#1E2A36] rounded-xl pl-11 pr-4 py-3.5 text-sm text-[#F5F7FA] placeholder:text-[#66717F] focus:outline-none focus:border-[#00E676]/50 focus:ring-1 focus:ring-[#00E676]/20 transition-all disabled:opacity-50"
              />
            </div>
            {detected && (
              <div className="flex items-center gap-2">
                <span className="text-[#66717F] text-xs">Detected:</span>
                <Badge variant="green">{getPlatformLabel(detected)}</Badge>
              </div>
            )}
          </div>
        )}

        {/* Transcript paste area */}
        {mode === "transcript" && (
          <div className="space-y-2">
            {/* Optional URL in transcript mode */}
            <div className="space-y-1.5">
              <label className="text-[#66717F] text-xs uppercase tracking-widest font-mono">
                Source URL{" "}
                <span className="normal-case tracking-normal lowercase font-sans text-[#3D4D5C]">
                  — optional, for reference
                </span>
              </label>
              <div className="relative">
                <Link2
                  size={15}
                  className="absolute left-4 top-1/2 -translate-y-1/2 text-[#66717F]"
                />
                <input
                  type="url"
                  value={url}
                  onChange={(e) => handleUrlChange(e.target.value)}
                  placeholder="https://youtube.com/watch?v=... (optional)"
                  disabled={isProcessing}
                  className="w-full bg-[#0B0F14] border border-[#1E2A36] rounded-xl pl-11 pr-4 py-2.5 text-sm text-[#F5F7FA] placeholder:text-[#66717F] focus:outline-none focus:border-[#2E4052] transition-all disabled:opacity-50"
                />
              </div>
            </div>

            {/* Large transcript area */}
            <div className="space-y-1.5 pt-1">
              <div className="flex items-center justify-between">
                <label className="text-[#66717F] text-xs uppercase tracking-widest font-mono flex items-center gap-2">
                  <FileText size={12} />
                  Transcript
                </label>
                {transcript.length > 0 && (
                  <button
                    onClick={handleClearTranscript}
                    className="flex items-center gap-1 text-[#66717F] hover:text-[#EF4444] text-xs transition-colors"
                  >
                    <X size={12} />
                    Clear
                  </button>
                )}
              </div>

              <div className="relative">
                <textarea
                  ref={textareaRef}
                  value={transcript}
                  onChange={(e) => setTranscript(e.target.value)}
                  placeholder={`Paste the full transcript here.\n\nYou can get it from:\n• YouTube → "..." menu → Show transcript → Copy all\n• Any transcript tool\n• Your own notes`}
                  disabled={isProcessing}
                  className="w-full bg-[#0B0F14] border border-[#1E2A36] rounded-xl px-4 py-3.5 text-sm text-[#F5F7FA] placeholder:text-[#3D4D5C] focus:outline-none focus:border-[#00E676]/40 focus:ring-1 focus:ring-[#00E676]/10 transition-all disabled:opacity-50 resize-y font-mono leading-relaxed"
                  style={{ minHeight: "320px", maxHeight: "70vh" }}
                />
              </div>

              {/* Stats bar */}
              <div className="flex items-center justify-between text-xs font-mono">
                <div className="flex items-center gap-4 text-[#3D4D5C]">
                  <span className={words > 0 ? "text-[#66717F]" : ""}>
                    {words.toLocaleString()} words
                  </span>
                  <span className={chars > 0 ? "text-[#66717F]" : ""}>
                    {chars.toLocaleString()} chars
                  </span>
                </div>
                {words > 500 && (
                  <Badge variant="green">Good length</Badge>
                )}
                {words > 0 && words < 100 && (
                  <Badge variant="gold">Short — may limit insight quality</Badge>
                )}
              </div>
            </div>
          </div>
        )}

        {/* Process button */}
        <Button
          onClick={handleProcess}
          disabled={!canProcess}
          size="lg"
          className="w-full"
        >
          {isProcessing && <Loader2 size={16} className="animate-spin" />}
          {step === "idle" && (mode === "transcript" ? "Extract Insights from Transcript" : "Process Insight")}
          {step === "detecting" && "Detecting platform..."}
          {step === "fetching_transcript" && "Fetching transcript..."}
          {step === "processing_ai" && "Extracting insights with AI..."}
          {step === "done" && "Done! Redirecting..."}
          {(step === "error" || step === "needs_manual") && "Try Again"}
        </Button>

        {/* Status banners */}
        {step === "needs_manual" && (
          <div className="flex items-start gap-3 p-3 rounded-xl bg-[#F5C542]/10 border border-[#F5C542]/20">
            <AlertCircle size={16} className="text-[#F5C542] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-[#F5C542] text-sm font-medium">
                Automatic transcript unavailable
              </p>
              <p className="text-[#A7B0BC] text-xs mt-0.5">
                Switch to the Paste Transcript tab and paste it manually.
              </p>
            </div>
          </div>
        )}

        {step === "error" && error && (
          <div className="flex items-start gap-3 p-3 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/20">
            <AlertCircle size={16} className="text-[#EF4444] flex-shrink-0 mt-0.5" />
            <p className="text-[#EF4444] text-sm">{error}</p>
          </div>
        )}

        {step === "done" && (
          <div className="flex items-center gap-3 p-3 rounded-xl bg-[#00E676]/10 border border-[#00E676]/20">
            <CheckCircle size={16} className="text-[#00E676]" />
            <p className="text-[#00E676] text-sm font-medium">
              Insight processed — redirecting...
            </p>
          </div>
        )}
      </Card>

      {/* Fallback chain info — only in link mode */}
      {mode === "link" && (
        <Card className="p-5">
          <p className="text-[#66717F] text-xs uppercase tracking-widest font-mono mb-3">
            Auto Fallback Chain
          </p>
          <div className="space-y-2">
            {[
              "YouTube official captions",
              "Third-party transcript service",
              "Audio extraction + Whisper AI",
              "Manual transcript paste (this tab)",
            ].map((label, i) => (
              <div key={i} className="flex items-center gap-3 text-sm">
                <span className="w-5 h-5 rounded-full bg-[#1E2A36] text-[#66717F] text-xs flex items-center justify-center font-mono flex-shrink-0">
                  {i + 1}
                </span>
                <span className="text-[#A7B0BC]">{label}</span>
              </div>
            ))}
          </div>
        </Card>
      )}
    </div>
  );
}
