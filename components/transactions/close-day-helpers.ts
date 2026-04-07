import {
  buildCurrentTimeValue,
  calculateWorkedKm,
  calculateWorkedMinutes,
  type ActiveJourneyRecord,
  type ClosureWalletAllocation,
  type DailyClosureRecord,
  type DailyExpenseCategory,
  type DailyExpenseEntry,
  type JourneyGainCategory,
  type JourneyGainEntry,
} from "@/lib/driver-journal";
import type { Wallet as AppWallet } from "@/lib/types";

export const expenseCategories: { key: DailyExpenseCategory; label: string }[] = [
  { key: "Combustivel", label: "Combustivel" },
  { key: "Lanche", label: "Lanche" },
  { key: "Pedagio", label: "Pedagio" },
  { key: "Lavagem", label: "Lavagem" },
  { key: "Manutencao", label: "Manutencao" },
  { key: "Outro", label: "Outros" },
] as const;

export const gainCategories: { key: JourneyGainCategory; label: string }[] = [
  { key: "Uber", label: "Uber" },
  { key: "99", label: "99" },
  { key: "Dinheiro", label: "Dinheiro" },
  { key: "Outro", label: "Outros" },
] as const;

export const wizardSteps = [
  "Encerramento",
  "Revisao financeira",
  "Revisao operacional",
  "Confirmar",
] as const;

export const money = new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" });

export type JourneyReviewForm = {
  endTime: string;
  endKm: string;
  gains: Record<JourneyGainCategory, string>;
  expenses: Record<DailyExpenseCategory, string>;
  fuelAmount: string;
  fuelLiters: string;
  fuelConsumption: string;
  walletAllocation: Record<string, string>;
};

export function createLocalId(prefix: string) {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}

export function isValidDateKey(dateKey: string) {
  return /^\d{4}-\d{2}-\d{2}$/.test(dateKey) && !Number.isNaN(new Date(`${dateKey}T00:00:00`).getTime());
}

