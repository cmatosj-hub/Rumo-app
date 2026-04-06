import { Landmark, WalletMinimal } from "lucide-react";
import Link from "next/link";

import { SidebarShell } from "@/components/layout/sidebar-shell";
import { AuthHint } from "@/components/shared/auth-hint";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { getSettingsPageData } from "@/lib/data/settings";

const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export default async function ContasPage() {
  const data = await getSettingsPageData();

  return (
    <SidebarShell>
      <div className="flex items-center gap-3">
        <div className="accent-emerald-surface rounded-2xl border p-3">
          <WalletMinimal className="h-5 w-5" />
        </div>
        <div>
          <p className="accent-emerald text-sm uppercase tracking-[0.24em]">Contas</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-[var(--color-foreground)]">
            Seus compromissos fixos em um lugar so
          </h1>
        </div>
      </div>

      <div className="mt-8 space-y-8">
        <AuthHint authRequired={data.authRequired} isDemoMode={data.isDemoMode} />

        <div className="grid gap-6 xl:grid-cols-[0.85fr_1.15fr]">
          <Card>
            <CardHeader>
              <CardTitle>Custo minimo do dia</CardTitle>
              <CardDescription>Quanto precisa entrar por dia para cobrir suas contas fixas.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="theme-border surface-soft rounded-3xl border p-5">
                <p className="text-sm uppercase tracking-[0.18em] text-[var(--color-muted-foreground)]">
                  Voce precisa fazer pelo menos
                </p>
                <p className="mt-3 text-4xl font-semibold text-[var(--color-foreground)]">
                  {money.format(data.summary.dailyBreakEven)}
                </p>
                <p className="mt-3 text-sm leading-6 text-[var(--color-muted-foreground)]">
                  para cobrir seus custos fixos ativos.
                </p>
              </div>

              <div className="space-y-3">
                <SummaryLine label="Custos fixos do mes" value={money.format(data.summary.monthlyFixedCost)} />
                <SummaryLine label="Credores ativos" value={String(data.summary.activeCreditors)} />
              </div>

              <Link
                href="/settings"
                className="theme-border surface-soft surface-hover inline-flex items-center justify-center rounded-2xl border px-4 py-3 text-sm font-semibold text-[var(--color-foreground)] transition"
              >
                Ajustar contas e metas
              </Link>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Lista de contas</CardTitle>
              <CardDescription>Veja nome, valor mensal e vencimento de cada compromisso.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {data.creditors.length === 0 ? (
                <div className="theme-border rounded-3xl border border-dashed p-6 text-sm text-[var(--color-muted-foreground)]">
                  Nenhuma conta fixa cadastrada ainda.
                </div>
              ) : null}

              {data.creditors.map((creditor) => (
                <div key={creditor.id} className="theme-border surface-soft rounded-3xl border p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div className="min-w-0">
                      <div className="flex flex-wrap items-center gap-2">
                        <div className="accent-emerald-surface rounded-2xl border p-2">
                          <Landmark className="h-4 w-4" />
                        </div>
                        <p className="font-semibold text-[var(--color-foreground)]">{creditor.nome}</p>
                        <Badge variant={creditor.status === "ativo" ? "success" : "secondary"}>
                          {creditor.status}
                        </Badge>
                      </div>
                      <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">
                        Vence no dia {creditor.diaVencimento}
                      </p>
                    </div>
                    <p className="text-lg font-semibold text-[var(--color-foreground)]">
                      {money.format(creditor.valorMensal)}
                    </p>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>
        </div>
      </div>
    </SidebarShell>
  );
}

function SummaryLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 text-sm text-[var(--color-muted-foreground)]">
      <span>{label}</span>
      <span className="font-semibold text-[var(--color-foreground)]">{value}</span>
    </div>
  );
}
