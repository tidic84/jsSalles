import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata = {
  title: "Salles libres",
  description: "Liste des Salles libres dans l'université d'avignon. UAPV: Centre ville, CERI et Agroscience",
  keywords: ["salles libres", "université d'avignon", "centre ville", "ceri", "agroscience"],
  author: "Tidic",
  robots: "index, follow",
//   canonical: "",
  openGraph: {
    title: "Salles libres",
    description: "Liste des Salles libres dans l'université d'avignon. UAPV: Centre ville, CERI et Agroscience",
    // url: "",
    siteName: "Salles libres",
  },
};

export default function RootLayout({ children }) {
  return (
    <html lang="fr">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
