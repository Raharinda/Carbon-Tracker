import type { DeviceSnapshot } from "../types";
import { isSnapshotLive } from "./connection";

const sampleReading = {
  voltage: 220,
  current: 0.5,
  powerWatts: 110,
  energyKilowattHours: 1.2,
  frequencyHz: 50,
  powerFactor: 0.95,
  recordedAt: 100_000,
};

describe("isSnapshotLive", () => {
  it("returns false when snapshot or reading is missing", () => {
    expect(isSnapshotLive(null, 100_000)).toBe(false);
    const relayOnly: DeviceSnapshot = {
      deviceId: "esp32_01",
      reading: null,
      relayOn: true,
      receivedAt: 100_000,
    };
    expect(isSnapshotLive(relayOnly, 100_000)).toBe(false);
  });

  it("checks reading age against the threshold", () => {
    const snapshot: DeviceSnapshot = {
      deviceId: "esp32_01",
      reading: sampleReading,
      relayOn: true,
      receivedAt: 100_000,
    };
    expect(isSnapshotLive(snapshot, 129_999, 30_000)).toBe(true);
    expect(isSnapshotLive(snapshot, 130_000, 30_000)).toBe(false);
  });
});
