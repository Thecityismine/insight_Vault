"use client";
import { cn } from "@/lib/utils";
import { ButtonHTMLAttributes } from "react";

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: "primary" | "secondary" | "ghost" | "danger";
  size?: "sm" | "md" | "lg";
}

export function Button({
  variant = "primary",
  size = "md",
  className,
  children,
  ...props
}: ButtonProps) {
  return (
    <button
      className={cn(
        "inline-flex items-center justify-center gap-2 font-semibold rounded-xl transition-all duration-150 disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer",
        {
          "bg-gradient-to-r from-[#00E676] to-[#00BFA5] text-[#03100A] hover:opacity-90 glow-green":
            variant === "primary",
          "bg-[#111821] text-[#F5F7FA] border border-[#2E4052] hover:border-[#00E676] hover:text-[#00E676]":
            variant === "secondary",
          "text-[#A7B0BC] hover:text-[#F5F7FA] hover:bg-[#111821]":
            variant === "ghost",
          "bg-[#EF4444]/10 text-[#EF4444] border border-[#EF4444]/30 hover:bg-[#EF4444]/20":
            variant === "danger",
        },
        {
          "px-3 py-1.5 text-xs": size === "sm",
          "px-4 py-2.5 text-sm": size === "md",
          "px-6 py-3 text-base": size === "lg",
        },
        className
      )}
      {...props}
    >
      {children}
    </button>
  );
}
