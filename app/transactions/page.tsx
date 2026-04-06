import Link from "next/link";
import { ReceiptText } from "lucide-react";

import { SidebarShell } from "@/components/layout/sidebar-shell";
import { CloseDayClient } from "@/components/transactions/close-day-client";
import { AuthHint } from "@/components/shared/auth-hint";
import { getDashboardData } from "@/lib/data/app";

export default async function TransactionsPage() {
  const data = await getDashboardData();

  return (
    <SidebarShell>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="accent-emerald-surface rounded-2xl border p-3">
            <ReceiptText className="h-5 w-5" />
          </div>
          <div>
            <p className="accent-emerald text-sm uppercase tracking-[0.24em]">Fechar dia</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-[var(--color-foreground)]">
              Registre sua jornada
            </h1>
          </div>
        </div>

        <Link
          href="/fechamentos"
          className="theme-border surface-soft inline-flex h-11 items-center justify-center rounded-2xl border px-4 text-sm font-medium text-[var(--color-foreground)] transition hover:bg-[var(--surface-hover)]"
        >
          Ver fechamentos
        </Link>
      </div>

      <div className="mt-8 space-y-8">
        <AuthHint authRequired={data.authRequired} isDemoMode={data.isDemoMode} />
        <CloseDayClient settings={data.settings} wallets={data.wallets} />
      </div>
    </SidebarShell>
  );
}
