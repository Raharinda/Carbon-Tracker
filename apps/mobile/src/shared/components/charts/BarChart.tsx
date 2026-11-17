import { useState } from "react";
import { View } from "react-native";
import Svg, { Rect } from "react-native-svg";

import { Text } from "@/shared/components/Text";
import { colors, radii } from "@/shared/theme";

export type BarChartDatum = {
  label: string;
  value: number;
  highlighted?: boolean;
};

type BarChartProps = {
  data: BarChartDatum[];
  height?: number;
  emptyLabel?: string;
};

const DEFAULT_HEIGHT = 140;
const BAR_GAP = 10;
const MIN_BAR_HEIGHT = 4;

export function BarChart({
  data,
  height = DEFAULT_HEIGHT,
  emptyLabel = "No data yet",
}: BarChartProps) {
  const [width, setWidth] = useState(0);
  const maxValue = Math.max(...data.map((item) => item.value), 0);

  if (data.length === 0) {
    return <Text variant="caption">{emptyLabel}</Text>;
  }

  const barWidth = width > 0 ? (width - BAR_GAP * (data.length - 1)) / data.length : 0;
  const scaleHeight = (value: number) =>
    maxValue <= 0 ? MIN_BAR_HEIGHT : Math.max(MIN_BAR_HEIGHT, (value / maxValue) * (height - 8));

  return (
    <View className="gap-2">
      <View style={{ height }} onLayout={(event) => setWidth(event.nativeEvent.layout.width)}>
        {width > 0 ? (
          <Svg width={width} height={height}>
            {data.map((item, index) => {
              const barHeight = scaleHeight(item.value);
              const barColor = item.highlighted ? colors.accent.DEFAULT : colors.accent.soft;
              return (
                <Rect
                  key={`${item.label}-${index}`}
                  x={index * (barWidth + BAR_GAP)}
                  y={height - barHeight}
                  width={barWidth}
                  height={barHeight}
                  rx={Math.min(radii.sm, barWidth / 2)}
                  fill={barColor}
                />
              );
            })}
          </Svg>
        ) : null}
      </View>
      <View className="flex-row" style={{ gap: BAR_GAP }}>
        {data.map((item, index) => (
          <View
            key={`${item.label}-label-${index}`}
            style={{ width: barWidth || undefined }}
            className="flex-1 items-center"
          >
            <Text variant="caption" tone={item.highlighted ? "accent" : "muted"}>
              {item.label}
            </Text>
          </View>
        ))}
      </View>
    </View>
  );
}
