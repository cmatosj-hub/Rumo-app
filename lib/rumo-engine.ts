export function computeWeeklyTarget(metaDiaria: number, diasTrabalhoSemana: number) {
  return metaDiaria * diasTrabalhoSemana;
}

export function computeProjectedTarget(metaSemanal: number, diasTrabalhoSemana: number, date = new Date()) {
  const jsDay = date.getDay();
  const currentDay = jsDay === 0 ? 7 : jsDay;
  const elapsedDays = Math.min(currentDay, diasTrabalhoSemana);

  return diasTrabalhoSemana > 0 ? (metaSemanal / diasTrabalhoSemana) * elapsedDays : 0;
}

export function computeWeeklyPerformance(
  ganhosSemana: number,
  metaSemanal: number,
  diasTrabalhoSemana: number,
  date = new Date(),
) {
  const projected = computeProjectedTarget(metaSemanal, diasTrabalhoSemana, date);
  const ratio = projected > 0 ? ganhosSemana / projected : 0;

  if (ratio >= 1) {
    return { projected, ratio, status: "DENTRO_DA_META" as const };
  }

  if (ratio >= 0.85) {
    return { projected, ratio, status: "ABAIXO_DA_MEDIA" as const };
  }

  return { projected, ratio, status: "RITMO_BAIXO" as const };
}

export function computeSuggestedDailyTarget(
  metaSemanal: number,
  totalSemana: number,
  remainingActiveDays: number,
) {
  if (remainingActiveDays <= 0) {
    return 0;
  }

  return Math.max(0, (metaSemanal - totalSemana) / remainingActiveDays);
}
