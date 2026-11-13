import type { Metadata } from "next";
import "./globals.css";
import Nav from "@/components/Nav";
import Reveal from "@/components/Reveal";

export const metadata: Metadata = {
  metadataBase: new URL("https://miquelgil.com"),
  title: {
    default: "Miquel Gil — Arxiu Oficial i Trajectòria Artística",
    template: "%s | Miquel Gil — Arxiu Oficial",
  },
  description:
    "Arxiu oficial de Miquel Gil: mig segle de trajectòria artística (1975–2026), cofundador d'Al Tall, veu clau de la tradició mediterrània viva, discografia completa i cronologia poètica.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "Miquel Gil — Arxiu Oficial i Trajectòria Artística",
    description:
      "Arxiu i memòria oficial de Miquel Gil: mig segle de música tradicional valenciana, fusió mediterrània i poesia contemporània (1975–2026).",
    url: "https://miquelgil.com",
    siteName: "Miquel Gil — Arxiu Oficial",
    images: [
      {
        url: "/images/viatgerO1.jpg",
        width: 1200,
        height: 630,
        alt: "Miquel Gil — Arxiu Oficial i Trajectòria Artística",
      },
    ],
    locale: "ca_ES",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Miquel Gil — Arxiu Oficial i Trajectòria Artística",
    description:
      "Mig segle de trajectòria artística, cofundador d'Al Tall, arxiu sonor i veu clau de la cançó i la música d'arrel mediterrània.",
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
  "@type": "Person",
  name: "Miquel Gil",
  alternateName: "Miquel Gil Alfonso",
  url: "https://miquelgil.com",
  image: "https://miquelgil.com/images/viatgerO1.jpg",
  birthDate: "1956",
  birthPlace: {
    "@type": "Place",
    name: "Catarroja, València",
  },
  jobTitle: "Cantant, compositor i folklorista",
  description:
    "Músic i cantant valencià, cofundador del grup històric Al Tall el 1975, pioner de la fusió mediterrània amb Terminal Sur i autor d'obres canòniques com 'Orgànic', 'Katà' i 'Viatger'. Referent imprescindible del cant tradicional i de la poesia contemporània musicada.",
  genre: [
    "World Music",
    "Música d'Arrel Mediterrània",
    "Cant d'estil",
    "Folk Valencià",
    "Fusió",
  ],
  award: [
    "World Music Charts Europe (Núm. 1 / Top 5)",
    "Premis Ovidi Montllor a la Trajectòria",
    "Premi Enderrock de la Crítica",
  ],
  memberOf: [
    {
      "@type": "MusicGroup",
      name: "Al Tall",
      foundingDate: "1975",
      description: "Grup pioner de la recuperació de la música tradicional valenciana durant la Transició.",
    },
  ],
  knowsAbout: [
    "Música tradicional valenciana",
    "Cant d'estil i albaes",
    "Poesia de Vicent Andrés Estellés",
    "Poesia d'Enric Casasses",
    "Fusió mediterrània contemporània",
  ],
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
    contactType: "management i representació institucional",
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
