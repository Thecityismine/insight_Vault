"use client";
import { useState } from "react";
import { Terminal, Loader2, AlertCircle, Eye, EyeOff } from "lucide-react";
import { useAuth } from "@/lib/auth";
import { Button } from "@/components/ui/Button";

export function LoginView() {
  const { signIn } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await signIn(email, password);
    } catch (err: unknown) {
      const code = (err as { code?: string })?.code ?? "";
      if (code === "auth/invalid-credential" || code === "auth/wrong-password" || code === "auth/user-not-found") {
        setError("Invalid email or password.");
      } else if (code === "auth/too-many-requests") {
        setError("Too many attempts. Try again later.");
      } else {
        setError("Sign-in failed. Check your credentials.");
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#05070A] flex items-center justify-center px-4">
      {/* Background grid */}
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(#00E676 1px, transparent 1px), linear-gradient(90deg, #00E676 1px, transparent 1px)",
          backgroundSize: "40px 40px",
        }}
      />

      <div className="relative w-full max-w-sm">
        {/* Logo */}
        <div className="flex flex-col items-center mb-8">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#00E676] to-[#00BFA5] flex items-center justify-center mb-4 shadow-[0_0_30px_rgba(0,230,118,0.3)]">
            <Terminal size={22} className="text-[#03100A]" />
          </div>
          <h1 className="text-xl font-bold text-[#F5F7FA] tracking-tight">
            Insight Terminal
          </h1>
          <p className="text-[#66717F] text-xs font-mono tracking-widest mt-1">
            PRIVATE INTELLIGENCE DASHBOARD
          </p>
        </div>

        {/* Form card */}
        <div className="bg-gradient-to-b from-[#111821] to-[#0B0F14] border border-[#1E2A36] rounded-2xl p-6 shadow-[0_20px_60px_rgba(0,0,0,0.5)]">
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="space-y-1.5">
              <label className="text-[#66717F] text-xs uppercase tracking-widest font-mono">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@example.com"
                required
                autoFocus
                className="w-full bg-[#0B0F14] border border-[#1E2A36] rounded-xl px-4 py-3 text-sm text-[#F5F7FA] placeholder:text-[#66717F] focus:outline-none focus:border-[#00E676]/50 focus:ring-1 focus:ring-[#00E676]/20 transition-all"
              />
            </div>

            <div className="space-y-1.5">
              <label className="text-[#66717F] text-xs uppercase tracking-widest font-mono">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full bg-[#0B0F14] border border-[#1E2A36] rounded-xl px-4 py-3 pr-10 text-sm text-[#F5F7FA] placeholder:text-[#66717F] focus:outline-none focus:border-[#00E676]/50 focus:ring-1 focus:ring-[#00E676]/20 transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-[#66717F] hover:text-[#A7B0BC] transition-colors"
                >
                  {showPassword ? <EyeOff size={15} /> : <Eye size={15} />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 p-3 rounded-xl bg-[#EF4444]/10 border border-[#EF4444]/20">
                <AlertCircle size={14} className="text-[#EF4444] flex-shrink-0" />
                <p className="text-[#EF4444] text-xs">{error}</p>
              </div>
            )}

            <Button
              type="submit"
              disabled={loading || !email || !password}
              size="lg"
              className="w-full mt-2"
            >
              {loading && <Loader2 size={15} className="animate-spin" />}
              {loading ? "Signing in..." : "Sign In"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  );
}
