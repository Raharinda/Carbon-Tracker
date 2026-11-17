import type { SettingsDraft } from "../types";
import { parseDecimal, validateDeviceId, validateSettingsDraft } from "./validateSettings";

const validDraft: SettingsDraft = {
  tariffPerKwh: "1444,7",
  emissionFactorKgPerKwh: "0.87",
  monthlyBudgetIdr: "200000",
};

describe("parseDecimal", () => {
  it("accepts Indonesian decimal commas", () => {
    expect(parseDecimal("1444,7")).toBe(1444.7);
  });

  it("rejects empty input", () => {
    expect(parseDecimal("  ")).toBeNaN();
  });
});

describe("validateSettingsDraft", () => {
  it("returns numeric values for a valid draft", () => {
    const result = validateSettingsDraft(validDraft);

    expect(result.valid).toBe(true);
    if (result.valid) {
      expect(result.values).toEqual({
        tariffPerKwh: 1444.7,
        emissionFactorKgPerKwh: 0.87,
        monthlyBudgetIdr: 200000,
      });
    }
  });

  it("rejects a zero tariff and emission factor", () => {
    const result = validateSettingsDraft({
      ...validDraft,
      tariffPerKwh: "0",
      emissionFactorKgPerKwh: "0",
    });

    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.errors.tariffPerKwh).toBeDefined();
      expect(result.errors.emissionFactorKgPerKwh).toBeDefined();
    }
  });

  it("allows a zero budget", () => {
    const result = validateSettingsDraft({ ...validDraft, monthlyBudgetIdr: "0" });
    expect(result.valid).toBe(true);
  });

  it("rejects a negative budget", () => {
    const result = validateSettingsDraft({ ...validDraft, monthlyBudgetIdr: "-1" });
    expect(result.valid).toBe(false);
  });
});

describe("validateDeviceId", () => {
  it("requires a non-empty id", () => {
    expect(validateDeviceId("   ")).toBeDefined();
  });

  it("accepts a normal id", () => {
    expect(validateDeviceId("esp32_01")).toBeUndefined();
  });
});
