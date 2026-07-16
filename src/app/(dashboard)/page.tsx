"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { Icon } from "@iconify/react";
import { StatCard } from "@/components/dashboard/StatCard";
import { GroupActionsDialog } from "@/components/dashboard/GroupActionsDialog";

type Group = { id: string; name: string; description: string | null; inviteCode: string };
type Summary = { totalGroups: number; totalExpenses: number; expenseCount: number; pendingIncoming: number };

export default function DashboardHomePage() {
  const router = useRouter();
  const [groups, setGroups] = useState<Group[]>([]);
  const [summary, setSummary] = useState<Summary | null>(null);
  const [loading, setLoading] = useState(true);

  function refreshAll() {
    Promise.all([
      fetch("/api/groups").then((r) => r.json()),
      fetch("/api/dashboard/summary").then((r) => r.json()),
    ]).then(([groupsData, summaryData]) => {
      setGroups(groupsData.groups || []);
      setSummary(summaryData);
      setLoading(false);
    });
  }

  useEffect(() => {
    refreshAll();
  }, []);

  if (loading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {[1, 2, 3, 4].map((i) => (
          <div key={i} className="h-24 rounded-2xl bg-white animate-pulse sc-shadow-soft" />
        ))}
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-bold text-[var(--maroon-dark)]">Ringkasan</h1>
        <p className="text-sm text-muted-foreground mt-0.5">
          Pantau semua grup dan pengeluaranmu di satu tempat.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          icon="solar:users-group-rounded-bold"
          label="Total Grup"
          value={String(summary?.totalGroups ?? 0)}
          badgeColor="#33594d"
          badgeBg="#e9f2ee"
        />
        <StatCard
          icon="solar:wallet-money-bold"
          label="Total Pengeluaran"
          value={`Rp${(summary?.totalExpenses ?? 0).toLocaleString("id-ID")}`}
          badgeColor="var(--rose-400)"
          badgeBg="var(--rose-50)"
        />
        <StatCard
          icon="solar:bill-list-bold"
          label="Jumlah Transaksi"
          value={String(summary?.expenseCount ?? 0)}
          badgeColor="var(--gold)"
          badgeBg="#fdf1de"
        />
        <StatCard
          icon="solar:card-transfer-bold"
          label="Menunggu Konfirmasi"
          value={String(summary?.pendingIncoming ?? 0)}
          badgeColor="#a8452f"
          badgeBg="#fdeceb"
        />
      </div>

      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-[var(--maroon-dark)]">Grup Kamu</h2>
          <GroupActionsDialog onCreated={refreshAll} />
        </div>

        {groups.length === 0 ? (
          <div className="bg-white rounded-2xl p-12 text-center sc-shadow-soft">
            <div className="w-14 h-14 rounded-full bg-[var(--rose-50)] flex items-center justify-center mx-auto mb-4">
              <Icon icon="solar:users-group-rounded-bold" className="text-2xl text-[var(--rose-400)]" />
            </div>
            <h3 className="font-semibold text-[var(--maroon-dark)] mb-1">Belum ada grup</h3>
            <p className="text-sm text-muted-foreground">
              Buat grup baru di sidebar untuk mulai patungan bareng circle kamu.
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {groups.map((g) => (
              <button
                key={g.id}
                onClick={() => router.push(`/groups/${g.id}`)}
                className="text-left bg-white rounded-2xl p-5 sc-shadow-soft sc-card-interactive"
              >
                <div className="w-10 h-10 rounded-xl bg-[var(--rose-50)] flex items-center justify-center mb-3">
                  <Icon icon="solar:home-2-bold" className="text-lg text-[var(--rose-400)]" />
                </div>
                <h3 className="font-semibold text-[var(--maroon-dark)]">{g.name}</h3>
                {g.description && (
                  <p className="text-xs text-muted-foreground mt-1 line-clamp-2">{g.description}</p>
                )}
                <div className="mt-3 flex items-center gap-1.5 text-xs text-muted-foreground">
                  <Icon icon="solar:ticket-bold" className="text-sm" />
                  <span className="font-mono tracking-wider">{g.inviteCode}</span>
                </div>
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
