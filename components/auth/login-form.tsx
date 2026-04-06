"use client";

import { ChevronLeft, Eye, EyeOff, LoaderCircle } from "lucide-react";
import { useRouter, useSearchParams } from "next/navigation";
import { useEffect, useState } from "react";

import { signInWithPasswordAction } from "@/app/login/actions";
import { useAuthSession } from "@/components/providers/auth-session-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { LAST_LOGIN_IDENTIFIER_KEY } from "@/lib/auth/constants";
import { maskEmail } from "@/lib/auth/mask-email";
import { getPasswordRecoveryRedirectUrl } from "@/lib/auth/url";

type LoginStep = "identifier" | "password";

type ResolvedIdentifierState = {
  email: string;
  displayIdentifier: string;
};

type ResolveIdentifierResponse = {
  success: boolean;
  resolvedEmail: string | null;
  displayIdentifier: string;
  errorMessage: string | null;
};

export function LoginForm({ envReady }: { envReady: boolean }) {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { hasSession, isLoading: isCheckingSession, supabase } = useAuthSession();

  const [step, setStep] = useState<LoginStep>("identifier");
  const [identifier, setIdentifier] = useState("");
  const [resolvedIdentifier, setResolvedIdentifier] = useState<ResolvedIdentifierState | null>(null);
  const [rememberAccess, setRememberAccess] = useState(false);
  const [rememberPreferenceReady, setRememberPreferenceReady] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [identifierError, setIdentifierError] = useState<string | null>(null);
  const [passwordError, setPasswordError] = useState<string | null>(null);
  const [confirmationHint, setConfirmationHint] = useState<string | null>(null);
  const [recoveryMessage, setRecoveryMessage] = useState<string | null>(null);
  const [recoveryError, setRecoveryError] = useState<string | null>(null);
  const [isResolvingIdentifier, setIsResolvingIdentifier] = useState(false);
  const [isSigningIn, setIsSigningIn] = useState(false);
  const [isSendingRecovery, setIsSendingRecovery] = useState(false);

  const shouldClearRememberedIdentifier = searchParams.get("clear") === "1";
  const resetSuccess = searchParams.get("reset") === "success";
  const authReason = searchParams.get("reason");

  const sessionFeedbackMessage =
    authReason === "expired"
      ? "Sua sessao expirou. Faca login novamente."
      : authReason === "invalid"
        ? "Nao foi possivel validar sua sessao. Faca login novamente."
        : authReason === "auth"
          ? "Faca login para continuar."
          : null;

  useEffect(() => {
    if (typeof window === "undefined") {
      return;
    }

    if (shouldClearRememberedIdentifier) {
      window.localStorage.removeItem(LAST_LOGIN_IDENTIFIER_KEY);
      setRememberPreferenceReady(true);
      setRememberAccess(false);
      setIdentifier("");
      setResolvedIdentifier(null);
      setPassword("");
      setShowPassword(false);
      setStep("identifier");
      setIdentifierError(null);
      setPasswordError(null);
      setConfirmationHint(null);
      setRecoveryMessage(null);
      setRecoveryError(null);
      router.replace("/login", { scroll: false });
      return;
    }

    const savedIdentifier = window.localStorage.getItem(LAST_LOGIN_IDENTIFIER_KEY);

    if (savedIdentifier) {
      setIdentifier(savedIdentifier);
      setRememberAccess(true);
    }

    setRememberPreferenceReady(true);
  }, [router, shouldClearRememberedIdentifier]);

  useEffect(() => {
    if (typeof window === "undefined" || !rememberPreferenceReady) {
      return;
    }

    if (!rememberAccess) {
      window.localStorage.removeItem(LAST_LOGIN_IDENTIFIER_KEY);
    }
  }, [rememberAccess, rememberPreferenceReady]);

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (step === "identifier") {
      void handleIdentifierContinue();
      return;
    }

    void handlePasswordSubmit();
  }

  if (isCheckingSession || hasSession) {
    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between gap-3">
          <p className="accent-emerald text-xs font-medium uppercase tracking-[0.24em]">Acesso seguro</p>
          <span className="rounded-full border border-white/8 bg-white/4 px-2.5 py-1 text-[11px] font-medium text-[var(--color-muted-foreground)]">
            Verificando
          </span>
        </div>

        <div className="auth-step-enter rounded-[1.5rem] border border-white/8 bg-white/4 p-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-white/8 bg-white/4">
            <LoaderCircle className="h-5 w-5 animate-spin text-[var(--color-muted-foreground)]" />
          </div>
          <h3 className="mt-5 text-2xl font-semibold tracking-tight text-[var(--color-foreground)]">
            Verificando seu acesso
          </h3>
          <p className="mt-2 text-sm leading-6 text-[var(--color-muted-foreground)]">
            Estamos conferindo sua sessao para entrar sem interrupcao.
          </p>
        </div>
      </div>
    );
  }

  return (
    <form className="space-y-7" onSubmit={handleSubmit}>
      {!envReady ? (
        <div className="rounded-[1.35rem] border border-amber-400/20 bg-amber-400/8 p-4 text-sm leading-6 text-[var(--color-foreground)]">
          Preencha `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY` e `SUPABASE_SERVICE_ROLE_KEY`
          no servidor para ativar o login.
        </div>
      ) : null}

      {resetSuccess ? (
        <div className="rounded-[1.35rem] border border-emerald-300/16 bg-emerald-300/8 p-4 text-sm leading-6 text-[var(--color-foreground)]">
          Senha atualizada com sucesso. Faca login novamente.
        </div>
      ) : null}

      {sessionFeedbackMessage ? (
        <div className="rounded-[1.35rem] border border-amber-400/20 bg-amber-400/10 p-4 text-sm leading-6 text-[var(--color-foreground)]">
          {sessionFeedbackMessage}
        </div>
      ) : null}

      <div className="flex items-center justify-between gap-3">
        <p className="accent-emerald text-xs font-medium uppercase tracking-[0.24em]">Acesso seguro</p>
        <span className="rounded-full border border-white/8 bg-white/4 px-2.5 py-1 text-[11px] font-medium text-[var(--color-muted-foreground)]">
          {step === "identifier" ? "1/2" : "2/2"}
        </span>
      </div>

      <div key={step} className="auth-step-enter space-y-7">
        {step === "identifier" ? (
          <>
            <div className="space-y-3">
              <h3 className="text-3xl font-semibold tracking-tight text-[var(--color-foreground)]">Entrar no RUMO</h3>
              <p className="max-w-sm text-sm leading-6 text-[var(--color-muted-foreground)]">
                Use seu e-mail ou usuario para continuar.
              </p>
            </div>

            <div className="space-y-3">
              <Label htmlFor="identifier" className="text-[13px] font-medium normal-case tracking-[0.02em]">
                E-mail ou usuario
              </Label>
              <Input
                id="identifier"
                autoComplete="username"
                autoFocus
                placeholder="Digite seu e-mail ou usuario"
                className="auth-input h-14 rounded-[1.25rem] px-4 text-[15px]"
                value={identifier}
                onChange={(event) => {
                  setIdentifier(event.target.value);
                  setResolvedIdentifier(null);
                  setIdentifierError(null);
                }}
                disabled={isResolvingIdentifier || !envReady}
              />
              {identifierError ? (
                <p className="pt-1 text-[13px] leading-5 text-[var(--color-destructive)]" aria-live="polite">
                  {identifierError}
                </p>
              ) : null}
            </div>

            <Button
              type="submit"
              className="auth-primary-button h-14 w-full rounded-[1.25rem] text-[15px]"
              disabled={isResolvingIdentifier || !identifier.trim() || !envReady}
            >
              {isResolvingIdentifier ? "Continuando..." : "Continuar"}
            </Button>
          </>
        ) : (
          <>
            <div className="space-y-3">
              <h3 className="text-3xl font-semibold tracking-tight text-[var(--color-foreground)]">Digite sua senha</h3>
              <p className="text-sm leading-6 text-[var(--color-muted-foreground)]">
                Entrando como:{" "}
                <span className="font-medium text-[var(--color-foreground)]">
                  {resolvedIdentifier?.displayIdentifier || identifier.trim()}
                </span>
              </p>
            </div>

            {confirmationHint ? (
              <div className="accent-amber-surface rounded-[1.35rem] border p-4 text-sm leading-6" aria-live="polite">
                {confirmationHint}
              </div>
            ) : null}

            <div className="space-y-3">
              <Label htmlFor="password" className="text-[13px] font-medium normal-case tracking-[0.02em]">
                Senha
              </Label>

              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  autoComplete="current-password"
                  autoFocus
                  placeholder="Digite sua senha"
                  className="auth-input h-14 rounded-[1.25rem] px-4 pr-16 text-[15px]"
                  value={password}
                  onChange={(event) => {
                    setPassword(event.target.value);
                    setPasswordError(null);
                    setConfirmationHint(null);
                    setRecoveryError(null);
                  }}
                  disabled={isSigningIn || isSendingRecovery}
                />
                <button
                  type="button"
                  aria-label={showPassword ? "Ocultar senha" : "Mostrar senha"}
                  className="absolute right-2 top-1/2 flex h-10 w-10 -translate-y-1/2 items-center justify-center rounded-full border border-white/6 bg-white/4 text-[var(--color-muted-foreground)] transition hover:text-[var(--color-foreground)]"
                  onClick={() => setShowPassword((current) => !current)}
                >
                  {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
                </button>
              </div>

              {passwordError ? (
                <p className="pt-1 text-[13px] leading-5 text-[var(--color-destructive)]" aria-live="polite">
                  {passwordError}
                </p>
              ) : null}
            </div>

            <div className="flex flex-col gap-3 pt-1 sm:flex-row sm:items-center sm:justify-between">
              <label className="flex items-center gap-3 text-sm text-[var(--color-muted-foreground)]">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border border-white/12 bg-transparent accent-emerald-300"
                  checked={rememberAccess}
                  onChange={(event) => setRememberAccess(event.target.checked)}
                />
                Lembrar meu acesso
              </label>

              <button
                type="button"
                className="text-left text-sm font-medium text-[var(--color-muted-foreground)] transition hover:text-[var(--color-foreground)] sm:text-right"
                onClick={() => void handlePasswordRecovery()}
                disabled={isSendingRecovery || isSigningIn || !resolvedIdentifier?.email || !envReady}
              >
                {isSendingRecovery ? "Enviando..." : "Esqueci minha senha"}
              </button>
            </div>

            {recoveryMessage ? (
              <p className="text-[13px] leading-5 text-[var(--color-muted-foreground)]" aria-live="polite">
                {recoveryMessage}
              </p>
            ) : null}

            {recoveryError ? (
              <p className="text-[13px] leading-5 text-[var(--color-destructive)]" aria-live="polite">
                {recoveryError}
              </p>
            ) : null}

            <div className="space-y-3 pt-1">
              <Button
                type="submit"
                className="auth-primary-button h-14 w-full rounded-[1.25rem] text-[15px]"
                disabled={isSigningIn || isSendingRecovery || !password}
              >
                {isSigningIn ? "Entrando..." : "Entrar"}
              </Button>

              <Button
                type="button"
                variant="ghost"
                className="mx-auto h-auto w-fit rounded-full px-2 py-1.5 text-sm font-medium"
                onClick={handleBack}
                disabled={isSigningIn || isSendingRecovery}
              >
                <ChevronLeft className="mr-1.5 h-4 w-4" />
                Voltar
              </Button>
            </div>
          </>
        )}
      </div>
    </form>
  );

  async function handleIdentifierContinue() {
    const trimmedIdentifier = identifier.trim();

    if (!trimmedIdentifier) {
      setIdentifierError("Informe seu e-mail ou usuario.");
      return;
    }

    setIsResolvingIdentifier(true);
    setIdentifierError(null);
    setPasswordError(null);
    setConfirmationHint(null);
    setRecoveryMessage(null);
    setRecoveryError(null);

    try {
      const response = await fetch("/api/auth/resolve-identifier", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        cache: "no-store",
        body: JSON.stringify({ identifier: trimmedIdentifier }),
      });

      const result = (await response.json().catch(() => null)) as ResolveIdentifierResponse | null;

      if (!result?.success || !result.resolvedEmail) {
        setIdentifierError(result?.errorMessage ?? "Nao encontramos esse e-mail ou usuario.");
        return;
      }

      setIdentifier(trimmedIdentifier);
      setResolvedIdentifier({
        email: result.resolvedEmail,
        displayIdentifier: result.displayIdentifier || trimmedIdentifier,
      });
      setPassword("");
      setShowPassword(false);
      setStep("password");
    } catch {
      setIdentifierError("O login nao esta disponivel agora. Tente novamente em instantes.");
    } finally {
      setIsResolvingIdentifier(false);
    }
  }

  async function handlePasswordSubmit() {
    if (!resolvedIdentifier?.email) {
      setStep("identifier");
      setPassword("");
      setPasswordError(null);
      setIdentifierError("Informe seu e-mail ou usuario.");
      return;
    }

    if (!password) {
      setPasswordError("Informe sua senha.");
      return;
    }

    setIsSigningIn(true);
    setPasswordError(null);
    setConfirmationHint(null);
    setRecoveryError(null);

    try {
      const formData = new FormData();
      formData.set("email", resolvedIdentifier.email);
      formData.set("password", password);

      const result = await signInWithPasswordAction(formData);

      if (result.ok) {
        persistRememberedIdentifier();
        router.push("/dashboard");
        router.refresh();
        return;
      }

      if (result.requiresEmailConfirmation) {
        setConfirmationHint(result.message);
        return;
      }

      setPasswordError(result.message);
    } catch {
      setPasswordError("Nao foi possivel entrar agora. Tente novamente.");
    } finally {
      setIsSigningIn(false);
    }
  }

  async function handlePasswordRecovery() {
    if (!supabase || !resolvedIdentifier?.email) {
      setRecoveryError("Nao foi possivel enviar o e-mail. Tente novamente.");
      return;
    }

    setIsSendingRecovery(true);
    setRecoveryMessage(null);
    setRecoveryError(null);
    setPasswordError(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(resolvedIdentifier.email, {
        redirectTo: getPasswordRecoveryRedirectUrl(),
      });

      if (error) {
        setRecoveryError("Nao foi possivel enviar o e-mail. Tente novamente.");
        return;
      }

      setRecoveryMessage(`Enviamos um link para redefinir sua senha em ${maskEmail(resolvedIdentifier.email)}.`);
    } catch {
      setRecoveryError("Nao foi possivel enviar o e-mail. Tente novamente.");
    } finally {
      setIsSendingRecovery(false);
    }
  }

  function handleBack() {
    setStep("identifier");
    setResolvedIdentifier(null);
    setPassword("");
    setShowPassword(false);
    setPasswordError(null);
    setConfirmationHint(null);
    setRecoveryMessage(null);
    setRecoveryError(null);
  }

  function persistRememberedIdentifier() {
    if (typeof window === "undefined") {
      return;
    }

    if (!rememberAccess) {
      window.localStorage.removeItem(LAST_LOGIN_IDENTIFIER_KEY);
      return;
    }

    window.localStorage.setItem(LAST_LOGIN_IDENTIFIER_KEY, identifier.trim());
  }
}
