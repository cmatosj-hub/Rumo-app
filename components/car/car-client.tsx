"use client";

import { CarFront, Fuel, Gauge, Wrench } from "lucide-react";
import { useMemo } from "react";

import { useDriverJournal } from "@/components/driver-journal/use-driver-journal";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import type { DashboardData } from "@/lib/types";

const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export function CarClient({ data }: { data: DashboardData }) {
  const { store } = useDriverJournal();

  const summary = useMemo(() => {
    const lastClosure = store.closures[0] ?? null;
    const fuelSpent = store.fuelEntries.reduce((sum, entry) => sum + entry.amount, 0);
    const maintenanceSpent = store.maintenanceEntries.reduce((sum, entry) => sum + entry.amount, 0);
    const averageConsumption = average(
      store.closures.map((closure) => closure.fuelConsumption).filter((value): value is number => Boolean(value)),
    );

    return {
      currentKm: lastClosure?.endKm ?? 0,
      averageConsumption,
      fuelSpent,
      maintenanceSpent,
    };
  }, [store]);

  return (
    <>
      <div className="flex items-center gap-3">
        <div className="accent-emerald-surface rounded-2xl border p-3">
          <CarFront className="h-5 w-5" />
        </div>
        <div>
          <p className="accent-emerald text-sm uppercase tracking-[0.24em]">Carro</p>
          <h1 className="mt-1 text-3xl font-semibold tracking-tight text-[var(--color-foreground)]">
            Acompanhe o desempenho do seu veiculo
          </h1>
        </div>
      </div>

      <div className="mt-8 space-y-8">
        <section className="grid gap-4 xl:grid-cols-4">
          <MetricCard title="KM atual do carro" value={summary.currentKm ? `${summary.currentKm} km` : "--"} icon={Gauge} />
          <MetricCard
            title="Consumo medio geral"
            value={summary.averageConsumption ? `${summary.averageConsumption.toFixed(1)} km/l` : "--"}
            icon={Fuel}
          />
          <MetricCard title="Gasto com combustivel" value={money.format(summary.fuelSpent)} icon={Fuel} />
          <MetricCard title="Gasto com manutencao" value={money.format(summary.maintenanceSpent)} icon={Wrench} />
        </section>

        <div className="grid gap-6 xl:grid-cols-[1.05fr_0.95fr]">
          <Card>
            <CardHeader>
              <CardTitle>Historico de abastecimentos</CardTitle>
              <CardDescription>Data, litros, valor e preco por litro.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {store.fuelEntries.length === 0 ? (
                <EmptyState message="Os abastecimentos aparecem aqui quando voce preencher a secao opcional no fechamento do dia." />
              ) : null}
              {store.fuelEntries.map((entry) => (
                <div key={entry.id} className="theme-border surface-soft rounded-3xl border p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-semibold text-[var(--color-foreground)]">
                        {new Date(`${entry.date}T00:00:00`).toLocaleDateString("pt-BR")}
                      </p>
                      <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
                        {entry.liters.toFixed(1)} L · {money.format(entry.amount)}
                      </p>
                    </div>
                    <Badge variant="secondary">{money.format(entry.pricePerLiter)}/L</Badge>
                  </div>
                </div>
              ))}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Historico de manutencoes</CardTitle>
              <CardDescription>Custos de manutencao registrados no fechamento do dia.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-3">
              {store.maintenanceEntries.length === 0 ? (
                <EmptyState message="Os lancamentos de manutencao aparecem aqui quando voce registrar esse gasto no fechamento do dia." />
              ) : null}
              {store.maintenanceEntries.map((entry) => (
                <div key={entry.id} className="theme-border surface-soft rounded-3xl border p-4">
                  <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                      <p className="font-semibold text-[var(--color-foreground)]">{entry.type}</p>
                      <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">
                        {new Date(`${entry.date}T00:00:00`).toLocaleDateString("pt-BR")} · KM {entry.carKm}
                      </p>
                    </div>
                    <p className="font-semibold text-[var(--color-foreground)]">{money.format(entry.amount)}</p>
                  </div>
                </div>
              ))}
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
