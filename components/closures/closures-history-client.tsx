"use client";

import Link from "next/link";
import { ChevronLeft, ChevronRight, LayoutGrid, List } from "lucide-react";
import { useMemo, useState } from "react";

import { useDriverJournal } from "@/components/driver-journal/use-driver-journal";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { formatWorkedHours, type DailyClosureRecord } from "@/lib/driver-journal";
import { cn } from "@/lib/utils";

const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });
const weekdayLabels = ["Seg", "Ter", "Qua", "Qui", "Sex", "Sab", "Dom"];

type ViewMode = "list" | "calendar";

export function ClosuresHistoryClient() {
  const { store, updateStore } = useDriverJournal();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<ViewMode>("list");
  const [visibleMonth, setVisibleMonth] = useState(getMonthStart(new Date()));

  const closures = useMemo(
    () => [...store.closures].sort((left, right) => right.date.localeCompare(left.date)).slice(0, 60),
    [store.closures],
  );

  const monthClosures = useMemo(() => {
    const monthKey = toMonthKey(visibleMonth);
    return store.closures.filter((closure) => closure.date.startsWith(monthKey));
  }, [store.closures, visibleMonth]);

  const calendarDays = useMemo(() => buildCalendarDays(visibleMonth, monthClosures), [monthClosures, visibleMonth]);
  const selectedClosure = useMemo(
    () => store.closures.find((closure) => closure.id === selectedId) ?? null,
    [selectedId, store.closures],
  );

  function handleDelete(closure: DailyClosureRecord) {
    const confirmed = window.confirm("Tem certeza que deseja excluir este fechamento?");
    if (!confirmed) {
      return;
    }

    updateStore({
      closures: store.closures.filter((item) => item.id !== closure.id),
      fuelEntries: store.fuelEntries.filter((entry) => entry.date !== closure.date),
      maintenanceEntries: store.maintenanceEntries.filter((entry) => entry.date !== closure.date),
    });

    if (selectedId === closure.id) {
      setSelectedId(null);
    }
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <CardTitle>Histórico de fechamentos</CardTitle>
            <CardDescription>Consulte, edite ou exclua registros anteriores.</CardDescription>
          </div>

          <div className="theme-border inline-flex rounded-2xl border p-1">
            <ToggleButton active={viewMode === "list"} onClick={() => setViewMode("list")} icon={List} label="Ver lista" />
            <ToggleButton
              active={viewMode === "calendar"}
              onClick={() => setViewMode("calendar")}
              icon={LayoutGrid}
              label="Ver calendario"
            />
          </div>
        </div>
      </CardHeader>

      <CardContent className="space-y-4">
        {viewMode === "list" ? (
          <>
            {closures.length === 0 ? (
              <div className="theme-border rounded-3xl border border-dashed p-6 text-sm text-[var(--color-muted-foreground)]">
                Nenhum fechamento salvo ainda.
              </div>
            ) : null}

            {closures.map((closure) => {
              const isOpen = selectedId === closure.id;
              return (
                <ClosureListRow
                  key={closure.id}
                  closure={closure}
                  isOpen={isOpen}
                  onToggle={() => setSelectedId(isOpen ? null : closure.id)}
                  onDelete={() => handleDelete(closure)}
                />
              );
            })}
          </>
        ) : (
          <div className="space-y-4">
            <div className="space-y-3">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-[var(--color-muted-foreground)]">Resumo do mes</p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
                <MonthSummaryCard label="Total ganho" value={money.format(getMonthlyGain(monthClosures))} />
                <MonthSummaryCard label="Total gasto" value={money.format(getMonthlyExpense(monthClosures))} />
                <MonthSummaryCard label="Lucro do mes" value={money.format(getMonthlyProfit(monthClosures))} />
                <MonthSummaryCard
                  label="Media por hora"
                  value={getMonthlyHourlyAverage(monthClosures) > 0 ? `${money.format(getMonthlyHourlyAverage(monthClosures))}/h` : "--"}
                />
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
              <div className="flex items-center gap-2">
                <button
                  type="button"
                  onClick={() => setVisibleMonth((current) => addMonths(current, -1))}
                  className="theme-border surface-soft inline-flex h-10 w-10 items-center justify-center rounded-2xl border transition hover:bg-[var(--surface-hover)]"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                <button
                  type="button"
                  onClick={() => setVisibleMonth((current) => addMonths(current, 1))}
                  className="theme-border surface-soft inline-flex h-10 w-10 items-center justify-center rounded-2xl border transition hover:bg-[var(--surface-hover)]"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>

              <p className="text-lg font-semibold text-[var(--color-foreground)]">{formatMonthYear(visibleMonth)}</p>
            </div>

            <div
              key={toMonthKey(visibleMonth)}
              className="grid grid-cols-7 gap-2 transition-all duration-200 ease-out"
            >
              {weekdayLabels.map((label) => (
                <div
                  key={label}
                  className="px-2 py-1 text-center text-xs font-medium uppercase tracking-[0.16em] text-[var(--color-muted-foreground)]"
                >
                  {label}
                </div>
              ))}

              {calendarDays.map((day) => (
                <button
                  key={day.key}
                  type="button"
                  disabled={!day.closure}
                  onClick={() => setSelectedId(day.closure?.id ?? null)}
                  title={day.closure ? buildClosureTooltip(day.closure) : undefined}
                  className={cn(
                    "theme-border relative flex min-h-32 flex-col rounded-2xl border p-3 text-left transition",
                    day.inCurrentMonth ? "bg-[var(--surface-strong)]" : "bg-transparent opacity-45",
                    day.closure ? getCalendarTone(day.closure.totalGains - day.closure.totalExpenses) : "hover:bg-[var(--surface-soft)]",
                    day.closure ? "cursor-pointer hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/5" : "cursor-default",
                    day.isToday ? "ring-1 ring-sky-300/35 border-sky-300/30" : undefined,
                    selectedClosure?.id === day.closure?.id ? "ring-1 ring-emerald-300/30" : undefined,
                  )}
                >
                  <p className="text-xs font-medium uppercase tracking-[0.14em] text-[var(--color-muted-foreground)]">
                    {String(day.dayNumber).padStart(2, "0")}
                  </p>
                  <div className="mt-4 flex-1">
                    <p className="text-base font-semibold text-[var(--color-foreground)]">
                      {day.closure ? money.format(day.closure.totalGains - day.closure.totalExpenses) : "—"}
                    </p>
                    {!day.closure ? (
                      <p className="mt-1 text-xs text-[var(--color-muted-foreground)]">Sem registro</p>
                    ) : null}
                  </div>
                  <div className="mt-4 flex items-center">
                    {day.closure ? (
                      <span
                        className={cn(
                          "inline-flex h-2.5 w-2.5 rounded-full",
                          getCalendarDotTone(day.closure.totalGains - day.closure.totalExpenses),
                        )}
                      />
                    ) : (
                      <span className="inline-flex h-2.5 w-2.5 rounded-full bg-transparent" />
                    )}
                  </div>
                </button>
              ))}
            </div>

            <div className="theme-border surface-soft flex flex-wrap gap-4 rounded-2xl border px-4 py-3 text-xs text-[var(--color-muted-foreground)]">
              <LegendItem toneClassName="bg-emerald-300/80" label="lucro alto" />
              <LegendItem toneClassName="bg-amber-300/80" label="lucro medio" />
              <LegendItem toneClassName="bg-orange-300/80" label="lucro baixo" />
              <LegendItem toneClassName="bg-rose-300/80" label="prejuizo" />
            </div>

            {selectedClosure ? (
              <div className="theme-border surface-soft rounded-3xl border p-4">
                <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
                  <div>
                    <p className="text-sm uppercase tracking-[0.16em] text-[var(--color-muted-foreground)]">Fechamento selecionado</p>
                    <p className="mt-2 text-xl font-semibold text-[var(--color-foreground)]">
                      {new Date(`${selectedClosure.date}T00:00:00`).toLocaleDateString("pt-BR")}
                    </p>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    <Button variant="secondary" onClick={() => setSelectedId(null)}>
                      Fechar
                    </Button>
                    <Link
                      href={`/fechamentos/${selectedClosure.date}`}
                      className="theme-border surface-soft surface-hover inline-flex items-center justify-center rounded-2xl border px-4 py-3 text-sm font-semibold text-[var(--color-foreground)]"
                    >
                      Editar
                    </Link>
                    <Button variant="ghost" onClick={() => handleDelete(selectedClosure)}>
                      Excluir
                    </Button>
                  </div>
                </div>

                <ClosureDetails closure={selectedClosure} />
              </div>
            ) : null}
          </div>
        )}
      </CardContent>
    </Card>
  );
}

