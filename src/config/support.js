// The address behind every "contact support" in the app.
//
// It is a Cloudflare Email Routing alias that forwards to the owner's inbox —
// there is no mailbox to sign into, which is worth knowing before anyone tries.
// Replying works normally, but the reply comes from the personal address it
// forwards to unless that is configured separately.
//
// Kept in one place because the phrase appears on more than one screen, and a
// support address that is right in one of them and stale in the other is worse
// than having none at all.
export const SUPPORT_EMAIL = "support@sterlingbank.org";

// `mailto:` with a subject, so a message arrives already labelled. Callers pass
// the context they have; the body is left to the sender.
export function supportMailto(subject) {
  const query = subject ? `?subject=${encodeURIComponent(subject)}` : "";
  return `mailto:${SUPPORT_EMAIL}${query}`;
}
