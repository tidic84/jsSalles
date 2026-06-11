import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // node-ical (et ses dépendances) ne supporte pas le bundling Turbopack
  serverExternalPackages: ["node-ical"],
};

export default nextConfig;
