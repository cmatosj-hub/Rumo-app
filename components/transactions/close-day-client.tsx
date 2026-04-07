"use client";

import type React from "react";
import Link from "next/link";
import {
  ArrowRight,
  CalendarDays,
  CheckCircle2,
  Clock3,
  Coins,
  Fuel,
  MapPinned,
  PlayCircle,
  ReceiptText,
  Route,
  Timer,
  Trash2,
  Waypoints,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState, useTransition } from "react";

import { addTransactionAction } from "@/app/transactions/actions";
import { useDriverJournal } from "@/components/driver-journal/use-driver-journal";
import {
  buildCurrentTimeValue,
  buildTodayKey,
  formatWorkedHours,
  sortCheckpointsByTime,
  sortClosuresByDateDesc,
  type ActiveJourneyRecord,
  type DailyClosureRecord,
  type DailyExpenseCategory,
  type JourneyGainCategory,
} from "@/lib/driver-journal";
import type { SettingsRecord as AppSettingsRecord, Wallet as AppWallet } from "@/lib/types";
import { cn } from "@/lib/utils";

import {
  buildEmptyReviewForm,
  buildJourneyDraftFromClosure,
  buildReviewFormFromJourney,
  buildReviewMetrics,
  buildTransactionDate,
  buildWalletDescription,
  createLocalId,
  expenseCategories,
  formatDateLabel,
  formatKm,
  gainCategories,
  isValidDateKey,
  money,
  summarizeJourney,
  type JourneyReviewForm,
  wizardSteps,
} from "./close-day-helpers";
import {
  CompactBreakdownRow,
  Field,
  InfoPill,
  InlineNoticeCard,
  MetricTile,
  QuickActionButton,
  QuickInfoCard,
  ReadingRow,
  SelectField,
  TextAreaField,
  WalletRow,
  type InlineNotice,
  type NoticeTone,
} from "./close-day-ui";

type QuickAction = "gain" | "expense" | "checkpoint" | null;
type FinalizeStep = 1 | 2 | 3 | 4;

type CloseDayProps = {
  settings: AppSettingsRecord;
  wallets: AppWallet[];
  embedded?: boolean;
  initialClosure?: DailyClosureRecord | null;
  mode?: "create" | "edit";
  showCheckpoints?: boolean;
};

