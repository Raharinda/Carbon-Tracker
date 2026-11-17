import { Badge } from "@/shared/components";

type RelayStatusPillProps = {
  isOn: boolean;
  isLive: boolean;
};

export function RelayStatusPill({ isOn, isLive }: RelayStatusPillProps) {
  if (!isLive) return <Badge label="Offline" tone="warning" />;
  return <Badge label={isOn ? "Relay on" : "Relay off"} tone={isOn ? "accent" : "muted"} />;
}
