"use client";

import type React from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { PiggyBank, ShieldCheck, TrendingUp } from "lucide-react";
import { useMemo, useState, useTransition } from "react";

import {
  addCreditorAction,
  deleteCreditorAction,
  saveSettingsAction,
  toggleCreditorStatusAction,
} from "@/app/settings/actions";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { SettingsPageData } from "@/lib/types";

async function fetchSettingsOverview(): Promise<SettingsPageData> {
  const response = await fetch("/api/settings", { cache: "no-store" });
  if (!response.ok) {
    throw new Error("Falha ao carregar configuracoes.");
  }
  return response.json();
}

const currencyFormatter = new Intl.NumberFormat("pt-BR", {
  style: "currency",
  currency: "BRL",
});

export function SettingsClient() {
  const queryClient = useQueryClient();
  const { data, isLoading, isError } = useQuery({
    queryKey: ["settings-overview"],
    queryFn: fetchSettingsOverview,
  });

  if (isLoading) {
    return <div className="mt-8 text-[var(--color-muted-foreground)]">Carregando configuracoes...</div>;
  }

  if (isError || !data) {
    return (
      <div className="mt-8 rounded-3xl border border-red-400/30 bg-red-400/10 p-6 text-[var(--color-foreground)]">
        Nao foi possivel carregar os dados da area de configuracoes.
      </div>
    );
  }

  return (
    <SettingsClientContent
      key={`${data.settings.metaDiaria}-${data.settings.diasTrabalhoSemana}-${data.creditors.length}`}
      data={data}
      queryClient={queryClient}
    />
  );
}

