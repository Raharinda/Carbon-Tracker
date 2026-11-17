import AsyncStorage from "@react-native-async-storage/async-storage";

import { type DeviceError, type DevicePreferences, getDeviceRepository } from "@/features/device";
import { DEFAULT_DEVICE_ID } from "@/shared/lib/constants";

import type { UserSettings } from "../types";

const DEVICE_ID_STORAGE_KEY = "carbon-tracker.deviceId";

function toPreferences(settings: UserSettings): DevicePreferences {
  return {
    tariffPerKwh: settings.tariffPerKwh,
    emissionFactorKgPerKwh: settings.emissionFactorKgPerKwh,
    monthlyBudgetIdr: settings.monthlyBudgetIdr,
  };
}

function toUserSettings(preferences: DevicePreferences): UserSettings {
  return {
    tariffPerKwh: preferences.tariffPerKwh,
    emissionFactorKgPerKwh: preferences.emissionFactorKgPerKwh,
    monthlyBudgetIdr: preferences.monthlyBudgetIdr,
  };
}

export async function loadDeviceId(): Promise<string> {
  try {
    const stored = await AsyncStorage.getItem(DEVICE_ID_STORAGE_KEY);
    return stored?.trim() || DEFAULT_DEVICE_ID;
  } catch {
    return DEFAULT_DEVICE_ID;
  }
}

export async function persistDeviceId(deviceId: string): Promise<void> {
  await AsyncStorage.setItem(DEVICE_ID_STORAGE_KEY, deviceId.trim());
}

export function subscribeSettings(
  deviceId: string,
  onSettings: (settings: UserSettings) => void,
  onError: (error: DeviceError) => void,
): () => void {
  return getDeviceRepository().subscribePreferences(
    deviceId,
    (preferences) => onSettings(toUserSettings(preferences)),
    onError,
  );
}

export async function saveSettings(deviceId: string, settings: UserSettings): Promise<void> {
  await getDeviceRepository().savePreferences(deviceId, toPreferences(settings));
}
