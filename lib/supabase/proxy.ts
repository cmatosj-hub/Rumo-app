import { createServerClient } from "@supabase/ssr";
import { NextResponse, type NextRequest } from "next/server";

import { LOGIN_REDIRECT_PATH } from "@/lib/auth/constants";
import { getSupabaseEnv } from "@/lib/supabase/env";

const AUTH_ENTRY_ROUTES = new Set(["/login", "/register"]);
const PROTECTED_ROUTES = [
  "/dashboard",
  "/transactions",
  "/carro",
  "/contas",
  "/relatorios",
  "/settings",
  "/wallets",
  "/account",
  "/fechamentos",
];

function isProtectedRoute(pathname: string) {
  return PROTECTED_ROUTES.some((route) => pathname === route || pathname.startsWith(`${route}/`));
}

export async function updateSession(request: NextRequest) {
  const env = getSupabaseEnv();

  if (!env) {
    return NextResponse.next({ request });
  }

  let supabaseResponse = NextResponse.next({ request });

  const supabase = createServerClient(env.url, env.anonKey, {
    cookies: {
      getAll() {
        return request.cookies.getAll();
      },
      setAll(cookiesToSet) {
        cookiesToSet.forEach(({ name, value }) => request.cookies.set(name, value));

        supabaseResponse = NextResponse.next({ request });

        cookiesToSet.forEach(({ name, value, options }) => {
          supabaseResponse.cookies.set(name, value, options);
        });
      },
    },
  });

  // Keep this auth call immediately after client creation so the SSR session
  // stays refreshed and predictable across page loads.
  const {
    data: { claims },
  } = await supabase.auth.getClaims();

  if (claims && AUTH_ENTRY_ROUTES.has(request.nextUrl.pathname)) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = LOGIN_REDIRECT_PATH;
    redirectUrl.search = "";

    return NextResponse.redirect(redirectUrl);
  }

  if (!claims && isProtectedRoute(request.nextUrl.pathname)) {
    const redirectUrl = request.nextUrl.clone();
    redirectUrl.pathname = "/login";
    redirectUrl.search = "?reason=auth";

    return NextResponse.redirect(redirectUrl);
  }

  return supabaseResponse;
}
