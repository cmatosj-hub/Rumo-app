"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  CarFront,
  ChartNoAxesCombined,
  ReceiptText,
  ScrollText,
  Settings,
  Settings2,
  UserCircle2,
} from "lucide-react";

import { signOutAction } from "@/app/account/actions";
import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Button } from "@/components/ui/button";
import type { ProfileRecord } from "@/lib/types";
import { cn } from "@/lib/utils";

export function ShellSidebar({
  profile,
}: {
  profile: ProfileRecord;
}) {
  const pathname = usePathname();
  const nav = [
    { href: "/dashboard", label: "Inicio", icon: ChartNoAxesCombined },
    { href: "/transactions", label: "Fechar dia", icon: ReceiptText },
    { href: "/carro", label: "Carro", icon: CarFront },
    { href: "/contas", label: "Contas", icon: ScrollText },
    { href: "/relatorios", label: "Relatorios", icon: ChartNoAxesCombined },
    { href: "/settings", label: "Ajustes", icon: Settings2 },
  ];

  return (
    <aside className="glass-panel theme-border rounded-[2rem] border p-5 shadow-2xl shadow-black/30">
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

      <nav className="mt-6 space-y-2">
        {nav.map((item) => {
          const Icon = item.icon;
          const isActive = pathname === item.href;

          return (
            <Link
              key={item.label}
              href={item.href}
              className={cn(
                "theme-border flex items-center gap-3 rounded-2xl border px-4 py-3 text-sm transition",
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
          <Link href="/account" className="flex-1">
            <Button variant="secondary" className="w-full">
              <UserCircle2 className="mr-2 h-4 w-4" />
              Conta
            </Button>
          </Link>
          <form action={signOutAction} className="flex-1">
            <Button type="submit" variant="ghost" className="w-full">
              Sair
            </Button>
          </form>
        </div>

        <form action={signOutAction} className="mt-3">
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
    </aside>
  );
}

function AvatarBubble({ profile }: { profile: ProfileRecord }) {
  if (profile.avatarUrl) {
    return (
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
