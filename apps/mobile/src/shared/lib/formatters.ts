const LOCALE = "id-ID";

function safeNumber(value: number): number | null {
  return Number.isFinite(value) ? value : null;
}

export function formatNumber(value: number, maximumFractionDigits = 2): string {
  const safe = safeNumber(value);
  if (safe === null) return "–";
  return safe.toLocaleString(LOCALE, { maximumFractionDigits });
}

export function formatCurrency(value: number): string {
  const safe = safeNumber(value);
  if (safe === null) return "Rp –";
  return `Rp ${Math.round(safe).toLocaleString(LOCALE)}`;
}

export function formatPower(watts: number): string {
  const safe = safeNumber(watts);
  if (safe === null) return "– W";
  if (safe >= 1000) return `${formatNumber(safe / 1000, 2)} kW`;
  return `${formatNumber(safe, 0)} W`;
}

export function formatEnergy(kilowattHours: number): string {
  const safe = safeNumber(kilowattHours);
  if (safe === null) return "– kWh";
  return `${formatNumber(safe, 2)} kWh`;
}

export function formatCarbon(kilograms: number): string {
  const safe = safeNumber(kilograms);
  if (safe === null) return "– kg";
  return `${formatNumber(safe, 2)} kg`;
}

export function formatPercent(value: number, maximumFractionDigits = 1): string {
  const safe = safeNumber(value);
  if (safe === null) return "–%";
  return `${formatNumber(safe, maximumFractionDigits)}%`;
}

export function formatClock(epochMilliseconds: number): string {
  if (!Number.isFinite(epochMilliseconds) || epochMilliseconds <= 0) return "–";
  return new Date(epochMilliseconds).toLocaleTimeString(LOCALE, {
    hour: "2-digit",
    minute: "2-digit",
  });
}

export function formatDayNumber(isoDate: string): string {
  const date = new Date(`${isoDate}T00:00:00`);
  if (Number.isNaN(date.getTime())) return isoDate;
  return String(date.getDate());
}

export function formatDayLabel(epochMilliseconds: number): string {
  return new Date(epochMilliseconds).toLocaleDateString(LOCALE, {
    day: "numeric",
    month: "long",
  });
}
