import { useSettingsStore } from "../store/settingsStore";

export function useDeviceId(): string {
  return useSettingsStore((state) => state.deviceId);
}

export function useUserSettings() {
  return useSettingsStore((state) => state.settings);
}
