"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { BlockReveal, AnimatedTitle, AnimatedDivider } from "@/components/TextAnimations";
import AnnnimateVideoPlayer from "@/components/AnnnimateVideoPlayer";

interface ProjectItem {
  id: "nineta" | "viatger" | "principal";
  index: string;
  badge: string;
  category: string;
  title: string;
  year: string;
  duration: string;
  discImage: string;
  description: string;
  creditsLabel: string;
  credits: string;
  quote: string;
  author?: string;
  format: string;
  genre: string;
}

const PROJECTS: ProjectItem[] = [
  {
    id: "nineta",
    index: "01",
    badge: "ARXIU #01",
    category: "CURTMETRATGE & SINGLE",
    title: "NINETA",
    year: "2024",
    duration: "04:07",
    discImage: "/video/nineta_frame.jpg",
    description:
      "Per fi, ací teniu el Clip de Nineta. Un Western modern ambientat en un paisatge albuferenc crepuscular i distòpic. Una lluita interna que desemboca en bogeria.",
    creditsLabel: "DIRECCIÓ & CREACIÓ VISUAL",
    credits: "Tubal Perales, Vicent Todolí i Enric Alepuz",
    quote:
      "La terra, el fang i la pulsió visceral en una de les peces visuals més trencadores de la música valenciana contemporània.",
    format: "4K Digital Cinema // Single",
    genre: "Western Albuferenc Crepuscular",
  },
  {
    id: "viatger",
    index: "02",
    badge: "ARXIU #02",
    category: "ÀLBUM D'ESTUDI // 12\" LP",
    title: "VIATGER",
    year: "2024",
    duration: "42:15",
    discImage: "/images/portadaCD.webp",
    description:
      "No és només un àlbum; és una crida a l'ànima, una invitació a explorar nous horitzons i a abraçar l'essència de la vida. A través de lletres i melodies envoltants, Miquel Gil ens transporta a un univers ric en emocions i experiències. Cada cançó és un viatge en si mateixa, una oportunitat per perdre's en els detalls i trobar significat en cada nota.",
    creditsLabel: "PRODUCCIÓ MUSICAL & DIRECCIÓ",
    credits: "Borja Penalba & Miquel Gil · Dedicat a la memòria de Manolo Miralles",
    quote:
      "Un treball canònic de maduresa, memòria i transformació. L'arrel mediterrània que no s'atura de caminar cap endavant.",
    author: "Enderrock",
    format: "Vinil 12\" 33⅓ RPM & Digipak",
    genre: "Cançó d'Arrel i Fusió",
  },
  {
    id: "principal",
    index: "03",
    badge: "ARXIU #03",
    category: "CONCERT DOCUMENTAL // DIRECTE",
    title: "PRESENTACIÓ AL PRINCIPAL",
    year: "2024",
    duration: "115:00",
    discImage: "/images/MiquelGilViatger_Principal.webp",
    description:
      "El passat dissabte, van viure una nit inoblidable al Teatre Principal amb la presentació del nou disc de Miquel Gil, 'Viatger'. L'atmosfera del teatre es va omplir d'emoció i expectació.",
    creditsLabel: "LLOC & AFORAMENT",
    credits: "Teatre Principal de València · Aforament complet",
    quote:
      "Una comunió intergeneracional irrepetible amb les veus cabdals de la cançó i la tradició viva.",
    author: "Levante-EMV",
    format: "Directe Històric Enregistrat",
    genre: "Concert Documental",
  },
];

