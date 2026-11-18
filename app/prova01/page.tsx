"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import "./prova01.css";

export default function IntroGatePage() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const targetTimeRef = useRef<number>(0);
  const isSeekingRef = useRef<boolean>(false);
  const prevXRef = useRef<number | null>(null);

  // Background video mouse-scrubbing controller (calibrat al 100% de la durada del vídeo)
  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const video = videoRef.current;
      if (!video || !video.duration || isNaN(video.duration)) return;

      prevXRef.current = e.clientX;
      const progress = Math.max(0, Math.min(1, e.clientX / window.innerWidth));
      const nextTarget = progress * video.duration;
      targetTimeRef.current = nextTarget;

      if (!isSeekingRef.current) {
        isSeekingRef.current = true;
        video.currentTime = nextTarget;
      }
    };

    // Touch scrubbing support on touch devices
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 0) return;
      const video = videoRef.current;
      if (!video || !video.duration || isNaN(video.duration)) return;

      const clientX = e.touches[0].clientX;
      prevXRef.current = clientX;
      const progress = Math.max(0, Math.min(1, clientX / window.innerWidth));
      const nextTarget = progress * video.duration;
      targetTimeRef.current = nextTarget;

      if (!isSeekingRef.current) {
        isSeekingRef.current = true;
        video.currentTime = nextTarget;
      }
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("touchmove", handleTouchMove, { passive: true });

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, []);

  // onSeeked handler: queues next seek if targetTime moved during seek, preventing seek-flooding
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
          VÍDEO DE FONS (controlat per moviment horitzontal del cursor)
          ------------------------------------------------------------- */}
      <video
        ref={videoRef}
        src="/video/mainframe_bg.mp4"
        muted
        playsInline
        preload="auto"
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
