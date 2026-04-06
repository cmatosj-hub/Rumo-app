import type React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const badgeVariants = cva(
  "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium uppercase tracking-[0.16em]",
  {
    variants: {
      variant: {
        default: "theme-border surface-soft text-[var(--color-foreground)]",
        secondary: "border-slate-500/20 bg-slate-500/10 text-[var(--color-muted-foreground)]",
        success: "accent-emerald-surface",
        warning: "accent-amber-surface",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface BadgeProps extends React.HTMLAttributes<HTMLDivElement>, VariantProps<typeof badgeVariants> {}

export function Badge({ className, variant, ...props }: BadgeProps) {
  return <div className={cn(badgeVariants({ variant }), className)} {...props} />;
}
