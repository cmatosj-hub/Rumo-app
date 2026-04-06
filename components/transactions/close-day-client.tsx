"use client";

import type React from "react";
import { Clock3, PlusCircle, Star } from "lucide-react";
import { useRouter } from "next/navigation";
import { useMemo, useState, useTransition } from "react";

import { addTransactionAction } from "@/app/transactions/actions";
import { useDriverJournal } from "@/components/driver-journal/use-driver-journal";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  buildTodayKey,
  calculateWorkedMinutes,
  type ClosureWalletAllocation,
  type DailyClosureRecord,
  type DailyExpenseCategory,
} from "@/lib/driver-journal";
import { cn } from "@/lib/utils";
import type { SettingsRecord as AppSettingsRecord, Wallet as AppWallet } from "@/lib/types";

const expenseCategories: { key: DailyExpenseCategory; label: string }[] = [
  { key: "Combustivel", label: "Combustivel" },
  { key: "Lanche", label: "Lanche" },
  { key: "Pedagio", label: "Pedagio" },
  { key: "Lavagem", label: "Lavagem" },
  { key: "Manutencao", label: "Manutencao" },
  { key: "Outro", label: "Outros" },
];

const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

type CloseDayProps = {
  settings: AppSettingsRecord;
  wallets: AppWallet[];
  embedded?: boolean;
  initialClosure?: DailyClosureRecord | null;
  mode?: "create" | "edit";
};

