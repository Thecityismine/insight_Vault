"use client";
import { Card } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Badge } from "@/components/ui/Badge";

export default function SettingsPage() {
  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#F5F7FA] tracking-tight">
          Settings
        </h1>
        <p className="text-[#66717F] text-sm mt-1">
          Configure your Insight Terminal.
        </p>
      </div>

      {/* API Keys */}
      <Card className="p-6">
        <h2 className="text-[#F5F7FA] font-semibold text-sm mb-4 flex items-center gap-2">
          API Configuration
        </h2>
        <div className="space-y-4">
          <div>
            <label className="text-[#66717F] text-xs uppercase tracking-widest font-mono block mb-1.5">
              OpenAI API Key
            </label>
            <input
              type="password"
              placeholder="sk-..."
              className="w-full bg-[#0B0F14] border border-[#1E2A36] rounded-xl px-4 py-2.5 text-sm text-[#F5F7FA] placeholder:text-[#66717F] focus:outline-none focus:border-[#2E4052] transition-colors font-mono"
            />
            <p className="text-[#66717F] text-xs mt-1">
              Used for AI insight extraction and Whisper audio transcription.
            </p>
          </div>
        </div>
      </Card>

      {/* Processing preferences */}
      <Card className="p-6">
        <h2 className="text-[#F5F7FA] font-semibold text-sm mb-4">
          Processing Preferences
        </h2>
        <div className="space-y-4">
          {[
            {
              label: "Auto-categorize insights",
              desc: "Use AI to automatically assign categories",
              enabled: true,
            },
            {
              label: "Extract action items",
              desc: "Identify and save tasks from transcripts",
              enabled: true,
            },
            {
              label: "Audio transcription fallback",
              desc: "Use Whisper when captions are unavailable",
              enabled: true,
            },
          ].map(({ label, desc, enabled }) => (
            <div key={label} className="flex items-center justify-between">
              <div>
                <p className="text-[#F5F7FA] text-sm">{label}</p>
                <p className="text-[#66717F] text-xs mt-0.5">{desc}</p>
              </div>
              <div
                className={`w-10 h-5 rounded-full transition-colors cursor-pointer flex items-center ${
                  enabled ? "bg-[#00E676]/30" : "bg-[#1E2A36]"
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full transition-transform mx-0.5 ${
                    enabled
                      ? "bg-[#00E676] translate-x-5"
                      : "bg-[#66717F] translate-x-0"
                  }`}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* App info */}
      <Card className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[#F5F7FA] text-sm font-semibold">
              Insight Terminal
            </p>
            <p className="text-[#66717F] text-xs font-mono mt-0.5">v1.0.0</p>
          </div>
          <Badge variant="green">Active</Badge>
        </div>
      </Card>
    </div>
  );
}
