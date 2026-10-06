/* Shared class strings for admin buttons and inputs. */

const btnBase =
  "inline-flex items-center justify-center gap-2 rounded-lg px-4 py-2 text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand disabled:cursor-not-allowed disabled:opacity-50";

export const adminBtn = {
  primary: `${btnBase} bg-brand text-white hover:bg-brand-dark`,
  secondary: `${btnBase} border border-line-strong bg-white text-ink hover:bg-cream`,
  danger: `${btnBase} bg-error text-white hover:opacity-90`,
  ghost: `${btnBase} text-ink-soft hover:bg-cream hover:text-ink`,
  icon: "inline-flex h-9 w-9 items-center justify-center rounded-lg text-ink-soft transition-colors hover:bg-cream hover:text-ink focus-visible:outline-2 focus-visible:outline-brand",
} as const;

export const adminInput =
  "w-full rounded-lg border border-line-strong bg-white px-3 py-2 text-sm text-ink placeholder:text-muted focus:border-brand focus:outline-2 focus:outline-brand/30";
