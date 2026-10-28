export interface SpotifyTrack {
  id: string;
  title: string;
  album: string;
  albumSlug?: string;
  year?: string;
  duration?: number; // duration in ms
  audioPreview: string;
  localAudio: string;
  cover: string;
  spotifyUrl: string;
  isFullTrack?: boolean;
}

// 10 cançons completes oficials: una cançó sencera de cada disc de Miquel Gil
export const fullAlbumTracks: Record<string, SpotifyTrack> = {
  "viatger": {
    id: "viatger-nineta-full",
    title: "Nineta",
    album: "Viatger",
    albumSlug: "viatger",
    year: "2024",
    duration: 247000, // 4:07 cançó sencera
    audioPreview: "/audio/full/viatger_nineta.mp3",
    localAudio: "/audio/full/viatger_nineta.mp3",
    cover: "/images/disco_8.webp",
    spotifyUrl: "https://open.spotify.com/search/Miquel%20Gil%20Nineta",
    isFullTrack: true,
  },
  "geometries": {
    id: "geometries-full",
    title: "Geometries",
    album: "Geometries",
    albumSlug: "geometries",
    year: "2019",
    duration: 170000, // 2:50 cançó sencera
    audioPreview: "/audio/full/geometries_geometries.mp3",
    localAudio: "/audio/full/geometries_geometries.mp3",
    cover: "/images/disco_7.jpg",
    spotifyUrl: "https://open.spotify.com/search/Miquel%20Gil%20Geometries",
    isFullTrack: true,
  },
  "marcianes": {
    id: "marcianes-la-cileta-full",
    title: "La Cileta",
    album: "Per marcianes",
    albumSlug: "marcianes",
    year: "2011",
    duration: 240000, // 4:00 cançó sencera
    audioPreview: "/audio/full/marcianes_la_cileta.mp3",
    localAudio: "/audio/full/marcianes_la_cileta.mp3",
    cover: "/images/disco_6.png",
    spotifyUrl: "https://open.spotify.com/search/Miquel%20Gil%20La%20Cileta",
    isFullTrack: true,
  },
  "jazz-manel-camp": {
    id: "jazz-manel-camp-full",
    title: "Cançó de Bressol",
    album: "Miquel Gil & Manel Camp trio + David Pastor",
    albumSlug: "jazz-manel-camp",
    year: "2009",
    duration: 358000, // 5:58 cançó sencera
    audioPreview: "/audio/full/jazz_manel_camp.mp3",
    localAudio: "/audio/full/jazz_manel_camp.mp3",
    cover: "/images/disco_4.png",
    spotifyUrl: "https://open.spotify.com/search/Miquel%20Gil%20Manel%20Camp",
    isFullTrack: true,
  },
  "eixos": {
    id: "eixos-dels-meus-ulls-full",
    title: "Dels Meus Ulls",
    album: "Eixos",
    albumSlug: "eixos",
    year: "2006",
    duration: 213000, // 3:33 cançó sencera
    audioPreview: "/audio/full/eixos_dels_meus_ulls.mp3",
    localAudio: "/audio/full/eixos_dels_meus_ulls.mp3",
    cover: "/images/disco_5.png",
    spotifyUrl: "https://open.spotify.com/search/Miquel%20Gil%20Dels%20Meus%20Ulls",
    isFullTrack: true,
  },
  "en-concert": {
    id: "en-concert-traginers-full",
    title: "Cançó Dels Traginers",
    album: "En Concert",
    albumSlug: "en-concert",
    year: "2006",
    duration: 334000, // 5:34 cançó sencera
    audioPreview: "/audio/full/en_concert_traginers.mp3",
    localAudio: "/audio/full/en_concert_traginers.mp3",
    cover: "/images/disco_4.png",
    spotifyUrl: "https://open.spotify.com/search/Miquel%20Gil%20En%20Concert",
    isFullTrack: true,
  },
  "kata": {
    id: "kata-kata-full",
    title: "Katà",
    album: "Katà",
    albumSlug: "kata",
    year: "2004",
    duration: 190000, // 3:10 cançó sencera
    audioPreview: "/audio/full/kata_kata.mp3",
    localAudio: "/audio/full/kata_kata.mp3",
    cover: "/images/disco_3.png",
    spotifyUrl: "https://open.spotify.com/search/Miquel%20Gil%20Kata",
    isFullTrack: true,
  },
  "organic": {
    id: "organic-amor-es-deu-full",
    title: "L'amor és Déu en barca",
    album: "Orgànic",
    albumSlug: "organic",
    year: "2001",
    duration: 321000, // 5:21 cançó sencera
    audioPreview: "/audio/full/organic_amor_es_deu.mp3",
    localAudio: "/audio/full/organic_amor_es_deu.mp3",
    cover: "/images/disco_2.png",
    spotifyUrl: "https://open.spotify.com/search/Miquel%20Gil%20Lamor%20es%20Deu%20en%20barca",
    isFullTrack: true,
  },
  "buscando-tu-olor": {
    id: "buscando-tu-olor-full",
    title: "Buscando tu olor",
    album: "Buscando tu olor",
    albumSlug: "buscando-tu-olor",
    year: "1997",
    duration: 219000, // 3:39 cançó sencera
    audioPreview: "/audio/full/buscando_tu_olor.mp3",
    localAudio: "/audio/full/buscando_tu_olor.mp3",
    cover: "/images/disco_1.jpg",
    spotifyUrl: "https://open.spotify.com/search/Miquel%20Gil%20Buscando%20tu%20olor",
    isFullTrack: true,
  },
  "terminal-sur": {
    id: "terminal-sur-sant-joan-full",
    title: "Sant Joan",
    album: "Viajero (Terminal Sur)",
    albumSlug: "terminal-sur",
    year: "1988",
    duration: 306000, // 5:06 cançó sencera
    audioPreview: "/audio/full/terminal_sur_sant_joan.mp3",
    localAudio: "/audio/full/terminal_sur_sant_joan.mp3",
    cover: "/images/disco_1.jpg",
    spotifyUrl: "https://open.spotify.com/search/Terminal%20Sur%20Miquel%20Gil",
    isFullTrack: true,
  },
};

