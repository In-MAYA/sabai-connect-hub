import { cn } from "@/lib/utils";

interface AvatarProps {
  name: string;
  gradient: string; // e.g. "from-sky-500 to-cyan-400"
  size?: "xs" | "sm" | "md" | "lg" | "xl" | "2xl";
  online?: boolean;
  ring?: boolean;
  className?: string;
}

const sizeMap = {
  xs: "h-7 w-7 text-[10px]",
  sm: "h-9 w-9 text-xs",
  md: "h-11 w-11 text-sm",
  lg: "h-14 w-14 text-base",
  xl: "h-20 w-20 text-xl",
  "2xl": "h-28 w-28 text-3xl",
};

const dotMap = {
  xs: "h-2 w-2",
  sm: "h-2.5 w-2.5",
  md: "h-3 w-3",
  lg: "h-3.5 w-3.5",
  xl: "h-4 w-4",
  "2xl": "h-5 w-5",
};

export function Avatar({ name, gradient, size = "md", online, ring, className }: AvatarProps) {
  const initials = name
    .split(" ")
    .map((n) => n[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className={cn("relative inline-flex shrink-0", className)}>
      <div
        className={cn(
          "rounded-full bg-gradient-to-br flex items-center justify-center font-display font-bold text-white shadow-soft",
          sizeMap[size],
          gradient,
          ring && "ring-2 ring-background ring-offset-2 ring-offset-primary"
        )}
      >
        {initials}
      </div>
      {online && (
        <span
          className={cn(
            "absolute bottom-0 right-0 rounded-full bg-success ring-2 ring-background",
            dotMap[size]
          )}
        />
      )}
    </div>
  );
}
