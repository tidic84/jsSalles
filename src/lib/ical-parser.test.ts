import { describe, expect, it } from "vitest";
import { parseCourses } from "./ical-parser";
import { parisTimeToUtc } from "./timezone";

function dayBounds(dateStr: string) {
  const dayStart = parisTimeToUtc(dateStr, "00:00");
  return {
    dayStart,
    dayEnd: new Date(dayStart.getTime() + 24 * 60 * 60 * 1000),
  };
}

const SIMPLE_ICS = `BEGIN:VCALENDAR
VERSION:2.0
PRODID:-//ADE/version 6.0
BEGIN:VEVENT
DTSTART:20260611T060000Z
DTEND:20260611T080000Z
SUMMARY;LANGUAGE=fr:Programmation Web - CM
LOCATION;LANGUAGE=fr:Amphi Blaise
DESCRIPTION;LANGUAGE=fr:L3 Informatique
UID:event-1
END:VEVENT
BEGIN:VEVENT
DTSTART:20260612T060000Z
DTEND:20260612T080000Z
SUMMARY;LANGUAGE=fr:Cours du lendemain
UID:event-2
END:VEVENT
END:VCALENDAR`;

// SUMMARY plié sur deux lignes (line folding RFC 5545 : la suite commence
// par un espace) — l'ancien parser regex tronquait ce cas.
const FOLDED_ICS = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
DTSTART:20260611T080000Z
DTEND:20260611T100000Z
SUMMARY;LANGUAGE=fr:Analyse et conception de systemes d'information rep
 artis - TD groupe 2
UID:event-folded
END:VEVENT
END:VCALENDAR`;

const RRULE_ICS = `BEGIN:VCALENDAR
VERSION:2.0
BEGIN:VEVENT
DTSTART:20260604T080000Z
DTEND:20260604T100000Z
RRULE:FREQ=WEEKLY;BYDAY=TH;COUNT=10
SUMMARY;LANGUAGE=fr:TP hebdomadaire
UID:event-rrule
END:VEVENT
END:VCALENDAR`;

describe("parseCourses", () => {
  it("retourne uniquement les cours du jour demandé", () => {
    const { dayStart, dayEnd } = dayBounds("2026-06-11");
    const courses = parseCourses(SIMPLE_ICS, dayStart, dayEnd);
    expect(courses).toHaveLength(1);
    expect(courses[0]).toMatchObject({
      start: "2026-06-11T06:00:00.000Z",
      end: "2026-06-11T08:00:00.000Z",
      summary: "Programmation Web - CM",
      location: "Amphi Blaise",
      description: "L3 Informatique",
    });
  });

  it("retourne une liste vide pour un jour sans cours", () => {
    const { dayStart, dayEnd } = dayBounds("2026-06-14");
    expect(parseCourses(SIMPLE_ICS, dayStart, dayEnd)).toHaveLength(0);
  });

  it("gère le line folding RFC 5545 (lignes pliées)", () => {
    const { dayStart, dayEnd } = dayBounds("2026-06-11");
    const courses = parseCourses(FOLDED_ICS, dayStart, dayEnd);
    expect(courses).toHaveLength(1);
    expect(courses[0].summary).toBe(
      "Analyse et conception de systemes d'information repartis - TD groupe 2"
    );
  });

  it("expanse les récurrences RRULE", () => {
    // L'événement initial est le jeudi 4 juin ; le 11 juin est la 2e occurrence.
    const { dayStart, dayEnd } = dayBounds("2026-06-11");
    const courses = parseCourses(RRULE_ICS, dayStart, dayEnd);
    expect(courses).toHaveLength(1);
    expect(courses[0].start).toBe("2026-06-11T08:00:00.000Z");
    expect(courses[0].end).toBe("2026-06-11T10:00:00.000Z");

    // Et aucune occurrence un mercredi.
    const wednesday = dayBounds("2026-06-10");
    expect(
      parseCourses(RRULE_ICS, wednesday.dayStart, wednesday.dayEnd)
    ).toHaveLength(0);
  });
});
