import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const inter = Inter({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Trouver une Salle libre - Universite d'Avignon",
  description:
    "Vous avez besoin d'une salle pour travailler ? Utilisez cette page pour trouver des salles libres et savoir quand elles seront disponibles. Selectionnez une date et une heure pour voir les salles disponibles.",
  keywords:
    "univ, universite, avignon, universite avignon, univ avignon, uapv, e-uapv, univ-avignon, salles, salles libres, tidic, reservation",
  robots: "index, follow",
  openGraph: {
    title: "Trouver une Salle libre - Universite d'Avignon",
    description:
      "Trouvez des salles libres a l'Universite d'Avignon. CERI, Agroscience, Avignon-Centre.",
    url: "https://salles.tidic.fr",
    siteName: "Salles libres - Universite d'Avignon",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fr">
      <head>
        <Script id="gtm" strategy="afterInteractive">
          {`(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
          new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
          j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
          'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
          })(window,document,'script','dataLayer','GTM-KWDPDBHJ');`}
        </Script>
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-6JL94REJKC"
          strategy="afterInteractive"
        />
        <Script id="gtag" strategy="afterInteractive">
          {`window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-6JL94REJKC');`}
        </Script>
      </head>
      <body className={`${inter.variable} font-sans antialiased`}>
        <noscript>
          <iframe
            src="https://www.googletagmanager.com/ns.html?id=GTM-KWDPDBHJ"
            height="0"
            width="0"
            style={{ display: "none", visibility: "hidden" }}
          />
        </noscript>
        {children}
      </body>
    </html>
  );
}
