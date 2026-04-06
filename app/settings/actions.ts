"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createServerSupabaseClient } from "@/lib/supabase/server";

const settingsSchema = z.object({
  metaDiaria: z.coerce.number().min(0),
  diasTrabalhoSemana: z.coerce.number().int().min(1).max(7),
  porcentagemOperacional: z.coerce.number().min(0).max(100),
  porcentagemEmergencia: z.coerce.number().min(0).max(100),
  porcentagemPessoal: z.coerce.number().min(0).max(100),
});

const creditorSchema = z.object({
  nome: z.string().trim().min(2),
  valorMensal: z.coerce.number().min(0.01),
  diaVencimento: z.coerce.number().int().min(1).max(31),
});

export async function saveSettingsAction(input: z.infer<typeof settingsSchema>) {
  const parsed = settingsSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: "Revise os campos da configuração antes de salvar." };
  }

  const total =
    parsed.data.porcentagemOperacional +
    parsed.data.porcentagemEmergencia +
    parsed.data.porcentagemPessoal;

  if (total !== 100) {
    return { ok: false, message: "A soma do split precisa fechar em 100%." };
  }

  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return { ok: false, message: "Configure o Supabase para salvar os dados." };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, message: "Faça login para editar suas configurações." };
  }

  const { error } = await supabase.from("settings").upsert(
    {
      user_id: user.id,
      meta_diaria: parsed.data.metaDiaria,
      dias_trabalho_semana: parsed.data.diasTrabalhoSemana,
      porcentagem_operacional: parsed.data.porcentagemOperacional,
      porcentagem_emergencia: parsed.data.porcentagemEmergencia,
      porcentagem_pessoal: parsed.data.porcentagemPessoal,
    },
    {
      onConflict: "user_id",
    },
  );

  if (error) {
    return { ok: false, message: error.message };
  }

  revalidatePath("/settings");
  revalidatePath("/dashboard");
  revalidatePath("/contas");
  return { ok: true, message: "Configurações salvas com sucesso." };
}

export async function addCreditorAction(input: z.infer<typeof creditorSchema>) {
  const parsed = creditorSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: "Preencha nome, valor mensal e vencimento do credor." };
  }

  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return { ok: false, message: "Configure o Supabase para cadastrar credores." };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, message: "Faça login para cadastrar credores." };
  }

  const { error } = await supabase.from("creditors").insert({
    user_id: user.id,
    nome: parsed.data.nome,
    valor_mensal: parsed.data.valorMensal,
    dia_vencimento: parsed.data.diaVencimento,
    status: "ativo",
  });

  if (error) {
    return { ok: false, message: error.message };
  }

  revalidatePath("/settings");
  revalidatePath("/contas");
  revalidatePath("/dashboard");
  return { ok: true, message: "Credor cadastrado." };
}

export async function toggleCreditorStatusAction(creditorId: string, nextStatus: "ativo" | "pago") {
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return { ok: false, message: "Configure o Supabase para editar credores." };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, message: "Faça login para editar credores." };
  }

  const { error } = await supabase
    .from("creditors")
    .update({ status: nextStatus })
    .eq("id", creditorId)
    .eq("user_id", user.id);

  if (error) {
    return { ok: false, message: error.message };
  }

  revalidatePath("/settings");
  revalidatePath("/contas");
  revalidatePath("/dashboard");
  return { ok: true, message: "Status do credor atualizado." };
}

export async function deleteCreditorAction(creditorId: string) {
  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return { ok: false, message: "Configure o Supabase para excluir credores." };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, message: "Faça login para excluir credores." };
  }

  const { error } = await supabase.from("creditors").delete().eq("id", creditorId).eq("user_id", user.id);

  if (error) {
    return { ok: false, message: error.message };
  }

  revalidatePath("/settings");
  revalidatePath("/contas");
  revalidatePath("/dashboard");
  return { ok: true, message: "Credor removido." };
}
