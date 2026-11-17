import type { DevicePreferences, UsageSample } from "@/features/device";
import { getDeviceRepository } from "@/features/device";

export async function recordEnergyUsage(
  deviceId: string,
  sample: UsageSample,
  preferences: DevicePreferences,
): Promise<void> {
  const repository = getDeviceRepository();
  if (repository.source === "mock") return;
  await repository.recordUsage(deviceId, sample, preferences);
}
