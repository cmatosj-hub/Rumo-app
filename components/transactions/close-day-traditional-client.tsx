"use client";

import type React from "react";
import { Clock3, PlusCircle } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

import { addTransactionAction } from "@/app/transactions/actions";
import { useDriverJournal } from "@/components/driver-journal/use-driver-journal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  buildTodayKey,
  calculateWorkedMinutes,
  formatWorkedHours,
  sortClosuresByDateDesc,
  type ClosureWalletAllocation,
  type DailyClosureRecord,
  type DailyExpenseCategory,
} from "@/lib/driver-journal";
import type { SettingsRecord as AppSettingsRecord, Wallet as AppWallet } from "@/lib/types";
import { cn } from "@/lib/utils";

import { buildTransactionDate, buildWalletDescription, expenseCategories, money } from "./close-day-helpers";
import { Field, ReadingRow, WalletRow } from "./close-day-ui";

type CloseDayTraditionalProps = {
  settings: AppSettingsRecord;
  wallets: AppWallet[];
  embedded?: boolean;
  initialClosure?: DailyClosureRecord | null;
  mode?: "create" | "edit";
};

export function CloseDayTraditionalClient({
  settings,
  wallets,
  embedded = false,
  initialClosure = null,
  mode = "create",
}: CloseDayTraditionalProps) {
  const router = useRouter();
  const { store, loaded, updateStore } = useDriverJournal();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [closingDate, setClosingDate] = useState(initialClosure?.date ?? buildTodayKey());
  const [useDetailedTime, setUseDetailedTime] = useState(Boolean(initialClosure?.startTime && initialClosure?.endTime));
  const [gainForm, setGainForm] = useState({
    uber: initialClosure ? String(initialClosure.uberAmount || "") : "",
    app99: initialClosure ? String(initialClosure.app99Amount || "") : "",
    other: initialClosure ? String(initialClosure.otherAmount || "") : "",
  });
  const [expenseForm, setExpenseForm] = useState<Record<DailyExpenseCategory, string>>({
    Combustivel: initialClosure ? getExpenseValue(initialClosure, "Combustivel") : "",
    Lanche: initialClosure ? getExpenseValue(initialClosure, "Lanche") : "",
    Pedagio: initialClosure ? getExpenseValue(initialClosure, "Pedagio") : "",
    Lavagem: initialClosure ? getExpenseValue(initialClosure, "Lavagem") : "",
    Manutencao: initialClosure ? getExpenseValue(initialClosure, "Manutencao") : "",
    Outro: initialClosure ? getExpenseValue(initialClosure, "Outro") : "",
  });
  const [directWorkedHours, setDirectWorkedHours] = useState(
    initialClosure ? String(initialClosure.workedMinutes / 60 || "") : "",
  );
  const [timeForm, setTimeForm] = useState({
    start: initialClosure?.startTime ?? "",
    end: initialClosure?.endTime ?? "",
  });
  const [kmForm, setKmForm] = useState({
    start: initialClosure?.startKm ? String(initialClosure.startKm) : "",
    end: initialClosure?.endKm ? String(initialClosure.endKm) : "",
  });
  const [fuelForm, setFuelForm] = useState({
    amount: initialClosure?.fuelAmount ? String(initialClosure.fuelAmount) : "",
    liters: initialClosure?.fuelLiters ? String(initialClosure.fuelLiters) : "",
    consumption: initialClosure?.fuelConsumption ? String(initialClosure.fuelConsumption) : "",
  });
  const [walletAllocation, setWalletAllocation] = useState<Record<string, string>>(
    Object.fromEntries(wallets.map((wallet) => [wallet.id, getWalletAllocationValue(initialClosure, wallet.id)])),
  );

  const gains = useMemo(() => {
    const uber = Number(gainForm.uber || 0);
    const app99 = Number(gainForm.app99 || 0);
    const other = Number(gainForm.other || 0);
    return { uber, app99, other, total: uber + app99 + other };
  }, [gainForm]);
  const expenses = useMemo(() => {
    const entries = expenseCategories
      .map(({ key }) => ({ category: key, amount: Number(expenseForm[key] || 0) }))
      .filter((entry) => entry.amount > 0);

    return { entries, total: entries.reduce((sum, entry) => sum + entry.amount, 0) };
  }, [expenseForm]);
  const workedMinutes = useMemo(() => {
    if (!useDetailedTime) {
      const hours = Number(directWorkedHours || 0);
      return hours > 0 ? Math.round(hours * 60) : 0;
    }

    return calculateWorkedMinutes(timeForm.start, timeForm.end);
  }, [directWorkedHours, timeForm.end, timeForm.start, useDetailedTime]);

  const workedHours = workedMinutes / 60;
  const workedKm = Math.max(Number(kmForm.end || 0) - Number(kmForm.start || 0), 0);
  const manualConsumption = Number(fuelForm.consumption || 0);
  const totalFuelAmount = Number(fuelForm.amount || 0);
  const totalFuelLiters = Number(fuelForm.liters || 0);
  const lucroReal = gains.total - expenses.total;
  const hourlyAverage = workedHours > 0 ? gains.total / workedHours : 0;
  const profitPerKm = workedKm > 0 ? lucroReal / workedKm : 0;
  const walletTotal = Object.values(walletAllocation).reduce((sum, value) => sum + Number(value || 0), 0);
  const walletDifference = gains.total - walletTotal;
  const hasWalletMismatch = gains.total > 0 && Math.abs(walletDifference) > 0.009;
  const invalidTimeRange = useDetailedTime && Boolean(timeForm.start && timeForm.end) && workedMinutes <= 0;
  const invalidKmRange = Boolean(kmForm.start && kmForm.end) && workedKm <= 0;
  const isValidClosingDate =
    /^\d{4}-\d{2}-\d{2}$/.test(closingDate) && !Number.isNaN(new Date(`${closingDate}T00:00:00`).getTime());
  const existingClosureForDate = store.closures.find(
    (closure) => closure.date === closingDate && closure.id !== initialClosure?.id,
  );
  const saveDisabledReason = getSaveDisabledReason({
    closingDate,
    isValidClosingDate,
    hasExistingClosure: Boolean(existingClosureForDate),
    gainsTotal: gains.total,
    useDetailedTime,
    directWorkedHours,
    invalidTimeRange,
    invalidKmRange,
    hasWalletMismatch,
    walletsLength: wallets.length,
  });
  const hasSavedJourneyInNewFlow = loaded && mode === "create" && Boolean(store.activeJourney);

  async function handleSave() {
    setMessage(null);
    if (!closingDate) return setMessage("Informe a data do fechamento.");
    if (!isValidClosingDate) return setMessage("Informe uma data de fechamento valida.");
    if (existingClosureForDate) return setMessage("Ja existe um fechamento registrado para esta data.");
    if (gains.total <= 0) return setMessage("Informe pelo menos um ganho do dia.");
    if (!useDetailedTime && Number(directWorkedHours || 0) <= 0) return setMessage("Informe as horas trabalhadas do dia.");
    if (useDetailedTime && invalidTimeRange) return setMessage("A hora de fim precisa ser maior que a hora de inicio.");
    if (invalidKmRange) return setMessage("O KM final precisa ser maior que o KM inicial.");
    if (wallets.length > 0 && hasWalletMismatch) {
      return setMessage("A soma das carteiras precisa bater com o total de ganhos do dia.");
    }

    const transactionDate = buildTransactionDate(closingDate);
    const uniqueSuffix = transactionDate.replace(/\D/g, "");
    const description = buildWalletDescription({ uber: gains.uber, app99: gains.app99, cash: 0, other: gains.other });
    const transactionsToPersist: Parameters<typeof addTransactionAction>[0][] = [];

    if (wallets.length > 0) {
      for (const wallet of wallets) {
        const amount = Number(walletAllocation[wallet.id] || 0);
        if (amount <= 0) continue;

        transactionsToPersist.push({
          data: transactionDate,
          valor: amount,
          tipo: "ganho",
          app: "Outro",
          formaPagamento: wallet.tipo === "fisica" ? "dinheiro" : "digital",
          categoria: "Fechamento do dia",
          descricao: description,
          walletId: wallet.id,
        });
      }
    } else {
      transactionsToPersist.push({
        data: transactionDate,
        valor: gains.total,
        tipo: "ganho",
        app: "Outro",
        formaPagamento: "digital",
        categoria: "Fechamento do dia",
        descricao: description,
      });
    }

    transactionsToPersist.push(
      ...expenses.entries.map((entry) => ({
        data: transactionDate,
        valor: entry.amount,
        tipo: "gasto" as const,
        app: "Outro" as const,
        formaPagamento: "dinheiro" as const,
        categoria: entry.category,
        descricao: "Fechamento do dia",
      })),
    );

    for (const transaction of transactionsToPersist) {
      const result = await addTransactionAction(transaction);
      if (!result.ok) {
        setMessage(result.message);
        return;
      }
    }

    const walletAllocations: ClosureWalletAllocation[] = wallets
      .map((wallet) => ({ walletId: wallet.id, amount: Number(walletAllocation[wallet.id] || 0) }))
      .filter((entry) => entry.amount > 0);
    const closure: DailyClosureRecord = {
      id: initialClosure?.id ?? `${closingDate}-${uniqueSuffix}`,
      date: closingDate,
      uberAmount: gains.uber,
      app99Amount: gains.app99,
      otherAmount: gains.other,
      expenses: expenses.entries.map((entry) => ({ id: `${entry.category}-${uniqueSuffix}`, category: entry.category, amount: entry.amount })),
      startTime: useDetailedTime ? timeForm.start : "",
      endTime: useDetailedTime ? timeForm.end : "",
      startKm: Number(kmForm.start || 0),
      endKm: Number(kmForm.end || 0),
      fuelAmount: totalFuelAmount,
      fuelLiters: totalFuelLiters,
      totalGains: gains.total,
      totalExpenses: expenses.total,
      workedMinutes,
      workedKm,
      fuelConsumption: manualConsumption > 0 ? manualConsumption : null,
      hourlyAverage,
      walletAllocations,
    };
    const previousClosureDate = initialClosure?.date ?? closure.date;

    updateStore({
      activeJourney: store.activeJourney,
      closures: sortClosuresByDateDesc([closure, ...store.closures.filter((item) => item.id !== closure.id)]),
      fuelEntries:
        closure.fuelAmount > 0 && closure.fuelLiters > 0
          ? [
              { id: `fuel-${uniqueSuffix}`, date: closure.date, liters: closure.fuelLiters, amount: closure.fuelAmount, pricePerLiter: closure.fuelAmount / closure.fuelLiters },
              ...store.fuelEntries.filter((entry) => entry.date !== previousClosureDate),
            ]
          : store.fuelEntries.filter((entry) => entry.date !== previousClosureDate),
      maintenanceEntries:
        expenses.entries.find((entry) => entry.category === "Manutencao")
          ? [
              {
                id: `maintenance-${uniqueSuffix}`,
                date: closure.date,
                type: "Manutencao geral",
                amount: expenses.entries.filter((entry) => entry.category === "Manutencao").reduce((sum, entry) => sum + entry.amount, 0),
                carKm: Number(kmForm.end || 0),
              },
              ...store.maintenanceEntries.filter((entry) => entry.date !== previousClosureDate),
            ]
          : store.maintenanceEntries.filter((entry) => entry.date !== previousClosureDate),
    });

    setMessage(mode === "edit" ? "Fechamento atualizado com sucesso." : "Fechamento salvo com sucesso.");
    router.refresh();
    if (mode === "edit") router.push("/fechamentos");
  }

  return (
    <Card className={cn(embedded ? "overflow-hidden" : undefined)}>
      <CardHeader className={cn(embedded ? "border-b border-[var(--color-border)] pb-6" : undefined)}>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <CardTitle>Fechamento do dia</CardTitle>
            <CardDescription>Registre seu dia de trabalho de forma rapida, sem corrida por corrida.</CardDescription>
          </div>
          <Badge variant="secondary">{mode === "edit" ? "Edicao" : "Formulario tradicional"}</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 pt-6">
        {hasSavedJourneyInNewFlow ? (
          <div className="theme-border surface-soft rounded-2xl border px-4 py-3 text-sm leading-6 text-[var(--color-muted-foreground)]">
            Existe uma jornada em andamento salva no modo novo. Ela continua guardada mesmo enquanto voce usa o formulario tradicional.
          </div>
        ) : null}

        <SectionBlock title="Data do fechamento" description="Escolha o dia que voce esta registrando. O fechamento de hoje ja vem preenchido.">
          <div className="grid gap-4 md:max-w-xs">
            <Field label="Data do fechamento" type="date" value={closingDate} onChange={setClosingDate} inputMode={undefined} />
          </div>
          {!closingDate ? <p className="text-sm text-[var(--color-destructive)]">Informe a data do fechamento.</p> : null}
          {closingDate && !isValidClosingDate ? <p className="text-sm text-[var(--color-destructive)]">Informe uma data valida.</p> : null}
          {existingClosureForDate ? <p className="text-sm text-[var(--color-destructive)]">Ja existe um fechamento registrado para esta data.</p> : null}
        </SectionBlock>

        <div className="grid gap-4 xl:grid-cols-2">
          <SectionBlock title="Ganhos do dia" description="Separe so por aplicativo e deixe o total bruto por conta do sistema." className="h-full" footer={<SummaryBar label="Total bruto do dia" value={money.format(gains.total)} />}>
            <div className="grid gap-4 md:grid-cols-3">
              <Field label="Ganhos Uber" type="number" step="0.01" value={gainForm.uber} onChange={(value) => setGainForm((current) => ({ ...current, uber: value }))} />
              <Field label="Ganhos 99" type="number" step="0.01" value={gainForm.app99} onChange={(value) => setGainForm((current) => ({ ...current, app99: value }))} />
              <Field label="Outros ganhos" type="number" step="0.01" value={gainForm.other} onChange={(value) => setGainForm((current) => ({ ...current, other: value }))} />
            </div>
          </SectionBlock>

          <SectionBlock title="Gastos do dia" description="Preencha so o que aconteceu hoje. O restante pode ficar em branco." className="h-full" footer={<SummaryBar label="Total gasto no dia" value={money.format(expenses.total)} />}>
            <div className="grid gap-x-4 gap-y-5 sm:grid-cols-2 xl:grid-cols-3">
              {expenseCategories.map((category) => (
                <Field key={category.key} label={category.label} type="number" step="0.01" value={expenseForm[category.key]} onChange={(value) => setExpenseForm((current) => ({ ...current, [category.key]: value }))} />
              ))}
            </div>
          </SectionBlock>
        </div>

        <div className="grid gap-4 xl:grid-cols-3">
          <SectionBlock title="Horas trabalhadas" description="Use o total de horas do dia ou, se preferir, informe inicio e fim." className="h-full" footer={<SummaryBar label="Horas do dia" value={workedMinutes > 0 ? formatWorkedHours(workedMinutes) : "--"} />}>
            {!useDetailedTime ? (
              <div className="space-y-4">
                <Field label="Horas trabalhadas" type="number" step="0.1" placeholder="Ex.: 8 ou 8.5" value={directWorkedHours} onChange={setDirectWorkedHours} />
                <button type="button" onClick={() => setUseDetailedTime(true)} className="accent-emerald-surface inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl border px-4 text-sm font-medium text-[var(--color-foreground)] transition hover:bg-[rgb(52_211_153_/_0.18)]">
                  <Clock3 className="h-4 w-4" />
                  Informar horario de inicio e fim
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field label="Hora de inicio" type="time" value={timeForm.start} onChange={(value) => setTimeForm((current) => ({ ...current, start: value }))} inputMode={undefined} />
                  <Field label="Hora de fim" type="time" value={timeForm.end} onChange={(value) => setTimeForm((current) => ({ ...current, end: value }))} inputMode={undefined} />
                </div>
                <button type="button" onClick={() => setUseDetailedTime(false)} className="accent-emerald-surface inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl border px-4 text-sm font-medium text-[var(--color-foreground)] transition hover:bg-[rgb(52_211_153_/_0.18)]">
                  <PlusCircle className="h-4 w-4" />
                  Usar horas trabalhadas direto
                </button>
              </div>
            )}
            {invalidTimeRange ? <p className="text-sm text-[var(--color-destructive)]">A hora de fim precisa ser maior que a hora de inicio.</p> : null}
          </SectionBlock>

          <SectionBlock title="KM rodados" description="Basta registrar o KM inicial e o final do expediente." className="h-full" footer={<SummaryBar label="KM rodados no dia" value={workedKm > 0 ? `${workedKm} km` : "--"} />}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="KM inicial" type="number" step="0.1" value={kmForm.start} onChange={(value) => setKmForm((current) => ({ ...current, start: value }))} />
              <Field label="KM final" type="number" step="0.1" value={kmForm.end} onChange={(value) => setKmForm((current) => ({ ...current, end: value }))} />
            </div>
            {invalidKmRange ? <p className="text-sm text-[var(--color-destructive)]">O KM final precisa ser maior que o KM inicial.</p> : null}
          </SectionBlock>

          <SectionBlock title="Abastecimento e carro" description="Abastecimento e consumo podem ser registrados sem misturar uma coisa com a outra." className="h-full" footer={<SummaryBar label="Consumo informado" value={manualConsumption > 0 ? `${manualConsumption.toFixed(1)} km/l` : "--"} />}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Valor abastecido" type="number" step="0.01" value={fuelForm.amount} onChange={(value) => setFuelForm((current) => ({ ...current, amount: value }))} />
              <Field label="Litros abastecidos" type="number" step="0.01" value={fuelForm.liters} onChange={(value) => setFuelForm((current) => ({ ...current, liters: value }))} />
            </div>
            <Field label="Consumo do carro (km/l)" type="number" step="0.1" placeholder="Ex.: 10.3" value={fuelForm.consumption} onChange={(value) => setFuelForm((current) => ({ ...current, consumption: value }))} />
          </SectionBlock>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <SectionBlock title="Resumo automatico" description="Confira o fechamento antes de salvar.">
            <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-4">
              <ReadingRow label="Total ganho" value={money.format(gains.total)} />
              <ReadingRow label="Total gasto" value={money.format(expenses.total)} />
              <ReadingRow label="Lucro do dia" value={money.format(lucroReal)} />
              <ReadingRow label="Horas trabalhadas" value={workedMinutes > 0 ? formatWorkedHours(workedMinutes) : "--"} />
              <ReadingRow label="KM rodados" value={workedKm > 0 ? `${workedKm} km` : "--"} />
              <ReadingRow label="Media por hora" value={workedHours > 0 ? `${money.format(hourlyAverage)}/h` : "--"} />
              <ReadingRow label="Lucro por km" value={workedKm > 0 ? `${money.format(profitPerKm)}/km` : "--"} />
              <ReadingRow label="Consumo medio" value={manualConsumption > 0 ? `${manualConsumption.toFixed(1)} km/l` : "--"} />
            </div>
          </SectionBlock>

          <SectionBlock title="Salvar fechamento" description="Distribua os ganhos nas carteiras usadas no dia e confirme o fechamento.">
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <Label className="text-sm">Carteiras de entrada</Label>
                  <span className="text-sm text-[var(--color-muted-foreground)]">Total do dia: {money.format(gains.total)}</span>
                </div>

                <div className="space-y-3">
                  {wallets.map((wallet) => (
                    <WalletRow key={wallet.id} wallet={wallet} value={walletAllocation[wallet.id] ?? ""} onChange={(value) => setWalletAllocation((current) => ({ ...current, [wallet.id]: value }))} />
                  ))}
                  {wallets.length === 0 ? <p className="text-sm leading-6 text-[var(--color-muted-foreground)]">Nenhuma carteira cadastrada. O fechamento sera salvo sem distribuir entradas.</p> : null}
                </div>

                {wallets.length > 0 ? (
                  <div className="theme-border rounded-2xl border px-4 py-3 text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[var(--color-muted-foreground)]">Soma das carteiras</span>
                      <span className="font-semibold text-[var(--color-foreground)]">{money.format(walletTotal)}</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-3">
                      <span className="text-[var(--color-muted-foreground)]">Diferenca</span>
                      <span className={cn("font-semibold", hasWalletMismatch ? "text-[var(--color-destructive)]" : "text-[var(--accent-emerald-fg)]")}>{money.format(Math.abs(walletDifference))}</span>
                    </div>
                  </div>
                ) : null}
              </div>

              <Button className="home-cta-button h-12 w-full text-base" disabled={pending || Boolean(saveDisabledReason)} title={pending ? "Salvando fechamento..." : saveDisabledReason ?? "Salvar fechamento do dia"} onClick={() => startTransition(handleSave)}>
                {pending ? "Salvando..." : mode === "edit" ? "Salvar alteracoes" : "Salvar fechamento do dia"}
              </Button>

              <p className="text-sm leading-6 text-[var(--color-muted-foreground)]">Meta diaria configurada: {money.format(settings.metaDiaria)}.</p>
              {message ? <p className="text-sm text-[var(--color-muted-foreground)]">{message}</p> : null}
            </div>
          </SectionBlock>
        </div>
      </CardContent>
    </Card>
  );
}

