import type { SettingsDraft, SettingsErrors, SettingsValidation, UserSettings } from "../types";

export function parseDecimal(input: string): number {
  const normalized = input.trim().replace(",", ".");
  if (normalized.length === 0) return Number.NaN;
  return Number(normalized);
}

export function toSettingsDraft(settings: UserSettings): SettingsDraft {
  return {
    tariffPerKwh: String(settings.tariffPerKwh),
    emissionFactorKgPerKwh: String(settings.emissionFactorKgPerKwh),
    monthlyBudgetIdr: String(settings.monthlyBudgetIdr),
  };
}

function validatePositive(value: number): boolean {
  return Number.isFinite(value) && value > 0;
}

export function validateSettingsDraft(draft: SettingsDraft): SettingsValidation {
  const errors: SettingsErrors = {};
  const tariffPerKwh = parseDecimal(draft.tariffPerKwh);
  const emissionFactorKgPerKwh = parseDecimal(draft.emissionFactorKgPerKwh);
  const monthlyBudgetIdr = parseDecimal(draft.monthlyBudgetIdr);

  if (!validatePositive(tariffPerKwh)) {
    errors.tariffPerKwh = "Enter a tariff greater than zero.";
  }
  if (!validatePositive(emissionFactorKgPerKwh)) {
    errors.emissionFactorKgPerKwh = "Enter an emission factor greater than zero.";
  }
  if (!Number.isFinite(monthlyBudgetIdr) || monthlyBudgetIdr < 0) {
    errors.monthlyBudgetIdr = "Enter a budget of zero or more.";
  }

  if (Object.keys(errors).length > 0) return { valid: false, errors };

  return {
    valid: true,
    values: { tariffPerKwh, emissionFactorKgPerKwh, monthlyBudgetIdr },
  };
}

export function validateDeviceId(deviceId: string): string | undefined {
  if (deviceId.trim().length === 0) return "Device ID is required.";
  if (deviceId.trim().length > 64) return "Device ID must be 64 characters or fewer.";
  return undefined;
}
