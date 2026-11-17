import { create } from "zustand";

type RelayState = {
  isOn: boolean;
  pending: boolean;
  error: string | null;
  setOptimistic: (isOn: boolean) => void;
  confirm: (isOn: boolean) => void;
  rollback: (isOn: boolean) => void;
  setError: (message: string) => void;
  reset: () => void;
};

const initialState = {
  isOn: false,
  pending: false,
  error: null,
};

export const useRelayStore = create<RelayState>()((set) => ({
  ...initialState,
  setOptimistic: (isOn) => set({ isOn, pending: true, error: null }),
  confirm: (isOn) => set({ isOn, pending: false }),
  rollback: (isOn) =>
    set({ isOn, pending: false, error: "Relay command failed. Previous state restored." }),
  setError: (error) => set({ error, pending: false }),
  reset: () => set(initialState),
}));

export const selectRelayIsOn = (state: RelayState) => state.isOn;
export const selectRelayPending = (state: RelayState) => state.pending;
export const selectRelayError = (state: RelayState) => state.error;
