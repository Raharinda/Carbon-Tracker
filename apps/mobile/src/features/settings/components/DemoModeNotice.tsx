import { Badge, Card, Text } from "@/shared/components";

export function DemoModeNotice() {
  return (
    <Card className="gap-2">
      <Badge label="Demo data" tone="muted" />
      <Text variant="caption">
        This build streams simulated readings. Set EXPO_PUBLIC_DEVICE_SOURCE=firebase to use your
        ESP32 and PZEM-004T hardware.
      </Text>
    </Card>
  );
}
