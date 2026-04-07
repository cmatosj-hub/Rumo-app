import Link from "next/link";
import { redirect } from "next/navigation";
import {
  ArrowRight,
  CarFront,
  ChartNoAxesCombined,
  Coins,
  Goal,
  ReceiptText,
  ScrollText,
  Settings2,
  Timer,
} from "lucide-react";

import { ThemeToggle } from "@/components/theme/theme-toggle";
import { Card, CardContent } from "@/components/ui/card";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const mainAreas = [
  { label: "Home", icon: ChartNoAxesCombined },
  { label: "Fechamento do dia", icon: ReceiptText },
  { label: "Carro", icon: CarFront },
  { label: "Contas", icon: ScrollText },
  { label: "Relatorios", icon: ChartNoAxesCombined },
  { label: "Ajustes", icon: Settings2 },
] as const;

const landingMetrics = [
  {
    title: "Resultado da semana",
    value: "R$ 1.840",
    detail: "Veja quanto entrou na semana em poucos segundos.",
    icon: Goal,
    accentClassName: "accent-emerald-surface",
  },
  {
    title: "Dinheiro em caixa",
    value: "R$ 620",
    detail: "Entenda o valor disponivel para usar hoje.",
    icon: Coins,
    accentClassName: "accent-sky-surface",
  },
  {
    title: "Media por hora",
    value: "R$ 41/h",
    detail: "Acompanhe se o tempo de trabalho esta rendendo bem.",
    icon: Timer,
    accentClassName: "accent-amber-surface",
  },
] as const;

const workflowSteps = [
  "Lance Uber, 99, outros ganhos e os gastos principais do dia.",
  "Informe horario e KM para o sistema calcular horas, media por hora e lucro por KM.",
  "Veja um resumo rapido da semana, do carro e do que realmente sobrou.",
] as const;

const focusCards = [
  {
    title: "Fechamento simples",
    description: "Nada de corrida por corrida. O foco e fechar o dia inteiro com poucos campos.",
  },
  {
    title: "Carro sob controle",
    description: "Acompanhe KM atual, consumo medio, abastecimentos e manutencoes sem complicacao.",
  },
  {
    title: "Leitura rapida",
    description: "Resultado da semana, dinheiro em caixa, media por hora e um insight util logo na home.",
  },
] as const;

