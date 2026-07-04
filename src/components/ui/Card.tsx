import { cn } from "@/lib/utils";

interface CardProps {
  children: React.ReactNode;
  className?: string;
  glow?: "green" | "blue" | "none";
}

export function Card({ children, className, glow = "none" }: CardProps) {
  return (
    <div
      className={cn(
        "bg-gradient-to-b from-[#111821] to-[#0B0F14] border border-[#1E2A36] rounded-2xl",
        {
          "shadow-[0_0_30px_rgba(0,230,118,0.08)] border-[#00E676]/20": glow === "green",
          "shadow-[0_0_30px_rgba(59,130,246,0.08)] border-[#3B82F6]/20": glow === "blue",
          "shadow-[0_20px_60px_rgba(0,0,0,0.35)]": glow === "none",
        },
        className
      )}
    >
      {children}
    </div>
  );
}
