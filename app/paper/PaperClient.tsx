"use client";

import React, { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import LiquidFillTransition, {
  LiquidFillTransitionHandle,
} from "@/components/LiquidFillTransition";
import "./paper.css";

export default function PaperClient() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const liquidRef = useRef<LiquidFillTransitionHandle | null>(null);

  const [isExiting, setIsExiting] = useState<boolean>(false);
  const [isFadingToBlack, setIsFadingToBlack] = useState<boolean>(false);
  const [showLogo, setShowLogo] = useState<boolean>(false);
  const hasTriggeredSequenceRef = useRef<boolean>(false);

  // Precàrrega de la ruta /discografia/ per a una navegació immediata
  useEffect(() => {
    try {
      router.prefetch("/discografia/");
    } catch (_) {}
  }, [router]);

  // Assegurar que el vídeo estigui en pausa inicialment (no bucle, no autoplay)
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.pause();
      video.currentTime = 0;
    }
  }, []);

  // Seqüència cinètica en prémer "Entrar a la web":
  // 1. Tipografies desapareixen immediatament.
  // 2. El vídeo de la cara es reprodueix més ràpid (playbackRate: 1.45) i es queda al seu lloc.
  // 3. El fundit a negre apareix una mica abans (~1.6s).
  // 4. Es mostra el logotip de MIQUEL GIL en blanc al centre del negre.
  // 5. Transició de l'efecte líquid des del centre cap a la pantalla de discografia.
  const handleEnter = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (hasTriggeredSequenceRef.current) return;
    hasTriggeredSequenceRef.current = true;

    setIsExiting(true);

    const video = videoRef.current;
    if (video) {
      video.currentTime = 0;
      video.playbackRate = 1.45; // Animació més ràpida
      video.play().catch(() => {});
    }

    // Pas 1: El fundit a negre s'activa abans (~1.65s)
    setTimeout(() => {
      setIsFadingToBlack(true);
    }, 1650);

    // Pas 2: Es mostra el logotip de MIQUEL GIL en blanc al centre
    setTimeout(() => {
      setShowLogo(true);
    }, 2100);

    // Pas 3: Transició de l'efecte líquid directament cap a discografia
    setTimeout(() => {
      if (liquidRef.current) {
        liquidRef.current.trigger(0.5, 0.5, () => {
          router.push("/discografia/");
        });
      } else {
        router.push("/discografia/");
      }
    }, 2950);
  };

  const handleSkipOnClick = () => {
    if (isExiting) {
      router.push("/discografia/");
    }
  };

  return (
    <main className={`paper-root ${isExiting ? "is-exiting" : ""}`}>
      {/* -------------------------------------------------------------
          HERO BODY: TEXTOS A L'ESQUERRA + VÍDEO A SANG A LA DRETA
          (Sense header ni menú de navegació)
          ------------------------------------------------------------- */}
      <div className="paper-hero-body">
        {/* Columna esquerra: Textos i Botó "Entrar a la web" */}
        <div className="paper-left-content">
          {/* Gran titular amb la directriu de disseny exacta de /discografia/viatger/ */}
          <div className="production__title paper-title-group">
            <h1 className="heading-l paper-hero-heading">
              <span>La memòria viva</span>
              <span>de la terra,</span>
              <span>en cada plec del cant.</span>
            </h1>
          </div>

          {/* Línia separadora horitzontal idèntica a /discografia/viatger/ */}
          <div className="divider-horizontal" />

          {/* Subtítol descriptiu en Neue Montreal i Museum */}
          <p className="paper-hero-desc">
            Mig segle de creació ininterrompuda: de la refundació històrica de la
            música tradicional valenciana amb Al Tall a les sonoritats contemporànies
            d’<em>Orgànic</em>, <em>Katà</em>, <em>Viatger</em> i <em>Geometries</em>.
          </p>

          {/* Únic botó d'entrada "Entrar a la web" */}
          <div className="paper-cta-wrapper">
            <button
              type="button"
              className="paper-hero-cta-btn"
              onClick={handleEnter}
              aria-label="Entrar a la web oficial de Miquel Gil"
            >
              <span>Entrar a la web</span>
              <span className="cta-arrow" aria-hidden="true">→</span>
            </button>
          </div>
        </div>

        {/* VÍDEO DE LA CARA: A SANG, SENSE REQUADRES NI MARCS
            Es queda al seu lloc a la dreta (no passa al centre) */}
        <div
          className="paper-face-video-wrapper"
          onClick={handleSkipOnClick}
          title={isExiting ? "Fes clic per avançar" : undefined}
        >
          <video
            ref={videoRef}
            src="/video/paper_reel.mp4"
            poster="/video/paper_poster.jpg"
            preload="auto"
            muted
            playsInline
            // @ts-ignore
            webkit-playsinline="true"
            className="paper-face-video"
          />
        </div>
      </div>

      {/* -------------------------------------------------------------
          CAPA DE FUNDIT A NEGRE
          ------------------------------------------------------------- */}
      <div
        className={`paper-fade-to-black ${isFadingToBlack ? "is-active" : ""}`}
        aria-hidden="true"
        onClick={handleSkipOnClick}
      />

      {/* -------------------------------------------------------------
          LOGOTIP DE MIQUEL GIL EN BLANC SOBRE EL NEGRE
          El logotip oficial del menú de /discografia (/images/logo-W.png)
          ------------------------------------------------------------- */}
      <div
        className={`paper-transition-logo-wrap ${showLogo ? "is-visible" : ""}`}
        aria-hidden="true"
      >
        <img
          src="/images/logo-W.png"
          alt="Miquel Gil"
          className="paper-transition-logo-img"
        />
      </div>

      {/* -------------------------------------------------------------
          TRANSICIÓ DE L'EFECTE LÍQUID A LA PANTALLA DE DISCOGRAFIA
          ------------------------------------------------------------- */}
      <LiquidFillTransition
        ref={liquidRef}
        color="#f2f2f2"
        duration={0.78}
      />
    </main>
  );
}
