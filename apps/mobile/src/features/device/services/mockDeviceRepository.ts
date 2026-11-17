import {
  DEFAULT_EMISSION_FACTOR_KG_PER_KWH,
  DEFAULT_MONTHLY_BUDGET_IDR,
  DEFAULT_TARIFF_PER_KWH,
} from "@/shared/lib/constants";
import { buildDateKeys, toDateKey } from "@/shared/lib/dates";

import type {
  DailyUsage,
  DevicePreferences,
  DeviceReading,
  DeviceSnapshot,
  Unsubscribe,
} from "../types";
import type { DeviceRepository } from "./deviceRepository";

type MockDeviceState = {
  relayOn: boolean;
  meterEnergyKwh: number;
  powerWatts: number;
  usageKwhByDate: Map<string, number>;
  preferences: DevicePreferences;
};

const TICK_INTERVAL_MS = 3_000;
const RELAY_LATENCY_MS = 400;
const BASE_POWER_WATTS = 186;
const MAINS_VOLTAGE = 230;
const MAINS_FREQUENCY_HZ = 50;
const POWER_FACTOR = 0.96;
const SEEDED_DAYS = 30;

function delay(milliseconds: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, milliseconds));
}

function pseudoRandom(seed: string): number {
  let hash = 0;
  for (let index = 0; index < seed.length; index += 1) {
    hash = (hash * 31 + seed.charCodeAt(index)) % 1_000_003;
  }
  return (hash % 1000) / 1000;
}

function seedUsage(todayKey: string): Map<string, number> {
  const keys = buildDateKeys(todayKey, SEEDED_DAYS);
  return new Map(
    keys.map((dateKey) => [
      dateKey,
      dateKey === todayKey ? 2.1 : Number((1.2 + pseudoRandom(dateKey) * 2.2).toFixed(2)),
    ]),
  );
}

function buildReading(state: MockDeviceState): DeviceReading {
  const powerWatts = state.relayOn ? state.powerWatts : 0;
  return {
    voltage: MAINS_VOLTAGE,
    current: powerWatts / MAINS_VOLTAGE,
    powerWatts,
    energyKilowattHours: state.meterEnergyKwh,
    frequencyHz: MAINS_FREQUENCY_HZ,
    powerFactor: POWER_FACTOR,
    recordedAt: Date.now(),
  };
}

export class MockDeviceRepository implements DeviceRepository {
  readonly source = "mock" as const;

  private states = new Map<string, MockDeviceState>();
  private deviceListeners = new Map<string, Set<(snapshot: DeviceSnapshot) => void>>();

  subscribeDevice(
    deviceId: string,
    onSnapshotValue: (snapshot: DeviceSnapshot) => void,
  ): Unsubscribe {
    const state = this.getState(deviceId);
    const emit = () =>
      onSnapshotValue({
        deviceId,
        reading: buildReading(state),
        relayOn: state.relayOn,
        receivedAt: Date.now(),
      });

    const listeners = this.deviceListeners.get(deviceId) ?? new Set();
    listeners.add(emit);
    this.deviceListeners.set(deviceId, listeners);
    emit();

    const timer = setInterval(() => {
      if (state.relayOn) this.advanceEnergy(deviceId, TICK_INTERVAL_MS);
      emit();
    }, TICK_INTERVAL_MS);

    return () => {
      clearInterval(timer);
      listeners.delete(emit);
    };
  }

  subscribeDailyUsage(deviceId: string, onUsage: (usage: DailyUsage[]) => void): Unsubscribe {
    const state = this.getState(deviceId);
    const emit = () =>
      onUsage(
        Array.from(state.usageKwhByDate.entries())
          .map(([date, energyKwh]) => ({ date, energyKwh }))
          .sort((left, right) => right.date.localeCompare(left.date)),
      );
    emit();
    const timer = setInterval(emit, TICK_INTERVAL_MS);
    return () => clearInterval(timer);
  }

  subscribePreferences(
    deviceId: string,
    onPreferences: (preferences: DevicePreferences) => void,
  ): Unsubscribe {
    const state = this.getState(deviceId);
    onPreferences(state.preferences);
    return () => undefined;
  }

  async setRelay(deviceId: string, isOn: boolean): Promise<void> {
    await delay(RELAY_LATENCY_MS);
    const state = this.getState(deviceId);
    state.relayOn = isOn;
    state.powerWatts = isOn ? BASE_POWER_WATTS : 0;
    this.deviceListeners.get(deviceId)?.forEach((emit) => emit(this.snapshot(deviceId)));
  }

  async recordUsage(): Promise<void> {
    // The mock already accumulates usage while ticking; nothing to persist.
  }

  async savePreferences(deviceId: string, preferences: DevicePreferences): Promise<void> {
    await delay(RELAY_LATENCY_MS / 2);
    this.getState(deviceId).preferences = preferences;
  }

  private getState(deviceId: string): MockDeviceState {
    const existing = this.states.get(deviceId);
    if (existing) return existing;

    const todayKey = toDateKey(new Date());
    const state: MockDeviceState = {
      relayOn: true,
      meterEnergyKwh: 128.4,
      powerWatts: BASE_POWER_WATTS,
      usageKwhByDate: seedUsage(todayKey),
      preferences: {
        tariffPerKwh: DEFAULT_TARIFF_PER_KWH,
        emissionFactorKgPerKwh: DEFAULT_EMISSION_FACTOR_KG_PER_KWH,
        monthlyBudgetIdr: DEFAULT_MONTHLY_BUDGET_IDR,
      },
    };
    this.states.set(deviceId, state);
    return state;
  }

  private snapshot(deviceId: string): DeviceSnapshot {
    const state = this.getState(deviceId);
    return {
      deviceId,
      reading: buildReading(state),
      relayOn: state.relayOn,
      receivedAt: Date.now(),
    };
  }

  private advanceEnergy(deviceId: string, elapsedMs: number): void {
    const state = this.getState(deviceId);
    const phase = Date.now() / 20_000;
    state.powerWatts = Math.round(BASE_POWER_WATTS + Math.sin(phase) * 34);
    const deltaKwh = (state.powerWatts / 1000) * (elapsedMs / 3_600_000);
    state.meterEnergyKwh += deltaKwh;
    const todayKey = toDateKey(new Date());
    const todayUsage = state.usageKwhByDate.get(todayKey) ?? 0;
    state.usageKwhByDate.set(todayKey, Number((todayUsage + deltaKwh).toFixed(4)));
  }
}
