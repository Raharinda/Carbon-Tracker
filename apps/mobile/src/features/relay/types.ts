export type RelayCommand = {
  deviceId: string;
  isOn: boolean;
};

export type RelayToggleOutcome = "confirmed" | "rolled-back";
