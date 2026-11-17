import { useCallback, useEffect, useState } from "react";

import { persistDeviceId, saveSettings } from "../services/settingsService";
import { useSettingsStore } from "../store/settingsStore";
import type { SettingsErrors, SettingsField } from "../types";
import {
  toSettingsDraft,
  validateDeviceId,
  validateSettingsDraft,
} from "../utils/validateSettings";

export function useSettingsForm() {
  const deviceId = useSettingsStore((state) => state.deviceId);
  const settings = useSettingsStore((state) => state.settings);
  const [deviceIdInput, setDeviceIdInput] = useState(deviceId);
  const [draft, setDraft] = useState(() => toSettingsDraft(settings));
  const [errors, setErrors] = useState<SettingsErrors>({});
  const [isSaving, setIsSaving] = useState(false);
  const [savedAt, setSavedAt] = useState<number | null>(null);

  // Preferences arrive asynchronously from the device, so seed the editable
  // draft once the remote values land instead of freezing the initial defaults.
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setDeviceIdInput(deviceId), [deviceId]);
  // eslint-disable-next-line react-hooks/set-state-in-effect
  useEffect(() => setDraft(toSettingsDraft(settings)), [settings]);

  const updateField = useCallback((field: SettingsField, value: string) => {
    setDraft((current) => ({ ...current, [field]: value }));
    setSavedAt(null);
  }, []);

  const submit = useCallback(async () => {
    const validation = validateSettingsDraft(draft);
    const deviceIdError = validateDeviceId(deviceIdInput);
    const nextErrors: SettingsErrors = {
      ...(validation.valid ? {} : validation.errors),
      ...(deviceIdError ? { deviceId: deviceIdError } : {}),
    };
    setErrors(nextErrors);
    if (!validation.valid || deviceIdError) return false;

    setIsSaving(true);
    try {
      const nextDeviceId = deviceIdInput.trim();
      await saveSettings(nextDeviceId, validation.values);
      if (nextDeviceId !== deviceId) await persistDeviceId(nextDeviceId);
      useSettingsStore.getState().setDeviceId(nextDeviceId);
      useSettingsStore.getState().setSettings(validation.values);
      setSavedAt(Date.now());
      return true;
    } catch (reason) {
      setErrors({
        deviceId: reason instanceof Error ? reason.message : "Settings could not be saved.",
      });
      return false;
    } finally {
      setIsSaving(false);
    }
  }, [deviceId, deviceIdInput, draft]);

  return {
    deviceIdInput,
    setDeviceIdInput,
    draft,
    updateField,
    errors,
    isSaving,
    savedAt,
    submit,
  };
}