export default async function HomePage() {
  const supabase = await createServerSupabaseClient();

  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      redirect("/dashboard");
    }
  }

  return (
    <main className="mx-auto min-h-screen max-w-7xl px-4 py-4 sm:px-6 lg:px-8">
      <div className="space-y-6">
        <header className="glass-panel theme-border flex flex-col gap-4 rounded-[2rem] border px-5 py-5 shadow-2xl shadow-black/30 sm:flex-row sm:items-center sm:justify-between sm:px-6">
          <div>
            <p className="accent-emerald text-sm uppercase tracking-[0.24em]">Sistema RUMO</p>
            <p className="mt-2 text-sm text-[var(--color-muted-foreground)]">
              Painel diario para motorista de aplicativo.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <ThemeToggle />
            <Link
              href="/login"
              className="theme-border surface-soft surface-hover rounded-2xl border px-4 py-3 text-sm font-medium text-[var(--color-foreground)] transition"
            >
              Entrar
            </Link>
            <Link
              href="/register"
              className="home-cta-button rounded-2xl border px-4 py-3 text-sm font-semibold transition"
            >
              Criar conta
            </Link>
          </div>
        </header>

        <section className="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
          <div className="glass-panel theme-border rounded-[2rem] border p-7 shadow-2xl shadow-black/30 lg:p-10">
            <div className="accent-emerald-surface inline-flex items-center rounded-full border px-4 py-2 text-sm">
              Fechamento do dia com poucos campos
            </div>

            <h1 className="mt-6 max-w-4xl text-4xl font-semibold tracking-tight text-[var(--color-foreground)] sm:text-5xl lg:text-6xl">
              O motorista entende rapido quanto ganhou, quanto gastou e quanto sobrou.
            </h1>

            <p className="mt-6 max-w-3xl text-lg leading-8 text-[var(--color-muted-foreground)]">
              O RUMO foi feito para fechar o dia sem burocracia. Registre ganhos, gastos, horas e KM e receba uma
              leitura clara da semana, do carro e da sua operacao.
            </p>

            <div className="mt-8 flex flex-col gap-3 sm:flex-row">
              <Link
                href="/register"
                className="home-cta-button inline-flex min-h-12 items-center justify-center gap-2 rounded-2xl border px-6 py-3 text-sm font-semibold transition"
              >
                Comecar agora
                <ArrowRight className="h-4 w-4" />
              </Link>
              <Link
                href="/login"
                className="theme-border surface-soft surface-hover inline-flex min-h-12 items-center justify-center rounded-2xl border px-6 py-3 text-sm font-semibold text-[var(--color-foreground)] transition"
              >
                Ja tenho conta
              </Link>
            </div>

            <div className="mt-8 grid gap-3 sm:grid-cols-3">
              {workflowSteps.map((step, index) => (
                <div key={step} className="theme-border surface-soft rounded-3xl border p-4">
                  <p className="accent-sky text-xs uppercase tracking-[0.2em]">Passo {index + 1}</p>
                  <p className="mt-3 text-sm leading-6 text-[var(--color-muted-foreground)]">{step}</p>
                </div>
              ))}
            </div>
          </div>

          <div className="space-y-4">
            <Card className="ring-1 ring-emerald-300/18">
              <CardContent className="p-6">
                <p className="text-sm uppercase tracking-[0.2em] text-[var(--color-muted-foreground)]">
                  Visao da home
                </p>
                <h2 className="mt-3 text-2xl font-semibold text-[var(--color-foreground)]">
                  O conteudo importante aparece primeiro
                </h2>
                <p className="mt-3 text-sm leading-6 text-[var(--color-muted-foreground)]">
                  Resultado da semana, dinheiro em caixa, media por hora e insight automatico em leitura rapida.
                </p>
              </CardContent>
            </Card>

            {landingMetrics.map((item) => {
              const Icon = item.icon;

              return (
                <Card key={item.title}>
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="text-sm uppercase tracking-[0.2em] text-[var(--color-muted-foreground)]">
                          {item.title}
                        </p>
                        <p className="mt-4 text-3xl font-semibold text-[var(--color-foreground)]">{item.value}</p>
                      </div>
                      <div className={`${item.accentClassName} rounded-2xl border p-3`}>
                        <Icon className="h-5 w-5" />
                      </div>
                    </div>
                    <p className="mt-4 text-sm leading-6 text-[var(--color-muted-foreground)]">{item.detail}</p>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </section>

        <section className="grid gap-4 lg:grid-cols-[0.95fr_1.05fr]">
          <Card>
            <CardContent className="p-6 lg:p-8">
              <p className="text-sm uppercase tracking-[0.2em] text-[var(--color-muted-foreground)]">
                Estrutura principal
              </p>
              <h2 className="mt-3 text-2xl font-semibold text-[var(--color-foreground)]">
                O sistema gira em torno da rotina real do motorista
              </h2>
              <p className="mt-3 text-sm leading-6 text-[var(--color-muted-foreground)]">
                Sem ERP pesado. Cada area existe para ajudar o motorista a decidir melhor no dia a dia.
              </p>

              <div className="mt-6 grid gap-3 sm:grid-cols-2">
                {mainAreas.map((area) => {
                  const Icon = area.icon;

                  return (
                    <div key={area.label} className="theme-border surface-soft rounded-3xl border p-4">
                      <div className="flex items-center gap-3">
                        <div className="accent-emerald-surface rounded-2xl border p-2">
                          <Icon className="h-4 w-4" />
                        </div>
                        <p className="font-semibold text-[var(--color-foreground)]">{area.label}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          <div className="grid gap-4 md:grid-cols-3">
            {focusCards.map((item) => (
              <Card key={item.title}>
                <CardContent className="p-6">
                  <p className="text-lg font-semibold text-[var(--color-foreground)]">{item.title}</p>
                  <p className="mt-3 text-sm leading-6 text-[var(--color-muted-foreground)]">{item.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
