import Link from "next/link";
import { FolderClock } from "lucide-react";

import { ClosuresHistoryClient } from "@/components/closures/closures-history-client";
import { SidebarShell } from "@/components/layout/sidebar-shell";

export default function ClosuresPage() {
  return (
    <SidebarShell>
      <div className="flex items-center gap-3">
        <div className="accent-emerald-surface rounded-2xl border p-3">
          <FolderClock className="h-5 w-5" />
        </div>
        <div>
          <p className="accent-emerald text-sm uppercase tracking-[0.24em]">Fechamentos</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-[var(--color-foreground)]">
            Histórico de fechamentos
          </h1>
        </div>
      </div>

      <div className="mt-8 space-y-6">
        <ClosuresHistoryClient />
        <div className="flex justify-start">
          <Link
            href="/transactions"
            className="theme-border surface-soft inline-flex h-12 min-w-40 items-center justify-center rounded-2xl border px-5 text-sm font-medium text-[var(--color-foreground)] transition hover:bg-[var(--surface-hover)]"
          >
            Voltar
          </Link>
        </div>
      </div>
    </SidebarShell>
  );
}
