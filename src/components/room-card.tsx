"use client";

import { Badge } from "@/components/ui/badge";
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

interface RoomCardProps {
  roomName: string;
  data: FreeData | UsedData;
  onClick: () => void;
}

export function RoomCard({ roomName, data, onClick }: RoomCardProps) {
  const isFree = data.free;

  let subtitle = "";
  if (isFree) {
    const freeData = data as FreeData;
    if (freeData.nextCourse) {
      subtitle = `Prochain cours a ${formatTimeFromDate(toDate(freeData.nextCourse.dtstart))}`;
    } else {
      subtitle = "Aucun cours prevu";
    }
  } else {
    const usedData = data as UsedData;
    if (usedData.willBeFree) {
      const freeAt = new Date(usedData.willBeFree);
      subtitle = `Libre a ${freeAt.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "Europe/Paris" })}`;
    } else {
      subtitle = "Horaire inconnu";
    }
  }

  return (
    <button
      type="button"
      className={cn(
        "flex w-full items-center justify-between rounded-lg border px-4 py-3 text-left transition-colors hover:bg-accent",
        isFree ? "border-green-200" : "border-red-200"
      )}
      onClick={onClick}
    >
      <div className="flex items-center gap-3">
        <span className="font-medium">{roomName}</span>
        <Badge
          variant={isFree ? "default" : "destructive"}
          className="text-xs"
        >
          {isFree ? "Libre" : "Occupee"}
        </Badge>
      </div>
      <span className="text-sm text-muted-foreground">{subtitle}</span>
    </button>
  );
}
