import { ResetPasswordForm } from "@/components/auth/reset-password-form";
import { hasSupabaseEnv } from "@/lib/supabase/env";

export default function ResetPasswordPage() {
  const envReady = hasSupabaseEnv();

  return (
    <main className="mx-auto flex min-h-screen max-w-6xl items-center justify-center px-6 py-6 lg:py-10">
      <section className="auth-login-card theme-border relative w-full max-w-[30rem] overflow-hidden rounded-[2rem] border p-7 shadow-2xl shadow-black/40 sm:p-10">
        <div className="pointer-events-none absolute inset-x-8 top-0 h-24 rounded-full bg-emerald-300/10 blur-3xl" />
        <div className="relative">
          <ResetPasswordForm envReady={envReady} />
        </div>
      </section>
    </main>
  );
}
