"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import HandTrackingCam from "@/components/HandTrackingCam";
import LiquidFillTransition, {
  LiquidFillTransitionHandle,
} from "@/components/LiquidFillTransition";
import "./paper.css";

export default function PaperClient() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const liquidRef = useRef<LiquidFillTransitionHandle | null>(null);

  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [isExiting, setIsExiting] = useState<boolean>(false);

  // Precàrrega de la ruta de destí
  useEffect(() => {
    try {
      router.prefetch("/discografia/");
    } catch (_) {}
  }, [router]);

  // Gestió gestual de la mà (des del component HandTrackingCam)
  const handleGestureChange = useCallback(
    (gesture: "open" | "fist") => {
      if (isExiting) return;
      const video = videoRef.current;
      if (!video) return;

      if (gesture === "open") {
        const playPromise = video.play();
        if (playPromise !== undefined) {
          playPromise
            .then(() => setIsPlaying(true))
            .catch(() => {});
        }
      } else if (gesture === "fist") {
        video.pause();
        setIsPlaying(false);
      }
    },
    [isExiting]
  );

  // Alternança manual de play/pausa clicant sobre el vídeo
  const togglePlayPause = () => {
    if (isExiting) return;
    const video = videoRef.current;
    if (!video) return;

    if (video.paused) {
      video
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {});
    } else {
      video.pause();
      setIsPlaying(false);
    }
  };

  const toggleSound = (e: React.MouseEvent) => {
    e.stopPropagation();
    const video = videoRef.current;
    if (!video) return;
    video.muted = !video.muted;
    setIsMuted(video.muted);
  };

  // Autoplay inicial del vídeo paper en muntar
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      const p = video.play();
      if (p !== undefined) {
        p.then(() => setIsPlaying(true)).catch(() => {});
      }
    }
  }, []);

  // Seqüència cinètica de Benvinguda:
  // 1. Les lletres i la interfície desapareixen
  // 2. Es queda només el vídeo del paper animant-se sol al fons negre
  // 3. Després d'uns segons, dóna pas fluidament a la web (/discografia/)
  const handleWelcome = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isExiting) return;

    setIsExiting(true);

    // Reiniciar i assegurar reproducció del vídeo de paper perquè es vegi des de l'inici
    const video = videoRef.current;
    if (video) {
      video.currentTime = 0;
      video
        .play()
        .then(() => setIsPlaying(true))
        .catch(() => {});
    }

    // Després de deixar el vídeo com a protagonista únic sobre el negre (~1.7s), donem pas a la web
    setTimeout(() => {
      if (liquidRef.current) {
        liquidRef.current.trigger(0.5, 0.5, () => {
          router.push("/discografia/");
        });
      } else {
        router.push("/discografia/");
      }
    }, 1750);
  };

  return (
    <main className={`paper-root ${isExiting ? "is-exiting" : ""}`}>
      {/* Subtle background glow */}
      <div className="paper-ambient-glow" />

      {/* -------------------------------------------------------------
          TOP NAVIGATION (Miquel Gil)
          ------------------------------------------------------------- */}
      <nav className="paper-nav">
        {/* Logo oficial en Maelstrom */}
        <Link href="/" className="paper-logo" title="Arxiu Oficial de Miquel Gil">
          Miquel Gil
        </Link>

        {/* Enllaços centrals a les seccions reals de la web */}
        <ul className="paper-nav-links">
          <li>
            <Link href="/discografia/" className="paper-nav-link">
              Discografia
            </Link>
          </li>
          <li>
            <Link href="/biografia/" className="paper-nav-link">
              Biografia
            </Link>
          </li>
          <li>
            <Link href="/directes/" className="paper-nav-link">
              Directes
            </Link>
          </li>
          <li>
            <Link href="/contacte/" className="paper-nav-link">
              Contacte
            </Link>
          </li>
        </ul>

        {/* Botó de Benvinguda a la dreta */}
        <div className="paper-nav-actions">
          <button
            type="button"
            className="paper-btn-welcome-nav"
            onClick={handleWelcome}
            title="Entrar a l'arxiu oficial de Miquel Gil"
          >
            Benvinguts ↗
          </button>
        </div>
      </nav>

      {/* -------------------------------------------------------------
          HERO GRID SECTION
          ------------------------------------------------------------- */}
      <section className="paper-hero">
        {/* Columna esquerra: Textos oficials adaptats de Miquel Gil */}
        <div className="paper-hero-left">
          <div className="paper-headline-block">
            {/* Tagline superior */}
            <div className="paper-tagline">
              <span className="paper-tagline-dot" />
              <span>ARXIU OFICIAL // 1975–2026 · 50 ANYS DE TRAJECTÒRIA</span>
            </div>

            {/* Titular poètic amb les nostres tipografies (Maelstrom + Grifinito L) */}
            <h1 className="paper-heading">
              <span className="paper-heading-main">
                La memòria viva de la terra,
              </span>
              <span className="paper-heading-serif-italic">
                la veu lliure del cant d'arrel.
              </span>
            </h1>
          </div>

          {/* Part inferior esquerra: paràgraf de presentació + botó d'entrada A24 */}
          <div className="paper-bottom-left">
            <p className="paper-subtitle">
              Mig segle de creació ininterrompuda: de la refundació històrica de la
              música tradicional valenciana amb Al Tall a les sonoritats contemporànies
              d’<em>Orgànic</em>, <em>Katà</em>, <em>Viatger</em> i <em>Geometries</em>.
            </p>

            <div className="paper-enter-btn-wrapper">
              <button
                type="button"
                className="btn a24-btn paper-enter-btn"
                onClick={handleWelcome}
                aria-label="Benvinguts a l'arxiu oficial de Miquel Gil"
              >
                <div className="btn__divider" />
                <span className="btn__p-mask">
                  <span
                    className="btn__p"
                    data-hover-inner=""
                    data-text="BENVINGUTS A L'ARXIU ↗"
                  >
                    <span data-hover-text="">BENVINGUTS A L'ARXIU ↗</span>
                  </span>
                </span>
                <div className="btn__divider" />
              </button>
            </div>
          </div>
        </div>

        {/* Columna dreta: Vídeo Paper Reel (Espillat horitzontalment) */}
        <div className="paper-hero-right">
          <div
            className="paper-reel-container"
            onClick={togglePlayPause}
            title={isPlaying ? "Fes clic per pausar (o tanca el puny)" : "Fes clic per reproduir (o obre la mà)"}
          >
            <video
              ref={videoRef}
              src="/video/paper_reel.mp4"
              poster="/video/paper_poster.jpg"
              autoPlay
              loop
              muted
              playsInline
              // @ts-ignore
              webkit-playsinline="true"
              className="paper-reel-video"
              onPlay={() => setIsPlaying(true)}
              onPause={() => setIsPlaying(false)}
            />

            {/* Metadades sobreposades al vídeo (desapareixen en activar la benvinguda) */}
            <div className="paper-reel-overlay">
              <div className="paper-reel-top-meta">
                <span className="paper-reel-status-pill">
                  <span className={`status-dot-pulse ${!isPlaying ? "is-paused" : ""}`} />
                  {isPlaying ? "REEL EN DIRECTE [MÀ OBERTA]" : "PAUSAT [PUNY DETECTAT]"}
                </span>
                <span className="paper-reel-tag">PAPER REEL // ARXIU</span>
              </div>

              <div className="paper-reel-bottom-meta">
                <div className="paper-reel-info">
                  <span className="reel-title">PAPER PORTRAIT</span>
                  <span className="reel-sub">Escultura cinètica de plecs i memòria</span>
                </div>

                <button
                  type="button"
                  className="paper-sound-btn"
                  onClick={toggleSound}
                  title={isMuted ? "Activar so" : "Silenciar so"}
                  aria-label="So"
                >
                  {isMuted ? "🔇" : "🔊"}
                </button>
              </div>
            </div>

            {/* Indicador quan està en pausa */}
            {!isPlaying && !isExiting && (
              <div className="paper-reel-paused-indicator">
                <div className="pause-icon-circle">❚❚</div>
                <span className="pause-text">PAUSAT PER GEST O CLIC</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------
          FINESTRA FLOTANT DE CÀMERA (DRAGGABLE, RESIZABLE, SKELETON)
          ------------------------------------------------------------- */}
      <HandTrackingCam
        onGestureChange={handleGestureChange}
        currentVideoState={isPlaying ? "playing" : "paused"}
      />

      {/* -------------------------------------------------------------
          TRANSICIÓ LÍQUIDA DE FONS PER PASSAR A LA WEB
          ------------------------------------------------------------- */}
      <LiquidFillTransition
        ref={liquidRef}
        color="#000000"
        duration={0.75}
      />
    </main>
  );
}
