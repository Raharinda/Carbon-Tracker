import type { DailyUsage } from "@/features/device";

import {
  buildUsageWindow,
  calculateCost,
  estimateMonthlyCost,
  findTodayEnergy,
  projectMonthlyCost,
  sumCost,
  sumEnergy,
} from "./energy";

const usage: DailyUsage[] = [
  { date: "2026-11-16", energyKwh: 2 },
  { date: "2026-11-17", energyKwh: 1.5 },
];

describe("calculateCost", () => {
  it("multiplies energy by the tariff", () => {
    expect(calculateCost(2, 1444.7)).toBeCloseTo(2889.4, 5);
  });

  it("treats negative or invalid input as zero", () => {
    expect(calculateCost(-5, 1000)).toBe(0);
    expect(calculateCost(1, Number.NaN)).toBe(0);
  });
});

describe("estimateMonthlyCost", () => {
  it("extrapolates constant power to 30 days", () => {
    expect(estimateMonthlyCost(100, 1000)).toBeCloseTo(72000, 5);
  });

  it("ignores invalid power", () => {
    expect(estimateMonthlyCost(Number.NaN, 1000)).toBe(0);
  });
});

describe("projectMonthlyCost", () => {
  it("scales the month-to-date cost to a full month", () => {
    expect(projectMonthlyCost(50000, 10)).toBeCloseTo(150000, 5);
  });

  it("never divides by zero", () => {
    expect(projectMonthlyCost(30000, 0)).toBe(900000);
  });
});

describe("buildUsageWindow", () => {
  it("fills missing days with zero and flags today", () => {
    const window = buildUsageWindow(usage, "2026-11-17", 3, 1000);

    expect(window.map((point) => point.date)).toEqual(["2026-11-15", "2026-11-16", "2026-11-17"]);
    expect(window[0].energyKwh).toBe(0);
    expect(window[1]).toMatchObject({ energyKwh: 2, cost: 2000, isToday: false });
    expect(window[2]).toMatchObject({ energyKwh: 1.5, cost: 1500, isToday: true });
  });
});

describe("aggregations", () => {
  it("sums energy and cost", () => {
    const window = buildUsageWindow(usage, "2026-11-17", 3, 1000);

    expect(sumEnergy(window)).toBeCloseTo(3.5, 5);
    expect(sumCost(window)).toBeCloseTo(3500, 5);
  });

  it("reads today's energy from the history", () => {
    expect(findTodayEnergy(usage, "2026-11-17")).toBe(1.5);
    expect(findTodayEnergy(usage, "2026-11-01")).toBe(0);
  });
});
