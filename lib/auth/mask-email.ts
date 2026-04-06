export function maskEmail(email: string) {
  const [localPart, domainPart] = email.split("@");

  if (!localPart || !domainPart) {
    return email;
  }

  const visibleLocalPart = localPart.slice(0, Math.min(2, localPart.length));
  return `${visibleLocalPart}${"*".repeat(Math.max(localPart.length - visibleLocalPart.length, 1))}@${domainPart}`;
}
