export type UsagePoint = {
  date: string;
  energyKwh: number;
  cost: number;
  isToday: boolean;
};

export type EnergySummary = {
  livePowerWatts: number;
  todayKwh: number;
  todayCost: number;
  monthKwh: number;
  monthCost: number;
  projectedMonthlyCost: number;
  weekly: UsagePoint[];
  weekKwh: number;
  weekCost: number;
};
