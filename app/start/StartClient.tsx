"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import AnnnimateVideoPlayer from "@/components/AnnnimateVideoPlayer";

interface FilmItem {
  id: "nineta" | "viatger" | "principal";
  index: string;
  title: string;
  isStackTitle?: boolean;
  stackLines?: string[];
  directedBy: string;
  year: string;
  starring: string;
  format: string;
  description: string;
  discImage: string;
  discAlt: string;
  reviews: {
    stars: number;
    publication: string;
    quote: string;
  }[];
  tracksA?: { num: string; title: string; duration: string }[];
  tracksB?: { num: string; title: string; duration: string }[];
  poem?: { text: string; author: string };
  videoSrc?: string;
  posterSrc?: string;
}

const FILMS: FilmItem[] = [
  {
    id: "nineta",
    index: "01",
    title: "NINETA",
    directedBy: "Tubal Perales, Vicent Todolí i Enric Alepuz",
    year: "2024",
    starring: "Miquel Gil, Borja Penalba",
    format: "4K Digital Cinema // Single",
    description:
      "Per fi, ací teniu el Clip de Nineta. Un Western modern ambientat en un paisatge albuferenc crepuscular i distòpic. Una lluita interna que desemboca en bogeria.",
    discImage: "/video/nineta_frame.jpg",
    discAlt: "Nineta — Disc oficial d'arxiu",
    reviews: [
      {
        stars: 5,
        publication: "THE PLAYLIST",
        quote: "“LA TERRA, EL FANG I LA PULSIÓ VISCERAL”",
      },
      {
        stars: 4.5,
        publication: "THE DAILY BEAST",
        quote: "“UNA PEÇA VISUAL CANÒNICA I TRENCADORA”",
      },
    ],
    videoSrc: "/video/nineta.mp4",
    posterSrc: "/video/nineta_frame.jpg",
  },
  {
    id: "viatger",
    index: "02",
    title: "VIATGER",
    directedBy: "Borja Penalba & Miquel Gil",
    year: "2024",
    starring: "Dedicat a la memòria de Manolo Miralles",
    format: "Vinil 12\" 33⅓ RPM & Digipak",
    description:
      "No és només un àlbum; és una crida a l'ànima, una invitació a explorar nous horitzons i a abraçar l'essència de la vida. A través de lletres i melodies envoltants, Miquel Gil ens transporta a un univers ric en emocions i experiències. Cada cançó és un viatge en si mateixa, una oportunitat per perdre's en els detalls i trobar significat en cada nota.",
    discImage: "/images/portadaCD.webp",
    discAlt: "Viatger — Portada de disc i vinil",
    reviews: [
      {
        stars: 5,
        publication: "ENDERROCK",
        quote: "“UN TREBALL CANÒNIC DE MADURESA I MEMÒRIA”",
      },
      {
        stars: 5,
        publication: "DIARI LA VEU",
        quote: "“L'ARREL MEDITERRÀNIA QUE CAMINA CAP ENDAVANT”",
      },
    ],
    tracksA: [
      { num: "01", title: "Nineta", duration: "04:07" },
      { num: "02", title: "Viatger", duration: "03:45" },
      { num: "03", title: "La Pau", duration: "04:12" },
      { num: "04", title: "Rosa de foc", duration: "03:55" },
    ],
    tracksB: [
      { num: "05", title: "He vist", duration: "03:50" },
      { num: "06", title: "Cançó de bressol", duration: "04:20" },
      { num: "07", title: "Estellés", duration: "03:30" },
      { num: "08", title: "Arrel", duration: "05:10" },
    ],
    poem: {
      text: "“M'he estimat molt la vida, no com a plenitud, sinó com a turment.”",
      author: "Vicent Andrés Estellés",
    },
  },
  {
    id: "principal",
    index: "03",
    title: "PRESENTACIÓ AL PRINCIPAL",
    isStackTitle: true,
    stackLines: ["PRESENTACIÓ", "AL", "PRINCIPAL"],
    directedBy: "Teatre Principal de València",
    year: "2024",
    starring: "Pep Gimeno Botifarra, Vicent Torrent, La Maria, Titana, Borja Penalba",
    format: "Concert Documental // Directe Històric",
    description:
      "El passat dissabte, van viure una nit inoblidable al Teatre Principal amb la presentació del nou disc de Miquel Gil, 'Viatger'. L'atmosfera del teatre es va omplir d'emoció i expectació.",
    discImage: "/images/MiquelGilViatger_Principal.webp",
    discAlt: "Presentació al Principal — Fotografia de directe",
    reviews: [
      {
        stars: 5,
        publication: "LEVANTE-EMV",
        quote: "“UNA COMUNIÓ INTERGENERACIONAL IRREPETIBLE”",
      },
      {
        stars: 4.5,
        publication: "VALÈNCIA PLAZA",
        quote: "“LA TRADICIÓ VIVA EN EL SEU PUNT MÉS ÀLGID”",
      },
    ],
    poem: {
      text: "“Una nit inoblidable amb aforament complet celebrant cinc dècades de cançó.”",
      author: "Crònica Cultural",
    },
  },
];

