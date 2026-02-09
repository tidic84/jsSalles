"use client";

import { cn } from "@/lib/utils";

interface Course {
  dtstart: string;
  dtend: string;
  summary: string;
  location: string;
  description: string;
}

interface FreeData {
  free: true;
  nextCourse: Course | null;
}

interface UsedData {
  free: false;
  courses: Course[];
  willBeFree: string | null;
}

function toDate(dt: string): Date {
  const year = parseInt(dt.substring(0, 4));
  const month = parseInt(dt.substring(4, 6)) - 1;
  const day = parseInt(dt.substring(6, 8));
  const hour = parseInt(dt.substring(9, 11));
  const minute = parseInt(dt.substring(11, 13));
  const second = parseInt(dt.substring(13, 15));
  return new Date(Date.UTC(year, month, day, hour, minute, second));
}

function formatTimeFromDate(d: Date) {
  return d.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "Europe/Paris",
  });
}

interface RoomListProps {
  rooms: [string, FreeData | UsedData][];
  onRoomClick: (roomName: string) => void;
}

export function RoomList({ rooms, onRoomClick }: RoomListProps) {
  if (rooms.length === 0) {
    return (
      <p className="text-base text-muted-foreground">Aucune salle</p>
    );
  }

  return (
    <div className="divide-y divide-border rounded-xl border bg-card shadow-sm">
      {rooms.map(([roomName, data]) => {
        const isFree = data.free;

        let statusText = "";
        if (isFree) {
          const freeData = data as FreeData;
          if (freeData.nextCourse) {
            statusText = `Libre jusqu'à ${formatTimeFromDate(toDate(freeData.nextCourse.dtstart))}`;
          } else {
            statusText = "Libre toute la journée";
          }
        } else {
          const usedData = data as UsedData;
          if (usedData.willBeFree) {
            const freeAt = new Date(usedData.willBeFree);
            statusText = `Occupée jusqu'à ${freeAt.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Europe/Paris" })}`;
          } else {
            statusText = "Occupée";
          }
        }

        return (
          <button
            key={roomName}
            type="button"
            onClick={() => onRoomClick(roomName)}
            className="group flex w-full items-center justify-between px-5 py-4 text-left transition-colors hover:bg-accent/50 first:rounded-t-xl last:rounded-b-xl"
          >
            <div className="flex items-center gap-3">
              <span
                className={cn(
                  "h-2.5 w-2.5 rounded-full shrink-0",
                  isFree ? "bg-emerald-500" : "bg-rose-500"
                )}
              />
              <span className="text-base font-medium">{roomName}</span>
            </div>
            <span className="text-sm text-muted-foreground">
              {statusText}
            </span>
          </button>
        );
      })}
    </div>
  );
}
