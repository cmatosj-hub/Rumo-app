import "server-only";

import { z } from "zod";

import { createAdminSupabaseClient } from "@/lib/supabase/admin";

const emailSchema = z.string().email("Informe um e-mail valido.");

export type ResolveLoginIdentifierResult = {
  success: boolean;
  resolvedEmail: string | null;
  displayIdentifier: string;
  errorMessage: string | null;
};

// This lookup depends on public.profiles.username + public.profiles.email being
// kept in sync by the Supabase migrations. The service role key must remain
// server-only and never be exposed through NEXT_PUBLIC_* env vars.
export async function resolveLoginIdentifier(identifier: string): Promise<ResolveLoginIdentifierResult> {
  const trimmedIdentifier = identifier.trim();

  if (!trimmedIdentifier) {
    return buildFailure("", "Informe seu e-mail ou usuario.");
  }

  const adminSupabase = createAdminSupabaseClient();
  if (!adminSupabase) {
    return buildFailure(
      trimmedIdentifier,
      "O login nao esta disponivel agora. Confira a configuracao do servidor e tente novamente.",
    );
  }

  const normalizedIdentifier = trimmedIdentifier.toLowerCase();

  if (normalizedIdentifier.includes("@")) {
    const parsedEmail = emailSchema.safeParse(normalizedIdentifier);

    if (!parsedEmail.success) {
      return buildFailure(trimmedIdentifier, parsedEmail.error.issues[0]?.message ?? "Informe um e-mail valido.");
    }

    const { data, error } = await adminSupabase
      .from("profiles")
      .select("email")
      .ilike("email", parsedEmail.data)
      .limit(1)
      .maybeSingle();

    if (error) {
      return buildFailure(trimmedIdentifier, mapProfilesLookupError(error.message));
    }

    if (!data?.email) {
      return buildFailure(trimmedIdentifier, "Nao encontramos esse e-mail ou usuario.");
    }

    return {
      success: true,
      resolvedEmail: data.email,
      displayIdentifier: data.email,
      errorMessage: null,
    };
  }

  const { data, error } = await adminSupabase
    .from("profiles")
    .select("email, username")
    .ilike("username", normalizedIdentifier)
    .limit(1)
    .maybeSingle();

  if (error) {
    return buildFailure(trimmedIdentifier, mapProfilesLookupError(error.message));
  }

  if (!data?.email) {
    return buildFailure(trimmedIdentifier, "Nao encontramos esse e-mail ou usuario.");
  }

  return {
    success: true,
    resolvedEmail: data.email,
    displayIdentifier: data.username ?? normalizedIdentifier,
    errorMessage: null,
  };
}

function buildFailure(displayIdentifier: string, errorMessage: string): ResolveLoginIdentifierResult {
  return {
    success: false,
    resolvedEmail: null,
    displayIdentifier,
    errorMessage,
  };
}

function mapProfilesLookupError(message: string) {
  const normalizedMessage = message.toLowerCase();

  if (normalizedMessage.includes("could not find the table")) {
    return "O login nao esta disponivel agora. Atualize as migrations do projeto e tente novamente.";
  }

  return "O login nao esta disponivel agora. Tente novamente em instantes.";
}