function SectionBlock({
  title,
  description,
  children,
  className,
  footer,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  className?: string;
  footer?: React.ReactNode;
}) {
  return (
    <div className={cn("theme-border surface-soft flex flex-col rounded-[1.5rem] border p-4 sm:p-5", className)}>
      <div className="mb-4">
        <p className="text-base font-semibold text-[var(--color-foreground)]">{title}</p>
        <p className="mt-1 text-sm leading-6 text-[var(--color-muted-foreground)]">{description}</p>
      </div>
      <div className={cn("space-y-4", footer ? "flex-1" : undefined)}>{children}</div>
      {footer ? <div className="mt-4">{footer}</div> : null}
    </div>
  );
}

function SummaryBar({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-[rgba(6,106,81,0.12)] p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted-foreground)]">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-[var(--color-foreground)]">{value}</p>
    </div>
  );
}

function getExpenseValue(closure: DailyClosureRecord, category: DailyExpenseCategory) {
  const amount = closure.expenses.find((entry) => entry.category === category)?.amount ?? 0;
  return amount > 0 ? String(amount) : "";
}

function getWalletAllocationValue(closure: DailyClosureRecord | null, walletId: string) {
  const amount = closure?.walletAllocations?.find((entry) => entry.walletId === walletId)?.amount ?? 0;
  return amount > 0 ? String(amount) : "";
}

