import { router } from "expo-router";
import { Pressable, View } from "react-native";

import { CarbonTodayCard, useCarbonSummary } from "@/features/carbon";
import { useDeviceStatus } from "@/features/device";
import {
  CostSummaryCard,
  LivePowerCard,
  useEnergySummary,
  WeeklyEnergyCard,
} from "@/features/energy";
import { RelayStatusPill, RelayToggleCard, useRelayControl } from "@/features/relay";
import { DemoModeNotice, useDeviceId, useUserSettings } from "@/features/settings";
import { Button, LoadingState, Screen, Text } from "@/shared/components";
import { LeafIcon, SettingsIcon } from "@/shared/components/icons";
import { useRequireAuth } from "@/shared/hooks/useRequireAuth";
import { IS_DEMO_MODE } from "@/shared/lib/constants";
import { colors } from "@/shared/theme";

export default function HomeScreen() {
  const { isReady } = useRequireAuth();
  const deviceId = useDeviceId();
  const settings = useUserSettings();
  const { isLive, relayOn } = useDeviceStatus();
  const energy = useEnergySummary();
  const carbon = useCarbonSummary();
  const { isOn, pending, toggleRelay } = useRelayControl(deviceId);

  if (!isReady) {
    return (
      <Screen>
        <LoadingState label="Loading your dashboard…" />
      </Screen>
    );
  }

  return (
    <Screen>
      <View className="flex-row items-center justify-between">
        <View className="flex-row items-center gap-3">
          <View className="h-10 w-10 items-center justify-center rounded-lg bg-accent">
            <LeafIcon size={22} color={colors.white} />
          </View>
          <View>
            <Text variant="title">Carbon Tracker</Text>
            <Text variant="caption">{deviceId}</Text>
          </View>
        </View>
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Open settings"
          onPress={() => router.push("/settings")}
          className="rounded-full border border-line bg-surface p-2"
        >
          <SettingsIcon />
        </Pressable>
      </View>

      <View className="gap-3">
        <RelayStatusPill isOn={isOn} isLive={isLive} />
        <Text variant="heading">Understand the{"\n"}energy you use.</Text>
        <Text variant="body" tone="muted">
          Monitor your device, control the relay, and see the carbon you can avoid.
        </Text>
      </View>

      <LivePowerCard powerWatts={energy.livePowerWatts} isLive={isLive} relayOn={relayOn} />
      <CostSummaryCard
        todayCost={energy.todayCost}
        todayKwh={energy.todayKwh}
        projectedMonthlyCost={energy.projectedMonthlyCost}
        monthlyBudgetIdr={settings.monthlyBudgetIdr}
      />
      <CarbonTodayCard
        todayKg={carbon.todayKg}
        weekKg={carbon.weekKg}
        savedPercent={carbon.savedPercent}
      />
      <RelayToggleCard
        isOn={isOn}
        pending={pending}
        onChange={(nextValue) => void toggleRelay(nextValue)}
      />
      <WeeklyEnergyCard
        weekly={energy.weekly}
        weekKwh={energy.weekKwh}
        weekCost={energy.weekCost}
      />

      <View className="flex-row gap-3">
        <Button
          label="Device control"
          variant="secondary"
          className="flex-1"
          onPress={() => router.push("/control")}
        />
        <Button
          label="Carbon detail"
          variant="secondary"
          className="flex-1"
          onPress={() => router.push("/carbon")}
        />
      </View>

      {IS_DEMO_MODE ? <DemoModeNotice /> : null}
    </Screen>
  );
}
