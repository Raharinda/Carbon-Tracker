import { Switch } from "react-native";

import { colors } from "@/shared/theme";

type ToggleProps = {
  value: boolean;
  onValueChange: (nextValue: boolean) => void;
  disabled?: boolean;
  accessibilityLabel: string;
};

export function Toggle({ value, onValueChange, disabled, accessibilityLabel }: ToggleProps) {
  return (
    <Switch
      accessibilityLabel={accessibilityLabel}
      value={value}
      onValueChange={onValueChange}
      disabled={disabled}
      trackColor={{ false: colors.line, true: colors.accent.DEFAULT }}
      thumbColor={colors.white}
      ios_backgroundColor={colors.line}
    />
  );
}
