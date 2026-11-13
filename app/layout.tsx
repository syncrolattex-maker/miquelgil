import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/Nav";
import Reveal from "@/components/Reveal";

export const metadata: Metadata = {
  metadataBase: new URL("https://miquelgil.com"),
  title: {
    default: "Miquel Gil — Web Oficial",
    template: "%s | Miquel Gil — Oficial",
  },
  description:
    "Lloc oficial de Miquel Gil: cantant, compositor i productor valencià. Mig segle de música tradicional, fusió mediterrània, discografia, concerts i contractació.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Miquel Gil — Web Oficial",
    description:
      "Cantant, compositor i productor valencià. Un viatge per la música d'arrel, la fusió i el mestissatge mediterrani.",
    url: "https://miquelgil.com",
    siteName: "Miquel Gil Oficial",
    images: [
      {
        url: "/images/viatgerO1.jpg",
        width: 1200,
        height: 630,
        alt: "Miquel Gil — Música d'Arrel i Fusió Mediterrània",
      },
    ],
    locale: "ca_ES",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Miquel Gil — Web Oficial",
    description:
      "Cantant, compositor i productor valencià. Un viatge per la música d'arrel, la fusió i el mestissatge mediterrani.",
    images: ["/images/viatgerO1.jpg"],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      "max-video-preview": -1,
      "max-image-preview": "large",
      "max-snippet": -1,
    },
  },
};

const artistSchema = {
  "@context": "https://schema.org",
  "@type": "MusicGroup",
  name: "Miquel Gil",
  url: "https://miquelgil.com",
  image: "https://miquelgil.com/images/viatgerO1.jpg",
  genre: ["World Music", "Música d'Arrel", "Folk Mediterrani", "Fusió"],
  description:
    "Cantant i compositor de Catarroja (València). Cofundador d'Al Tall el 1975, pioner de la fusió mediterrània i veu de referència de la música tradicional viva.",
  sameAs: [
    "https://open.spotify.com/intl-es/artist/3wgWeRgIV5sU41Yqz6V7qn",
    "https://ca.wikipedia.org/wiki/Miquel_Gil",
    "https://www.instagram.com/miquelgil.oficial/",
    "https://www.facebook.com/miquelgil.oficial",
    "https://www.youtube.com/watch?v=kNwJUff7NlU",
    "https://www.discogs.com/artist/1258667-Miquel-Gil",
  ],
  contactPoint: {
    "@type": "ContactPoint",
    email: "managementgusma@gmail.com",
    contactType: "booking and management",
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
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(artistSchema) }}
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
