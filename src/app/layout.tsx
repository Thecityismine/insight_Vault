import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/lib/auth";
import { AppShell } from "@/components/layout/AppShell";
import { Toaster } from "react-hot-toast";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: {
    default: "Insight Terminal",
    template: "%s — Insight Terminal",
  },
  description: "Your private intelligence dashboard — extract insights from YouTube, podcasts, and more.",
  keywords: ["intelligence", "insights", "youtube", "podcast", "AI", "productivity"],
  openGraph: {
    title: "Insight Terminal",
    description: "Your private intelligence dashboard for ideas and insights.",
    type: "website",
    siteName: "Insight Terminal",
  },
  twitter: {
    card: "summary",
    title: "Insight Terminal",
    description: "Your private intelligence dashboard for ideas and insights.",
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <link
          href="https://fonts.googleapis.com/css2?family=IBM+Plex+Mono:wght@400;500;600&display=swap"
          rel="stylesheet"
        />
      </head>
      <body className={inter.className}>
        <AuthProvider>
          <AppShell>{children}</AppShell>
        </AuthProvider>
        <Toaster
          position="bottom-right"
          toastOptions={{
            style: {
              background: "#111821",
              color: "#F5F7FA",
              border: "1px solid #1E2A36",
              borderRadius: "12px",
              fontSize: "14px",
            },
          }}
        />
      </body>
    </html>
  );
}
