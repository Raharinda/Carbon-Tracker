import { View } from "react-native";

import type { DeviceReading } from "@/features/device";
import { StatTile } from "@/shared/components";
import { formatNumber } from "@/shared/lib/formatters";

type EnergyMetricsGridProps = {
  reading: DeviceReading | null;
};

export function EnergyMetricsGrid({ reading }: EnergyMetricsGridProps) {
  if (!reading) return null;

  return (
    <View className="flex-row flex-wrap gap-3">
      <View className="w-[47%]">
        <StatTile label="Voltage" value={`${formatNumber(reading.voltage, 0)} V`} />
      </View>
      <View className="w-[47%]">
        <StatTile label="Current" value={`${formatNumber(reading.current, 2)} A`} />
      </View>
      <View className="w-[47%]">
        <StatTile label="Power factor" value={formatNumber(reading.powerFactor, 2)} />
      </View>
      <View className="w-[47%]">
        <StatTile label="Frequency" value={`${formatNumber(reading.frequencyHz, 1)} Hz`} />
      </View>
    </View>
  );
}
