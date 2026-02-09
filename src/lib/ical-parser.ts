export interface Course {
  dtstart: string;
  dtend: string;
  summary: string;
  location: string;
  description: string;
}

const cache = new Map<string, { data: Course[]; expiry: number }>();
const CACHE_TTL = 5 * 60 * 1000;

function toDate(dt: string): Date {
  const year = parseInt(dt.substring(0, 4));
  const month = parseInt(dt.substring(4, 6)) - 1;
  const day = parseInt(dt.substring(6, 8));
  const hour = parseInt(dt.substring(9, 11));
  const minute = parseInt(dt.substring(11, 13));
  const second = parseInt(dt.substring(13, 15));
  return new Date(Date.UTC(year, month, day, hour, minute, second));
}

function parseIcal(data: string, targetDate: Date): Course[] {
  const eventRegex = /BEGIN:VEVENT([\s\S]*?)END:VEVENT/g;
  const courses: Course[] = [];
  let match;

  const targetDay = targetDate.getUTCDate();
  const targetMonth = targetDate.getUTCMonth();
  const targetYear = targetDate.getUTCFullYear();

  while ((match = eventRegex.exec(data)) !== null) {
    const block = match[1];

    const dtstartMatch = block.match(/DTSTART(?:;VALUE=DATE)?:([^\r\n]*)/);
    const dtendMatch = block.match(/DTEND(?:;VALUE=DATE)?:([^\r\n]*)/);
    const summaryMatch = block.match(/SUMMARY;LANGUAGE=fr:([^\r\n]*)/);
    const locationMatch = block.match(/LOCATION;LANGUAGE=fr:([^\r\n]*)/);
    const descriptionMatch = block.match(/DESCRIPTION;LANGUAGE=fr:([^\r\n]*)/);

    const dtstart = dtstartMatch?.[1]?.trim();
    const dtend = dtendMatch?.[1]?.trim();
    const summary = summaryMatch?.[1]?.trim();

    if (!dtstart || !dtend || !summary) continue;

    const eventDate = toDate(dtstart);
    if (
      eventDate.getUTCDate() === targetDay &&
      eventDate.getUTCMonth() === targetMonth &&
      eventDate.getUTCFullYear() === targetYear
    ) {
      courses.push({
        dtstart,
        dtend,
        summary,
        location: locationMatch?.[1]?.trim() || "Non specifie",
        description: descriptionMatch?.[1]?.trim() || "Non specifie",
      });
    }
  }

  return courses;
}

export async function getClassCourses(
  url: string,
  date: Date
): Promise<Course[]> {
  const dateStr = `${date.getUTCFullYear()}-${String(date.getUTCMonth() + 1).padStart(2, "0")}-${String(date.getUTCDate()).padStart(2, "0")}`;
  const cacheKey = `${url}:${dateStr}`;

  const cached = cache.get(cacheKey);
  if (cached && cached.expiry > Date.now()) {
    return cached.data;
  }

  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), 10000);

  try {
    const response = await fetch(url, { signal: controller.signal });
    const text = await response.text();
    const courses = parseIcal(text, date);

    cache.set(cacheKey, { data: courses, expiry: Date.now() + CACHE_TTL });

    return courses;
  } catch {
    return [];
  } finally {
    clearTimeout(timeout);
  }
}

export { toDate };
