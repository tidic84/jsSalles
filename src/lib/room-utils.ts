import { Course, getClassCourses, toDate } from "./ical-parser";
import { getRooms } from "./queries";

interface FreeResult {
  free: true;
  nextCourse: Course | null;
}

interface UsedResult {
  free: false;
  courses: Course[];
  willBeFree: Date | null;
}

export type ClassStatus = FreeResult | UsedResult;

export interface RoomResult {
  freeRooms: Record<string, FreeResult>;
  usedRooms: Record<string, UsedResult>;
  invalidRooms: Record<string, string>;
}

function isClassFree(courses: Course[], now: Date): ClassStatus {
  if (courses.length === 0) {
    return { free: true, nextCourse: null };
  }

  let nextCourse: Course | null = null;
  let nextCourseDiff: number | null = null;

  for (const course of courses) {
    if (!course?.dtstart || !course?.dtend) continue;

    const courseStart = toDate(course.dtstart);
    const courseEnd = toDate(course.dtend);

    if (courseStart <= now && courseEnd > now) {
      return {
        free: false,
        courses,
        willBeFree: whenWillItBeFree(courses, now),
      };
    }

    if (courseStart > now) {
      const diff = courseStart.getTime() - now.getTime();
      if (nextCourseDiff === null || diff < nextCourseDiff) {
        nextCourseDiff = diff;
        nextCourse = course;
      }
    }
  }

  return { free: true, nextCourse };
}

function whenWillItBeFree(courses: Course[], now: Date): Date | null {
  let currentEnd: Date | null = null;

  for (const course of courses) {
    if (!course?.dtstart || !course?.dtend) continue;
    const start = toDate(course.dtstart);
    const end = toDate(course.dtend);
    if (start <= now && end > now) {
      if (currentEnd === null || end > currentEnd) {
        currentEnd = end;
      }
    }
  }

  if (currentEnd === null) return null;

  let extended = true;
  while (extended) {
    extended = false;
    for (const course of courses) {
      if (!course?.dtstart || !course?.dtend) continue;
      const start = toDate(course.dtstart);
      const end = toDate(course.dtend);
      if (start <= currentEnd && end > currentEnd) {
        currentEnd = end;
        extended = true;
      }
    }
  }

  return currentEnd;
}

export async function getFreeRooms(
  queryDate: string | null,
  queryTime: string | null,
  univ: string
): Promise<RoomResult> {
  const rooms = await getRooms(univ);

  let date: Date;
  if (queryDate && queryTime) {
    const [hours, minutes] = queryTime.split(":").map(Number);
    date = new Date(queryDate);
    date.setUTCHours(hours, minutes, 0, 0);
  } else {
    date = new Date();
  }

  const freeRooms: Record<string, FreeResult> = {};
  const usedRooms: Record<string, UsedResult> = {};
  const invalidRooms: Record<string, string> = {};

  const promises = rooms.map(
    async (room: { room_name: string; room_url: string }) => {
      if (!room.room_url) {
        invalidRooms[room.room_name] = "";
        return;
      }
      try {
        const courses = await getClassCourses(room.room_url, date);
        const status = isClassFree(courses, date);
        if (status.free) {
          freeRooms[room.room_name] = status;
        } else {
          usedRooms[room.room_name] = status;
        }
      } catch {
        invalidRooms[room.room_name] = room.room_url;
      }
    }
  );

  await Promise.all(promises);
  return { freeRooms, usedRooms, invalidRooms };
}
