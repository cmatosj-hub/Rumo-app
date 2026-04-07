"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { useEffect, useId, useRef, useState } from "react";
import {
  CarFront,
  ChartNoAxesCombined,
  Menu,
  ReceiptText,
  ScrollText,
  Settings,
  Settings2,
  UserCircle2,
  X,
} from "lucide-react";

import { signOutAction } from "@/app/account/actions";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import type { ProfileRecord } from "@/lib/types";
import { cn } from "@/lib/utils";

const COMPACT_SHELL_MEDIA_QUERY = "(max-width: 1279px), (max-aspect-ratio: 4/3)";
const focusRingClassName =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-background)]";
const actionLinkClassNames = {
  secondary: cn(
    "theme-border surface-soft surface-hover inline-flex items-center justify-center rounded-2xl border px-4 py-3 text-sm font-semibold text-[var(--color-foreground)] transition hover:text-[var(--color-foreground)]",
    focusRingClassName,
  ),
  ghost: cn(
    "inline-flex items-center justify-center rounded-2xl px-4 py-3 text-sm font-semibold text-[var(--color-muted-foreground)] transition hover:bg-[var(--surface-soft)] hover:text-[var(--color-foreground)]",
    focusRingClassName,
  ),
};
const navigationItems = [
  { href: "/dashboard", label: "Inicio", icon: ChartNoAxesCombined },
  { href: "/transactions", label: "Fechar dia", icon: ReceiptText },
  { href: "/carro", label: "Carro", icon: CarFront },
  { href: "/contas", label: "Contas", icon: ScrollText },
  { href: "/relatorios", label: "Relatorios", icon: ChartNoAxesCombined },
  { href: "/settings", label: "Ajustes", icon: Settings2 },
] as const;

export function ShellSidebar({
  profile,
}: {
  profile: ProfileRecord;
}) {
  const pathname = usePathname();
  const drawerId = useId();
  const drawerTitleId = useId();
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const menuButtonRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  const closeDrawer = (restoreFocus = false) => {
    setIsDrawerOpen(false);

    if (restoreFocus) {
      window.requestAnimationFrame(() => {
        menuButtonRef.current?.focus();
      });
    }
  };

  useEffect(() => {
    if (typeof window === "undefined") {
      return undefined;
    }

    const media = window.matchMedia(COMPACT_SHELL_MEDIA_QUERY);
    const syncDrawerState = (event?: MediaQueryListEvent) => {
      const isCompact = event ? event.matches : media.matches;

      if (!isCompact) {
        setIsDrawerOpen(false);
      }
    };

    syncDrawerState();

    media.addEventListener("change", syncDrawerState);
    return () => media.removeEventListener("change", syncDrawerState);
  }, []);

  useEffect(() => {
    if (!isDrawerOpen) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsDrawerOpen(false);
        window.requestAnimationFrame(() => {
          menuButtonRef.current?.focus();
        });
      }
    };

    document.addEventListener("keydown", handleEscape);
    closeButtonRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isDrawerOpen]);

  return (
    <>
      <div className="shell-mobile-entry">
        <button
          ref={menuButtonRef}
          type="button"
          aria-controls={drawerId}
          aria-expanded={isDrawerOpen}
          aria-haspopup="dialog"
          aria-label="Abrir menu"
          className={cn(
            "theme-border surface-soft surface-hover inline-flex min-h-12 items-center gap-3 rounded-2xl border px-4 py-3 text-sm font-semibold text-[var(--color-foreground)] transition",
            focusRingClassName,
          )}
          onClick={() => setIsDrawerOpen(true)}
        >
          <Menu className="h-4 w-4" />
          Menu
        </button>
      </div>

      <aside className="shell-sidebar-rail glass-panel theme-border rounded-[2rem] border p-5 shadow-2xl shadow-black/30">
        <SidebarIntroCard />
        <SidebarNavigation pathname={pathname} />
        <SidebarProfileCard profile={profile} />
      </aside>

      <div
        className={cn(
          "shell-mobile-layer fixed inset-0 z-50 transition-opacity duration-200 ease-out",
          isDrawerOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
        )}
        aria-hidden={!isDrawerOpen}
      >
        <button
          type="button"
          aria-label="Fechar menu"
          className="absolute inset-0 bg-black/55 backdrop-blur-sm"
          onClick={() => closeDrawer(true)}
          tabIndex={-1}
        />

        <div
          id={drawerId}
          role="dialog"
          aria-modal="true"
          aria-labelledby={drawerTitleId}
          inert={!isDrawerOpen}
          className={cn(
            "glass-panel theme-border absolute inset-y-0 left-0 flex h-full w-[min(92vw,24rem)] max-w-full flex-col overflow-y-auto border-r px-5 py-5 shadow-2xl shadow-black/40 transition-transform duration-200 ease-out",
            isDrawerOpen ? "translate-x-0" : "-translate-x-full",
          )}
        >
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="text-sm uppercase tracking-[0.24em] text-[var(--color-muted-foreground)]">Menu</p>
              <h2 id={drawerTitleId} className="mt-3 text-2xl font-semibold text-[var(--color-foreground)]">
                Conta e navegacao
              </h2>
              <p className="mt-3 text-sm leading-6 text-[var(--color-muted-foreground)]">
                Acesse as telas do sistema sem tirar o foco do conteudo principal.
              </p>
            </div>

            <div className="flex items-center gap-2">
              <ThemeToggle />
              <button
                ref={closeButtonRef}
                type="button"
                aria-label="Fechar menu"
                className={cn(
                  "theme-border surface-soft surface-hover inline-flex h-10 w-10 items-center justify-center rounded-2xl border text-[var(--color-muted-foreground)] transition hover:text-[var(--color-foreground)]",
                  focusRingClassName,
                )}
                onClick={() => closeDrawer(true)}
              >
                <X className="h-4 w-4" />
              </button>
            </div>
          </div>

          <SidebarNavigation pathname={pathname} onSelect={() => closeDrawer()} />
          <SidebarProfileCard profile={profile} onAction={() => closeDrawer()} />
        </div>
      </div>
    </>
  );
}