export function formatDateLabel(dateKey: string) {
  return new Date(`${dateKey}T00:00:00`).toLocaleDateString("pt-BR", {
    weekday: "short",
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
}

export function formatKm(value: number) {
  return `${value.toFixed(1)} km`;
}

export function createEmptyGainForm(): Record<JourneyGainCategory, string> {
  return {
    Uber: "",
    "99": "",
    Dinheiro: "",
    Outro: "",
  };
}

export function createEmptyExpenseForm(): Record<DailyExpenseCategory, string> {
  return {
    Combustivel: "",
    Lanche: "",
    Pedagio: "",
    Lavagem: "",
    Manutencao: "",
    Outro: "",
  };
}

export function buildEmptyReviewForm(wallets: AppWallet[]): JourneyReviewForm {
  return {
    endTime: buildCurrentTimeValue(),
    endKm: "",
    gains: createEmptyGainForm(),
    expenses: createEmptyExpenseForm(),
    fuelAmount: "",
    fuelLiters: "",
    fuelConsumption: "",
    walletAllocation: Object.fromEntries(wallets.map((wallet) => [wallet.id, ""])),
  };
}

export function buildJourneyDraftFromClosure(closure: DailyClosureRecord): ActiveJourneyRecord {
  return {
    id: closure.id,
    date: closure.date,
    startTime: closure.startTime || "08:00",
    startKm: closure.startKm,
    gains: buildGainEntriesFromClosure(closure),
    expenses: closure.expenses.map((entry) => ({
      id: entry.id,
      category: entry.category,
      amount: entry.amount,
    })),
    checkpoints: [],
  };
}

export function buildGainEntriesFromClosure(closure: DailyClosureRecord): JourneyGainEntry[] {
  const entries: JourneyGainEntry[] = [];

  if (closure.uberAmount > 0) {
    entries.push({
      id: createLocalId("gain-uber"),
      category: "Uber",
      amount: closure.uberAmount,
    });
  }

  if (closure.app99Amount > 0) {
    entries.push({
      id: createLocalId("gain-99"),
      category: "99",
      amount: closure.app99Amount,
    });
  }

  if (closure.otherAmount > 0) {
    entries.push({
      id: createLocalId("gain-other"),
      category: "Outro",
      amount: closure.otherAmount,
    });
  }

  return entries;
}

export function buildReviewFormFromJourney(
  journey: ActiveJourneyRecord,
  initialClosure: DailyClosureRecord | null,
  wallets: AppWallet[],
): JourneyReviewForm {
  const gainSummary = summarizeGainEntries(journey.gains);
  const expenseSummary = summarizeExpenseEntries(journey.expenses);
  const endTime =
    initialClosure?.endTime ||
    addMinutesToTime(journey.startTime, initialClosure?.workedMinutes ?? 0) ||
    buildCurrentTimeValue();

  return {
    endTime,
    endKm: initialClosure?.endKm ? String(initialClosure.endKm) : "",
    gains: {
      Uber: gainSummary.Uber > 0 ? String(gainSummary.Uber) : "",
      "99": gainSummary["99"] > 0 ? String(gainSummary["99"]) : "",
      Dinheiro: gainSummary.Dinheiro > 0 ? String(gainSummary.Dinheiro) : "",
      Outro: gainSummary.Outro > 0 ? String(gainSummary.Outro) : "",
    },
    expenses: {
      Combustivel: expenseSummary.Combustivel > 0 ? String(expenseSummary.Combustivel) : "",
      Lanche: expenseSummary.Lanche > 0 ? String(expenseSummary.Lanche) : "",
      Pedagio: expenseSummary.Pedagio > 0 ? String(expenseSummary.Pedagio) : "",
      Lavagem: expenseSummary.Lavagem > 0 ? String(expenseSummary.Lavagem) : "",
      Manutencao: expenseSummary.Manutencao > 0 ? String(expenseSummary.Manutencao) : "",
      Outro: expenseSummary.Outro > 0 ? String(expenseSummary.Outro) : "",
    },
    fuelAmount: initialClosure?.fuelAmount ? String(initialClosure.fuelAmount) : "",
    fuelLiters: initialClosure?.fuelLiters ? String(initialClosure.fuelLiters) : "",
    fuelConsumption: initialClosure?.fuelConsumption ? String(initialClosure.fuelConsumption) : "",
    walletAllocation: buildWalletAllocationDraft(
      wallets,
      gainSummary.total,
      initialClosure?.walletAllocations,
    ),
  };
}

export function buildWalletAllocationDraft(
  wallets: AppWallet[],
  totalGains: number,
  existingAllocations?: ClosureWalletAllocation[],
) {
  if (existingAllocations && existingAllocations.length > 0) {
    return Object.fromEntries(
      wallets.map((wallet) => {
        const allocation = existingAllocations.find((entry) => entry.walletId === wallet.id)?.amount ?? 0;
        return [wallet.id, allocation > 0 ? String(allocation) : ""];
      }),
    );
  }

  const draft = Object.fromEntries(wallets.map((wallet) => [wallet.id, ""])) as Record<string, string>;
  if (wallets.length === 0 || totalGains <= 0) {
    return draft;
  }

  const preferredWallet = wallets.find((wallet) => wallet.tipo === "digital") ?? wallets[0];
  draft[preferredWallet.id] = String(totalGains);
  return draft;
}

export function summarizeJourney(journey: ActiveJourneyRecord, currentTime: string | null) {
  const gains = summarizeGainEntries(journey.gains);
  const expenses = summarizeExpenseEntries(journey.expenses);
  const totalExpenses = expenses.total;
  const profit = gains.total - totalExpenses;
  const liveWorkedMinutes = currentTime ? calculateWorkedMinutes(journey.startTime, currentTime) : 0;
  const latestCheckpointKm = [...journey.checkpoints]
    .reverse()
    .find((checkpoint) => checkpoint.currentKm !== null)?.currentKm;
  const partialKm =
    latestCheckpointKm !== undefined && latestCheckpointKm !== null
      ? calculateWorkedKm(journey.startKm, latestCheckpointKm)
      : 0;

  return {
    gains,
    expenses,
    totalExpenses,
    profit,
    liveWorkedMinutes,
    partialKm,
  };
}

export function summarizeGainEntries(entries: JourneyGainEntry[]) {
  const summary = {
    Uber: 0,
    "99": 0,
    Dinheiro: 0,
    Outro: 0,
    total: 0,
  };

  for (const entry of entries) {
    summary[entry.category] += entry.amount;
    summary.total += entry.amount;
  }

  return summary;
}

export function summarizeExpenseEntries(entries: DailyExpenseEntry[]) {
  const summary = {
    Combustivel: 0,
    Lanche: 0,
    Pedagio: 0,
    Lavagem: 0,
    Manutencao: 0,
    Outro: 0,
    total: 0,
  };

  for (const entry of entries) {
    summary[entry.category] += entry.amount;
    summary.total += entry.amount;
  }

  return summary;
}

export function buildReviewMetrics(
  journey: ActiveJourneyRecord,
  reviewForm: JourneyReviewForm,
  walletsLength: number,
) {
  const gains = {
    Uber: Number(reviewForm.gains.Uber || 0),
    "99": Number(reviewForm.gains["99"] || 0),
    Dinheiro: Number(reviewForm.gains.Dinheiro || 0),
    Outro: Number(reviewForm.gains.Outro || 0),
  };
  const expenseEntries = expenseCategories
    .map((category) => ({
      category: category.key,
      amount: Number(reviewForm.expenses[category.key] || 0),
    }))
    .filter((entry) => entry.amount > 0);

  const totalGains = gains.Uber + gains["99"] + gains.Dinheiro + gains.Outro;
  const totalExpenses = expenseEntries.reduce((sum, entry) => sum + entry.amount, 0);
  const workedMinutes = calculateWorkedMinutes(journey.startTime, reviewForm.endTime);
  const workedKm = calculateWorkedKm(journey.startKm, Number(reviewForm.endKm || 0));
  const profit = totalGains - totalExpenses;
  const hourlyAverage = workedMinutes > 0 ? totalGains / (workedMinutes / 60) : 0;
  const profitPerKm = workedKm > 0 ? profit / workedKm : 0;
  const fuelAmount = Number(reviewForm.fuelAmount || 0);
  const fuelLiters = Number(reviewForm.fuelLiters || 0);
  const manualConsumption = Number(reviewForm.fuelConsumption || 0);
  const consumption =
    fuelLiters > 0 && workedKm > 0 ? workedKm / fuelLiters : manualConsumption > 0 ? manualConsumption : null;
  const walletTotal = Object.values(reviewForm.walletAllocation).reduce((sum, value) => sum + Number(value || 0), 0);
  const walletDifference = totalGains - walletTotal;
  const hasWalletMismatch = walletsLength > 0 && totalGains > 0 && Math.abs(walletDifference) > 0.009;
  const invalidTimeRange = Boolean(reviewForm.endTime) && workedMinutes <= 0;
  const invalidKmRange = Boolean(reviewForm.endKm) && workedKm <= 0;
  const walletAllocations = Object.entries(reviewForm.walletAllocation)
    .map(([walletId, amount]) => ({
      walletId,
      amount: Number(amount || 0),
    }))
    .filter((entry) => entry.amount > 0);

  return {
    gains,
    totalGains,
    expenseEntries,
    totalExpenses,
    workedMinutes,
    workedKm,
    profit,
    hourlyAverage,
    profitPerKm,
    fuelAmount,
    fuelLiters,
    consumption,
    walletTotal,
    walletDifference,
    hasWalletMismatch,
    invalidTimeRange,
    invalidKmRange,
    walletAllocations,
  };
}

export function addMinutesToTime(startTime: string, minutes: number) {
  if (!startTime || minutes <= 0) {
    return "";
  }

  const [hour, minute] = startTime.split(":").map(Number);
  const total = hour * 60 + minute + minutes;
  const finalHour = Math.floor(total / 60) % 24;
  const finalMinute = total % 60;
  return `${String(finalHour).padStart(2, "0")}:${String(finalMinute).padStart(2, "0")}`;
}

export function buildWalletDescription(gains: { uber: number; app99: number; cash: number; other: number }) {
  const parts = [
    gains.uber > 0 ? `Uber ${money.format(gains.uber)}` : null,
    gains.app99 > 0 ? `99 ${money.format(gains.app99)}` : null,
    gains.cash > 0 ? `Dinheiro ${money.format(gains.cash)}` : null,
    gains.other > 0 ? `Outros ${money.format(gains.other)}` : null,
  ].filter(Boolean);

  return parts.length > 0 ? `Fechamento do dia - ${parts.join(" | ")}` : "Fechamento do dia";
}

export function buildTransactionDate(dateKey: string) {
  return new Date(`${dateKey}T12:00:00-03:00`).toISOString();
}
