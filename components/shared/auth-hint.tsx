import Link from "next/link";

export function AuthHint({ isDemoMode, authRequired }: { isDemoMode: boolean; authRequired: boolean }) {
  if (!isDemoMode && !authRequired) {
    return null;
  }

  return (
    <div className="accent-amber-surface rounded-[1.5rem] border p-4 text-sm leading-6">
      {isDemoMode ? (
        <>Modo demonstração ativo. Conecte e autentique no Supabase para persistir seus dados.</>
      ) : (
        <>
          Faça login em <Link className="font-semibold underline" href="/login">/login</Link> para ativar o salvamento
          real da sua conta.
        </>
      )}
    </div>
  );
}