function SidebarIntroCard() {
  return (
    <div className="accent-emerald-surface flex items-start justify-between gap-3 rounded-[1.5rem] border p-4">
      <div>
        <p className="accent-emerald text-sm uppercase tracking-[0.24em]">Sistema RUMO</p>
        <h2 className="mt-3 text-2xl font-semibold text-[var(--color-foreground)]">Controle diario do motorista</h2>
        <p className="mt-3 text-sm leading-6 text-[var(--color-muted-foreground)]">
          Feche o dia, acompanhe o carro e veja quanto realmente sobrou.
        </p>
      </div>
      <ThemeToggle />
    </div>
  );
}

function SidebarNavigation({
  pathname,
  onSelect,
}: {
  pathname: string;
  onSelect?: () => void;
}) {
  return (
    <nav className="mt-6 space-y-2">
      {navigationItems.map((item) => {
        const Icon = item.icon;
        const isActive = pathname === item.href;

        return (
          <Link
            key={item.label}
            href={item.href}
            aria-current={isActive ? "page" : undefined}
            onClick={onSelect}
            className={cn(
              "theme-border flex min-h-12 items-center gap-3 rounded-2xl border px-4 py-3 text-sm transition",
              focusRingClassName,
              isActive
                ? "surface-soft text-[var(--color-foreground)]"
                : "text-[var(--color-muted-foreground)] hover:bg-[var(--surface-soft)] hover:text-[var(--color-foreground)]",
            )}
          >
            <Icon className="h-4 w-4" />
            {item.label}
          </Link>
        );
      })}
    </nav>
  );
}

function SidebarProfileCard({
  profile,
  onAction,
}: {
  profile: ProfileRecord;
  onAction?: () => void;
}) {
  return (
    <div className="theme-border surface-soft mt-8 rounded-[1.5rem] border p-4">
      <div className="flex items-center gap-3">
        <AvatarBubble profile={profile} />
        <div className="min-w-0">
          <p className="truncate font-semibold text-[var(--color-foreground)]">
            {profile.fullName || profile.username}
          </p>
          <p className="truncate text-sm text-[var(--color-muted-foreground)]">
            {profile.email}
          </p>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <Link href="/account" onClick={onAction} className={cn("min-w-[10rem] flex-1", actionLinkClassNames.secondary)}>
          <UserCircle2 className="mr-2 h-4 w-4" />
          Conta
        </Link>
        <form action={signOutAction} onSubmit={onAction} className="min-w-[10rem] flex-1">
          <Button type="submit" variant="ghost" className="w-full">
            Sair
          </Button>
        </form>
      </div>

      <form action={signOutAction} onSubmit={onAction} className="mt-3">
        <input type="hidden" name="mode" value="switch-account" />
        <Button type="submit" variant="ghost" className="w-full">
          Trocar conta
        </Button>
      </form>

      <div className="theme-border mt-4 flex items-center justify-between rounded-2xl border px-3 py-2 text-xs uppercase tracking-[0.16em] text-[var(--color-muted-foreground)]">
        <span>Online</span>
        <Settings className="h-4 w-4" />
      </div>
    </div>
  );
}

function AvatarBubble({ profile }: { profile: ProfileRecord }) {
  if (profile.avatarUrl) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img
        src={profile.avatarUrl}
        alt={profile.username}
        className="theme-border h-12 w-12 rounded-2xl border object-cover"
      />
    );
  }

  const initials = (profile.fullName || profile.username || "RU")
    .split(" ")
    .map((part) => part[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  return (
    <div className="accent-emerald-surface flex h-12 w-12 items-center justify-center rounded-2xl border text-sm font-semibold">
      {initials}
    </div>
  );
}
