import { LIVE_DATA_THRESHOLD_MS } from "@/shared/lib/constants";

import type { DeviceSnapshot } from "../types";

export type ConnectionStatus = "online" | "offline";

export function isSnapshotLive(
  snapshot: DeviceSnapshot | null,
  now: number,
  thresholdMs = LIVE_DATA_THRESHOLD_MS,
): boolean {
  if (snapshot === null) return false;
  return now - snapshot.receivedAt < thresholdMs;
}

export function describeConnection(isLive: boolean): ConnectionStatus {
  return isLive ? "online" : "offline";
}
