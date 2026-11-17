import { View } from "react-native";

import { useDeviceStatus } from "@/features/device";
import { DemoModeNotice, SettingsForm, useDeviceId, useSettingsForm } from "@/features/settings";
import { Badge, Button, LoadingState, Screen, ScreenHeader, Text } from "@/shared/components";
import { useRequireAuth } from "@/shared/hooks/useRequireAuth";
import { useAuth } from "@/shared/lib/auth";
import { IS_DEMO_MODE } from "@/shared/lib/constants";

export default function SettingsScreen() {
  const { isReady } = useRequireAuth();
  const { signOutUser } = useAuth();
  const deviceId = useDeviceId();
  const { isLive } = useDeviceStatus();
  const form = useSettingsForm();

  if (!isReady) {
    return (
      <Screen>
        <LoadingState label="Loading settings…" />
      </Screen>
    );
  }

  return (
    <Screen>
      <ScreenHeader title="Settings" subtitle="Tariff, emissions, and device pairing" />

      <View className="flex-row items-center justify-between">
        <Text variant="caption">{deviceId}</Text>
        <Badge label={isLive ? "Online" : "Offline"} tone={isLive ? "accent" : "warning"} />
      </View>

      {IS_DEMO_MODE ? <DemoModeNotice /> : null}

      <SettingsForm
        deviceIdInput={form.deviceIdInput}
        onDeviceIdChange={form.setDeviceIdInput}
        draft={form.draft}
        onFieldChange={form.updateField}
        errors={form.errors}
        isSaving={form.isSaving}
        savedAt={form.savedAt}
        onSubmit={() => void form.submit()}
      />

      <Button label="Sign out" variant="ghost" onPress={() => void signOutUser()} />
    </Screen>
  );
}
