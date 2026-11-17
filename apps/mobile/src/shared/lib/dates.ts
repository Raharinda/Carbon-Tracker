const MILLISECONDS_PER_DAY = 24 * 60 * 60 * 1000;

export function toDateKey(date: Date): string {
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${year}-${month}-${day}`;
}

export function toDateKeyFromEpoch(epochMilliseconds: number): string {
  return toDateKey(new Date(epochMilliseconds));
}

export function shiftDateKey(dateKey: string, days: number): string {
  const date = new Date(`${dateKey}T00:00:00`);
  date.setDate(date.getDate() + days);
  return toDateKey(date);
}

export function startOfDayEpoch(epochMilliseconds: number): number {
  const date = new Date(epochMilliseconds);
  date.setHours(0, 0, 0, 0);
  return date.getTime();
}

export function daysBetweenEpochs(fromEpoch: number, toEpoch: number): number {
  return Math.round((startOfDayEpoch(toEpoch) - startOfDayEpoch(fromEpoch)) / MILLISECONDS_PER_DAY);
}

export function buildDateKeys(endDateKey: string, days: number): string[] {
  return Array.from({ length: days }, (_, index) => shiftDateKey(endDateKey, index - days + 1));
}

export function firstDayOfMonthKey(dateKey: string): string {
  return `${dateKey.slice(0, 7)}-01`;
}
