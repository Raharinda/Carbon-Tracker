import { Pressable, View } from "react-native";

import { Card, SectionHeader, Text } from "@/shared/components";
import { BarChart } from "@/shared/components/charts";
import { formatCarbon } from "@/shared/lib/formatters";

import type { CarbonPeriod, CarbonPoint } from "../types";
import { sumCarbon } from "../utils/carbon";

type CarbonChartCardProps = {
  series: CarbonPoint[];
  period: CarbonPeriod;
  onPeriodChange: (period: CarbonPeriod) => void;
};

const PERIOD_OPTIONS: { value: CarbonPeriod; label: string }[] = [
  { value: "week", label: "7 days" },
  { value: "month", label: "30 days" },
];

export function CarbonChartCard({ series, period, onPeriodChange }: CarbonChartCardProps) {
  const chartData = series.map((point, index) => ({
    label: period === "week" ? point.label.slice(3) : index % 5 === 0 ? point.label.slice(3) : "",
    value: point.carbonKg,
    highlighted: point.isToday,
  }));

  return (
    <Card className="gap-4">
      <SectionHeader
        title="Carbon emissions"
        subtitle={`${formatCarbon(sumCarbon(series))} in the selected period`}
      />
      <View className="flex-row gap-2">
        {PERIOD_OPTIONS.map((option) => {
          const isSelected = option.value === period;
          return (
            <Pressable
              key={option.value}
              accessibilityRole="button"
              accessibilityState={{ selected: isSelected }}
              onPress={() => onPeriodChange(option.value)}
              className={`rounded-full px-4 py-2 ${isSelected ? "bg-accent" : "bg-surfaceMuted"}`}
            >
              <Text
                variant="caption"
                tone={isSelected ? "inverse" : "muted"}
                className="font-inter-medium"
              >
                {option.label}
              </Text>
            </Pressable>
          );
        })}
      </View>
      <BarChart data={chartData} emptyLabel="Emissions history will appear here." />
      <Text variant="caption">Estimated using the emission factor in Settings.</Text>
    </Card>
  );
}
