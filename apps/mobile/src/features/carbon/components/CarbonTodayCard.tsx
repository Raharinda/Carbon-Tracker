import { View } from "react-native";

import { Badge, Card, Text } from "@/shared/components";
import { formatCarbon, formatPercent } from "@/shared/lib/formatters";

type CarbonTodayCardProps = {
  todayKg: number;
  weekKg: number;
  savedPercent: number | null;
};

export function CarbonTodayCard({ todayKg, weekKg, savedPercent }: CarbonTodayCardProps) {
  const hasComparison = savedPercent !== null;

  return (
    <Card className="gap-3">
      <Text variant="label">CO₂ today</Text>
      <Text variant="display">{formatCarbon(todayKg)}</Text>
      <View className="flex-row items-center justify-between gap-3">
        <Text variant="caption">This week {formatCarbon(weekKg)}</Text>
        <Badge
          label={hasComparison ? `${formatPercent(savedPercent)} vs last week` : "No baseline"}
          tone={hasComparison && savedPercent >= 0 ? "accent" : "warning"}
        />
      </View>
      {hasComparison ? null : (
        <Text variant="caption">A full week of history is needed to compare.</Text>
      )}
    </Card>
  );
}