export function CloseDayClient({
  settings,
  wallets,
  embedded = false,
  initialClosure = null,
  mode = "create",
  showCheckpoints = true,
}: CloseDayProps) {
  const router = useRouter();
  const { store, loaded, updateStore } = useDriverJournal();
  const [pending, startTransition] = useTransition();
  const [notice, setNotice] = useState<InlineNotice | null>(null);
  const [activeQuickAction, setActiveQuickAction] = useState<QuickAction>(null);
  const [showFinalizeWizard, setShowFinalizeWizard] = useState(mode === "edit");
  const [finalizeStep, setFinalizeStep] = useState<FinalizeStep>(1);
  const [currentTime, setCurrentTime] = useState(() => buildCurrentTimeValue());
  const [editingJourney, setEditingJourney] = useState<ActiveJourneyRecord | null>(() =>
    initialClosure ? buildJourneyDraftFromClosure(initialClosure) : null,
  );

  const [startForm, setStartForm] = useState(() => ({
    date: initialClosure?.date ?? buildTodayKey(),
    startTime: initialClosure?.startTime || buildCurrentTimeValue(),
    startKm: initialClosure?.startKm ? String(initialClosure.startKm) : "",
  }));
  const [gainDraft, setGainDraft] = useState<{ amount: string; category: JourneyGainCategory }>({
    amount: "",
    category: "Uber",
  });
  const [expenseDraft, setExpenseDraft] = useState<{ amount: string; category: DailyExpenseCategory }>({
    amount: "",
    category: "Combustivel",
  });
  const [checkpointDraft, setCheckpointDraft] = useState({
    time: buildCurrentTimeValue(),
    accumulatedAmount: "",
    currentKm: "",
    note: "",
  });
  const [reviewForm, setReviewForm] = useState<JourneyReviewForm>(() => buildEmptyReviewForm(wallets));

  const journey = mode === "edit" ? editingJourney : store.activeJourney;
  const todayKey = buildTodayKey();
  const closureForStartDate =
    mode === "create" ? store.closures.find((closure) => closure.date === startForm.date) ?? null : null;
  const checkpointsEnabled = showCheckpoints;

  useEffect(() => {
    const interval = window.setInterval(() => {
      setCurrentTime(buildCurrentTimeValue());
    }, 60_000);

    return () => window.clearInterval(interval);
  }, []);

  const journeySummary = useMemo(() => {
    if (!journey) {
      return null;
    }

    return summarizeJourney(journey, journey.date === todayKey ? currentTime : null);
  }, [currentTime, journey, todayKey]);

  const reviewMetrics = useMemo(() => {
    if (!journey) {
      return null;
    }

    return buildReviewMetrics(journey, reviewForm, wallets.length);
  }, [journey, reviewForm, wallets.length]);

  function pushNotice(tone: NoticeTone, text: string) {
    setNotice({ tone, text });
  }

  function updateJourney(nextJourney: ActiveJourneyRecord) {
    if (mode === "edit") {
      setEditingJourney(nextJourney);
      return;
    }

    updateStore({
      ...store,
      activeJourney: nextJourney,
    });
  }

  function openQuickAction(action: QuickAction) {
    if (!journeySummary) {
      return;
    }

    if (action === "checkpoint" && !checkpointsEnabled) {
      return;
    }

    setNotice(null);
    setShowFinalizeWizard(false);
    setFinalizeStep(1);
    setActiveQuickAction(action);

    if (action === "gain") {
      setGainDraft({ amount: "", category: "Uber" });
    }

    if (action === "expense") {
      setExpenseDraft({ amount: "", category: "Combustivel" });
    }

    if (action === "checkpoint") {
      setCheckpointDraft({
        time: buildCurrentTimeValue(),
        accumulatedAmount: journeySummary.gains.total > 0 ? String(journeySummary.gains.total) : "",
        currentKm: journeySummary.partialKm > 0 && journey ? String(journey.startKm + journeySummary.partialKm) : "",
        note: "",
      });
    }
  }

  function handleStartJourney() {
    setNotice(null);

    if (!startForm.date || !isValidDateKey(startForm.date)) {
      pushNotice("error", "Informe uma data valida para iniciar a jornada.");
      return;
    }

    if (!startForm.startTime) {
      pushNotice("error", "Informe a hora inicial da jornada.");
      return;
    }

    const startKm = Number(startForm.startKm);
    if (!startForm.startKm || Number.isNaN(startKm) || startKm < 0) {
      pushNotice("error", "Informe o KM inicial para iniciar a jornada.");
      return;
    }

    if (closureForStartDate) {
      pushNotice("error", "Ja existe um fechamento salvo para essa data.");
      return;
    }

    updateJourney({
      id: createLocalId("journey"),
      date: startForm.date,
      startTime: startForm.startTime,
      startKm,
      gains: [],
      expenses: [],
      checkpoints: [],
    });

    setActiveQuickAction(null);
    setShowFinalizeWizard(false);
    pushNotice(
      "success",
      checkpointsEnabled
        ? "Jornada iniciada. Agora voce pode registrar ganhos, gastos e checkpoints."
        : "Jornada iniciada. Agora voce pode registrar ganhos e gastos durante o dia.",
    );
  }

  function handleAddGain(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!journey) {
      return;
    }

    const amount = Number(gainDraft.amount);
    if (Number.isNaN(amount) || amount <= 0) {
      pushNotice("error", "Informe um valor valido para o ganho.");
      return;
    }

    updateJourney({
      ...journey,
      gains: [...journey.gains, { id: createLocalId("gain"), category: gainDraft.category, amount }],
    });

    setGainDraft((current) => ({ ...current, amount: "" }));
    pushNotice("success", "Ganho adicionado na jornada.");
  }

  function handleAddExpense(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!journey) {
      return;
    }

    const amount = Number(expenseDraft.amount);
    if (Number.isNaN(amount) || amount <= 0) {
      pushNotice("error", "Informe um valor valido para o gasto.");
      return;
    }

    updateJourney({
      ...journey,
      expenses: [...journey.expenses, { id: createLocalId("expense"), category: expenseDraft.category, amount }],
    });

    setExpenseDraft((current) => ({ ...current, amount: "" }));
    pushNotice("success", "Gasto adicionado na jornada.");
  }

  function handleAddCheckpoint(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!journey) {
      return;
    }

    const accumulatedAmount = Number(checkpointDraft.accumulatedAmount);
    if (Number.isNaN(accumulatedAmount) || accumulatedAmount < 0) {
      pushNotice("error", "Informe o valor arrecadado acumulado no checkpoint.");
      return;
    }

    if (!checkpointDraft.time) {
      pushNotice("error", "Informe a hora do checkpoint.");
      return;
    }

    const currentKm = checkpointDraft.currentKm.trim().length > 0 ? Number(checkpointDraft.currentKm) : null;
    if (currentKm !== null && (Number.isNaN(currentKm) || currentKm < journey.startKm)) {
      pushNotice("error", "O KM do checkpoint precisa ser maior ou igual ao KM inicial.");
      return;
    }

    updateJourney({
      ...journey,
      checkpoints: sortCheckpointsByTime([
        ...journey.checkpoints,
        {
          id: createLocalId("checkpoint"),
          time: checkpointDraft.time,
          accumulatedAmount,
          currentKm,
          note: checkpointDraft.note.trim(),
        },
      ]),
    });

    setCheckpointDraft({
      time: buildCurrentTimeValue(),
      accumulatedAmount: "",
      currentKm: "",
      note: "",
    });
    pushNotice("success", "Checkpoint registrado.");
  }

  function handleRemoveCheckpoint(checkpointId: string) {
    if (!journey) {
      return;
    }

    updateJourney({
      ...journey,
      checkpoints: journey.checkpoints.filter((checkpoint) => checkpoint.id !== checkpointId),
    });
    pushNotice("default", "Checkpoint removido da jornada.");
  }

  function openFinalizeWizard() {
    if (!journey) {
      return;
    }

    setNotice(null);
    setActiveQuickAction(null);
    setReviewForm(buildReviewFormFromJourney(journey, initialClosure, wallets));
    setFinalizeStep(1);
    setShowFinalizeWizard(true);
  }

  function handleFinalizeStepAdvance() {
    if (!journey || !reviewMetrics) {
      return;
    }

    if (finalizeStep === 1 && (!reviewForm.endTime || !reviewForm.endKm || reviewMetrics.invalidTimeRange || reviewMetrics.invalidKmRange)) {
      pushNotice("error", "Revise hora final e KM final antes de continuar.");
      return;
    }

    if (finalizeStep === 2 && reviewMetrics.hasWalletMismatch) {
      pushNotice("error", "A distribuicao nas carteiras precisa bater com o total de ganhos.");
      return;
    }

    if (finalizeStep < 4) {
      setFinalizeStep((current) => (current + 1) as FinalizeStep);
    }
  }

  async function handleConfirmClosure() {
    if (!journey || !reviewMetrics) {
      return;
    }

    if (reviewMetrics.invalidTimeRange || reviewMetrics.invalidKmRange) {
      pushNotice("error", "Revise os dados de encerramento antes de concluir.");
      return;
    }

    if (reviewMetrics.hasWalletMismatch) {
      pushNotice("error", "A distribuicao nas carteiras precisa bater com o total de ganhos.");
      return;
    }

    if (mode === "create" && store.closures.some((closure) => closure.date === journey.date)) {
      pushNotice("error", "Ja existe um fechamento salvo para essa data.");
      return;
    }

    const transactionsToPersist = buildTransactionsToPersist({
      wallets,
      reviewForm,
      reviewMetrics,
      journeyDate: journey.date,
    });

    for (const transaction of transactionsToPersist) {
      const result = await addTransactionAction(transaction);
      if (!result.ok) {
        pushNotice("error", result.message);
        return;
      }
    }

    const closure = buildClosureFromReview({
      journey,
      reviewForm,
      reviewMetrics,
      initialClosure,
    });

    const previousClosureDate = initialClosure?.date ?? closure.date;

    updateStore({
      activeJourney: mode === "create" ? null : store.activeJourney,
      closures: sortClosuresByDateDesc([closure, ...store.closures.filter((item) => item.id !== closure.id)]),
      fuelEntries:
        reviewMetrics.fuelAmount > 0 && reviewMetrics.fuelLiters > 0
          ? [
              {
                id: createLocalId("fuel"),
                date: closure.date,
                liters: reviewMetrics.fuelLiters,
                amount: reviewMetrics.fuelAmount,
                pricePerLiter: reviewMetrics.fuelAmount / reviewMetrics.fuelLiters,
              },
              ...store.fuelEntries.filter((entry) => entry.date !== previousClosureDate),
            ]
          : store.fuelEntries.filter((entry) => entry.date !== previousClosureDate),
      maintenanceEntries:
        reviewMetrics.expenseEntries.find((entry) => entry.category === "Manutencao")
          ? [
              {
                id: createLocalId("maintenance"),
                date: closure.date,
                type: "Manutencao geral",
                amount: reviewMetrics.expenseEntries
                  .filter((entry) => entry.category === "Manutencao")
                  .reduce((sum, entry) => sum + entry.amount, 0),
                carKm: Number(reviewForm.endKm || 0),
              },
              ...store.maintenanceEntries.filter((entry) => entry.date !== previousClosureDate),
            ]
          : store.maintenanceEntries.filter((entry) => entry.date !== previousClosureDate),
    });

    setShowFinalizeWizard(false);
    setActiveQuickAction(null);
    setFinalizeStep(1);
    setStartForm({ date: buildTodayKey(), startTime: buildCurrentTimeValue(), startKm: "" });
    pushNotice("success", mode === "edit" ? "Fechamento atualizado com sucesso." : "Jornada fechada com sucesso.");
    router.refresh();

    if (mode === "edit") {
      router.push("/fechamentos");
    }
  }

  if (!loaded && mode === "create") {
    return <SimpleStateCard text="Carregando a jornada do dia..." />;
  }

  if (!journey && mode === "edit") {
    return <SimpleStateCard text="Nao foi possivel carregar esse fechamento para edicao." />;
  }

  return (
    <div className={cn("space-y-6", embedded ? "pt-0" : undefined)}>
      {notice ? <InlineNoticeCard notice={notice} /> : null}
      {!journey ? (
        <div className="grid gap-4 lg:grid-cols-[1.1fr_0.9fr]">
          <StartJourneyCard
            closureForStartDate={Boolean(closureForStartDate)}
            showCheckpoints={checkpointsEnabled}
            startForm={startForm}
            setStartForm={setStartForm}
            onStart={handleStartJourney}
          />
          <div className="grid gap-4">
            <QuickInfoCard title="Ganhos e gastos no momento certo" description="Lance o que aconteceu durante o dia, sem formulario longo." icon={ReceiptText} />
            <QuickInfoCard
              title={checkpointsEnabled ? "Checkpoints opcionais" : "Fechamento mais direto"}
              description={
                checkpointsEnabled
                  ? "Guarde leituras por horario para comparar dias mais fortes."
                  : "Use uma jornada mais enxuta, sem checkpoints no meio do dia."
              }
              icon={checkpointsEnabled ? Waypoints : ArrowRight}
            />
            <QuickInfoCard title="Meta diaria visivel" description={`Sua meta diaria hoje e ${money.format(settings.metaDiaria)}.`} icon={Coins} />
          </div>
        </div>
      ) : null}

      {journey && !showFinalizeWizard && journeySummary ? (
        <>
          <JourneyHeaderCard
            journey={journey}
            onFinalize={openFinalizeWizard}
            showCheckpoints={checkpointsEnabled}
          />

          <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-5">
            <MetricTile label="Ganho acumulado" value={money.format(journeySummary.gains.total)} icon={Coins} accentClassName="accent-emerald-surface" />
            <MetricTile label="Gasto acumulado" value={money.format(journeySummary.totalExpenses)} icon={ReceiptText} accentClassName="accent-amber-surface" />
            <MetricTile label="Lucro parcial" value={money.format(journeySummary.profit)} icon={CheckCircle2} accentClassName="accent-sky-surface" />
            <MetricTile label="Duracao ate agora" value={journeySummary.liveWorkedMinutes > 0 ? formatWorkedHours(journeySummary.liveWorkedMinutes) : "--"} icon={Timer} accentClassName="accent-sky-surface" />
            <MetricTile label="KM parcial" value={journeySummary.partialKm > 0 ? `${journeySummary.partialKm.toFixed(1)} km` : "--"} icon={MapPinned} accentClassName="accent-amber-surface" />
          </div>

          <QuickActionsSection
            activeQuickAction={activeQuickAction}
            checkpointDraft={checkpointDraft}
            expenseDraft={expenseDraft}
            gainDraft={gainDraft}
            onAddCheckpoint={handleAddCheckpoint}
            onAddExpense={handleAddExpense}
            onAddGain={handleAddGain}
            onFinalize={openFinalizeWizard}
            onOpenQuickAction={openQuickAction}
            showCheckpoints={checkpointsEnabled}
            setActiveQuickAction={setActiveQuickAction}
            setCheckpointDraft={setCheckpointDraft}
            setExpenseDraft={setExpenseDraft}
            setGainDraft={setGainDraft}
          />

          <div className="theme-border surface-soft rounded-[1.5rem] border p-6">
            <div className="grid gap-6 lg:grid-cols-2">
              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-[var(--color-muted-foreground)]">Ganhos acumulados</p>
                <div className="mt-4 space-y-3">
                  {gainCategories.map((item) => (
                    <CompactBreakdownRow key={item.key} label={item.label} value={money.format(journeySummary.gains[item.key])} />
                  ))}
                </div>
              </div>

              <div>
                <p className="text-sm uppercase tracking-[0.2em] text-[var(--color-muted-foreground)]">Gastos acumulados</p>
                <div className="mt-4 space-y-3">
                  {expenseCategories.map((item) => (
                    <CompactBreakdownRow key={item.key} label={item.label} value={money.format(journeySummary.expenses[item.key])} />
                  ))}
                </div>
              </div>
            </div>
          </div>

          {checkpointsEnabled ? (
            <CheckpointsCard checkpoints={journey.checkpoints} onRemove={handleRemoveCheckpoint} />
          ) : null}
        </>
      ) : null}

      {journey && showFinalizeWizard && reviewMetrics ? (
        <FinalizeWizard
          finalizeStep={finalizeStep}
          journey={journey}
          mode={mode}
          pending={pending}
          reviewForm={reviewForm}
          reviewMetrics={reviewMetrics}
          wallets={wallets}
          onBack={() =>
            finalizeStep === 1
              ? mode === "edit"
                ? router.push("/fechamentos")
                : setShowFinalizeWizard(false)
              : setFinalizeStep((current) => (current - 1) as FinalizeStep)
          }
          onConfirm={() => startTransition(handleConfirmClosure)}
          onNext={handleFinalizeStepAdvance}
          setReviewForm={setReviewForm}
        />
      ) : null}
    </div>
  );
}

