/** Push-pin glyph for pinned titles. */
export function PinIcon({ className = "size-3.5" }: { className?: string }) {
  return (
    <svg viewBox="0 0 16 16" aria-hidden className={`shrink-0 ${className}`}>
      <path
        d="M10.5 1.5 14.5 5.5 12.6 6.2 9.8 9 10.3 12.3 8.9 13.7 6.1 10.9 2.6 14.4 1.6 13.4 5.1 9.9 2.3 7.1 3.7 5.7 7 6.2 9.8 3.4Z"
        fill="currentColor"
      />
    </svg>
  );
}
