export function toFiniteNumber(value: unknown, fallback = 0): number {
  const parsed = typeof value === "number" ? value : Number(value);
  return Number.isFinite(parsed) ? parsed : fallback;
}

export function clampToNonNegative(value: number): number {
  return Number.isFinite(value) && value > 0 ? value : 0;
}
