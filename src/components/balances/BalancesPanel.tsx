"use client";

import { useState } from "react";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";

type Balance = { id: string; name: string; avatar_color: string; balance: number };
type Tx = { from: string; to: string; amount: number; from_name: string; to_name: string };

export function BalancesPanel({
  balances,
  transactions,
  currentUserId,
  onSettled,
}: {
  balances: Balance[];
  transactions: Tx[];
  currentUserId: string;
  onSettled: () => void;
}) {
  const [loadingId, setLoadingId] = useState<string | null>(null);
  const maxAbs = Math.max(1, ...balances.map((b) => Math.abs(b.balance)));

  async function handlePay(tx: Tx, groupId: string) {
    setLoadingId(tx.to);
    try {
      await fetch(`/api/groups/${groupId}/settlements`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ to_user: tx.to, amount: tx.amount }),
      });
      onSettled();
    } finally {
      setLoadingId(null);
    }
  }

  const groupId = typeof window !== "undefined" ? window.location.pathname.split("/")[2] : "";

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-sm font-semibold text-[var(--maroon-dark)] mb-3">Saldo Anggota</h3>
        <div className="space-y-1">
          {balances.map((b) => {
            const pct = Math.min(100, (Math.abs(b.balance) / maxAbs) * 100);
            const isPos = b.balance >= 0;
            return (
              <div key={b.id} className="flex items-center justify-between py-2.5 border-b border-[var(--rose-100)] last:border-0">
                <div className="flex items-center gap-2 w-32 shrink-0">
                  <div
                    className="w-7 h-7 rounded-full flex items-center justify-center text-white text-xs font-semibold shrink-0"
                    style={{ backgroundColor: b.avatar_color }}
                  >
                    {b.name.charAt(0).toUpperCase()}
                  </div>
                  <span className="text-sm truncate">{b.name}</span>
                </div>
                <div className="flex-1 h-2 bg-[var(--rose-50)] rounded-full mx-3 overflow-hidden">
                  <div
                    className="h-full rounded-full"
                    style={{
                      width: `${pct}%`,
                      backgroundColor: isPos ? "var(--forest, #33594d)" : "var(--danger, #a8452f)",
                    }}
                  />
                </div>
                <span className={`text-sm font-semibold ${isPos ? "text-emerald-700" : "text-red-600"}`}>
                  {isPos ? "+" : ""}Rp{b.balance.toLocaleString("id-ID")}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <div>
        <h3 className="text-sm font-semibold text-[var(--maroon-dark)] mb-3">Rekomendasi Pembayaran</h3>
        {transactions.length === 0 ? (
          <p className="text-sm text-muted-foreground">Semua sudah lunas — tidak ada saldo yang perlu diselesaikan.</p>
        ) : (
          <div className="space-y-2">
            {transactions.map((tx, idx) => (
              <div key={idx} className="flex items-center gap-3 bg-[var(--rose-50)] rounded-xl px-4 py-3">
                <span className="text-sm font-medium">{tx.from_name}</span>
                <Icon icon="solar:arrow-right-bold" className="text-[var(--gold)]" />
                <span className="text-sm font-medium">{tx.to_name}</span>
                <span className="ml-auto text-sm font-semibold text-[var(--maroon-dark)]">
                  Rp{tx.amount.toLocaleString("id-ID")}
                </span>
                {tx.from === currentUserId && (
                  <Button
                    size="sm"
                    className="ml-2"
                    disabled={loadingId === tx.to}
                    onClick={() => handlePay(tx, groupId)}
                  >
                    {loadingId === tx.to ? "..." : "Ajukan Bayar"}
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
