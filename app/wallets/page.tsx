import { WalletCards } from "lucide-react";

import { SidebarShell } from "@/components/layout/sidebar-shell";
import { WalletsClient } from "@/components/wallets/wallets-client";
import { getDashboardData } from "@/lib/data/app";

export default async function WalletsPage() {
  const data = await getDashboardData();

  return (
    <SidebarShell>
      <div className="flex items-center gap-3">
        <div className="accent-emerald-surface rounded-2xl border p-3">
          <WalletCards className="h-5 w-5" />
        </div>
        <div>
          <p className="accent-emerald text-sm uppercase tracking-[0.24em]">Carteiras</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-[var(--color-foreground)]">
            Controle de saldo fisico e digital
          </h1>
        </div>
      </div>

      <div className="mt-8 space-y-8">
        <WalletsClient wallets={data.wallets} />
      </div>
    </SidebarShell>
  );
}