export function CloseDayClient({
  settings,
  wallets,
  embedded = false,
  initialClosure = null,
  mode = "create",
}: CloseDayProps) {
  const router = useRouter();
  const { store, updateStore } = useDriverJournal();
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
  const [directWorkedHours, setDirectWorkedHours] = useState(initialClosure ? String(initialClosure.workedMinutes / 60 || "") : "");
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
    Object.fromEntries(
      wallets.map((wallet) => [
        wallet.id,
        getWalletAllocationValue(initialClosure, wallet.id),
      ]),
    ),
  );
  const defaultDigitalWalletId = useMemo(
    () => wallets.find((wallet) => wallet.tipo === "digital")?.id ?? null,
    [wallets],
  );

  const gains = useMemo(() => {
    const uber = Number(gainForm.uber || 0);
    const app99 = Number(gainForm.app99 || 0);
    const other = Number(gainForm.other || 0);
    return { uber, app99, other, total: uber + app99 + other };
  }, [gainForm]);

  const expenses = useMemo(() => {
    const entries = expenseCategories
      .map(({ key }) => ({
        category: key,
        amount: Number(expenseForm[key] || 0),
      }))
      .filter((entry) => entry.amount > 0);

    return {
      entries,
      total: entries.reduce((sum, entry) => sum + entry.amount, 0),
    };
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
  const isValidClosingDate = /^\d{4}-\d{2}-\d{2}$/.test(closingDate) && !Number.isNaN(new Date(`${closingDate}T00:00:00`).getTime());
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

  async function handleSave() {
    setMessage(null);

    if (!closingDate) {
      setMessage("Informe a data do fechamento.");
      return;
    }

    if (!isValidClosingDate) {
      setMessage("Informe uma data de fechamento valida.");
      return;
    }

    if (existingClosureForDate) {
      setMessage("Ja existe um fechamento registrado para esta data.");
      return;
    }

    if (gains.total <= 0) {
      setMessage("Informe pelo menos um ganho do dia.");
      return;
    }

    if (!useDetailedTime && Number(directWorkedHours || 0) <= 0) {
      setMessage("Informe as horas trabalhadas do dia.");
      return;
    }

    if (useDetailedTime && invalidTimeRange) {
      setMessage("A hora de fim precisa ser maior que a hora de inicio.");
      return;
    }

    if (invalidKmRange) {
      setMessage("O KM final precisa ser maior que o KM inicial.");
      return;
    }

    if (wallets.length > 0 && hasWalletMismatch) {
      setMessage("A soma das carteiras precisa bater com o total de ganhos do dia.");
      return;
    }

    const transactionDate = buildTransactionDate(closingDate);
    const uniqueSuffix = transactionDate.replace(/\D/g, "");
    const transactionsToPersist: Parameters<typeof addTransactionAction>[0][] = [];

    if (wallets.length > 0) {
      for (const wallet of wallets) {
        const amount = Number(walletAllocation[wallet.id] || 0);
        if (amount <= 0) {
          continue;
        }

        transactionsToPersist.push({
          data: transactionDate,
          valor: amount,
          tipo: "ganho",
          app: "Outro",
          formaPagamento: wallet.tipo === "fisica" ? "dinheiro" : "digital",
          categoria: "Fechamento do dia",
          descricao: buildWalletDescription(gains),
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
        descricao: buildWalletDescription(gains),
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
      .map((wallet) => ({
        walletId: wallet.id,
        amount: Number(walletAllocation[wallet.id] || 0),
      }))
      .filter((entry) => entry.amount > 0);

    const closure: DailyClosureRecord = {
      id: initialClosure?.id ?? `${closingDate}-${uniqueSuffix}`,
      date: closingDate,
      uberAmount: gains.uber,
      app99Amount: gains.app99,
      otherAmount: gains.other,
      expenses: expenses.entries.map((entry) => ({
        id: `${entry.category}-${uniqueSuffix}`,
        category: entry.category,
        amount: entry.amount,
      })),
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
      closures: sortClosuresByDateDesc([
        closure,
        ...store.closures.filter((item) => item.id !== closure.id),
      ]),
      fuelEntries:
        closure.fuelAmount > 0 && closure.fuelLiters > 0
          ? [
              {
                id: `fuel-${uniqueSuffix}`,
                date: closure.date,
                liters: closure.fuelLiters,
                amount: closure.fuelAmount,
                pricePerLiter: closure.fuelAmount / closure.fuelLiters,
              },
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
                amount: expenses.entries
                  .filter((entry) => entry.category === "Manutencao")
                  .reduce((sum, entry) => sum + entry.amount, 0),
                carKm: Number(kmForm.end || 0),
              },
              ...store.maintenanceEntries.filter((entry) => entry.date !== previousClosureDate),
            ]
          : store.maintenanceEntries.filter((entry) => entry.date !== previousClosureDate),
    });

    setMessage(mode === "edit" ? "Fechamento atualizado com sucesso." : "Fechamento salvo com sucesso.");
    router.refresh();
    if (mode === "edit") {
      router.push("/fechamentos");
    }
  }

  function handleWalletAllocationChange(walletId: string, value: string) {
    setWalletAllocation((current) => ({
      ...current,
      [walletId]: value,
    }));
  }

  return (
    <Card className={cn(embedded ? "overflow-hidden" : undefined)}>
      <CardHeader className={cn(embedded ? "border-b border-[var(--color-border)] pb-6" : undefined)}>
        <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
          <div>
            <CardTitle>Fechamento do dia</CardTitle>
            <CardDescription>Registre seu dia de trabalho de forma rapida, sem corrida por corrida.</CardDescription>
          </div>
          <Badge variant="secondary">{mode === "edit" ? "Edicao" : "Fluxo consolidado"}</Badge>
        </div>
      </CardHeader>

      <CardContent className="space-y-6 pt-6">
        <SectionBlock
          title="Data do fechamento"
          description="Escolha o dia que voce esta registrando. O fechamento de hoje ja vem preenchido."
        >
          <div className="grid gap-4 md:max-w-xs">
            <Field
              label="Data do fechamento"
              type="date"
              value={closingDate}
              onChange={setClosingDate}
              inputMode={undefined}
            />
          </div>
          {!closingDate ? <p className="text-sm text-[var(--color-destructive)]">Informe a data do fechamento.</p> : null}
          {closingDate && !isValidClosingDate ? (
            <p className="text-sm text-[var(--color-destructive)]">Informe uma data valida.</p>
          ) : null}
          {existingClosureForDate ? (
            <p className="text-sm text-[var(--color-destructive)]">Ja existe um fechamento registrado para esta data.</p>
          ) : null}
        </SectionBlock>

        <div className="grid gap-4 xl:grid-cols-2">
          <SectionBlock
            title="Ganhos do dia"
            description="Separe so por aplicativo e deixe o total bruto por conta do sistema."
            className="h-full"
            footer={<SummaryBar label="Total bruto do dia" value={money.format(gains.total)} />}
          >
            <div className="grid gap-4 md:grid-cols-3">
              <Field
                label="Ganhos Uber"
                type="number"
                step="0.01"
                value={gainForm.uber}
                labelClassName="text-xs whitespace-nowrap"
                onChange={(value) => setGainForm((current) => ({ ...current, uber: value }))}
              />
              <Field
                label="Ganhos 99"
                type="number"
                step="0.01"
                value={gainForm.app99}
                labelClassName="text-xs whitespace-nowrap"
                onChange={(value) => setGainForm((current) => ({ ...current, app99: value }))}
              />
              <Field
                label="Outros ganhos"
                type="number"
                step="0.01"
                value={gainForm.other}
                labelClassName="text-xs whitespace-nowrap"
                onChange={(value) => setGainForm((current) => ({ ...current, other: value }))}
              />
            </div>
          </SectionBlock>

          <SectionBlock
            title="Gastos do dia"
            description="Preencha so o que aconteceu hoje. O restante pode ficar em branco."
            className="h-full"
            footer={<SummaryBar label="Total gasto no dia" value={money.format(expenses.total)} />}
          >
            <div className="grid gap-x-4 gap-y-5 sm:grid-cols-2 xl:grid-cols-3">
              {expenseCategories.map((category) => (
                <Field
                  key={category.key}
                  label={category.label}
                  type="number"
                  step="0.01"
                  value={expenseForm[category.key]}
                  labelClassName="text-xs"
                  onChange={(value) => setExpenseForm((current) => ({ ...current, [category.key]: value }))}
                />
              ))}
            </div>
          </SectionBlock>
        </div>

        <div className="grid gap-4 xl:grid-cols-3">
          <SectionBlock
            title="Horas trabalhadas"
            description="Use o total de horas do dia ou, se preferir, informe inicio e fim."
            className="h-full"
            footer={<SummaryBar label="Horas do dia" value={workedMinutes > 0 ? formatCompactHours(workedMinutes) : "--"} />}
          >
            {!useDetailedTime ? (
              <div className="space-y-4">
                <Field
                  label="Horas trabalhadas"
                  type="number"
                  step="0.1"
                  placeholder="Ex.: 8 ou 8.5"
                  value={directWorkedHours}
                  onChange={setDirectWorkedHours}
                />
                <button
                  type="button"
                  onClick={() => setUseDetailedTime(true)}
                  className="accent-emerald-surface inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl border px-4 text-sm font-medium text-[var(--color-foreground)] transition hover:bg-[rgb(52_211_153_/_0.18)]"
                >
                  <Clock3 className="h-4 w-4" />
                  Informar horario de inicio e fim
                </button>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="grid gap-4 sm:grid-cols-2">
                  <Field
                    label="Hora de inicio"
                    type="time"
                    value={timeForm.start}
                    onChange={(value) => setTimeForm((current) => ({ ...current, start: value }))}
                    inputMode={undefined}
                  />
                  <Field
                    label="Hora de fim"
                    type="time"
                    value={timeForm.end}
                    onChange={(value) => setTimeForm((current) => ({ ...current, end: value }))}
                    inputMode={undefined}
                  />
                </div>
                <button
                  type="button"
                  onClick={() => setUseDetailedTime(false)}
                  className="accent-emerald-surface inline-flex h-11 w-full items-center justify-center gap-2 rounded-2xl border px-4 text-sm font-medium text-[var(--color-foreground)] transition hover:bg-[rgb(52_211_153_/_0.18)]"
                >
                  <PlusCircle className="h-4 w-4" />
                  Usar horas trabalhadas direto
                </button>
              </div>
            )}

            {invalidTimeRange ? (
              <p className="text-sm text-[var(--color-destructive)]">A hora de fim precisa ser maior que a hora de inicio.</p>
            ) : null}
          </SectionBlock>

          <SectionBlock
            title="KM rodados"
            description="Basta registrar o KM inicial e o final do expediente."
            className="h-full"
            footer={<SummaryBar label="KM rodados no dia" value={workedKm > 0 ? `${workedKm} km` : "--"} />}
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="KM inicial"
                type="number"
                step="0.1"
                value={kmForm.start}
                onChange={(value) => setKmForm((current) => ({ ...current, start: value }))}
              />
              <Field
                label="KM final"
                type="number"
                step="0.1"
                value={kmForm.end}
                onChange={(value) => setKmForm((current) => ({ ...current, end: value }))}
              />
            </div>
            {invalidKmRange ? (
              <p className="text-sm text-[var(--color-destructive)]">O KM final precisa ser maior que o KM inicial.</p>
            ) : null}
          </SectionBlock>

          <SectionBlock
            title="Abastecimento e carro"
            description="Abastecimento e consumo podem ser registrados sem misturar uma coisa com a outra."
            className="h-full"
            footer={
              <SummaryBar
                label="Consumo informado"
                value={manualConsumption > 0 ? `${manualConsumption.toFixed(1)} km/l` : "--"}
              />
            }
          >
            <div className="grid gap-4 sm:grid-cols-2">
              <Field
                label="Valor abastecido"
                type="number"
                step="0.01"
                value={fuelForm.amount}
                onChange={(value) => setFuelForm((current) => ({ ...current, amount: value }))}
              />
              <Field
                label="Litros abastecidos"
                type="number"
                step="0.01"
                value={fuelForm.liters}
                onChange={(value) => setFuelForm((current) => ({ ...current, liters: value }))}
              />
            </div>
            <Field
              label="Consumo do carro (km/l)"
              type="number"
              step="0.1"
              placeholder="Ex.: 10.3"
              value={fuelForm.consumption}
              onChange={(value) => setFuelForm((current) => ({ ...current, consumption: value }))}
            />
          </SectionBlock>
        </div>

        <div className="grid gap-6 xl:grid-cols-[1.2fr_0.8fr]">
          <SectionBlock title="Resumo automatico" description="Confira o fechamento antes de salvar.">
            <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-4">
              <ReadingRow label="Total ganho" value={money.format(gains.total)} />
              <ReadingRow label="Total gasto" value={money.format(expenses.total)} />
              <ReadingRow label="Lucro do dia" value={money.format(lucroReal)} />
              <ReadingRow label="Horas trabalhadas" value={workedMinutes > 0 ? formatCompactHours(workedMinutes) : "--"} />
              <ReadingRow label="KM rodados" value={workedKm > 0 ? `${workedKm} km` : "--"} />
              <ReadingRow label="Media por hora" value={workedHours > 0 ? `${money.format(hourlyAverage)}/h` : "--"} />
              <ReadingRow label="Lucro por km" value={workedKm > 0 ? `${money.format(profitPerKm)}/km` : "--"} />
              <ReadingRow label="Consumo medio" value={manualConsumption > 0 ? `${manualConsumption.toFixed(1)} km/l` : "--"} />
            </div>
          </SectionBlock>

          <SectionBlock
            title="Salvar fechamento"
            description="Distribua os ganhos nas carteiras usadas no dia e confirme o fechamento."
          >
            <div className="space-y-4">
              <div className="space-y-3">
                <div className="flex items-center justify-between gap-3">
                  <Label className="text-sm">Carteiras de entrada</Label>
                  <span className="text-sm text-[var(--color-muted-foreground)]">Total do dia: {money.format(gains.total)}</span>
                </div>

                <div className="space-y-3">
                  {wallets.map((wallet) => (
                    <WalletRow
                      key={wallet.id}
                      wallet={wallet}
                      value={walletAllocation[wallet.id] ?? ""}
                      onChange={(value) => handleWalletAllocationChange(wallet.id, value)}
                      isDefault={wallet.id === defaultDigitalWalletId}
                    />
                  ))}

                  {wallets.length === 0 ? (
                    <p className="text-sm leading-6 text-[var(--color-muted-foreground)]">
                      Nenhuma carteira cadastrada. O fechamento sera salvo sem distribuir entradas.
                    </p>
                  ) : null}
                </div>

                {wallets.length > 0 ? (
                  <div className="theme-border rounded-2xl border px-4 py-3 text-sm">
                    <div className="flex items-center justify-between gap-3">
                      <span className="text-[var(--color-muted-foreground)]">Soma das carteiras</span>
                      <span className="font-semibold text-[var(--color-foreground)]">{money.format(walletTotal)}</span>
                    </div>
                    <div className="mt-2 flex items-center justify-between gap-3">
                      <span className="text-[var(--color-muted-foreground)]">Diferenca</span>
                      <span className={cn("font-semibold", hasWalletMismatch ? "text-[var(--color-destructive)]" : "text-[var(--accent-emerald-fg)]")}>
                        {money.format(Math.abs(walletDifference))}
                      </span>
                    </div>
                  </div>
                ) : null}
              </div>

              <Button
                className="home-cta-button h-12 w-full text-base"
                disabled={pending || Boolean(saveDisabledReason)}
                title={pending ? "Salvando fechamento..." : saveDisabledReason ?? "Salvar fechamento do dia"}
                onClick={() => startTransition(handleSave)}
              >
                {pending ? "Salvando..." : mode === "edit" ? "Salvar alteracoes" : "Salvar fechamento do dia"}
              </Button>

              <p className="text-sm leading-6 text-[var(--color-muted-foreground)]">
                Meta diaria configurada: {money.format(settings.metaDiaria)}.
              </p>

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
  contentClassName,
  footer,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
  className?: string;
  contentClassName?: string;
  footer?: React.ReactNode;
}) {
  return (
    <div className={cn("theme-border surface-soft flex flex-col rounded-[1.5rem] border p-4 sm:p-5", className)}>
      <div className="mb-4">
        <p className="text-base font-semibold text-[var(--color-foreground)]">{title}</p>
        <p className="mt-1 text-sm leading-6 text-[var(--color-muted-foreground)]">{description}</p>
      </div>
      <div className={cn("space-y-4", footer ? "flex-1" : undefined, contentClassName)}>{children}</div>
      {footer ? <div className="mt-4">{footer}</div> : null}
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
  step,
  placeholder,
  labelClassName,
  inputMode = "decimal",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: React.HTMLInputTypeAttribute;
  step?: string;
  placeholder?: string;
  labelClassName?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
}) {
  return (
    <div className="space-y-2">
      <Label className={cn("leading-none", labelClassName)}>{label}</Label>
      <Input
        type={type}
        step={step}
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        inputMode={inputMode}
      />
    </div>
  );
}

function WalletRow({
  wallet,
  value,
  onChange,
  isDefault = false,
}: {
  wallet: AppWallet;
  value: string;
  onChange: (value: string) => void;
  isDefault?: boolean;
}) {
  return (
    <div className="grid gap-3 rounded-2xl bg-[var(--surface-strong)] p-3 sm:grid-cols-[minmax(0,1fr)_10rem] sm:items-center">
      <div>
        <div className="flex items-center gap-2">
          <p className="font-medium text-[var(--color-foreground)]">{wallet.nome}</p>
          {isDefault ? (
            <span className="accent-emerald-surface inline-flex h-6 w-6 items-center justify-center rounded-full border" title="Carteira padrao">
              <Star className="h-3.5 w-3.5" />
            </span>
          ) : null}
        </div>
        <p className="text-xs uppercase tracking-[0.16em] text-[var(--color-muted-foreground)]">
          {wallet.tipo === "fisica" ? "Dinheiro" : "Digital"}
        </p>
      </div>
      <Input
        type="number"
        step="0.01"
        value={value}
        onChange={(event) => onChange(event.target.value)}
        inputMode="decimal"
      />
    </div>
  );
}

function SummaryBar({ label, value, className }: { label: string; value: string; className?: string }) {
  return (
    <div className={cn("rounded-2xl bg-[rgba(6,106,81,0.12)] p-4", className)}>
      <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted-foreground)]">{label}</p>
      <p className="mt-2 text-2xl font-semibold text-[var(--color-foreground)]">{value}</p>
    </div>
  );
}

function ReadingRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="theme-border surface-soft flex min-h-24 flex-col justify-between rounded-3xl border p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted-foreground)]">{label}</p>
      <p className="mt-3 break-words text-xl font-semibold leading-7 text-[var(--color-foreground)]">{value}</p>
    </div>
  );
}

