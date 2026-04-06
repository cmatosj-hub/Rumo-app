"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createServerSupabaseClient } from "@/lib/supabase/server";

const walletSchema = z.object({
  nome: z.string().trim().min(2),
  tipo: z.enum(["fisica", "digital"]),
  saldoAtual: z.coerce.number(),
});

export async function addWalletAction(input: z.infer<typeof walletSchema>) {
  const parsed = walletSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: "Revise os dados da carteira." };
  }

  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return { ok: false, message: "Configure o Supabase para cadastrar carteiras." };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, message: "Faça login para cadastrar carteiras." };
  }

  const { error } = await supabase.from("wallets").insert({
    user_id: user.id,
    nome: parsed.data.nome,
    tipo: parsed.data.tipo,
    saldo_atual: parsed.data.saldoAtual,
  });

  if (error) {
    return { ok: false, message: error.message };
  }

  revalidatePath("/wallets");
  revalidatePath("/dashboard");
  revalidatePath("/settings");
  return { ok: true, message: "Carteira criada." };
}

export async function deleteWalletAction(walletId: string) {
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return { ok: false, message: "Configure o Supabase para excluir carteiras." };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) {
    return { ok: false, message: "Faça login para excluir carteiras." };
  }

  const { error } = await supabase.from("wallets").delete().eq("id", walletId).eq("user_id", user.id);

  if (error) {
    return { ok: false, message: error.message };
  }

  revalidatePath("/wallets");
  revalidatePath("/dashboard");
  revalidatePath("/settings");
  return { ok: true, message: "Carteira removida." };
}
