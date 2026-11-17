import { useEffect } from "react";

import { useDeviceStore } from "@/features/device";
import { useSettingsStore } from "@/features/settings";
import { USAGE_RECORD_INTERVAL_MS } from "@/shared/lib/constants";

import { recordEnergyUsage } from "../services/energyService";

export function useUsageRecording(deviceId: string, enabled = true): void {
  useEffect(() => {
    if (!enabled) return;

    const record = () => {
      const snapshot = useDeviceStore.getState().snapshot;
      if (!snapshot?.reading) return;
      const preferences = useSettingsStore.getState().settings;
      recordEnergyUsage(
        deviceId,
        {
          energyKilowattHours: snapshot.reading.energyKilowattHours,
          recordedAt: Date.now(),
        },
        preferences,
      ).catch(() => undefined);
    };

    record();
    const timer = setInterval(record, USAGE_RECORD_INTERVAL_MS);
    return () => clearInterval(timer);
  }, [deviceId, enabled]);
}
