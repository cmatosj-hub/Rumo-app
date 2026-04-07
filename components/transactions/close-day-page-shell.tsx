"use client";

import dynamic from "next/dynamic";
import Link from "next/link";
import { Check, ReceiptText, Settings2, X } from "lucide-react";
import { forwardRef, useEffect, useId, useRef, useState } from "react";
import type { RefObject } from "react";

import { CloseDayClient } from "@/components/transactions/close-day-client";
import type { SettingsRecord as AppSettingsRecord, Wallet as AppWallet } from "@/lib/types";
import { cn } from "@/lib/utils";

const CloseDayTraditionalClient = dynamic(
  () =>
    import("./close-day-traditional-client").then((module) => ({
      default: module.CloseDayTraditionalClient,
    })),
  {
    loading: () => <PreferenceLoadingCard text="Carregando o formulario tradicional..." />,
  },
);

type ClosingDayInterfaceMode = "new_simple" | "new_with_checkpoints" | "traditional";

const CLOSING_DAY_INTERFACE_MODE_STORAGE_KEY = "rumo_closing_day_interface_mode_v1";
const focusRingClassName =
  "focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--color-primary)]/40 focus-visible:ring-offset-2 focus-visible:ring-offset-[var(--color-background)]";
const interfaceModes: Array<{
  value: ClosingDayInterfaceMode;
  label: string;
  subtitle: string;
  description: string;
}> = [
  {
    value: "new_simple",
    label: "Novo simples",
    subtitle: "Jornada simplificada",
    description: "Inicie o dia, registre ganhos e gastos ao longo da jornada e finalize com revisao curta.",
  },
  {
    value: "new_with_checkpoints",
    label: "Novo com checkpoints",
    subtitle: "Jornada com acompanhamento por horario",
    description: "Use a nova jornada com checkpoints opcionais e timeline para comparar momentos do dia.",
  },
  {
    value: "traditional",
    label: "Tradicional",
    subtitle: "Formulario completo classico",
    description: "Preencha tudo de uma vez no modelo antigo, mantendo os campos e o resumo automatico.",
  },
];

function isClosingDayInterfaceMode(value: string | null): value is ClosingDayInterfaceMode {
  return interfaceModes.some((option) => option.value === value);
}

export function CloseDayPageShell({
  settings,
  wallets,
}: {
  settings: AppSettingsRecord;
  wallets: AppWallet[];
}) {
  const dialogId = useId();
  const dialogTitleId = useId();
  const triggerRef = useRef<HTMLButtonElement>(null);
  const closeButtonRef = useRef<HTMLButtonElement>(null);
  const [mode, setMode] = useState<ClosingDayInterfaceMode>("new_simple");
  const [loaded, setLoaded] = useState(false);
  const [isSelectorOpen, setIsSelectorOpen] = useState(false);

  useEffect(() => {
    try {
      const storedMode = window.localStorage.getItem(CLOSING_DAY_INTERFACE_MODE_STORAGE_KEY);
      if (isClosingDayInterfaceMode(storedMode)) {
        setMode(storedMode);
      }
    } finally {
      setLoaded(true);
    }
  }, []);

  useEffect(() => {
    if (!loaded) {
      return;
    }

    window.localStorage.setItem(CLOSING_DAY_INTERFACE_MODE_STORAGE_KEY, mode);
  }, [loaded, mode]);

  useEffect(() => {
    if (!isSelectorOpen) {
      return undefined;
    }

    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        setIsSelectorOpen(false);
        window.requestAnimationFrame(() => {
          triggerRef.current?.focus();
        });
      }
    };

    document.addEventListener("keydown", handleEscape);
    closeButtonRef.current?.focus();

    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isSelectorOpen]);

  const activeMode = interfaceModes.find((option) => option.value === mode) ?? interfaceModes[0];

  function handleSelectMode(nextMode: ClosingDayInterfaceMode) {
    setMode(nextMode);
    setIsSelectorOpen(false);

    window.requestAnimationFrame(() => {
      triggerRef.current?.focus();
    });
  }

  return (
    <>
      <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
        <div className="flex items-center gap-3">
          <div className="accent-emerald-surface rounded-2xl border p-3">
            <ReceiptText className="h-5 w-5" />
          </div>
          <div>
            <p className="accent-emerald text-sm uppercase tracking-[0.24em]">Fechar dia</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-[var(--color-foreground)]">
              Registre sua jornada
            </h1>
            <p className="mt-2 text-sm leading-6 text-[var(--color-muted-foreground)]">
              Escolha como prefere registrar o dia. Modo atual: {activeMode.label}.
            </p>
          </div>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <CloseDayModeSelector
            activeMode={mode}
            closeButtonRef={closeButtonRef}
            dialogId={dialogId}
            dialogTitleId={dialogTitleId}
            focusRingClassName={focusRingClassName}
            isOpen={isSelectorOpen}
            onClose={() => {
              setIsSelectorOpen(false);
              window.requestAnimationFrame(() => {
                triggerRef.current?.focus();
              });
            }}
            onOpen={() => setIsSelectorOpen(true)}
            onSelect={handleSelectMode}
            ref={triggerRef}
          />

          <Link
            href="/fechamentos"
            className={cn(
              "theme-border surface-soft inline-flex h-11 items-center justify-center rounded-2xl border px-4 text-sm font-medium text-[var(--color-foreground)] transition hover:bg-[var(--surface-hover)]",
              focusRingClassName,
            )}
          >
            Ver fechamentos
          </Link>
        </div>
      </div>

      <div className="mt-8 space-y-8">
        {!loaded ? <PreferenceLoadingCard text="Carregando sua forma preferida de fechar o dia..." /> : null}
        {loaded && mode === "new_simple" ? (
          <CloseDayClient key="new_simple" settings={settings} wallets={wallets} showCheckpoints={false} />
        ) : null}
        {loaded && mode === "new_with_checkpoints" ? (
          <CloseDayClient key="new_with_checkpoints" settings={settings} wallets={wallets} showCheckpoints />
        ) : null}
        {loaded && mode === "traditional" ? (
          <CloseDayTraditionalClient settings={settings} wallets={wallets} />
        ) : null}
      </div>
    </>
  );
}

