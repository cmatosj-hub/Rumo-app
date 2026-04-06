import { computeWeeklyTarget } from "@/lib/rumo-engine";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type {
  AccountPageData,
  DashboardData,
  ProfileRecord,
  SettingsRecord,
  Transaction,
  Wallet,
} from "@/lib/types";

const demoProfile: ProfileRecord = {
  id: "demo-user",
  email: "demo@rumo.app",
  fullName: "Motorista Demo",
  username: "rumo_demo",
  avatarUrl: "",
};

const demoSettings: SettingsRecord = {
  metaDiaria: 350,
  diasTrabalhoSemana: 6,
  porcentagemOperacional: 30,
  porcentagemEmergencia: 20,
  porcentagemPessoal: 50,
};

const demoWallets: Wallet[] = [
  { id: "wallet-1", nome: "Dinheiro em mãos", tipo: "fisica", saldoAtual: 420 },
  { id: "wallet-2", nome: "Saldo digital", tipo: "digital", saldoAtual: 1180 },
];

const demoTransactions: Transaction[] = [
  {
    id: "tx-1",
    data: new Date().toISOString(),
    valor: 320,
    tipo: "ganho",
    app: "Uber",
    formaPagamento: "digital",
    categoria: "Corridas",
    descricao: "Turno da manhã",
    splitOperacional: 96,
    splitEmergencia: 64,
    splitPessoal: 160,
    walletId: "wallet-2",
  },
  {
    id: "tx-2",
    data: new Date().toISOString(),
    valor: 70,
    tipo: "gasto",
    app: "Outro",
    formaPagamento: "dinheiro",
    categoria: "Combustível",
    descricao: "Abastecimento",
    splitOperacional: 0,
    splitEmergencia: 0,
    splitPessoal: 0,
    walletId: "wallet-1",
  },
  {
    id: "tx-3",
    data: new Date().toISOString(),
    valor: 30,
    tipo: "gasto",
    app: "Outro",
    formaPagamento: "dinheiro",
    categoria: "Lanche",
    descricao: "Pausa da noite",
    splitOperacional: 0,
    splitEmergencia: 0,
    splitPessoal: 0,
    walletId: "wallet-1",
  },
];

export async function getCurrentProfile() {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return {
      authRequired: false,
      isDemoMode: true,
      profile: demoProfile,
      userId: null,
      settings: demoSettings,
    };
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return {
      authRequired: true,
      isDemoMode: false,
      profile: null,
      userId: null,
      settings: demoSettings,
    };
  }

  const [{ data: profile }, { data: settings }] = await Promise.all([
    supabase.from("profiles").select("id, email, full_name, username, avatar_url").eq("id", user.id).maybeSingle(),
    supabase
      .from("settings")
      .select("meta_diaria, dias_trabalho_semana, porcentagem_operacional, porcentagem_emergencia, porcentagem_pessoal")
      .eq("user_id", user.id)
      .maybeSingle(),
  ]);

  return {
    authRequired: false,
    isDemoMode: false,
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
      : demoSettings,
  };
}

export async function getDashboardData(): Promise<DashboardData> {
  const current = await getCurrentProfile();

  if (current.authRequired || current.isDemoMode || !current.userId) {
    return buildDashboardPayload({
      authRequired: current.authRequired,
      isDemoMode: current.isDemoMode,
      profile: current.profile ?? demoProfile,
      settings: current.settings,
      wallets: demoWallets,
      transactions: demoTransactions,
      creditorsMonthlyFixedCost: 2189.9,
    });
  }

  const supabase = await createServerSupabaseClient();
  if (!supabase) {
    return buildDashboardPayload({
      authRequired: false,
      isDemoMode: true,
      profile: demoProfile,
      settings: demoSettings,
      wallets: demoWallets,
      transactions: demoTransactions,
      creditorsMonthlyFixedCost: 2189.9,
    });
  }

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
    authRequired: false,
    isDemoMode: false,
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
  const current = await getCurrentProfile();

  return {
    authRequired: current.authRequired,
    isDemoMode: current.isDemoMode,
    profile: current.profile ?? demoProfile,
  };
}

function buildDashboardPayload({
  authRequired,
  isDemoMode,
  profile,
  settings,
  wallets,
  transactions,
  creditorsMonthlyFixedCost,
}: {
  authRequired: boolean;
  isDemoMode: boolean;
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
    authRequired,
    isDemoMode,
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
