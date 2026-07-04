"use client";
import { Search, LogOut } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/auth";
import toast from "react-hot-toast";

interface TopBarProps {
  onSearch?: (query: string) => void;
}

export function TopBar({ onSearch }: TopBarProps) {
  const { user, signOut } = useAuth();
  const router = useRouter();

  async function handleSignOut() {
    await signOut();
    toast.success("Signed out");
  }

  return (
    <header className="h-14 flex items-center justify-between px-6 border-b border-[#1E2A36] bg-[#0B0F14]/80 backdrop-blur-sm sticky top-0 z-10">
      <div className="relative w-72">
        <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#66717F]" />
        <input
          type="text"
          placeholder="Search insights..."
          onChange={(e) => onSearch?.(e.target.value)}
          className="w-full bg-[#111821] border border-[#1E2A36] rounded-xl pl-9 pr-4 py-2 text-sm text-[#F5F7FA] placeholder:text-[#66717F] focus:outline-none focus:border-[#2E4052] transition-colors"
        />
      </div>

      <div className="flex items-center gap-3">
        <Link href="/add-link">
          <Button size="sm">Process New Link</Button>
        </Link>

        {user && (
          <div className="flex items-center gap-2">
            <div className="text-right hidden sm:block">
              <p className="text-[#F5F7FA] text-xs font-medium leading-none">
                {user.displayName ?? user.email?.split("@")[0]}
              </p>
              <p className="text-[#66717F] text-xs font-mono mt-0.5 leading-none">
                {user.email}
              </p>
            </div>
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00E676]/20 to-[#3B82F6]/20 border border-[#1E2A36] flex items-center justify-center text-[#00E676] text-xs font-bold font-mono">
              {(user.displayName ?? user.email ?? "?")[0].toUpperCase()}
            </div>
            <button
              onClick={handleSignOut}
              title="Sign out"
              className="w-8 h-8 rounded-lg border border-[#1E2A36] bg-[#111821] flex items-center justify-center text-[#66717F] hover:text-[#EF4444] hover:border-[#EF4444]/30 transition-all"
            >
              <LogOut size={14} />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
