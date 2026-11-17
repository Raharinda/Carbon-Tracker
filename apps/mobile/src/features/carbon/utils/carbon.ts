import type { DailyUsage } from "@/features/device";
import { buildDateKeys, shiftDateKey } from "@/shared/lib/dates";
import { clampToNonNegative } from "@/shared/lib/numbers";

import type { CarbonPoint } from "../types";

export function calculateCarbon(energyKwh: number, emissionFactorKgPerKwh: number): number {
  return clampToNonNegative(energyKwh) * clampToNonNegative(emissionFactorKgPerKwh);
}

export function sumCarbon(points: CarbonPoint[]): number {
  return points.reduce((total, point) => total + point.carbonKg, 0);
}

export function sumCarbonForDateRange(
  dailyUsage: DailyUsage[],
  startDateKey: string,
  endDateKey: string,
  emissionFactorKgPerKwh: number,
): number {
  const start = startDateKey.localeCompare(endDateKey) <= 0 ? startDateKey : endDateKey;
  const end = start === startDateKey ? endDateKey : startDateKey;
  return dailyUsage.reduce((total, entry) => {
    if (entry.date.localeCompare(start) < 0 || entry.date.localeCompare(end) > 0) return total;
    return total + calculateCarbon(entry.energyKwh, emissionFactorKgPerKwh);
  }, 0);
}

export function buildCarbonWindow(
  dailyUsage: DailyUsage[],
  endDateKey: string,
  days: number,
  emissionFactorKgPerKwh: number,
): CarbonPoint[] {
  const energyByDate = new Map(dailyUsage.map((entry) => [entry.date, entry.energyKwh]));
  return buildDateKeys(endDateKey, days).map((date) => ({
    date,
    label: date.slice(5),
    carbonKg: calculateCarbon(energyByDate.get(date) ?? 0, emissionFactorKgPerKwh),
    isToday: date === endDateKey,
  }));
}

export function calculateSavedPercent(
  currentCarbonKg: number,
  previousCarbonKg: number,
): number | null {
  if (previousCarbonKg <= 0) return null;
  return ((previousCarbonKg - currentCarbonKg) / previousCarbonKg) * 100;
}

export function previousWindowRange(
  endDateKey: string,
  days: number,
): {
  startDateKey: string;
  endDateKey: string;
} {
  return {
    startDateKey: shiftDateKey(endDateKey, -days * 2 + 1),
    endDateKey: shiftDateKey(endDateKey, -days),
  };
}
