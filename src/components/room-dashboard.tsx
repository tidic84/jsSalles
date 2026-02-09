"use client";

import { useState, useEffect, useCallback } from "react";
import { Button } from "@/components/ui/button";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Input } from "@/components/ui/input";
import { RoomList } from "@/components/room-list";
import { RoomDetailDialog } from "@/components/room-detail-dialog";
import { RoomSkeletonTable } from "@/components/room-skeleton";
import { CalendarClock, RotateCw } from "lucide-react";

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

interface RoomResult {
  freeRooms: Record<string, FreeData>;
  usedRooms: Record<string, UsedData>;
  invalidRooms: Record<string, string>;
}

export function RoomDashboard({ univ }: { univ: string }) {
  const [data, setData] = useState<RoomResult | null>(null);
  const [loading, setLoading] = useState(true);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [pickerOpen, setPickerOpen] = useState(false);
  const [selectedRoom, setSelectedRoom] = useState<string | null>(null);
  const [queryDate, setQueryDate] = useState<string | null>(null);
  const [queryTime, setQueryTime] = useState<string | null>(null);

  const fetchRooms = useCallback(
    async (d?: string | null, t?: string | null) => {
      setLoading(true);
      try {
        const params = new URLSearchParams();
        if (d && t) {
          params.set("date", d);
          params.set("time", t);
        }
        const qs = params.toString() ? `?${params.toString()}` : "";
        const res = await fetch(`/api/rooms/${univ}${qs}`);
        const json = await res.json();
        setData(json);
      } catch {
        setData(null);
      } finally {
        setLoading(false);
      }
    },
    [univ]
  );

  useEffect(() => {
    const now = new Date();
    setDate(now.toISOString().split("T")[0]);
    setTime(
      now.toTimeString().split(" ")[0].slice(0, 5)
    );
    fetchRooms();
  }, [fetchRooms]);

  function handleSearch() {
    setPickerOpen(false);
    setQueryDate(date);
    setQueryTime(time);
    fetchRooms(date, time);
  }

  function handleNow() {
    const now = new Date();
    setDate(now.toISOString().split("T")[0]);
    setTime(now.toTimeString().split(" ")[0].slice(0, 5));
    setQueryDate(null);
    setQueryTime(null);
    fetchRooms();
  }

  const freeEntries = data
    ? Object.entries(data.freeRooms).sort(([a], [b]) => a.localeCompare(b))
    : [];
  const usedEntries = data
    ? Object.entries(data.usedRooms).sort(([a], [b]) => {
        const aTime = a;
        const bTime = b;
        const aFree = data.usedRooms[aTime]?.willBeFree;
        const bFree = data.usedRooms[bTime]?.willBeFree;
        if (!aFree && !bFree) return aTime.localeCompare(bTime);
        if (!aFree) return 1;
        if (!bFree) return -1;
        return new Date(aFree).getTime() - new Date(bFree).getTime();
      })
    : [];

  const selectedRoomData = selectedRoom
    ? data?.freeRooms[selectedRoom] || data?.usedRooms[selectedRoom] || null
    : null;

  const selectedIsFree = selectedRoom
    ? !!data?.freeRooms[selectedRoom]
    : false;

  const selectedCourses: Course[] = selectedRoomData
    ? selectedRoomData.free
      ? selectedRoomData.nextCourse
        ? [selectedRoomData.nextCourse]
        : []
      : (selectedRoomData as UsedData).courses || []
    : [];

  const now =
    queryDate && queryTime
      ? new Date(`${queryDate}T${queryTime}:00Z`)
      : new Date();

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-3">
        <Popover open={pickerOpen} onOpenChange={setPickerOpen}>
          <PopoverTrigger asChild>
            <Button variant="outline" className="gap-2 bg-white hover:bg-gray-50">
              <CalendarClock className="h-4 w-4" />
              Selectionner Date/Heure
            </Button>
          </PopoverTrigger>
          <PopoverContent className="w-72 space-y-3" align="start">
            <div className="space-y-1">
              <label className="text-sm font-medium">Date</label>
              <Input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium">Heure</label>
              <Input
                type="time"
                value={time}
                onChange={(e) => setTime(e.target.value)}
              />
            </div>
            <Button className="w-full" onClick={handleSearch}>
              Rechercher
            </Button>
          </PopoverContent>
        </Popover>
        <Button variant="secondary" className="gap-2" onClick={handleNow}>
          <RotateCw className="h-4 w-4" />
          Maintenant
        </Button>
      </div>

      {loading ? (
        <>
          <div>
            <h2 className="mb-3 text-lg font-semibold">Salles Libres</h2>
            <RoomSkeletonTable />
          </div>
          <div>
            <h2 className="mb-3 text-lg font-semibold">Salles Occupées</h2>
            <RoomSkeletonTable />
          </div>
        </>
      ) : data ? (
        <>
          <div>
            <h2 className="mb-3 text-lg font-semibold">
              Salles Libres ({freeEntries.length})
            </h2>
            <RoomList rooms={freeEntries} onRoomClick={setSelectedRoom} />
          </div>

          <div>
            <h2 className="mb-3 text-lg font-semibold">
              Salles Occupées ({usedEntries.length})
            </h2>
            <RoomList rooms={usedEntries} onRoomClick={setSelectedRoom} />
          </div>
        </>
      ) : (
        <p className="text-sm text-muted-foreground">
          Erreur lors du chargement des donnees.
        </p>
      )}

      <RoomDetailDialog
        open={!!selectedRoom}
        onOpenChange={(open) => {
          if (!open) setSelectedRoom(null);
        }}
        roomName={selectedRoom || ""}
        isFree={selectedIsFree}
        courses={selectedCourses}
        now={now}
      />
    </div>
  );
}
