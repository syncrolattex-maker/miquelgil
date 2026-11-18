"use client";

import React, { useEffect, useRef, useState } from "react";
import "./prova01.css";

// -------------------------------------------------------------
// Custom useTypewriter hook as specified in requirements:
// takes text, speed (default 38ms), startDelay (default 600ms).
// After the delay, an interval reveals one character at a time.
// Returns { displayed, done }.
// -------------------------------------------------------------
function useTypewriter(text: string, speed = 38, startDelay = 600) {
  const [displayed, setDisplayed] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    let intervalId: ReturnType<typeof setInterval>;
    const timeoutId = setTimeout(() => {
      let currentIdx = 0;
      intervalId = setInterval(() => {
        currentIdx++;
        setDisplayed(text.slice(0, currentIdx));
        if (currentIdx >= text.length) {
          clearInterval(intervalId);
          setDone(true);
        }
      }, speed);
    }, startDelay);

    return () => {
      clearTimeout(timeoutId);
      if (intervalId) clearInterval(intervalId);
    };
  }, [text, speed, startDelay]);

  return { displayed, done };
}

export default function MainframeHero() {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const targetTimeRef = useRef<number>(0);
  const isSeekingRef = useRef<boolean>(false);
  const prevXRef = useRef<number | null>(null);

  const [mobileOpen, setMobileOpen] = useState(false);
  const [pillsVisible, setPillsVisible] = useState(false);
  const [copied, setCopied] = useState(false);

  // 1. Action pill buttons appear 400ms after page load, independent of typewriter animation
  useEffect(() => {
    const timer = setTimeout(() => {
      setPillsVisible(true);
    }, 400);
    return () => clearTimeout(timer);
  }, []);

  // 2. Typewriter text hook
  const { displayed, done } = useTypewriter(
    "Glad you stopped in. Good taste tends to find us. Now, what are we building?",
    38,
    600
  );

  // 3. Background video mouse-scrubbing controller
  useEffect(() => {
    const SENSITIVITY = 0.8;

    const handleMouseMove = (e: MouseEvent) => {
      const video = videoRef.current;
      if (!video || !video.duration || isNaN(video.duration)) {
        prevXRef.current = e.clientX;
        return;
      }

      if (prevXRef.current === null) {
        prevXRef.current = e.clientX;
        return;
      }

      const delta = e.clientX - prevXRef.current;
      prevXRef.current = e.clientX;

      const timeOffset = (delta / window.innerWidth) * SENSITIVITY * video.duration;
      let nextTarget = targetTimeRef.current + timeOffset;
      nextTarget = Math.max(0, Math.min(video.duration, nextTarget));
      targetTimeRef.current = nextTarget;

      if (!isSeekingRef.current) {
        isSeekingRef.current = true;
        video.currentTime = nextTarget;
      }
    };

    const handleMouseLeave = () => {
      prevXRef.current = null;
    };

    // Touch scrubbing support on touch devices
    const handleTouchMove = (e: TouchEvent) => {
      if (e.touches.length === 0) return;
      const clientX = e.touches[0].clientX;
      const video = videoRef.current;
      if (!video || !video.duration || isNaN(video.duration)) {
        prevXRef.current = clientX;
        return;
      }

      if (prevXRef.current === null) {
        prevXRef.current = clientX;
        return;
      }

      const delta = clientX - prevXRef.current;
      prevXRef.current = clientX;

      const timeOffset = (delta / window.innerWidth) * SENSITIVITY * video.duration;
      let nextTarget = targetTimeRef.current + timeOffset;
      nextTarget = Math.max(0, Math.min(video.duration, nextTarget));
      targetTimeRef.current = nextTarget;

      if (!isSeekingRef.current) {
        isSeekingRef.current = true;
        video.currentTime = nextTarget;
      }
    };

    const handleTouchEnd = () => {
      prevXRef.current = null;
    };

    window.addEventListener("mousemove", handleMouseMove);
    window.addEventListener("mouseleave", handleMouseLeave);
    window.addEventListener("touchmove", handleTouchMove, { passive: true });
    window.addEventListener("touchend", handleTouchEnd);

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseleave", handleMouseLeave);
      window.removeEventListener("touchmove", handleTouchMove);
      window.removeEventListener("touchend", handleTouchEnd);
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

  const handleCopyEmail = () => {
    if (typeof navigator !== "undefined" && navigator.clipboard) {
      navigator.clipboard.writeText("hello@mainframe.co");
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <div className="mainframe-root">
      {/* -------------------------------------------------------------
          BACKGROUND VIDEO (mouse-scrub controlled)
          ------------------------------------------------------------- */}
      <video
        ref={videoRef}
        src="https://d8j0ntlcm91z4.cloudfront.net/user_38xzZboKViGWJOttwIXH07lWA1P/hf_20260826_041744_63efcd78-bf7d-4039-99e2-2461e8a61903.mp4"
        muted
        playsInline
        preload="auto"
        className="mainframe-video"
        onSeeked={handleSeeked}
      />

      {/* -------------------------------------------------------------
          NAVBAR (fixed, z-index: 10)
          ------------------------------------------------------------- */}
      <header className="mainframe-nav">
        {/* Logo (left): Flex row with gap-3 */}
        <div className="mainframe-logo-group">
          <span className="mainframe-logo-text">Mainframe®</span>
          <span className="mainframe-asterisk">✳︎</span>
        </div>

        {/* Desktop nav links (center, hidden below md) */}
        <nav className="mainframe-desktop-links" aria-label="Main navigation">
          <a href="#labs" className="mainframe-nav-link">
            Labs
          </a>
          <span className="select-none">,&nbsp;</span>
          <a href="#studio" className="mainframe-nav-link">
            Studio
          </a>
          <span className="select-none">,&nbsp;</span>
          <a href="#openings" className="mainframe-nav-link">
            Openings
          </a>
          <span className="select-none">,&nbsp;</span>
          <a href="#shop" className="mainframe-nav-link">
            Shop
          </a>
        </nav>

        {/* Desktop CTA (right, hidden below md) */}
        <div className="mainframe-desktop-cta">
          <a href="#contact" className="mainframe-cta-link">
            Get in touch
          </a>
        </div>

        {/* Mobile hamburger (visible below md) */}
        <button
          type="button"
          aria-label="Toggle navigation menu"
          onClick={() => setMobileOpen(!mobileOpen)}
          className={`mainframe-hamburger ${mobileOpen ? "is-open" : ""}`}
        >
          <span className="mainframe-hamburger-bar bar-top" />
          <span className="mainframe-hamburger-bar bar-mid" />
          <span className="mainframe-hamburger-bar bar-bot" />
        </button>
      </header>

      {/* -------------------------------------------------------------
          MOBILE OVERLAY (z-index: 9)
          ------------------------------------------------------------- */}
      <div
        className={`mainframe-mobile-overlay ${
          mobileOpen ? "is-visible" : "is-hidden"
        }`}
      >
        <a
          href="#labs"
          onClick={() => setMobileOpen(false)}
          className="mainframe-mobile-link"
        >
          Labs
        </a>
        <a
          href="#studio"
          onClick={() => setMobileOpen(false)}
          className="mainframe-mobile-link"
        >
          Studio
        </a>
        <a
          href="#openings"
          onClick={() => setMobileOpen(false)}
          className="mainframe-mobile-link"
        >
          Openings
        </a>
        <a
          href="#shop"
          onClick={() => setMobileOpen(false)}
          className="mainframe-mobile-link"
        >
          Shop
        </a>
        <a
          href="#contact"
          onClick={() => setMobileOpen(false)}
          className="mainframe-mobile-link underlined"
        >
          Get in touch
        </a>
      </div>

      {/* -------------------------------------------------------------
          HERO SECTION (z-index: 1)
          ------------------------------------------------------------- */}
      <main className="mainframe-hero">
        <div className="mainframe-content-container">
          {/* 1. Blurred intro label */}
          <div className="mainframe-blurred-label">
            Hey there, meet A.R.I.A,
            <br />
            Mainframe&apos;s Adaptive Response Interface Agent
          </div>

          {/* 2. Typewriter text with blinking cursor */}
          <p className="mainframe-typewriter-text">
            {displayed}
            {!done && <span className="mainframe-cursor" aria-hidden="true" />}
          </p>

          {/* 3. Action pill buttons (fade-in + slide-up at 400ms) */}
          <div
            className={`mainframe-pills-container ${
              pillsVisible ? "pills-visible" : "pills-hidden"
            }`}
          >
            {/* 4 White pill buttons */}
            <button type="button" className="mainframe-pill-white">
              Pitch us an idea
            </button>
            <button type="button" className="mainframe-pill-white">
              Come work here
            </button>
            <button type="button" className="mainframe-pill-white">
              Send a brief hello
            </button>
            <button type="button" className="mainframe-pill-white">
              See how we operate
            </button>

            {/* 1 Outline pill button with copy icon */}
            <button
              type="button"
              onClick={handleCopyEmail}
              className="mainframe-pill-outline"
              title="Click to copy email address"
            >
              <span>
                Reach us:{" "}
                <span className="mainframe-email-underline">
                  hello@mainframe.co
                </span>
              </span>
              {copied ? (
                <span
                  style={{
                    fontSize: "11px",
                    fontWeight: 600,
                    letterSpacing: "0.05em",
                  }}
                >
                  COPIED
                </span>
              ) : (
                <svg
                  width="12"
                  height="12"
                  viewBox="0 0 12 12"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                  style={{ flexShrink: 0 }}
                  aria-hidden="true"
                >
                  <rect
                    x="3.5"
                    y="1.5"
                    width="7"
                    height="7"
                    rx="1"
                    stroke="currentColor"
                    strokeWidth="1.2"
                  />
                  <path
                    d="M1.5 4.5V9.5C1.5 10.0523 1.94772 10.5 2.5 10.5H7.5"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                  />
                </svg>
              )}
            </button>
          </div>
        </div>
      </main>
    </div>
  );
}
