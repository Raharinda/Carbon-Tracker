import { useNow } from "@/shared/hooks/useNow";

import { useDeviceStore } from "../store/deviceStore";
import { isSnapshotLive } from "../utils/connection";

export function useDeviceStatus() {
  const snapshot = useDeviceStore((state) => state.snapshot);
  const status = useDeviceStore((state) => state.status);
  const error = useDeviceStore((state) => state.error);
  const now = useNow();

  return {
    snapshot,
    reading: snapshot?.reading ?? null,
    relayOn: snapshot?.relayOn ?? false,
    isLive: isSnapshotLive(snapshot, now),
    status,
    error,
  };
}
