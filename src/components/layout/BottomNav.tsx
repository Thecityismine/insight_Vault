"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { LayoutDashboard, Plus, Library, Zap, Search } from "lucide-react";
import { cn } from "@/lib/utils";

const items = [
  { href: "/", label: "Home", icon: LayoutDashboard },
  { href: "/library", label: "Library", icon: Library },
  { href: "/add-link", label: "Add", icon: Plus, accent: true },
  { href: "/action-board", label: "Actions", icon: Zap },
  { href: "/search", label: "Search", icon: Search },
];

export function BottomNav() {
  const pathname = usePathname();

  return (
    <nav
      className="md:hidden fixed bottom-0 inset-x-0 z-30 bg-[#0B0F14]/95 backdrop-blur-md border-t border-[#1E2A36] flex items-center"
      style={{ paddingBottom: "env(safe-area-inset-bottom)" }}
    >
      {items.map(({ href, label, icon: Icon, accent }) => {
        const active = pathname === href;
        return (
          <Link key={href} href={href} className="flex-1 flex flex-col items-center gap-0.5 py-2 px-1">
            <div className={cn(
              "w-10 h-10 rounded-xl flex items-center justify-center transition-all",
              accent
                ? "bg-[#00E676]/15 border border-[#00E676]/25"
                : active
                  ? "bg-[#00E676]/10"
                  : ""
            )}>
              <Icon
                size={18}
                className={cn(
                  "transition-colors",
                  accent ? "text-[#00E676]" : active ? "text-[#00E676]" : "text-[#3D4D5C]"
                )}
              />
            </div>
            <span className={cn(
              "text-[9px] font-mono tracking-wide",
              active ? "text-[#00E676]" : "text-[#3D4D5C]"
            )}>
              {label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
