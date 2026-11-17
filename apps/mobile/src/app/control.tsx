import { View } from "react-native";

import { useDeviceStatus } from "@/features/device";
import { EnergyMetricsGrid } from "@/features/energy";
import { RelayStatusPill, RelayToggleCard, useRelayControl } from "@/features/relay";
import { useDeviceId } from "@/features/settings";
import { Badge, Card, LoadingState, Screen, ScreenHeader, Text } from "@/shared/components";
import { useRequireAuth } from "@/shared/hooks/useRequireAuth";
import { formatClock } from "@/shared/lib/formatters";

export default function DeviceControlScreen() {
  const { isReady } = useRequireAuth();
  const deviceId = useDeviceId();
  const { isLive, relayOn, reading, snapshot } = useDeviceStatus();
  const { isOn, pending, error, toggleRelay } = useRelayControl(deviceId);

  if (!isReady) {
    return (
      <Screen>
        <LoadingState label="Loading device…" />
      </Screen>
    );
  }

  return (
    <Screen>
      <ScreenHeader title="Device control" subtitle={deviceId} />

      <Card className="gap-3">
        <View className="flex-row items-center justify-between">
          <Text variant="label">Connection</Text>
          <Badge label={isLive ? "Online" : "Offline"} tone={isLive ? "accent" : "warning"} />
        </View>
        <View className="flex-row items-center justify-between">
          <Text variant="caption">Relay state</Text>
          <RelayStatusPill isOn={relayOn} isLive={isLive} />
        </View>
        <View className="flex-row items-center justify-between">
          <Text variant="caption">Last reading</Text>
          <Text variant="caption">
            {snapshot?.reading ? formatClock(snapshot.reading.recordedAt) : "—"}
          </Text>
        </View>
      </Card>

      <RelayToggleCard
        isOn={isOn}
        pending={pending}
        onChange={(nextValue) => void toggleRelay(nextValue)}
      />

      {error ? (
        <Text variant="caption" tone="danger">
          {error}
        </Text>
      ) : null}

      <EnergyMetricsGrid reading={reading} />

      <Card className="gap-2">
        <Text variant="label">About this device</Text>
        <Text variant="caption">
          Readings come from an ESP32 with a PZEM-004T sensor. Relay commands are queued for the
          device and confirmed when the next snapshot arrives.
        </Text>
      </Card>
    </Screen>
  );
}
