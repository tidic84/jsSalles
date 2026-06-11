const TIMEZONE = "Europe/Paris";

const partsFormatter = new Intl.DateTimeFormat("en-US", {
  timeZone: TIMEZONE,
  year: "numeric",
  month: "2-digit",
  day: "2-digit",
  hour: "2-digit",
  minute: "2-digit",
  second: "2-digit",
  hour12: false,
});

function wallTimeAsUtc(date: Date): number {
  const parts: Record<string, number> = {};
  for (const { type, value } of partsFormatter.formatToParts(date)) {
    if (type !== "literal") parts[type] = Number(value);
  }
  return Date.UTC(
    parts.year,
    parts.month - 1,
    parts.day,
    parts.hour % 24,
    parts.minute,
    parts.second
  );
}

/**
 * Convertit une date/heure exprimée en heure de Paris ("2026-06-11", "14:00")
 * en instant UTC, en tenant compte de l'heure d'été/hiver.
 */
export function parisTimeToUtc(dateStr: string, timeStr: string): Date {
  const [year, month, day] = dateStr.split("-").map(Number);
  const [hours, minutes] = timeStr.split(":").map(Number);
  const guess = Date.UTC(year, month - 1, day, hours, minutes, 0);
  const offset = wallTimeAsUtc(new Date(guess)) - guess;
  return new Date(guess - offset);
}

/** Date du jour ("YYYY-MM-DD") d'un instant donné, vue depuis Paris. */
export function parisDateString(date: Date): string {
  return new Intl.DateTimeFormat("fr-CA", {
    timeZone: TIMEZONE,
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).format(date);
}

/** Bornes [début, fin) de la journée de Paris contenant l'instant donné. */
export function parisDayBounds(date: Date): { dayStart: Date; dayEnd: Date } {
  const dayStart = parisTimeToUtc(parisDateString(date), "00:00");
  return { dayStart, dayEnd: new Date(dayStart.getTime() + 24 * 60 * 60 * 1000) };
}
