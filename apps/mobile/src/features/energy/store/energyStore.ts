import { create } from "zustand";

import type { DailyUsage } from "@/features/device";
import type { LoadStatus } from "@/shared/types/common";

type EnergyState = {
  usage: DailyUsage[];
  status: LoadStatus;
  error: string | null;
  setUsage: (usage: DailyUsage[]) => void;
  setStatus: (status: LoadStatus) => void;
  setError: (message: string) => void;
  reset: () => void;
};

const initialState = {
  usage: [] as DailyUsage[],
  status: "idle" as LoadStatus,
  error: null,
};

export const useEnergyStore = create<EnergyState>()((set) => ({
  ...initialState,
  setUsage: (usage) => set({ usage, status: "ready", error: null }),
  setStatus: (status) => set({ status }),
  setError: (error) => set({ error, status: "error" }),
  reset: () => set(initialState),
}));

export const selectDailyUsage = (state: EnergyState) => state.usage;
export const selectEnergyStatus = (state: EnergyState) => state.status;
export const selectEnergyError = (state: EnergyState) => state.error;
