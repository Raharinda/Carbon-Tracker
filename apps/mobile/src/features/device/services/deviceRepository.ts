import type {
  DailyUsage,
  DeviceError,
  DevicePreferences,
  DeviceSnapshot,
  Unsubscribe,
  UsageSample,
} from "../types";

export type DeviceRepositoryListener<T> = (value: T) => void;
export type DeviceErrorListener = (error: DeviceError) => void;

/**
 * Hardware boundary. Swapping Firebase for REST/MQTT only requires a new
 * implementation of this interface.
 */
export interface DeviceRepository {
  readonly source: "mock" | "firebase";
  subscribeDevice(
    deviceId: string,
    onSnapshot: DeviceRepositoryListener<DeviceSnapshot>,
    onError: DeviceErrorListener,
  ): Unsubscribe;
  subscribeDailyUsage(
    deviceId: string,
    onUsage: DeviceRepositoryListener<DailyUsage[]>,
    onError: DeviceErrorListener,
  ): Unsubscribe;
  subscribePreferences(
    deviceId: string,
    onPreferences: DeviceRepositoryListener<DevicePreferences>,
    onError: DeviceErrorListener,
  ): Unsubscribe;
  setRelay(deviceId: string, isOn: boolean): Promise<void>;
  recordUsage(deviceId: string, sample: UsageSample, preferences: DevicePreferences): Promise<void>;
  savePreferences(deviceId: string, preferences: DevicePreferences): Promise<void>;
}
