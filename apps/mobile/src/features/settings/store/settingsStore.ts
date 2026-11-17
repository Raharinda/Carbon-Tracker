import { create } from "zustand";

import {
  DEFAULT_DEVICE_ID,
  DEFAULT_EMISSION_FACTOR_KG_PER_KWH,
  DEFAULT_MONTHLY_BUDGET_IDR,
  DEFAULT_TARIFF_PER_KWH,
} from "@/shared/lib/constants";
import type { LoadStatus } from "@/shared/types/common";

import type { UserSettings } from "../types";

type SettingsState = {
  deviceId: string;
  settings: UserSettings;
  status: LoadStatus;
  error: string | null;
  setDeviceId: (deviceId: string) => void;
  setSettings: (settings: UserSettings) => void;
  setStatus: (status: LoadStatus) => void;
  setError: (message: string) => void;
  reset: () => void;
};

const DEFAULT_SETTINGS: UserSettings = {
  tariffPerKwh: DEFAULT_TARIFF_PER_KWH,
  emissionFactorKgPerKwh: DEFAULT_EMISSION_FACTOR_KG_PER_KWH,
  monthlyBudgetIdr: DEFAULT_MONTHLY_BUDGET_IDR,
};

const initialState = {
  deviceId: DEFAULT_DEVICE_ID,
  settings: DEFAULT_SETTINGS,
  status: "idle" as LoadStatus,
  error: null,
};

export const useSettingsStore = create<SettingsState>()((set) => ({
  ...initialState,
  setDeviceId: (deviceId) => set({ deviceId }),
  setSettings: (settings) => set({ settings, status: "ready", error: null }),
  setStatus: (status) => set({ status }),
  setError: (error) => set({ error, status: "error" }),
  reset: () => set(initialState),
}));

export const selectDeviceId = (state: SettingsState) => state.deviceId;
export const selectUserSettings = (state: SettingsState) => state.settings;
export const selectSettingsStatus = (state: SettingsState) => state.status;
export const selectSettingsError = (state: SettingsState) => state.error;
