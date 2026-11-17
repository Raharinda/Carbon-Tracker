import { View } from "react-native";

import { Button } from "./Button";
import { Text } from "./Text";

type ErrorBannerProps = {
  message: string;
  onRetry?: () => void;
};

export function ErrorBanner({ message, onRetry }: ErrorBannerProps) {
  return (
    <View className="gap-3 rounded-lg border border-danger bg-dangerSoft p-4">
      <Text variant="label" tone="danger">
        {message}
      </Text>
      {onRetry ? <Button label="Try again" variant="secondary" compact onPress={onRetry} /> : null}
    </View>
  );
}

type EmptyStateProps = {
  title: string;
  description: string;
};

export function EmptyState({ title, description }: EmptyStateProps) {
  return (
    <View className="items-center gap-2 rounded-xl border border-dashed border-line bg-surface p-6">
      <Text variant="label">{title}</Text>
      <Text variant="caption" className="text-center">
        {description}
      </Text>
    </View>
  );
}

export function LoadingState({ label }: { label: string }) {
  return (
    <View className="items-center gap-2 p-6">
      <Text variant="caption">{label}</Text>
    </View>
  );
}