function getSaveDisabledReason({
  closingDate,
  isValidClosingDate,
  hasExistingClosure,
  gainsTotal,
  useDetailedTime,
  directWorkedHours,
  invalidTimeRange,
  invalidKmRange,
  hasWalletMismatch,
  walletsLength,
}: {
  closingDate: string;
  isValidClosingDate: boolean;
  hasExistingClosure: boolean;
  gainsTotal: number;
  useDetailedTime: boolean;
  directWorkedHours: string;
  invalidTimeRange: boolean;
  invalidKmRange: boolean;
  hasWalletMismatch: boolean;
  walletsLength: number;
}) {
  if (!closingDate) return "Informe a data do fechamento para liberar o salvamento.";
  if (!isValidClosingDate) return "Informe uma data de fechamento valida.";
  if (hasExistingClosure) return "Ja existe um fechamento registrado para esta data.";
  if (gainsTotal <= 0) return "Informe pelo menos um ganho do dia para liberar o salvamento.";
  if (!useDetailedTime && Number(directWorkedHours || 0) <= 0) {
    return "Informe as horas trabalhadas do dia para liberar o salvamento.";
  }
  if (invalidTimeRange) return "Ajuste o horario para que a hora de fim seja maior que a hora de inicio.";
  if (invalidKmRange) return "Ajuste o KM para que o KM final seja maior que o KM inicial.";
  if (walletsLength > 0 && hasWalletMismatch) {
    return "A soma das carteiras precisa bater com o total de ganhos do dia.";
  }

  return null;
}