// La llista completa de reproducció conté les 10 cançons completes (una per cada àlbum)
export const spotifyTracks: SpotifyTrack[] = Object.values(fullAlbumTracks);

function normalizeString(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/^[\d#]+\.?\s*[-–—]?\s*/, "") // elimina numeració "01", "1.-"
    .replace(/[''’`]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

export function findSpotifyTrack(trackName: string): SpotifyTrack | undefined {
  const clean = normalizeString(trackName);
  if (!clean || clean.length < 3) return undefined;

  return spotifyTracks.find((st) => {
    const stClean = normalizeString(st.title);
    return stClean === clean || stClean.includes(clean) || clean.includes(stClean);
  });
}

// Retorna la cançó sencera oficial assignada a un àlbum específic
export function findSpotifyTrackForAlbum(
  albumTitle: string,
  albumTracks?: string[],
  albumSlug?: string
): SpotifyTrack {
  if (albumSlug && fullAlbumTracks[albumSlug]) {
    return fullAlbumTracks[albumSlug];
  }

  const cleanAlbum = normalizeString(albumTitle);
  for (const slug of Object.keys(fullAlbumTracks)) {
    const track = fullAlbumTracks[slug];
    const trackAlbumClean = normalizeString(track.album);
    if (trackAlbumClean === cleanAlbum || trackAlbumClean.includes(cleanAlbum) || cleanAlbum.includes(trackAlbumClean)) {
      return track;
    }
  }

  if (albumTracks && albumTracks.length > 0) {
    for (const t of albumTracks) {
      const match = findSpotifyTrack(t);
      if (match) return match;
    }
  }

  return spotifyTracks[0];
}

export function getFullTrackForAlbum(albumSlug: string): SpotifyTrack {
  return fullAlbumTracks[albumSlug] || spotifyTracks[0];
}
