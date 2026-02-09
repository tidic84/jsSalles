"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import {
  ChartContainer,
  ChartTooltip,
  ChartTooltipContent,
  type ChartConfig,
} from "@/components/ui/chart";
import { Line, LineChart, XAxis, YAxis, CartesianGrid } from "recharts";

const chartConfig: ChartConfig = {
  visitesParUtilisateur: {
    label: "Visiteurs uniques",
    color: "var(--chart-1)",
  },
  visites: {
    label: "Pages vues",
    color: "var(--chart-2)",
  },
};

interface Room {
  univ: string;
  room_name: string;
  room_url: string;
}

export default function AdminPage() {
  const router = useRouter();
  const [visites, setVisites] = useState<Record<string, number>>({});
  const [visitesParUtilisateur, setVisitesParUtilisateur] = useState<
    Record<string, number>
  >({});
  const [rooms, setRooms] = useState<Room[]>([]);
  const [linkStatuses, setLinkStatuses] = useState<Record<string, string>>({});
  const [loadingStats, setLoadingStats] = useState(true);
  const [loadingRooms, setLoadingRooms] = useState(true);

  useEffect(() => {
    fetch("/api/admin/visites")
      .then((r) => r.json())
      .then((data) => {
        setVisites(data.visites || {});
        setVisitesParUtilisateur(data.visitesParUtilisateur || {});
      })
      .finally(() => setLoadingStats(false));

    fetch("/api/admin/rooms")
      .then((r) => r.json())
      .then((data: Room[]) => {
        setRooms(data);
        data.forEach((room) => {
          fetch(
            `/api/admin/check-url?url=${encodeURIComponent(room.room_url)}`
          )
            .then((r) => r.json())
            .then((result) => {
              setLinkStatuses((prev) => ({
                ...prev,
                [room.room_url]: result.status,
              }));
            })
            .catch(() => {
              setLinkStatuses((prev) => ({
                ...prev,
                [room.room_url]: "inaccessible",
              }));
            });
        });
      })
      .finally(() => setLoadingRooms(false));
  }, []);

  async function handleLogout() {
    await fetch("/api/auth/logout", { method: "POST" });
    router.push("/login");
  }

  const totalVisits = Object.values(visitesParUtilisateur).reduce(
    (acc, v) => acc + v,
    0
  );
  const today = new Date();
  today.setDate(today.getDate() - 1);
  const todayStr = today.toISOString().split("T")[0];
  const dailyVisits = visitesParUtilisateur[todayStr] || 0;

  const last14Days: string[] = [];
  for (let i = 13; i >= 0; i--) {
    const d = new Date();
    d.setDate(d.getDate() - i);
    last14Days.push(d.toISOString().split("T")[0]);
  }

  let weeklyVisits = 0;
  last14Days.slice(-7).forEach((day) => {
    const adjusted = new Date(day);
    adjusted.setDate(adjusted.getDate() - 1);
    const key = adjusted.toISOString().split("T")[0];
    weeklyVisits += visitesParUtilisateur[key] || 0;
  });

  const chartData = last14Days.map((day) => {
    const adjusted = new Date(day);
    adjusted.setDate(adjusted.getDate() - 1);
    const key = adjusted.toISOString().split("T")[0];
    const d = new Date(day);
    return {
      date: `${d.getDate()}/${d.getMonth() + 1}`,
      visitesParUtilisateur: visitesParUtilisateur[key] || 0,
      visites: visites[key] || 0,
    };
  });

  function statusBadge(status: string | undefined) {
    if (!status) return <Badge variant="secondary">En cours...</Badge>;
    if (status === "accessible")
      return <Badge className="bg-green-600 hover:bg-green-700">Accessible</Badge>;
    if (status === "contenu invalide")
      return <Badge className="bg-yellow-500 hover:bg-yellow-600">Contenu invalide</Badge>;
    return <Badge variant="destructive">Inaccessible</Badge>;
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-50 flex items-center justify-between border-b bg-background/95 px-4 py-3 backdrop-blur sm:px-6 lg:px-8">
        <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
          Administration
        </h1>
        <Button variant="default" onClick={handleLogout}>
          Deconnexion
        </Button>
      </header>

      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        <Tabs defaultValue="stats">
          <TabsList className="mb-6">
            <TabsTrigger value="stats">Statistiques</TabsTrigger>
            <TabsTrigger value="links">Etat des liens</TabsTrigger>
          </TabsList>

          <TabsContent value="stats" className="space-y-6">
            <div className="grid gap-4 sm:grid-cols-3">
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Total visiteurs
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">
                    {loadingStats ? "..." : totalVisits}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    Aujourd&apos;hui
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">
                    {loadingStats ? "..." : dailyVisits}
                  </p>
                </CardContent>
              </Card>
              <Card>
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-muted-foreground">
                    7 derniers jours
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-2xl font-bold">
                    {loadingStats ? "..." : weeklyVisits}
                  </p>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Visites (14 derniers jours)</CardTitle>
              </CardHeader>
              <CardContent>
                <ChartContainer config={chartConfig} className="h-[300px] w-full">
                  <LineChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" fontSize={12} />
                    <YAxis fontSize={12} />
                    <ChartTooltip content={<ChartTooltipContent />} />
                    <Line
                      type="monotone"
                      dataKey="visitesParUtilisateur"
                      stroke="var(--color-visitesParUtilisateur)"
                      strokeWidth={2}
                      dot={false}
                    />
                    <Line
                      type="monotone"
                      dataKey="visites"
                      stroke="var(--color-visites)"
                      strokeWidth={2}
                      dot={false}
                    />
                  </LineChart>
                </ChartContainer>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="links">
            <Card>
              <CardHeader>
                <CardTitle>Etat des liens iCal</CardTitle>
              </CardHeader>
              <CardContent>
                {loadingRooms ? (
                  <p className="text-sm text-muted-foreground">Chargement...</p>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Universite</TableHead>
                        <TableHead>Salle</TableHead>
                        <TableHead className="text-center">Statut</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {rooms.map((room) => (
                        <TableRow key={`${room.univ}-${room.room_name}`}>
                          <TableCell>{room.univ}</TableCell>
                          <TableCell>
                            <a
                              href={room.room_url}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="underline underline-offset-4"
                            >
                              {room.room_name}
                            </a>
                          </TableCell>
                          <TableCell className="text-center">
                            {statusBadge(linkStatuses[room.room_url])}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <footer className="mt-8 border-t">
        <div className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
          <p className="text-center text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} salles.tidic.fr. Tous droits reserves.
          </p>
        </div>
      </footer>
    </div>
  );
}