function SettingsClientContent({
  data,
  queryClient,
}: {
  data: SettingsPageData;
  queryClient: ReturnType<typeof useQueryClient>;
}) {
  const [pending, startTransition] = useTransition();
  const [pendingCreditor, startCreditorTransition] = useTransition();
  const [statusMessage, setStatusMessage] = useState<string | null>(null);
  const [settingsForm, setSettingsForm] = useState(data.settings);
  const [creditorForm, setCreditorForm] = useState({
    nome: "",
    valorMensal: "",
    diaVencimento: "10",
  });

  const splitTotal = useMemo(
    () =>
      settingsForm.porcentagemOperacional +
      settingsForm.porcentagemEmergencia +
      settingsForm.porcentagemPessoal,
    [settingsForm],
  );

  return (
    <div className="mt-8 space-y-8">
      <section className="grid gap-4 xl:grid-cols-3">
        <MetricCard
          title="Custo minimo do dia"
          value={currencyFormatter.format(data.summary.dailyBreakEven)}
          description="Quanto do dia precisa cobrir seus credores ativos."
          icon={ShieldCheck}
        />
        <MetricCard
          title="Custos fixos mensais"
          value={currencyFormatter.format(data.summary.monthlyFixedCost)}
          description="Base total usada no calculo de provisao de credores."
          icon={PiggyBank}
        />
        <MetricCard
          title="Meta semanal projetada"
          value={currencyFormatter.format(data.summary.weeklyTarget)}
          description="Meta diaria multiplicada pela quantidade de dias ativos."
          icon={TrendingUp}
        />
      </section>

      {data.authRequired ? (
        <div className="accent-amber-surface rounded-3xl border p-5 text-sm leading-6">
          Faca login em <a className="font-semibold underline" href="/login">/login</a> para persistir os dados no Supabase.
        </div>
      ) : null}

      {data.isDemoMode ? (
        <div className="accent-sky-surface rounded-3xl border p-5 text-sm leading-6">
          Projeto em modo de demonstracao. O schema e a interface ja estao prontos, mas o salvamento depende das variaveis do Supabase.
        </div>
      ) : null}

      {statusMessage ? (
        <div className="accent-emerald-surface rounded-3xl border p-4 text-sm">
          {statusMessage}
        </div>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_420px]">
        <Card>
          <CardHeader>
            <CardTitle>Metas</CardTitle>
            <CardDescription>
              Ajuste sua meta diaria e quantos dias pretende trabalhar por semana.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2">
              <Field
                label="Meta diaria"
                type="number"
                value={settingsForm.metaDiaria}
                onChange={(value) => setSettingsForm((current) => ({ ...current, metaDiaria: Number(value) }))}
              />
              <Field
                label="Dias por semana"
                type="number"
                value={settingsForm.diasTrabalhoSemana}
                onChange={(value) =>
                  setSettingsForm((current) => ({ ...current, diasTrabalhoSemana: Number(value) }))
                }
              />
            </div>

            <div className="space-y-4">
              <div>
                <p className="text-sm uppercase tracking-[0.18em] text-[var(--color-muted-foreground)]">
                  Divisao automatica do dinheiro
                </p>
                <p className="mt-2 text-sm leading-6 text-[var(--color-muted-foreground)]">
                  Defina como cada ganho sera separado automaticamente.
                </p>
              </div>

              <div className="grid gap-4 md:grid-cols-3 md:items-start">
              <Field
                label="Dinheiro para rodar %"
                type="number"
                value={settingsForm.porcentagemOperacional}
                onChange={(value) =>
                  setSettingsForm((current) => ({ ...current, porcentagemOperacional: Number(value) }))
                }
              />
              <Field
                label="Fundo de seguranca %"
                type="number"
                value={settingsForm.porcentagemEmergencia}
                onChange={(value) =>
                  setSettingsForm((current) => ({ ...current, porcentagemEmergencia: Number(value) }))
                }
              />
              <Field
                label="Disponivel para voce %"
                type="number"
                value={settingsForm.porcentagemPessoal}
                onChange={(value) =>
                  setSettingsForm((current) => ({ ...current, porcentagemPessoal: Number(value) }))
                }
              />
              </div>
            </div>

            <div className="theme-border surface-soft rounded-3xl border p-5">
              <div className="flex items-center justify-between gap-3">
                <p className="text-sm uppercase tracking-[0.18em] text-[var(--color-muted-foreground)]">
                  Validacao do split
                </p>
                <Badge variant={splitTotal === 100 ? "success" : "warning"}>{splitTotal}%</Badge>
              </div>
              <p className="mt-3 text-sm leading-6 text-[var(--color-muted-foreground)]">
                Cada ganho sera separado automaticamente entre rodar, seguranca e o que fica disponivel para voce.
              </p>
            </div>

            <Button
              disabled={pending}
              onClick={() =>
                startTransition(async () => {
                  const result = await saveSettingsAction(settingsForm);
                  setStatusMessage(result.message);
                  if (result.ok) {
                    await queryClient.invalidateQueries({ queryKey: ["settings-overview"] });
                  }
                })
              }
            >
              {pending ? "Salvando..." : "Salvar ajustes"}
            </Button>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Resumo do split</CardTitle>
            <CardDescription>Previa de como R$ 1.000 de ganho seria distribuido hoje.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {[
              ["Dinheiro para rodar", settingsForm.porcentagemOperacional],
              ["Fundo de seguranca", settingsForm.porcentagemEmergencia],
              ["Disponivel para voce", settingsForm.porcentagemPessoal],
            ].map(([label, percentage]) => (
              <div key={label} className="theme-border surface-soft rounded-3xl border p-4">
                <div className="flex items-center justify-between gap-3 text-sm text-[var(--color-muted-foreground)]">
                  <span>{label}</span>
                  <span>{percentage}%</span>
                </div>
                <p className="mt-2 text-2xl font-semibold text-[var(--color-foreground)]">
                  {currencyFormatter.format((1000 * Number(percentage)) / 100)}
                </p>
              </div>
            ))}
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-6 xl:grid-cols-[minmax(0,1fr)_340px]">
        <Card>
          <CardHeader>
            <CardTitle>Credores e custos fixos</CardTitle>
            <CardDescription>
              Cadastre os compromissos mensais que entram no calculo automatico de break-even.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-4">
              <Field
                label="Nome do credor"
                value={creditorForm.nome}
                onChange={(value) => setCreditorForm((current) => ({ ...current, nome: value }))}
              />
              <Field
                label="Valor mensal"
                type="number"
                value={creditorForm.valorMensal}
                onChange={(value) => setCreditorForm((current) => ({ ...current, valorMensal: value }))}
              />
              <Field
                label="Vencimento"
                type="number"
                value={creditorForm.diaVencimento}
                onChange={(value) => setCreditorForm((current) => ({ ...current, diaVencimento: value }))}
              />
              <div>
                <Button
                  className="w-full"
                  disabled={pendingCreditor}
                  onClick={() =>
                    startCreditorTransition(async () => {
                      const result = await addCreditorAction({
                        nome: creditorForm.nome,
                        valorMensal: Number(creditorForm.valorMensal),
                        diaVencimento: Number(creditorForm.diaVencimento),
                      });
                      setStatusMessage(result.message);
                      if (result.ok) {
                        setCreditorForm({ nome: "", valorMensal: "", diaVencimento: "10" });
                        await queryClient.invalidateQueries({ queryKey: ["settings-overview"] });
                      }
                    })
                  }
                >
                  {pendingCreditor ? "Adicionando..." : "Adicionar"}
                </Button>
              </div>
            </div>

            <div className="space-y-3">
              {data.creditors.length === 0 ? (
                <div className="theme-border rounded-3xl border border-dashed p-6 text-sm text-[var(--color-muted-foreground)]">
                  Nenhum credor cadastrado ainda.
                </div>
              ) : null}

              {data.creditors.map((creditor) => (
                <div
                  key={creditor.id}
                  className="theme-border surface-soft flex flex-col gap-4 rounded-3xl border p-4 xl:flex-row xl:items-center xl:justify-between"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-3">
                      <h3 className="break-words font-semibold text-[var(--color-foreground)]">{creditor.nome}</h3>
                      <Badge variant={creditor.status === "ativo" ? "success" : "secondary"}>
                        {creditor.status}
                      </Badge>
                    </div>
                    <p className="mt-2 break-words text-sm leading-6 text-[var(--color-muted-foreground)]">
                      {currencyFormatter.format(creditor.valorMensal)} por mes · vence todo dia {creditor.diaVencimento}
                    </p>
                  </div>

                  <div className="flex flex-col gap-3 sm:flex-row">
                    <Button
                      variant="secondary"
                      onClick={async () => {
                        const result = await toggleCreditorStatusAction(
                          creditor.id,
                          creditor.status === "ativo" ? "pago" : "ativo",
                        );
                        setStatusMessage(result.message);
                        if (result.ok) {
                          await queryClient.invalidateQueries({ queryKey: ["settings-overview"] });
                        }
                      }}
                    >
                      {creditor.status === "ativo" ? "Marcar pago" : "Reativar"}
                    </Button>
                    <Button
                      variant="ghost"
                      onClick={async () => {
                        const result = await deleteCreditorAction(creditor.id);
                        setStatusMessage(result.message);
                        if (result.ok) {
                          await queryClient.invalidateQueries({ queryKey: ["settings-overview"] });
                        }
                      }}
                    >
                      Excluir
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Leitura operacional</CardTitle>
            <CardDescription>Resumo rapido do impacto dos custos fixos no mes.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <ReadingRow label="Credores ativos" value={String(data.summary.activeCreditors)} />
            <ReadingRow
              label="Meta mensal base"
              value={currencyFormatter.format(data.summary.weeklyTarget * 4)}
            />
            <ReadingRow
              label="Cobertura de credores"
              value={`${Math.max(
                0,
                Math.round((data.summary.monthlyFixedCost / Math.max(data.summary.weeklyTarget * 4, 1)) * 100),
              )}%`}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

function MetricCard({
  title,
  value,
  description,
  icon: Icon,
}: {
  title: string;
  value: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Card className="overflow-hidden">
      <CardContent className="p-6">
        <div className="mb-5 flex items-start justify-between gap-4">
          <p className="max-w-[14rem] text-sm uppercase tracking-[0.18em] text-[var(--color-muted-foreground)]">
            {title}
          </p>
          <div className="accent-emerald-surface shrink-0 rounded-2xl border p-3">
            <Icon className="h-5 w-5" />
          </div>
        </div>
        <p className="text-3xl font-semibold tracking-tight text-[var(--color-foreground)]">{value}</p>
        <p className="mt-3 max-w-sm text-sm leading-6 text-[var(--color-muted-foreground)]">{description}</p>
      </CardContent>
    </Card>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string | number;
  onChange: (value: string) => void;
  type?: React.HTMLInputTypeAttribute;
}) {
  return (
    <div className="grid min-w-0 gap-2">
      <Label className="flex min-h-10 items-end leading-5">{label}</Label>
      <Input type={type} value={value} onChange={(event) => onChange(event.target.value)} />
    </div>
  );
}

function ReadingRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="theme-border surface-soft rounded-3xl border p-4">
      <p className="text-sm uppercase tracking-[0.18em] text-[var(--color-muted-foreground)]">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-[var(--color-foreground)]">{value}</p>
    </div>
  );
}
