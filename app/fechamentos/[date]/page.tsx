import Link from "next/link";
import { FilePenLine } from "lucide-react";

import { ClosureEditClient } from "@/components/closures/closure-edit-client";
import { SidebarShell } from "@/components/layout/sidebar-shell";
import { getDashboardData } from "@/lib/data/app";

export default async function ClosureEditPage({ params }: { params: Promise<{ date: string }> }) {
  const { date } = await params;
  const data = await getDashboardData();

  return (
    <SidebarShell>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="accent-emerald-surface rounded-2xl border p-3">
            <FilePenLine className="h-5 w-5" />
          </div>
          <div>
            <p className="accent-emerald text-sm uppercase tracking-[0.24em]">Editar fechamento</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-[var(--color-foreground)]">
              Ajuste os dados do dia
            </h1>
          </div>
        </div>

        <Link
          href="/fechamentos"
          className="theme-border surface-soft inline-flex h-11 items-center justify-center rounded-2xl border px-4 text-sm font-medium text-[var(--color-foreground)] transition hover:bg-[var(--surface-hover)]"
        >
          Voltar
        </Link>
      </div>

      <div className="mt-8 space-y-6">
        <ClosureEditClient date={date} settings={data.settings} wallets={data.wallets} />
        <div className="flex justify-start">
          <Link
            href="/fechamentos"
            className="theme-border surface-soft inline-flex h-12 min-w-40 items-center justify-center rounded-2xl border px-5 text-sm font-medium text-[var(--color-foreground)] transition hover:bg-[var(--surface-hover)]"
          >
            Voltar
          </Link>
        </div>
      </div>
    </SidebarShell>
  );
}
