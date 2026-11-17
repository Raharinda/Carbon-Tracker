import { router } from "expo-router";
import { ReactNode } from "react";
import { Pressable, View } from "react-native";

import { ChevronLeftIcon } from "./icons";
import { Text } from "./Text";

type ScreenHeaderProps = {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  showBack?: boolean;
};

export function ScreenHeader({ title, subtitle, action, showBack = true }: ScreenHeaderProps) {
  return (
    <View className="flex-row items-start gap-3">
      {showBack ? (
        <Pressable
          accessibilityRole="button"
          accessibilityLabel="Go back"
          onPress={() => router.back()}
          className="mt-1 rounded-full border border-line bg-surface p-2"
        >
          <ChevronLeftIcon />
        </Pressable>
      ) : null}
      <View className="flex-1 gap-1">
        <Text variant="title">{title}</Text>
        {subtitle ? <Text variant="caption">{subtitle}</Text> : null}
      </View>
      {action}
    </View>
  );
}
