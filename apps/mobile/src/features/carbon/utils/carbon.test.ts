import type { DailyUsage } from "@/features/device";

import {
  buildCarbonWindow,
  calculateCarbon,
  calculateSavedPercent,
  previousWindowRange,
  sumCarbon,
  sumCarbonForDateRange,
} from "./carbon";

const usage: DailyUsage[] = [
  { date: "2026-11-10", energyKwh: 4 },
  { date: "2026-11-17", energyKwh: 2 },
];

describe("calculateCarbon", () => {
  it("multiplies energy by the emission factor", () => {
    expect(calculateCarbon(2, 0.87)).toBeCloseTo(1.74, 5);
  });

  it("treats negative or invalid input as zero", () => {
    expect(calculateCarbon(-2, 0.87)).toBe(0);
    expect(calculateCarbon(2, Number.NaN)).toBe(0);
  });
});

describe("buildCarbonWindow", () => {
  it("maps daily energy to carbon and flags today", () => {
    const window = buildCarbonWindow(usage, "2026-11-17", 2, 0.5);

    expect(window).toHaveLength(2);
    expect(window[0]).toMatchObject({ date: "2026-11-16", carbonKg: 0, isToday: false });
    expect(window[1]).toMatchObject({ date: "2026-11-17", carbonKg: 1, isToday: true });
  });
});

describe("sumCarbonForDateRange", () => {
  it("only includes dates inside the range", () => {
    expect(sumCarbonForDateRange(usage, "2026-11-10", "2026-11-10", 0.5)).toBeCloseTo(2, 5);
    expect(sumCarbonForDateRange(usage, "2026-11-11", "2026-11-16", 0.5)).toBe(0);
  });

  it("accepts reversed boundaries", () => {
    expect(sumCarbonForDateRange(usage, "2026-11-17", "2026-11-10", 0.5)).toBeCloseTo(3, 5);
  });

  it("sums a window of points", () => {
    const window = buildCarbonWindow(usage, "2026-11-17", 8, 0.5);
    expect(sumCarbon(window)).toBeCloseTo(3, 5);
  });
});

describe("calculateSavedPercent", () => {
  it("reports a positive saving when emissions fall", () => {
    expect(calculateSavedPercent(80, 100)).toBeCloseTo(20, 5);
  });

  it("reports a negative value when emissions rise", () => {
    expect(calculateSavedPercent(120, 100)).toBeCloseTo(-20, 5);
  });

  it("returns null when there is no baseline", () => {
    expect(calculateSavedPercent(10, 0)).toBeNull();
  });
});

describe("previousWindowRange", () => {
  it("returns the equally sized window before the current one", () => {
    expect(previousWindowRange("2026-11-17", 7)).toEqual({
      startDateKey: "2026-11-04",
      endDateKey: "2026-11-10",
    });
  });
});