function ToggleButton({
  active,
  onClick,
  icon: Icon,
  label,
}: {
  active: boolean;
  onClick: () => void;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        "inline-flex h-10 items-center gap-2 rounded-xl px-3 text-sm font-medium transition",
        active ? "accent-emerald-surface" : "text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]",
      )}
    >
      <Icon className="h-4 w-4" />
      {label}
    </button>
  );
}

function MonthSummaryCard({ label, value }: { label: string; value: string }) {
  return (
    <div className="theme-border surface-soft rounded-3xl border p-4">
      <p className="text-xs uppercase tracking-[0.16em] text-[var(--color-muted-foreground)]">{label}</p>
      <p className="mt-3 text-2xl font-semibold text-[var(--color-foreground)]">{value}</p>
    </div>
  );
}

function ClosureListRow({
  closure,
  isOpen,
  onToggle,
  onDelete,
}: {
  closure: DailyClosureRecord;
  isOpen: boolean;
  onToggle: () => void;
  onDelete: () => void;
}) {
  const profit = closure.totalGains - closure.totalExpenses;

  return (
    <div className="theme-border surface-soft rounded-3xl border p-4">
      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_auto] xl:items-center">
        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-6">
          <Cell label="Data" value={new Date(`${closure.date}T00:00:00`).toLocaleDateString("pt-BR")} />
          <Cell label="Ganho" value={money.format(closure.totalGains)} />
          <Cell label="Gasto" value={money.format(closure.totalExpenses)} />
          <Cell label="Lucro" value={money.format(profit)} />
          <Cell label="Horas" value={formatWorkedHours(closure.workedMinutes)} />
          <Cell label="KM" value={closure.workedKm > 0 ? `${closure.workedKm} km` : "--"} />
        </div>

        <div className="flex flex-wrap gap-2 xl:justify-end">
          <Button variant="secondary" onClick={onToggle}>
            {isOpen ? "Fechar" : "Visualizar"}
          </Button>
          <Link
            href={`/fechamentos/${closure.date}`}
            className="theme-border surface-soft surface-hover inline-flex items-center justify-center rounded-2xl border px-4 py-3 text-sm font-semibold text-[var(--color-foreground)]"
          >
            Editar
          </Link>
          <Button variant="ghost" onClick={onDelete}>
            Excluir
          </Button>
        </div>
      </div>

      {isOpen ? <ClosureDetails closure={closure} /> : null}
    </div>
  );
}

