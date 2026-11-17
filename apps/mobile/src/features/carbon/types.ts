export type CarbonPeriod = "week" | "month";

export type CarbonPoint = {
  date: string;
  label: string;
  carbonKg: number;
  isToday: boolean;
};

export type CarbonSummary = {
  period: CarbonPeriod;
  todayKg: number;
  weekKg: number;
  monthKg: number;
  savedPercent: number | null;
  series: CarbonPoint[];
};
