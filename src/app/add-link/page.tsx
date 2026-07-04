"use client";
import { useState } from "react";
import { Link2, Loader2, AlertCircle, CheckCircle, ChevronDown } from "lucide-react";
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

const PLATFORM_PLACEHOLDERS: Record<string, string> = {
  youtube: "https://www.youtube.com/watch?v=...",
  tiktok: "https://www.tiktok.com/@.../video/...",
  x_spaces: "https://twitter.com/i/spaces/...",
  podcast: "https://open.spotify.com/episode/...",
};

export default function AddLinkPage() {
  const [url, setUrl] = useState("");
  const [step, setStep] = useState<Step>("idle");
  const [detected, setDetected] = useState<string | null>(null);
  const [error, setError] = useState("");
  const [manualTranscript, setManualTranscript] = useState("");
  const [showManual, setShowManual] = useState(false);

  function handleUrlChange(val: string) {
    setUrl(val);
    if (val.trim()) {
      const meta = parseLink(val.trim());
      setDetected(meta.platform);
    } else {
      setDetected(null);
    }
  }

  async function handleProcess() {
    if (!url.trim()) return;
    setStep("detecting");
    setError("");

    try {
      setStep("fetching_transcript");
      const res = await fetch("/api/process", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          url: url.trim(),
          manualTranscript: manualTranscript || undefined,
        }),
      });

      if (!res.ok) {
        const data = await res.json();
        if (data.needsManualTranscript) {
          setStep("needs_manual");
          return;
        }
        throw new Error(data.error ?? "Processing failed");
      }

      setStep("processing_ai");
      const data = await res.json();
      setStep("done");

      // Navigate to insight
      setTimeout(() => {
        window.location.href = `/insight/${data.insightId}`;
      }, 1000);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unknown error");
      setStep("error");
    }
  }

  const isProcessing = ["detecting", "fetching_transcript", "processing_ai"].includes(step);

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#F5F7FA] tracking-tight">
          Process New Link
        </h1>
        <p className="text-[#66717F] text-sm mt-1">
          Paste a YouTube, TikTok, X Space, or podcast link to extract insights.
        </p>
      </div>

      <Card className="p-6">
        {/* URL Input */}
        <div className="space-y-3">
          <label className="text-[#66717F] text-xs uppercase tracking-widest font-mono">
            Link URL
          </label>
          <div className="relative">
            <Link2
              size={16}
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

        {/* Manual transcript toggle */}
        <div className="mt-4">
          <button
            onClick={() => setShowManual(!showManual)}
            className="flex items-center gap-2 text-[#66717F] text-xs hover:text-[#A7B0BC] transition-colors"
          >
            <ChevronDown
              size={14}
              className={`transition-transform ${showManual ? "rotate-180" : ""}`}
            />
            Paste transcript manually (backup)
          </button>
          {showManual && (
            <textarea
              value={manualTranscript}
              onChange={(e) => setManualTranscript(e.target.value)}
              placeholder="Paste the transcript text here if automatic extraction fails..."
              rows={6}
              className="mt-3 w-full bg-[#0B0F14] border border-[#1E2A36] rounded-xl px-4 py-3 text-sm text-[#F5F7FA] placeholder:text-[#66717F] focus:outline-none focus:border-[#2E4052] transition-all resize-none font-mono"
            />
          )}
        </div>

        {/* Process button */}
        <div className="mt-5">
          <Button
            onClick={handleProcess}
            disabled={!url.trim() || isProcessing || step === "done"}
            size="lg"
            className="w-full"
          >
            {isProcessing && <Loader2 size={16} className="animate-spin" />}
            {step === "idle" && "Process Insight"}
            {step === "detecting" && "Detecting platform..."}
            {step === "fetching_transcript" && "Fetching transcript..."}
            {step === "processing_ai" && "Extracting insights with AI..."}
            {step === "done" && "Done! Redirecting..."}
            {step === "error" && "Try Again"}
            {step === "needs_manual" && "Paste Transcript Below"}
          </Button>
        </div>

        {/* Status messages */}
        {step === "needs_manual" && (
          <div className="mt-4 flex items-start gap-3 p-3 rounded-xl bg-[#F5C542]/10 border border-[#F5C542]/20">
            <AlertCircle size={16} className="text-[#F5C542] flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-[#F5C542] text-sm font-medium">
                Automatic transcript unavailable
              </p>
              <p className="text-[#A7B0BC] text-xs mt-1">
                Please paste the transcript manually above, then click Process again.
              </p>
            </div>
          </div>
        )}

        {step === "error" && error && (
          <div className="mt-4 flex items-start gap-3 p-3 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/20">
            <AlertCircle size={16} className="text-[#EF4444] flex-shrink-0 mt-0.5" />
            <p className="text-[#EF4444] text-sm">{error}</p>
          </div>
        )}

        {step === "done" && (
          <div className="mt-4 flex items-center gap-3 p-3 rounded-xl bg-[#00E676]/10 border border-[#00E676]/20">
            <CheckCircle size={16} className="text-[#00E676]" />
            <p className="text-[#00E676] text-sm font-medium">
              Insight processed successfully!
            </p>
          </div>
        )}
      </Card>

      {/* Fallback chain info */}
      <Card className="p-5">
        <p className="text-[#66717F] text-xs uppercase tracking-widest font-mono mb-3">
          Transcript Fallback Chain
        </p>
        <div className="space-y-2">
          {[
            { step: "1", label: "YouTube official captions", source: "youtube_public_captions" },
            { step: "2", label: "Third-party transcript service", source: "third_party_transcript" },
            { step: "3", label: "Audio extraction + Whisper AI", source: "audio_transcription" },
            { step: "4", label: "Manual transcript paste", source: "manual_paste" },
          ].map((item) => (
            <div key={item.step} className="flex items-center gap-3 text-sm">
              <span className="w-5 h-5 rounded-full bg-[#1E2A36] text-[#66717F] text-xs flex items-center justify-center font-mono flex-shrink-0">
                {item.step}
              </span>
              <span className="text-[#A7B0BC]">{item.label}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
