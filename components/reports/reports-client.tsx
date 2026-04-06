"use client";

import { BarChart3, Fuel, Timer, TrendingUp } from "lucide-react";
import { useMemo } from "react";

import { useDriverJournal } from "@/components/driver-journal/use-driver-journal";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatWorkedHours, type DailyClosureRecord } from "@/lib/driver-journal";
import type { DashboardData } from "@/lib/types";

const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

type CalendarDayRow = {
  id: string;
  date: string;
  hasRecord: boolean;
  status: "registrado" | "sem_registro";
  lucro: number;
  km: number;
  workedMinutes: number;
  gains: number;
  expenses: number;
  hourlyAverage: number;
};

export function ReportsClient({ data }: { data: DashboardData }) {
  const { store } = useDriverJournal();

  const totals = useMemo(() => {
    const closures = store.closures;
    const realByDay: CalendarDayRow[] = closures.map((closure) => ({
      id: closure.id,
      date: closure.date,
      hasRecord: true,
      status: "registrado",
      lucro: closure.totalGains - closure.totalExpenses,
      km: closure.workedKm,
      workedMinutes: closure.workedMinutes,
      gains: closure.totalGains,
      expenses: closure.totalExpenses,
      hourlyAverage: closure.hourlyAverage,
    }));

    const calendarByDay = closures.length > 0 ? buildCalendarSeries(closures, 30) : [];
    const weeklyCalendar = calendarByDay.slice(0, 7);
    const monthlyCalendar = calendarByDay.slice(0, 30);
    const totalKm = realByDay.reduce((sum, row) => sum + row.km, 0);
    const totalWorkedMinutes = realByDay.reduce((sum, row) => sum + row.workedMinutes, 0);
    const totalProfit = realByDay.reduce((sum, row) => sum + row.lucro, 0);
    const fuelSpent = closures.reduce((sum, closure) => sum + closure.fuelAmount, 0);
    const maintenanceSpent = store.maintenanceEntries.reduce((sum, entry) => sum + entry.amount, 0);
    const averageConsumption = average(
      closures.map((closure) => closure.fuelConsumption).filter((value): value is number => Boolean(value)),
    );

    return {
      byDay: calendarByDay,
      weekly: weeklyCalendar.reduce((sum, row) => sum + row.lucro, 0),
      monthly: monthlyCalendar.reduce((sum, row) => sum + row.lucro, 0),
      workedDays: realByDay.length,
      totalKm,
      totalWorkedMinutes,
      totalProfit,
      fuelSpent,
      maintenanceSpent,
      averageConsumption,
      profitPerKm: totalKm > 0 ? totalProfit / totalKm : 0,
      profitPerHour: totalWorkedMinutes > 0 ? totalProfit / (totalWorkedMinutes / 60) : 0,
    };
  }, [store]);

  return (
    <>
      <div className="flex items-center gap-3">
        <div className="accent-emerald-surface rounded-2xl border p-3">
          <BarChart3 className="h-5 w-5" />
        </div>
        <div>
          <p className="accent-emerald text-sm uppercase tracking-[0.24em]">Relatorios</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-[var(--color-foreground)]">
            Desempenho, lucro e custo do carro
          </h1>
        </div>
      </div>

      <div className="mt-8 space-y-8">
        <section className="grid gap-4 xl:grid-cols-4">
          <MetricCard title="Lucro por semana" value={money.format(totals.weekly)} icon={TrendingUp} />
          <MetricCard title="Lucro por mes" value={money.format(totals.monthly)} icon={BarChart3} />
          <MetricCard title="Lucro por km" value={totals.profitPerKm ? money.format(totals.profitPerKm) : "--"} icon={Fuel} />
          <MetricCard title="Lucro por hora" value={totals.profitPerHour ? money.format(totals.profitPerHour) : "--"} icon={Timer} />
        </section>

        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <Card>
            <CardHeader>
              <CardTitle>Fechamentos por dia</CardTitle>
              <CardDescription>Calendario diario com dias registrados e dias sem registro.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {totals.byDay.length === 0 ? (
                <EmptyState message="Nenhum fechamento salvo ainda para montar os relatorios." />
              ) : null}
              {totals.byDay.map((day) => (
                <DayRow key={day.id} closure={day} />
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Indicadores do veiculo</CardTitle>
              <CardDescription>Produtividade considera apenas os dias com fechamento real.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <ReadingRow label="Dias trabalhados no periodo" value={totals.workedDays ? `${totals.workedDays} dia(s)` : "--"} />
              <ReadingRow label="KM rodados no periodo" value={totals.totalKm ? `${totals.totalKm} km` : "--"} />
              <ReadingRow
                label="Consumo medio do carro"
                value={totals.averageConsumption ? `${totals.averageConsumption.toFixed(1)} km/l` : "--"}
              />
              <ReadingRow label="Gasto com combustivel" value={money.format(totals.fuelSpent)} />
              <ReadingRow label="Gasto com manutencao" value={money.format(totals.maintenanceSpent)} />
            </CardContent>
          </Card>
        </div>
      </div>
    </>
  );
}

function MetricCard({
  title,
  value,
  icon: Icon,
}: {
  title: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <Card>
      <CardContent className="p-6">
        <div className="mb-5 flex items-start justify-between gap-4">
          <p className="max-w-[12rem] text-sm uppercase tracking-[0.18em] text-[var(--color-muted-foreground)]">{title}</p>
          <div className="accent-emerald-surface shrink-0 rounded-2xl border p-3">
            <Icon className="h-5 w-5" />
          </div>
        </div>
        <p className="text-3xl font-semibold leading-tight text-[var(--color-foreground)]">{value}</p>
      </CardContent>
    </Card>
  );
}

function DayRow({ closure }: { closure: CalendarDayRow }) {
  return (
    <div className="theme-border surface-soft rounded-3xl border p-4">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <p className="font-semibold text-[var(--color-foreground)]">
            {new Date(`${closure.date}T00:00:00`).toLocaleDateString("pt-BR")}
          </p>
          <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
            {closure.hasRecord ? `Entrou ${money.format(closure.gains)} · Gastou ${money.format(closure.expenses)}` : "Sem registro"}
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2 sm:justify-end">
          <Badge variant={closure.hasRecord ? "secondary" : "warning"}>
            {closure.hasRecord ? `${closure.km} km` : "Sem registro"}
          </Badge>
          <Badge variant="secondary">{closure.hasRecord ? formatWorkedHours(closure.workedMinutes) : "--"}</Badge>
          <Badge variant={closure.hasRecord ? (closure.lucro >= 0 ? "success" : "warning") : "secondary"}>
            {money.format(closure.lucro)}
          </Badge>
        </div>
      </div>
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

function EmptyState({ message }: { message: string }) {
  return (
    <div className="theme-border rounded-3xl border border-dashed p-6 text-sm text-[var(--color-muted-foreground)]">
      {message}
    </div>
  );
}

function average(values: number[]) {
  if (values.length === 0) {
    return null;
  }

  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function buildCalendarSeries(closures: DailyClosureRecord[], limit: number) {
  const byDate = new Map<string, CalendarDayRow>(
    closures.map((closure) => [
      closure.date,
      {
        id: closure.id,
        date: closure.date,
        hasRecord: true,
        status: "registrado",
        lucro: closure.totalGains - closure.totalExpenses,
        km: closure.workedKm,
        workedMinutes: closure.workedMinutes,
        gains: closure.totalGains,
        expenses: closure.totalExpenses,
        hourlyAverage: closure.hourlyAverage,
      },
    ]),
  );

  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const rows: CalendarDayRow[] = [];

  for (let index = 0; index < limit; index += 1) {
    const date = new Date(today);
    date.setDate(today.getDate() - index);
    const key = toDateKey(date);
    const existing = byDate.get(key);

    rows.push(
      existing ?? {
        id: `virtual-${key}`,
        date: key,
        hasRecord: false,
        status: "sem_registro",
        lucro: 0,
        km: 0,
        workedMinutes: 0,
        gains: 0,
        expenses: 0,
        hourlyAverage: 0,
      },
    );
  }

  return rows;
}

function toDateKey(date: Date) {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}
