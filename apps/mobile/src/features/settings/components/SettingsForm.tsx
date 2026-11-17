import { View } from "react-native";

import { Button, Card, Input, Text } from "@/shared/components";

import type { SettingsDraft, SettingsErrors, SettingsField } from "../types";

type SettingsFormProps = {
  deviceIdInput: string;
  onDeviceIdChange: (value: string) => void;
  draft: SettingsDraft;
  onFieldChange: (field: SettingsField, value: string) => void;
  errors: SettingsErrors;
  isSaving: boolean;
  savedAt: number | null;
  onSubmit: () => void;
};

export function SettingsForm({
  deviceIdInput,
  onDeviceIdChange,
  draft,
  onFieldChange,
  errors,
  isSaving,
  savedAt,
  onSubmit,
}: SettingsFormProps) {
  return (
    <View className="gap-4">
      <Card className="gap-4">
        <View className="gap-1">
          <Text variant="title">Device</Text>
          <Text variant="caption">The Firebase device key published by your ESP32.</Text>
        </View>
        <Input
          label="Device ID"
          value={deviceIdInput}
          onChangeText={onDeviceIdChange}
          autoCapitalize="none"
          autoCorrect={false}
          error={errors.deviceId}
        />
      </Card>

      <Card className="gap-4">
        <View className="gap-1">
          <Text variant="title">Pricing</Text>
          <Text variant="caption">Used to estimate cost and carbon from energy readings.</Text>
        </View>
        <Input
          label="Electricity tariff (Rp/kWh)"
          value={draft.tariffPerKwh}
          onChangeText={(value) => onFieldChange("tariffPerKwh", value)}
          keyboardType="decimal-pad"
          error={errors.tariffPerKwh}
        />
        <Input
          label="Emission factor (kg CO₂e/kWh)"
          value={draft.emissionFactorKgPerKwh}
          onChangeText={(value) => onFieldChange("emissionFactorKgPerKwh", value)}
          keyboardType="decimal-pad"
          error={errors.emissionFactorKgPerKwh}
        />
        <Input
          label="Monthly budget (Rp)"
          value={draft.monthlyBudgetIdr}
          onChangeText={(value) => onFieldChange("monthlyBudgetIdr", value)}
          keyboardType="number-pad"
          error={errors.monthlyBudgetIdr}
        />
      </Card>

      <Button label="Save settings" onPress={onSubmit} loading={isSaving} />

      {savedAt !== null ? (
        <Text variant="caption" tone="accent" className="text-center">
          Settings saved.
        </Text>
      ) : null}
    </View>
  );
}
