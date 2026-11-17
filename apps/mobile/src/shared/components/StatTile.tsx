import { ReactNode } from "react";
import { View } from "react-native";

import { Text } from "./Text";

type StatTileProps = {
  label: string;
  value: string;
  hint?: string;
  icon?: ReactNode;
};

export function StatTile({ label, value, hint, icon }: StatTileProps) {
  return (
    <View className="flex-1 gap-2 rounded-lg border border-line bg-surface p-4">
      <View className="flex-row items-center justify-between">
        <Text variant="caption">{label}</Text>
        {icon}
      </View>
      <Text variant="title" className="font-inter-bold">
        {value}
      </Text>
      {hint ? <Text variant="caption">{hint}</Text> : null}
    </View>
  );
}
