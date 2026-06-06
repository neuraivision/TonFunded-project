import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Formats a signed percentage with a leading + for gains, and never renders a
 * negative zero (e.g. "-0.0%"). Values that round to zero show as "0.0%".
 */
export function formatPct(value: number, decimals = 1): string {
  let rounded = Number(value.toFixed(decimals));
  if (Object.is(rounded, -0) || rounded === 0) rounded = 0;
  const sign = rounded > 0 ? '+' : '';
  return `${sign}${rounded.toFixed(decimals)}%`;
}
