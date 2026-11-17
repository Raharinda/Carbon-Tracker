import { TextInput, TextInputProps, View } from "react-native";

import { colors } from "@/shared/theme";

import { Text } from "./Text";

type InputProps = TextInputProps & {
  label: string;
  hint?: string;
  error?: string;
};

export function Input({ label, hint, error, className, ...props }: InputProps) {
  return (
    <View className="gap-2">
      <Text variant="label">{label}</Text>
      <TextInput
        className={`rounded-md border bg-surface px-4 py-3 font-inter text-body text-ink ${
          error ? "border-danger" : "border-line"
        } ${className ?? ""}`}
        placeholderTextColor={colors.ink.faint}
        {...props}
      />
      {error ? (
        <Text variant="caption" tone="danger">
          {error}
        </Text>
      ) : hint ? (
        <Text variant="caption">{hint}</Text>
      ) : null}
    </View>
  );
}
