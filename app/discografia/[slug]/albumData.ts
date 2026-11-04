export interface TrackItem {
  num: string;
  title: string;
  time: string;
}

export interface AwardItem {
  title: string;
  value: string;
}

export interface NextAlbumData {
  slug: string;
  title: string;
  year: string;
  type: string;
  genre: string;
  runtime: string;
  discArtUrl: string;
}

export interface AlbumDetail {
  slug: string;
  title: string;
  editionNumber: string;
  year: string;
  label: string;
  cover: string;
  discArtUrl: string;
  director: string; // Producció
  lyrics: string;
  music: string;
  musicians: string;
  genre: string;
  runtime: string;
  format: string;
  synopsis: string;
  quote: string;
  quoteAuthor?: string;
  trailerSrc: string; // YouTube URL o ID
  trailerStill: string;
  streamUrl: string;
  buyUrl?: string;
  awards: AwardItem[];
  tracklist: TrackItem[];
  nextAlbum: NextAlbumData;
}

export const ALBUMS_DATA: Record<string, AlbumDetail> = {
  organic: {
    slug: 'organic',
    title: 'Orgànic',
    editionNumber: 'EDICIÓ 02 / 12',
    year: '2001',
    label: 'Sonifolk',
    cover: '/images/disco_2.png',
    discArtUrl: '/images/disco_2.png',
    director: 'Sonifolk & Miquel Gil',
    lyrics: 'Enric Casasses, Ausiàs March, Teresa Pasqual',
    music: 'Miquel Gil',
    musicians: 'Manel Camp (piano), Borja Penalba (guitarra), Lluís Llach (veu conv.)',
    genre: "Folk Mediterrani, Fusió, Cant d'Estil",
    runtime: '48:32',
    format: 'Disc Òptic CD / Àudio Digital',
    synopsis:
      "El disc 'Orgànic' és una obra mestra musical que ens endinsa en les profunditats de les melodies tradicionals mediterrànies amb una perspectiva contemporània. A través d'una fusió de sonoritats autèntiques i innovadores, aquest àlbum captura l'ànima del Mediterrani amb la veu inconfusible de Miquel Gil al capdavant. Des de les tonalitats del cant d'estil fins a les influències més contemporànies, 'Orgànic' ofereix un viatge transcendent a través de la poesia i les arrels sonores valencianes.",
    quote: "L'amor és Déu en barca, un viatge tel·lúric per les arrels sonores del Mediterrani",
    quoteAuthor: "Miquel Gil · Orgànic (2001)",
    trailerSrc: 'https://www.youtube.com/watch?v=yVT-HCsypyk', // YouTube video oficial
    trailerStill: '/images/disco_2.png',
    streamUrl: 'https://open.spotify.com/search/Miquel%20Gil%20Organic',
    buyUrl: 'https://www.totfolk.cat/discografia-miquel-gil',
    awards: [
      { title: 'PREMIS OCTUBRE 2001', value: 'MILLOR DISC DE FOLK I MÚSICA D’ARREL' },
      { title: 'CRÍTICA ENDERROCK', value: 'DISC DE L’ANY EN LA CATEGORIA TRADICIONAL' },
      { title: 'WORLD MUSIC CHARTS EUROPE', value: 'SELECCIÓ DESTACADA DE LA CRÍTICA EUROPEA' }
    ],
    tracklist: [
      { num: '01', title: "Amaga L'arbre", time: '4:15' },
      { num: '02', title: "L'amor És Déu En Barca", time: '4:42' },
      { num: '03', title: "Línia De Flotació", time: '3:58' },
      { num: '04', title: "Primavera", time: '4:30' },
      { num: '05', title: "Com Si L'aigua", time: '5:10' },
      { num: '06', title: "I Dotze", time: '3:45' },
      { num: '07', title: "Van Tres", time: '4:02' },
      { num: '08', title: "Un Silenci", time: '3:20' },
      { num: '09', title: "Mire La Mar", time: '4:55' },
      { num: '10', title: "Cançó Dels Traginers", time: '5:22' },
      { num: '11', title: "Bec De Gavina", time: '4:33' }
    ],
    nextAlbum: {
      slug: 'kata',
      title: 'Katà',
      year: '2004',
      type: 'Àlbum Estudi',
      genre: 'World Music, Llaüt, Percussió',
      runtime: '45:18',
      discArtUrl: '/images/disco_3.png'
    }
  }
};
