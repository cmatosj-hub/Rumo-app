"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";

import { createAdminSupabaseClient } from "@/lib/supabase/admin";
import { createServerSupabaseClient } from "@/lib/supabase/server";

const loginSchema = z.object({
  identifier: z.string().trim().min(3, "Informe seu e-mail ou nome de usuario."),
  password: z.string().min(6, "Informe sua senha com pelo menos 6 caracteres."),
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
    identifier: formData.get("identifier"),
    password: formData.get("password"),
  });

  if (!parsed.success) {
    return { ok: false, message: parsed.error.issues[0]?.message ?? "Revise seu login." };
  }

  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return { ok: false, message: "Configure as variaveis do Supabase para ativar a autenticacao." };
  }

  const resolvedLogin = await resolveLoginEmail(parsed.data.identifier);

  if (!resolvedLogin.email) {
    if (resolvedLogin.reason === "profiles_table_missing") {
      return {
        ok: false,
        message:
          "O login por usuario ainda nao esta pronto neste projeto Supabase. Aplique as migrations da pasta supabase/migrations e tente novamente.",
      };
    }

    if (!parsed.data.identifier.includes("@") && !createAdminSupabaseClient()) {
      return {
        ok: false,
        message: "Para login por usuario, adicione SUPABASE_SERVICE_ROLE_KEY no .env.local. O login por e-mail ja funciona.",
      };
    }

    return { ok: false, message: "Nao foi possivel entrar. Confira usuario/e-mail e senha." };
  }

  const { error } = await supabase.auth.signInWithPassword({
    email: resolvedLogin.email,
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

    return { ok: false, message: "Nao foi possivel entrar. Confira usuario/e-mail e senha." };
  }

  revalidatePath("/", "layout");
  return { ok: true, message: "Login realizado com sucesso." };
}

async function resolveLoginEmail(identifier: string): Promise<{
  email: string | null;
  reason: "ok" | "invalid_email" | "not_found" | "profiles_table_missing" | "query_failed";
}> {
  const normalized = identifier.trim().toLowerCase();

  if (normalized.includes("@")) {
    const parsed = z.string().email().safeParse(normalized);
    return {
      email: parsed.success ? parsed.data : null,
      reason: parsed.success ? "ok" : "invalid_email",
    };
  }

  const adminSupabase = createAdminSupabaseClient();
  if (!adminSupabase) {
    return { email: null, reason: "query_failed" };
  }

  const { data, error } = await adminSupabase
    .from("profiles")
    .select("email")
    .eq("username", normalized)
    .maybeSingle();

  if (error) {
    if (error.message.toLowerCase().includes("could not find the table")) {
      return { email: null, reason: "profiles_table_missing" };
    }

    return { email: null, reason: "query_failed" };
  }

  if (!data?.email) {
    return { email: null, reason: "not_found" };
  }

  return { email: data.email, reason: "ok" };
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
