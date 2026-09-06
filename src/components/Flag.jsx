import * as Flags from "country-flag-icons/react/3x2";

/**
 * Renders a real SVG country flag instead of a flag emoji — Chromium on
 * Windows deliberately doesn't render flag emoji as pictures (it falls
 * back to the two-letter code), so emoji flags look broken there.
 */
export default function Flag({ iso2, className = "" }) {
  const Icon = iso2 && Flags[iso2];
  if (!Icon) return <span className={`flag-fallback ${className}`} aria-hidden="true" />;
  return <Icon className={`flag-icon ${className}`} title={iso2} />;
}
