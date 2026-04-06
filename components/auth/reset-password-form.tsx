"use client";

import { LoaderCircle } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useState } from "react";

import { useAuthSession } from "@/components/providers/auth-session-provider";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function ResetPasswordForm({ envReady }: { envReady: boolean }) {
  const router = useRouter();
  const { hasSession, isLoading, supabase } = useAuthSession();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const [isUpdatingPassword, setIsUpdatingPassword] = useState(false);

  if (!envReady) {
    return (
      <div className="space-y-6">
        <div className="space-y-3">
          <p className="accent-emerald text-xs font-medium uppercase tracking-[0.24em]">Recuperar acesso</p>
          <h1 className="text-3xl font-semibold tracking-tight text-[var(--color-foreground)]">Redefinir senha</h1>
          <p className="text-sm leading-6 text-[var(--color-muted-foreground)]">
            Configure o Supabase antes de usar a redefinicao de senha.
          </p>
        </div>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="space-y-5">
        <div className="flex items-center justify-between gap-3">
          <p className="accent-emerald text-xs font-medium uppercase tracking-[0.24em]">Recuperar acesso</p>
          <span className="rounded-full border border-white/8 bg-white/4 px-2.5 py-1 text-[11px] font-medium text-[var(--color-muted-foreground)]">
            Verificando
          </span>
        </div>

        <div className="auth-step-enter rounded-[1.5rem] border border-white/8 bg-white/4 p-6 text-center">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full border border-white/8 bg-white/4">
            <LoaderCircle className="h-5 w-5 animate-spin text-[var(--color-muted-foreground)]" />
          </div>
          <h2 className="mt-5 text-2xl font-semibold tracking-tight text-[var(--color-foreground)]">
            Validando seu link
          </h2>
          <p className="mt-2 text-sm leading-6 text-[var(--color-muted-foreground)]">
            Estamos preparando sua sessao para redefinir a senha com seguranca.
          </p>
        </div>
      </div>
    );
  }

  if (!hasSession || !supabase) {
    return (
      <div className="space-y-6">
        <div className="space-y-3">
          <p className="accent-emerald text-xs font-medium uppercase tracking-[0.24em]">Recuperar acesso</p>
          <h1 className="text-3xl font-semibold tracking-tight text-[var(--color-foreground)]">Redefinir senha</h1>
          <p className="text-sm leading-6 text-[var(--color-muted-foreground)]">
            Esse link expirou ou nao esta mais valido. Solicite uma nova recuperacao para continuar.
          </p>
        </div>

        <Link href="/login" className="inline-flex">
          <Button variant="secondary" className="h-12 rounded-[1rem] px-5">
            Voltar para o login
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <form className="space-y-7" onSubmit={(event) => void handleSubmit(event)}>
      <div className="space-y-3">
        <div className="flex items-center justify-between gap-3">
          <p className="accent-emerald text-xs font-medium uppercase tracking-[0.24em]">Recuperar acesso</p>
          <span className="rounded-full border border-white/8 bg-white/4 px-2.5 py-1 text-[11px] font-medium text-[var(--color-muted-foreground)]">
            Nova senha
          </span>
        </div>

        <h1 className="text-3xl font-semibold tracking-tight text-[var(--color-foreground)]">Redefinir senha</h1>
        <p className="max-w-sm text-sm leading-6 text-[var(--color-muted-foreground)]">
          Crie uma nova senha para voltar ao painel com seguranca.
        </p>
      </div>

      <div className="space-y-3">
        <Label htmlFor="reset-password" className="text-[13px] font-medium normal-case tracking-[0.02em]">
          Nova senha
        </Label>
        <Input
          id="reset-password"
          type="password"
          autoComplete="new-password"
          autoFocus
          placeholder="Digite sua nova senha"
          className="auth-input h-14 rounded-[1.25rem] px-4 text-[15px]"
          value={password}
          onChange={(event) => {
            setPassword(event.target.value);
            setErrorMessage(null);
          }}
          disabled={isUpdatingPassword}
        />
      </div>

      <div className="space-y-3">
        <Label htmlFor="reset-password-confirm" className="text-[13px] font-medium normal-case tracking-[0.02em]">
          Confirmar senha
        </Label>
        <Input
          id="reset-password-confirm"
          type="password"
          autoComplete="new-password"
          placeholder="Confirme sua nova senha"
          className="auth-input h-14 rounded-[1.25rem] px-4 text-[15px]"
          value={confirmPassword}
          onChange={(event) => {
            setConfirmPassword(event.target.value);
            setErrorMessage(null);
          }}
          disabled={isUpdatingPassword}
        />
      </div>

      {errorMessage ? (
        <p className="text-[13px] leading-5 text-[var(--color-destructive)]" aria-live="polite">
          {errorMessage}
        </p>
      ) : null}

      <Button
        type="submit"
        className="auth-primary-button h-14 w-full rounded-[1.25rem] text-[15px]"
        disabled={isUpdatingPassword || !password || !confirmPassword}
      >
        {isUpdatingPassword ? "Atualizando..." : "Salvar nova senha"}
      </Button>
    </form>
  );

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!password || !confirmPassword) {
      setErrorMessage("Informe a nova senha e a confirmacao.");
      return;
    }

    if (password.length < 6) {
      setErrorMessage("A nova senha precisa ter pelo menos 6 caracteres.");
      return;
    }

    if (password !== confirmPassword) {
      setErrorMessage("As senhas nao coincidem.");
      return;
    }

    if (!supabase) {
      setErrorMessage("Nao foi possivel atualizar a senha. Tente novamente.");
      return;
    }

    setIsUpdatingPassword(true);
    setErrorMessage(null);

    try {
      const { error } = await supabase.auth.updateUser({ password });

      if (error) {
        setErrorMessage("Nao foi possivel atualizar a senha. Tente novamente.");
        return;
      }

      await supabase.auth.signOut();
      router.replace("/login?reset=success");
    } catch {
      setErrorMessage("Nao foi possivel atualizar a senha. Tente novamente.");
    } finally {
      setIsUpdatingPassword(false);
    }
  }
}