function Cell({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs uppercase tracking-[0.16em] text-[var(--color-muted-foreground)]">{label}</p>
      <p className="mt-1 text-sm font-semibold text-[var(--color-foreground)]">{value}</p>
    </div>
  );
}

function ClosureDetails({ closure }: { closure: DailyClosureRecord }) {
  const profit = closure.totalGains - closure.totalExpenses;

  return (
    <div className="mt-4 grid gap-4 border-t border-[var(--color-border)] pt-4 lg:grid-cols-2">
      <div className="space-y-3">
        <DetailRow label="Uber" value={money.format(closure.uberAmount)} />
        <DetailRow label="99" value={money.format(closure.app99Amount)} />
        <DetailRow label="Outros ganhos" value={money.format(closure.otherAmount)} />
        <DetailRow label="Lucro do dia" value={money.format(profit)} />
        <DetailRow label="Horas trabalhadas" value={formatWorkedHours(closure.workedMinutes)} />
        <DetailRow label="KM rodados" value={closure.workedKm > 0 ? `${closure.workedKm} km` : "--"} />
      </div>

      <div className="space-y-3">
        <DetailRow
          label="Gastos"
          value={
            closure.expenses.length > 0
              ? closure.expenses.map((entry) => `${entry.category}: ${money.format(entry.amount)}`).join(" | ")
              : "--"
          }
        />
        <DetailRow
          label="Carteiras"
          value={
            closure.walletAllocations && closure.walletAllocations.length > 0
              ? closure.walletAllocations.map((entry) => `${entry.walletId}: ${money.format(entry.amount)}`).join(" | ")
              : "--"
          }
        />
        <DetailRow
          label="Horario"
          value={closure.startTime && closure.endTime ? `${closure.startTime} ate ${closure.endTime}` : "Horas informadas diretamente"}
        />
        <DetailRow label="Abastecimento" value={closure.fuelAmount > 0 ? money.format(closure.fuelAmount) : "--"} />
        <DetailRow label="Litros" value={closure.fuelLiters > 0 ? `${closure.fuelLiters} L` : "--"} />
        <DetailRow label="Consumo" value={closure.fuelConsumption ? `${closure.fuelConsumption.toFixed(1)} km/l` : "--"} />
      </div>
    </div>
  );
}

function DetailRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="theme-border rounded-2xl border px-4 py-3">
      <p className="text-xs uppercase tracking-[0.16em] text-[var(--color-muted-foreground)]">{label}</p>
      <p className="mt-1 text-sm leading-6 text-[var(--color-foreground)]">{value}</p>
    </div>
  );
}

function LegendItem({ toneClassName, label }: { toneClassName: string; label: string }) {
  return (
    <div className="inline-flex items-center gap-2">
      <span className={cn("inline-flex h-2.5 w-2.5 rounded-full", toneClassName)} />
      <span>{label}</span>
    </div>
  );
}

function buildCalendarDays(visibleMonth: Date, closures: DailyClosureRecord[]) {
  const byDate = new Map(closures.map((closure) => [closure.date, closure]));
  const firstDay = getMonthStart(visibleMonth);
  const lastDay = getMonthEnd(visibleMonth);
  const startOffset = (firstDay.getDay() + 6) % 7;
  const endOffset = 6 - ((lastDay.getDay() + 6) % 7);
  const gridStart = new Date(firstDay);
  gridStart.setDate(firstDay.getDate() - startOffset);
  const gridEnd = new Date(lastDay);
  gridEnd.setDate(lastDay.getDate() + endOffset);
  const days = [];

  for (const date = new Date(gridStart); date <= gridEnd; date.setDate(date.getDate() + 1)) {
    const key = toDateKey(date);
    days.push({
      key,
      dayNumber: date.getDate(),
      inCurrentMonth: date.getMonth() === visibleMonth.getMonth(),
      isToday: key === toDateKey(new Date()),
      closure: byDate.get(key) ?? null,
    });
  }

  return days;
}

function getMonthStart(date: Date) {
  return new Date(date.getFullYear(), date.getMonth(), 1);
}

function getMonthEnd(date: Date) {
  return new Date(date.getFullYear(), date.getMonth() + 1, 0);
}

function addMonths(date: Date, months: number) {
  return new Date(date.getFullYear(), date.getMonth() + months, 1);
}

function toMonthKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
}

function toDateKey(date: Date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(date.getDate()).padStart(2, "0")}`;
}

function formatMonthYear(date: Date) {
  return new Intl.DateTimeFormat("pt-BR", { month: "long", year: "numeric" }).format(date);
}

function getMonthlyGain(closures: DailyClosureRecord[]) {
  return closures.reduce((sum, closure) => sum + closure.totalGains, 0);
}

function getMonthlyExpense(closures: DailyClosureRecord[]) {
  return closures.reduce((sum, closure) => sum + closure.totalExpenses, 0);
}

function getMonthlyProfit(closures: DailyClosureRecord[]) {
  return getMonthlyGain(closures) - getMonthlyExpense(closures);
}

function getMonthlyHourlyAverage(closures: DailyClosureRecord[]) {
  const totalGain = getMonthlyGain(closures);
  const totalWorkedMinutes = closures.reduce((sum, closure) => sum + closure.workedMinutes, 0);
  return totalWorkedMinutes > 0 ? totalGain / (totalWorkedMinutes / 60) : 0;
}

function buildClosureTooltip(closure: DailyClosureRecord) {
  const formattedDate = new Intl.DateTimeFormat("pt-BR", { day: "2-digit", month: "long" }).format(
    new Date(`${closure.date}T00:00:00`),
  );
  const profit = closure.totalGains - closure.totalExpenses;
  return `${formattedDate}\nGanho: ${money.format(closure.totalGains)}\nGasto: ${money.format(closure.totalExpenses)}\nLucro: ${money.format(profit)}`;
}

function getCalendarTone(profit: number) {
  if (profit >= 250) {
    return "border-emerald-300/24 bg-emerald-400/8";
  }

  if (profit >= 120) {
    return "border-amber-300/24 bg-amber-400/8";
  }

  if (profit > 0) {
    return "border-orange-300/24 bg-orange-400/8";
  }

  return "border-rose-300/24 bg-rose-400/8";
}

function getCalendarDotTone(profit: number) {
  if (profit >= 250) {
    return "bg-emerald-300/80";
  }

  if (profit >= 120) {
    return "bg-amber-300/80";
  }

  if (profit > 0) {
    return "bg-orange-300/80";
  }

  return "bg-rose-300/80";
}
