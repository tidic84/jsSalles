"use client";

import { useEffect } from "react";

export function PwaRegister() {
  useEffect(() => {
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {
        // L'app fonctionne sans service worker (navigation privée, etc.)
      });
    }
  }, []);
  return null;
}
