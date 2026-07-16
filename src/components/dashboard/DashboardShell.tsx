"use client";

import { usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import { Icon } from "@iconify/react";
import { Button } from "@/components/ui/button";
import { Logo } from "@/components/brand/Logo";
import GlassSurface from "@/components/ui/react-bits/GlassSurface";
import Ballpit from "@/components/ui/react-bits/Ballpit";
import type { SessionUser } from "@/lib/auth";

const NAV_ITEMS = [{ href: "/", label: "Dashboard" }];

export function DashboardShell({
  user,
  children,
}: {
  user: SessionUser;
  children: React.ReactNode;
}) {
  const router = useRouter();
  const pathname = usePathname();

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
    router.refresh();
  }

  const initial = user.name?.charAt(0)?.toUpperCase() || "?";
  const isGroupDetail = pathname?.startsWith("/groups/");

  return (
    <div className="min-h-screen flex bg-[#fdf5f7]">
      {/* Sidebar — independen, scroll sendiri, tidak ikut topbar */}
      <aside className="w-64 bg-white border-r border-[var(--rose-100)] p-6 h-screen sticky top-0 flex flex-col">
        <div className="mb-10">
          <Logo size="large" />
        </div>
        <nav className="space-y-1 flex-1">
          {NAV_ITEMS.map((item) => {
            const active = item.href === "/" ? pathname === "/" : pathname?.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`block px-4 py-3 rounded-xl text-sm font-semibold transition-colors ${
                  active
                    ? "bg-[var(--rose-400)] text-white"
                    : "text-[var(--ink-soft)] hover:bg-[var(--rose-50)]"
                }`}
              >
                {item.label}
              </Link>
            );
          })}
          {isGroupDetail && (
            <div className="block px-4 py-3 rounded-xl text-sm font-semibold bg-[var(--rose-400)] text-white">
              Detail Grup
            </div>
          )}
        </nav>
      </aside>

      {/* Konten kanan: topbar sticky + main */}
      <div className="relative flex-1 flex flex-col min-h-screen overflow-hidden">
        <div className="absolute inset-0 -z-0">
          <Ballpit
            className="pointer-events-none"
            count={40}
            gravity={0}
            friction={0.985}
            wallBounce={0.95}
            followCursor={false}
            colors={[0xffe9ef, 0xffc9d7, 0xffbccd, 0xff9cb5, 0xfc809f]}
            flightChance={0.0008}
            flightForce={0.4}
            flightBoostVelocity={0.5}
            flightDuration={30}
          />
        </div>
        <div className="sticky top-0 z-40 px-6 pt-4">
          <GlassSurface
            width="100%"
            height={64}
            borderRadius={20}
            className="px-5"
          >
            <div className="flex items-center justify-between w-full">
              <span className="text-sm font-medium text-[var(--maroon-dark)]">
                Halo, {user.name.split(" ")[0]} 👋
              </span>
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2 bg-white/60 rounded-full pl-1 pr-3 py-1">
                  <div className="w-7 h-7 rounded-full bg-[var(--rose-400)] text-white text-xs font-semibold flex items-center justify-center">
                    {initial}
                  </div>
                  <span className="text-sm font-medium text-[var(--maroon-dark)]">{user.name}</span>
                </div>
                <Button variant="ghost" size="icon" onClick={handleLogout} title="Keluar">
                  <Icon icon="solar:logout-2-bold" className="text-lg" />
                </Button>
              </div>
            </div>
          </GlassSurface>
        </div>

        <main className="relative z-10 flex-1 overflow-y-auto p-6 lg:p-8">{children}</main>
      </div>
    </div>
  );
}
