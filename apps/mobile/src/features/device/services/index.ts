import { DEVICE_SOURCE } from "@/shared/lib/constants";

import type { DeviceRepository } from "./deviceRepository";
import { FirebaseDeviceRepository } from "./firebaseDeviceRepository";
import { MockDeviceRepository } from "./mockDeviceRepository";

let repository: DeviceRepository | null = null;

export function getDeviceRepository(): DeviceRepository {
  if (repository === null) {
    repository =
      DEVICE_SOURCE === "firebase" ? new FirebaseDeviceRepository() : new MockDeviceRepository();
  }
  return repository;
}

export type { DeviceRepository };
