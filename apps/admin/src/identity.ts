export function resolveDisplayName({
  profileName,
  authDisplayName,
  email,
}: {
  profileName?: string | null;
  authDisplayName?: string | null;
  email?: string | null;
}) {
  const profile = profileName?.trim();
  if (profile) return profile;

  const displayName = authDisplayName?.trim();
  if (displayName) return displayName;

  const prefix = email?.split("@", 1)[0]?.trim();
  return prefix || "there";
}
