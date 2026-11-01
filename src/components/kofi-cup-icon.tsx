/** Coffee cup with a heart, used for the Ko-fi support links. */
export function KofiCupIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 64 52" aria-hidden className={className}>
      <path d="M4 6h44v22c0 11-9 20-20 20h-4C13 48 4 39 4 28z" fill="currentColor" />
      <path d="M48 12h4a10 10 0 0 1 0 20h-4" fill="none" stroke="currentColor" strokeWidth="6" />
      <path
        d="M26 36s-11-6.5-11-13.5a5.5 5.5 0 0 1 11-1.6 5.5 5.5 0 0 1 11 1.6C37 29.5 26 36 26 36z"
        fill="#ff5e5b"
      />
    </svg>
  );
}
