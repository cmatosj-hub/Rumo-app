export type Creditor = {
  id: string;
  nome: string;
  valorMensal: number;
  diaVencimento: number;
  status: "ativo" | "pago";
};

export type Wallet = {
  id: string;
  nome: string;
  tipo: "fisica" | "digital";
  saldoAtual: number;
};

export type Transaction = {
  id: string;
  data: string;
  valor: number;
  tipo: "ganho" | "gasto";
  app: "Uber" | "99" | "Particular" | "Outro";
  formaPagamento: "dinheiro" | "digital";
  categoria: string;
  descricao: string | null;
  splitOperacional: number;
  splitEmergencia: number;
  splitPessoal: number;
  walletId: string | null;
};

export type ProfileRecord = {
  id: string;
  email: string;
  fullName: string;
  username: string;
  avatarUrl: string;
};

export type SettingsRecord = {
  metaDiaria: number;
  diasTrabalhoSemana: number;
  porcentagemOperacional: number;
  porcentagemEmergencia: number;
  porcentagemPessoal: number;
};

export type SettingsPageData = {
  settings: SettingsRecord;
  creditors: Creditor[];
  summary: {
    monthlyFixedCost: number;
    activeCreditors: number;
    dailyBreakEven: number;
    weeklyTarget: number;
  };
};

export type DashboardData = {
  profile: ProfileRecord;
  settings: SettingsRecord;
  wallets: Wallet[];
  transactions: Transaction[];
  summary: {
    ganhoBruto: number;
    gastos: number;
    ganhoLiquidoReal: number;
    totalOperacional: number;
    totalEmergencia: number;
    totalPessoal: number;
    dailyBreakEven: number;
    dinheiroEmMaos: number;
    saldoDigital: number;
    metaSemanal: number;
  };
};

export type AccountPageData = {
  profile: ProfileRecord;
};
