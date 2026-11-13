import React from 'react';
import { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { ALBUMS_DATA } from './albumData';
import ProductionClient from './ProductionClient';

interface PageProps {
  params: {
    slug: string;
  };
}

export function generateStaticParams() {
  return Object.keys(ALBUMS_DATA).map((slug) => ({
    slug,
  }));
}

export async function generateMetadata({ params }: PageProps): Promise<Metadata> {
  const album = ALBUMS_DATA[params.slug];
  if (!album) {
    return {
      title: 'Disc no trobat | Miquel Gil',
    };
  }

  const title = `${album.title} (${album.year}) | Miquel Gil — Discografia Oficial`;
  const description = `${album.title} (${album.year}), producció de ${album.director || 'Miquel Gil'} discogràfica ${album.label}. Gènere: ${album.genre}. ${album.synopsis.slice(0, 150)}...`;

  return {
    title,
    description,
    alternates: {
      canonical: `https://miquelgil.com/discografia/${album.slug}`,
    },
    openGraph: {
      title,
      description,
      url: `https://miquelgil.com/discografia/${album.slug}`,
      images: [
        {
          url: album.cover || '/images/viatgerO1.jpg',
          width: 800,
          height: 800,
          alt: `Portada oficial de l'àlbum ${album.title} de Miquel Gil`,
        },
      ],
      type: 'music.album',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description,
      images: [album.cover || '/images/viatgerO1.jpg'],
    },
  };
}

export default function ProductionPage({ params }: PageProps) {
  const album = ALBUMS_DATA[params.slug];

  if (!album) {
    notFound();
  }

  // Schema.org MusicAlbum JSON-LD
  const albumSchema = {
    '@context': 'https://schema.org',
    '@type': 'MusicAlbum',
    name: album.title,
    byArtist: {
      '@type': 'MusicGroup',
      name: 'Miquel Gil',
      url: 'https://miquelgil.com',
    },
    datePublished: album.year,
    genre: album.genre,
    image: album.cover ? `https://miquelgil.com${album.cover}` : undefined,
    recordLabel: album.label,
    numTracks: album.tracklist?.length || 0,
    track: album.tracklist?.map((t, idx) => ({
      '@type': 'MusicRecording',
      name: t.title,
      position: idx + 1,
      duration: t.time,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(albumSchema) }}
      />
      <ProductionClient album={album} />
    </>
  );
}
