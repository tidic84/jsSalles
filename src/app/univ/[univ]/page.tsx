import { notFound } from "next/navigation";
import { Navbar } from "@/components/navbar";
import { RoomDashboard } from "@/components/room-dashboard";
import { KonamiCode } from "@/components/konami";
import { getSession } from "@/lib/auth";
import { incrementVisites, incrementVisitesParUtilisateur } from "@/lib/queries";

const validUnivs = ["ceri", "agroscience", "avignon-centre"];

export async function generateStaticParams() {
  return validUnivs.map((univ) => ({ univ }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ univ: string }>;
}) {
  const { univ } = await params;
  const name = univ === "ceri" ? "CERI - Avignon" : univ.charAt(0).toUpperCase() + univ.slice(1);
  return {
    title: `Salles libres - ${name}`,
    description: `Trouvez des salles libres a ${name}, Universite d'Avignon.`,
  };
}

export default async function UnivPage({
  params,
}: {
  params: Promise<{ univ: string }>;
}) {
  const { univ } = await params;
  if (!validUnivs.includes(univ)) notFound();

  const today = new Date().toISOString().split("T")[0];
  try {
    const session = await getSession();
    await incrementVisites(today);
    if (!session.visited) {
      await incrementVisitesParUtilisateur(today);
      session.visited = true;
      await session.save();
    }
  } catch {}

  return (
    <div className="min-h-screen bg-background">
      <Navbar currentUniv={univ} />
      <KonamiCode />
      <main className="mx-auto max-w-5xl px-4 py-6 sm:px-6 lg:px-8">
        <RoomDashboard univ={univ} />

        <div className="mt-8 space-y-4 text-sm text-muted-foreground">
          <p>
            <strong className="text-foreground">
              Vous avez besoin d&apos;une salle pour travailler ?
            </strong>
            <br />
            Utilisez cette page pour trouver des salles libres et savoir quand
            elles seront disponibles. Selectionnez une date et une heure pour
            voir les salles disponibles a ce moment-la.
          </p>
          <p>
            <strong className="text-foreground">
              Il manque une salle ? Une salle ne devrait pas etre dans la liste ?
            </strong>
            <br />
            Contactez-moi sur Discord : <strong className="text-foreground">tidic</strong>
          </p>
        </div>
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
