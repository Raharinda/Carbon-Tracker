export const DEFAULT_DEVICE_ID = "esp32_01";
export const DEFAULT_DEVICE_NAME = "Kitchen plug";
export const DEFAULT_TARIFF_PER_KWH = 1444.7;
export const DEFAULT_EMISSION_FACTOR_KG_PER_KWH = 0.87;
export const DEFAULT_MONTHLY_BUDGET_IDR = 300_000;
export const LIVE_DATA_THRESHOLD_MS = 30_000;
export const USAGE_RECORD_INTERVAL_MS = 60_000;
export const HISTORY_WINDOW_DAYS = 7;

export type DeviceSource = "mock" | "firebase";

export const DEVICE_SOURCE: DeviceSource =
  process.env.EXPO_PUBLIC_DEVICE_SOURCE === "firebase" ? "firebase" : "mock";

export const IS_DEMO_MODE = DEVICE_SOURCE === "mock";
