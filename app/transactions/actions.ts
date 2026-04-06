"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createServerSupabaseClient } from "@/lib/supabase/server";

const transactionSchema = z.object({
  data: z.string().min(1),
  valor: z.coerce.number().positive(),
  tipo: z.enum(["ganho", "gasto"]),
  app: z.enum(["Uber", "99", "Particular", "Outro"]),
  formaPagamento: z.enum(["dinheiro", "digital"]),
  categoria: z.string().trim().min(2),
  descricao: z.string().trim().optional(),
  walletId: z.string().optional(),
});

export async function addTransactionAction(input: z.infer<typeof transactionSchema>) {
  const parsed = transactionSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: "Revise os dados da transação." };
  }

  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return { ok: false, message: "Configure o Supabase para salvar transações." };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, message: "Faça login para salvar transações." };
  }

  const { error } = await supabase.from("transactions").insert({
    user_id: user.id,
    data: parsed.data.data,
    valor: parsed.data.valor,
    tipo: parsed.data.tipo,
    app: parsed.data.app,
    forma_pagamento: parsed.data.formaPagamento,
    categoria: parsed.data.categoria,
    descricao: parsed.data.descricao || null,
    wallet_id: parsed.data.walletId || null,
  });

  if (error) {
    return { ok: false, message: error.message };
  }

  revalidatePath("/transactions");
  revalidatePath("/dashboard");
  revalidatePath("/wallets");
  revalidatePath("/relatorios");
  return { ok: true, message: "Transação salva." };
}

export async function deleteTransactionAction(transactionId: string) {
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return { ok: false, message: "Configure o Supabase para excluir transações." };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, message: "Faça login para excluir transações." };
  }

  const { error } = await supabase.from("transactions").delete().eq("id", transactionId).eq("user_id", user.id);

  if (error) {
    return { ok: false, message: error.message };
  }

  revalidatePath("/transactions");
  revalidatePath("/dashboard");
  revalidatePath("/wallets");
  revalidatePath("/relatorios");
  return { ok: true, message: "Transação removida." };
}
