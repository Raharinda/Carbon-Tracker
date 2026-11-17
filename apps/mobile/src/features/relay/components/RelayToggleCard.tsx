import { View } from "react-native";

import { Card, Text, Toggle } from "@/shared/components";

type RelayToggleCardProps = {
  isOn: boolean;
  pending: boolean;
  disabled?: boolean;
  onChange: (nextValue: boolean) => void;
};

export function RelayToggleCard({ isOn, pending, disabled, onChange }: RelayToggleCardProps) {
  return (
    <Card className="flex-row items-center justify-between gap-4">
      <View className="flex-1 gap-1">
        <Text variant="label">Relay control</Text>
        <Text variant="title">{isOn ? "On" : "Off"}</Text>
        <Text variant="caption">
          {pending ? "Sending command…" : isOn ? "Load is connected" : "Load is disconnected"}
        </Text>
      </View>
      <Toggle
        value={isOn}
        onValueChange={onChange}
        disabled={pending || disabled}
        accessibilityLabel="Toggle relay"
      />
    </Card>
  );
}
