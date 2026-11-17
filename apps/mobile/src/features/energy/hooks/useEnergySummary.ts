import { useMemo } from "react";

import { useDeviceStatus } from "@/features/device";
import { useUserSettings } from "@/features/settings";
import { toDateKey } from "@/shared/lib/dates";

import { useEnergyStore } from "../store/energyStore";
import type { EnergySummary } from "../types";
import {
  buildUsageWindow,
  estimateMonthlyCost,
  findTodayEnergy,
  projectMonthlyCost,
  sumCost,
  sumEnergy,
} from "../utils/energy";

const WEEK_DAYS = 7;

export function useEnergySummary(): EnergySummary {
  const { reading } = useDeviceStatus();
  const usage = useEnergyStore((state) => state.usage);
  const settings = useUserSettings();

  return useMemo(() => {
    const now = new Date();
    const todayKey = toDateKey(now);
    const weekly = buildUsageWindow(usage, todayKey, WEEK_DAYS, settings.tariffPerKwh);
    const monthly = buildUsageWindow(usage, todayKey, now.getDate(), settings.tariffPerKwh);
    const monthCost = sumCost(monthly);
    const livePowerWatts = reading?.powerWatts ?? 0;

    return {
      livePowerWatts,
      todayKwh: findTodayEnergy(usage, todayKey),
      todayCost: sumCost(weekly.filter((point) => point.isToday)),
      monthKwh: sumEnergy(monthly),
      monthCost,
      projectedMonthlyCost:
        monthCost > 0
          ? projectMonthlyCost(monthCost, now.getDate())
          : estimateMonthlyCost(livePowerWatts, settings.tariffPerKwh),
      weekly,
      weekKwh: sumEnergy(weekly),
      weekCost: sumCost(weekly),
    };
  }, [reading, settings, usage]);
}
