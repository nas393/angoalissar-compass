export const fmt  = (n: number, dp = 0) => (n ?? 0).toLocaleString("en-US", { maximumFractionDigits: dp });
export const fmtM = (n: number) =>
  n >= 1e9 ? `${(n/1e9).toFixed(2)}B` :
  n >= 1e6 ? `${(n/1e6).toFixed(1)}M` : fmt(n);
export const fmtK = (n: number) => n >= 1000 ? `${(n/1000).toFixed(1)}K` : fmt(n);

export function clsx(...classes: (string | undefined | null | false)[]): string {
  return classes.filter(Boolean).join(" ");
}
