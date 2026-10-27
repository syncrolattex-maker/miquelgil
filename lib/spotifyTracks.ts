export interface SpotifyTrack {
  id: string;
  title: string;
  album: string;
  year?: string;
  duration?: number;
  audioPreview: string;
  localAudio: string;
  cover: string;
  spotifyUrl: string;
}

export const spotifyTracks: SpotifyTrack[] = [
  {
    id: "15j9ScEcAXSBiYPnKSDKXQ",
    title: "L'amor és Déu en barca",
    album: "Orgànic",
    year: "2001",
    duration: 30000, // 30s preview
    audioPreview: "https://p.scdn.co/mp3-preview/3c9d444938f4ce2c9576f17bfee7bf93035e8b98",
    localAudio: "/audio/track_1_15j9ScEcAXSBiYPnKSDKXQ.mp3",
    cover: "/audio/covers/cover_1_15j9ScEcAXSBiYPnKSDKXQ.jpg",
    spotifyUrl: "https://open.spotify.com/track/15j9ScEcAXSBiYPnKSDKXQ"
  },
  {
    id: "57lb6fCukXLGxduNiFkayu",
    title: "Cau La Nit",
    album: "Viatger",
    year: "2024",
    duration: 30000,
    audioPreview: "https://p.scdn.co/mp3-preview/f3c3602750ec8b69b1a1caf6ff1c388e14946ca9",
    localAudio: "/audio/track_2_57lb6fCukXLGxduNiFkayu.mp3",
    cover: "/audio/covers/cover_2_57lb6fCukXLGxduNiFkayu.jpg",
    spotifyUrl: "https://open.spotify.com/track/57lb6fCukXLGxduNiFkayu"
  },
  {
    id: "4RXu6Zu5objdDz95SaWtBh",
    title: "En tan alta que estaves",
    album: "Arrel",
    year: "2001",
    duration: 30000,
    audioPreview: "https://p.scdn.co/mp3-preview/fb330964e0c9fba09fa0ba52c6eabca5a83737a7",
    localAudio: "/audio/track_3_4RXu6Zu5objdDz95SaWtBh.mp3",
    cover: "/audio/covers/cover_3_4RXu6Zu5objdDz95SaWtBh.jpg",
    spotifyUrl: "https://open.spotify.com/track/4RXu6Zu5objdDz95SaWtBh"
  },
  {
    id: "6WuBwsR8DtSwTxTALQI6iZ",
    title: "Vetlatori",
    album: "Arrel",
    year: "2001",
    duration: 30000,
    audioPreview: "https://p.scdn.co/mp3-preview/9f40f713369f24ba5e7c909b514d872355d30f04",
    localAudio: "/audio/track_4_6WuBwsR8DtSwTxTALQI6iZ.mp3",
    cover: "/audio/covers/cover_4_6WuBwsR8DtSwTxTALQI6iZ.jpg",
    spotifyUrl: "https://open.spotify.com/track/6WuBwsR8DtSwTxTALQI6iZ"
  },
  {
    id: "3ldlHmVTetfjT7hRSyvq6x",
    title: "Línia de flotació",
    album: "Orgànic",
    year: "2001",
    duration: 30000,
    audioPreview: "https://p.scdn.co/mp3-preview/0975c24f788d72f848792f56967f1366c951a1f6",
    localAudio: "/audio/track_5_3ldlHmVTetfjT7hRSyvq6x.mp3",
    cover: "/audio/covers/cover_5_3ldlHmVTetfjT7hRSyvq6x.jpg",
    spotifyUrl: "https://open.spotify.com/track/3ldlHmVTetfjT7hRSyvq6x"
  },
  {
    id: "1RVcEJiAfvbbtIrdiOCI4b",
    title: "La Cileta",
    album: "Per Marcianes",
    year: "2004",
    duration: 30000,
    audioPreview: "https://p.scdn.co/mp3-preview/a9f662716889f089803c737ff64a0074064e2d79",
    localAudio: "/audio/track_6_1RVcEJiAfvbbtIrdiOCI4b.mp3",
    cover: "/audio/covers/cover_6_1RVcEJiAfvbbtIrdiOCI4b.jpg",
    spotifyUrl: "https://open.spotify.com/track/1RVcEJiAfvbbtIrdiOCI4b"
  },
  {
    id: "2Ww3ot6xMvV8vTfKVjBguQ",
    title: "Primavera",
    album: "Orgànic",
    year: "2001",
    duration: 30000,
    audioPreview: "https://p.scdn.co/mp3-preview/49a40aeb9f818fe698ca45490d552942d7f9e575",
    localAudio: "/audio/track_7_2Ww3ot6xMvV8vTfKVjBguQ.mp3",
    cover: "/audio/covers/cover_7_2Ww3ot6xMvV8vTfKVjBguQ.jpg",
    spotifyUrl: "https://open.spotify.com/track/2Ww3ot6xMvV8vTfKVjBguQ"
  },
  {
    id: "2LnuP2WefElQVuaEKncqFB",
    title: "Un silenci",
    album: "Orgànic",
    year: "2001",
    duration: 30000,
    audioPreview: "https://p.scdn.co/mp3-preview/10ab92a102de7adde487067369f7d73ce5688d58",
    localAudio: "/audio/track_8_2LnuP2WefElQVuaEKncqFB.mp3",
    cover: "/audio/covers/cover_8_2LnuP2WefElQVuaEKncqFB.jpg",
    spotifyUrl: "https://open.spotify.com/track/2LnuP2WefElQVuaEKncqFB"
  },
  {
    id: "05DmS0WYuzdstIrBSdMQPj",
    title: "Copeo",
    album: "Geometries",
    year: "2019",
    duration: 30000,
    audioPreview: "https://p.scdn.co/mp3-preview/dddb3becef3e4e83006d17f813e7214f84ba39ba",
    localAudio: "/audio/track_9_05DmS0WYuzdstIrBSdMQPj.mp3",
    cover: "/audio/covers/cover_9_05DmS0WYuzdstIrBSdMQPj.jpg",
    spotifyUrl: "https://open.spotify.com/track/05DmS0WYuzdstIrBSdMQPj"
  },
  {
    id: "4aGmSmb7vFjk5juuWq7ycc",
    title: "Amaga l'arbre",
    album: "Orgànic",
    year: "2001",
    duration: 30000,
    audioPreview: "https://p.scdn.co/mp3-preview/64e069c4dc310b198ccab37a716653fb368c1565",
    localAudio: "/audio/track_10_4aGmSmb7vFjk5juuWq7ycc.mp3",
    cover: "/audio/covers/cover_10_4aGmSmb7vFjk5juuWq7ycc.jpg",
    spotifyUrl: "https://open.spotify.com/track/4aGmSmb7vFjk5juuWq7ycc"
  }
];

