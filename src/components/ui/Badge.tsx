import { cn } from "@/lib/utils";

interface BadgeProps {
  children: React.ReactNode;
  variant?: "default" | "green" | "blue" | "gold" | "red" | "muted";
  className?: string;
}

export function Badge({ children, variant = "default", className }: BadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border",
        {
          "border-[#2E4052] bg-white/4 text-[#A7B0BC]": variant === "default",
          "border-[#00E676]/30 bg-[#00E676]/10 text-[#00E676]": variant === "green",
          "border-[#3B82F6]/30 bg-[#3B82F6]/10 text-[#3B82F6]": variant === "blue",
          "border-[#F5C542]/30 bg-[#F5C542]/10 text-[#F5C542]": variant === "gold",
          "border-[#EF4444]/30 bg-[#EF4444]/10 text-[#EF4444]": variant === "red",
          "border-transparent bg-[#1E2A36] text-[#66717F]": variant === "muted",
        },
        className
      )}
    >
      {children}
    </span>
  );
}
