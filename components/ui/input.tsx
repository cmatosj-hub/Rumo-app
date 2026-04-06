import type React from "react";
import { cn } from "@/lib/utils";

export function Input({ className, ...props }: React.InputHTMLAttributes<HTMLInputElement>) {
  return (
    <input
      className={cn(
        "theme-border surface-soft h-12 w-full rounded-2xl border px-4 text-[var(--color-foreground)] outline-none ring-0 placeholder:text-[var(--color-muted-foreground)] focus:border-emerald-300/50 focus:bg-[var(--surface-hover)]",
        className,
      )}
      {...props}
    />
  );
}
