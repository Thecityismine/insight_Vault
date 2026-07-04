"use client";
import { useState, useEffect } from "react";
import { usePathname } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { Sidebar } from "./Sidebar";
import { TopBar } from "./TopBar";
import { QuickAddModal } from "./QuickAddModal";
import { LoginView } from "@/components/auth/LoginView";

const PAGE_TITLES: Record<string, string> = {
  "/": "Command Center",
  "/library": "Library",
  "/action-board": "Action Board",
  "/categories": "Categories",
  "/add-link": "Add Link",
  "/settings": "Settings",
};

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, loading } = useAuth();
  const pathname = usePathname();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [quickAddOpen, setQuickAddOpen] = useState(false);

  // Per-route page titles
  useEffect(() => {
    const match = Object.entries(PAGE_TITLES).find(
      ([path]) => pathname === path || (path !== "/" && pathname.startsWith(path))
    );
    document.title = match ? `${match[1]} — Insight Terminal` : "Insight Terminal";
  }, [pathname]);

  // Cmd/Ctrl + K → open quick add
  useEffect(() => {
    function onKey(e: KeyboardEvent) {
      if ((e.metaKey || e.ctrlKey) && e.key === "k") {
        e.preventDefault();
        setQuickAddOpen(true);
      }
    }
    document.addEventListener("keydown", onKey);
    return () => document.removeEventListener("keydown", onKey);
  }, []);

  // Close sidebar on route change (mobile nav)
  useEffect(() => {
    setSidebarOpen(false);
  }, [pathname]);

  // Share pages are public — no auth or shell needed
  if (pathname.startsWith("/share")) return <>{children}</>;

  if (loading) {
    return (
      <div className="min-h-screen bg-[#05070A] flex items-center justify-center">
        <div className="w-6 h-6 border-2 border-[#00E676] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!user) return <LoginView />;

  return (
    <>
      <div className="flex h-screen overflow-hidden bg-[#05070A]">
        <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
        <div className="flex-1 flex flex-col overflow-hidden min-w-0">
          <TopBar onMenuToggle={() => setSidebarOpen((v) => !v)} onQuickAdd={() => setQuickAddOpen(true)} />
          <main className="flex-1 overflow-y-auto p-4 md:p-6">{children}</main>
        </div>
      </div>
      <QuickAddModal open={quickAddOpen} onClose={() => setQuickAddOpen(false)} />
    </>
  );
}
