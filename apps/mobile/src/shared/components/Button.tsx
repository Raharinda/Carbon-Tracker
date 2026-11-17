import { ActivityIndicator, Pressable, PressableProps } from "react-native";

import { colors } from "@/shared/theme";

import { Text } from "./Text";

type ButtonVariant = "primary" | "secondary" | "ghost" | "danger";

type ButtonProps = PressableProps & {
  label: string;
  variant?: ButtonVariant;
  loading?: boolean;
  compact?: boolean;
};

const containerClasses: Record<ButtonVariant, string> = {
  primary: "bg-accent",
  secondary: "border border-line bg-surface",
  ghost: "bg-transparent",
  danger: "bg-dangerSoft",
};

const labelTones: Record<ButtonVariant, "inverse" | "default" | "accent" | "danger"> = {
  primary: "inverse",
  secondary: "default",
  ghost: "accent",
  danger: "danger",
};

export function Button({
  label,
  variant = "primary",
  loading = false,
  compact = false,
  disabled,
  className,
  ...props
}: ButtonProps) {
  const isDisabled = disabled === true || loading;

  return (
    <Pressable
      accessibilityRole="button"
      disabled={isDisabled}
      className={`flex-row items-center justify-center gap-2 rounded-lg ${containerClasses[variant]} ${
        compact ? "px-4 py-2" : "px-5 py-4"
      } ${isDisabled ? "opacity-50" : ""} ${className ?? ""}`}
      {...props}
    >
      {loading ? (
        <ActivityIndicator
          size="small"
          color={variant === "primary" ? colors.white : colors.accent.DEFAULT}
        />
      ) : null}
      <Text
        variant={compact ? "label" : "body"}
        tone={labelTones[variant]}
        className="font-inter-semibold"
      >
        {label}
      </Text>
    </Pressable>
  );
}
