"use client";

import Link from "next/link";
import { useMemo } from "react";

import { useDriverJournal } from "@/components/driver-journal/use-driver-journal";
import { CloseDayClient } from "@/components/transactions/close-day-client";
import { Card, CardContent } from "@/components/ui/card";
import type { SettingsRecord } from "@/lib/types";
import type { Wallet } from "@/lib/types";

export function ClosureEditClient({
  date,
  settings,
  wallets,
}: {
  date: string;
  settings: SettingsRecord;
  wallets: Wallet[];
}) {
  const { store, loaded } = useDriverJournal();
  const closure = useMemo(() => store.closures.find((item) => item.date === date) ?? null, [date, store.closures]);

  if (!loaded) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-sm text-[var(--color-muted-foreground)]">Carregando fechamento...</p>
        </CardContent>
      </Card>
    );
  }

  if (!closure) {
    return (
      <Card>
        <CardContent className="p-6">
          <p className="text-sm text-[var(--color-muted-foreground)]">
            Nenhum fechamento encontrado para essa data.{" "}
            <Link href="/fechamentos" className="font-medium text-[var(--color-foreground)]">
              Voltar para o histórico
            </Link>
          </p>
        </CardContent>
      </Card>
    );
  }

  return <CloseDayClient settings={settings} wallets={wallets} initialClosure={closure} mode="edit" />;
}
