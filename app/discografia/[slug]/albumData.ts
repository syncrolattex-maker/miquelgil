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
  // 1. VIATGER (2024)
  viatger: {
    slug: 'viatger',
    title: 'Viatger',
    editionNumber: 'EDICIÓ 12 / 12',
    year: '2024',
    label: 'Temps Record',
    cover: '/images/disco_8.webp',
    discArtUrl: '/images/disco_8.webp',
    director: 'Toni Xuclà & Miquel Gil',
    lyrics: 'Enric Casasses, Begonya Pozo, Miquel Gil',
    music: 'Miquel Gil & Toni Xuclà',
    musicians: 'Toni Xuclà (guitarres), Eduard Navarro (instruments tradicionals), Miquel Gil (veu)',
    genre: 'Arrel Viva, Fusió Mediterrània, Tradició Contemporània',
    runtime: '42:15',
    format: 'Disc Òptic CD / Àudio Digital',
    synopsis:
      "Crònica musical que commemora vint-i-cinc anys de trajectòria en solitari de Miquel Gil, transportant-nos a través de paisatges emocionals i històries íntimes. Amb una combinació de melodies melancòliques, lletres evocadores i textures contemporànies, 'Viatger' és una oda a la transformació personal i a la memòria viva del cant mediterrani.",
    quote: "Vint-i-cinc anys de viatge sonor per les venes obertes de la Mediterrània",
    quoteAuthor: 'Miquel Gil · Viatger (2024)',
    trailerSrc: 'https://www.youtube.com/watch?v=kNwJUff7NlU',
    trailerStill: '/images/MiquelGilViatger_Principal.webp',
    streamUrl: 'https://open.spotify.com/search/Miquel%20Gil%20Viatger',
    buyUrl: 'https://www.youtube.com/watch?v=kNwJUff7NlU',
    awards: [
      { title: 'PREMIS CARLES SANTOS 2024', value: 'MILLOR DISC DE MÚSICA D’ARREL' },
      { title: 'CRÍTICA ENDERROCK 2024', value: 'FINALISTA AL DISC DE L’ANY' },
      { title: 'DIARI LA VEU', value: 'CELEBRACIÓ DE 25 ANYS DE MESTRATGE' }
    ],
    tracklist: [
      { num: '01', title: 'Nineta', time: '4:12' },
      { num: '02', title: 'La Resposta', time: '3:45' },
      { num: '03', title: 'Ai Ramon!!', time: '3:58' },
      { num: '04', title: 'Sa Serena', time: '4:20' },
      { num: '05', title: 'La Veritat', time: '4:05' },
      { num: '06', title: 'Racons', time: '3:30' },
      { num: '07', title: 'Rusaffi', time: '4:42' },
      { num: '08', title: 'Cecilia', time: '3:50' },
      { num: '09', title: 'Viatger', time: '5:15' },
      { num: '10', title: 'Otoño en Navarrés', time: '4:38' }
    ],
    nextAlbum: {
      slug: 'geometries',
      title: 'Geometries',
      year: '2019',
      type: 'Àlbum Estudi',
      genre: 'Folk Mediterrani, Polifonia Poètica',
      runtime: '44:30',
      discArtUrl: '/images/disco_7.jpg'
    }
  },

  // 2. GEOMETRIES (2019)
  geometries: {
    slug: 'geometries',
    title: 'Geometries',
    editionNumber: 'EDICIÓ 11 / 12',
    year: '2019',
    label: 'Temps Record',
    cover: '/images/disco_7.jpg',
    discArtUrl: '/images/disco_7.jpg',
    director: 'Miquel Gil & Col·lectiu Geometries',
    lyrics: 'Vicent Andrés Estellés, Enric Casasses, Teresa Pasqual',
    music: 'Miquel Gil',
    musicians: 'Borja Penalba, Eduard Navarro, Gusmà Gil (baix), Miquel Gil (veu)',
    genre: 'Folk Mediterrani, Polifonia Poètica, Cant d’Estil',
    runtime: '44:30',
    format: 'Disc Òptic CD / Àudio Digital',
    synopsis:
      "Arquitectura polifònica construïda sobre versos de Vicent Andrés Estellés i Enric Casasses. A través d'una combinació d'harmonies polifòniques i ritmes complexos, 'Geometries' és una reflexió profunda sobre l'ordre i el caos, la simetria i l'asimetria, capturant la bellesa matemàtica i emocional del cant valencià.",
    quote: "La veu traça polígons d'emoció pura sobre la pell del temps",
    quoteAuthor: 'Miquel Gil · Geometries (2019)',
    trailerSrc: 'https://www.youtube.com/watch?v=yVT-HCsypyk',
    trailerStill: '/images/miquel-gil-juan-miguel-morales-14-scaled.jpg',
    streamUrl: 'https://open.spotify.com/search/Miquel%20Gil%20Geometries',
    buyUrl: 'https://www.totfolk.cat/discografia-miquel-gil',
    awards: [
      { title: 'PREMIS CARLES SANTOS 2019', value: 'MILLOR DISC DE MÚSICA TRADICIONAL' },
      { title: 'PREMIS OVÍDI MONTLLOR 2019', value: 'MILLOR PRODUCCIÓ I ARRANJAMENTS' },
      { title: 'MONDOSONORO', value: 'ARQUITECTURA POLIFÒNICA FASCINANT (★★★★★)' }
    ],
    tracklist: [
      { num: '01', title: 'Llei Horària', time: '3:54' },
      { num: '02', title: 'Hotel París', time: '4:18' },
      { num: '03', title: 'Canvi De Clima', time: '3:42' },
      { num: '04', title: '#Copla 42', time: '4:30' },
      { num: '05', title: 'Copeo', time: '3:25' },
      { num: '06', title: 'Mort Petita', time: '5:02' },
      { num: '07', title: 'Terra', time: '4:15' },
      { num: '08', title: 'Tempesta', time: '3:50' },
      { num: '09', title: 'La Que Diu', time: '4:40' },
      { num: '10', title: 'Geometries', time: '6:12' }
    ],
    nextAlbum: {
      slug: 'per-marcianes',
      title: 'Per marcianes',
      year: '2011',
      type: 'Àlbum Estudi',
      genre: 'Tradició Mutant, Experimentació Acústica',
      runtime: '46:10',
      discArtUrl: '/images/disco_6.png'
    }
  },

  // 3. PER MARCIANES (2011)
  'per-marcianes': {
    slug: 'per-marcianes',
    title: 'Per marcianes',
    editionNumber: 'EDICIÓ 10 / 12',
    year: '2011',
    label: 'Temps Record',
    cover: '/images/disco_6.png',
    discArtUrl: '/images/disco_6.png',
    director: 'Eduard Navarro & Miquel Gil',
    lyrics: 'Manel Rodríguez-Castelló, Marc Granell, Miquel Gil',
    music: 'Miquel Gil & Eduard Navarro',
    musicians: 'Eduard Navarro (dolçaina, moraharpa), Tobal Rentero (cordes), Miquel Gil (veu)',
    genre: 'Tradició Mutant, Experimentació Acústica i Elèctrica',
    runtime: '46:10',
    format: 'Disc Òptic CD / Àudio Digital',
    synopsis:
      "Laboratori d'experimentació acústica i elèctrica on els cants de batre i les melodies valencianes viatgen cap a coordenades inèdites. Les cançons de 'Per Marcianes' combinen sons innovadors i ritmes intergalàctics, creant una experiència sonora única que obri nous camins a la tradició musical.",
    quote: "Cants de batre que viatgen cap a coordenades espacials inexplorades",
    quoteAuthor: 'Miquel Gil · Per marcianes (2011)',
    trailerSrc: 'https://www.youtube.com/watch?v=yVT-HCsypyk',
    trailerStill: '/images/miquel-gil-delange-detras.jpg',
    streamUrl: 'https://open.spotify.com/search/Miquel%20Gil%20Per%20Marcianes',
    buyUrl: 'https://www.totfolk.cat/discografia-miquel-gil',
    awards: [
      { title: 'PREMIS OVÍDI MONTLLOR 2011', value: 'MILLOR DISC DE FOLK' },
      { title: 'WORLD MUSIC CENTRAL', value: 'ELECTRICITAT I TRADICIÓ VALENCIANA' },
      { title: 'SONS MEDITERRÀNIA', value: 'RUMB A NOUS HORITZONS SONORS' }
    ],
    tracklist: [
      { num: '01', title: 'De La Mar', time: '4:10' },
      { num: '02', title: 'Rosa De Paper', time: '3:55' },
      { num: '03', title: 'X Marcianes', time: '4:28' },
      { num: '04', title: 'En Acabant', time: '3:40' },
      { num: '05', title: 'La Cileta', time: '4:15' },
      { num: '06', title: 'Vesprades', time: '3:50' },
      { num: '07', title: 'Com Més', time: '4:05' },
      { num: '08', title: 'Les Xiquetes', time: '3:35' },
      { num: '09', title: 'Somriures', time: '4:50' },
      { num: '10', title: 'Mirant La Llum', time: '4:22' },
      { num: '11', title: 'Ferida', time: '4:45' }
    ],
    nextAlbum: {
      slug: 'gil-camp-trio',
      title: 'Gil & Camp Trio',
      year: '2009',
      type: 'Àlbum Estudi',
      genre: 'Jazz Mediterrani, Música de Cambra',
      runtime: '43:25',
      discArtUrl: '/images/disco_4.png'
    }
  },

  // 4. GIL & CAMP TRIO (2009)
  'gil-camp-trio': {
    slug: 'gil-camp-trio',
    title: 'Gil & Camp Trio',
    editionNumber: 'EDICIÓ 09 / 12',
    year: '2009',
    label: 'Temps Record',
    cover: '/images/disco_4.png',
    discArtUrl: '/images/disco_4.png',
    director: 'Manel Camp & Miquel Gil',
    lyrics: 'Poetes Contemporanis, Tradicional',
    music: 'Miquel Gil & Manel Camp',
    musicians: 'Manel Camp (piano), David Pastor (trompeta), Miquel Gil (veu)',
    genre: 'Jazz Mediterrani, Música de Cambra, Improvisació',
    runtime: '43:25',
    format: 'Disc Òptic CD / Àudio Digital',
    synopsis:
      "Diàleg íntim i lliure entre el piano jazzístic de Manel Camp, la trompeta lluminosa de David Pastor i la gola tel·lúrica de Miquel Gil. Enregistrat amb respiració de música de cambra, aquest treball desborda complicitat, improvisació i elegància sonora.",
    quote: "Diàleg hipnòtic i lliure entre la tradició tel·lúrica i el piano de cambra",
    quoteAuthor: 'Manel Camp & Miquel Gil · (2009)',
    trailerSrc: 'https://www.youtube.com/watch?v=yVT-HCsypyk',
    trailerStill: '/images/2002espai2.jpg',
    streamUrl: 'https://open.spotify.com/search/Miquel%20Gil%20Manel%20Camp',
    buyUrl: 'https://www.totfolk.cat/discografia-miquel-gil',
    awards: [
      { title: 'CUADERNOS DE JAZZ', value: 'DIÀLEG HIPNÒTIC I LLIURE (★★★★★)' },
      { title: 'EL PAÍS CRÍTICA', value: 'JAZZ DE CAMBRA MEDITERRANI EXCEPCIONAL' }
    ],
    tracklist: [
      { num: '01', title: 'Preludi De Cambra', time: '3:40' },
      { num: '02', title: "L'Amor És Déu En Barca (Trio)", time: '5:12' },
      { num: '03', title: 'Improvisació I', time: '3:20' },
      { num: '04', title: 'Cançó De Bressol', time: '4:15' },
      { num: '05', title: 'Dels Meus Ulls', time: '4:50' },
      { num: '06', title: "Nocturn A L'Alcúdia", time: '4:05' },
      { num: '07', title: 'Improvisació II', time: '3:35' },
      { num: '08', title: 'Cançó Dels Traginers (Trio)', time: '5:30' },
      { num: '09', title: 'Postludi', time: '4:10' }
    ],
    nextAlbum: {
      slug: 'eixos',
      title: 'Eixos',
      year: '2006',
      type: 'Àlbum Estudi',
      genre: 'Folk Mediterrani, Poesia',
      runtime: '47:18',
      discArtUrl: '/images/disco_5.png'
    }
  },

  // 5. EIXOS (2006)
  eixos: {
    slug: 'eixos',
    title: 'Eixos',
    editionNumber: 'EDICIÓ 08 / 12',
    year: '2006',
    label: 'Temps Record',
    cover: '/images/disco_5.png',
    discArtUrl: '/images/disco_5.png',
    director: 'Miquel Gil',
    lyrics: 'Enric Casasses, Marc Granell, Miquel Gil',
    music: 'Miquel Gil',
    musicians: 'Raül Rodríguez, Eduard Navarro, Manel Camp, Miquel Gil',
    genre: 'Folk Mediterrani, Poesia Contemporània, Fusió',
    runtime: '47:18',
    format: 'Disc Òptic CD / Àudio Digital',
    synopsis:
      "'Eixos' destaca per la seua profunditat emocional i riquesa musical. Cartografia sonora d'una Mediterrània oberta i cosmopolita que connecta poetes contemporanis amb ritmes ancestrals de ribera a ribera, abordant l'amor, la pèrdua, la lluita i la superació humana.",
    quote: "Cartografia sonora d'una Mediterrània oberta, lliure i cosmopolita",
    quoteAuthor: 'Miquel Gil · Eixos (2006)',
    trailerSrc: 'https://www.youtube.com/watch?v=yVT-HCsypyk',
    trailerStill: '/images/miquel-gil-juan-miguel-morales-8-scaled.jpg',
    streamUrl: 'https://open.spotify.com/search/Miquel%20Gil%20Eixos',
    buyUrl: 'https://www.totfolk.cat/discografia-miquel-gil',
    awards: [
      { title: 'FOLKER MAGAZINE', value: 'GRAN VEU DE LA MEDITERRÀNIA (★★★★★)' },
      { title: 'ROOTSWORLD CRITICS', value: 'CARTOGRAFIA SONORA IMPECABLE' },
      { title: 'PREMIS ENDERROCK 2007', value: 'MILLOR DISC DE CANÇÓ D’AUTOR' }
    ],
    tracklist: [
      { num: '01', title: 'Tinc Una Pena', time: '4:10' },
      { num: '02', title: 'Fil De Vint', time: '3:45' },
      { num: '03', title: 'De La China', time: '4:22' },
      { num: '04', title: 'Dels Meus Ulls', time: '4:50' },
      { num: '05', title: 'Gola Ampla', time: '3:38' },
      { num: '06', title: 'Pensant Maneres', time: '4:15' },
      { num: '07', title: 'Pepe Tono', time: '3:52' },
      { num: '08', title: 'Tic Tac', time: '4:05' },
      { num: '09', title: 'Parea', time: '4:30' },
      { num: '10', title: 'Eix Tort', time: '4:45' },
      { num: '11', title: 'Homenatge', time: '5:06' }
    ],
    nextAlbum: {
      slug: 'en-concert',
      title: 'En Concert',
      year: '2006',
      type: 'Àlbum Directe',
      genre: 'Directe, Acústic, Energia Escènica',
      runtime: '52:40',
      discArtUrl: '/images/disco_4.png'
    }
  },

  // 6. EN CONCERT (2006)
  'en-concert': {
    slug: 'en-concert',
    title: 'En Concert',
    editionNumber: 'EDICIÓ 07 / 12',
    year: '2006',
    label: 'Galileo Music',
    cover: '/images/disco_4.png',
    discArtUrl: '/images/disco_4.png',
    director: 'Galileo MC & Miquel Gil',
    lyrics: 'Ausiàs March, Enric Casasses, Tradicional',
    music: 'Miquel Gil',
    musicians: 'Raül Rodríguez (tres flamenc), Borja Penalba (guitarra), Miquel Gil (veu)',
    genre: 'Directe, Acústic, Energia Escènica, Flamenc-Folk',
    runtime: '52:40',
    format: 'Disc Òptic CD / Àudio Digital',
    synopsis:
      "Amb una selecció de les seues cançons més estimades interpretades en viu, aquest àlbum ofereix una experiència immersiva que et transporta directament a la màgia dels escenaris internacionals de Miquel Gil, capturant la seua força tel·lúrica irrepetible i el foc de la improvisació en directe.",
    quote: "La força tel·lúrica i l'energia crua del repertori mediterrani en viu",
    quoteAuthor: 'Miquel Gil · En Concert (2006)',
    trailerSrc: 'https://www.youtube.com/watch?v=yVT-HCsypyk',
    trailerStill: '/images/7da63abc66f3f873ddd7224c945e38f3-scaled.jpg',
    streamUrl: 'https://open.spotify.com/search/Miquel%20Gil%20En%20Concert',
    buyUrl: 'https://www.totfolk.cat/discografia-miquel-gil',
    awards: [
      { title: 'ENDERROCK EN DIRECTE', value: 'DIMENSIÓ TEL·LÚRICA IRREPETIBLE' },
      { title: 'B-RITMOS AWARDS', value: 'FORÇA ESCÈNICA ABSOLUTA (★★★★★)' },
      { title: 'WORLD MUSIC CHARTS', value: 'MILLOR ENREGISTRAMENT EN DIRECTE' }
    ],
    tracklist: [
      { num: '01', title: 'Bandereta (Live)', time: '4:20' },
      { num: '02', title: 'Tornada (Live)', time: '4:45' },
      { num: '03', title: 'Tic-Tac (Live)', time: '4:10' },
      { num: '04', title: "Amaga L'Arbre (Live)", time: '4:35' },
      { num: '05', title: 'Van Tres (Live)', time: '4:12' },
      { num: '06', title: 'Katà (Live)', time: '5:18' },
      { num: '07', title: "L'Amor És Déu En Barca (Live)", time: '5:25' },
      { num: '08', title: 'Memòria (Live)', time: '4:50' },
      { num: '09', title: 'Adieu Paure Carnavas / Wa Habibi', time: '6:10' },
      { num: '10', title: 'Cançó Dels Traginers (Live)', time: '5:40' },
      { num: '11', title: "Ballo Sardo / Cavall D'Arabia", time: '6:35' }
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
  },

  // 7. KATÀ (2004)
  kata: {
    slug: 'kata',
    title: 'Katà',
    editionNumber: 'EDICIÓ 06 / 12',
    year: '2004',
    label: 'Temps Record',
    cover: '/images/disco_3.png',
    discArtUrl: '/images/disco_3.png',
    director: 'Miquel Gil',
    lyrics: 'Enric Casasses, Feliu Formosa, Teresa Pasqual',
    music: 'Miquel Gil',
    musicians: 'Raül Rodríguez (tres flamenc), Manel Camp, Eduard Navarro, Miquel Gil',
    genre: 'World Music, Llaüt, Percussió, Granaïnes, Cant d’Estil',
    runtime: '45:18',
    format: 'Disc Òptic CD / Àudio Digital',
    synopsis:
      "'Katà' és una obra captivadora que fusiona les melodies tradicionals mediterrànies amb una moderna exploració sonora. Amb una combinació única de granaïnes, fandangos, rembetika i cordes orientals, l'àlbum va assolir un gran reconeixement a les llistes europees de World Music.",
    quote: "Pont sonor entre Orient i Occident impulsat per llaüts, cordes i percussions",
    quoteAuthor: 'Miquel Gil · Katà (2004)',
    trailerSrc: 'https://www.youtube.com/watch?v=yVT-HCsypyk',
    trailerStill: '/images/miquel-gil-delange-detras.jpg',
    streamUrl: 'https://open.spotify.com/search/Miquel%20Gil%20Kata',
    buyUrl: 'https://www.totfolk.cat/discografia-miquel-gil',
    awards: [
      { title: 'FROOTS MAGAZINE', value: 'PONT SONOR FASCINANT (★★★★★)' },
      { title: 'WORLD MUSIC CHARTS EUROPE', value: 'SELECCIÓ DESTACADA DE LA CRÍTICA' },
      { title: 'PREMIS OCTUBRE 2004', value: 'MILLOR DISC DE FUSIÓ MEDITERRÀNIA' }
    ],
    tracklist: [
      { num: '01', title: 'Bandereta', time: '3:45' },
      { num: '02', title: 'Tornada', time: '4:12' },
      { num: '03', title: 'Katà', time: '4:50' },
      { num: '04', title: 'Memòria', time: '4:05' },
      { num: '05', title: 'Fandango', time: '3:58' },
      { num: '06', title: 'I Giren', time: '4:22' },
      { num: '07', title: 'Fènix', time: '3:40' },
      { num: '08', title: 'Saturnàlia', time: '4:15' },
      { num: '09', title: "Un Bolero (A L'Alcúdia)", time: '4:30' },
      { num: '10', title: "Cavall D'Arabia", time: '5:02' },
      { num: '11', title: "S'Amaga", time: '3:39' }
    ],
    nextAlbum: {
      slug: 'organic',
      title: 'Orgànic',
      year: '2001',
      type: 'Àlbum Estudi',
      genre: "Folk Mediterrani, Fusió, Cant d'Estil",
      runtime: '48:32',
      discArtUrl: '/images/disco_2.png'
    }
  },

  // 8. ORGÀNIC (2001) - MASTER
  organic: {
    slug: 'organic',
    title: 'Orgànic',
    editionNumber: 'EDICIÓ 05 / 12',
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
    quoteAuthor: 'Miquel Gil · Orgànic (2001)',
    trailerSrc: 'https://www.youtube.com/watch?v=yVT-HCsypyk',
    trailerStill: '/images/miquel-gil-juan-miguel-morales-13-scaled.jpg',
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
      { num: '03', title: 'Línia De Flotació', time: '3:58' },
      { num: '04', title: 'Primavera', time: '4:30' },
      { num: '05', title: "Com Si L'aigua", time: '5:10' },
      { num: '06', title: 'I Dotze', time: '3:45' },
      { num: '07', title: 'Van Tres', time: '4:02' },
      { num: '08', title: 'Un Silenci', time: '3:20' },
      { num: '09', title: 'Mire La Mar', time: '4:55' },
      { num: '10', title: 'Cançó Dels Traginers', time: '5:22' },
      { num: '11', title: 'Bec De Gavina', time: '4:33' }
    ],
    nextAlbum: {
      slug: 'buscando-tu-olor',
      title: 'Buscando tu olor',
      year: '1997',
      type: 'Àlbum Estudi',
      genre: 'Fusió, Flamenc, Rock Acústic',
      runtime: '41:50',
      discArtUrl: '/images/disco_1.jpg'
    }
  },

  // 9. BUSCANDO TU OLOR (1997)
  'buscando-tu-olor': {
    slug: 'buscando-tu-olor',
    title: 'Buscando tu olor',
    editionNumber: 'EDICIÓ 04 / 12',
    year: '1997',
    label: 'Picap / Sons Flamencs',
    cover: '/images/disco_1.jpg',
    discArtUrl: '/images/disco_1.jpg',
    director: 'Miquel Gil',
    lyrics: 'Miquel Gil, Poesia Urbana, Tradicional',
    music: 'Miquel Gil',
    musicians: 'Miquel Gil (guitarra i veu), Col·laboradors de Flamenc i Rock',
    genre: 'Fusió, Flamenc, Rock Acústic, Poesia Urbana',
    runtime: '41:50',
    format: 'Disc Òptic CD / Àudio Digital',
    synopsis:
      "Primer treball discogràfic en solitari on l'ex-vocalista d'Al Tall explora lliurement la fusió amb el flamenc, el rock d'arrel i la poesia urbana, marcant l'inici d'un camí personal inconfusible que canviaria el panorama del folk valencià contemporani.",
    quote: "Primer pas en solitari cap a la llibertat creativa i el mestissatge acústic",
    quoteAuthor: 'Miquel Gil · Buscando tu olor (1997)',
    trailerSrc: 'https://www.youtube.com/watch?v=yVT-HCsypyk',
    trailerStill: '/images/buscando-tu-olor-1997.jpg',
    streamUrl: 'https://open.spotify.com/search/Miquel%20Gil%20Buscando%20tu%20olor',
    buyUrl: 'https://www.totfolk.cat/discografia-miquel-gil',
    awards: [
      { title: 'ARXIU VALENCIÀ', value: 'DEBUT EN SOLITARI VALENT (★★★★☆)' },
      { title: 'LEVANTE EMV', value: 'LABORATORI SONOR INÈDIT DE FUSIÓ' }
    ],
    tracklist: [
      { num: '01', title: 'Buscando Tu Olor', time: '4:25' },
      { num: '02', title: 'Rumba Del Temps', time: '3:48' },
      { num: '03', title: 'Aigua Amunt', time: '4:12' },
      { num: '04', title: 'Cançó De Nit', time: '3:50' },
      { num: '05', title: 'Vent De Ponent', time: '4:35' },
      { num: '06', title: 'Salvem El Botànic', time: '4:02' },
      { num: '07', title: 'Vents Del Sud', time: '3:38' },
      { num: '08', title: 'Mirades', time: '4:10' },
      { num: '09', title: "Final D'Etapa", time: '4:45' }
    ],
    nextAlbum: {
      slug: 'viajero',
      title: 'Viajero',
      year: '1988',
      type: 'Àlbum Estudi',
      genre: 'Electro-Mediterrània, Sintetitzadors',
      runtime: '39:12',
      discArtUrl: '/images/disco_1.jpg'
    }
  },

  // 10. VIAJERO (1988) - TERMINAL SUR
  viajero: {
    slug: 'viajero',
    title: 'Viajero',
    editionNumber: 'EDICIÓ 03 / 12',
    year: '1988',
    label: 'Plataforma Discos / PDI',
    cover: '/images/disco_1.jpg',
    discArtUrl: '/images/disco_1.jpg',
    director: 'Terminal Sur & Miquel Gil',
    lyrics: 'Terminal Sur, Miquel Gil',
    music: 'Terminal Sur',
    musicians: 'Miquel Gil (veu), Sintetitzadors, Baix elèctric, Programacions',
    genre: 'Electro-Mediterrània, Sintetitzadors, Pop-Rock Mediterrani',
    runtime: '39:12',
    format: 'Vinil LP / Disc Òptic CD',
    synopsis:
      "Aventura pionera amb el grup Terminal Sur als anys vuitanta, combinant sintetitzadors analògics, programacions rítmiques i modalitat mediterrània. Un treball visionari que va anticipar la fusió electrònica d'arrels.",
    quote: "Sintetitzadors i ritmes rumbes al servei de la modernitat mediterrània",
    quoteAuthor: 'Terminal Sur & Miquel Gil · Viajero (1988)',
    trailerSrc: 'https://www.youtube.com/watch?v=yVT-HCsypyk',
    trailerStill: '/images/TerminalSur.jpg',
    streamUrl: 'https://open.spotify.com/search/Terminal%20Sur%20Viajero',
    buyUrl: 'https://www.totfolk.cat/discografia-miquel-gil',
    awards: [
      { title: 'RNE RADIO 3', value: 'DISC AVANÇAT AL SEU TEMPS (★★★★★)' },
      { title: 'DISCOS MEDICINALES', value: 'PIONERS DE LA FUSIÓ ELECTRO-FOLK' }
    ],
    tracklist: [
      { num: '01', title: 'Viajero', time: '4:15' },
      { num: '02', title: 'Dinero Negro', time: '3:40' },
      { num: '03', title: 'Sahariana', time: '4:25' },
      { num: '04', title: 'Bon Matí', time: '3:35' },
      { num: '05', title: 'Vampiro', time: '4:02' },
      { num: '06', title: 'Esa Oscura Voz En Off', time: '4:50' },
      { num: '07', title: 'Blau', time: '5:10' }
    ],
    nextAlbum: {
      slug: 'cants-arrel',
      title: "Cants d'Arrel",
      year: '1985',
      type: 'Àlbum Tradicional',
      genre: 'Cant Valencià, Polifonia',
      runtime: '43:40',
      discArtUrl: '/images/disco_8.webp'
    }
  },

  // 11. CANTS D'ARREL (1985) - AL TALL & MIQUEL GIL
  'cants-arrel': {
    slug: 'cants-arrel',
    title: "Cants d'Arrel",
    editionNumber: 'EDICIÓ 02 / 12',
    year: '1985',
    label: 'Al Tall & Difusió Mediterrània',
    cover: '/images/disco_8.webp',
    discArtUrl: '/images/disco_8.webp',
    director: 'Al Tall & Miquel Gil',
    lyrics: 'Tradició Oral Valenciana, Vicent Torrent',
    music: 'Al Tall & Miquel Gil',
    musicians: 'Vicent Torrent, Miquel Gil, Manolo Lledó, Instruments Tradicionals',
    genre: "Cant Valencià, Polifonia Tradicional, Cant d'Estil",
    runtime: '43:40',
    format: 'Vinil LP / Disc Òptic CD',
    synopsis:
      "Antologia essencial de polifonia tradicional i cant d'estil que preserva el llegat oral de les comarques centrals i l'Horta de València. Miquel Gil destaca per la seua potència vocal i el respecte absolut a la puresa dels cants de la terra.",
    quote: "Memòria viva d'un poble i polifonia autèntica preservada per al futur",
    quoteAuthor: "Al Tall & Miquel Gil · Cants d'Arrel (1985)",
    trailerSrc: 'https://www.youtube.com/watch?v=yVT-HCsypyk',
    trailerStill: '/images/trobada-vicent-torrent.png',
    streamUrl: 'https://open.spotify.com/search/Al%20Tall%20Miquel%20Gil',
    buyUrl: 'https://www.totfolk.cat/discografia-miquel-gil',
    awards: [
      { title: "SERRA D'OR 1985", value: 'MEMÒRIA VIVA D’UN POBLE (★★★★★)' },
      { title: 'ENDERROCK CLÀSSICS', value: 'PATRIMONI HISTÒRIC ESSENCIAL' }
    ],
    tracklist: [
      { num: '01', title: 'Cant De Batre', time: '4:05' },
      { num: '02', title: "U I Dos De L'Horta", time: '3:50' },
      { num: '03', title: 'Les Folies De Carcaixent', time: '4:12' },
      { num: '04', title: 'Jota De La Vall', time: '3:38' },
      { num: '05', title: 'Seguidilles De Requena', time: '3:45' },
      { num: '06', title: 'Malaguenya De Barxeta', time: '4:20' },
      { num: '07', title: "Cant D'Estil De L'Alcúdia", time: '4:55' },
      { num: '08', title: 'Albaes Tradicionals', time: '5:15' },
      { num: '09', title: "Fandango D'Aiora", time: '4:30' }
    ],
    nextAlbum: {
      slug: 'tocs-i-vares',
      title: 'Tocs i Vares',
      year: '1982',
      type: 'Àlbum Tradicional',
      genre: 'Horta Sud, Percussions i Corda',
      runtime: '38:45',
      discArtUrl: '/images/disco_7.jpg'
    }
  },

  // 12. TOCS I VARES (1982) - REGISTRE FONOGRÀFIC
  'tocs-i-vares': {
    slug: 'tocs-i-vares',
    title: 'Tocs i Vares',
    editionNumber: 'EDICIÓ 01 / 12',
    year: '1982',
    label: 'Arxiu Fonogràfic Valencià',
    cover: '/images/disco_7.jpg',
    discArtUrl: '/images/disco_7.jpg',
    director: 'Arxiu Fonogràfic & Miquel Gil',
    lyrics: "Llegat Oral de l'Horta Sud",
    music: 'Tradicional Valencià',
    musicians: 'Percussionistes tradicionals, Corda fregada, Miquel Gil (veu)',
    genre: 'Horta Sud, Percussions de Canya, Corda Fregada',
    runtime: '38:45',
    format: 'Vinil LP / Disc Òptic CD',
    synopsis:
      "Registre fonogràfic històric de percussions de canya, corda fregada i melismes populars de l'Horta Sud en estat pur. Una joia etnomusical que documenta els orígens sonors i la formació d'arrel de Miquel Gil abans de les grans gires internacionals.",
    quote: "La puresa de la canya, la corda i la gola de l'Horta en estat fundacional",
    quoteAuthor: 'Miquel Gil · Tocs i Vares (1982)',
    trailerSrc: 'https://www.youtube.com/watch?v=yVT-HCsypyk',
    trailerStill: '/images/7.jpg',
    streamUrl: 'https://open.spotify.com/search/Miquel%20Gil%20Tocs%20i%20Vares',
    buyUrl: 'https://www.totfolk.cat/discografia-miquel-gil',
    awards: [
      { title: 'FONOTECA VALENCIANA', value: 'REGISTRE HISTÒRIC IMPRESCINDIBLE (★★★★★)' },
      { title: 'CULTURA POPULAR', value: 'RAIG D’AUTENTICITAT PATRIMONIAL' }
    ],
    tracklist: [
      { num: '01', title: 'Toc De Processó', time: '3:20' },
      { num: '02', title: 'Dansa De Les Vares', time: '4:10' },
      { num: '03', title: 'Canyes I Sons', time: '3:45' },
      { num: '04', title: "Melisma De L'Horta", time: '4:30' },
      { num: '05', title: 'Cant De Llaurador', time: '3:55' },
      { num: '06', title: 'Percussió De Fang I Canya', time: '4:15' },
      { num: '07', title: 'Sonata Popular', time: '4:05' },
      { num: '08', title: 'Acomiadament', time: '4:40' }
    ],
    nextAlbum: {
      slug: 'viatger',
      title: 'Viatger',
      year: '2024',
      type: 'Àlbum Estudi',
      genre: 'Arrel Viva, Fusió Mediterrània',
      runtime: '42:15',
      discArtUrl: '/images/disco_8.webp'
    }
  }
};