export default function StartClient() {
  const [activeIndex, setActiveIndex] = useState<number>(0);
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [isIndexOpen, setIsIndexOpen] = useState<boolean>(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const [isVideoModalOpen, setIsVideoModalOpen] = useState<boolean>(false);

  const audioRef = useRef<HTMLAudioElement | null>(null);
  const indexRef = useRef<HTMLLIElement | null>(null);

  const currentFilm = FILMS[activeIndex];
  const nextIndex = (activeIndex + 1) % FILMS.length;
  const nextFilm = FILMS[nextIndex];
  const prevIndex = (activeIndex - 1 + FILMS.length) % FILMS.length;
  const prevFilm = FILMS[prevIndex];

  // Navigation handlers
  const goToNext = useCallback(() => {
    setIsFlipped(false);
    setActiveIndex((prev) => (prev + 1) % FILMS.length);
  }, []);

  const goToPrev = useCallback(() => {
    setIsFlipped(false);
    setActiveIndex((prev) => (prev - 1 + FILMS.length) % FILMS.length);
  }, []);

  const selectFilm = (index: number) => {
    setIsFlipped(false);
    setIsIndexOpen(false);
    setActiveIndex(index);
  };

  // Audio Toggle
  const toggleAudio = useCallback(() => {
    if (!audioRef.current) {
      audioRef.current = new Audio("/audio/full/viatger_nineta.mp3");
      audioRef.current.volume = 0.85;
      audioRef.current.onended = () => setIsPlayingAudio(false);
    }

    if (isPlayingAudio) {
      audioRef.current.pause();
      setIsPlayingAudio(false);
    } else {
      audioRef.current
        .play()
        .then(() => setIsPlayingAudio(true))
        .catch(() => setIsPlayingAudio(false));
    }
  }, [isPlayingAudio]);

  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Close the index dropdown when clicking outside of it
  useEffect(() => {
    if (!isIndexOpen) return;

    const handlePointerDown = (e: MouseEvent) => {
      if (indexRef.current && !indexRef.current.contains(e.target as Node)) {
        setIsIndexOpen(false);
      }
    };

    document.addEventListener("mousedown", handlePointerDown);
    return () => document.removeEventListener("mousedown", handlePointerDown);
  }, [isIndexOpen]);

  // Keyboard accessibility (Space to flip, Arrows to switch, M for audio, Enter for video)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      // Let native buttons/links handle their own Space/Enter activation
      const isNativeControl =
        e.target instanceof HTMLElement &&
        (e.target.closest("button") || e.target.closest("a"));

      if (isNativeControl && (e.code === "Space" || e.key === "Enter")) {
        return;
      }

      if (e.code === "Space") {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        goToNext();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        goToPrev();
      } else if (e.key === "1") {
        selectFilm(0);
      } else if (e.key === "2") {
        selectFilm(1);
      } else if (e.key === "3") {
        selectFilm(2);
      } else if (e.key === "m" || e.key === "M" || e.key === "s" || e.key === "S") {
        toggleAudio();
      } else if (e.key === "Enter") {
        if (currentFilm.videoSrc) {
          setIsVideoModalOpen(true);
        } else {
          setIsFlipped((prev) => !prev);
        }
      } else if (e.key === "Escape") {
        setIsVideoModalOpen(false);
        setIsIndexOpen(false);
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [goToNext, goToPrev, toggleAudio, currentFilm]);

  // Render Star SVGs (exact A24 geometry)
  const renderStars = (rating: number) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (rating >= i) {
        // Full star
        stars.push(
          <svg
            key={i}
            viewBox="0 0 11 10"
            fill="none"
            className="a24-star"
            aria-hidden="true"
          >
            <path
              d="M5.24862 0L6.68508 3.53591L10.4972 3.81215L7.62431 6.29834L8.50829 10L5.24862 8.01105L1.98895 10L2.87293 6.29834L0 3.81215L3.81215 3.53591L5.24862 0Z"
              fill="currentColor"
            />
          </svg>
        );
      } else if (rating >= i - 0.5) {
        // Half star
        stars.push(
          <span key={i} className="a24-star-half-wrap">
            <svg
              viewBox="0 0 11 10"
              fill="none"
              className="a24-star a24-star--half"
              aria-hidden="true"
            >
              <path
                d="M5.24862 0L6.68508 3.53591L10.4972 3.81215L7.62431 6.29834L8.50829 10L5.24862 8.01105L1.98895 10L2.87293 6.29834L0 3.81215L3.81215 3.53591L5.24862 0Z"
                fill="currentColor"
              />
            </svg>
          </span>
        );
      } else {
        // Empty star
        stars.push(
          <svg
            key={i}
            viewBox="0 0 11 10"
            fill="none"
            className="a24-star a24-star--empty"
            aria-hidden="true"
          >
            <path
              d="M5.24862 0L6.68508 3.53591L10.4972 3.81215L7.62431 6.29834L8.50829 10L5.24862 8.01105L1.98895 10L2.87293 6.29834L0 3.81215L3.81215 3.53591L5.24862 0Z"
              fill="currentColor"
            />
          </svg>
        );
      }
    }
    return stars;
  };

  return (
    <div className="a24-root">
      {/* Subtle Cinematic Film Grain */}
      <div className="a24-grain" aria-hidden="true" />

      {/* ============================================================
          1. TOP NAVIGATION BAR (Exact A24 Nav)
          ============================================================ */}
      <header className="a24-nav" role="banner">
        <div className="a24-nav-container">
          <div className="a24-nav-inner">
            <div className="a24-nav-center">
              <ul className="a24-nav-list" role="menubar">
                <li role="none">
                  <a href="/" className="a24-nav-logo" aria-label="Miquel Gil arxiu">
                    <span className="a24-logo-text">MIQUEL GIL</span>
                  </a>
                </li>
                <li role="none">
                  <span className="a24-nav-link is-active" role="menuitem">
                    Discs
                    <span className="a24-nav-dot" aria-hidden="true">•</span>
                  </span>
                </li>
                <li role="none">
                  <a href="/agenda" className="a24-nav-link" role="menuitem">
                    Directes
                  </a>
                </li>
                <li role="none" className="a24-nav-index-item" ref={indexRef}>
                  <button
                    type="button"
                    className="a24-nav-link a24-index-btn"
                    onClick={() => setIsIndexOpen((prev) => !prev)}
                    aria-expanded={isIndexOpen}
                    aria-haspopup="true"
                  >
                    <span>Índex {FILMS.length}</span>
                    <span className="a24-arrow" aria-hidden="true">∨</span>
                  </button>

                  {/* Dropdown catalog */}
                  {isIndexOpen && (
                    <div className="a24-dropdown-menu" role="menu">
                      {FILMS.map((f, i) => (
                        <button
                          key={f.id}
                          type="button"
                          className={`a24-dropdown-item ${i === activeIndex ? "is-active" : ""}`}
                          onClick={() => selectFilm(i)}
                          role="menuitem"
                        >
                          <span className="a24-item-index">{f.index}</span>
                          <span className="a24-item-title">{f.title}</span>
                          <span className="a24-item-year">{f.year}</span>
                        </button>
                      ))}
                    </div>
                  )}
                </li>
              </ul>
            </div>

            {/* Audio Toggle in top-right */}
            <div className="a24-nav-actions">
              <button
                type="button"
                className={`a24-sound-btn ${isPlayingAudio ? "is-playing" : ""}`}
                onClick={toggleAudio}
                title="Reproduir / Silenciar so (Drecera: M)"
                aria-label={isPlayingAudio ? "Silenciar so" : "Activar so"}
              >
                <span className="a24-sound-bars" aria-hidden="true">
                  <span className="a24-bar b1" />
                  <span className="a24-bar b2" />
                  <span className="a24-bar b3" />
                </span>
                <span className="a24-sound-label">
                  {isPlayingAudio ? "PAUSE" : "SOUND"}
                </span>
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* ============================================================
          2. MAIN EXPERIENCE WRAP (Exact A24 Layout)
          ============================================================ */}
      <main className="a24-main-stage" role="main">
        <div className="a24-experience-wrap">
          {/* TOP-LEFT METADATA BLOCK (Exact A24 Experience Info) */}
          <div className="a24-experience-info">
            {/* Title: 30px PP Museum / PP Eiko */}
            <div className="a24-title-wrap">
              {currentFilm.isStackTitle && currentFilm.stackLines ? (
                <h1 className="a24-heading-s a24-stack-h1">
                  {currentFilm.stackLines.map((line, idx) => (
                    <span key={idx} className="a24-stack-line">
                      {line}
                    </span>
                  ))}
                </h1>
              ) : (
                <h1 className="a24-heading-s">{currentFilm.title}</h1>
              )}
            </div>

            {/* Structured Table with 0.5px hairline dividers */}
            <div className="a24-info-content">
              {/* Row 1: DIRECTED BY */}
              <div className="a24-info-panel">
                <div className="a24-divider-h" />
                <span className="a24-subheading-xs">DIRECTED BY</span>
                <span className="a24-paragraph-m">{currentFilm.directedBy}</span>
              </div>

              {/* Row 2: YEAR */}
              <div className="a24-info-panel">
                <div className="a24-divider-h" />
                <span className="a24-subheading-xs">YEAR</span>
                <span className="a24-paragraph-m">{currentFilm.year}</span>
              </div>

              {/* Row 3: STARRING / CREDITS */}
              <div className="a24-info-panel">
                <div className="a24-divider-h" />
                <span className="a24-subheading-xs">STARRING</span>
                <span className="a24-paragraph-m a24-starring-text">
                  {currentFilm.starring}
                </span>
              </div>

              {/* Row 4: FORMAT */}
              <div className="a24-info-panel">
                <div className="a24-divider-h" />
                <span className="a24-subheading-xs">FORMAT</span>
                <span className="a24-paragraph-m">{currentFilm.format}</span>
              </div>

              {/* Row 5: USER'S SINGLE PARAGRAPH PROSE */}
              <div className="a24-info-panel a24-info-panel--desc">
                <div className="a24-divider-h" />
                <span className="a24-subheading-xs">ARXIU</span>
                <p className="a24-desc-prose">{currentFilm.description}</p>
              </div>

              {/* Quick Action Pill */}
              <div className="a24-info-actions">
                <button
                  type="button"
                  className="a24-action-pill"
                  onClick={() => setIsFlipped((prev) => !prev)}
                >
                  <span className="a24-pill-icon">↺</span>
                  <span>{isFlipped ? "VEURE CARA A" : "VOLTEJAR DISC (CARA B)"}</span>
                  <kbd>Espai</kbd>
                </button>

                {currentFilm.videoSrc && (
                  <button
                    type="button"
                    className="a24-action-pill a24-action-pill--video"
                    onClick={() => setIsVideoModalOpen(true)}
                  >
                    <span>▶ VEURE CURTMETRATGE</span>
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* ============================================================
              3. CENTER STAGE: 3D OPTICAL DISCS CAROUSEL (Exact A24)
              ============================================================ */}
          <div
            className="a24-disc-viewport"
            aria-label="Galeria de discs en 3D"
            role="region"
          >
            {/* PREVIOUS DISC (RECEDING 3D DEPTH TO THE LEFT) */}
            <div
              className="a24-disc-queued a24-disc-queued--prev"
              onClick={goToPrev}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  e.stopPropagation();
                  goToPrev();
                }
              }}
              role="button"
              tabIndex={0}
              aria-label={`Disc anterior: ${prevFilm.title}. Clica per tornar enrere.`}
              title={`Anterior: ${prevFilm.title}`}
            >
              <div className="a24-queued-disc">
                <div className="a24-disc-rim" />
                <div
                  className="a24-disc-artwork"
                  style={{ backgroundImage: `url(${prevFilm.discImage})` }}
                />
                <div className="a24-disc-grooves" />
                <div className="a24-disc-reflection" />
                <div className="a24-disc-hub">
                  <div className="a24-disc-clamp" />
                  <div className="a24-disc-hole" />
                </div>
              </div>
              <span className="a24-queued-label">
                &larr; {prevFilm.index} // {prevFilm.title}
              </span>
            </div>

            {/* ACTIVE DISC (CENTER STAGE) */}
            <div
              className={`a24-disc-rig ${isFlipped ? "is-flipped" : ""}`}
              onClick={() => setIsFlipped((prev) => !prev)}
              role="button"
              tabIndex={0}
              aria-label={`Disc actual: ${currentFilm.title}. Clica o prem Espai per voltejar.`}
            >
              {/* FACE A: FRONT SILKSCREEN DISC */}
              <div className="a24-disc-face a24-disc-face--front">
                <div className="a24-disc-disc">
                  {/* Outer Bevel Rim */}
                  <div className="a24-disc-rim" />

                  {/* High-Resolution Printed Silkscreen Artwork */}
                  <div
                    className="a24-disc-artwork"
                    style={{ backgroundImage: `url(${currentFilm.discImage})` }}
                  />

                  {/* Concentric Audio/Video Grooves */}
                  <div className="a24-disc-grooves" />

                  {/* Anisotropic Specular Light Reflection */}
                  <div className="a24-disc-reflection" />

                  {/* Clear Transparent Optical Polycarbonate Hub Ring */}
                  <div className="a24-disc-hub">
                    <span className="a24-hub-matrix">
                      {currentFilm.id.toUpperCase()} // MG-2024
                    </span>
                    {/* Clear Optical Clamping Area */}
                    <div className="a24-disc-clamp" />
                    {/* Center Spindle Hole (See-Through) */}
                    <div className="a24-disc-hole" />
                  </div>
                </div>

                {/* Flip Hint */}
                <div className="a24-disc-cue" aria-hidden="true">
                  <span>Clica o prem <kbd>Espai</kbd> per girar</span>
                </div>
              </div>

              {/* FACE B: REVERSE METADATA & POEM */}
              <div className="a24-disc-face a24-disc-face--back">
                <div className="a24-disc-disc a24-disc-disc--back">
                  <div className="a24-disc-rim" />
                  <div className="a24-disc-grooves" />
                  <div className="a24-disc-reflection" />

                  {/* Back Jacket Content */}
                  <div className="a24-back-content">
                    <div className="a24-back-header">
                      <span className="a24-back-title">{currentFilm.title}</span>
                      <span className="a24-back-cat">MG-08 // STEREO 2024</span>
                    </div>

                    {currentFilm.tracksA && currentFilm.tracksB ? (
                      <div className="a24-back-tracks">
                        <div className="a24-track-side">
                          <span className="a24-side-label">CARA A</span>
                          <ul>
                            {currentFilm.tracksA.map((t) => (
                              <li key={t.num}>
                                <span>{t.num}. {t.title}</span>
                                <small>{t.duration}</small>
                              </li>
                            ))}
                          </ul>
                        </div>
                        <div className="a24-track-side">
                          <span className="a24-side-label">CARA B</span>
                          <ul>
                            {currentFilm.tracksB.map((t) => (
                              <li key={t.num}>
                                <span>{t.num}. {t.title}</span>
                                <small>{t.duration}</small>
                              </li>
                            ))}
                          </ul>
                        </div>
                      </div>
                    ) : (
                      <div className="a24-back-notes">
                        <span className="a24-side-label">CRÈDITS D&apos;HONOR</span>
                        <p className="a24-notes-prose">{currentFilm.starring}</p>
                      </div>
                    )}

                    {currentFilm.poem && (
                      <div className="a24-back-poem">
                        <p className="a24-poem-quote">{currentFilm.poem.text}</p>
                        <span className="a24-poem-auth">— {currentFilm.poem.author}</span>
                      </div>
                    )}

                    <div className="a24-back-footer">
                      <small>© 2024 Temps Record // Arxiu Miquel Gil</small>
                      <div className="a24-barcode" aria-hidden="true" />
                    </div>
                  </div>

                  {/* Transparent Center Hole */}
                  <div className="a24-disc-hub a24-disc-hub--back">
                    <div className="a24-disc-hole" />
                  </div>
                </div>

                <div className="a24-disc-cue" aria-hidden="true">
                  <span>Clica o prem <kbd>Espai</kbd> per tornar a la portada</span>
                </div>
              </div>
            </div>

            {/* QUEUED NEXT DISC (IN 3D Z-DEPTH TO THE RIGHT) */}
            <div
              className="a24-disc-queued"
              onClick={goToNext}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  e.stopPropagation();
                  goToNext();
                }
              }}
              role="button"
              tabIndex={0}
              aria-label={`Següent disc: ${nextFilm.title}. Clica per avançar.`}
              title={`Següent: ${nextFilm.title}`}
            >
              <div className="a24-queued-disc">
                <div className="a24-disc-rim" />
                <div
                  className="a24-disc-artwork"
                  style={{ backgroundImage: `url(${nextFilm.discImage})` }}
                />
                <div className="a24-disc-grooves" />
                <div className="a24-disc-reflection" />
                <div className="a24-disc-hub">
                  <div className="a24-disc-clamp" />
                  <div className="a24-disc-hole" />
                </div>
              </div>
              <span className="a24-queued-label">
                {nextFilm.index} // {nextFilm.title} &rarr;
              </span>
            </div>
          </div>

          {/* ============================================================
              4. BOTTOM CENTER TESTIMONIALS (Exact A24 Dual Column)
              ============================================================ */}
          <div className="a24-testimonial-wrap">
            {currentFilm.reviews.map((rev, idx) => (
              <div key={idx} className="a24-testimonial-item">
                {/* 5 Stars */}
                <div
                  className="a24-testimonial-stars"
                  role="img"
                  aria-label={`${rev.stars} estrelles de 5`}
                >
                  {renderStars(rev.stars)}
                </div>

                {/* Text Block */}
                <div className="a24-testimonial-text">
                  <span className="a24-testimonial-pub">{rev.publication}</span>
                  <p className="a24-testimonial-quote">{rev.quote}</p>
                </div>
              </div>
            ))}
          </div>

          {/* ============================================================
              5. BOTTOM STATUS BAR & NAVIGATION DOCK
              ============================================================ */}
          <div className="a24-bottom-dock">
            <div className="a24-dock-cluster">
              <button
                type="button"
                className="a24-dock-nav-btn"
                onClick={goToPrev}
                aria-label="Disc anterior"
              >
                &larr;
              </button>

              <div className="a24-dock-pills">
                {FILMS.map((f, i) => (
                  <button
                    key={f.id}
                    type="button"
                    className={`a24-dock-pill ${i === activeIndex ? "is-active" : ""}`}
                    onClick={() => selectFilm(i)}
                  >
                    <span>{f.index}</span>
                    <span className="a24-dock-pill-title">{f.id.toUpperCase()}</span>
                  </button>
                ))}
              </div>

              <button
                type="button"
                className="a24-dock-nav-btn"
                onClick={goToNext}
                aria-label="Següent disc"
              >
                &rarr;
              </button>
            </div>

            <div className="a24-dock-shortcuts">
              <span><kbd>←</kbd> <kbd>→</kbd> Discs</span>
              <span><kbd>Espai</kbd> Voltejar</span>
              <span><kbd>M</kbd> So</span>
            </div>
          </div>
        </div>
      </main>

      {/* ============================================================
          6. MODAL VIDEO PLAYER (Per a Nineta o Documental)
          ============================================================ */}
      {isVideoModalOpen && currentFilm.videoSrc && (
        <div
          className="a24-video-modal"
          role="dialog"
          aria-modal="true"
          aria-label={`Videoclip de ${currentFilm.title}`}
        >
          <div
            className="a24-modal-backdrop"
            onClick={() => setIsVideoModalOpen(false)}
          />
          <div className="a24-modal-content">
            <button
              type="button"
              className="a24-modal-close"
              onClick={() => setIsVideoModalOpen(false)}
              aria-label="Tancar vídeo"
            >
              ✕
            </button>
            <div className="a24-modal-player">
              <AnnnimateVideoPlayer
                src={currentFilm.videoSrc}
                poster={currentFilm.posterSrc}
                title={currentFilm.title}
                credits={currentFilm.directedBy}
              />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
