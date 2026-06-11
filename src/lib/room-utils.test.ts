import { describe, expect, it } from "vitest";
import { isClassFree, whenWillItBeFree } from "./room-utils";
import type { Course } from "./ical-parser";

function course(start: string, end: string, summary = "Cours"): Course {
  return {
    start,
    end,
    summary,
    location: "Salle",
    description: "",
  };
}

describe("isClassFree", () => {
  it("salle libre sans aucun cours", () => {
    const status = isClassFree([], new Date("2026-06-11T10:00:00Z"));
    expect(status.free).toBe(true);
    if (status.free) expect(status.nextCourse).toBeNull();
  });

  it("salle libre avec un prochain cours", () => {
    const courses = [
      course("2026-06-11T06:00:00Z", "2026-06-11T08:00:00Z", "Passé"),
      course("2026-06-11T14:00:00Z", "2026-06-11T16:00:00Z", "Plus tard"),
      course("2026-06-11T12:00:00Z", "2026-06-11T13:00:00Z", "Prochain"),
    ];
    const status = isClassFree(courses, new Date("2026-06-11T10:00:00Z"));
    expect(status.free).toBe(true);
    if (status.free) {
      expect(status.nextCourse?.summary).toBe("Prochain");
      expect(status.courses).toHaveLength(3);
    }
  });

  it("salle occupée pendant un cours", () => {
    const courses = [course("2026-06-11T09:00:00Z", "2026-06-11T11:00:00Z")];
    const status = isClassFree(courses, new Date("2026-06-11T10:00:00Z"));
    expect(status.free).toBe(false);
    if (!status.free) {
      expect(status.willBeFree?.toISOString()).toBe("2026-06-11T11:00:00.000Z");
    }
  });

  it("un cours qui vient de finir ne rend pas la salle occupée", () => {
    const courses = [course("2026-06-11T08:00:00Z", "2026-06-11T10:00:00Z")];
    const status = isClassFree(courses, new Date("2026-06-11T10:00:00Z"));
    expect(status.free).toBe(true);
  });
});

describe("whenWillItBeFree", () => {
  it("étend la fin sur des cours enchaînés", () => {
    const courses = [
      course("2026-06-11T09:00:00Z", "2026-06-11T11:00:00Z"),
      course("2026-06-11T11:00:00Z", "2026-06-11T13:00:00Z"),
      course("2026-06-11T15:00:00Z", "2026-06-11T17:00:00Z"),
    ];
    const result = whenWillItBeFree(courses, new Date("2026-06-11T10:00:00Z"));
    // Les deux premiers cours s'enchaînent, le troisième est détaché.
    expect(result?.toISOString()).toBe("2026-06-11T13:00:00.000Z");
  });

  it("retourne null si aucun cours en ce moment", () => {
    const courses = [course("2026-06-11T14:00:00Z", "2026-06-11T16:00:00Z")];
    expect(whenWillItBeFree(courses, new Date("2026-06-11T10:00:00Z"))).toBeNull();
  });
});
