import { Text as NativeText, TextProps } from "react-native";

type TextVariant = "display" | "heading" | "title" | "body" | "label" | "caption";
type TextTone = "default" | "muted" | "accent" | "danger" | "inverse";

const variantClasses: Record<TextVariant, string> = {
  display: "font-inter-bold text-display",
  heading: "font-inter-bold text-heading",
  title: "font-inter-semibold text-title",
  body: "font-inter text-body",
  label: "font-inter-medium text-label",
  caption: "font-inter text-caption",
};

const toneClasses: Record<TextTone, string> = {
  default: "text-ink",
  muted: "text-ink-muted",
  accent: "text-accent",
  danger: "text-danger",
  inverse: "text-white",
};

export type AppTextProps = TextProps & {
  variant?: TextVariant;
  tone?: TextTone;
};

export function Text({ variant = "body", tone = "default", className, ...props }: AppTextProps) {
  return (
    <NativeText
      className={`${variantClasses[variant]} ${toneClasses[tone]} ${className ?? ""}`}
      {...props}
    />
  );
}
