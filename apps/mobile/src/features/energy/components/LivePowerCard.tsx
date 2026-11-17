import { View } from "react-native";

import { Card, RadialGauge, Text } from "@/shared/components";
import { PowerIcon } from "@/shared/components/icons";
import { formatPower } from "@/shared/lib/formatters";
import { colors } from "@/shared/theme";

type LivePowerCardProps = {
  powerWatts: number;
  isLive: boolean;
  relayOn: boolean;
};

const GAUGE_CEILING_WATTS = 1000;
const GAUGE_SIZE = 220;

export function LivePowerCard({ powerWatts, isLive, relayOn }: LivePowerCardProps) {
  const progress = Math.min(1, Math.max(0, powerWatts / GAUGE_CEILING_WATTS));

  return (
    <Card className="items-center gap-5 py-6">
      <View className="flex-row items-center gap-2">
        <View className={`h-2 w-2 rounded-full ${isLive ? "bg-accent" : "bg-warning"}`} />
        <Text variant="caption" className="font-inter-medium tracking-wide">
          {isLive ? "LIVE POWER" : "WAITING FOR DEVICE"}
        </Text>
      </View>

      <RadialGauge progress={progress} size={GAUGE_SIZE}>
        <View className="items-center gap-2">
          <PowerIcon size={28} color={colors.accent.DEFAULT} />
          <Text variant="heading">{formatPower(powerWatts)}</Text>
          <Text variant="caption" tone={relayOn ? "accent" : "muted"}>
            {relayOn ? "Relay on" : "Relay off"}
          </Text>
        </View>
      </RadialGauge>

      <Text variant="caption" className="px-6 text-center">
        Estimated from the most recent PZEM-004T reading.
      </Text>
    </Card>
  );
}
