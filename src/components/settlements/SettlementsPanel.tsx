"use client";

import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

type Settlement = {
  id: string;
  amount: string;
  status: string;
  from_name: string;
  to_name: string;
  toUser: string;
  createdAt: string;
};

const STATUS_LABEL: Record<string, string> = {
  pending: "Menunggu",
  confirmed: "Dikonfirmasi",
  rejected: "Ditolak",
};

export function SettlementsPanel({
  settlements,
  currentUserId,
  onChanged,
}: {
  settlements: Settlement[];
  currentUserId: string;
  onChanged: () => void;
}) {
  async function respond(id: string, action: "confirm" | "reject") {
    await fetch(`/api/settlements/${id}/${action}`, { method: "POST" });
    onChanged();
  }

  if (settlements.length === 0) {
    return <p className="text-sm text-muted-foreground">Belum ada riwayat pembayaran.</p>;
  }

  return (
    <div className="divide-y divide-[var(--rose-100)]">
      {settlements.map((s) => (
        <div key={s.id} className="flex items-center gap-3 py-3.5">
          <Icon icon="solar:card-transfer-bold" className="text-[var(--rose-400)] text-lg shrink-0" />
          <div className="flex-1 min-w-0 text-sm">
            <span className="font-medium">{s.from_name}</span> membayar{" "}
            <span className="font-medium">{s.to_name}</span> sebesar{" "}
            <span className="font-semibold">Rp{Number(s.amount).toLocaleString("id-ID")}</span>
          </div>
          <Badge
            variant="secondary"
            className={
              s.status === "confirmed"
                ? "bg-emerald-100 text-emerald-700"
                : s.status === "rejected"
                ? "bg-red-100 text-red-700"
                : "bg-amber-100 text-amber-700"
            }
          >
            {STATUS_LABEL[s.status]}
          </Badge>
          {s.status === "pending" && s.toUser === currentUserId && (
            <div className="flex gap-1.5">
              <Button size="sm" variant="outline" onClick={() => respond(s.id, "confirm")}>
                Konfirmasi
              </Button>
              <Button size="sm" variant="ghost" onClick={() => respond(s.id, "reject")}>
                Tolak
              </Button>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
