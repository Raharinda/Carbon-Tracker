import { create } from "zustand";

import type { CarbonPeriod } from "../types";

type CarbonState = {
  period: CarbonPeriod;
  setPeriod: (period: CarbonPeriod) => void;
};

export const useCarbonStore = create<CarbonState>()((set) => ({
  period: "week",
  setPeriod: (period) => set({ period }),
}));

export const selectCarbonPeriod = (state: CarbonState) => state.period;
