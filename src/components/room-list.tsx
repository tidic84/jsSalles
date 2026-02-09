"use client";

import { cn } from "@/lib/utils";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

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
    timeZone: "UTC",
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
    <div className="rounded-md border">
      <Table>
        <TableHeader>
          <TableRow>
            <TableHead className="text-base">Salle</TableHead>
            <TableHead className="text-base text-right">Prochain événement</TableHead>
          </TableRow>
        </TableHeader>
        <TableBody>
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
                statusText = `Occupée jusqu'à ${freeAt.toLocaleTimeString("fr-FR", { hour: "2-digit", minute: "2-digit", hour12: false, timeZone: "UTC" })}`;
              } else {
                statusText = "Occupée";
              }
            }

            return (
              <TableRow
                key={roomName}
                className={cn(
                  "cursor-pointer",
                  isFree ? "bg-green-50/50 hover:bg-green-100/50" : "bg-red-50/50 hover:bg-red-100/50"
                )}
                onClick={() => onRoomClick(roomName)}
              >
                <TableCell className="text-base font-medium">{roomName}</TableCell>
                <TableCell className="text-base text-right text-muted-foreground">
                  {statusText}
                </TableCell>
              </TableRow>
            );
          })}
        </TableBody>
      </Table>
    </div>
  );
}
