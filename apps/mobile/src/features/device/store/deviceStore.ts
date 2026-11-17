import { create } from "zustand";

import type { LoadStatus } from "@/shared/types/common";

import type { DeviceError, DeviceSnapshot } from "../types";

type DeviceState = {
  snapshot: DeviceSnapshot | null;
  status: LoadStatus;
  error: DeviceError | null;
  applySnapshot: (snapshot: DeviceSnapshot) => void;
  setStatus: (status: LoadStatus) => void;
  setError: (error: DeviceError) => void;
  reset: () => void;
};

const initialState = {
  snapshot: null,
  status: "idle" as LoadStatus,
  error: null,
};

export const useDeviceStore = create<DeviceState>()((set) => ({
  ...initialState,
  applySnapshot: (snapshot) => set({ snapshot, status: "ready", error: null }),
  setStatus: (status) => set({ status }),
  setError: (error) => set({ error, status: "error" }),
  reset: () => set(initialState),
}));

export const selectDeviceSnapshot = (state: DeviceState) => state.snapshot;
export const selectDeviceStatus = (state: DeviceState) => state.status;
export const selectDeviceError = (state: DeviceState) => state.error;
