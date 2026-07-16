"use client";
import Ballpit from "@/components/ui/react-bits/Ballpit";

export default function AuthLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="relative min-h-screen w-full flex items-center justify-center bg-[var(--rose-50)] px-4 overflow-hidden">
      <div className="absolute inset-0">
        <Ballpit
          className="pointer-events-auto"
          count={80}
          gravity={0}
          friction={0.9975}
          wallBounce={0.95}
          followCursor={false}
          colors={[0xffe9ef, 0xffc9d7, 0xffbccd, 0xff9cb5, 0xfc809f]}
          flightChance={0.002}
          flightForce={0.6}
          flightBoostVelocity={0.8}
          flightDuration={40}
        />
      </div>
      <div className="relative z-10 w-full max-w-[380px] rounded-2xl overflow-hidden shadow-2xl bg-[var(--card)]">
        <div className="flex items-center gap-2 px-4 py-3 bg-[var(--rose-100)]">
          <span className="w-3 h-3 rounded-full bg-[#ff5f57]" />
          <span className="w-3 h-3 rounded-full bg-[#febc2e]" />
          <span className="w-3 h-3 rounded-full bg-[#28c840]" />
        </div>
        {children}
      </div>
    </div>
  );
}
