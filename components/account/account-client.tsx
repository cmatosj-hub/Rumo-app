"use client";

import type React from "react";
import { useRouter } from "next/navigation";
import { useState, useTransition } from "react";

import { updatePasswordAction, updateProfileAction } from "@/app/account/actions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { ProfileRecord } from "@/lib/types";

export function AccountClient({ profile }: { profile: ProfileRecord }) {
  const router = useRouter();
  const [profilePending, startProfileTransition] = useTransition();
  const [passwordPending, startPasswordTransition] = useTransition();
  const [profileMessage, setProfileMessage] = useState<string | null>(null);
  const [passwordMessage, setPasswordMessage] = useState<string | null>(null);
  const [profileForm, setProfileForm] = useState({
    fullName: profile.fullName,
    username: profile.username,
    avatarUrl: profile.avatarUrl,
  });
  const [password, setPassword] = useState("");

  return (
    <div className="mt-8 grid gap-6 xl:grid-cols-[1fr_0.9fr]">
      <Card>
        <CardHeader>
          <CardTitle>Perfil publico</CardTitle>
          <CardDescription>Defina seu nome, avatar e um username unico dentro do RUMO.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="theme-border surface-soft flex items-center gap-4 rounded-3xl border p-4">
            {profileForm.avatarUrl ? (
              <img
                src={profileForm.avatarUrl}
                alt={profileForm.username}
                className="h-16 w-16 rounded-3xl object-cover"
              />
            ) : (
              <div className="flex h-16 w-16 items-center justify-center rounded-3xl border border-emerald-400/20 bg-emerald-400/10 font-semibold text-emerald-100">
                {(profileForm.fullName || profileForm.username || "RU")
                  .slice(0, 2)
                  .toUpperCase()}
              </div>
            )}
            <div>
              <p className="font-semibold text-[var(--color-foreground)]">{profile.email}</p>
              <p className="text-sm text-[var(--color-muted-foreground)]">@{profileForm.username}</p>
            </div>
          </div>

          <Field
            label="Nome completo"
            value={profileForm.fullName}
            onChange={(value) => setProfileForm((current) => ({ ...current, fullName: value }))}
          />
          <Field
            label="Nome de usuario"
            value={profileForm.username}
            onChange={(value) =>
              setProfileForm((current) => ({
                ...current,
                username: value.toLowerCase().replace(/[^a-z0-9_]/g, ""),
              }))
            }
          />
          <Field
            label="URL do avatar"
            value={profileForm.avatarUrl}
            onChange={(value) => setProfileForm((current) => ({ ...current, avatarUrl: value }))}
          />

          <Button
            disabled={profilePending}
            onClick={() =>
              startProfileTransition(async () => {
                const result = await updateProfileAction(profileForm);
                setProfileMessage(result.message);
                if (result.ok) router.refresh();
              })
            }
          >
            {profilePending ? "Salvando..." : "Salvar perfil"}
          </Button>
          {profileMessage ? <p className="text-sm text-[var(--color-muted-foreground)]">{profileMessage}</p> : null}
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Seguranca</CardTitle>
          <CardDescription>Gerencie sua senha de acesso e alterne dark/light mode pelo menu lateral.</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Field label="Nova senha" type="password" value={password} onChange={setPassword} />
          <Button
            variant="secondary"
            disabled={passwordPending}
            onClick={() =>
              startPasswordTransition(async () => {
                const result = await updatePasswordAction({ password });
                setPasswordMessage(result.message);
                if (result.ok) setPassword("");
              })
            }
          >
            {passwordPending ? "Atualizando..." : "Atualizar senha"}
          </Button>
          {passwordMessage ? <p className="text-sm text-[var(--color-muted-foreground)]">{passwordMessage}</p> : null}
        </CardContent>
      </Card>
    </div>
  );
}

function Field({
  label,
  value,
  onChange,
  type = "text",
}: {
  label: string;
  value: string;
  onChange: (value: string) => void;
  type?: React.HTMLInputTypeAttribute;
}) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input type={type} value={value} onChange={(event) => onChange(event.target.value)} />
    </div>
  );
}
