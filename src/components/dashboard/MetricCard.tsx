import { Card } from "@/components/ui/Card";
import { cn } from "@/lib/utils";
import { LucideIcon } from "lucide-react";

interface MetricCardProps {
  label: string;
  value: number | string;
  icon: LucideIcon;
  trend?: string;
  accent?: "green" | "blue" | "gold" | "red";
}

const accentMap = {
  green: { icon: "text-[#00E676]", bg: "bg-[#00E676]/10", glow: "green" as const },
  blue: { icon: "text-[#3B82F6]", bg: "bg-[#3B82F6]/10", glow: "blue" as const },
  gold: { icon: "text-[#F5C542]", bg: "bg-[#F5C542]/10", glow: "none" as const },
  red: { icon: "text-[#EF4444]", bg: "bg-[#EF4444]/10", glow: "none" as const },
};

export function MetricCard({ label, value, icon: Icon, trend, accent = "green" }: MetricCardProps) {
  const style = accentMap[accent];
  return (
    <Card glow={style.glow} className="p-5">
      <div className="flex items-start justify-between">
        <div>
          <p className="text-[#66717F] text-xs uppercase tracking-widest font-mono mb-2">
            {label}
          </p>
          <p className={cn("text-3xl font-bold metric-value", style.icon)}>
            {value}
          </p>
          {trend && (
            <p className="text-[#66717F] text-xs mt-1">{trend}</p>
          )}
        </div>
        <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center", style.bg)}>
          <Icon size={18} className={style.icon} />
        </div>
      </div>
    </Card>
  );
}
