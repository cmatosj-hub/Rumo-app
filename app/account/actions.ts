"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { z } from "zod";

import { createServerSupabaseClient } from "@/lib/supabase/server";

const profileSchema = z.object({
  fullName: z.string().trim().min(2),
  username: z
    .string()
    .trim()
    .min(3)
    .max(24)
    .regex(/^[a-z0-9_]+$/),
  avatarUrl: z.string().trim().url().or(z.literal("")),
});

const passwordSchema = z.object({
  password: z.string().min(6),
});

export async function updateProfileAction(input: z.infer<typeof profileSchema>) {
  const parsed = profileSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: "Revise nome, username e avatar antes de salvar." };
  }

  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return { ok: false, message: "Configure o Supabase para editar a conta." };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return { ok: false, message: "Faça login para editar sua conta." };
  }

  const { error } = await supabase.from("profiles").upsert(
    {
      id: user.id,
      full_name: parsed.data.fullName,
      username: parsed.data.username,
      avatar_url: parsed.data.avatarUrl || null,
    },
    { onConflict: "id" },
  );

  if (error) {
    if (error.message.toLowerCase().includes("username")) {
      return { ok: false, message: "Esse nome de usuário já está em uso." };
    }

    return { ok: false, message: error.message };
  }

  revalidatePath("/account");
  revalidatePath("/dashboard");
  revalidatePath("/settings");
  return { ok: true, message: "Perfil atualizado com sucesso." };
}

export async function updatePasswordAction(input: z.infer<typeof passwordSchema>) {
  const parsed = passwordSchema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, message: "A nova senha precisa ter pelo menos 6 caracteres." };
  }

  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return { ok: false, message: "Configure o Supabase para alterar a senha." };
  }

  const { error } = await supabase.auth.updateUser({ password: parsed.data.password });

  if (error) {
    return { ok: false, message: error.message };
  }

  return { ok: true, message: "Senha atualizada." };
}

export async function signOutAction(formData?: FormData) {
  const supabase = await createServerSupabaseClient();
  const redirectTarget = formData?.get("mode") === "switch-account" ? "/login?clear=1" : "/login";

  if (supabase) {
    await supabase.auth.signOut();
  }

  redirect(redirectTarget);
}
