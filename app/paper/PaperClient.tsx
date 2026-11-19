"use client";

import React, { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import "./paper.css";

export default function PaperClient() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isExiting, setIsExiting] = useState<boolean>(false);
  const [isFadingToBlack, setIsFadingToBlack] = useState<boolean>(false);
  const hasTriggeredFadeRef = useRef<boolean>(false);

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

  // Execució del fundit a negre i navegació a /discografia/
  const triggerFadeToBlack = () => {
    if (hasTriggeredFadeRef.current) return;
    hasTriggeredFadeRef.current = true;
    setIsFadingToBlack(true);

    // Un cop el fundit a negre és complet (550ms), passem a la pàgina de discografia
    setTimeout(() => {
      router.push("/discografia/");
    }, 550);
  };

  // Acció en clicar "Entrar a la web":
  // 1. Desapareixen les tipografies
  // 2. La cara es queda al seu lloc (a la dreta) i s'acciona la seva animació
  // 3. Quan acaba, es produeix un fundit a negre i pas a /discografia/
  const handleEnter = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (isExiting) return;

    setIsExiting(true);

    const video = videoRef.current;
    if (video) {
      video.currentTime = 0;
      video.play().catch(() => {});
    }

    // Fallback de seguretat per si l'esdeveniment 'ended' no es dispara en algun navegador (~3.9s)
    setTimeout(() => {
      triggerFadeToBlack();
    }, 3900);
  };

  const handleVideoEnded = () => {
    triggerFadeToBlack();
  };

  const handleSkipOnClick = () => {
    if (isExiting) {
      triggerFadeToBlack();
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
          {/* Gran titular amb Neue Montreal i Eiko Medium */}
          <h1 className="paper-hero-heading">
            <span className="heading-line">La memòria viva</span>
            <span className="heading-line">de la terra,</span>
            <span className="heading-line-serif">en cada plec del cant.</span>
          </h1>

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
            onEnded={handleVideoEnded}
          />
        </div>
      </div>

      {/* -------------------------------------------------------------
          CAPA DE FUNDIT A NEGRE EN FINALITZAR L'ANIMACIÓ DE LA CARA
          ------------------------------------------------------------- */}
      <div
        className={`paper-fade-to-black ${isFadingToBlack ? "is-active" : ""}`}
        aria-hidden="true"
      />
    </main>
  );
}
