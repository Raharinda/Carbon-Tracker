import { Card, SectionHeader, Text } from "@/shared/components";
import { BarChart } from "@/shared/components/charts";
import { formatCurrency, formatDayNumber, formatEnergy } from "@/shared/lib/formatters";

import type { UsagePoint } from "../types";

type WeeklyEnergyCardProps = {
  weekly: UsagePoint[];
  weekKwh: number;
  weekCost: number;
};

export function WeeklyEnergyCard({ weekly, weekKwh, weekCost }: WeeklyEnergyCardProps) {
  const chartData = weekly.map((point) => ({
    label: formatDayNumber(point.date),
    value: point.energyKwh,
    highlighted: point.isToday,
  }));

  return (
    <Card className="gap-4">
      <SectionHeader
        title="This week"
        subtitle={`${formatEnergy(weekKwh)} · ${formatCurrency(weekCost)}`}
      />
      <BarChart data={chartData} emptyLabel="Usage history will appear here." />
      <Text variant="caption">Bars show estimated daily energy use in kWh.</Text>
    </Card>
  );
}
