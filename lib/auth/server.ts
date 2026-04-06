import "server-only";

import type { User } from "@supabase/supabase-js";
import { redirect } from "next/navigation";

import { createServerSupabaseClient } from "@/lib/supabase/server";

type ServerSupabaseClient = NonNullable<Awaited<ReturnType<typeof createServerSupabaseClient>>>;

export type AuthenticatedSessionContext = {
  supabase: ServerSupabaseClient;
  user: User;
};

export async function getAuthenticatedSessionContext(): Promise<AuthenticatedSessionContext | null> {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return null;
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return null;
  }

  return { supabase, user };
}

export async function requireAuthenticatedSession(): Promise<AuthenticatedSessionContext> {
  const context = await getAuthenticatedSessionContext();

  if (!context) {
    redirect("/login?reason=auth");
  }

  return context;
}