function SimpleStateCard({ text }: { text: string }) {
  return (
    <div className="theme-border surface-soft rounded-[1.5rem] border p-6 text-sm text-[var(--color-muted-foreground)]">
      {text}
    </div>
  );
}

function StartJourneyCard({
  closureForStartDate,
  showCheckpoints,
  startForm,
  setStartForm,
  onStart,
}: {
  closureForStartDate: boolean;
  showCheckpoints: boolean;
  startForm: { date: string; startTime: string; startKm: string };
  setStartForm: React.Dispatch<React.SetStateAction<{ date: string; startTime: string; startKm: string }>>;
  onStart: () => void;
}) {
  return (
    <div className="glass-panel theme-border rounded-[2rem] border p-6 shadow-2xl shadow-black/30 lg:p-8">
      <div className="flex flex-col gap-3 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <span className="theme-border surface-soft rounded-full border px-3 py-1 text-xs uppercase tracking-[0.16em] text-[var(--color-muted-foreground)]">
            Dia nao iniciado
          </span>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-[var(--color-foreground)]">Iniciar jornada</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--color-muted-foreground)]">
            {showCheckpoints
              ? "Comece com poucos dados. O restante pode ser alimentado ao longo do dia."
              : "Comece com poucos dados. Ganhos, gastos e o fechamento final ficam para o momento certo."}
          </p>
        </div>

        <Link href="/fechamentos" className="theme-border surface-soft inline-flex h-11 items-center justify-center rounded-2xl border px-4 text-sm font-medium text-[var(--color-foreground)] transition hover:bg-[var(--surface-hover)]">
          Ver fechamentos
        </Link>
      </div>

      <div className="mt-6 grid gap-4 sm:grid-cols-3">
        <Field label="Data" type="date" value={startForm.date} inputMode={undefined} onChange={(value) => setStartForm((current) => ({ ...current, date: value }))} />
        <Field label="Hora inicial" type="time" value={startForm.startTime} inputMode={undefined} onChange={(value) => setStartForm((current) => ({ ...current, startTime: value }))} />
        <Field label="KM inicial" type="number" step="0.1" value={startForm.startKm} onChange={(value) => setStartForm((current) => ({ ...current, startKm: value }))} />
      </div>

      {closureForStartDate ? <p className="mt-4 text-sm text-[var(--color-destructive)]">Ja existe um fechamento salvo para essa data.</p> : null}

      <button type="button" onClick={onStart} className="home-cta-button mt-6 inline-flex h-12 items-center justify-center rounded-2xl border px-6 text-sm font-semibold transition">
        <PlayCircle className="mr-2 h-4 w-4" />
        Comecar jornada
      </button>
    </div>
  );
}

