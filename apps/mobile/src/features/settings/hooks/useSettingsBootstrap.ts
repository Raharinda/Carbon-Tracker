import { useEffect, useState } from "react";

import { loadDeviceId, subscribeSettings } from "../services/settingsService";
import { useSettingsStore } from "../store/settingsStore";

export function useSettingsBootstrap(enabled: boolean): void {
  const deviceId = useSettingsStore((state) => state.deviceId);
  const [hydrated, setHydrated] = useState(false);

  useEffect(() => {
    let active = true;
    loadDeviceId().then((storedDeviceId) => {
      if (!active) return;
      useSettingsStore.getState().setDeviceId(storedDeviceId);
      setHydrated(true);
    });
    return () => {
      active = false;
    };
  }, []);

  useEffect(() => {
    if (!enabled || !hydrated) return;

    useSettingsStore.getState().setStatus("loading");
    return subscribeSettings(
      deviceId,
      (settings) => useSettingsStore.getState().setSettings(settings),
      (error) => useSettingsStore.getState().setError(error.message),
    );
  }, [deviceId, enabled, hydrated]);
}