function normalizeString(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/^[\d#]+\.?\s*[-–—]?\s*/, "") // remove leading track number like "1.- ", "10.- "
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

// Fallback map by album title for the quick play button
const albumSampleMap: Record<string, number> = {
  "terminal sur": 0,
  "organic": 0,
  "kata": 2,
  "en concert": 0,
  "eixos": 3,
  "per marcianes": 5,
  "geometries": 8,
  "viatger": 1,
};

export function findSpotifyTrackForAlbum(
  albumTitle: string,
  albumTracks?: string[]
): SpotifyTrack | undefined {
  if (albumTracks && albumTracks.length > 0) {
    for (const t of albumTracks) {
      const match = findSpotifyTrack(t);
      if (match) return match;
    }
  }

  const cleanAlbum = normalizeString(albumTitle);
  if (!cleanAlbum) return spotifyTracks[0];

  const matchedIndex = albumSampleMap[cleanAlbum];
  if (matchedIndex !== undefined && spotifyTracks[matchedIndex]) {
    return spotifyTracks[matchedIndex];
  }

  return spotifyTracks.find((st) => {
    const stAlbumClean = normalizeString(st.album);
    return stAlbumClean === cleanAlbum || stAlbumClean.includes(cleanAlbum) || cleanAlbum.includes(stAlbumClean);
  }) || spotifyTracks[0];
}