function buildWalletDescription(gains: { uber: number; app99: number; other: number }) {
  const parts = [
    gains.uber > 0 ? `Uber ${money.format(gains.uber)}` : null,
    gains.app99 > 0 ? `99 ${money.format(gains.app99)}` : null,
    gains.other > 0 ? `Outros ${money.format(gains.other)}` : null,
  ].filter(Boolean);

  return parts.length > 0 ? `Fechamento do dia - ${parts.join(" | ")}` : "Fechamento do dia";
}

function formatCompactHours(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${String(remainingMinutes).padStart(2, "0")}min`;
}

function getExpenseValue(closure: DailyClosureRecord, category: DailyExpenseCategory) {
  const amount = closure.expenses.find((entry) => entry.category === category)?.amount ?? 0;
  return amount > 0 ? String(amount) : "";
}

function getWalletAllocationValue(closure: DailyClosureRecord | null, walletId: string) {
  const amount = closure?.walletAllocations?.find((entry) => entry.walletId === walletId)?.amount ?? 0;
  return amount > 0 ? String(amount) : "";
}

function sortClosuresByDateDesc(closures: DailyClosureRecord[]) {
  return [...closures].sort((left, right) => right.date.localeCompare(left.date));
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
  if (!closingDate) {
    return "Informe a data do fechamento para liberar o salvamento.";
  }

  if (!isValidClosingDate) {
    return "Informe uma data de fechamento valida.";
  }

  if (hasExistingClosure) {
    return "Ja existe um fechamento registrado para esta data.";
  }

  if (gainsTotal <= 0) {
    return "Informe pelo menos um ganho do dia para liberar o salvamento.";
  }

  if (!useDetailedTime && Number(directWorkedHours || 0) <= 0) {
    return "Informe as horas trabalhadas do dia para liberar o salvamento.";
  }

  if (invalidTimeRange) {
    return "Ajuste o horario para que a hora de fim seja maior que a hora de inicio.";
  }

  if (invalidKmRange) {
    return "Ajuste o KM para que o KM final seja maior que o KM inicial.";
  }

  if (walletsLength > 0 && hasWalletMismatch) {
    return "A soma das carteiras precisa bater com o total de ganhos do dia.";
  }

  return null;
}

function buildTransactionDate(dateKey: string) {
  return new Date(`${dateKey}T12:00:00-03:00`).toISOString();
}
