import Link from "next/link";
import { ArrowRight, ShieldCheck } from "lucide-react";

import { LoginForm } from "@/components/auth/login-form";
import { hasSupabaseEnv } from "@/lib/supabase/env";

export default function LoginPage() {
  const envReady = hasSupabaseEnv();

  return (
    <main className="mx-auto min-h-screen max-w-6xl px-6 py-10">
      <header className="mb-8 flex items-center justify-between">
        <Link href="/" className="accent-emerald text-sm uppercase tracking-[0.24em]">
          Sistema RUMO
        </Link>
        <nav className="flex items-center gap-3">
          <Link
            href="/login"
            className="theme-border rounded-2xl border bg-[var(--surface-hover)] px-4 py-3 text-sm font-medium text-[var(--color-foreground)]"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="theme-border surface-soft surface-hover rounded-2xl border px-4 py-3 text-sm font-medium text-[var(--color-foreground)] transition"
          >
            Registrar
          </Link>
        </nav>
      </header>

      <div className="grid w-full items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="glass-panel theme-border rounded-[2rem] border p-8 shadow-2xl shadow-black/30 lg:p-12">
          <div className="accent-emerald-surface mb-8 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm">
            <ShieldCheck className="h-4 w-4" />
            ERP financeiro para quem roda todo dia
          </div>
          <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-[var(--color-foreground)] lg:text-6xl">
            Sistema RUMO com metas, custos fixos e inteligencia de caixa.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--color-muted-foreground)]">
            Entre direto com e-mail ou usuario e senha, sem depender de link temporario no e-mail.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              "Meta diaria com split operacional, emergencia e pessoal",
              "Custos fixos por credor para calculo de break-even diario",
              "Autenticacao com senha integrada ao fluxo do painel",
            ].map((item) => (
              <div
                key={item}
                className="theme-border surface-soft rounded-3xl border p-4 text-sm leading-6 text-[var(--color-muted-foreground)]"
              >
                {item}
              </div>
            ))}
          </div>
        </section>

        <section className="glass-panel theme-border rounded-[2rem] border p-8 shadow-2xl shadow-black/30 lg:p-10">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <p className="accent-emerald text-sm uppercase tracking-[0.24em]">Acesso seguro</p>
              <h2 className="mt-2 text-2xl font-semibold text-[var(--color-foreground)]">Entrar no RUMO</h2>
            </div>
            <ArrowRight className="accent-emerald h-6 w-6" />
          </div>
          <LoginForm envReady={envReady} />
        </section>
      </div>
    </main>
  );
}
