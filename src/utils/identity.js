// One place that turns a profile row into the names the UI shows.

export const GENDER_OPTIONS = [
  { value: "male", label: "Male" },
  { value: "female", label: "Female" },
  { value: "other", label: "Other" },
  { value: "undisclosed", label: "Prefer not to say" },
];

export function genderLabel(gender) {
  return GENDER_OPTIONS.find((o) => o.value === gender)?.label ?? "—";
}

// A friendly account reference derived from the auth id — stable, needs no
// storage. e.g. "STG-0575-A847".
export function accountId(uid) {
  if (!uid) return null;
  const hex = uid.replace(/-/g, "").slice(0, 8).toUpperCase();
  return `STG-${hex.slice(0, 4)}-${hex.slice(4, 8)}`;
}

export function fullName(profile) {
  if (!profile) return "";
  return [profile.first_name, profile.last_name].filter(Boolean).join(" ");
}

// A user row → something printable. Full name if present, else the email, else
// a short id, else "Unknown". Used across the admin views.
export function personLabel(user) {
  if (!user) return "Unknown";
  return fullName(user) || user.email || user.id?.slice(0, 8) || "Unknown";
}

// The greeting name in a couple of registers — full name, then just the
// first name — so the dashboard can rotate to something more casual. No
// honorifics.
export function nameVariants(profile, fallbackEmail) {
  const out = [];
  if (profile) {
    if (profile.first_name && profile.last_name)
      out.push(`${profile.first_name} ${profile.last_name}`);
    if (profile.first_name) out.push(profile.first_name);
  }
  if (fallbackEmail) out.push(fallbackEmail.split("@")[0]);
  const unique = [...new Set(out)];
  return unique.length ? unique : ["there"];
}
