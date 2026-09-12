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

// The name the dashboard greets you by. First name only — a greeting is the
// familiar register, and the full legal name belongs on documents, not on a
// hello. Deliberately no email either: the local half of an address is a login
// credential, not what someone is called, and a bank greeting a customer by it
// reads as the machine not knowing who they are.
//
// `meta` is the auth user_metadata copy, which rides along with the session and
// so is readable before the profiles row has been fetched. The profile row wins
// wherever both have a value.
export function greetingName(profile, meta) {
  return profile?.first_name || meta?.first_name || "there";
}
