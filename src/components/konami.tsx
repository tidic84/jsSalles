"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export function KonamiCode() {
  const router = useRouter();

  useEffect(() => {
    const sequence = [
      "ArrowUp",
      "ArrowUp",
      "ArrowDown",
      "ArrowDown",
      "ArrowLeft",
      "ArrowRight",
      "ArrowLeft",
      "ArrowRight",
      "KeyB",
      "KeyQ",
    ];
    let currentIndex = 0;

    function handleKeyDown(event: KeyboardEvent) {
      if (event.code === sequence[currentIndex]) {
        currentIndex++;
        if (currentIndex === sequence.length) {
          router.push("/admin");
          currentIndex = 0;
        }
      } else {
        currentIndex = 0;
      }
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [router]);

  return null;
}
