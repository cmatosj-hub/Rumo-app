import Link from "next/link";
import { redirect } from "next/navigation";
import { ArrowRight, UserPlus } from "lucide-react";

import { RegisterForm } from "@/components/auth/register-form";
import { hasSupabaseEnv } from "@/lib/supabase/env";
import { createServerSupabaseClient } from "@/lib/supabase/server";

export default async function RegisterPage() {
  const envReady = hasSupabaseEnv();
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
    <main className="mx-auto min-h-screen max-w-6xl px-6 py-10">
      <header className="mb-8 flex items-center justify-between">
        <Link href="/" className="accent-emerald text-sm uppercase tracking-[0.24em]">
          Sistema RUMO
        </Link>
        <nav className="flex items-center gap-3">
          <Link
            href="/login"
            className="theme-border surface-soft surface-hover rounded-2xl border px-4 py-3 text-sm font-medium text-[var(--color-foreground)] transition"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="theme-border rounded-2xl border bg-[var(--surface-hover)] px-4 py-3 text-sm font-medium text-[var(--color-foreground)]"
          >
            Registrar
          </Link>
        </nav>
      </header>

      <div className="grid w-full items-center gap-8 lg:grid-cols-[1.1fr_0.9fr]">
        <section className="glass-panel theme-border rounded-[2rem] border p-8 shadow-2xl shadow-black/30 lg:p-12">
          <div className="accent-sky-surface mb-8 inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm">
            <UserPlus className="h-4 w-4" />
            Cadastro com usuario, e-mail e senha
          </div>
          <h1 className="max-w-2xl text-4xl font-semibold tracking-tight text-[var(--color-foreground)] lg:text-6xl">
            Comece a usar o RUMO e monte sua operacao financeira com base real.
          </h1>
          <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--color-muted-foreground)]">
            Ao criar a conta, sua estrutura inicial de perfil e configuracoes ja fica pronta para receber metas,
            credores e split automatico.
          </p>
          <div className="mt-10 grid gap-4 sm:grid-cols-3">
            {[
              "Crie seu usuario e use senha nos proximos acessos",
              "Base pronta para transacoes, carteiras e provisoes",
              "Perfil inicial criado junto com a conta",
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
              <p className="accent-sky text-sm uppercase tracking-[0.24em]">Novo acesso</p>
              <h2 className="mt-2 text-2xl font-semibold text-[var(--color-foreground)]">Criar conta</h2>
            </div>
            <ArrowRight className="accent-sky h-6 w-6" />
          </div>
          <RegisterForm envReady={envReady} />
        </section>
      </div>
    </main>
  );
}
