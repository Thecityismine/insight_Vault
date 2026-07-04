"use client";
import { Search, Bell, User } from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/Button";

export function TopBar() {
  return (
    <header className="h-14 flex items-center justify-between px-6 border-b border-[#1E2A36] bg-[#0B0F14]/80 backdrop-blur-sm sticky top-0 z-10">
      {/* Search */}
      <div className="relative w-72">
        <Search
          size={14}
          className="absolute left-3 top-1/2 -translate-y-1/2 text-[#66717F]"
        />
        <input
          type="text"
          placeholder="Search insights..."
          className="w-full bg-[#111821] border border-[#1E2A36] rounded-xl pl-9 pr-4 py-2 text-sm text-[#F5F7FA] placeholder:text-[#66717F] focus:outline-none focus:border-[#2E4052] transition-colors"
        />
      </div>

      {/* Actions */}
      <div className="flex items-center gap-3">
        <Link href="/add-link">
          <Button size="sm">
            Process New Link
          </Button>
        </Link>
        <button className="w-8 h-8 rounded-lg border border-[#1E2A36] bg-[#111821] flex items-center justify-center text-[#A7B0BC] hover:text-[#F5F7FA] hover:border-[#2E4052] transition-all">
          <Bell size={14} />
        </button>
        <button className="w-8 h-8 rounded-lg border border-[#1E2A36] bg-[#111821] flex items-center justify-center text-[#A7B0BC] hover:text-[#F5F7FA] hover:border-[#2E4052] transition-all">
          <User size={14} />
        </button>
      </div>
    </header>
  );
}
