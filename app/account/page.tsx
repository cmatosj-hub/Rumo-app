import { UserCircle2 } from "lucide-react";

import { AccountClient } from "@/components/account/account-client";
import { SidebarShell } from "@/components/layout/sidebar-shell";
import { AuthHint } from "@/components/shared/auth-hint";
import { getAccountPageData } from "@/lib/data/app";

export default async function AccountPage() {
  const data = await getAccountPageData();

  return (
    <SidebarShell>
      <div className="flex items-center gap-3">
        <div className="accent-emerald-surface rounded-2xl border p-3">
          <UserCircle2 className="h-5 w-5" />
        </div>
        <div>
          <p className="accent-emerald text-sm uppercase tracking-[0.24em]">Conta</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-[var(--color-foreground)]">
            Perfil, acesso e identidade do usuario
          </h1>
        </div>
      </div>

      <div className="mt-8 space-y-8">
        <AuthHint authRequired={data.authRequired} isDemoMode={data.isDemoMode} />
        <AccountClient profile={data.profile} />
      </div>
    </SidebarShell>
  );
}
