"use client";

import React, { useRef, useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import gsap from "gsap";
import LiquidFillTransition, {
  LiquidFillTransitionHandle,
} from "@/components/LiquidFillTransition";
import "./paper.css";

export default function PaperClient() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const liquidRef = useRef<LiquidFillTransitionHandle | null>(null);

  const leftContentRef = useRef<HTMLDivElement | null>(null);
  const titleSpansRef = useRef<(HTMLSpanElement | null)[]>([]);
  const dividerRef = useRef<HTMLDivElement | null>(null);
  const descRef = useRef<HTMLParagraphElement | null>(null);
  const ctaWrapperRef = useRef<HTMLDivElement | null>(null);

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

  // Transició cinètica: Fundit a negre ABANS que acabi el vídeo, logotip i efecte líquid a discografia
  const triggerFadeAndTransition = () => {
    if (hasTriggeredFadeRef.current) return;
    hasTriggeredFadeRef.current = true;

    if (fallbackTimerRef.current) {
      clearTimeout(fallbackTimerRef.current);
      fallbackTimerRef.current = null;
    }

    // Pas 1: Fundit a negre suau iniciat abans que acabi el vídeo
    setIsFadingToBlack(true);

    // Pas 2: Mostrar el logotip blanc oficial de Miquel Gil al centre del negre
    setTimeout(() => {
      setShowLogo(true);
    }, 450);

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
  // 1. Animació GSAP elegant on desapareixen títols, línia divisòria i subtítols.
  // 2. Entra l'animació de la cara (el vídeo s'acciona).
  // 3. Abans que acabi el vídeo de la cara, s'inicia el fundit a negre.
  // 4. Mostra el logotip oficial de Miquel Gil en blanc al centre del negre.
  // 5. Transició líquida cap a /discografia/ per carregar la web.
  const handleEnter = (e?: React.MouseEvent) => {
    if (e) e.preventDefault();
    if (hasTriggeredSequenceRef.current) return;
    hasTriggeredSequenceRef.current = true;

    setIsExiting(true);

    // 1. Animació cinètica amb GSAP de desaparició dels textos
    const titleElements = titleSpansRef.current.filter(Boolean);
    const tl = gsap.timeline();

    // Desaparició esglaonada: elevació suau, desenfocament i esvaïment
    if (titleElements.length > 0) {
      tl.to(
        titleElements,
        {
          y: -28,
          opacity: 0,
          filter: "blur(10px)",
          duration: 0.55,
          stagger: 0.08,
          ease: "power2.inOut",
        },
        0
      );
    }

    if (dividerRef.current) {
      tl.to(
        dividerRef.current,
        {
          scaleX: 0,
          opacity: 0,
          duration: 0.45,
          ease: "power2.inOut",
        },
        0.06
      );
    }

    if (descRef.current) {
      tl.to(
        descRef.current,
        {
          y: -20,
          opacity: 0,
          filter: "blur(8px)",
          duration: 0.52,
          ease: "power2.inOut",
        },
        0.1
      );
    }

    if (ctaWrapperRef.current) {
      tl.to(
        ctaWrapperRef.current,
        {
          y: -14,
          opacity: 0,
          scale: 0.96,
          duration: 0.38,
          ease: "power2.inOut",
        },
        0.04
      );
    }

    tl.to(leftContentRef.current, {
      autoAlpha: 0,
      duration: 0.15,
      onComplete: () => {
        if (leftContentRef.current) {
          leftContentRef.current.style.display = "none";
        }
      },
    });

    // 2. Aquí entra l'animació de la cara (reproducció a velocitat fluida)
    const video = videoRef.current;
    if (video) {
      video.currentTime = 0;
      video.playbackRate = 1.08;
      video.play().catch(() => {});
    }

    // Fallback de seguretat abans que acabi el vídeo per si no salta l'esdeveniment
    fallbackTimerRef.current = setTimeout(() => {
      triggerFadeAndTransition();
    }, 2750);
  };

  // 3. Abans que acabi l'animació del vídeo (abans del final), s'inicia el fundit a negre
  const handleVideoTimeUpdate = () => {
    const video = videoRef.current;
    if (!video || !isExiting || hasTriggeredFadeRef.current) return;
    const dur = video.duration || 3.92;
    // S'inicia el fundit a negre abans del final (quan la bola es replega, ~2.45s o dur - 1.25s)
    if (video.currentTime >= 2.45 || video.currentTime >= dur - 1.25) {
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
        <div ref={leftContentRef} className="paper-left-content">
          {/* Gran titular amb la directriu de disseny exacta de /discografia/viatger/ */}
          <div className="paper-title-group">
            <h1 className="paper-hero-heading">
              <span
                ref={(el) => {
                  titleSpansRef.current[0] = el;
                }}
              >
                La memòria viva
              </span>
              <span
                ref={(el) => {
                  titleSpansRef.current[1] = el;
                }}
              >
                de la terra,
              </span>
              <span
                ref={(el) => {
                  titleSpansRef.current[2] = el;
                }}
              >
                en cada plec del cant.
              </span>
            </h1>
          </div>

          {/* Línia separadora horitzontal */}
          <div ref={dividerRef} className="paper-divider-horizontal" />

          {/* Subtítol descriptiu en Neue Montreal i Museum */}
          <p ref={descRef} className="paper-hero-desc">
            Mig segle de creació ininterrompuda: de la refundació històrica de la
            música tradicional valenciana amb Al Tall a les sonoritats contemporànies
            d’<em>Orgànic</em>, <em>Katà</em>, <em>Viatger</em> i <em>Geometries</em>.
          </p>

          {/* Únic botó d'entrada "Entrar a la web" */}
          <div ref={ctaWrapperRef} className="paper-cta-wrapper">
            <button
              type="button"
              className="paper-hero-cta-btn"
              onClick={handleEnter}
              aria-label="Entrar a la web oficial de Miquel Gil"
            >
              <span>Entrar a la web</span>
              <span className="cta-arrow" aria-hidden="true">
                →
              </span>
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
