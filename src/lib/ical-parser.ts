import ical, { type CalendarResponse, type VEvent } from "node-ical";

export interface Course {
  start: string; // ISO 8601
  end: string; // ISO 8601
  summary: string;
  location: string;
  description: string;
}

const cache = new Map<string, { data: Course[]; expiry: number }>();
const CACHE_TTL = 5 * 60 * 1000;
const CACHE_MAX_ENTRIES = 500;

function asText(value: unknown): string {
  if (typeof value === "string") return value;
  if (value && typeof value === "object" && "val" in value) {
    return String((value as { val: unknown }).val);
  }
  return "";
}

function toCourse(event: VEvent, start: Date, end: Date): Course {
  return {
    start: start.toISOString(),
    end: end.toISOString(),
    summary: asText(event.summary) || "Non specifie",
    location: asText(event.location) || "Non specifie",
    description: asText(event.description) || "Non specifie",
  };
}

/**
 * Extrait les cours d'un calendrier iCal qui chevauchent la fenêtre
 * [dayStart, dayEnd), en expansant les règles de récurrence (RRULE).
 */
export function coursesInWindow(
  data: CalendarResponse,
  dayStart: Date,
  dayEnd: Date
): Course[] {
  const courses: Course[] = [];

  const pushIfOverlap = (event: VEvent, start: Date, end: Date) => {
    if (start < dayEnd && end > dayStart) {
      courses.push(toCourse(event, start, end));
    }
  };

  for (const component of Object.values(data)) {
    if (component?.type !== "VEVENT") continue;
    const event = component as VEvent;
    if (!event.start || !event.end) continue;

    if (event.rrule) {
      const duration = event.end.getTime() - event.start.getTime();
      const exdates = event.exdate
        ? Object.values(event.exdate).map((d) => new Date(d).getTime())
        : [];
      const overrides = event.recurrences
        ? (Object.values(event.recurrences) as VEvent[])
        : [];
      const overriddenIds = overrides.map((r) =>
        r.recurrenceid ? new Date(r.recurrenceid as Date).getTime() : NaN
      );

      const occurrences = event.rrule.between(
        new Date(dayStart.getTime() - duration),
        dayEnd,
        true
      );
      for (const occStart of occurrences) {
        const t = occStart.getTime();
        if (exdates.includes(t) || overriddenIds.includes(t)) continue;
        pushIfOverlap(event, occStart, new Date(t + duration));
      }

      for (const override of overrides) {
        if (override.start && override.end) {
          pushIfOverlap(override, override.start, override.end);
        }
      }
    } else {
      pushIfOverlap(event, event.start, event.end);
    }
  }

  return courses;
}

export function parseCourses(
  icsText: string,
  dayStart: Date,
  dayEnd: Date
): Course[] {
  return coursesInWindow(ical.sync.parseICS(icsText), dayStart, dayEnd);
}

function evictExpired() {
  if (cache.size < CACHE_MAX_ENTRIES) return;
  const now = Date.now();
  for (const [key, entry] of cache) {
    if (entry.expiry <= now) cache.delete(key);
  }
}

/**
 * Récupère les cours d'une salle pour la fenêtre donnée.
 * Lève une erreur si le calendrier est inaccessible ou invalide,
 * afin que l'appelant puisse marquer la salle comme invalide
 * plutôt que de l'afficher libre à tort.
 */
export async function getClassCourses(
  url: string,
  dayStart: Date,
  dayEnd: Date
): Promise<Course[]> {
  const cacheKey = `${url}:${dayStart.toISOString()}`;

  const cached = cache.get(cacheKey);
  if (cached && cached.expiry > Date.now()) {
    return cached.data;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(url, { signal: controller.signal });
    if (!response.ok) {
      throw new Error(`Calendrier inaccessible (HTTP ${response.status})`);
    }
    const text = await response.text();
    const courses = parseCourses(text, dayStart, dayEnd);

    evictExpired();
    cache.set(cacheKey, { data: courses, expiry: Date.now() + CACHE_TTL });

    return courses;
  } finally {
    clearTimeout(timeout);
  }
}
