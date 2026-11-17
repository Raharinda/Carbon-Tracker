import { getDeviceRepository } from "@/features/device";

export async function sendRelayCommand(deviceId: string, isOn: boolean): Promise<void> {
  await getDeviceRepository().setRelay(deviceId, isOn);
}
