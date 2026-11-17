import type { DeviceSource } from "@/shared/lib/constants";

export type DeviceReading = {
  voltage: number;
  current: number;
  powerWatts: number;
  energyKilowattHours: number;
  frequencyHz: number;
  powerFactor: number;
  recordedAt: number;
};

export type DeviceSnapshot = {
  deviceId: string;
  reading: DeviceReading | null;
  relayOn: boolean;
  receivedAt: number;
};

export type DevicePreferences = {
  tariffPerKwh: number;
  emissionFactorKgPerKwh: number;
  monthlyBudgetIdr: number;
};

export type DailyUsage = {
  date: string;
  energyKwh: number;
};

export type UsageSample = {
  energyKilowattHours: number;
  recordedAt: number;
};

export type DeviceErrorCode = "unavailable" | "permission" | "unknown";

export type DeviceError = {
  code: DeviceErrorCode;
  message: string;
};

export type Unsubscribe = () => void;

export type DeviceSourceKind = DeviceSource;
