import { View } from "react-native";

import { Card, Text } from "@/shared/components";
import { formatCarbon, formatEnergy, formatNumber } from "@/shared/lib/formatters";

type CarbonHighlightCardProps = {
  monthKg: number;
  monthKwh: number;
  emissionFactorKgPerKwh: number;
};

export function CarbonHighlightCard({
  monthKg,
  monthKwh,
  emissionFactorKgPerKwh,
}: CarbonHighlightCardProps) {
  return (
    <Card className="gap-3">
      <Text variant="label">This month</Text>
      <View className="flex-row items-end justify-between">
        <Text variant="heading">{formatCarbon(monthKg)}</Text>
        <Text variant="caption">{formatEnergy(monthKwh)}</Text>
      </View>
      <Text variant="caption">
        Using {formatNumber(emissionFactorKgPerKwh, 2)} kg CO₂e per kWh from Settings.
      </Text>
    </Card>
  );
}