export default function StartClient() {
  const [selectedId, setSelectedId] = useState<"nineta" | "viatger" | "principal">("nineta");
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Sync active section on scroll
  useEffect(() => {
    const sectionIds = ["sec-nineta", "sec-viatger", "sec-principal"] as const;
    const elements = sectionIds
      .map((id) => document.getElementById(id))
      .filter((el): el is HTMLElement => el !== null);

    if (elements.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            if (entry.target.id === "sec-nineta") setSelectedId("nineta");
            else if (entry.target.id === "sec-viatger") setSelectedId("viatger");
            else if (entry.target.id === "sec-principal") setSelectedId("principal");
          }
        });
      },
      {
        rootMargin: "-20% 0px -40% 0px",
        threshold: [0.1, 0.4],
      }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Audio Playback
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

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (
        e.target instanceof HTMLInputElement ||
        e.target instanceof HTMLTextAreaElement
      ) {
        return;
      }

      if (e.code === "Space") {
        e.preventDefault();
        setIsFlipped((prev) => !prev);
      } else if (e.key === "1") {
        selectAndScroll("nineta");
      } else if (e.key === "2") {
        selectAndScroll("viatger");
      } else if (e.key === "3") {
        selectAndScroll("principal");
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        navigateOffset(-1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        navigateOffset(1);
      } else if (e.key === "m" || e.key === "M" || e.key === "s" || e.key === "S") {
        toggleAudio();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedId, toggleAudio]);

  const navigateOffset = (offset: number) => {
    const currentIndex = PROJECTS.findIndex((p) => p.id === selectedId);
    let newIndex = currentIndex + offset;
    if (newIndex < 0) newIndex = PROJECTS.length - 1;
    if (newIndex >= PROJECTS.length) newIndex = 0;
    selectAndScroll(PROJECTS[newIndex].id);
  };

  const selectAndScroll = (id: "nineta" | "viatger" | "principal") => {
    setSelectedId(id);
    document.getElementById(`sec-${id}`)?.scrollIntoView({ behavior: "smooth" });
  };

  const scrollToTop = () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="a24-start-experience">
      {/* ============================================================
          1. HEADER MINIMALISTA D'ARXIU (A24 TOP BAR)
          ============================================================ */}
      <header className="a24-header" role="banner">
        <div className="a24-header__brand">
          <button type="button" onClick={scrollToTop} className="a24-brand-btn">
            <span className="a24-brand-title">MIQUEL GIL</span>
            <span className="a24-brand-sep" aria-hidden="true">//</span>
            <span className="a24-brand-subtitle">ARXIU SONOR 1975 — 2026</span>
          </button>
        </div>

        <nav className="a24-header__nav" aria-label="Navegació de capítols d'arxiu">
          {PROJECTS.map((project) => (
            <button
              key={project.id}
              type="button"
              className={`a24-nav-pill ${selectedId === project.id ? "is-active" : ""}`}
              onClick={() => selectAndScroll(project.id)}
            >
              <span className="a24-nav-index">{project.index}</span>
              <span className="a24-nav-label">{project.id.toUpperCase()}</span>
            </button>
          ))}
        </nav>

        <div className="a24-header__actions">
          <button
            type="button"
            onClick={toggleAudio}
            className={`a24-audio-toggle ${isPlayingAudio ? "is-playing" : ""}`}
            title="Reproduir / Silenciar so (Drecera: M)"
            aria-label={isPlayingAudio ? "Silenciar so" : "Activar so"}
          >
            <span className="a24-audio-bars" aria-hidden="true">
              <span className="a24-bar a24-bar-1" />
              <span className="a24-bar a24-bar-2" />
              <span className="a24-bar a24-bar-3" />
            </span>
            <span className="a24-audio-text">
              {isPlayingAudio ? "PAUSE SOUND" : "TAP FOR SOUND"}
            </span>
          </button>
        </div>
      </header>

      {/* ============================================================
          2. THE DISC STAGE (A24 SKEUOMORPHIC PHYSICAL MEDIA CRATE)
          Fila tàctil de discos físics sobre un escenari #f2f2f2
          ============================================================ */}
      <section className="a24-stage" aria-label="Escenari interactiu de discos físics">
        <div className="a24-stage-inner">
          <div className="a24-stage-kicker">
            <span className="a24-kicker-dot" aria-hidden="true" />
            <span className="a24-kicker-text">DISCOTECA D&apos;ARXIU // TRILOGIA FÍSICA 2024</span>
          </div>

          <h1 className="a24-stage-headline">
            Mig segle d&apos;arrel mediterrània, poesia contemporània i suport físic.
          </h1>

          {/* THE PHYSICAL DISCS ROW (HORIZONTAL RECORD CRATE) */}
          <div className="a24-disc-row">
            {PROJECTS.map((project) => {
              const isActive = selectedId === project.id;
              return (
                <div
                  key={project.id}
                  className={`a24-disc-slot ${isActive ? "is-selected" : ""}`}
                  onClick={() => selectAndScroll(project.id)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" || e.key === " ") {
                      e.preventDefault();
                      selectAndScroll(project.id);
                    }
                  }}
                  aria-label={`Seleccionar disc ${project.title}`}
                >
                  <div className="a24-disc-pod">
                    {/* Ring highlight when selected */}
                    <div className="a24-disc-ring" aria-hidden="true" />

                    {/* The 12" Vinyl/CD Physical Disc */}
                    <div className="a24-disc-body">
                      {/* Silkscreen / Art layer */}
                      <div
                        className="a24-disc-art"
                        style={{ backgroundImage: `url(${project.discImage})` }}
                      />
                      {/* Concentric grooves texture */}
                      <div className="a24-disc-grooves" />
                      {/* Anisotropic light reflection */}
                      <div className="a24-disc-sheen" />
                      {/* Center spindle & label (monochrome A24 style) */}
                      <div className="a24-disc-core">
                        <span className="a24-core-center" />
                        <span className="a24-core-id">{project.index}</span>
                      </div>
                    </div>
                  </div>

                  <div className="a24-disc-caption">
                    <span className="a24-caption-index">{project.index}</span>
                    <span className="a24-caption-title">{project.title}</span>
                    <span className="a24-caption-year">{project.year}</span>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Quick jump cue */}
          <div className="a24-stage-cue">
            <span>Fes clic sobre un disc o prem <kbd>←</kbd> <kbd>→</kbd> per navegar</span>
          </div>
        </div>
      </section>

      {/* ============================================================
          3. FULL-BLEED EDITORIAL CHAPTERS (A24 CINEMA TAKEOVER)
          ============================================================ */}

      {/* CAPÍTOL 01: NINETA (Dark Cinema #000000 // 16:9 Video) */}
      <section
        id="sec-nineta"
        className="a24-chapter a24-chapter--dark a24-chapter-nineta"
        aria-label="Capítol 01: Nineta"
      >
        <div className="a24-chapter-grid">
          <div className="a24-chapter-media">
            <div className="a24-media-meta-bar">
              <span className="a24-stamp">ARXIU #01</span>
              <span className="a24-meta-spec">CURTMETRATGE & SINGLE // ANY 2024</span>
            </div>

            <div className="a24-video-box">
              <AnnnimateVideoPlayer
                src="/video/nineta.mp4"
                poster="/video/nineta_frame.jpg"
                title="Nineta — Videoclip Oficial"
                credits="Tubal Perales, Vicent Todolí i Enric Alepuz"
              />
            </div>

            <div className="a24-tech-row">
              <span className="a24-tech-item"><strong>GÈNERE</strong> Western Albuferenc Crepuscular</span>
              <span className="a24-tech-sep">/</span>
              <span className="a24-tech-item"><strong>FORMAT</strong> 4K Digital Cinema</span>
              <span className="a24-tech-sep">/</span>
              <span className="a24-tech-item"><strong>DURADA</strong> 04:07</span>
            </div>
          </div>

          <div className="a24-chapter-info">
            <div className="a24-chapter-number">
              <span className="a24-num-accent">01</span>
              <span className="a24-num-slash">/ 03</span>
              <span className="a24-num-label">VIDEOCLIP OFICIAL</span>
            </div>

            {/* Exactly 1 paragraph in PP Eiko */}
            <BlockReveal color="#ffffff" direction="lr" delay={100} duration={650} fullWidth>
              <p className="a24-desc-lead a24-desc-lead--white">
                Per fi, ací teniu el Clip de Nineta. Un Western modern ambientat en
                un paisatge albuferenc crepuscular i distòpic. Una lluita interna que
                desemboca en bogeria.
              </p>
            </BlockReveal>

            <div className="a24-credits-tag">
              <span className="a24-credits-label">DIRECCIÓ & CREACIÓ VISUAL</span>
              <p className="a24-credits-text a24-credits-text--white">
                Tubal Perales, Vicent Todolí i Enric Alepuz
              </p>
            </div>

            {/* Monumental PP Museum Title in Pure White */}
            <AnimatedTitle
              as="h2"
              text="NINETA"
              color="#FFFFFF"
              className="a24-monumental-title a24-monumental-title--white"
            />

            <div className="a24-quote-card a24-quote-card--dark">
              <span className="a24-quote-glyph">&ldquo;</span>
              <p className="a24-quote-prose">
                La terra, el fang i la pulsió visceral en una de les peces visuals més trencadores de la música valenciana contemporània.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* CAPÍTOL 02: VIATGER (Muted #f2f2f2 // 3D Vinyl Sleeve Flip) */}
      <section
        id="sec-viatger"
        className="a24-chapter a24-chapter--light a24-chapter-viatger"
        aria-label="Capítol 02: Àlbum Viatger"
      >
        <div className="a24-chapter-grid">
          <div className="a24-chapter-info">
            <div className="a24-chapter-number a24-chapter-number--dark">
              <span className="a24-num-accent">02</span>
              <span className="a24-num-slash">/ 03</span>
              <span className="a24-num-label">ÀLBUM D&apos;ESTUDI // 12&quot; LP</span>
            </div>

            <div className="a24-media-meta-bar">
              <span className="a24-stamp a24-stamp--black">ARXIU #02</span>
              <span className="a24-meta-spec a24-meta-spec--dark">
                TEMPS RECORD · CATÀLEG MG-08 · VINIL 33 RPM
              </span>
            </div>

            {/* Exactly 1 paragraph in PP Eiko */}
            <BlockReveal color="#000000" direction="lr" delay={150} duration={650} fullWidth>
              <p className="a24-desc-lead a24-desc-lead--black">
                No és només un àlbum; és una crida a l&apos;ànima, una invitació a
                explorar nous horitzons i a abraçar l&apos;essència de la vida. A través
                de lletres i melodies envoltants, Miquel Gil ens transporta a un
                univers ric en emocions i experiències. Cada cançó és un viatge en si
                mateixa, una oportunitat per perdre&apos;s en els detalls i trobar
                significat en cada nota.
              </p>
            </BlockReveal>

            <div className="a24-credits-tag a24-credits-tag--dark">
              <span className="a24-credits-label">PRODUCCIÓ MUSICAL & DIRECCIÓ</span>
              <p className="a24-credits-text a24-credits-text--black">
                Borja Penalba &amp; Miquel Gil · Dedicat a la memòria de Manolo Miralles
              </p>
            </div>

            {/* Monumental PP Museum Title in Pure Black */}
            <AnimatedTitle
              as="h2"
              text="VIATGER"
              color="#000000"
              className="a24-monumental-title a24-monumental-title--black"
            />

            <div className="a24-quote-card a24-quote-card--light">
              <span className="a24-quote-glyph">&ldquo;</span>
              <p className="a24-quote-prose">
                Un treball canònic de maduresa, memòria i transformació. L&apos;arrel mediterrània que no s&apos;atura de caminar cap endavant.
              </p>
              <span className="a24-quote-cite">— Enderrock</span>
            </div>
          </div>

          {/* 3D VINYL SLEEVE VISOR WITH 180° FLIP */}
          <div className="a24-chapter-media a24-chapter-media--vinyl">
            <div className="a24-vinyl-box">
              <div
                className={`a24-vinyl-flipper ${isFlipped ? "is-flipped" : ""}`}
                onClick={() => setIsFlipped((prev) => !prev)}
                role="region"
                aria-label="Funda de vinil interactiva 3D. Fes clic o prem Espai per girar 180 graus"
                tabIndex={0}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    setIsFlipped((prev) => !prev);
                  }
                }}
              >
                {/* CARA A: PORTADA D'ART & VINIL EXTRAÏBLE */}
                <div className="a24-face a24-face--front">
                  <div className="a24-sleeve-pack">
                    {/* Vinyl disc sliding out with monochrome label */}
                    <div
                      className="a24-slip-disc"
                      aria-hidden="true"
                      onClick={(e) => {
                        e.stopPropagation();
                        toggleAudio();
                      }}
                      title="Clica per reproduir la mostra de so"
                    >
                      <div className="a24-slip-grooves" />
                      <div className="a24-slip-sheen" />
                      <div className="a24-slip-label">
                        <span className="a24-label-title">VIATGER</span>
                        <span className="a24-label-hole" />
                        <span className="a24-label-rpm">33⅓ RPM</span>
                      </div>
                    </div>

                    {/* Sleeve Front */}
                    <div className="a24-sleeve-jacket">
                      <img
                        decoding="async"
                        src="/images/portadaCD.webp"
                        alt="Portada disc Viatger de Miquel Gil"
                      />
                      <div className="a24-sleeve-glare" />
                      <div className="a24-sleeve-spine" />
                    </div>
                  </div>

                  <div className="a24-flip-hint">
                    <span className="a24-flip-icon">↺</span>
                    <span>Fes clic o prem <kbd>Espai</kbd> per girar a la Cara B</span>
                  </div>
                </div>

                {/* CARA B: CONTRAPORTADA D'ARXIU AMB PISTES I POESIA */}
                <div className="a24-face a24-face--back">
                  <div className="a24-back-jacket">
                    <div className="a24-back-head">
                      <span className="a24-back-head-title">MIQUEL GIL // VIATGER</span>
                      <span className="a24-back-head-matrix">MG-08 // STEREO</span>
                    </div>

                    <div className="a24-back-columns">
                      <div className="a24-back-col">
                        <span className="a24-col-side">CARA A</span>
                        <ol className="a24-col-list">
                          <li><span>01. Nineta</span> <small>04:07</small></li>
                          <li><span>02. Viatger</span> <small>03:45</small></li>
                          <li><span>03. La Pau</span> <small>04:12</small></li>
                          <li><span>04. Rosa de foc</span> <small>03:55</small></li>
                        </ol>
                      </div>

                      <div className="a24-back-col">
                        <span className="a24-col-side">CARA B</span>
                        <ol className="a24-col-list" start={5}>
                          <li><span>05. He vist</span> <small>03:50</small></li>
                          <li><span>06. Cançó de bressol</span> <small>04:20</small></li>
                          <li><span>07. Estellés</span> <small>03:30</small></li>
                          <li><span>08. Arrel</span> <small>05:10</small></li>
                        </ol>
                      </div>
                    </div>

                    <div className="a24-back-poem">
                      <p className="a24-poem-text">
                        &ldquo;M&apos;he estimat molt la vida, no com a plenitud, sinó com a turment.&rdquo;
                      </p>
                      <span className="a24-poem-by">— Vicent Andrés Estellés</span>
                    </div>

                    <div className="a24-back-foot">
                      <div className="a24-foot-col">
                        <span>Producció: Borja Penalba · Lletres: Miquel Gil, Estellés, Casasses</span>
                        <small>© 2024 Temps Record / Miquel Gil · Fabricat a la Mediterrània</small>
                      </div>
                      <div className="a24-foot-barcode" aria-hidden="true">
                        <span className="a24-barcode-bars" />
                        <span className="a24-barcode-num">8 436034 560821</span>
                      </div>
                    </div>
                  </div>

                  <div className="a24-flip-hint">
                    <span className="a24-flip-icon">↻</span>
                    <span>Fes clic o prem <kbd>Espai</kbd> per tornar a la portada</span>
                  </div>
                </div>
              </div>

              {/* Action Toolbar */}
              <div className="a24-vinyl-toolbar">
                <button
                  type="button"
                  className="a24-btn a24-btn--flip"
                  onClick={() => setIsFlipped((prev) => !prev)}
                  title="Voltejar funda de vinil 180°"
                >
                  <span className="a24-btn-icon">↺</span>
                  <span>{isFlipped ? "Veure Portada (Cara A)" : "Girar Contraportada (Cara B)"}</span>
                  <kbd className="a24-btn-kbd">Espai</kbd>
                </button>

                <button
                  type="button"
                  className={`a24-btn ${isPlayingAudio ? "a24-btn--playing" : ""}`}
                  onClick={toggleAudio}
                  title="Reproduir mostra oficial"
                >
                  <span className="a24-btn-icon">{isPlayingAudio ? "❚❚" : "▶"}</span>
                  <span>{isPlayingAudio ? "Pausar Nineta" : "Reproduir Mostra (4:07)"}</span>
                </button>

                <a
                  href="https://open.spotify.com/intl-es/album/0nsEwLdHyVm27hZtQihPTl"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="a24-btn a24-btn--spotify"
                  title="Obrir àlbum sencer a Spotify"
                >
                  <span>Spotify</span>
                  <span className="a24-btn-arrow">&rarr;</span>
                </a>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* CAPÍTOL 03: PRESENTACIÓ AL PRINCIPAL (Split View // #f2f2f2 surface) */}
      <section
        id="sec-principal"
        className="a24-chapter a24-chapter--split a24-chapter-principal"
        aria-label="Capítol 03: Presentació al Teatre Principal"
      >
        <div className="a24-split-photo">
          <div className="a24-split-tag">
            <span className="a24-stamp">ARXIU #03</span>
            <span className="a24-meta-spec">CONCERT DOCUMENTAL // DIRECTE HISTÒRIC</span>
          </div>

          <BlockReveal color="#000000" direction="rl" delay={100} duration={600}>
            <img
              decoding="async"
              src="/images/MiquelGilViatger_Principal.webp"
              alt="Miquel Gil en directe al Teatre Principal de València"
            />
          </BlockReveal>

          <div className="a24-split-caption">
            <span>TEATRE PRINCIPAL DE VALÈNCIA // FOTOGRAFIA D&apos;ARXIU</span>
          </div>
        </div>

        <div className="a24-split-content">
          <div className="a24-chapter-number a24-chapter-number--dark">
            <span className="a24-num-accent">03</span>
            <span className="a24-num-slash">/ 03</span>
            <span className="a24-num-label">CRÒNICA DE DIRECTE</span>
          </div>

          {/* 3 lines monumental stack in PP Museum */}
          <div className="a24-stack-title">
            <AnimatedTitle
              as="h2"
              text="PRESENTACIÓ"
              color="#000000"
              className="a24-monumental-title a24-monumental-title--black"
              delay={0}
            />
            <AnimatedTitle
              as="h2"
              text="AL"
              color="#000000"
              className="a24-monumental-title a24-monumental-title--black"
              delay={180}
            />
            <AnimatedTitle
              as="h2"
              text="PRINCIPAL"
              color="#000000"
              className="a24-monumental-title a24-monumental-title--black"
              delay={320}
            />
          </div>

          <AnimatedDivider color="#000000" delay={250} />

          {/* Chronicle in PP Eiko */}
          <BlockReveal color="#000000" direction="lr" delay={300} duration={700} fullWidth>
            <div className="a24-desc-stack">
              <p className="a24-desc-lead a24-desc-lead--black">
                El passat dissabte, van viure una nit inoblidable al Teatre
                Principal amb la presentació del nou disc de Miquel Gil, &ldquo;Viatger&rdquo;.
                L&rsquo;atmosfera del teatre es va omplir d&rsquo;emoció i expectació.
              </p>
              <p className="a24-desc-lead a24-desc-lead--black">
                Els col·laboradors especials, entre els quals es trobaven Pep Gimeno
                &ldquo;Botifarra&rdquo;, Vicent Torrent, Maria Bertomeu &ldquo;La Maria&rdquo;, Noelia
                Llorens &ldquo;Titana&rdquo; i Borja Penalba, van aportar la seva pròpia màgia a
                la nit, enriquint les actuacions amb la seva presència única i les
                seves interpretacions brillants.
              </p>
            </div>
          </BlockReveal>

          <div className="a24-guests-section">
            <span className="a24-guests-title">ARTISTES CONVIDATS D&apos;HONOR</span>
            <div className="a24-guests-list">
              <span className="a24-guest-chip">Pep Gimeno &ldquo;Botifarra&rdquo;</span>
              <span className="a24-guest-chip">Vicent Torrent (Al Tall)</span>
              <span className="a24-guest-chip">Maria Bertomeu &ldquo;La Maria&rdquo;</span>
              <span className="a24-guest-chip">Noelia Llorens &ldquo;Titana&rdquo;</span>
              <span className="a24-guest-chip">Borja Penalba</span>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          4. A24 FLOATING STATUS DOCK (PERMANENT MINIMAL BAR)
          ============================================================ */}
      <footer className="a24-dock" role="contentinfo" aria-label="Estat d'arxiu i navegació permanent">
        <div className="a24-dock-card">
          <div className="a24-dock-status">
            <span className="a24-dock-dot" aria-hidden="true" />
            <span className="a24-dock-readout">
              {selectedId === "nineta" && "ARXIU [ 01 / 03 ] · NINETA (CLIP OFICIAL)"}
              {selectedId === "viatger" && "ARXIU [ 02 / 03 ] · VIATGER (LP 33 RPM)"}
              {selectedId === "principal" && "ARXIU [ 03 / 03 ] · PRESENTACIÓ AL PRINCIPAL"}
            </span>
          </div>

          <div className="a24-dock-switcher">
            {PROJECTS.map((project) => (
              <button
                key={project.id}
                type="button"
                className={`a24-dock-btn ${selectedId === project.id ? "is-selected" : ""}`}
                onClick={() => selectAndScroll(project.id)}
              >
                {project.index} {project.id === "principal" ? "Principal" : project.title}
              </button>
            ))}
          </div>

          <div className="a24-dock-shortcuts">
            <span className="a24-shortcut">
              <kbd>Espai</kbd> Girar
            </span>
            <span className="a24-shortcut">
              <kbd>←</kbd> <kbd>→</kbd> Discs
            </span>
            <span className="a24-shortcut">
              <kbd>M</kbd> So
            </span>
          </div>
        </div>
      </footer>
    </div>
  );
}
