/** Destiny 2 daily reset — 17:00 UTC (19:00 Spain in summer / 18:00 in winter). */
const DAILY_RESET_UTC_HOUR = 17;
const DAILY_RESET_UTC_MINUTE = 0;

const MADRID_TIMEZONE = "Europe/Madrid";

export function getNextDailyResetMs(now = Date.now()): number {
  const current = new Date(now);
  const year = current.getUTCFullYear();
  const month = current.getUTCMonth();
  const date = current.getUTCDate();

  let candidate = Date.UTC(
    year,
    month,
    date,
    DAILY_RESET_UTC_HOUR,
    DAILY_RESET_UTC_MINUTE,
    0,
    0,
  );

  if (candidate <= now) {
    candidate = Date.UTC(
      year,
      month,
      date + 1,
      DAILY_RESET_UTC_HOUR,
      DAILY_RESET_UTC_MINUTE,
      0,
      0,
    );
  }

  return candidate;
}

export function formatResetCountdown(msRemaining: number): string {
  if (msRemaining <= 0) return "Refreshing…";

  const totalSeconds = Math.floor(msRemaining / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}h ${minutes.toString().padStart(2, "0")}m ${seconds.toString().padStart(2, "0")}s`;
  }

  return `${minutes}m ${seconds.toString().padStart(2, "0")}s`;
}

export function formatResetLocalTime(resetMs = getNextDailyResetMs()): string {
  return new Intl.DateTimeFormat("es-ES", {
    timeZone: MADRID_TIMEZONE,
    weekday: "short",
    day: "numeric",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  }).format(new Date(resetMs));
}
