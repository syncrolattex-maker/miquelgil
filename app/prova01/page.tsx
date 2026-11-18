"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import "./prova01.css";

export default function IntroGatePage() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const targetTimeRef = useRef<number>(0);
  const isSeekingRef = useRef<boolean>(false);
  const prevXRef = useRef<number | null>(null);

  // Background video controller:
  // - En mòbil s'inicia en autoplay mut per despertar el descodificador d'iOS WebKit (evitant pantalla negra)
  // - En tocar o moure el ratolí, es pausa i fa scrubbing directe 1:1 segons la posició horitzontal
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      // Intenta iniciar el play silenciat per garantir que iOS/Android renderitzi el primer fotograma
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
  }, []);

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

  return (
    <main className="intro-gate-root">
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
          href="/discografia/"
          data-hover=""
          className="btn a24-btn"
          aria-label="Entrar a la web oficial de Miquel Gil"
        >
          <div className="btn__divider" />
          <span className="btn__p-mask">
            <span
              className="btn__p"
              data-hover-inner=""
              data-text="ENTRAR A LA WEB ↗"
            >
              <span data-hover-text="">ENTRAR A LA WEB ↗</span>
            </span>
          </span>
          <div className="btn__divider" />
        </Link>
      </div>
    </main>
  );
}
