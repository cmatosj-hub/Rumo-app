import { NextResponse } from "next/server";

import { getSettingsPageDataIfAuthenticated } from "@/lib/data/settings";

export async function GET() {
  const data = await getSettingsPageDataIfAuthenticated();

  if (!data) {
    return NextResponse.json(
      { message: "Nao foi possivel validar sua sessao. Faca login novamente." },
      { status: 401 },
    );
  }

  return NextResponse.json(data);
}
