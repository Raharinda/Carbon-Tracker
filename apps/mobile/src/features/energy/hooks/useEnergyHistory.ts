import { useEffect } from "react";

import { getDeviceRepository } from "@/features/device";

import { useEnergyStore } from "../store/energyStore";

export function useEnergyHistory(deviceId: string, enabled = true): void {
  useEffect(() => {
    if (!enabled) return;

    useEnergyStore.getState().setStatus("loading");
    const unsubscribe = getDeviceRepository().subscribeDailyUsage(
      deviceId,
      (usage) => useEnergyStore.getState().setUsage(usage),
      (error) => useEnergyStore.getState().setError(error.message),
    );
    return unsubscribe;
  }, [deviceId, enabled]);
}