function PreferenceLoadingCard({ text }: { text: string }) {
  return (
    <div className="theme-border surface-soft rounded-[1.5rem] border px-4 py-5 text-sm text-[var(--color-muted-foreground)]">
      {text}
    </div>
  );
}

type CloseDayModeSelectorProps = {
  activeMode: ClosingDayInterfaceMode;
  closeButtonRef: RefObject<HTMLButtonElement | null>;
  dialogId: string;
  dialogTitleId: string;
  focusRingClassName: string;
  isOpen: boolean;
  onClose: () => void;
  onOpen: () => void;
  onSelect: (mode: ClosingDayInterfaceMode) => void;
};

const CloseDayModeSelector = forwardRef<HTMLButtonElement, CloseDayModeSelectorProps>(
  function CloseDayModeSelector(
    {
      activeMode,
      closeButtonRef,
      dialogId,
      dialogTitleId,
      focusRingClassName,
      isOpen,
      onClose,
      onOpen,
      onSelect,
    },
    ref,
  ) {
    return (
      <>
        <button
          ref={ref}
          type="button"
          aria-controls={dialogId}
          aria-expanded={isOpen}
          aria-haspopup="dialog"
          aria-label="Escolher modo de interface do fechamento do dia"
          className={cn(
            "theme-border surface-soft surface-hover inline-flex min-h-11 items-center gap-2 rounded-2xl border px-4 py-3 text-sm font-medium text-[var(--color-foreground)] transition",
            focusRingClassName,
          )}
          onClick={onOpen}
        >
          <Settings2 className="h-4 w-4" />
          <span>Modo</span>
        </button>

        <div
          className={cn(
            "fixed inset-0 z-50 transition-opacity duration-200 ease-out",
            isOpen ? "pointer-events-auto opacity-100" : "pointer-events-none opacity-0",
          )}
          aria-hidden={!isOpen}
        >
          <button
            type="button"
            aria-label="Fechar seletor de modo"
            className="absolute inset-0 bg-black/55 backdrop-blur-sm"
            onClick={onClose}
            tabIndex={-1}
          />

          <div
            id={dialogId}
            role="dialog"
            aria-modal="true"
            aria-labelledby={dialogTitleId}
            inert={!isOpen}
            className={cn(
              "glass-panel theme-border fixed inset-x-4 bottom-4 z-50 rounded-[2rem] border p-5 shadow-2xl shadow-black/40 transition duration-200 ease-out sm:inset-x-auto sm:right-8 sm:top-24 sm:w-[min(32rem,calc(100vw-4rem))]",
              isOpen ? "translate-y-0 opacity-100" : "translate-y-4 opacity-0",
            )}
          >
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-[var(--color-muted-foreground)]">
                  Preferencia da tela
                </p>
                <h2 id={dialogTitleId} className="mt-3 text-2xl font-semibold text-[var(--color-foreground)]">
                  Escolha como prefere registrar seu dia
                </h2>
                <p className="mt-3 text-sm leading-6 text-[var(--color-muted-foreground)]">
                  A troca acontece na hora e sua preferencia fica salva para os proximos acessos.
                </p>
              </div>

              <button
                ref={closeButtonRef}
                type="button"
                aria-label="Fechar configuracao do modo"
                className={cn(
                  "theme-border surface-soft surface-hover inline-flex h-10 w-10 items-center justify-center rounded-2xl border text-[var(--color-muted-foreground)] transition hover:text-[var(--color-foreground)]",
                  focusRingClassName,
                )}
                onClick={onClose}
              >
                <X className="h-4 w-4" />
              </button>
            </div>

            <div className="mt-6 space-y-3">
              {interfaceModes.map((option) => {
                const isActive = option.value === activeMode;

                return (
                  <button
                    key={option.value}
                    type="button"
                    aria-pressed={isActive}
                    className={cn(
                      "theme-border surface-soft surface-hover w-full rounded-[1.5rem] border p-4 text-left transition",
                      focusRingClassName,
                      isActive ? "accent-emerald-surface" : undefined,
                    )}
                    onClick={() => onSelect(option.value)}
                  >
                    <div className="flex items-start justify-between gap-4">
                      <div>
                        <p className="font-semibold text-[var(--color-foreground)]">{option.label}</p>
                        <p className="mt-1 text-sm text-[var(--color-muted-foreground)]">{option.subtitle}</p>
                        <p className="mt-3 text-sm leading-6 text-[var(--color-muted-foreground)]">
                          {option.description}
                        </p>
                      </div>

                      <span
                        className={cn(
                          "inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border",
                          isActive ? "accent-emerald-surface" : "theme-border surface-soft",
                        )}
                      >
                        {isActive ? (
                          <Check className="h-4 w-4 text-[var(--color-foreground)]" />
                        ) : (
                          <span className="h-2.5 w-2.5 rounded-full bg-[var(--color-muted-foreground)]/40" />
                        )}
                      </span>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </>
    );
  },
);

CloseDayModeSelector.displayName = "CloseDayModeSelector";
