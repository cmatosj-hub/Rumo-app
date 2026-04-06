import { NextResponse } from "next/server";

import { resolveLoginIdentifier } from "@/lib/auth/resolve-login-identifier";

export const runtime = "nodejs";

export async function POST(request: Request) {
  try {
    const body = (await request.json()) as { identifier?: unknown };
    const identifier = typeof body.identifier === "string" ? body.identifier : "";

    const result = await resolveLoginIdentifier(identifier);
    return NextResponse.json(result);
  } catch {
    return NextResponse.json(
      {
        success: false,
        resolvedEmail: null,
        displayIdentifier: "",
        errorMessage: "O login nao esta disponivel agora. Tente novamente em instantes.",
      },
      { status: 500 },
    );
  }
}
