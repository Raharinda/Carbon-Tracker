import { onValue, ref, set, update } from "firebase/database";
import {
  collection,
  doc,
  limit,
  onSnapshot,
  orderBy,
  query,
  runTransaction,
} from "firebase/firestore";

import {
  DEFAULT_EMISSION_FACTOR_KG_PER_KWH,
  DEFAULT_MONTHLY_BUDGET_IDR,
  DEFAULT_TARIFF_PER_KWH,
} from "@/shared/lib/constants";
import { toDateKeyFromEpoch } from "@/shared/lib/dates";
import { database, firestore } from "@/shared/lib/firebase/client";
import { toFiniteNumber } from "@/shared/lib/numbers";

import type {
  DailyUsage,
  DeviceError,
  DevicePreferences,
  DeviceReading,
  DeviceSnapshot,
  Unsubscribe,
  UsageSample,
} from "../types";
import type { DeviceRepository } from "./deviceRepository";

function toDeviceError(reason: unknown): DeviceError {
  const message = reason instanceof Error ? reason.message : "Device data is unavailable.";
  const rawCode =
    typeof reason === "object" && reason !== null && "code" in reason
      ? String((reason as { code: unknown }).code)
      : "";
  if (rawCode.includes("permission-denied")) return { code: "permission", message };
  if (rawCode.includes("unavailable")) return { code: "unavailable", message };
  return { code: "unknown", message };
}

function parseReading(value: unknown): DeviceReading | null {
  if (typeof value !== "object" || value === null) return null;
  const data = value as Record<string, unknown>;
  const recordedAtSeconds = toFiniteNumber(data.ts, 0);
  return {
    voltage: toFiniteNumber(data.voltage),
    current: toFiniteNumber(data.current),
    powerWatts: toFiniteNumber(data.power),
    energyKilowattHours: toFiniteNumber(data.energy),
    frequencyHz: toFiniteNumber(data.frequency),
    powerFactor: toFiniteNumber(data.pf),
    recordedAt: recordedAtSeconds > 0 ? recordedAtSeconds * 1000 : Date.now(),
  };
}

function parsePreferences(value: unknown): DevicePreferences {
  if (typeof value !== "object" || value === null) {
    return {
      tariffPerKwh: DEFAULT_TARIFF_PER_KWH,
      emissionFactorKgPerKwh: DEFAULT_EMISSION_FACTOR_KG_PER_KWH,
      monthlyBudgetIdr: DEFAULT_MONTHLY_BUDGET_IDR,
    };
  }
  const data = value as Record<string, unknown>;
  return {
    tariffPerKwh: toFiniteNumber(data.tariff, DEFAULT_TARIFF_PER_KWH),
    emissionFactorKgPerKwh: toFiniteNumber(data.emissionFactor, DEFAULT_EMISSION_FACTOR_KG_PER_KWH),
    monthlyBudgetIdr: toFiniteNumber(data.monthlyBudget, DEFAULT_MONTHLY_BUDGET_IDR),
  };
}

export class FirebaseDeviceRepository implements DeviceRepository {
  readonly source = "firebase" as const;

  subscribeDevice(
    deviceId: string,
    onSnapshotValue: (snapshot: DeviceSnapshot) => void,
    onError: (error: DeviceError) => void,
  ): Unsubscribe {
    let reading: DeviceReading | null = null;
    let relayOn = false;

    const emit = () =>
      onSnapshotValue({
        deviceId,
        reading,
        relayOn,
        receivedAt: Date.now(),
      });

    const stopReadings = onValue(
      ref(database, `devices/${deviceId}/readings`),
      (snapshot) => {
        reading = parseReading(snapshot.val());
        emit();
      },
      (reason) => onError(toDeviceError(reason)),
    );

    const stopRelay = onValue(
      ref(database, `devices/${deviceId}/relay`),
      (snapshot) => {
        relayOn = snapshot.val() === true;
        emit();
      },
      (reason) => onError(toDeviceError(reason)),
    );

    return () => {
      stopReadings();
      stopRelay();
    };
  }

  subscribeDailyUsage(
    deviceId: string,
    onUsage: (usage: DailyUsage[]) => void,
    onError: (error: DeviceError) => void,
  ): Unsubscribe {
    const usageQuery = query(
      collection(firestore, "devices", deviceId, "dailyHistory"),
      orderBy("date", "desc"),
      limit(60),
    );
    return onSnapshot(
      usageQuery,
      (snapshot) => {
        const usage = snapshot.docs.map((entry) => {
          const data = entry.data();
          return {
            date: String(data.date ?? entry.id),
            energyKwh: toFiniteNumber(data.energy),
          };
        });
        onUsage(usage);
      },
      (reason) => onError(toDeviceError(reason)),
    );
  }

  subscribePreferences(
    deviceId: string,
    onPreferences: (preferences: DevicePreferences) => void,
    onError: (error: DeviceError) => void,
  ): Unsubscribe {
    return onValue(
      ref(database, `devices/${deviceId}/settings`),
      (snapshot) => onPreferences(parsePreferences(snapshot.val())),
      (reason) => onError(toDeviceError(reason)),
    );
  }

  async setRelay(deviceId: string, isOn: boolean): Promise<void> {
    await set(ref(database, `devices/${deviceId}/relay`), isOn);
  }

  async recordUsage(
    deviceId: string,
    sample: UsageSample,
    preferences: DevicePreferences,
  ): Promise<void> {
    const date = toDateKeyFromEpoch(sample.recordedAt);
    const usageRef = doc(firestore, "devices", deviceId, "dailyHistory", date);
    await runTransaction(firestore, async (transaction) => {
      const snapshot = await transaction.get(usageRef);
      const current = snapshot.data();
      const previousStart = toFiniteNumber(current?.startEnergy, sample.energyKilowattHours);
      const startEnergy = snapshot.exists() ? previousStart : sample.energyKilowattHours;
      const resetDetected = sample.energyKilowattHours < startEnergy;
      const nextStart = resetDetected ? sample.energyKilowattHours : startEnergy;
      const kilowattHours = resetDetected ? 0 : Math.max(0, sample.energyKilowattHours - nextStart);

      transaction.set(usageRef, {
        date,
        startEnergy: nextStart,
        endEnergy: sample.energyKilowattHours,
        energy: kilowattHours,
        cost: kilowattHours * preferences.tariffPerKwh,
        emission: kilowattHours * preferences.emissionFactorKgPerKwh,
        updatedAt: Math.floor(sample.recordedAt / 1000),
      });
    });
  }

  async savePreferences(deviceId: string, preferences: DevicePreferences): Promise<void> {
    await update(ref(database, `devices/${deviceId}/settings`), {
      tariff: preferences.tariffPerKwh,
      emissionFactor: preferences.emissionFactorKgPerKwh,
      monthlyBudget: preferences.monthlyBudgetIdr,
    });
  }
}
