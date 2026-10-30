"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { BlockReveal, AnimatedTitle, AnimatedDivider } from "@/components/TextAnimations";
import AnnnimateVideoPlayer from "@/components/AnnnimateVideoPlayer";

export default function StartClient() {
  const [activeSection, setActiveSection] = useState<"nineta" | "viatger" | "principal">("nineta");
  const [isFlipped, setIsFlipped] = useState<boolean>(false);
  const [isPlayingAudio, setIsPlayingAudio] = useState<boolean>(false);
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // IntersectionObserver to sync the active section with the floating dock
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
            if (entry.target.id === "sec-nineta") setActiveSection("nineta");
            else if (entry.target.id === "sec-viatger") setActiveSection("viatger");
            else if (entry.target.id === "sec-principal") setActiveSection("principal");
          }
        });
      },
      {
        rootMargin: "-25% 0px -40% 0px",
        threshold: [0.1, 0.5],
      }
    );

    elements.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  // Audio Play/Pause handler with subtle needle drop behavior
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

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      if (audioRef.current) {
        audioRef.current.pause();
        audioRef.current = null;
      }
    };
  }, []);

  // Keyboard navigation & controls per DESIGN.md:
  // - Space: Flip vinyl (when viatger section is visible or anywhere on page)
  // - 1, 2, 3: Jump to sections
  // - M or S: Toggle audio
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Don't trigger if user is typing in an input
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
        document.getElementById("sec-nineta")?.scrollIntoView({ behavior: "smooth" });
      } else if (e.key === "2") {
        document.getElementById("sec-viatger")?.scrollIntoView({ behavior: "smooth" });
      } else if (e.key === "3") {
        document.getElementById("sec-principal")?.scrollIntoView({ behavior: "smooth" });
      } else if (e.key === "m" || e.key === "M" || e.key === "s" || e.key === "S") {
        toggleAudio();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [toggleAudio]);

  const scrollTo = (id: string) => {
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <div className="start-archive">
      {/* ============================================================
          1. HEADER MINIMALISTA D'ARXIU (A24 ARCHIVE HEADER)
          ============================================================ */}
      <header className="start-archive-header" role="banner">
        <div className="start-archive-header__brand">
          <span className="start-archive-header__title">MIQUEL GIL</span>
          <span className="start-archive-header__sep" aria-hidden="true">//</span>
          <span className="start-archive-header__sub">ARXIU SONOR 1975 — 2026</span>
        </div>

        <nav className="start-archive-header__nav" aria-label="Navegació de capítols">
          <button
            type="button"
            className={`start-archive-header__pill ${activeSection === "nineta" ? "is-active" : ""}`}
            onClick={() => scrollTo("sec-nineta")}
          >
            <span className="start-pill-num">01</span>
            <span className="start-pill-name">NINETA</span>
          </button>
          <button
            type="button"
            className={`start-archive-header__pill ${activeSection === "viatger" ? "is-active" : ""}`}
            onClick={() => scrollTo("sec-viatger")}
          >
            <span className="start-pill-num">02</span>
            <span className="start-pill-name">VIATGER</span>
          </button>
          <button
            type="button"
            className={`start-archive-header__pill ${activeSection === "principal" ? "is-active" : ""}`}
            onClick={() => scrollTo("sec-principal")}
          >
            <span className="start-pill-num">03</span>
            <span className="start-pill-name">PRINCIPAL</span>
          </button>
        </nav>

        <div className="start-archive-header__actions">
          <button
            type="button"
            onClick={toggleAudio}
            className={`start-audio-btn ${isPlayingAudio ? "is-playing" : ""}`}
            title="Reproduir / Pausar mostra de so (Tecla M)"
            aria-label={isPlayingAudio ? "Pausar so" : "Reproduir so"}
          >
            <span className="start-audio-bars" aria-hidden="true">
              <span className="bar bar-1" />
              <span className="bar bar-2" />
              <span className="bar bar-3" />
            </span>
            <span className="start-audio-text">
              {isPlayingAudio ? "SO // EN REPRODUCCIÓ" : "SO // REPRODUIR"}
            </span>
          </button>
        </div>
      </header>

      {/* ============================================================
          SECCIÓ 1: NINETA (Fons Negre Sutge // Cinema d'autor)
          ============================================================ */}
      <section
        id="sec-nineta"
        className="start-section-nineta"
        aria-label="Capítol 1: Nineta"
      >
        <div className="start-section-nineta__video">
          <div className="start-badge-row">
            <span className="start-archive-badge">ARXIU #01</span>
            <span className="start-archive-tag">CURTMETRATGE & SINGLE // ANY 2024</span>
          </div>

          <div className="video-box">
            <AnnnimateVideoPlayer
              src="/video/nineta.mp4"
              poster="/video/nineta_frame.jpg"
              title="Nineta — Videoclip Oficial"
              credits="Tubal Perales, Vicent Todolí i Enric Alepuz"
            />
          </div>

          <div className="start-video-metadata">
            <span className="start-meta-item">
              <strong>GÈNERE</strong> Western Albuferenc Crepuscular
            </span>
            <span className="start-meta-sep">/</span>
            <span className="start-meta-item">
              <strong>FORMAT</strong> 4K Digital Cinema
            </span>
            <span className="start-meta-sep">/</span>
            <span className="start-meta-item">
              <strong>DURADA</strong> 04:07
            </span>
          </div>
        </div>

        <div className="start-section-nineta__content">
          <div className="start-chapter-indicator">
            <span className="start-chapter-index">01</span>
            <span className="start-chapter-total">/ 03</span>
            <span className="start-chapter-title">VIDEOCLIP OFICIAL</span>
          </div>

          <BlockReveal color="#FF0000" direction="lr" delay={100} duration={650} fullWidth>
            <p className="start-desc--white">
              Per fi, ací teniu el Clip de Nineta. Un Western modern ambientat en
              un paissatge albuferenc crepuscular i distòpic. Una lluita interna que
              desemboca en bogeria.
            </p>
          </BlockReveal>

          <div className="start-meta-credits-block">
            <span className="start-credits-label">DIRECCIÓ & CREACIÓ VISUAL</span>
            <p className="start-credits--white">
              Tubal Perales, Vicent Todolí i Enric Alepuz
            </p>
          </div>

          <AnimatedTitle
            as="h2"
            text="NINETA"
            color="#FF0000"
            className="start-big-title--red"
          />

          <div className="start-review-quote">
            <span className="quote-mark">&ldquo;</span>
            <p className="quote-text">
              La terra, el fang i la pulsió visceral en una de les peces visuals més trencadores de la cançó mediterrània contemporània.
            </p>
          </div>
        </div>
      </section>

      {/* ============================================================
          SECCIÓ 2: VIATGER (Fons Paper Cru // 3D Interactive Vinyl)
          ============================================================ */}
      <section
        id="sec-viatger"
        className="start-section-viatger"
        aria-label="Capítol 2: Àlbum Viatger"
      >
        <div className="start-section-viatger__content">
          <div className="start-chapter-indicator start-chapter-indicator--dark">
            <span className="start-chapter-index">02</span>
            <span className="start-chapter-total">/ 03</span>
            <span className="start-chapter-title">ÀLBUM D&apos;ESTUDI // 12&quot; LP</span>
          </div>

          <div className="start-badge-row">
            <span className="start-archive-badge start-archive-badge--red">ARXIU #02</span>
            <span className="start-archive-tag start-archive-tag--dark">
              TEMPS RECORD · CATÀLEG MG-08 · VINIL 33 RPM
            </span>
          </div>

          <BlockReveal color="#FF0000" direction="lr" delay={150} duration={650} fullWidth>
            <p className="start-desc--black">
              No és només un àlbum; és una crida a l&apos;ànima, una invitació a
              explorar nous horitzons i a abraçar l&apos;essència de la vida. A través
              de lletres i melodies envoltants, Miquel Gil ens transporta a un
              univers ric en emocions i experiències. Cada cançó és un viatge en si
              mateixa, una oportunitat per perdre&apos;s en els detalls i trobar
              significat en cada nota.
            </p>
          </BlockReveal>

          <div className="start-meta-credits-block start-meta-credits-block--dark">
            <span className="start-credits-label">PRODUCCIÓ MUSICAL & DIRECCIÓ</span>
            <p className="start-credits--black">
              Borja Penalba &amp; Miquel Gil · Dedicat a la memòria de Manolo Miralles
            </p>
          </div>

          <AnimatedTitle
            as="h2"
            text="VIATGER"
            color="#FF0000"
            className="start-big-title--red"
          />

          <div className="start-review-quote start-review-quote--dark">
            <span className="quote-mark">&ldquo;</span>
            <p className="quote-text">
              Un treball canònic de maduresa, memòria i transformació. L&apos;arrel mediterrània que no s&apos;atura de caminar cap endavant.
            </p>
            <span className="quote-author">— Enderrock</span>
          </div>
        </div>

        {/* 3D VINYL VISOR / ARCHIVAL PHYSICAL EXPERIENCE */}
        <div className="start-section-viatger__cover">
          <div className="start-vinyl-stage">
            <div
              className={`start-vinyl-flipper ${isFlipped ? "is-flipped" : ""}`}
              onClick={() => setIsFlipped((prev) => !prev)}
              role="region"
              aria-label="Funda de vinil interactiva 3D. Fes clic o prem Espai per girar entre Cara A i Cara B"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  setIsFlipped((prev) => !prev);
                }
              }}
            >
              {/* CARA A: PORTADA FRONTAL D'ART & VINIL EXTRAÏBLE */}
              <div className="start-card-face start-card-face--front">
                <div className="start-album-wrapper">
                  {/* Vinyl record disc that slides out */}
                  <div
                    className="start-vinyl-disc"
                    aria-hidden="true"
                    onClick={(e) => {
                      e.stopPropagation();
                      toggleAudio();
                    }}
                    title="Clica per reproduir la mostra de so"
                  >
                    <div className="start-vinyl-grooves" />
                    <div className="start-vinyl-sheen" />
                    <div className="start-vinyl-label">
                      <div className="start-vinyl-label-text">VIATGER</div>
                      <span className="start-vinyl-center" />
                      <div className="start-vinyl-label-sub">33⅓ RPM</div>
                    </div>
                  </div>

                  {/* Cardboard Sleeve */}
                  <div className="start-album-sleeve">
                    <img
                      decoding="async"
                      src="/images/portadaCD.webp"
                      alt="Portada disc Viatger de Miquel Gil"
                    />
                    <div className="start-album-glare" />
                    <div className="start-sleeve-spine" />
                  </div>
                </div>

                <div className="start-sleeve-hint">
                  <span className="start-sleeve-hint__icon">↺</span>
                  <span>Fes clic o prem <strong>Espai</strong> per girar a la Cara B</span>
                </div>
              </div>

              {/* CARA B: CONTRAPORTADA D'ARXIU AMB LLETRES I PISTES */}
              <div className="start-card-face start-card-face--back">
                <div className="start-back-cover">
                  <div className="start-back-header">
                    <span className="start-back-title">MIQUEL GIL // VIATGER</span>
                    <span className="start-back-matrix">MG-08 // STEREO</span>
                  </div>

                  <div className="start-back-tracklist">
                    <div className="start-track-side">
                      <span className="start-side-title">CARA A</span>
                      <ol className="start-track-ol">
                        <li><span>01. Nineta</span> <small>04:07</small></li>
                        <li><span>02. Viatger</span> <small>03:45</small></li>
                        <li><span>03. La Pau</span> <small>04:12</small></li>
                        <li><span>04. Rosa de foc</span> <small>03:55</small></li>
                      </ol>
                    </div>

                    <div className="start-track-side">
                      <span className="start-side-title">CARA B</span>
                      <ol className="start-track-ol" start={5}>
                        <li><span>05. He vist</span> <small>03:50</small></li>
                        <li><span>06. Cançó de bressol</span> <small>04:20</small></li>
                        <li><span>07. Estellés</span> <small>03:30</small></li>
                        <li><span>08. Arrel</span> <small>05:10</small></li>
                      </ol>
                    </div>
                  </div>

                  <div className="start-back-poetry">
                    <p className="start-poetry-quote">
                      &ldquo;M&apos;he estimat molt la vida, no com a plenitud, sinó com a turment.&rdquo;
                    </p>
                    <span className="start-poetry-author">— Vicent Andrés Estellés</span>
                  </div>

                  <div className="start-back-footer">
                    <div className="start-back-credits">
                      <span>Producció: Borja Penalba · Lletres: Miquel Gil, Estellés, Casasses</span>
                      <small>© 2024 Temps Record / Miquel Gil · Fabricat a la Mediterrània</small>
                    </div>
                    <div className="start-back-barcode" aria-hidden="true">
                      <span className="barcode-lines" />
                      <span className="barcode-num">8 436034 560821</span>
                    </div>
                  </div>
                </div>

                <div className="start-sleeve-hint">
                  <span className="start-sleeve-hint__icon">↻</span>
                  <span>Fes clic o prem <strong>Espai</strong> per tornar a la portada</span>
                </div>
              </div>
            </div>

            {/* Interaction toolbar under the 3D vinyl */}
            <div className="start-vinyl-actions">
              <button
                type="button"
                className="start-action-pill start-action-pill--flip"
                onClick={() => setIsFlipped((prev) => !prev)}
                title="Voltejar funda de vinil 180°"
              >
                <span className="pill-icon">↺</span>
                <span>{isFlipped ? "Veure Portada (Cara A)" : "Girar Contraportada (Cara B)"}</span>
                <kbd className="pill-kbd">Espai</kbd>
              </button>

              <button
                type="button"
                className={`start-action-pill ${isPlayingAudio ? "start-action-pill--playing" : ""}`}
                onClick={toggleAudio}
                title="Reproduir mostra oficial"
              >
                <span className="pill-icon">{isPlayingAudio ? "❚❚" : "▶"}</span>
                <span>{isPlayingAudio ? "Pausar Nineta" : "Reproduir Mostra (4:07)"}</span>
              </button>

              <a
                href="https://open.spotify.com/intl-es/album/0nsEwLdHyVm27hZtQihPTl"
                target="_blank"
                rel="noopener noreferrer"
                className="start-action-pill start-action-pill--spotify"
                title="Obrir àlbum sencer a Spotify"
              >
                <span>Escoltar a Spotify</span>
                <span className="pill-arrow">&rarr;</span>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          SECCIÓ 3: PRESENTACIÓ AL PRINCIPAL (Concert Documental)
          ============================================================ */}
      <section
        id="sec-principal"
        className="start-section-principal"
        aria-label="Capítol 3: Presentació al Teatre Principal"
      >
        <div className="start-section-principal__photo">
          <div className="start-photo-overlay-tag">
            <span className="start-archive-badge">ARXIU #03</span>
            <span className="start-archive-tag">CONCERT DOCUMENTAL // DIRECTE HISTÒRIC</span>
          </div>

          <BlockReveal color="#000000" direction="rl" delay={100} duration={600}>
            <img
              decoding="async"
              src="/images/MiquelGilViatger_Principal.webp"
              alt="Miquel Gil en directe al Teatre Principal de València"
            />
          </BlockReveal>

          <div className="start-photo-caption">
            <span>TEATRE PRINCIPAL DE VALÈNCIA // FOTOGRAFIA D&apos;ARXIU</span>
          </div>
        </div>

        <div className="start-section-principal__content">
          <div className="start-chapter-indicator start-chapter-indicator--dark">
            <span className="start-chapter-index">03</span>
            <span className="start-chapter-total">/ 03</span>
            <span className="start-chapter-title">CRÒNICA DE DIRECTE</span>
          </div>

          <div className="start-big-title-stack">
            <AnimatedTitle
              as="h2"
              text="PRESENTACIÓ"
              color="#000000"
              className="start-big-title--black"
              delay={0}
            />
            <AnimatedTitle
              as="h2"
              text="AL"
              color="#000000"
              className="start-big-title--black"
              delay={180}
            />
            <AnimatedTitle
              as="h2"
              text="PRINCIPAL"
              color="#000000"
              className="start-big-title--black"
              delay={320}
            />
          </div>

          <AnimatedDivider color="#FF0000" delay={250} />

          <BlockReveal color="#FF0000" direction="lr" delay={300} duration={700} fullWidth>
            <div className="start-desc-stack">
              <p className="start-desc--black">
                El passat dissabte, van viure una nit inoblidable al Teatre
                Principal amb la presentació del nou disc de Miquel Gil, &ldquo;Viatger&rdquo;.
                L&rsquo;atmosfera del teatre es va omplir d&rsquo;emoció i expectació.
              </p>
              <p className="start-desc--black">
                Els col·laboradors especials, entre els quals es trobaven Pep Gimeno
                &ldquo;Botifarra&rdquo;, Vicent Torrent, Maria Bertomeu &ldquo;La Maria&rdquo;, Noelia
                Llorens &ldquo;Titana&rdquo; i Borja Penalba, van aportar la seva pròpia màgia a
                la nit, enriquint les actuacions amb la seva presència única i les
                seves interpretacions brillants.
              </p>
            </div>
          </BlockReveal>

          <div className="start-principal-guests">
            <span className="start-guests-label">ARTISTES CONVIDATS D&apos;HONOR</span>
            <div className="start-guests-pills">
              <span className="start-guest-pill">Pep Gimeno &ldquo;Botifarra&rdquo;</span>
              <span className="start-guest-pill">Vicent Torrent (Al Tall)</span>
              <span className="start-guest-pill">Maria Bertomeu &ldquo;La Maria&rdquo;</span>
              <span className="start-guest-pill">Noelia Llorens &ldquo;Titana&rdquo;</span>
              <span className="start-guest-pill">Borja Penalba</span>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          DOCK INFERIOR D'ARXIU FLOTANT (A24 ARCHIVE BOTTOM DOCK)
          ============================================================ */}
      <footer className="start-archive-dock" role="contentinfo" aria-label="Estat d'arxiu i reproducció">
        <div className="start-dock-inner">
          <div className="start-dock-left">
            <span className="start-dock-dot" aria-hidden="true" />
            <span className="start-dock-current">
              {activeSection === "nineta" && "ARXIU [ 01 / 03 ] · NINETA (CLIP OFICIAL)"}
              {activeSection === "viatger" && "ARXIU [ 02 / 03 ] · VIATGER (NOU LP 33 RPM)"}
              {activeSection === "principal" && "ARXIU [ 03 / 03 ] · PRESENTACIÓ AL PRINCIPAL"}
            </span>
          </div>

          <div className="start-dock-center">
            <div className="start-dock-nav">
              <button
                type="button"
                onClick={() => scrollTo("sec-nineta")}
                className={`start-dock-nav-btn ${activeSection === "nineta" ? "is-active" : ""}`}
              >
                01 Nineta
              </button>
              <button
                type="button"
                onClick={() => scrollTo("sec-viatger")}
                className={`start-dock-nav-btn ${activeSection === "viatger" ? "is-active" : ""}`}
              >
                02 Viatger
              </button>
              <button
                type="button"
                onClick={() => scrollTo("sec-principal")}
                className={`start-dock-nav-btn ${activeSection === "principal" ? "is-active" : ""}`}
              >
                03 Principal
              </button>
            </div>
          </div>

          <div className="start-dock-right">
            <div className="start-dock-shortcuts">
              <span className="shortcut-item">
                <kbd className="dock-kbd">Espai</kbd> Girar vinil
              </span>
              <span className="shortcut-item">
                <kbd className="dock-kbd">1-3</kbd> Capítols
              </span>
              <span className="shortcut-item">
                <kbd className="dock-kbd">M</kbd> So
              </span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