function JourneyHeaderCard({
  journey,
  onFinalize,
  showCheckpoints,
}: {
  journey: ActiveJourneyRecord;
  onFinalize: () => void;
  showCheckpoints: boolean;
}) {
  return (
    <div className="glass-panel theme-border rounded-[2rem] border p-6 shadow-2xl shadow-black/30 lg:p-8">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <div className="flex flex-wrap items-center gap-2">
            <span className="accent-emerald-surface rounded-full border px-3 py-1 text-xs uppercase tracking-[0.16em]">Jornada em andamento</span>
            <span className="theme-border surface-soft rounded-full border px-3 py-1 text-xs uppercase tracking-[0.16em] text-[var(--color-muted-foreground)]">{formatDateLabel(journey.date)}</span>
          </div>
          <h2 className="mt-4 text-3xl font-semibold tracking-tight text-[var(--color-foreground)]">Acompanhe o dia sem burocracia</h2>
          <p className="mt-3 max-w-2xl text-sm leading-6 text-[var(--color-muted-foreground)]">
            {showCheckpoints
              ? "Registre ganhos, gastos e checkpoints durante a jornada. O fechamento final fica para o ultimo passo."
              : "Registre ganhos e gastos durante a jornada. O fechamento final fica para o ultimo passo."}
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            <InfoPill icon={CalendarDays} label={formatDateLabel(journey.date)} />
            <InfoPill icon={Clock3} label={`Inicio ${journey.startTime}`} />
            <InfoPill icon={Route} label={`KM inicial ${formatKm(journey.startKm)}`} />
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Link href="/fechamentos" className="theme-border surface-soft inline-flex h-11 items-center justify-center rounded-2xl border px-4 text-sm font-medium text-[var(--color-foreground)] transition hover:bg-[var(--surface-hover)]">
            Ver fechamentos
          </Link>
          <button type="button" onClick={onFinalize} className="home-cta-button inline-flex h-11 items-center justify-center rounded-2xl border px-5 text-sm font-semibold transition">
            Finalizar jornada
          </button>
        </div>
      </div>
    </div>
  );
}

