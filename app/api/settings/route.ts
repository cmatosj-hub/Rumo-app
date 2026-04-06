import { NextResponse } from "next/server";

import { getSettingsPageData } from "@/lib/data/settings";

export async function GET() {
  const data = await getSettingsPageData();
  return NextResponse.json(data);
}
