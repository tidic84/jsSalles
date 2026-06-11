import { describe, expect, it } from "vitest";
import { parisDayBounds, parisTimeToUtc } from "./timezone";

describe("parisTimeToUtc", () => {
  it("convertit l'heure d'été (UTC+2)", () => {
    expect(parisTimeToUtc("2026-06-11", "14:00").toISOString()).toBe(
      "2026-06-11T12:00:00.000Z"
    );
  });

  it("convertit l'heure d'hiver (UTC+1)", () => {
    expect(parisTimeToUtc("2026-01-15", "14:00").toISOString()).toBe(
      "2026-01-15T13:00:00.000Z"
    );
  });

  it("gère minuit", () => {
    expect(parisTimeToUtc("2026-06-11", "00:00").toISOString()).toBe(
      "2026-06-10T22:00:00.000Z"
    );
  });
});

describe("parisDayBounds", () => {
  it("retourne la journée de Paris contenant l'instant", () => {
    // 23h30 UTC le 10 juin = 01h30 à Paris le 11 juin
    const { dayStart, dayEnd } = parisDayBounds(
      new Date("2026-06-10T23:30:00Z")
    );
    expect(dayStart.toISOString()).toBe("2026-06-10T22:00:00.000Z");
    expect(dayEnd.toISOString()).toBe("2026-06-11T22:00:00.000Z");
  });
});
