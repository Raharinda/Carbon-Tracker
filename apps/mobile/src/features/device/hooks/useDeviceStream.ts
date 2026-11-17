import { useEffect } from "react";

import { getDeviceRepository } from "../services";
import { useDeviceStore } from "../store/deviceStore";

export function useDeviceStream(deviceId: string, enabled = true): void {
  useEffect(() => {
    if (!enabled) return;

    const repository = getDeviceRepository();
    useDeviceStore.getState().setStatus("loading");

    const unsubscribe = repository.subscribeDevice(
      deviceId,
      (snapshot) => useDeviceStore.getState().applySnapshot(snapshot),
      (error) => useDeviceStore.getState().setError(error),
    );

    return unsubscribe;
  }, [deviceId, enabled]);
}
