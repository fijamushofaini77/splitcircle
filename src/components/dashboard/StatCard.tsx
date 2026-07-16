import { Icon } from "@iconify/react";

export function StatCard({
  icon,
  label,
  value,
  badgeColor = "var(--rose-400)",
  badgeBg = "var(--rose-50)",
  trend,
}: {
  icon: string;
  label: string;
  value: string;
  badgeColor?: string;
  badgeBg?: string;
  trend?: string;
}) {
  return (
    <div className="bg-white rounded-2xl p-5 flex items-center gap-4 sc-shadow-soft">
      <div
        className="w-12 h-12 rounded-full flex items-center justify-center shrink-0"
        style={{ backgroundColor: badgeBg }}
      >
        <Icon icon={icon} className="text-xl" style={{ color: badgeColor }} />
      </div>
      <div className="min-w-0">
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-xl font-bold text-[var(--maroon-dark)] truncate">{value}</p>
        {trend && <p className="text-xs text-emerald-600 font-medium mt-0.5">{trend}</p>}
      </div>
    </div>
  );
}
