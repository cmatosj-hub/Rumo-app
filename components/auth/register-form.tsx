"use client";

import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { signUpWithPasswordAction } from "@/app/login/actions";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export function RegisterForm({ envReady }: { envReady: boolean }) {
  const router = useRouter();
  const [fullName, setFullName] = useState("");
  const [username, setUsername] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [message, setMessage] = useState<string | null>(null);
  const [showConfirmationHint, setShowConfirmationHint] = useState(false);
  const [pending, startTransition] = useTransition();

  function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();

    startTransition(async () => {
      const formData = new FormData();
      formData.set("fullName", fullName);
      formData.set("username", username);
      formData.set("email", email);
      formData.set("password", password);
      const result = await signUpWithPasswordAction(formData);
      setMessage(result.message);
      setShowConfirmationHint(Boolean(result.requiresEmailConfirmation));

      if (result.ok && !result.requiresEmailConfirmation) {
        router.push("/login");
        router.refresh();
      }
    });
  }

  return (
    <form className="space-y-5" onSubmit={handleSubmit}>
      {!envReady ? (
        <div className="rounded-3xl border border-amber-400/30 bg-amber-400/10 p-4 text-sm leading-6 text-[var(--color-foreground)]">
          Preencha `NEXT_PUBLIC_SUPABASE_URL` e `NEXT_PUBLIC_SUPABASE_ANON_KEY` para ativar o cadastro com senha.
        </div>
      ) : null}

      {showConfirmationHint ? (
        <div className="accent-amber-surface rounded-3xl border p-4 text-sm leading-6">
          Depois de criar a conta, confirme o e-mail recebido para liberar seu primeiro acesso.
        </div>
      ) : null}

      <div className="space-y-2">
        <Label htmlFor="register-full-name">Nome</Label>
        <Input
          id="register-full-name"
          autoComplete="name"
          placeholder="Seu nome"
          value={fullName}
          onChange={(event) => setFullName(event.target.value)}
        />
      </div>

      <div className="space-y-2">
        <div className="flex items-center justify-between gap-3">
          <Label htmlFor="register-username">Usuario</Label>
          <span className="text-xs uppercase tracking-[0.14em] text-[var(--color-muted-foreground)]">
            Letras, numeros e _
          </span>
        </div>
        <Input
          id="register-username"
          autoComplete="username"
          placeholder="seu_usuario"
          value={username}
          onChange={(event) => setUsername(event.target.value.toLowerCase())}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="register-email">E-mail</Label>
        <Input
          id="register-email"
          type="email"
          autoComplete="email"
          placeholder="voce@exemplo.com"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
        />
      </div>

      <div className="space-y-2">
        <Label htmlFor="register-password">Senha</Label>
        <Input
          id="register-password"
          type="password"
          autoComplete="new-password"
          placeholder="Crie uma senha"
          value={password}
          onChange={(event) => setPassword(event.target.value)}
        />
      </div>

      <Button
        type="submit"
        className="w-full"
        disabled={pending || !fullName || !username || !email || !password}
      >
        {pending ? "Criando conta..." : "Criar conta com senha"}
      </Button>

      <p className="text-sm leading-6 text-[var(--color-muted-foreground)]">
        Depois do cadastro, os proximos acessos acontecem com e-mail e senha.
      </p>

      {message ? <p className="text-sm leading-6 text-[var(--color-muted-foreground)]">{message}</p> : null}
    </form>
  );
}
