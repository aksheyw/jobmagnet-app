import { cn } from "@/lib/utils";

interface BrandMarkProps {
  readonly size?: number;
  readonly className?: string;
  readonly variant?: "default" | "mono";
}

export function BrandMark({
  size = 28,
  className,
  variant = "default",
}: BrandMarkProps) {
  const indigo = variant === "mono" ? "currentColor" : "#4F46E5";
  const amber = variant === "mono" ? "currentColor" : "#F59E0B";

  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 32 32"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn("flex-shrink-0", className)}
      aria-hidden="true"
    >
      <defs>
        <linearGradient id="jm-magnet" x1="0" y1="0" x2="1" y2="0">
          <stop offset="0.5" stopColor={indigo} />
          <stop offset="0.5" stopColor={amber} />
        </linearGradient>
      </defs>
      {/* Horseshoe body */}
      <path
        d="M7 20 L7 14 a9 9 0 0 1 18 0 L25 20"
        stroke="url(#jm-magnet)"
        strokeWidth="3.5"
        strokeLinecap="round"
        fill="none"
      />
      {/* Left pole tip */}
      <rect x="5.25" y="20" width="3.5" height="5" rx="1.25" fill={indigo} />
      {/* Right pole tip */}
      <rect x="23.25" y="20" width="3.5" height="5" rx="1.25" fill={amber} />
      {/* Magnetic field hint — small spark */}
      <circle cx="16" cy="6" r="1" fill={amber} opacity="0.5" />
    </svg>
  );
}

interface WordmarkProps {
  readonly size?: "sm" | "md" | "lg";
  readonly className?: string;
}

export function Wordmark({ size = "md", className }: WordmarkProps) {
  const markSize = size === "sm" ? 22 : size === "lg" ? 32 : 26;
  const textCls =
    size === "sm"
      ? "text-sm"
      : size === "lg"
        ? "text-lg"
        : "text-base";

  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <BrandMark size={markSize} />
      <span
        className={cn(
          "font-semibold tracking-tight text-slate-900",
          textCls,
        )}
      >
        Job<span className="text-indigo-600">Magnet</span>
      </span>
    </span>
  );
}
