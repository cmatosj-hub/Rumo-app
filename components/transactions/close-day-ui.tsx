import type React from "react";
import { Wallet } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Wallet as AppWallet } from "@/lib/types";
import { cn } from "@/lib/utils";

export type NoticeTone = "default" | "success" | "error";

export type InlineNotice = {
  tone: NoticeTone;
  text: string;
};

export function InlineNoticeCard({ notice }: { notice: InlineNotice }) {
  const toneClassName = {
    default: "theme-border surface-soft text-[var(--color-foreground)]",
    success: "accent-emerald-surface",
    error: "border-rose-300/24 bg-rose-400/10 text-rose-100",
  } as const;

  return (
    <div className={cn("rounded-[1.5rem] border px-4 py-3 text-sm", toneClassName[notice.tone])}>
      {notice.text}
    </div>
  );
}

export function QuickInfoCard({
  title,
  description,
  icon: Icon,
}: {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="theme-border surface-soft rounded-[1.5rem] border p-5">
      <div className="accent-sky-surface inline-flex rounded-2xl border p-2">
        <Icon className="h-4 w-4" />
      </div>
      <p className="mt-4 text-lg font-semibold text-[var(--color-foreground)]">{title}</p>
      <p className="mt-2 text-sm leading-6 text-[var(--color-muted-foreground)]">{description}</p>
    </div>
  );
}

export function QuickActionButton({
  title,
  description,
  icon: Icon,
  onClick,
}: {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  onClick: () => void;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="theme-border surface-soft surface-hover flex min-h-28 flex-col items-start justify-between rounded-[1.5rem] border p-4 text-left transition"
    >
      <div className="accent-emerald-surface rounded-2xl border p-2">
        <Icon className="h-4 w-4" />
      </div>
      <div>
        <p className="font-semibold text-[var(--color-foreground)]">{title}</p>
        <p className="mt-1 text-sm leading-6 text-[var(--color-muted-foreground)]">{description}</p>
      </div>
    </button>
  );
}

export function InlineActionCard({
  title,
  description,
  children,
}: {
  title: string;
  description: string;
  children: React.ReactNode;
}) {
  return (
    <div className="theme-border surface-soft mt-5 rounded-[1.5rem] border p-5">
      <p className="text-base font-semibold text-[var(--color-foreground)]">{title}</p>
      <p className="mt-2 text-sm leading-6 text-[var(--color-muted-foreground)]">{description}</p>
      <div className="mt-5">{children}</div>
    </div>
  );
}

export function MetricTile({
  label,
  value,
  icon: Icon,
  accentClassName,
}: {
  label: string;
  value: string;
  icon: React.ComponentType<{ className?: string }>;
  accentClassName: string;
}) {
  return (
    <Card>
      <CardContent className="p-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted-foreground)]">{label}</p>
            <p className="mt-4 text-2xl font-semibold text-[var(--color-foreground)]">{value}</p>
          </div>
          <div className={`${accentClassName} rounded-2xl border p-3`}>
            <Icon className="h-5 w-5" />
          </div>
        </div>
      </CardContent>
    </Card>
  );
}

export function CompactBreakdownRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-2xl bg-[var(--surface-strong)] px-4 py-3 text-sm">
      <span className="text-[var(--color-muted-foreground)]">{label}</span>
      <span className="font-semibold text-[var(--color-foreground)]">{value}</span>
    </div>
  );
}

export function InfoPill({
  icon: Icon,
  label,
}: {
  icon: React.ComponentType<{ className?: string }>;
  label: string;
}) {
  return (
    <div className="theme-border surface-soft inline-flex items-center gap-2 rounded-full border px-3 py-2 text-sm text-[var(--color-foreground)]">
      <Icon className="h-4 w-4 text-[var(--color-muted-foreground)]" />
      {label}
    </div>
  );
}

export function ReadingRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="theme-border surface-soft flex min-h-24 flex-col justify-between rounded-3xl border p-4">
      <p className="text-xs uppercase tracking-[0.18em] text-[var(--color-muted-foreground)]">{label}</p>
      <p className="mt-3 break-words text-xl font-semibold leading-7 text-[var(--color-foreground)]">{value}</p>
    </div>
  );
}

export function Field({
  label,
  value,
  onChange,
  type = "text",
  step,
  placeholder,
  inputMode = "decimal",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: React.HTMLInputTypeAttribute;
  step?: string;
  placeholder?: string;
  inputMode?: React.HTMLAttributes<HTMLInputElement>["inputMode"];
}) {
  return (
    <div className="space-y-2">
      <Label className="leading-none">{label}</Label>
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

export function SelectField({
  label,
  value,
  onChange,
  options,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  options: Array<{ value: string; label: string }>;
}) {
  return (
    <div className="space-y-2">
      <Label className="leading-none">{label}</Label>
      <select
        value={value}
        onChange={(event) => onChange(event.target.value)}
        className="theme-border surface-soft h-12 w-full rounded-2xl border px-4 text-[var(--color-foreground)] outline-none focus:border-emerald-300/50 focus:bg-[var(--surface-hover)]"
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
    </div>
  );
}

export function TextAreaField({
  label,
  value,
  onChange,
  placeholder,
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
}) {
  return (
    <div className="space-y-2">
      <Label className="leading-none">{label}</Label>
      <textarea
        value={value}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        rows={3}
        className="theme-border surface-soft min-h-28 w-full rounded-2xl border px-4 py-3 text-[var(--color-foreground)] outline-none placeholder:text-[var(--color-muted-foreground)] focus:border-emerald-300/50 focus:bg-[var(--surface-hover)]"
      />
    </div>
  );
}

export function WalletRow({
  wallet,
  value,
  onChange,
}: {
  wallet: AppWallet;
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="grid gap-3 rounded-2xl bg-[var(--surface-strong)] p-3 sm:grid-cols-[minmax(0,1fr)_10rem] sm:items-center">
      <div>
        <div className="flex items-center gap-2">
          <Wallet className="h-4 w-4 text-[var(--color-muted-foreground)]" />
          <p className="font-medium text-[var(--color-foreground)]">{wallet.nome}</p>
        </div>
        <p className="mt-1 text-xs uppercase tracking-[0.16em] text-[var(--color-muted-foreground)]">
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

export function ActionButtons({
  primaryLabel,
  onPrimary,
  secondaryLabel,
  onSecondary,
  primaryDisabled = false,
}: {
  primaryLabel: string;
  onPrimary: () => void;
  secondaryLabel: string;
  onSecondary: () => void;
  primaryDisabled?: boolean;
}) {
  return (
    <div className="flex flex-col gap-3 sm:flex-row">
      <Button type="button" className="home-cta-button h-12 sm:min-w-44" disabled={primaryDisabled} onClick={onPrimary}>
        {primaryLabel}
      </Button>
      <Button type="button" variant="ghost" className="h-12 sm:min-w-36" onClick={onSecondary}>
        {secondaryLabel}
      </Button>
    </div>
  );
}
