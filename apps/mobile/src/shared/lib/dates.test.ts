import {
  buildDateKeys,
  firstDayOfMonthKey,
  shiftDateKey,
  toDateKey,
  toDateKeyFromEpoch,
} from "./dates";

describe("toDateKey", () => {
  it("formats local dates with zero padding", () => {
    expect(toDateKey(new Date(2026, 0, 5))).toBe("2026-01-05");
  });

  it("converts epochs to local date keys", () => {
    const epoch = new Date(2026, 10, 17, 23, 30).getTime();
    expect(toDateKeyFromEpoch(epoch)).toBe("2026-11-17");
  });
});

describe("shiftDateKey", () => {
  it("crosses month boundaries", () => {
    expect(shiftDateKey("2026-11-01", -1)).toBe("2026-10-31");
    expect(shiftDateKey("2026-12-31", 1)).toBe("2027-01-01");
  });
});

describe("buildDateKeys", () => {
  it("returns an inclusive, ascending window ending today", () => {
    expect(buildDateKeys("2026-11-17", 3)).toEqual(["2026-11-15", "2026-11-16", "2026-11-17"]);
  });
});

describe("firstDayOfMonthKey", () => {
  it("returns the first day of the same month", () => {
    expect(firstDayOfMonthKey("2026-11-17")).toBe("2026-11-01");
  });
});
