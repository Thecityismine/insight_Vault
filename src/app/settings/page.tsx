"use client";
import { useEffect, useState } from "react";
import { Card } from "@/components/ui/Card";
import { Badge } from "@/components/ui/Badge";
import { useAuth } from "@/lib/auth";
import { getUserSettings, saveUserSettings } from "@/lib/firestore";
import type { UserSettings } from "@/lib/firestore";
import { Loader2, Check } from "lucide-react";
import toast from "react-hot-toast";

function Toggle({ on, onChange }: { on: boolean; onChange: (v: boolean) => void }) {
  return (
    <button
      onClick={() => onChange(!on)}
      className={`relative w-11 h-6 rounded-full transition-colors flex-shrink-0 ${
        on ? "bg-[#00E676]/30" : "bg-[#1E2A36]"
      }`}
    >
      <div
        className={`absolute top-1 w-4 h-4 rounded-full transition-all ${
          on
            ? "left-[calc(100%-1.25rem)] bg-[#00E676]"
            : "left-1 bg-[#66717F]"
        }`}
      />
    </button>
  );
}

const PREFERENCES: Array<{
  key: keyof UserSettings;
  label: string;
  desc: string;
}> = [
  {
    key: "autoCategories",
    label: "Auto-categorize insights",
    desc: "Use AI to automatically assign categories based on content",
  },
  {
    key: "extractActionItems",
    label: "Extract action items",
    desc: "Identify and save actionable tasks from transcripts",
  },
  {
    key: "audioTranscription",
    label: "Audio transcription fallback",
    desc: "Use Whisper when captions are unavailable",
  },
  {
    key: "stripFillerWords",
    label: "Strip filler words",
    desc: "Remove um, uh, you know, etc. before AI processing",
  },
];

export default function SettingsPage() {
  const { user } = useAuth();
  const [settings, setSettings] = useState<UserSettings | null>(null);
  const [saving, setSaving] = useState<keyof UserSettings | null>(null);

  useEffect(() => {
    if (!user) return;
    getUserSettings(user.uid).then(setSettings);
  }, [user]);

  async function handleToggle(key: keyof UserSettings, value: boolean) {
    if (!user || !settings) return;
    const updated = { ...settings, [key]: value };
    setSettings(updated);
    setSaving(key);
    try {
      await saveUserSettings(user.uid, { [key]: value });
      toast.success("Saved");
    } catch {
      setSettings(settings);
      toast.error("Failed to save");
    } finally {
      setSaving(null);
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-[#F5F7FA] tracking-tight">Settings</h1>
        <p className="text-[#66717F] text-sm mt-1">Configure your Insight Terminal.</p>
      </div>

      {/* Processing Preferences */}
      <Card className="p-6">
        <h2 className="text-[#F5F7FA] font-semibold text-sm mb-4">Processing Preferences</h2>
        {!settings ? (
          <div className="flex items-center gap-2 text-[#66717F] text-sm py-2">
            <Loader2 size={14} className="animate-spin" />
            Loading...
          </div>
        ) : (
          <div className="space-y-5">
            {PREFERENCES.map(({ key, label, desc }) => (
              <div key={key} className="flex items-center justify-between gap-4">
                <div className="min-w-0">
                  <div className="flex items-center gap-2">
                    <p className="text-[#F5F7FA] text-sm">{label}</p>
                    {saving === key && (
                      <Check size={12} className="text-[#00E676] animate-pulse" />
                    )}
                  </div>
                  <p className="text-[#66717F] text-xs mt-0.5">{desc}</p>
                </div>
                <Toggle
                  on={settings[key]}
                  onChange={(v) => handleToggle(key, v)}
                />
              </div>
            ))}
          </div>
        )}
      </Card>

      {/* API info */}
      <Card className="p-6">
        <h2 className="text-[#F5F7FA] font-semibold text-sm mb-4">API Configuration</h2>
        <div className="space-y-3">
          <div className="flex items-center justify-between py-2 border-b border-[#1E2A36]">
            <div>
              <p className="text-[#F5F7FA] text-sm">OpenAI API Key</p>
              <p className="text-[#66717F] text-xs mt-0.5">Stored securely in Vercel environment variables</p>
            </div>
            <Badge variant="green">Active</Badge>
          </div>
          <div className="flex items-center justify-between py-2">
            <div>
              <p className="text-[#F5F7FA] text-sm">Firebase Project</p>
              <p className="text-[#66717F] text-xs font-mono mt-0.5">insight-vault-371e3</p>
            </div>
            <Badge variant="green">Connected</Badge>
          </div>
        </div>
      </Card>

      {/* App info */}
      <Card className="p-5">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-[#F5F7FA] text-sm font-semibold">Insight Terminal</p>
            <p className="text-[#66717F] text-xs font-mono mt-0.5">v1.0.0 — Phase 5</p>
          </div>
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-[#00E676] animate-pulse" />
            <Badge variant="green">Active</Badge>
          </div>
        </div>
      </Card>
    </div>
  );
}
