import { Icon } from "@iconify/react";

export default function DashboardLoading() {
  return (
    <div className="h-full flex items-center justify-center py-20">
      <Icon icon="solar:refresh-circle-bold" className="text-3xl text-[var(--rose-400)] animate-spin" />
    </div>
  );
}
