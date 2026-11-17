import type { DailyUsage } from "@/features/device";
import { buildDateKeys } from "@/shared/lib/dates";
import { clampToNonNegative } from "@/shared/lib/numbers";

import type { UsagePoint } from "../types";

const HOURS_PER_DAY = 24;
const DAYS_PER_MONTH = 30;

export function calculateCost(energyKwh: number, tariffPerKwh: number): number {
  return clampToNonNegative(energyKwh) * clampToNonNegative(tariffPerKwh);
}

export function estimateMonthlyCost(powerWatts: number, tariffPerKwh: number): number {
  const kilowattHoursPerMonth =
    (clampToNonNegative(powerWatts) / 1000) * HOURS_PER_DAY * DAYS_PER_MONTH;
  return kilowattHoursPerMonth * clampToNonNegative(tariffPerKwh);
}

export function projectMonthlyCost(monthCost: number, dayOfMonth: number): number {
  const elapsedDays = Math.min(Math.max(1, Math.floor(dayOfMonth)), DAYS_PER_MONTH);
  return (clampToNonNegative(monthCost) / elapsedDays) * DAYS_PER_MONTH;
}

export function buildUsageWindow(
  dailyUsage: DailyUsage[],
  endDateKey: string,
  days: number,
  tariffPerKwh: number,
): UsagePoint[] {
  const energyByDate = new Map(dailyUsage.map((entry) => [entry.date, entry.energyKwh]));
  return buildDateKeys(endDateKey, days).map((date) => {
    const energyKwh = clampToNonNegative(energyByDate.get(date) ?? 0);
    return {
      date,
      energyKwh,
      cost: calculateCost(energyKwh, tariffPerKwh),
      isToday: date === endDateKey,
    };
  });
}

export function sumEnergy(points: UsagePoint[]): number {
  return points.reduce((total, point) => total + point.energyKwh, 0);
}

export function sumCost(points: UsagePoint[]): number {
  return points.reduce((total, point) => total + point.cost, 0);
}

export function findTodayEnergy(dailyUsage: DailyUsage[], todayDateKey: string): number {
  const entry = dailyUsage.find((item) => item.date === todayDateKey);
  return clampToNonNegative(entry?.energyKwh ?? 0);
}
