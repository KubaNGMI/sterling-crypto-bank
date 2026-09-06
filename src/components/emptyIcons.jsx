/* Drawn line icons (16px grid, currentColor) for EmptyState / error states.
   Kept in their own module so EmptyState.jsx stays a component-only file. */
export const emptyIcons = {
  coins: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round">
      <ellipse cx="6" cy="4.3" rx="4" ry="2.1" />
      <path d="M2 4.3v3.4C2 8.86 3.79 9.8 6 9.8s4-.94 4-2.1V4.3" />
      <path d="M6 9.8v3.4c0 1.16 1.79 2.1 4 2.1s4-.94 4-2.1V8.6" />
      <path d="M10 6.5c2.21 0 4 .94 4 2.1S12.21 10.7 10 10.7" />
    </svg>
  ),
  receipt: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round">
      <path d="M3.5 2.5h9v11l-1.6-1-1.6 1-1.6-1-1.6 1-1.6-1-1.4 1v-11Z" />
      <path d="M5.8 6h4.4M5.8 8.6h4.4" />
    </svg>
  ),
  pie: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 2a6 6 0 1 0 6 6H8V2Z" />
      <path d="M10.5 2.9A6 6 0 0 1 13.1 5.5H10.5V2.9Z" />
    </svg>
  ),
  bars: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2.5 13.5h11" />
      <path d="M4.5 13.5v-4M8 13.5V5M11.5 13.5v-6" />
    </svg>
  ),
  alert: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round">
      <path d="M8 2.7 14.5 13.3H1.5L8 2.7Z" />
      <path d="M8 6.7v3M8 11.3h.01" />
    </svg>
  ),
  bank: (
    <svg viewBox="0 0 16 16" fill="none" stroke="currentColor" strokeWidth="1.1" strokeLinecap="round" strokeLinejoin="round">
      <path d="M2 6 8 2.5 14 6" />
      <path d="M3 6v6M6.4 6v6M9.6 6v6M13 6v6" />
      <path d="M2 12.5h12" />
    </svg>
  ),
};
