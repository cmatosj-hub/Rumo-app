import { computeWeeklyTarget } from "@/lib/rumo-engine";
import { createServerSupabaseClient } from "@/lib/supabase/server";
import type { Creditor, SettingsPageData } from "@/lib/types";

const demoSettings = {
  metaDiaria: 350,
  diasTrabalhoSemana: 6,
  porcentagemOperacional: 30,
  porcentagemEmergencia: 20,
  porcentagemPessoal: 50,
};

const demoCreditors: Creditor[] = [
  {
    id: "demo-1",
    nome: "Aluguel do carro",
    valorMensal: 2100,
    diaVencimento: 5,
    status: "ativo",
  },
  {
    id: "demo-2",
    nome: "Plano de internet",
    valorMensal: 89.9,
    diaVencimento: 12,
    status: "ativo",
  },
];

export async function getSettingsPageData(): Promise<SettingsPageData> {
  const supabase = await createServerSupabaseClient();

  if (!supabase) {
    return buildPayload({
      settings: demoSettings,
      creditors: demoCreditors,
      authRequired: false,
      isDemoMode: true,
    });
  }

  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    return buildPayload({
      settings: demoSettings,
      creditors: [],
      authRequired: true,
      isDemoMode: false,
    });
  }

  const [{ data: settings }, { data: creditors }] = await Promise.all([
    supabase
      .from("settings")
      .select(
        "meta_diaria, dias_trabalho_semana, porcentagem_operacional, porcentagem_emergencia, porcentagem_pessoal",
      )
      .eq("user_id", user.id)
      .maybeSingle(),
    supabase
      .from("creditors")
      .select("id, nome, valor_mensal, dia_vencimento, status")
      .eq("user_id", user.id)
      .order("status", { ascending: true })
      .order("dia_vencimento", { ascending: true }),
  ]);

  return buildPayload({
    settings: settings
      ? {
          metaDiaria: Number(settings.meta_diaria),
          diasTrabalhoSemana: settings.dias_trabalho_semana,
          porcentagemOperacional: Number(settings.porcentagem_operacional),
          porcentagemEmergencia: Number(settings.porcentagem_emergencia),
          porcentagemPessoal: Number(settings.porcentagem_pessoal),
        }
      : demoSettings,
    creditors:
      creditors?.map((creditor) => ({
        id: creditor.id,
        nome: creditor.nome,
        valorMensal: Number(creditor.valor_mensal),
        diaVencimento: creditor.dia_vencimento,
        status: creditor.status as Creditor["status"],
      })) ?? [],
    authRequired: false,
    isDemoMode: false,
  });
}

function buildPayload({
  settings,
  creditors,
  authRequired,
  isDemoMode,
}: {
  settings: SettingsPageData["settings"];
  creditors: Creditor[];
  authRequired: boolean;
  isDemoMode: boolean;
}): SettingsPageData {
  const activeCreditors = creditors.filter((creditor) => creditor.status === "ativo");
  const monthlyFixedCost = activeCreditors.reduce((total, creditor) => total + creditor.valorMensal, 0);

  return {
    settings,
    creditors,
    summary: {
      monthlyFixedCost,
      activeCreditors: activeCreditors.length,
      dailyBreakEven: monthlyFixedCost / 30,
      weeklyTarget: computeWeeklyTarget(settings.metaDiaria, settings.diasTrabalhoSemana),
    },
    authRequired,
    isDemoMode,
  };
}
