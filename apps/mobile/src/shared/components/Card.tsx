import { PropsWithChildren } from "react";
import { View, ViewProps } from "react-native";

type CardProps = PropsWithChildren<ViewProps & { padded?: boolean }>;

export function Card({ children, padded = true, className, ...props }: CardProps) {
  return (
    <View
      className={`rounded-xl border border-line bg-surface ${padded ? "p-4" : ""} ${className ?? ""}`}
      {...props}
    >
      {children}
    </View>
  );
}
