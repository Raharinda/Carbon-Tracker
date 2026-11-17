import { useMemo } from "react";

import { selectDailyUsage, useEnergyStore } from "@/features/energy";
import { useUserSettings } from "@/features/settings";
import { firstDayOfMonthKey, toDateKey } from "@/shared/lib/dates";

import { useCarbonStore } from "../store/carbonStore";
import type { CarbonSummary } from "../types";
import {
  buildCarbonWindow,
  calculateSavedPercent,
  previousWindowRange,
  sumCarbon,
  sumCarbonForDateRange,
} from "../utils/carbon";

const WEEK_DAYS = 7;
const MONTH_DAYS = 30;

export function useCarbonSummary(): CarbonSummary {
  const usage = useEnergyStore(selectDailyUsage);
  const settings = useUserSettings();
  const period = useCarbonStore((state) => state.period);

  return useMemo(() => {
    const todayKey = toDateKey(new Date());
    const emissionFactor = settings.emissionFactorKgPerKwh;
    const week = buildCarbonWindow(usage, todayKey, WEEK_DAYS, emissionFactor);
    const monthSeries = buildCarbonWindow(usage, todayKey, MONTH_DAYS, emissionFactor);
    const weekKg = sumCarbon(week);
    const previousWeek = previousWindowRange(todayKey, WEEK_DAYS);
    const previousWeekKg = sumCarbonForDateRange(
      usage,
      previousWeek.startDateKey,
      previousWeek.endDateKey,
      emissionFactor,
    );

    return {
      period,
      todayKg: sumCarbonForDateRange(usage, todayKey, todayKey, emissionFactor),
      weekKg,
      monthKg: sumCarbonForDateRange(usage, firstDayOfMonthKey(todayKey), todayKey, emissionFactor),
      savedPercent: calculateSavedPercent(weekKg, previousWeekKg),
      series: period === "week" ? week : monthSeries,
    };
  }, [period, settings, usage]);
}
