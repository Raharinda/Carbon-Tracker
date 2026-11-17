import Svg, { Circle, Path, Rect } from "react-native-svg";

import { colors } from "@/shared/theme";

export type IconProps = {
  size?: number;
  color?: string;
};

const DEFAULT_SIZE = 20;
const STROKE_WIDTH = 1.8;

function iconStroke(color: string) {
  return {
    stroke: color,
    strokeWidth: STROKE_WIDTH,
    strokeLinecap: "round" as const,
    strokeLinejoin: "round" as const,
    fill: "none" as const,
  };
}

export function LeafIcon({ size = DEFAULT_SIZE, color = colors.accent.DEFAULT }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M20 4c0 8-5 12-12 12C8 8 13 4 20 4Z" {...iconStroke(color)} />
      <Path d="M4 20c3-4 6-6 10-8" {...iconStroke(color)} />
    </Svg>
  );
}

export function BoltIcon({ size = DEFAULT_SIZE, color = colors.accent.DEFAULT }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M13 2 4 14h6l-1 8 9-12h-6l1-8Z" {...iconStroke(color)} />
    </Svg>
  );
}

export function PowerIcon({ size = DEFAULT_SIZE, color = colors.accent.DEFAULT }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M12 3v9" {...iconStroke(color)} />
      <Path d="M6.5 6.5a8 8 0 1 0 11 0" {...iconStroke(color)} />
    </Svg>
  );
}

export function HomeIcon({ size = DEFAULT_SIZE, color = colors.accent.DEFAULT }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M4 11 12 4l8 7v9H4v-9Z" {...iconStroke(color)} />
    </Svg>
  );
}

export function ChartIcon({ size = DEFAULT_SIZE, color = colors.accent.DEFAULT }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M4 20V10M12 20V4M20 20v-7" {...iconStroke(color)} />
    </Svg>
  );
}

export function SettingsIcon({ size = DEFAULT_SIZE, color = colors.accent.DEFAULT }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M4 7h10M18 7h2M4 17h4M12 17h8" {...iconStroke(color)} />
      <Circle cx={16} cy={7} r={2} {...iconStroke(color)} />
      <Circle cx={10} cy={17} r={2} {...iconStroke(color)} />
    </Svg>
  );
}

export function WifiIcon({ size = DEFAULT_SIZE, color = colors.accent.DEFAULT }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M3 9a14 14 0 0 1 18 0" {...iconStroke(color)} />
      <Path d="M6.5 12.5a9 9 0 0 1 11 0" {...iconStroke(color)} />
      <Path d="M10 16a4 4 0 0 1 4 0" {...iconStroke(color)} />
      <Circle cx={12} cy={19} r={0.8} fill={color} />
    </Svg>
  );
}

export function LockIcon({ size = DEFAULT_SIZE, color = colors.accent.DEFAULT }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Rect x={5} y={10} width={14} height={10} rx={2} {...iconStroke(color)} />
      <Path d="M8 10V7a4 4 0 0 1 8 0v3" {...iconStroke(color)} />
    </Svg>
  );
}

export function ChevronLeftIcon({ size = DEFAULT_SIZE, color = colors.ink.DEFAULT }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M15 5 8 12l7 7" {...iconStroke(color)} />
    </Svg>
  );
}

export function ArrowRightIcon({ size = DEFAULT_SIZE, color = colors.white }: IconProps) {
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      <Path d="M5 12h14M13 6l6 6-6 6" {...iconStroke(color)} />
    </Svg>
  );
}
