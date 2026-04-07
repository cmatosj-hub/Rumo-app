import type React from "react";
import { cva, type VariantProps } from "class-variance-authority";

import { cn } from "@/lib/utils";

const buttonVariants = cva(
  "inline-flex items-center justify-center rounded-2xl px-4 py-3 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-background)]",
  {
    variants: {
      variant: {
        default: "bg-emerald-300 text-emerald-950 hover:bg-emerald-200",
        secondary:
          "theme-border surface-soft surface-hover border text-[var(--color-foreground)] hover:text-[var(--color-foreground)]",
        ghost:
          "text-[var(--color-muted-foreground)] hover:bg-[var(--surface-soft)] hover:text-[var(--color-foreground)]",
      },
    },
    defaultVariants: {
      variant: "default",
    },
  },
);

export interface ButtonProps
  extends React.ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {}

export function Button({ className, variant, ...props }: ButtonProps) {
  return <button className={cn(buttonVariants({ variant }), className)} {...props} />;
}
