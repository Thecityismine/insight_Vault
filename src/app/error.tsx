"use client";
import { useEffect } from "react";
import { AlertCircle, RefreshCw } from "lucide-react";

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    console.error(error);
  }, [error]);

  return (
    <div className="flex items-center justify-center h-[60vh] px-4">
      <div className="text-center max-w-sm w-full">
        <div className="w-14 h-14 rounded-2xl bg-red-500/10 border border-red-500/20 flex items-center justify-center mx-auto mb-5">
          <AlertCircle size={22} className="text-red-400" />
        </div>
        <h2 className="text-[#F5F7FA] font-semibold text-lg mb-2">Something went wrong</h2>
        <p className="text-[#66717F] text-sm mb-6 font-mono">
          {error.message || "An unexpected error occurred."}
        </p>
        <button
          onClick={reset}
          className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-[#111821] border border-[#1E2A36] text-[#A7B0BC] hover:text-[#F5F7FA] hover:border-[#2E4052] text-sm transition-all"
        >
          <RefreshCw size={14} />
          Try again
        </button>
      </div>
    </div>
  );
}
