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
  const hasTriggeredFadeRef = useRef<boolean>(false);
  const fallbackTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Precàrrega suau de /discografia/ retardada per prioritzar el render inicial del hero
  useEffect(() => {
    const t = setTimeout(() => {
      try {
        router.prefetch("/discografia/");
      } catch (_) {}
    }, 1500);
    return () => clearTimeout(t);
  }, [router]);

  // Assegurar que el vídeo estigui en pausa inicialment (no bucle, no autoplay)
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      video.pause();
      video.currentTime = 0;
    }
    return () => {
      if (fallbackTimerRef.current) clearTimeout(fallbackTimerRef.current);
    };
  }, []);

  // Transició cinètica quan la cara acaba de plegar-se completament en bola de paper
  const triggerFadeAndTransition = () => {
    if (hasTriggeredFadeRef.current) return;
    hasTriggeredFadeRef.current = true;

    if (fallbackTimerRef.current) {
      clearTimeout(fallbackTimerRef.current);
      fallbackTimerRef.current = null;
    }

    // Pas 1: Fundit a negre en finalitzar l'animació de la cara
    setIsFadingToBlack(true);

    // Pas 2: Mostrar el logotip blanc oficial de Miquel Gil al centre del negre
    setTimeout(() => {
      setShowLogo(true);
    }, 420);

    // Pas 3: Transició de l'efecte líquid directament cap a discografia
    setTimeout(() => {
      if (liquidRef.current) {
        liquidRef.current.trigger(0.5, 0.5, () => {
          router.push("/discografia/");
        });
      } else {
        router.push("/discografia/");
      }
    }, 1450);
  };

  // Seqüència cinètica en prémer "Entrar a la web":
  // 1. Tipografies desapareixen IMMEDIATAMENT SENSE ANIMACIÓ.
  // 2. El vídeo de la cara es reprodueix per complet fins al final (per apreciar tot el plegat en bola).
  // 3. El fundit a negre s'activa quan culmina l'animació de la cara (~3.3s - 3.5s).
  // 4. Es mostra el logotip oficial de Miquel Gil (/images/logo-W.png) en blanc al centre del negre.
  // 5. Transició de l'efecte líquid des del centre cap a la pantalla de discografia.
  const handleEnter = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (hasTriggeredSequenceRef.current) return;
    hasTriggeredSequenceRef.current = true;

    // Desaparició immediata dels textos sense cap animació
    setIsExiting(true);

    const video = videoRef.current;
    if (video) {
      video.currentTime = 0;
      video.playbackRate = 1.05; // Velocitat fluida i natural per apreciar el plegat sencer
      video.play().catch(() => {});
    }

    // Fallback de seguretat si no s'emeten els esdeveniments del vídeo
    fallbackTimerRef.current = setTimeout(() => {
      triggerFadeAndTransition();
    }, 3650);
  };

  const handleVideoTimeUpdate = () => {
    const video = videoRef.current;
    if (!video || !isExiting || hasTriggeredFadeRef.current) return;
    const dur = video.duration || 3.92;
    // S'activa quan la bola de paper s'ha format completament
    if (video.currentTime >= 3.35 || video.currentTime >= dur - 0.45) {
      triggerFadeAndTransition();
    }
  };

  const handleVideoEnded = () => {
    if (isExiting) {
      triggerFadeAndTransition();
    }
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
          <div className="paper-title-group">
            <h1 className="paper-hero-heading">
              <span>La memòria viva</span>
              <span>de la terra,</span>
              <span>en cada plec del cant.</span>
            </h1>
          </div>

          {/* Línia separadora horitzontal */}
          <div className="paper-divider-horizontal" />

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
            preload="metadata"
            muted
            playsInline
            // @ts-ignore
            webkit-playsinline="true"
            className="paper-face-video"
            onTimeUpdate={handleVideoTimeUpdate}
            onEnded={handleVideoEnded}
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
