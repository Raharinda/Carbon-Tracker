import { useRelayStore } from "./relayStore";

describe("relayStore", () => {
  beforeEach(() => useRelayStore.getState().reset());

  it("applies an optimistic update and keeps the previous state available", () => {
    useRelayStore.getState().confirm(false);
    useRelayStore.getState().setOptimistic(true);

    expect(useRelayStore.getState()).toMatchObject({ isOn: true, pending: true, error: null });
  });

  it("rolls back to the previous state and surfaces an error", () => {
    const store = useRelayStore.getState();
    store.confirm(true);
    store.setOptimistic(false);
    store.rollback(true);

    const state = useRelayStore.getState();
    expect(state.isOn).toBe(true);
    expect(state.pending).toBe(false);
    expect(state.error).not.toBeNull();
  });

  it("confirms the pending state", () => {
    useRelayStore.getState().setOptimistic(true);
    useRelayStore.getState().confirm(true);

    expect(useRelayStore.getState()).toMatchObject({ isOn: true, pending: false, error: null });
  });

  it("resets to the initial state", () => {
    useRelayStore.getState().setOptimistic(true);
    useRelayStore.getState().reset();

    expect(useRelayStore.getState()).toMatchObject({ isOn: false, pending: false, error: null });
  });
});
