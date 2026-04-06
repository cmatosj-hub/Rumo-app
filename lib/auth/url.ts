export function getSiteUrl() {
  const configuredUrl = process.env.NEXT_PUBLIC_SITE_URL?.trim();

  if (configuredUrl) {
    return configuredUrl.replace(/\/$/, "");
  }

  if (typeof window !== "undefined") {
    return window.location.origin.replace(/\/$/, "");
  }

  return "http://localhost:3000";
}

export function getPasswordRecoveryRedirectUrl() {
  const next = encodeURIComponent("/reset-password");
  return `${getSiteUrl()}/auth/confirm?next=${next}`;
}
