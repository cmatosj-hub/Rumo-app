"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { signInWithPasswordAction } from "@/app/login/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function LoginForm({ envReady }: { envReady: boolean }) {
  const router = useRouter();
  const [identifier, setIdentifier] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [showConfirmationHint, setShowConfirmationHint] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    startTransition(async () => {
      const formData = new FormData();
      formData.set("identifier", identifier);
      formData.set("password", password);
      const result = await signInWithPasswordAction(formData);
      setMessage(result.message);
      setShowConfirmationHint(Boolean(result.requiresEmailConfirmation));

      if (result.ok) {
        router.push("/dashboard");
        router.refresh();
      }
    });
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      {!envReady ? (
        <div className="rounded-3xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm leading-6 text-[var(--color-foreground)]">
          Preencha `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` para ativar o login com senha.
        </div>
      ) : null}

      {showConfirmationHint ? (
        <div className="accent-amber-surface rounded-3xl border p-4 text-sm leading-6">
          Se esta for sua primeira entrada, confirme sua conta pelo e-mail antes de tentar o login.
        </div>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="identifier">E-mail ou usuario</Label>
        <Input
          id="identifier"
          autoComplete="username"
          placeholder="voce@exemplo.com ou seu_usuario"
          value={identifier}
          onChange={(event) => setIdentifier(event.target.value)}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <Label htmlFor="password">Senha</Label>
          <span className="text-xs uppercase tracking-[0.14em] text-[var(--color-muted-foreground)]">
            Minimo de 6 caracteres
          </span>
        </div>
        <Input
          id="password"
          type="password"
          autoComplete="current-password"
          placeholder="Sua senha"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={pending || !identifier || !password}
      >
        {pending ? "Entrando..." : "Entrar com senha"}
      </Button>

      <p className="text-sm leading-6 text-[var(--color-muted-foreground)]">
        O acesso agora acontece direto com e-mail ou usuario e senha, sem depender de link no e-mail a cada login.
      </p>

      {message ? <p className="text-sm leading-6 text-[var(--color-muted-foreground)]">{message}</p> : null}
    </form>
  );
}
