"use client";

import type React from "react";
import Link from "next/link";
import { ArrowRight, Coins, Fuel, Goal, Route, Timer } from "lucide-react";
import { useMemo } from "react";

import { useDriverJournal } from "@/components/driver-journal/use-driver-journal";
import { Card, CardContent } from "@/components/ui/card";
import { computeProjectedTarget } from "@/lib/rumo-engine";
import type { DashboardData } from "@/lib/types";

const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function DashboardClient({ data }: { data: DashboardData }) {
  const { store } = useDriverJournal();

  const weeklyClosures = useMemo(() => {
    const today = new Date();
    const startOfWeek = getStartOfWeek(today);
    const endOfWeek = new Date(startOfWeek);
    endOfWeek.setDate(endOfWeek.getDate() + 7);

    return store.closures.filter((closure) => {
      const closureDate = parseDateKey(closure.date);
      return closureDate >= startOfWeek && closureDate < endOfWeek;
    });
  }, [store.closures]);

  const metrics = useMemo(() => {
    const resultWeek = weeklyClosures.reduce((sum, closure) => sum + closure.totalGains, 0);
    const expenseWeek = weeklyClosures.reduce((sum, closure) => sum + closure.totalExpenses, 0);
    const workedMinutesWeek = weeklyClosures.reduce((sum, closure) => sum + closure.workedMinutes, 0);
    const kmWeek = weeklyClosures.reduce((sum, closure) => sum + closure.workedKm, 0);
    const hourlyAverageWeek = workedMinutesWeek > 0 ? resultWeek / (workedMinutesWeek / 60) : 0;
    const profitPerKmWeek = kmWeek > 0 ? (resultWeek - expenseWeek) / kmWeek : 0;
    const consumptionEntries = weeklyClosures
      .map((closure) => closure.fuelConsumption)
      .filter((value): value is number => value !== null && value > 0);
    const averageConsumptionWeek =
      consumptionEntries.length > 0
        ? consumptionEntries.reduce((sum, value) => sum + value, 0) / consumptionEntries.length
        : null;
    const weeklyGoal = data.summary.metaSemanal;
    const goalProgress = weeklyGoal > 0 ? (resultWeek / weeklyGoal) * 100 : 0;
    const goalRemaining = Math.max(weeklyGoal - resultWeek, 0);
    const availableNow = data.summary.totalPessoal > 0 ? data.summary.totalPessoal : data.summary.ganhoLiquidoReal;

    return {
      resultWeek,
      expenseWeek,
      workedMinutesWeek,
      kmWeek,
      profitPerKmWeek,
      averageConsumptionWeek,
      weeklyGoal,
      goalProgress,
      goalRemaining,
      availableNow,
      hourlyAverageWeek,
    };
  }, [data.summary, weeklyClosures]);

  const greeting = useMemo(() => buildGreeting(getFirstName(data.profile?.fullName, data.profile?.username)), [data.profile]);
  const insight = useMemo(() => buildInsight(data, weeklyClosures, metrics), [data, metrics, weeklyClosures]);

  return (
    <div className="space-y-6">
      <section>
        <h1 className="text-3xl font-semibold tracking-tight text-[var(--color-foreground)]">{greeting}</h1>
      </section>

      <InsightCard insight={insight} />

      <section className="grid gap-4 xl:grid-cols-3">
        <MetricCard
          title="Resultado da semana"
          value={money.format(metrics.resultWeek)}
          icon={Goal}
          accentClassName="accent-emerald-surface"
          lines={[
            `Meta: ${money.format(metrics.weeklyGoal)}`,
            `${Math.round(metrics.goalProgress)}% da meta`,
            metrics.goalRemaining > 0 ? `Faltam ${money.format(metrics.goalRemaining)}` : "Meta concluida",
          ]}
          featured
        />

        <MetricCard
          title="Dinheiro em caixa"
          value={money.format(metrics.availableNow)}
          icon={Coins}
          accentClassName="accent-sky-surface"
          lines={["Disponivel para uso agora"]}
        />

        <MetricCard
          title="Media por hora"
          value={metrics.workedMinutesWeek > 0 ? `${money.format(metrics.hourlyAverageWeek)}/h` : "--"}
          icon={Timer}
          accentClassName="accent-amber-surface"
          lines={[
            metrics.workedMinutesWeek > 0 ? `${formatWorkedHours(metrics.workedMinutesWeek)} trabalhadas` : "Sem horas registradas",
          ]}
        />
      </section>

      <Card className="overflow-hidden ring-1 ring-emerald-300/18">
        <CardContent className="p-6">
          <div className="grid gap-6 lg:grid-cols-[1.2fr_0.8fr] lg:items-center">
            <div>
              <p className="text-sm uppercase tracking-[0.2em] text-[var(--color-muted-foreground)]">Fechamento do dia</p>
              <h2 className="mt-3 text-2xl font-semibold text-[var(--color-foreground)]">Registre sua jornada em poucos toques</h2>
              <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--color-muted-foreground)]">
                Registre os ganhos, gastos, horas e KM da sua jornada.
              </p>
            </div>

            <div className="flex lg:justify-end">
              <Link
                href="/transactions"
                className="home-cta-button inline-flex min-h-12 w-full items-center justify-center gap-2 rounded-2xl border px-6 py-3 text-sm font-semibold transition lg:w-auto lg:min-w-64"
              >
                Registrar fechamento do dia
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-6">
          <div className="mb-5">
            <p className="text-sm uppercase tracking-[0.2em] text-[var(--color-muted-foreground)]">Resumo operacional da semana</p>
            <h2 className="mt-2 text-xl font-semibold text-[var(--color-foreground)]">Outros resultados</h2>
          </div>

          <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
            <SupportMetricCard
              label="Horas trabalhadas"
              value={metrics.workedMinutesWeek > 0 ? formatWorkedHours(metrics.workedMinutesWeek) : "--"}
              icon={Timer}
            />
            <SupportMetricCard
              label="KM rodados"
              value={metrics.kmWeek > 0 ? `${metrics.kmWeek} km` : "--"}
              icon={Route}
            />
            <SupportMetricCard
              label="Lucro por km"
              value={metrics.kmWeek > 0 ? money.format(metrics.profitPerKmWeek) : "--"}
              suffix={metrics.kmWeek > 0 ? "/km" : undefined}
              icon={Coins}
            />
            <SupportMetricCard
              label="Consumo medio"
              value={metrics.averageConsumptionWeek ? metrics.averageConsumptionWeek.toFixed(1) : "--"}
              suffix={metrics.averageConsumptionWeek ? "km/l" : undefined}
              icon={Fuel}
            />
          </div>
        </CardContent>
      </Card>

    </div>
  );
}

