import { redirect } from "next/navigation";

import { LoginForm } from "@/components/auth/login-form";
import { hasSupabaseAdminEnv, hasSupabaseEnv } from "@/lib/supabase/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function LoginPage() {
  const envReady = hasSupabaseEnv() && hasSupabaseAdminEnv();
  const supabase = await createServerSupabaseClient();

  if (supabase) {
    const {
      data: { user },
    } = await supabase.auth.getUser();

    if (user) {
      redirect("/dashboard");
    }
  }

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-6 py-6 lg:py-10">
      <section className="auth-login-card theme-border relative w-full max-w-[30rem] overflow-hidden rounded-[2rem] border p-7 shadow-2xl shadow-black/40 sm:p-10">
        <div className="pointer-events-none absolute inset-x-8 top-0 h-24 rounded-full bg-emerald-300/10 blur-3xl" />
        <div className="relative">
          <LoginForm envReady={envReady} />
        </div>
      </section>
    </main>
  );
}
