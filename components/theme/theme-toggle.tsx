"use client";

import { useSyncExternalStore } from "react";
import { Moon, SunMedium } from "lucide-react";
import { useTheme } from "next-themes";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const mounted = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );
  const isLight = resolvedTheme === "light";

  return (
    <button
      type="button"
      aria-label="Alternar tema"
      onClick={() => setTheme(isLight ? "dark" : "light")}
      className="theme-border surface-soft surface-hover rounded-full border p-2 text-[var(--color-muted-foreground)] transition hover:text-[var(--color-foreground)]"
    >
      {mounted && isLight ? <Moon className="h-4 w-4" /> : <SunMedium className="h-4 w-4" />}
    </button>
  );
}
