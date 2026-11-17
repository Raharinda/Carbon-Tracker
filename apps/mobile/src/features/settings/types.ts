export type UserSettings = {
  tariffPerKwh: number;
  emissionFactorKgPerKwh: number;
  monthlyBudgetIdr: number;
};

export type SettingsField = keyof UserSettings;
export type SettingsDraft = Record<SettingsField, string>;
export type SettingsErrors = Partial<Record<SettingsField | "deviceId", string>>;

export type SettingsValidation =
  { valid: true; values: UserSettings } | { valid: false; errors: SettingsErrors };
