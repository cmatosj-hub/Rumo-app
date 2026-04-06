import { Suspense } from "react";
import { Settings2, WalletCards } from "lucide-react";

import { SidebarShell } from "@/components/layout/sidebar-shell";
import { SettingsClient } from "@/components/settings/settings-client";
import { WalletsClient } from "@/components/wallets/wallets-client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getDashboardData } from "@/lib/data/app";

export default async function SettingsPage() {
  const data = await getDashboardData();

  return (
    <SidebarShell>
      <div className="flex items-center gap-3">
        <div className="accent-emerald-surface rounded-2xl border p-3">
          <Settings2 className="h-5 w-5" />
        </div>
        <div>
          <p className="accent-emerald text-sm uppercase tracking-[0.24em]">Ajustes</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-[var(--color-foreground)]">
            Metas, divisao automatica e onde esta o dinheiro
          </h1>
        </div>
      </div>

      <div className="mt-8 space-y-8">
        <Suspense
          fallback={
            <div className="glass-panel theme-border rounded-[1.75rem] border p-8 text-[var(--color-muted-foreground)]">
              Carregando seus ajustes...
            </div>
          }
        >
          <SettingsClient />
        </Suspense>

        <Card>
          <CardHeader>
            <div className="flex items-center gap-3">
              <div className="accent-emerald-surface rounded-2xl border p-2">
                <WalletCards className="h-4 w-4" />
              </div>
              <div>
                <CardTitle>Onde esta o dinheiro</CardTitle>
                <CardDescription>Organize o que esta no digital, no dinheiro e no banco.</CardDescription>
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <WalletsClient wallets={data.wallets} />
          </CardContent>
        </Card>
      </div>
    </SidebarShell>
  );
}
