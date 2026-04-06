"use client";

import type React from "react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { addWalletAction, deleteWalletAction } from "@/app/wallets/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { Wallet } from "@/lib/types";

export function WalletsClient({ wallets }: { wallets: Wallet[] }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [message, setMessage] = useState<string | null>(null);
  const [form, setForm] = useState({
    nome: "",
    tipo: "fisica",
    saldoAtual: "0",
  });

  return (
    <div className="grid gap-6 xl:grid-cols-[0.9fr_1.1fr]">
      <Card>
        <CardHeader>
          <CardTitle>Adicionar lugar do dinheiro</CardTitle>
          <CardDescription>Cadastre onde seu dinheiro realmente esta.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Field label="Nome" value={form.nome} onChange={(value) => setForm((current) => ({ ...current, nome: value }))} />

          <div className="space-y-2">
            <Label>Tipo</Label>
            <select
              value={form.tipo}
              onChange={(event) => setForm((current) => ({ ...current, tipo: event.target.value }))}
              className="theme-border surface-soft h-12 w-full rounded-2xl border px-4 text-[var(--color-foreground)]"
            >
              <option value="fisica">Dinheiro</option>
              <option value="digital">Digital</option>
            </select>
          </div>

          <Field
            label="Saldo inicial"
            type="number"
            value={form.saldoAtual}
            onChange={(value) => setForm((current) => ({ ...current, saldoAtual: value }))}
          />

          <Button
            className="w-full"
            disabled={pending}
            onClick={() =>
              startTransition(async () => {
                const result = await addWalletAction({
                  nome: form.nome,
                  tipo: form.tipo as "fisica" | "digital",
                  saldoAtual: Number(form.saldoAtual),
                });
                setMessage(result.message);
                if (result.ok) {
                  setForm({ nome: "", tipo: "fisica", saldoAtual: "0" });
                  router.refresh();
                }
              })
            }
          >
            {pending ? "Salvando..." : "Salvar"}
          </Button>
          {message ? <p className="text-sm text-[var(--color-muted-foreground)]">{message}</p> : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Onde esta o dinheiro</CardTitle>
          <CardDescription>Use dinheiro, digital e banco para organizar melhor o caixa.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          {wallets.length === 0 ? (
            <div className="theme-border rounded-3xl border border-dashed p-6 text-sm text-[var(--color-muted-foreground)]">
              Nenhum lugar do dinheiro cadastrado ainda.
            </div>
          ) : null}

          {wallets.map((wallet) => (
            <div key={wallet.id} className="theme-border surface-soft rounded-3xl border p-4">
              <div className="flex items-center justify-between gap-3">
                <div>
                  <p className="font-semibold text-[var(--color-foreground)]">{wallet.nome}</p>
                  <p className="text-sm text-[var(--color-muted-foreground)]">
                    {wallet.tipo === "fisica" ? "Dinheiro" : "Digital"}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-[var(--color-foreground)]">
                    {new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(wallet.saldoAtual)}
                  </p>
                  <Button
                    variant="ghost"
                    className="mt-2"
                    onClick={async () => {
                      const result = await deleteWalletAction(wallet.id);
                      setMessage(result.message);
                      if (result.ok) router.refresh();
                    }}
                  >
                    Excluir
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </CardContent>
      </Card>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: React.HTMLInputTypeAttribute;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input type={type} value={value} onChange={(event) => onChange(event.target.value)} />
    </div>
  );
}
