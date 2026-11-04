import React from 'react';
import { notFound } from 'next/navigation';
import { ALBUMS_DATA } from './albumData';
import ProductionClient from './ProductionClient';

interface PageProps {
  params: {
    slug: string;
  };
}

export function generateStaticParams() {
  // Inicialmente generamos solo la primera ficha ('organic') para revisión
  return Object.keys(ALBUMS_DATA).map((slug) => ({
    slug
  }));
}

export default function ProductionPage({ params }: PageProps) {
  const album = ALBUMS_DATA[params.slug];

  if (!album) {
    notFound();
  }

  return <ProductionClient album={album} />;
}
