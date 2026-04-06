"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createServerSupabaseClient } from "@/lib/supabase/server";

const loginSchema = z.object({
  email: z.string().trim().email("Informe um e-mail valido."),
  password: z.string().min(1, "Informe sua senha."),
});

const signUpSchema = z.object({
  email: z.string().trim().email("Informe um e-mail valido."),
  password: z.string().min(6, "A senha precisa ter pelo menos 6 caracteres."),
  fullName: z.string().trim().min(2, "Informe seu nome."),
  username: z
    .string()
    .trim()
    .min(3, "Seu usuario precisa ter pelo menos 3 caracteres.")
    .max(24, "Seu usuario pode ter no maximo 24 caracteres.")
    .regex(/^[a-z0-9_]+$/, "Use apenas letras minusculas, numeros e underscore."),
});

export async function signInWithPasswordAction(formData: FormData) {
  const parsed = loginSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Revise seu login." };
  }

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return { ok: false, message: "Configure as variaveis do Supabase para ativar a autenticacao." };
  }

  const { error } = await supabase.auth.signInWithPassword({
    email: parsed.data.email,
    password: parsed.data.password,
  });

  if (error) {
    if (isEmailNotConfirmedError(error.message)) {
      return {
        ok: false,
        requiresEmailConfirmation: true,
        message: "Seu e-mail ainda nao foi confirmado. Abra sua caixa de entrada, confirme a conta e tente novamente.",
      };
    }

    if (isInvalidLoginError(error.message)) {
      return { ok: false, message: "Senha incorreta. Tente novamente." };
    }

    return { ok: false, message: "Nao foi possivel entrar agora. Tente novamente." };
  }

  revalidatePath("/", "layout");
  return { ok: true, message: "Login realizado com sucesso." };
}

export async function signUpWithPasswordAction(formData: FormData) {
  const parsed = signUpSchema.safeParse({
    email: formData.get("email"),
    password: formData.get("password"),
    fullName: formData.get("fullName"),
    username: String(formData.get("username") ?? "")
      .trim()
      .toLowerCase(),
  });

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Revise seus dados de cadastro." };
  }

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return { ok: false, message: "Configure as variaveis do Supabase para ativar o cadastro." };
  }

  const { data, error } = await supabase.auth.signUp({
    email: parsed.data.email,
    password: parsed.data.password,
    options: {
      data: {
        full_name: parsed.data.fullName,
        username: parsed.data.username,
      },
    },
  });

  if (error) {
    return { ok: false, message: error.message };
  }

  if (data.user && data.session) {
    const { error: profileError } = await supabase.from("profiles").upsert(
      {
        id: data.user.id,
        email: parsed.data.email,
        full_name: parsed.data.fullName,
        username: parsed.data.username,
      },
      { onConflict: "id" },
    );

    if (profileError) {
      if (profileError.message.toLowerCase().includes("username")) {
        return { ok: false, message: "Esse nome de usuario ja esta em uso." };
      }

      return { ok: false, message: profileError.message };
    }
  }

  revalidatePath("/", "layout");

  if (!data.session) {
    return {
      ok: true,
      requiresEmailConfirmation: true,
      message:
        "Conta criada. Agora confirme seu e-mail para liberar o primeiro acesso. Depois disso, voce entra normalmente com usuario/e-mail e senha.",
    };
  }

  return { ok: true, message: "Conta criada com sucesso. Voce ja pode entrar com e-mail e senha." };
}

function isEmailNotConfirmedError(message: string) {
  const normalized = message.toLowerCase();
  return normalized.includes("email not confirmed") || normalized.includes("email_not_confirmed");
}

function isInvalidLoginError(message: string) {
  const normalized = message.toLowerCase();
  return normalized.includes("invalid login credentials") || normalized.includes("invalid_credentials");
}
