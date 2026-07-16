"use client";

import { useEffect, useState, use } from "react";
import { Icon } from "@iconify/react";
import Link from "next/link";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card } from "@/components/ui/card";
import { ExpenseForm } from "@/components/expenses/ExpenseForm";
import { ExpenseList } from "@/components/expenses/ExpenseList";
import { BalancesPanel } from "@/components/balances/BalancesPanel";
import { SettlementsPanel } from "@/components/settlements/SettlementsPanel";
import { ActivityFeed } from "@/components/activity/ActivityFeed";
import { Button } from "@/components/ui/button";
import { Skeleton, SkeletonExpenseList } from "@/components/ui/skeleton";

type Member = { id: string; name: string; email: string; avatar_color: string };
type Group = { id: string; name: string; description: string | null; inviteCode: string };

export default function GroupDetailPage({ params }: { params: Promise<{ groupId: string }> }) {
  const { groupId } = use(params);
  const [group, setGroup] = useState<Group | null>(null);
  const [members, setMembers] = useState<Member[]>([]);
  const [expenses, setExpenses] = useState<any[]>([]);
  const [balances, setBalances] = useState<any[]>([]);
  const [suggestedTx, setSuggestedTx] = useState<any[]>([]);
  const [settlementsList, setSettlementsList] = useState<any[]>([]);
  const [activity, setActivity] = useState<any[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string>("");
  const [loading, setLoading] = useState(true);

  function refreshExpenses() {
    fetch(`/api/groups/${groupId}/expenses`)
      .then((r) => r.json())
      .then((data) => setExpenses(data.expenses || []));
  }

  function refreshBalances() {
    fetch(`/api/groups/${groupId}/balances`)
      .then((r) => r.json())
      .then((data) => {
        setBalances(data.balances || []);
        setSuggestedTx(data.suggestedTransactions || []);
      });
  }

  function refreshSettlements() {
    fetch(`/api/groups/${groupId}/settlements`)
      .then((r) => r.json())
      .then((data) => setSettlementsList(data.settlements || []));
  }

  function refreshActivity() {
    fetch(`/api/groups/${groupId}/activity`)
      .then((r) => r.json())
      .then((data) => setActivity(data.activity || []));
  }

  function refreshAll() {
    refreshExpenses();
    refreshBalances();
    refreshSettlements();
    refreshActivity();
  }

  useEffect(() => {
    fetch(`/api/groups/${groupId}`)
      .then((r) => r.json())
      .then((data) => {
        setGroup(data.group);
        setMembers(data.members || []);
      })
      .finally(() => setLoading(false));
    refreshAll();
    fetch("/api/auth/me")
      .then((r) => r.json())
      .then((data) => setCurrentUserId(data.user?.id || ""));
  }, [groupId]);

  if (loading) {
    return (
      <div className="space-y-6">
        <Skeleton className="h-8 w-52" />
        <Skeleton className="h-4 w-72" />
        <Card className="p-5 sc-shadow-soft border-none">
          <SkeletonExpenseList />
        </Card>
      </div>
    );
  }
  if (!group) return <p className="text-sm text-red-600">Grup tidak ditemukan.</p>;

  return (
    <div className="space-y-6">
      <Link
        href="/"
        className="inline-flex items-center gap-1.5 text-sm text-muted-foreground hover:text-[var(--maroon-dark)] transition-colors"
      >
        <Icon icon="solar:arrow-left-linear" className="text-base" />
        Kembali ke Dashboard
      </Link>

      <div className="bg-white rounded-2xl p-5 sc-shadow-soft">
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[var(--rose-50)] flex items-center justify-center shrink-0">
              <Icon icon="solar:home-2-bold" className="text-2xl text-[var(--rose-400)]" />
            </div>
            <div>
              <h1 className="text-xl font-bold text-[var(--maroon-dark)]">{group.name}</h1>
              {group.description && (
                <p className="text-sm text-muted-foreground mt-0.5">{group.description}</p>
              )}
              <div className="flex -space-x-2 mt-2">
                {members.map((m) => (
                  <div
                    key={m.id}
                    title={m.name}
                    className="w-7 h-7 rounded-full border-2 border-white flex items-center justify-center text-white text-[10px] font-semibold"
                    style={{ backgroundColor: m.avatar_color }}
                  >
                    {m.name.charAt(0).toUpperCase()}
                  </div>
                ))}
              </div>
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-[var(--rose-50)] rounded-xl px-4 py-2 flex items-center gap-2">
              <Icon icon="solar:ticket-bold" className="text-sm text-[var(--gold)]" />
              <span className="text-xs text-muted-foreground">Kode:</span>
              <span className="font-mono font-bold tracking-widest text-sm text-[var(--maroon-dark)]">
                {group.inviteCode}
              </span>
            </div>
            <a href={`/api/groups/${groupId}/export`} download>
              <Button variant="outline" size="sm" className="gap-1.5">
                <Icon icon="solar:download-minimalistic-bold" className="text-sm" />
                Export
              </Button>
            </a>
          </div>
        </div>
      </div>

      <Tabs defaultValue="expenses">
        <TabsList className="bg-white p-1 rounded-xl sc-shadow-soft h-auto gap-1">
          <TabsTrigger value="expenses" className="gap-1.5 rounded-lg data-[state=active]:bg-[var(--rose-400)] data-[state=active]:text-white">
            <Icon icon="solar:bill-list-bold" /> Pengeluaran
          </TabsTrigger>
          <TabsTrigger value="balances" className="gap-1.5 rounded-lg data-[state=active]:bg-[var(--rose-400)] data-[state=active]:text-white">
            <Icon icon="solar:scale-bold" /> Saldo
          </TabsTrigger>
          <TabsTrigger value="settlements" className="gap-1.5 rounded-lg data-[state=active]:bg-[var(--rose-400)] data-[state=active]:text-white">
            <Icon icon="solar:card-transfer-bold" /> Pembayaran
          </TabsTrigger>
          <TabsTrigger value="activity" className="gap-1.5 rounded-lg data-[state=active]:bg-[var(--rose-400)] data-[state=active]:text-white">
            <Icon icon="solar:history-bold" /> Aktivitas
          </TabsTrigger>
        </TabsList>

        <TabsContent value="expenses">
          <Card className="p-5 sc-shadow-soft border-none">
            <div className="flex justify-end mb-2">
              <ExpenseForm groupId={groupId} members={members} onAdded={refreshExpenses} />
            </div>
            <ExpenseList expenses={expenses} currentUserId={currentUserId} onDeleted={refreshExpenses} />
          </Card>
        </TabsContent>
        <TabsContent value="balances">
          <Card className="p-5 sc-shadow-soft border-none">
            <BalancesPanel
              balances={balances}
              transactions={suggestedTx}
              currentUserId={currentUserId}
              onSettled={refreshAll}
            />
          </Card>
        </TabsContent>
        <TabsContent value="settlements">
          <Card className="p-5 sc-shadow-soft border-none">
            <SettlementsPanel
              settlements={settlementsList}
              currentUserId={currentUserId}
              onChanged={refreshAll}
            />
          </Card>
        </TabsContent>
        <TabsContent value="activity">
          <Card className="p-5 sc-shadow-soft border-none">
            <ActivityFeed activity={activity} />
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  );
}
