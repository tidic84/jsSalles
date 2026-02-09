import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function NotFound() {
  return (
    <main className="grid min-h-screen place-items-center bg-background px-6 py-24 sm:py-32 lg:px-8">
      <div className="text-center">
        <p className="text-base font-semibold text-primary">404</p>
        <h1 className="mt-4 text-balance text-5xl font-semibold tracking-tight text-foreground sm:text-7xl">
          Page non trouvee
        </h1>
        <p className="mt-6 text-pretty text-lg font-medium text-muted-foreground sm:text-xl/8">
          Desole, la page que vous cherchez n&apos;existe pas.
        </p>
        <div className="mt-10 flex items-center justify-center gap-x-6">
          <Button asChild>
            <Link href="/">Revenir a l&apos;accueil</Link>
          </Button>
          <a
            href="mailto:contact@tidic.fr"
            className="text-sm font-semibold text-foreground"
          >
            Contacter le support <span aria-hidden="true">&rarr;</span>
          </a>
        </div>
      </div>
    </main>
  );
}
