import type { AuthenticatedSessionContext } from "@/lib/auth/server";
import { getAuthenticatedSessionContext, requireAuthenticatedSession } from "@/lib/auth/server";
import { computeWeeklyTarget } from "@/lib/rumo-engine";
import type { Creditor, SettingsPageData } from "@/lib/types";

const defaultSettings = {
  metaDiaria: 350,
  diasTrabalhoSemana: 6,
  porcentagemOperacional: 30,
  porcentagemEmergencia: 20,
  porcentagemPessoal: 50,
};

export async function getSettingsPageData(): Promise<SettingsPageData> {
  const context = await requireAuthenticatedSession();
  return buildSettingsPageData(context);
}

export async function getSettingsPageDataIfAuthenticated(): Promise<SettingsPageData | null> {
  const context = await getAuthenticatedSessionContext();

  if (!context) {
    return null;
  }

  return buildSettingsPageData(context);
}

async function buildSettingsPageData({
  supabase,
  user,
}: AuthenticatedSessionContext): Promise<SettingsPageData> {
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
      : defaultSettings,
    creditors:
      creditors?.map((creditor) => ({
        id: creditor.id,
        nome: creditor.nome,
        valorMensal: Number(creditor.valor_mensal),
        diaVencimento: creditor.dia_vencimento,
        status: creditor.status as Creditor["status"],
      })) ?? [],
  });
}

function buildPayload({
  settings,
  creditors,
}: {
  settings: SettingsPageData["settings"];
  creditors: Creditor[];
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
  };
}
