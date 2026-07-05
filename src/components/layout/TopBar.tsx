"use client";
import { Menu, LogOut, Plus } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";
import { useAuth } from "@/lib/auth";
import toast from "react-hot-toast";

interface TopBarProps {
  onSearch?: (query: string) => void;
  onMenuToggle: () => void;
  onQuickAdd: () => void;
}

export function TopBar({ onMenuToggle, onQuickAdd }: TopBarProps) {
  const { user, signOut } = useAuth();

  async function handleSignOut() {
    await signOut();
    toast.success("Signed out");
  }

  return (
    <header className="h-14 flex items-center gap-3 px-4 md:px-6 border-b border-[#1E2A36] bg-[#0B0F14]/80 backdrop-blur-sm sticky top-0 z-10 flex-shrink-0">
      {/* Hamburger — mobile only */}
      <button
        onClick={onMenuToggle}
        className="md:hidden text-[#66717F] hover:text-[#F5F7FA] transition-colors p-1 -ml-1"
        aria-label="Open menu"
      >
        <Menu size={20} />
      </button>

      {/* Search hint — desktop only, opens Cmd+K modal */}
      <button
        onClick={onQuickAdd}
        className="hidden md:flex items-center gap-3 w-72 bg-[#111821] border border-[#1E2A36] rounded-xl px-3 py-2 text-sm text-[#3D4D5C] hover:border-[#2E4052] hover:text-[#66717F] transition-colors group"
      >
        <span className="flex-1 text-left">Quick process a link...</span>
        <kbd className="text-[10px] font-mono border border-[#1E2A36] group-hover:border-[#2E4052] rounded px-1.5 py-0.5 transition-colors">⌘K</kbd>
      </button>

      <div className="flex-1" />

      {/* Right side actions */}
      <div className="flex items-center gap-2">
        {/* Mobile: icon-only add button */}
        <button
          onClick={onQuickAdd}
          className="md:hidden w-9 h-9 rounded-xl bg-[#00E676]/10 border border-[#00E676]/20 flex items-center justify-center text-[#00E676] hover:bg-[#00E676]/20 transition-colors"
          aria-label="Process link"
        >
          <Plus size={16} />
        </button>

        {/* Desktop: full button */}
        <div className="hidden md:block">
          <Link href="/add-link">
            <Button size="sm">Process New Link</Button>
          </Link>
        </div>

        {/* User avatar + sign out */}
        {user && (
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00E676]/20 to-[#3B82F6]/20 border border-[#1E2A36] flex items-center justify-center text-[#00E676] text-xs font-bold font-mono flex-shrink-0">
              {(user.displayName ?? user.email ?? "?")[0].toUpperCase()}
            </div>
            <button
              onClick={handleSignOut}
              title="Sign out"
              className="w-8 h-8 rounded-lg border border-[#1E2A36] bg-[#111821] flex items-center justify-center text-[#66717F] hover:text-[#EF4444] hover:border-[#EF4444]/30 transition-all flex-shrink-0"
            >
              <LogOut size={14} />
            </button>
          </div>
        )}
      </div>
    </header>
  );
}
