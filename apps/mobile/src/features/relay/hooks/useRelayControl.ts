import { useCallback, useEffect } from "react";

import { useDeviceStore } from "@/features/device";

import { sendRelayCommand } from "../services/relayService";
import { useRelayStore } from "../store/relayStore";

export function useRelayControl(deviceId: string) {
  const deviceRelayOn = useDeviceStore((state) => state.snapshot?.relayOn ?? false);
  const isOn = useRelayStore((state) => state.isOn);
  const pending = useRelayStore((state) => state.pending);
  const error = useRelayStore((state) => state.error);

  useEffect(() => {
    if (!pending && deviceRelayOn !== isOn) {
      useRelayStore.getState().confirm(deviceRelayOn);
    }
  }, [deviceRelayOn, isOn, pending]);

  const toggleRelay = useCallback(
    async (nextIsOn: boolean) => {
      const store = useRelayStore.getState();
      if (store.pending) return;
      const previousIsOn = store.isOn;

      store.setOptimistic(nextIsOn);
      try {
        await sendRelayCommand(deviceId, nextIsOn);
        useRelayStore.getState().confirm(nextIsOn);
      } catch (reason) {
        useRelayStore.getState().rollback(previousIsOn);
        useRelayStore
          .getState()
          .setError(reason instanceof Error ? reason.message : "Relay command could not be sent.");
      }
    },
    [deviceId],
  );

  return { isOn, pending, error, toggleRelay };
}
