"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import LiquidFillTransition, {
  LiquidFillTransitionHandle,
} from "@/components/LiquidFillTransition";
import "./home-gate.css";

export default function Home() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const buttonRef = useRef<HTMLAnchorElement | null>(null);
  const liquidRef = useRef<LiquidFillTransitionHandle | null>(null);
  const targetTimeRef = useRef<number>(0);
  const isSeekingRef = useRef<boolean>(false);
  const prevXRef = useRef<number | null>(null);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);

  // Background video controller:
  // - En mòbil s'inicia en autoplay mut per despertar el descodificador d'iOS WebKit (evitant pantalla negra)
  // - En tocar o moure el ratolí, es pausa i fa scrubbing directe 1:1 segons la posició horitzontal
  useEffect(() => {
    // Assegurar estat net per si es torna amb el botó enrere del navegador (bfcache)
    if (liquidRef.current) {
      liquidRef.current.reset();
    }
    setIsTransitioning(false);

    // Precàrrega de la ruta /discografia/ en segon pla per a una transició instantània
    try {
      router.prefetch("/discografia/");
    } catch (_) {}

    const video = videoRef.current;
    if (video) {
      const playPromise = video.play();
      if (playPromise !== undefined) {
        playPromise.catch(() => {
          // Autoplay silenciós bloquejat pel navegador fins al primer gest
        });
      }
    }

    const handleMouseMove = (e: MouseEvent) => {
      const vid = videoRef.current;
      if (!vid || !vid.duration || isNaN(vid.duration)) return;

      if (!vid.paused) {
        vid.pause();
      }

      prevXRef.current = e.clientX;
      const progress = Math.max(0, Math.min(1, e.clientX / window.innerWidth));
      const nextTarget = progress * vid.duration;
      targetTimeRef.current = nextTarget;

      if (!isSeekingRef.current) {
        isSeekingRef.current = true;
        vid.currentTime = nextTarget;
      }
    };

    // Touch scrubbing per a mòbils (iOS & Android)
    const handleTouchStart = (e: TouchEvent) => {
      const vid = videoRef.current;
      if (!vid || !vid.duration || isNaN(vid.duration)) return;

      if (!vid.paused) {
        vid.pause();
      }

      if (e.touches.length > 0) {
        const clientX = e.touches[0].clientX;
        prevXRef.current = clientX;
        const progress = Math.max(0, Math.min(1, clientX / window.innerWidth));
        const nextTarget = progress * vid.duration;
        targetTimeRef.current = nextTarget;

        if (!isSeekingRef.current) {
          isSeekingRef.current = true;
          vid.currentTime = nextTarget;
        }
      }
    };

    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 0) return;
      const vid = videoRef.current;
      if (!vid || !vid.duration || isNaN(vid.duration)) return;

      if (!vid.paused) {
        vid.pause();
      }

      const clientX = e.touches[0].clientX;
      prevXRef.current = clientX;
      const progress = Math.max(0, Math.min(1, clientX / window.innerWidth));
      const nextTarget = progress * vid.duration;
      targetTimeRef.current = nextTarget;

      if (!isSeekingRef.current) {
        isSeekingRef.current = true;
        vid.currentTime = nextTarget;
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchstart", handleTouchStart, { passive: true });
    window.addEventListener("touchmove", handleTouchMove, { passive: true });

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, [router]);

  // onSeeked handler: gestiona la cua per evitar seek-flooding
  const handleSeeked = () => {
    const video = videoRef.current;
    if (!video || !video.duration) {
      isSeekingRef.current = false;
      return;
    }

    if (Math.abs(video.currentTime - targetTimeRef.current) > 0.005) {
      video.currentTime = targetTimeRef.current;
    } else {
      isSeekingRef.current = false;
    }
  };

  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    if (video && video.duration && prevXRef.current !== null) {
      const progress = Math.max(0, Math.min(1, prevXRef.current / window.innerWidth));
      const nextTarget = progress * video.duration;
      video.currentTime = nextTarget;
      targetTimeRef.current = nextTarget;
    }
  };

  // Disparador de la transició de farcit líquid (liquid fill) en clicar "ENTRAR A LA WEB"
  const handleEnterClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    e.preventDefault();
    if (isTransitioning) return;

    // Comprovació d'accessibilitat: navegació directa si l'usuari té moviment reduït
    const prefersReducedMotion =
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches;

    if (prefersReducedMotion) {
      router.push("/discografia/");
      return;
    }

    setIsTransitioning(true);

    // Calcular el centre exacte del botó a la pantalla
    let originX = 0.5;
    let originY = 0.88;
    if (buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      originX = (rect.left + rect.width / 2) / window.innerWidth;
      originY = (rect.top + rect.height / 2) / window.innerHeight;
    }

    // Disparar l'expansió orgànica del líquid
    if (liquidRef.current) {
      liquidRef.current.trigger(originX, originY, () => {
        router.push("/discografia/");
      });
    } else {
      router.push("/discografia/");
    }
  };

  return (
    <main className="intro-gate-root">
      {/* Títol H1 semàntic per a motors de cerca */}
      <h1 className="sr-only">Miquel Gil — Arxiu Oficial i Trajectòria Artística</h1>

      {/* -------------------------------------------------------------
          VÍDEO DE FONS (amb poster d'alta fidelitat i autoplay mut per a mòbil)
          ------------------------------------------------------------- */}
      <video
        ref={videoRef}
        src="/video/mainframe_bg.mp4"
        poster="/video/mainframe_poster.jpg"
        autoPlay
        muted
        loop
        playsInline
        // @ts-ignore
        webkit-playsinline="true"
        x5-playsinline="true"
        className="intro-gate-video"
        onSeeked={handleSeeked}
        onLoadedMetadata={handleLoadedMetadata}
      />

      {/* -------------------------------------------------------------
          ÚNIC BOTÓ D'ENTRADA (DISSENY EXACTE DE LES FITXES DELS CDS)
          ------------------------------------------------------------- */}
      <div className="intro-gate-action">
        <Link
          ref={buttonRef}
          href="/discografia/"
          onClick={handleEnterClick}
          data-hover=""
          className={`btn a24-btn ${isTransitioning ? "is-entering" : ""}`}
          aria-label="Entrar a la web oficial de Miquel Gil"
          tabIndex={0}
        >
          <div className="btn__divider" />
          <span className="btn__p-mask">
            <span
              className="btn__p"
              data-hover-inner=""
              data-text={isTransitioning ? "ENTRANT..." : "ENTRAR A LA WEB ↗"}
            >
              <span data-hover-text="">
                {isTransitioning ? "ENTRANT..." : "ENTRAR A LA WEB ↗"}
              </span>
            </span>
          </span>
          <div className="btn__divider" />
        </Link>
      </div>

      {/* -------------------------------------------------------------
          CAPA DE TRANSICIÓ DE FARCIT LÍQUID (WEBGL METABALLS + NOISE)
          ------------------------------------------------------------- */}
      <LiquidFillTransition
        ref={liquidRef}
        color="#050505"
        duration={0.85}
      />
    </main>
  );
}
