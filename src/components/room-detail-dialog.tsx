"use client";

import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";

interface Course {
  dtstart: string;
  dtend: string;
  summary: string;
  location: string;
  description: string;
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

function formatTime(d: Date) {
  return d.toLocaleTimeString("fr-FR", {
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
    timeZone: "UTC",
  });
}

interface RoomDetailDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  roomName: string;
  isFree: boolean;
  courses: Course[];
  now: Date;
}

export function RoomDetailDialog({
  open,
  onOpenChange,
  roomName,
  isFree,
  courses,
  now,
}: RoomDetailDialogProps) {
  const sorted = [...courses].sort(
    (a, b) => toDate(a.dtstart).getTime() - toDate(b.dtstart).getTime()
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-3">
            Salle {roomName}
            <Badge variant={isFree ? "default" : "destructive"}>
              {isFree ? "Libre" : "Occupee"}
            </Badge>
          </DialogTitle>
        </DialogHeader>

        {sorted.length === 0 ? (
          <p className="py-4 text-center text-muted-foreground">
            Aucun cours prevu aujourd&apos;hui
          </p>
        ) : (
          <div className="space-y-1 py-2">
            <p className="mb-3 text-sm font-medium text-muted-foreground">
              Planning de la journee
            </p>
            <div className="relative ml-3 border-l-2 border-muted pl-4">
              {sorted.map((course, i) => {
                const start = toDate(course.dtstart);
                const end = toDate(course.dtend);
                const isCurrent = start <= now && end > now;
                const isPast = end <= now;

                return (
                  <div key={i} className="relative pb-4 last:pb-0">
                    <div
                      className={cn(
                        "absolute -left-[1.3rem] top-1 h-3 w-3 rounded-full border-2 border-background",
                        isCurrent
                          ? "bg-red-500"
                          : isPast
                            ? "bg-muted-foreground/40"
                            : "bg-primary"
                      )}
                    />
                    <p className="text-sm font-semibold">
                      {formatTime(start)} - {formatTime(end)}
                    </p>
                    <p className="text-sm text-muted-foreground">
                      {course.summary.split("-")[0]?.trim() || "Cours non precise"}
                    </p>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
