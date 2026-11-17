import { View } from "react-native";

import { Card, StatTile, Text } from "@/shared/components";
import { formatCurrency, formatEnergy } from "@/shared/lib/formatters";

type CostSummaryCardProps = {
  todayCost: number;
  todayKwh: number;
  projectedMonthlyCost: number;
  monthlyBudgetIdr: number;
};

export function CostSummaryCard({
  todayCost,
  todayKwh,
  projectedMonthlyCost,
  monthlyBudgetIdr,
}: CostSummaryCardProps) {
  const budgetUsage =
    monthlyBudgetIdr > 0 ? Math.min(1, projectedMonthlyCost / monthlyBudgetIdr) : 0;

  return (
    <Card className="gap-4">
      <View className="flex-row items-center justify-between">
        <Text variant="label">Today&apos;s estimate</Text>
        <Text variant="caption">{formatEnergy(todayKwh)}</Text>
      </View>
      <Text variant="display">{formatCurrency(todayCost)}</Text>

      <View className="flex-row gap-3">
        <StatTile
          label="Projected month"
          value={formatCurrency(projectedMonthlyCost)}
          hint={`Budget ${formatCurrency(monthlyBudgetIdr)}`}
        />
      </View>

      <View className="gap-2">
        <View className="h-2 overflow-hidden rounded-full bg-surfaceMuted">
          <View
            className={`h-full rounded-full ${budgetUsage >= 1 ? "bg-danger" : "bg-accent"}`}
            style={{ width: `${Math.round(budgetUsage * 100)}%` }}
          />
        </View>
        <Text variant="caption">
          {monthlyBudgetIdr > 0
            ? `${Math.round(budgetUsage * 100)}% of the monthly budget projected`
            : "Set a monthly budget in Settings"}
        </Text>
      </View>
    </Card>
  );
}
