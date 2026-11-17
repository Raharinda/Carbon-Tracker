import { View } from "react-native";

import { Text } from "./Text";

type BadgeTone = "accent" | "muted" | "danger" | "warning";

const toneClasses: Record<BadgeTone, string> = {
  accent: "bg-accent-soft",
  muted: "bg-surfaceMuted",
  danger: "bg-dangerSoft",
  warning: "bg-warningSoft",
};

const textTones: Record<BadgeTone, "accent" | "muted" | "danger" | "default"> = {
  accent: "accent",
  muted: "muted",
  danger: "danger",
  warning: "default",
};

type BadgeProps = {
  label: string;
  tone?: BadgeTone;
};

export function Badge({ label, tone = "accent" }: BadgeProps) {
  return (
    <View className={`rounded-full px-3 py-1 ${toneClasses[tone]}`}>
      <Text variant="caption" tone={textTones[tone]} className="font-inter-medium">
        {label}
      </Text>
    </View>
  );
}
