"use client";

import { startTransition, useContext, useEffect, useState, type ReactNode } from "react";
import { usePathname, useRouter } from "next/navigation";
import { createContext } from "react";

import { LOGIN_REDIRECT_PATH } from "@/lib/auth/constants";
import { createBrowserSupabaseClient } from "@/lib/supabase/browser";

type AuthSessionContextValue = {
  hasSession: boolean;
  isLoading: boolean;
  supabase: ReturnType<typeof createBrowserSupabaseClient>;
};

const AuthSessionContext = createContext<AuthSessionContextValue>({
  hasSession: false,
  isLoading: true,
  supabase: null,
});

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

function isAuthEntryRoute(pathname: string) {
  return pathname === "/login" || pathname === "/register";
}

export function AuthSessionProvider({ children }: { children: ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const [supabase] = useState(() => createBrowserSupabaseClient());
  const [isLoading, setIsLoading] = useState(Boolean(supabase));
  const [hasSession, setHasSession] = useState(false);

  useEffect(() => {
    if (!supabase) {
      return;
    }

    let isActive = true;

    const syncInitialSession = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!isActive) {
        return;
      }

      setHasSession(Boolean(session));
      setIsLoading(false);

      if (session && isAuthEntryRoute(pathname)) {
        router.replace(LOGIN_REDIRECT_PATH);
        return;
      }

      if (!session && isProtectedRoute(pathname)) {
        router.replace("/login?reason=auth");
      }
    };

    void syncInitialSession();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      if (!isActive) {
        return;
      }

      setHasSession(Boolean(session));
      setIsLoading(false);

      if (event === "SIGNED_IN") {
        if (isAuthEntryRoute(pathname)) {
          router.replace(LOGIN_REDIRECT_PATH);
          return;
        }

        startTransition(() => router.refresh());
        return;
      }

      if (event === "SIGNED_OUT") {
        if (isProtectedRoute(pathname)) {
          router.replace("/login?reason=expired");
          return;
        }

        startTransition(() => router.refresh());
        return;
      }

      if (event === "TOKEN_REFRESHED" || event === "USER_UPDATED" || event === "PASSWORD_RECOVERY") {
        startTransition(() => router.refresh());
      }
    });

    return () => {
      isActive = false;
      subscription.unsubscribe();
    };
  }, [pathname, router, supabase]);

  return (
    <AuthSessionContext.Provider
      value={{
        hasSession,
        isLoading,
        supabase,
      }}
    >
      {children}
    </AuthSessionContext.Provider>
  );
}

export function useAuthSession() {
  return useContext(AuthSessionContext);
}
