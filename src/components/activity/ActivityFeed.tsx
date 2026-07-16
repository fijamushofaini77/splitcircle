"use client";

import { Icon } from "@iconify/react";

type Activity = {
  id: string;
  action: string;
  detail: string | null;
  createdAt: string;
  userName: string;
};

const ACTION_ICON: Record<string, string> = {
  group_created: "solar:home-add-bold",
  member_joined: "solar:user-plus-bold",
  expense_added: "solar:bill-list-bold",
  expense_deleted: "solar:trash-bin-trash-bold",
  settlement_requested: "solar:card-send-bold",
  settlement_confirmed: "solar:check-circle-bold",
  settlement_rejected: "solar:close-circle-bold",
};

export function ActivityFeed({ activity }: { activity: Activity[] }) {
  if (activity.length === 0) {
    return <p className="text-sm text-muted-foreground">Belum ada aktivitas.</p>;
  }

  return (
    <div className="divide-y divide-[var(--rose-100)]">
      {activity.map((a) => (
        <div key={a.id} className="flex items-start gap-3 py-3.5">
          <div className="w-8 h-8 rounded-full bg-[var(--rose-50)] flex items-center justify-center text-[var(--rose-400)] shrink-0 mt-0.5">
            <Icon icon={ACTION_ICON[a.action] || "solar:bell-bold"} className="text-sm" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm">
              <span className="font-medium">{a.userName}</span>{" "}
              <span className="text-muted-foreground">{a.detail}</span>
            </p>
            <p className="text-xs text-muted-foreground mt-0.5">
              {new Date(a.createdAt).toLocaleString("id-ID", {
                day: "numeric", month: "short", hour: "2-digit", minute: "2-digit",
              })}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
