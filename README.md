# Miquel Gil — Web Oficial

> **«La veu d'arrel que no s'atura de viatjar»**  
> *Tradició que mira cap endavant · Mig segle de música mediterrània contemporània.*

Plataforma web oficial del músic, cantador i compositor valencià **Miquel Gil** (Catarroja, 1956), cofundador d'Al Tall i referència indiscutible de la música d'arrel mediterrània, fusió, jazz i poesia contemporània.

---

## 🚀 Tecnologies i Arquitectura

- **Framework**: [Next.js 14](https://nextjs.org/) (App Router, Static Export SSG)
- **Llenguatge**: [TypeScript](https://www.typescriptlang.org/) / React 18
- **Animacions & Micro-interaccions**: [GSAP](https://greensock.com/gsap/) + [Annnimate](https://annnimate.com/)
  - Menú flotant interactiu **Pillar Menu**
  - Reproductor de vídeo personalitzat **Annnimate Video Player** (*Clip Nineta*)
  - Animacions tipogràfiques de revelació (*BlockReveal*, *AnimatedTitle*)
  - Efecte tàctil de sorra al descobert (*SandReveal*)
- **Àudio**: Reproductor persistent inferior (*Sticky Audio Player*) amb mostres d'àudio MP3 i connexió a Spotify.
- **Tipografia d'Autor**:
  - `GRIFINITO L` (titulars display d'alta gamma)
  - `GRAPHIK` (cos editorial i navegació)
  - `MANIC` i `ARCHIVO`

---

## 📂 Estructura del Projecte

```
miquel-gil/
├── app/                  # Rutes de Next.js (Inici, Biografia, Discografia, etc.)
│   ├── start/            # Pàgina d'inici amb Annnimate Video Player
│   ├── biografia/        # Assaig biogràfic i fites històriques
│   ├── discografia/      # Catàleg editorial complet amb vinils 3D i tracklists
│   ├── agenda/           # Directes, concerts i contractació
│   ├── contacte/         # Formulari i sorra interactiva
│   ├── cronologia/       # Fites de 1956 a 2026
│   ├── media/            # Premsa, articles i dossier
│   └── globals.css       # Estils globals, tokens de color i tipografia
├── components/           # Components React reutilitzables
│   ├── AnnnimateVideoPlayer.tsx # Reproductor de vídeo amb controls d'alta precisió
│   ├── PillarMenu.tsx    # Menú flotant Annnimate
│   ├── AudioPlayerBottom.tsx # Barra d'àudio persistent inferior
│   ├── SandReveal.tsx    # Efecte de sorra per a contacte
│   └── TextAnimations.tsx# Wipes i revelació de text
├── docs/                 # Documentació estratègica i guió oficial
│   └── GUION_WEB.md      # Guió de continguts 2026 (@Syncro)
├── lib/                  # Dades centrals, discografia i mostres sonores
│   ├── site.ts           # Model de dades de l'artista, formats i fites
│   └── spotifyTracks.ts  # Metadades de pistes i mostres reals MP3
└── public/               # Fitxers estàtics, imatges d'àlbums, fonts i vídeo
```

---

## 🛠️ Desenvolupament Local

1. **Instal·lar dependències**:
   ```bash
   npm install
   ```

2. **Executar en mode desenvolupament**:
   ```bash
   npm run dev
   ```
   Obrir [http://localhost:3000](http://localhost:3000) al navegador.

3. **Compilar per a producció (Static HTML Export)**:
   ```bash
   npm run build
   ```
   Els fitxers estàtics es generen a la carpeta `/out`.

4. **Servir la versió de producció compilada**:
   ```bash
   npx serve out -p 3000
   ```

---

## 📄 Llicència i Drets

Tots els drets d'imatge, música i continguts reservats a **Miquel Gil** i el seu equip de management.