function InsightCard({
  insight,
}: {
  insight: {
    title: string;
    message: string;
    tone: "positive" | "warning" | "critical";
  };
}) {
  const toneStyles = {
    positive: "border-[var(--color-border)] bg-[var(--surface-strong)] text-[var(--color-foreground)]",
    warning: "insight-warning border-amber-300/24 bg-amber-400/10 text-amber-100",
    critical: "insight-critical border-rose-300/24 bg-rose-400/10 text-rose-100",
  } as const;

  return (
    <Card className={`border ${toneStyles[insight.tone]} shadow-none`}>
      <CardContent className="p-5">
        <p className="text-sm leading-6 text-current/90">
          <span className="font-semibold text-current">{insight.title}</span>{" "}
          {insight.message}
        </p>
      </CardContent>
    </Card>
  );
}

function MetricCard({
  title,
  value,
  lines,
  icon: Icon,
  accentClassName,
  featured = false,
}: {
  title: string;
  value: string;
  lines: string[];
  icon: React.ComponentType<{ className?: string }>;
  accentClassName: string;
  featured?: boolean;
}) {
  return (
    <Card className={featured ? "ring-1 ring-emerald-300/20" : undefined}>
      <CardContent className="p-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-[var(--color-muted-foreground)]">{title}</p>
            <p className="mt-4 text-3xl font-semibold text-[var(--color-foreground)]">{value}</p>
          </div>
          <div className={`${accentClassName} rounded-2xl border p-3`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>

        <div className="mt-5 space-y-1 text-sm text-[var(--color-muted-foreground)]">
          {lines.map((line) => (
            <p key={line}>{line}</p>
          ))}
        </div>
      </CardContent>
    </Card>
  );
}

function SupportMetricCard({
  label,
  value,
  icon: Icon,
  suffix,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  suffix?: string;
}) {
  return (
    <div className="theme-border surface-soft rounded-3xl border p-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-sm uppercase tracking-[0.16em] text-[var(--color-muted-foreground)]">{label}</p>
        <div className="rounded-2xl bg-[var(--surface-strong)] p-2 text-[var(--color-muted-foreground)]">
          <Icon className="h-4 w-4" />
        </div>
      </div>
      <p className="mt-4 text-2xl font-semibold text-[var(--color-foreground)]">
        {value}
        {suffix ? <span className="ml-1 text-base text-[var(--color-muted-foreground)]">{suffix}</span> : null}
      </p>
    </div>
  );
}

function buildGreeting(name: string) {
  const hour = Number(
    new Intl.DateTimeFormat("en-GB", {
      hour: "2-digit",
      hour12: false,
      timeZone: "America/Sao_Paulo",
    }).format(new Date()),
  );

  if (hour >= 5 && hour <= 11) {
    return `Bom dia, ${name}.`;
  }

  if (hour >= 12 && hour <= 17) {
    return `Boa tarde, ${name}.`;
  }

  return `Boa noite, ${name}.`;
}

function getFirstName(fullName?: string | null, username?: string | null) {
  const source = fullName?.trim() || username?.trim() || "motorista";
  return source.split(" ")[0] || "motorista";
}

function buildInsight(
  data: DashboardData,
  weeklyClosures: Array<{
    totalGains: number;
    totalExpenses: number;
    workedMinutes: number;
    workedKm: number;
    fuelAmount: number;
    fuelConsumption: number | null;
  }>,
  metrics: {
    resultWeek: number;
    expenseWeek: number;
    workedMinutesWeek: number;
    kmWeek: number;
    profitPerKmWeek: number;
    averageConsumptionWeek: number | null;
    weeklyGoal: number;
    goalProgress: number;
    goalRemaining: number;
    hourlyAverageWeek: number;
  },
): {
  title: string;
  message: string;
  tone: "positive" | "warning" | "critical";
} {
  if (metrics.resultWeek <= 0) {
    return {
      title: "Semana sem dados ainda",
      message: "Registre o fechamento do dia para o sistema mostrar sua semana e gerar leituras mais uteis.",
      tone: "positive" as const,
    };
  }

  if (metrics.goalRemaining <= 0) {
    return {
      title: "Meta semanal atingida",
      message: "Parabens, sua meta semanal ja foi atingida. O que entrar agora aumenta seu ganho.",
      tone: "positive" as const,
    };
  }

  const projectedGoal = computeProjectedTarget(metrics.weeklyGoal, data.settings.diasTrabalhoSemana);
  if (projectedGoal > 0 && metrics.resultWeek < projectedGoal * 0.85) {
    return {
      title: "Meta da semana pede atencao",
      message: "Voce esta abaixo da meta da semana. Talvez seja necessario aumentar a arrecadacao nos proximos dias.",
      tone: "critical" as const,
    };
  }

  if (metrics.goalProgress > 0 && metrics.goalProgress < 100) {
    return {
      title: "Meta semanal em andamento",
      message: `Voce ja atingiu ${Math.round(metrics.goalProgress)}% da meta semanal. Faltam ${money.format(metrics.goalRemaining)} para concluir.`,
      tone: metrics.goalProgress >= 75 ? "positive" : "warning",
    };
  }

  const averageDailyResult = weeklyClosures.reduce((sum, closure) => sum + closure.totalGains, 0) / weeklyClosures.length;
  const latestDayResult = weeklyClosures[0]?.totalGains ?? 0;
  if (latestDayResult > averageDailyResult * 1.12) {
    return {
      title: "Arrecadacao em alta",
      message: "Sua arrecadacao esta acima da media recente. A semana esta com bom desempenho.",
      tone: "positive" as const,
    };
  }

  const previousClosures = weeklyClosures.slice(1);
  const previousHourlyAverage =
    previousClosures.reduce((sum, closure) => sum + closure.workedMinutes, 0) > 0
      ? previousClosures.reduce((sum, closure) => sum + closure.totalGains, 0) /
        (previousClosures.reduce((sum, closure) => sum + closure.workedMinutes, 0) / 60)
      : null;

  if (previousHourlyAverage && metrics.hourlyAverageWeek < previousHourlyAverage * 0.9) {
    return {
      title: "Media por hora caiu",
      message: "Sua media por hora caiu nesta semana. Pode valer revisar horarios ou dias de trabalho.",
      tone: "warning" as const,
    };
  }

  if (metrics.profitPerKmWeek > 0 && metrics.profitPerKmWeek < 1) {
    return {
      title: "Lucro por km caiu",
      message: "Seu lucro por km caiu bastante nesta semana. Seus custos podem estar pressionando o resultado.",
      tone: "critical" as const,
    };
  }

  if (metrics.averageConsumptionWeek) {
    const latestConsumption = weeklyClosures[0]?.fuelConsumption;
    if (latestConsumption && latestConsumption < metrics.averageConsumptionWeek * 0.9) {
      return {
        title: "Consumo de combustivel piorou",
        message: "O consumo do carro caiu nesta semana. Pode indicar transito pesado ou necessidade de revisao.",
        tone: "warning" as const,
      };
    }
  }

  if (weeklyClosures.some((closure) => closure.totalExpenses > 0) && metrics.resultWeek > 0 && metrics.expenseWeek / metrics.resultWeek > 0.35) {
    return {
      title: "Gastos acima do esperado",
      message: "Seus gastos estao altos em relacao a arrecadacao. Isso reduz seu lucro real.",
      tone: "warning" as const,
    };
  }

  return {
    title: "Semana com bom ritmo",
    message: "A semana esta com bom desempenho. Seu rendimento segue consistente.",
    tone: "positive" as const,
  };
}

function getStartOfWeek(date: Date) {
  const normalized = new Date(date);
  normalized.setHours(0, 0, 0, 0);
  const day = normalized.getDay();
  const diff = day === 0 ? -6 : 1 - day;
  normalized.setDate(normalized.getDate() + diff);
  return normalized;
}

function parseDateKey(dateKey: string) {
  const [year, month, day] = dateKey.split("-").map(Number);
  return new Date(year, month - 1, day);
}

function formatWorkedHours(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${String(remainingMinutes).padStart(2, "0")}min`;
}
