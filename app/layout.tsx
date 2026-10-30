import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/Nav";
import Reveal from "@/components/Reveal";

export const metadata: Metadata = {
  title: "Miquel Gil — Oficial",
  description:
    "Lloc oficial de Miquel Gil: cantant, compositor i productor valencià. Discografia, biografia, agenda, media i contacte.",
  metadataBase: new URL("https://miquelgil.com"),
  openGraph: {
    title: "Miquel Gil — Oficial",
    description:
      "Cantant, compositor i productor valencià. Un viatge per la música d'arrel, la fusió i el mestissatge mediterrani.",
    images: ["/images/viatgerO1.jpg"],
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="ca">
      <head>
        <link
          rel="stylesheet"
          href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/5.15.4/css/all.min.css"
        />
      </head>
      <body>
        <Nav />
        {children}
        <Reveal />
      </body>
    </html>
  );
}
