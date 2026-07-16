export function Logo({ className = "", size = "default" }: { className?: string; size?: "default" | "large" }) {
  return (
    <span
      className={`font-bold tracking-tight text-[var(--maroon-dark)] ${
        size === "large" ? "text-3xl" : "text-xl"
      } ${className}`}
    >
      Split<span style={{ color: "var(--rose-400)" }}>Circle</span>
    </span>
  );
}
