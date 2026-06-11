"use client";

import { cn } from "@/lib/utils";

interface Course {
  start: string;
  end: string;
  summary: string;
  location: string;
  description: string;
}

interface FreeData {
  free: true;
  nextCourse: Course | null;
  courses: Course[];
}

interface UsedData {
  free: false;
  courses: Course[];
  willBeFree: string | null;
}

function formatTime(iso: string) {
  return new Date(iso).toLocaleTimeString("fr-FR", {
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
            statusText = `Libre jusqu'à ${formatTime(freeData.nextCourse.start)}`;
          } else {
            statusText = "Libre toute la journée";
          }
        } else {
          const usedData = data as UsedData;
          if (usedData.willBeFree) {
            statusText = `Occupée jusqu'à ${formatTime(usedData.willBeFree)}`;
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
