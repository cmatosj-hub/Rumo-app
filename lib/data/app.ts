import type { User } from "@supabase/supabase-js";

import type { AuthenticatedSessionContext } from "@/lib/auth/server";
import { requireAuthenticatedSession } from "@/lib/auth/server";
import { computeWeeklyTarget } from "@/lib/rumo-engine";
import type { AccountPageData, DashboardData, ProfileRecord, SettingsRecord, Transaction, Wallet } from "@/lib/types";

const defaultSettings: SettingsRecord = {
  metaDiaria: 350,
  diasTrabalhoSemana: 6,
  porcentagemOperacional: 30,
  porcentagemEmergencia: 20,
  porcentagemPessoal: 50,
};

export async function getCurrentProfile() {
  const { supabase, user } = await requireAuthenticatedSession();
  return loadCurrentProfile({
    supabase,
    user,
  });
}

export async function getDashboardData(): Promise<DashboardData> {
  const { supabase, user } = await requireAuthenticatedSession();
  const current = await loadCurrentProfile({
    supabase,
    user,
  });

  const [{ data: wallets }, { data: transactions }, { data: creditors }] = await Promise.all([
    supabase
      .from("wallets")
      .select("id, nome, tipo, saldo_atual")
      .eq("user_id", current.userId)
      .order("tipo", { ascending: true })
      .order("nome", { ascending: true }),
    supabase
      .from("transactions")
      .select(
        "id, data, valor, tipo, app, forma_pagamento, categoria, descricao, split_operacional, split_emergencia, split_pessoal, wallet_id",
      )
      .eq("user_id", current.userId)
      .order("data", { ascending: false })
      .limit(30),
    supabase
      .from("creditors")
      .select("valor_mensal")
      .eq("user_id", current.userId)
      .eq("status", "ativo"),
  ]);

  return buildDashboardPayload({
    profile: current.profile,
    settings: current.settings,
    wallets:
      wallets?.map((wallet) => ({
        id: wallet.id,
        nome: wallet.nome,
        tipo: wallet.tipo,
        saldoAtual: Number(wallet.saldo_atual),
      })) ?? [],
    transactions:
      transactions?.map((transaction) => ({
        id: transaction.id,
        data: transaction.data,
        valor: Number(transaction.valor),
        tipo: transaction.tipo,
        app: transaction.app,
        formaPagamento: transaction.forma_pagamento,
        categoria: transaction.categoria,
        descricao: transaction.descricao,
        splitOperacional: Number(transaction.split_operacional),
        splitEmergencia: Number(transaction.split_emergencia),
        splitPessoal: Number(transaction.split_pessoal),
        walletId: transaction.wallet_id,
      })) ?? [],
    creditorsMonthlyFixedCost: creditors?.reduce((sum, item) => sum + Number(item.valor_mensal), 0) ?? 0,
  });
}

export async function getAccountPageData(): Promise<AccountPageData> {
  const { supabase, user } = await requireAuthenticatedSession();
  const current = await loadCurrentProfile({
    supabase,
    user,
  });

  return {
    profile: current.profile,
  };
}

async function loadCurrentProfile({
  supabase,
  user,
}: {
  supabase: AuthenticatedSessionContext["supabase"];
  user: User;
}) {
  const [{ data: profile }, { data: settings }] = await Promise.all([
    supabase.from("profiles").select("id, email, full_name, username, avatar_url").eq("id", user.id).maybeSingle(),
    supabase
      .from("settings")
      .select("meta_diaria, dias_trabalho_semana, porcentagem_operacional, porcentagem_emergencia, porcentagem_pessoal")
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);

  return {
    userId: user.id,
    profile: {
      id: user.id,
      email: profile?.email ?? user.email ?? "",
      fullName: profile?.full_name ?? "",
      username: profile?.username ?? buildFallbackUsername(user.email ?? ""),
      avatarUrl: profile?.avatar_url ?? "",
    },
    settings: settings
      ? {
          metaDiaria: Number(settings.meta_diaria),
          diasTrabalhoSemana: settings.dias_trabalho_semana,
          porcentagemOperacional: Number(settings.porcentagem_operacional),
          porcentagemEmergencia: Number(settings.porcentagem_emergencia),
          porcentagemPessoal: Number(settings.porcentagem_pessoal),
        }
      : defaultSettings,
  };
}

function buildDashboardPayload({
  profile,
  settings,
  wallets,
  transactions,
  creditorsMonthlyFixedCost,
}: {
  profile: ProfileRecord;
  settings: SettingsRecord;
  wallets: Wallet[];
  transactions: Transaction[];
  creditorsMonthlyFixedCost: number;
}): DashboardData {
  const ganhos = transactions.filter((transaction) => transaction.tipo === "ganho");
  const gastos = transactions.filter((transaction) => transaction.tipo === "gasto");
  const dinheiroEmMaos =
    ganhos
      .filter((transaction) => transaction.formaPagamento === "dinheiro")
      .reduce((sum, transaction) => sum + transaction.valor, 0) -
    gastos
      .filter((transaction) => transaction.formaPagamento === "dinheiro")
      .reduce((sum, transaction) => sum + transaction.valor, 0);
  const saldoDigital =
    ganhos
      .filter((transaction) => transaction.formaPagamento === "digital")
      .reduce((sum, transaction) => sum + transaction.valor, 0) -
    gastos
      .filter((transaction) => transaction.formaPagamento === "digital")
      .reduce((sum, transaction) => sum + transaction.valor, 0);

  return {
    profile,
    settings,
    wallets,
    transactions,
    summary: {
      ganhoBruto: ganhos.reduce((sum, transaction) => sum + transaction.valor, 0),
      gastos: gastos.reduce((sum, transaction) => sum + transaction.valor, 0),
      ganhoLiquidoReal:
        ganhos.reduce((sum, transaction) => sum + transaction.valor, 0) -
        gastos.reduce((sum, transaction) => sum + transaction.valor, 0),
      totalOperacional: ganhos.reduce((sum, transaction) => sum + transaction.splitOperacional, 0),
      totalEmergencia: ganhos.reduce((sum, transaction) => sum + transaction.splitEmergencia, 0),
      totalPessoal: ganhos.reduce((sum, transaction) => sum + transaction.splitPessoal, 0),
      dailyBreakEven: creditorsMonthlyFixedCost / 30,
      dinheiroEmMaos,
      saldoDigital,
      metaSemanal: computeWeeklyTarget(settings.metaDiaria, settings.diasTrabalhoSemana),
    },
  };
}

function buildFallbackUsername(email: string) {
  return email.split("@")[0]?.replace(/[^a-zA-Z0-9_]/g, "_").toLowerCase() || "rumo_user";
}