function CheckpointsCard({
  checkpoints,
  onRemove,
}: {
  checkpoints: ActiveJourneyRecord["checkpoints"];
  onRemove: (checkpointId: string) => void;
}) {
  return (
    <div className="theme-border surface-soft rounded-[1.5rem] border p-6">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
        <div>
          <p className="text-sm uppercase tracking-[0.2em] text-[var(--color-muted-foreground)]">Checkpoints</p>
          <h3 className="mt-2 text-2xl font-semibold text-[var(--color-foreground)]">Timeline da jornada</h3>
        </div>
        <span className="theme-border surface-soft rounded-full border px-3 py-1 text-xs uppercase tracking-[0.16em] text-[var(--color-muted-foreground)]">
          {checkpoints.length} {checkpoints.length === 1 ? "checkpoint" : "checkpoints"}
        </span>
      </div>

      {checkpoints.length === 0 ? (
        <div className="theme-border surface-soft mt-5 rounded-[1.5rem] border border-dashed p-5 text-sm leading-6 text-[var(--color-muted-foreground)]">
          Nenhum checkpoint registrado ainda.
        </div>
      ) : (
        <div className="mt-5 space-y-3">
          {sortCheckpointsByTime(checkpoints).map((checkpoint) => (
            <div key={checkpoint.id} className="theme-border surface-soft rounded-[1.5rem] border p-4">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                <div className="space-y-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="accent-emerald-surface rounded-full border px-3 py-1 text-xs uppercase tracking-[0.16em]">{checkpoint.time}</span>
                    <span className="text-sm font-medium text-[var(--color-foreground)]">{money.format(checkpoint.accumulatedAmount)}</span>
                  </div>
                  <div className="flex flex-wrap gap-2 text-sm text-[var(--color-muted-foreground)]">
                    {checkpoint.currentKm !== null ? <span>KM atual: {formatKm(checkpoint.currentKm)}</span> : null}
                    {checkpoint.note ? <span>{checkpoint.note}</span> : null}
                  </div>
                </div>

                <button type="button" onClick={() => onRemove(checkpoint.id)} className="theme-border surface-soft inline-flex h-10 w-10 items-center justify-center rounded-2xl border text-[var(--color-muted-foreground)] transition hover:bg-[var(--surface-hover)] hover:text-[var(--color-foreground)]">
                  <Trash2 className="h-4 w-4" />
                </button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

function QuickActionsSection(props: {
  activeQuickAction: QuickAction;
  checkpointDraft: { time: string; accumulatedAmount: string; currentKm: string; note: string };
  expenseDraft: { amount: string; category: DailyExpenseCategory };
  gainDraft: { amount: string; category: JourneyGainCategory };
  onAddCheckpoint: (event: React.FormEvent<HTMLFormElement>) => void;
  onAddExpense: (event: React.FormEvent<HTMLFormElement>) => void;
  onAddGain: (event: React.FormEvent<HTMLFormElement>) => void;
  onFinalize: () => void;
  onOpenQuickAction: (action: QuickAction) => void;
  showCheckpoints: boolean;
  setActiveQuickAction: React.Dispatch<React.SetStateAction<QuickAction>>;
  setCheckpointDraft: React.Dispatch<React.SetStateAction<{ time: string; accumulatedAmount: string; currentKm: string; note: string }>>;
  setExpenseDraft: React.Dispatch<React.SetStateAction<{ amount: string; category: DailyExpenseCategory }>>;
  setGainDraft: React.Dispatch<React.SetStateAction<{ amount: string; category: JourneyGainCategory }>>;
}) {
  return (
    <div className="theme-border surface-soft rounded-[1.5rem] border p-6">
      <div className={cn("grid gap-3 sm:grid-cols-2", props.showCheckpoints ? "xl:grid-cols-4" : "xl:grid-cols-3")}>
        <QuickActionButton title="Adicionar ganho" description="Lancar entrada rapida" icon={Coins} onClick={() => props.onOpenQuickAction("gain")} />
        <QuickActionButton title="Adicionar gasto" description="Registrar saida do dia" icon={ReceiptText} onClick={() => props.onOpenQuickAction("expense")} />
        {props.showCheckpoints ? (
          <QuickActionButton title="Registrar checkpoint" description="Marcar leitura por horario" icon={Waypoints} onClick={() => props.onOpenQuickAction("checkpoint")} />
        ) : null}
        <QuickActionButton title="Finalizar jornada" description="Revisar e concluir" icon={ArrowRight} onClick={props.onFinalize} />
      </div>

      {props.activeQuickAction === "gain" ? (
        <div className="theme-border surface-soft mt-5 rounded-[1.5rem] border p-5">
          <form className="space-y-4" onSubmit={props.onAddGain}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Valor" type="number" step="0.01" value={props.gainDraft.amount} onChange={(value) => props.setGainDraft((current) => ({ ...current, amount: value }))} />
              <SelectField label="Origem" value={props.gainDraft.category} onChange={(value) => props.setGainDraft((current) => ({ ...current, category: value as JourneyGainCategory }))} options={gainCategories.map((item) => ({ value: item.key, label: item.label }))} />
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button type="submit" className="home-cta-button inline-flex h-12 items-center justify-center rounded-2xl border px-5 text-sm font-semibold transition">Salvar ganho</button>
              <button type="button" onClick={() => props.setActiveQuickAction(null)} className="theme-border surface-soft inline-flex h-12 items-center justify-center rounded-2xl border px-5 text-sm font-medium text-[var(--color-foreground)] transition hover:bg-[var(--surface-hover)]">Fechar</button>
            </div>
          </form>
        </div>
      ) : null}

      {props.activeQuickAction === "expense" ? (
        <div className="theme-border surface-soft mt-5 rounded-[1.5rem] border p-5">
          <form className="space-y-4" onSubmit={props.onAddExpense}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Valor" type="number" step="0.01" value={props.expenseDraft.amount} onChange={(value) => props.setExpenseDraft((current) => ({ ...current, amount: value }))} />
              <SelectField label="Categoria" value={props.expenseDraft.category} onChange={(value) => props.setExpenseDraft((current) => ({ ...current, category: value as DailyExpenseCategory }))} options={expenseCategories.map((item) => ({ value: item.key, label: item.label }))} />
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button type="submit" className="home-cta-button inline-flex h-12 items-center justify-center rounded-2xl border px-5 text-sm font-semibold transition">Salvar gasto</button>
              <button type="button" onClick={() => props.setActiveQuickAction(null)} className="theme-border surface-soft inline-flex h-12 items-center justify-center rounded-2xl border px-5 text-sm font-medium text-[var(--color-foreground)] transition hover:bg-[var(--surface-hover)]">Fechar</button>
            </div>
          </form>
        </div>
      ) : null}

      {props.showCheckpoints && props.activeQuickAction === "checkpoint" ? (
        <div className="theme-border surface-soft mt-5 rounded-[1.5rem] border p-5">
          <form className="space-y-4" onSubmit={props.onAddCheckpoint}>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="Hora" type="time" value={props.checkpointDraft.time} inputMode={undefined} onChange={(value) => props.setCheckpointDraft((current) => ({ ...current, time: value }))} />
              <Field label="Arrecadado ate agora" type="number" step="0.01" value={props.checkpointDraft.accumulatedAmount} onChange={(value) => props.setCheckpointDraft((current) => ({ ...current, accumulatedAmount: value }))} />
            </div>
            <div className="grid gap-4 sm:grid-cols-2">
              <Field label="KM atual (opcional)" type="number" step="0.1" value={props.checkpointDraft.currentKm} onChange={(value) => props.setCheckpointDraft((current) => ({ ...current, currentKm: value }))} />
              <TextAreaField label="Observacao (opcional)" value={props.checkpointDraft.note} onChange={(value) => props.setCheckpointDraft((current) => ({ ...current, note: value }))} placeholder="Ex.: melhorou depois do almoco" />
            </div>
            <div className="flex flex-col gap-3 sm:flex-row">
              <button type="submit" className="home-cta-button inline-flex h-12 items-center justify-center rounded-2xl border px-5 text-sm font-semibold transition">Salvar checkpoint</button>
              <button type="button" onClick={() => props.setActiveQuickAction(null)} className="theme-border surface-soft inline-flex h-12 items-center justify-center rounded-2xl border px-5 text-sm font-medium text-[var(--color-foreground)] transition hover:bg-[var(--surface-hover)]">Fechar</button>
            </div>
          </form>
        </div>
      ) : null}
    </div>
  );
}

function FinalizeWizard({
  finalizeStep,
  journey,
  mode,
  pending,
  reviewForm,
  reviewMetrics,
  wallets,
  onBack,
  onConfirm,
  onNext,
  setReviewForm,
}: {
  finalizeStep: FinalizeStep;
  journey: ActiveJourneyRecord;
  mode: "create" | "edit";
  pending: boolean;
  reviewForm: JourneyReviewForm;
  reviewMetrics: NonNullable<ReturnType<typeof buildReviewMetrics>>;
  wallets: AppWallet[];
  onBack: () => void;
  onConfirm: () => void;
  onNext: () => void;
  setReviewForm: React.Dispatch<React.SetStateAction<JourneyReviewForm>>;
}) {
  return (
    <div className="theme-border surface-soft rounded-[1.5rem] border p-6">
      <div className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between">
        <div>
          <h3 className="text-2xl font-semibold text-[var(--color-foreground)]">Finalizar jornada</h3>
          <p className="mt-2 text-sm leading-6 text-[var(--color-muted-foreground)]">Revise so o necessario antes de concluir o fechamento.</p>
        </div>
        <div className="flex flex-wrap gap-2">
          {wizardSteps.map((step, index) => (
            <span key={step} className={cn("theme-border rounded-full border px-3 py-1 text-xs uppercase tracking-[0.16em]", finalizeStep === index + 1 ? "accent-emerald-surface" : "surface-soft text-[var(--color-muted-foreground)]")}>
              {index + 1}. {step}
            </span>
          ))}
        </div>
      </div>

      <div className="mt-6 space-y-6">
        {finalizeStep === 1 ? (
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label="Hora final" type="time" value={reviewForm.endTime} inputMode={undefined} onChange={(value) => setReviewForm((current) => ({ ...current, endTime: value }))} />
            <Field label="KM final" type="number" step="0.1" value={reviewForm.endKm} onChange={(value) => setReviewForm((current) => ({ ...current, endKm: value }))} />
          </div>
        ) : null}

        {finalizeStep === 2 ? (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-3">
              <MetricTile label="Ganhos" value={money.format(reviewMetrics.totalGains)} icon={Coins} accentClassName="accent-emerald-surface" />
              <MetricTile label="Gastos" value={money.format(reviewMetrics.totalExpenses)} icon={ReceiptText} accentClassName="accent-amber-surface" />
              <MetricTile label="Lucro" value={money.format(reviewMetrics.profit)} icon={CheckCircle2} accentClassName="accent-sky-surface" />
            </div>

            <div className="grid gap-6 xl:grid-cols-2">
              <div className="space-y-4">
                {gainCategories.map((item) => (
                  <Field key={item.key} label={item.label} type="number" step="0.01" value={reviewForm.gains[item.key]} onChange={(value) => setReviewForm((current) => ({ ...current, gains: { ...current.gains, [item.key]: value } }))} />
                ))}
              </div>

              <div className="space-y-4">
                {expenseCategories.map((item) => (
                  <Field key={item.key} label={item.label} type="number" step="0.01" value={reviewForm.expenses[item.key]} onChange={(value) => setReviewForm((current) => ({ ...current, expenses: { ...current.expenses, [item.key]: value } }))} />
                ))}
              </div>
            </div>

            {wallets.length > 0 ? (
              <div className="space-y-3">
                {wallets.map((wallet) => (
                  <WalletRow key={wallet.id} wallet={wallet} value={reviewForm.walletAllocation[wallet.id] ?? ""} onChange={(value) => setReviewForm((current) => ({ ...current, walletAllocation: { ...current.walletAllocation, [wallet.id]: value } }))} />
                ))}
              </div>
            ) : null}
          </div>
        ) : null}

        {finalizeStep === 3 ? (
          <div className="space-y-6">
            <div className="grid gap-4 md:grid-cols-2 xl:grid-cols-5">
              <MetricTile label="Horas trabalhadas" value={reviewMetrics.workedMinutes > 0 ? formatWorkedHours(reviewMetrics.workedMinutes) : "--"} icon={Timer} accentClassName="accent-emerald-surface" />
              <MetricTile label="KM rodados" value={reviewMetrics.workedKm > 0 ? `${reviewMetrics.workedKm.toFixed(1)} km` : "--"} icon={Route} accentClassName="accent-sky-surface" />
              <MetricTile label="Media por hora" value={reviewMetrics.hourlyAverage > 0 ? `${money.format(reviewMetrics.hourlyAverage)}/h` : "--"} icon={Coins} accentClassName="accent-amber-surface" />
              <MetricTile label="Lucro por KM" value={reviewMetrics.profitPerKm > 0 ? `${money.format(reviewMetrics.profitPerKm)}/km` : "--"} icon={MapPinned} accentClassName="accent-sky-surface" />
              <MetricTile label="Consumo do carro" value={reviewMetrics.consumption ? `${reviewMetrics.consumption.toFixed(1)} km/l` : "--"} icon={Fuel} accentClassName="accent-amber-surface" />
            </div>

            <div className="grid gap-4 md:grid-cols-3">
              <Field label="Valor abastecido" type="number" step="0.01" value={reviewForm.fuelAmount} onChange={(value) => setReviewForm((current) => ({ ...current, fuelAmount: value }))} />
              <Field label="Litros abastecidos" type="number" step="0.01" value={reviewForm.fuelLiters} onChange={(value) => setReviewForm((current) => ({ ...current, fuelLiters: value }))} />
              <Field label="Consumo informado" type="number" step="0.1" value={reviewForm.fuelConsumption} onChange={(value) => setReviewForm((current) => ({ ...current, fuelConsumption: value }))} />
            </div>
          </div>
        ) : null}

        {finalizeStep === 4 ? (
          <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
            <ReadingRow label="Data" value={formatDateLabel(journey.date)} />
            <ReadingRow label="Horario" value={`${journey.startTime} ate ${reviewForm.endTime || "--"}`} />
            <ReadingRow label="KM" value={`${formatKm(journey.startKm)} ate ${reviewForm.endKm ? formatKm(Number(reviewForm.endKm)) : "--"}`} />
            <ReadingRow label="Lucro do dia" value={money.format(reviewMetrics.profit)} />
          </div>
        ) : null}

        <div className="flex flex-col gap-3 sm:flex-row sm:justify-between">
          <button type="button" onClick={onBack} className="theme-border surface-soft inline-flex h-12 items-center justify-center rounded-2xl border px-4 text-sm font-medium text-[var(--color-foreground)] transition hover:bg-[var(--surface-hover)]">
            {finalizeStep === 1 ? (mode === "edit" ? "Cancelar" : "Voltar para jornada") : "Voltar"}
          </button>
          {finalizeStep < 4 ? (
            <button type="button" onClick={onNext} className="home-cta-button inline-flex h-12 items-center justify-center rounded-2xl border px-5 text-sm font-semibold transition">
              Avancar
            </button>
          ) : (
            <button type="button" disabled={pending} onClick={onConfirm} className="home-cta-button inline-flex h-12 items-center justify-center rounded-2xl border px-5 text-sm font-semibold transition disabled:opacity-60">
              {pending ? "Salvando..." : mode === "edit" ? "Salvar alteracoes" : "Concluir fechamento"}
            </button>
          )}
        </div>
      </div>
    </div>
  );
}

function buildTransactionsToPersist({
  wallets,
  reviewForm,
  reviewMetrics,
  journeyDate,
}: {
  wallets: AppWallet[];
  reviewForm: JourneyReviewForm;
  reviewMetrics: NonNullable<ReturnType<typeof buildReviewMetrics>>;
  journeyDate: string;
}) {
  const description = buildWalletDescription({
    uber: reviewMetrics.gains.Uber,
    app99: reviewMetrics.gains["99"],
    cash: reviewMetrics.gains.Dinheiro,
    other: reviewMetrics.gains.Outro,
  });
  const transactionsToPersist: Parameters<typeof addTransactionAction>[0][] = [];

  if (wallets.length > 0 && reviewMetrics.totalGains > 0) {
    for (const wallet of wallets) {
      const amount = Number(reviewForm.walletAllocation[wallet.id] || 0);
      if (amount <= 0) {
        continue;
      }

      transactionsToPersist.push({
        data: buildTransactionDate(journeyDate),
        valor: amount,
        tipo: "ganho",
        app: "Outro",
        formaPagamento: wallet.tipo === "fisica" ? "dinheiro" : "digital",
        categoria: "Fechamento do dia",
        descricao: description,
        walletId: wallet.id,
      });
    }
  } else if (reviewMetrics.totalGains > 0) {
    transactionsToPersist.push({
      data: buildTransactionDate(journeyDate),
      valor: reviewMetrics.totalGains,
      tipo: "ganho",
      app: "Outro",
      formaPagamento: "digital",
      categoria: "Fechamento do dia",
      descricao: description,
    });
  }

  transactionsToPersist.push(
    ...reviewMetrics.expenseEntries.map((entry) => ({
      data: buildTransactionDate(journeyDate),
      valor: entry.amount,
      tipo: "gasto" as const,
      app: "Outro" as const,
      formaPagamento: "dinheiro" as const,
      categoria: entry.category,
      descricao: "Fechamento do dia",
    })),
  );

  return transactionsToPersist;
}

function buildClosureFromReview({
  journey,
  reviewForm,
  reviewMetrics,
  initialClosure,
}: {
  journey: ActiveJourneyRecord;
  reviewForm: JourneyReviewForm;
  reviewMetrics: NonNullable<ReturnType<typeof buildReviewMetrics>>;
  initialClosure: DailyClosureRecord | null;
}) {
  return {
    id: initialClosure?.id ?? createLocalId(`closure-${journey.date}`),
    date: journey.date,
    uberAmount: reviewMetrics.gains.Uber,
    app99Amount: reviewMetrics.gains["99"],
    otherAmount: reviewMetrics.gains.Dinheiro + reviewMetrics.gains.Outro,
    expenses: reviewMetrics.expenseEntries.map((entry) => ({
      id: createLocalId(`expense-${entry.category}`),
      category: entry.category,
      amount: entry.amount,
    })),
    startTime: journey.startTime,
    endTime: reviewForm.endTime,
    startKm: journey.startKm,
    endKm: Number(reviewForm.endKm || 0),
    fuelAmount: reviewMetrics.fuelAmount,
    fuelLiters: reviewMetrics.fuelLiters,
    totalGains: reviewMetrics.totalGains,
    totalExpenses: reviewMetrics.totalExpenses,
    workedMinutes: reviewMetrics.workedMinutes,
    workedKm: reviewMetrics.workedKm,
    fuelConsumption: reviewMetrics.consumption,
    hourlyAverage: reviewMetrics.hourlyAverage,
    walletAllocations: reviewMetrics.walletAllocations,
  };
}

// HELPERS_MARKER
