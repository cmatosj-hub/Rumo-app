import type React from "react";
import { cn } from "@/lib/utils";

export function Label({ className, ...props }: React.LabelHTMLAttributes<HTMLLabelElement>) {
  return (
    <label
      className={cn("text-sm font-medium uppercase tracking-[0.14em] text-[var(--color-muted-foreground)]", className)}
      {...props}
    />
  );
}
