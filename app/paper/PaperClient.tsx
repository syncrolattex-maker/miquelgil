"use client";

import React, { useRef, useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import "./paper.css";

export default function PaperClient() {
  const router = useRouter();
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isExiting, setIsExiting] = useState<boolean>(false);

  // Precàrrega de la ruta de destí per a una navegació instantània
  useEffect(() => {
    try {
      router.prefetch("/discografia/");
    } catch (_) {}
  }, [router]);

  // Autoplay segur del vídeo paper
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      const p = video.play();
      if (p !== undefined) {
        p.catch(() => {
          // Autoplay silenciós bloquejat pel navegador fins al primer gest
        });
      }
    }
  }, []);

  // Transició de benvinguda:
  // 1. Desapareixen totes les lletres
  // 2. Es queda només el vídeo del paper animant-se sol sobre fons negre
  // 3. Dóna pas fluidament a la web (/discografia/)
  const handleWelcome = (e: React.MouseEvent) => {
    e.preventDefault();
    if (isExiting) return;

    setIsExiting(true);

    const video = videoRef.current;
    if (video) {
      video.currentTime = 0;
      video.play().catch(() => {});
    }

    // Després de mostrar l'escultura del paper en solitari al centre del negre, obre la web
    setTimeout(() => {
      router.push("/discografia/");
    }, 1750);
  };

  return (
    <main className={`paper-root ${isExiting ? "is-exiting" : ""}`}>
      {/* -------------------------------------------------------------
          TOP NAVIGATION
          ------------------------------------------------------------- */}
      <nav className="paper-nav">
        {/* Logotip Miquel Gil en tipografia Maelstrom */}
        <Link href="/" className="paper-logo" title="Miquel Gil — Arxiu Oficial">
          Miquel Gil
        </Link>

        {/* Enllaços centrals separats per punts visuals */}
        <ul className="paper-nav-links">
          <li>
            <Link href="/discografia/" className="paper-nav-link">
              Discografia
            </Link>
          </li>
          <li className="paper-nav-dot" aria-hidden="true">·</li>
          <li>
            <Link href="/biografia/" className="paper-nav-link">
              Biografia
            </Link>
          </li>
          <li className="paper-nav-dot" aria-hidden="true">·</li>
          <li>
            <Link href="/directes/" className="paper-nav-link">
              Directes
            </Link>
          </li>
          <li className="paper-nav-dot" aria-hidden="true">·</li>
          <li>
            <Link href="/contacte/" className="paper-nav-link">
              Contacte
            </Link>
          </li>
        </ul>

        {/* Botons d'acció de la dreta */}
        <div className="paper-nav-actions">
          <Link
            href="/discografia/"
            className="paper-pill-btn paper-pill-outline"
            title="Veure la discografia oficial"
          >
            Veure l'Arxiu
          </Link>

          <button
            type="button"
            className="paper-pill-btn paper-pill-white"
            onClick={handleWelcome}
            title="Benvinguts a l'arxiu oficial de Miquel Gil"
          >
            Benvinguts ↗
          </button>
        </div>
      </nav>

      {/* -------------------------------------------------------------
          HERO BODY: TEXTOS A L'ESQUERRA + VÍDEO A SANG A LA DRETA
          ------------------------------------------------------------- */}
      <div className="paper-hero-body">
        {/* Contingut editorial de l'esquerra */}
        <div className="paper-left-content">
          {/* Tagline superior */}
          <div className="paper-tagline-row">
            <span className="paper-tagline-icon" aria-hidden="true">✦</span>
            <span className="paper-tagline-text">
              Arxiu Oficial & <em>Memòria Viva</em>
            </span>
          </div>

          {/* Gran titular amb les tipografies de /discografia (PP Neue Montreal + Grifinito L) */}
          <h1 className="paper-hero-heading">
            <span className="heading-line">La memòria viva</span>
            <span className="heading-line">de la terra,</span>
            <span className="heading-line-serif">en cada plec del cant.</span>
          </h1>

          {/* Paràgraf subtítol */}
          <p className="paper-hero-desc">
            Cinquanta anys de creació ininterrompuda: de la refundació històrica
            de la música tradicional valenciana amb Al Tall a les sonoritats contemporànies
            d’<em>Orgànic</em>, <em>Katà</em>, <em>Viatger</em> i <em>Geometries</em>.
          </p>

          {/* Botó píndola blanc inferior */}
          <div className="paper-cta-wrapper">
            <button
              type="button"
              className="paper-hero-cta-btn"
              onClick={handleWelcome}
            >
              <span>BENVINGUTS A L'ARXIU</span>
              <span className="cta-arrow" aria-hidden="true">↗</span>
            </button>
          </div>
        </div>

        {/* VÍDEO DE LA CARA: A SANG, SENSE REQUADRES NI MARCS, FOS AMB EL NEGRE PUR */}
        <div className="paper-face-video-wrapper">
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
            className="paper-face-video"
          />
        </div>
      </div>
    </main>
  );
}
