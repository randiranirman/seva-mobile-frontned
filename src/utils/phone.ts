/** Formats up to 9 local digits as `77 123 4567` (shown after a fixed +94 prefix). */
export function formatMobile(v: string): string {
  const d = v.replace(/\D/g, "").slice(0, 9);
  return [d.slice(0, 2), d.slice(2, 5), d.slice(5, 9)]
    .filter(Boolean)
    .join(" ");
}

/** `0740031801` -> `+94 74 003 1801`. Anything that doesn't look like a local number is returned as is. */
export function formatLocalPhone(v: string): string {
  const d = v.replace(/\D/g, "");
  return d.length === 10 && d.startsWith("0")
    ? `+94 ${formatMobile(d.slice(1))}`
    : v;
}
