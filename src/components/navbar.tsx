"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Menu } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetTrigger,
  SheetTitle,
} from "@/components/ui/sheet";
import { cn } from "@/lib/utils";

const universities = [
  { slug: "ceri", label: "CERI" },
  { slug: "agroscience", label: "Agroscience" },
  { slug: "avignon-centre", label: "Avignon-Centre" },
];

function getUnivDisplayName(univ: string) {
  if (univ === "ceri") return "CERI - AVIGNON";
  return univ.toUpperCase();
}

export function Navbar({ currentUniv }: { currentUniv: string }) {
  const pathname = usePathname();

  return (
    <header className="sticky top-0 z-50 border-b bg-white backdrop-blur supports-[backdrop-filter]:bg-white/95">
      <nav className="mx-auto flex h-16 max-w-5xl items-center justify-between px-4 sm:px-6 lg:px-8">
        <h1 className="text-xl font-bold tracking-tight sm:text-2xl">
          {getUnivDisplayName(currentUniv)}
        </h1>

        <div className="hidden gap-1 md:flex">
          {universities.map((u) => (
            <Button
              key={u.slug}
              variant={pathname === `/univ/${u.slug}` ? "default" : "ghost"}
              size="sm"
              asChild
            >
              <Link href={`/univ/${u.slug}`}>{u.label}</Link>
            </Button>
          ))}
        </div>

        <Sheet>
          <SheetTrigger asChild className="md:hidden">
            <Button variant="ghost" size="icon">
              <Menu className="h-5 w-5" />
              <span className="sr-only">Ouvrir le menu</span>
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-72">
            <SheetTitle className="text-lg font-bold">
              {getUnivDisplayName(currentUniv)}
            </SheetTitle>
            <nav className="mt-6 flex flex-col gap-2">
              {universities.map((u) => (
                <Button
                  key={u.slug}
                  variant={
                    pathname === `/univ/${u.slug}` ? "default" : "ghost"
                  }
                  className={cn("justify-start")}
                  asChild
                >
                  <Link href={`/univ/${u.slug}`}>{u.label}</Link>
                </Button>
              ))}
            </nav>
          </SheetContent>
        </Sheet>
      </nav>
    </header>
  );
}
