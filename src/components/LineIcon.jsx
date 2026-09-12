// Drawn line icons on the app's 16px / currentColor grid, the same convention
// as the sidebar and the empty states. Wraps the boilerplate so callers only
// write the paths.
export default function LineIcon({ children, className }) {
  return (
    <svg
      className={className}
      viewBox="0 0 16 16"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.1"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}
