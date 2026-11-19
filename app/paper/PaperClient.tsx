"use client";

import React, { useRef, useState, useEffect, useCallback } from "react";
import Link from "next/link";
import HandTrackingCam from "@/components/HandTrackingCam";
import "./paper.css";

export default function PaperClient() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [isPlaying, setIsPlaying] = useState<boolean>(true);
  const [isMuted, setIsMuted] = useState<boolean>(true);
  const [activeNav, setActiveNav] = useState<string>("Home");

  // Hand gesture trigger handler
  const handleGestureChange = useCallback((gesture: "open" | "fist") => {
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
  }, []);

  // Manual video play/pause toggle by clicking the reel
  const togglePlayPause = () => {
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

  // Start playing automatically on mount
  useEffect(() => {
    const video = videoRef.current;
    if (video) {
      const p = video.play();
      if (p !== undefined) {
        p.then(() => setIsPlaying(true)).catch(() => {});
      }
    }
  }, []);

  return (
    <main className="paper-root">
      {/* Background radial ambient accent */}
      <div className="paper-ambient-glow" />

      {/* -------------------------------------------------------------
          TOP NAVIGATION
          ------------------------------------------------------------- */}
      <nav className="paper-nav">
        {/* Logo (left) */}
        <Link href="/paper" className="paper-logo">
          Paper
        </Link>

        {/* Center navigation links */}
        <ul className="paper-nav-links">
          {["Home", "Work", "About", "Contact"].map((item) => (
            <li key={item}>
              <a
                href={`#${item.toLowerCase()}`}
                onClick={(e) => {
                  e.preventDefault();
                  setActiveNav(item);
                }}
                className={`paper-nav-link ${activeNav === item ? "active" : ""}`}
              >
                {item}
              </a>
            </li>
          ))}
        </ul>

        {/* Right action buttons */}
        <div className="paper-nav-actions">
          <Link
            href="/discografia/"
            className="paper-btn-outline"
            title="Tornar a la discografia oficial de Miquel Gil"
          >
            Web Oficial de Miquel Gil
          </Link>

          <Link href="/" className="paper-btn-subtle" title="Benvinguts a l'arxiu">
            Benvinguts
          </Link>
        </div>
      </nav>

      {/* -------------------------------------------------------------
          HERO GRID SECTION
          ------------------------------------------------------------- */}
      <section className="paper-hero">
        {/* Left Column: Tagline + Heading + Bottom paragraph & CTA */}
        <div className="paper-hero-left">
          <div className="paper-headline-block">
            {/* Small tag line near top left */}
            <div className="paper-tagline">
              <span className="paper-tagline-dot" />
              <span>
                Design & Creative{" "}
                <span className="paper-tagline-italic">Direction</span>
              </span>
            </div>

            {/* Large heading */}
            <h1 className="paper-heading">
              <span className="paper-heading-main">
                Crafting digital experiences,
              </span>
              <span className="paper-heading-serif-italic">
                one fold at a time.
              </span>
            </h1>
          </div>

          {/* Bottom left corner: subtitle paragraph + white pill button */}
          <div className="paper-bottom-left">
            <p className="paper-subtitle">
              Exploring tactile spatial typography, kinetic editorial architectures,
              and interactive physical systems designed with pure discipline and
              cinematic restraint.
            </p>

            <a
              href="#work"
              className="paper-cta-pill"
              onClick={(e) => {
                e.preventDefault();
                const video = videoRef.current;
                if (video) {
                  video.currentTime = 0;
                  video.play();
                  setIsPlaying(true);
                }
              }}
            >
              <span>View My Work</span>
              <span className="paper-cta-arrow">→</span>
            </a>
          </div>
        </div>

        {/* Right Column: Video Reel (Mirrored Horizontally & Controlled by Gestures) */}
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

            {/* Video overlay badges */}
            <div className="paper-reel-overlay">
              <div className="paper-reel-top-meta">
                <span className="paper-reel-status-pill">
                  <span className={`status-dot-pulse ${!isPlaying ? "is-paused" : ""}`} />
                  {isPlaying ? "LIVE REEL [OPEN HAND]" : "PAUSED [FIST DETECTED]"}
                </span>
                <span className="paper-reel-tag">REEL 01 // 2026</span>
              </div>

              <div className="paper-reel-bottom-meta">
                <div className="paper-reel-info">
                  <span className="reel-title">PAPER PORTRAIT</span>
                  <span className="reel-sub">Crumbling into ball · Kinetic sculpture</span>
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

            {/* Paused indicator */}
            {!isPlaying && (
              <div className="paper-reel-paused-indicator">
                <div className="pause-icon-circle">❚❚</div>
                <span className="pause-text">PAUSAT PER GEST O CLIC</span>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* -------------------------------------------------------------
          FLOATING CAMERA WINDOW (DRAGGABLE, RESIZABLE, HAND SKELETON)
          ------------------------------------------------------------- */}
      <HandTrackingCam
        onGestureChange={handleGestureChange}
        currentVideoState={isPlaying ? "playing" : "paused"}
      />
    </main>
  );
}
