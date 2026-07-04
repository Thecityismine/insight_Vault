"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Plus,
  Library,
  Zap,
  Tag,
  Settings,
  Terminal,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { href: "/", label: "Dashboard", icon: LayoutDashboard },
  { href: "/add-link", label: "Add Link", icon: Plus },
  { href: "/library", label: "Library", icon: Library },
  { href: "/action-board", label: "Action Board", icon: Zap },
  { href: "/categories", label: "Categories", icon: Tag },
];

export function Sidebar() {
  const pathname = usePathname();

  return (
    <aside className="w-60 flex-shrink-0 h-screen sticky top-0 flex flex-col bg-[#0B0F14] border-r border-[#1E2A36]">
      {/* Logo */}
      <div className="flex items-center gap-2.5 px-5 py-5 border-b border-[#1E2A36]">
        <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-[#00E676] to-[#00BFA5] flex items-center justify-center flex-shrink-0">
          <Terminal size={16} className="text-[#03100A]" />
        </div>
        <div>
          <p className="text-[#F5F7FA] text-sm font-bold tracking-tight leading-none">
            Insight
          </p>
          <p className="text-[#00E676] text-xs font-mono tracking-widest">
            TERMINAL
          </p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        {navItems.map(({ href, label, icon: Icon }) => {
          const active = pathname === href;
          return (
            <Link
              key={href}
              href={href}
              className={cn(
                "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150",
                active
                  ? "bg-[#00E676]/10 text-[#00E676] border border-[#00E676]/20"
                  : "text-[#A7B0BC] hover:bg-[#111821] hover:text-[#F5F7FA]"
              )}
            >
              <Icon size={16} className={active ? "text-[#00E676]" : ""} />
              <span className="font-medium">{label}</span>
              {active && (
                <div className="ml-auto w-1.5 h-1.5 rounded-full bg-[#00E676]" />
              )}
            </Link>
          );
        })}
      </nav>

      {/* Settings */}
      <div className="px-3 py-4 border-t border-[#1E2A36]">
        <Link
          href="/settings"
          className={cn(
            "flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm transition-all duration-150",
            pathname === "/settings"
              ? "bg-[#00E676]/10 text-[#00E676] border border-[#00E676]/20"
              : "text-[#A7B0BC] hover:bg-[#111821] hover:text-[#F5F7FA]"
          )}
        >
          <Settings size={16} />
          <span className="font-medium">Settings</span>
        </Link>
      </div>
    </aside>
  );
}
