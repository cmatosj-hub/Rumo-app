import Link from "next/link";
import { ArrowRight, CreditCard, ShieldCheck, TrendingUp, WalletCards } from "lucide-react";

export default function HomePage() {
  return (
    <main className="min-h-screen">
      <header className="mx-auto flex max-w-7xl items-center justify-between px-6 py-6">
        <div>
          <p className="accent-emerald text-sm uppercase tracking-[0.24em]">Sistema RUMO</p>
          <h1 className="mt-2 text-2xl font-semibold text-[var(--color-foreground)]">ERP do motorista</h1>
        </div>

        <nav className="flex items-center gap-3">
          <Link
            href="/login"
            className="theme-border surface-soft surface-hover rounded-2xl border px-4 py-3 text-sm font-medium text-[var(--color-foreground)] transition"
          >
            Login
          </Link>
          <Link
            href="/register"
            className="rounded-2xl bg-emerald-300 px-4 py-3 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-200"
          >
            Registrar
          </Link>
        </nav>
      </header>

      <section className="mx-auto grid max-w-7xl gap-8 px-6 pb-12 pt-8 lg:grid-cols-[1.05fr_0.95fr] lg:items-center lg:pb-20 lg:pt-16">
        <div className="glass-panel theme-border rounded-[2rem] border p-8 shadow-2xl shadow-black/30 lg:p-12">
          <div className="accent-emerald-surface inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm">
            <ShieldCheck className="h-4 w-4" />
            Controle completo da operação diária
          </div>

          <h2 className="mt-8 max-w-3xl text-4xl font-semibold tracking-tight text-[var(--color-foreground)] lg:text-6xl">
            Organize ganhos, custos fixos e metas em um painel feito para app driver.
          </h2>

          <p className="mt-6 max-w-2xl text-lg leading-8 text-[var(--color-muted-foreground)]">
            O RUMO transforma a correria do dia em decisões claras: quanto entrou, quanto já pertence aos credores,
            quanto vai para emergência e quanto realmente sobra como ganho pessoal.
          </p>

          <div className="mt-8 flex flex-wrap gap-3">
            <Link
              href="/register"
              className="inline-flex items-center gap-2 rounded-2xl bg-emerald-300 px-5 py-3 text-sm font-semibold text-emerald-950 transition hover:bg-emerald-200"
            >
              Criar conta
              <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/login"
              className="theme-border surface-soft surface-hover rounded-2xl border px-5 py-3 text-sm font-medium text-[var(--color-foreground)] transition"
            >
              Já tenho conta
            </Link>
          </div>
        </div>

        <div className="grid gap-4">
          {[
            {
              icon: TrendingUp,
              title: "Metas vivas",
              description: "Acompanhe meta diária, semanal e projeção de desempenho com base na sua rotina real.",
            },
            {
              icon: CreditCard,
              title: "Custos fixos sob controle",
              description: "Cadastre credores e veja o break-even diário antes de contar lucro como dinheiro livre.",
            },
            {
              icon: WalletCards,
              title: "Caixa separado",
              description: "Prepare o terreno para dividir automaticamente ganhos entre operacional, emergência e pessoal.",
            },
          ].map((item) => {
            const Icon = item.icon;

            return (
              <article
                key={item.title}
                className="glass-panel theme-border rounded-[1.75rem] border p-6 shadow-xl shadow-black/20"
              >
                <div className="flex items-start gap-4">
                  <div className="accent-emerald-surface rounded-2xl border p-3">
                    <Icon className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-xl font-semibold text-[var(--color-foreground)]">{item.title}</h3>
                    <p className="mt-2 text-sm leading-6 text-[var(--color-muted-foreground)]">{item.description}</p>
                  </div>
                </div>
              </article>
            );
          })}
        </div>
      </section>
    </main>
  );
}
