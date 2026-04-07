export type DailyExpenseCategory =
  | "Combustivel"
  | "Lanche"
  | "Pedagio"
  | "Lavagem"
  | "Manutencao"
  | "Outro";

export type JourneyGainCategory = "Uber" | "99" | "Dinheiro" | "Outro";

export type JourneyGainEntry = {
  id: string;
  category: JourneyGainCategory;
  amount: number;
};

export type DailyExpenseEntry = {
  id: string;
  category: DailyExpenseCategory;
  amount: number;
};

export type JourneyCheckpointRecord = {
  id: string;
  time: string;
  accumulatedAmount: number;
  currentKm: number | null;
  note: string;
};

export type ClosureWalletAllocation = {
  walletId: string;
  amount: number;
};

export type ActiveJourneyRecord = {
  id: string;
  date: string;
  startTime: string;
  startKm: number;
  gains: JourneyGainEntry[];
  expenses: DailyExpenseEntry[];
  checkpoints: JourneyCheckpointRecord[];
};

export type DailyClosureRecord = {
  id: string;
  date: string;
  uberAmount: number;
  app99Amount: number;
  otherAmount: number;
  expenses: DailyExpenseEntry[];
  startTime: string;
  endTime: string;
  startKm: number;
  endKm: number;
  fuelAmount: number;
  fuelLiters: number;
  totalGains: number;
  totalExpenses: number;
  workedMinutes: number;
  workedKm: number;
  fuelConsumption: number | null;
  hourlyAverage: number;
  walletAllocations?: ClosureWalletAllocation[];
};

export type FuelEntry = {
  id: string;
  date: string;
  liters: number;
  amount: number;
  pricePerLiter: number;
};

export type MaintenanceEntry = {
  id: string;
  date: string;
  type: string;
  amount: number;
  carKm: number;
};

export const DRIVER_JOURNAL_STORAGE_KEY = "rumo_driver_journal_v1";

export type DriverJournalStore = {
  activeJourney: ActiveJourneyRecord | null;
  closures: DailyClosureRecord[];
  fuelEntries: FuelEntry[];
  maintenanceEntries: MaintenanceEntry[];
};

export const defaultDriverJournalStore: DriverJournalStore = {
  activeJourney: null,
  closures: [],
  fuelEntries: [],
  maintenanceEntries: [],
};

export function buildTodayKey(date = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "America/Sao_Paulo" }).format(date);
}

export function calculateWorkedMinutes(startTime: string, endTime: string) {
  if (!startTime || !endTime) {
    return 0;
  }

  const [startHour, startMinute] = startTime.split(":").map(Number);
  const [endHour, endMinute] = endTime.split(":").map(Number);
  const start = startHour * 60 + startMinute;
  const end = endHour * 60 + endMinute;

  return Math.max(end - start, 0);
}

export function calculateWorkedKm(startKm: number, endKm: number) {
  return Math.max(endKm - startKm, 0);
}

export function formatWorkedHours(minutes: number) {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;
  return `${hours}h ${String(remainingMinutes).padStart(2, "0")}min`;
}

export function buildCurrentTimeValue(date = new Date()) {
  return new Intl.DateTimeFormat("en-GB", {
    hour: "2-digit",
    minute: "2-digit",
    hourCycle: "h23",
    timeZone: "America/Sao_Paulo",
  }).format(date);
}

export function sortClosuresByDateDesc(closures: DailyClosureRecord[]) {
  return [...closures].sort((left, right) => right.date.localeCompare(left.date));
}

export function sortCheckpointsByTime(checkpoints: JourneyCheckpointRecord[]) {
  return [...checkpoints].sort((left, right) => left.time.localeCompare(right.time));
}
