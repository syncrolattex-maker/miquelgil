"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import "./PillarMenu.css";

const MAIN_LINKS = [
  { href: "/start", label: "Inici" },
  { href: "/discografia", label: "Música" },
  { href: "/agenda", label: "Directes" },
  { href: "/contractacio", label: "Contractació" },
  { href: "/biografia", label: "Biografia" },
  { href: "/contacte", label: "Contacte" },
];

const SECONDARY_LINKS = [
  { href: "/media", label: "Premsa & Media" },
  { href: "/cronologia", label: "Cronologia" },
  { href: "/mural-sonor", label: "Mural Sonor" },
  { href: "/descarregues", label: "Descàrregues" },
];

export default function PillarMenu() {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const rootRef = useRef<HTMLDivElement>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const surfaceRef = useRef<HTMLDivElement>(null);
  const tick0Ref = useRef<HTMLSpanElement>(null);
  const tick1Ref = useRef<HTMLSpanElement>(null);
  const tick2Ref = useRef<HTMLSpanElement>(null);
  const tileImgRef = useRef<HTMLImageElement>(null);
  const captionRef = useRef<HTMLDivElement>(null);

  const timelineRef = useRef<gsap.core.Timeline | null>(null);

  // Set initial state of ticks
  useEffect(() => {
    if (tick0Ref.current && tick1Ref.current && tick2Ref.current) {
      gsap.set(tick0Ref.current, { y: -5, rotation: 0, transformOrigin: "center center" });
      gsap.set(tick1Ref.current, { y: 0, scaleX: 1, opacity: 1, transformOrigin: "center center" });
      gsap.set(tick2Ref.current, { y: 5, rotation: 0, transformOrigin: "center center" });
    }
  }, []);

  const openMenu = useCallback(() => {
    const body = bodyRef.current;
    const surface = surfaceRef.current;
    const t0 = tick0Ref.current;
    const t1 = tick1Ref.current;
    const t2 = tick2Ref.current;
    const img = tileImgRef.current;
    const caption = captionRef.current;
    if (!body || !surface || !t0 || !t1 || !t2) return;

    if (timelineRef.current) {
      timelineRef.current.kill();
    }

    const isMobile = window.innerWidth < 768;
    const targetHeight = isMobile
      ? Math.min(580, window.innerHeight * 0.85)
      : Math.min(620, window.innerHeight - 48);
    const targetWidth = isMobile
      ? Math.min(420, window.innerWidth - 24)
      : Math.min(690, window.innerWidth - 40);

    setIsOpen(true);

    const tl = gsap.timeline();
    timelineRef.current = tl;

    if (isMobile) {
      // Mobile: Expansió suau des del botó circular de 56px cap a la targeta de menú
      tl.fromTo(
        body,
        { width: 56, height: 56, borderRadius: 28 },
        {
          width: targetWidth,
          height: targetHeight,
          borderRadius: 22,
          duration: 0.42,
          ease: "power3.out",
        }
      );

      // Morph ticks into 'X'
      tl.to(t0, { y: 0, rotation: 45, duration: 0.3, ease: "power2.out" }, "<");
      tl.to(t2, { y: 0, rotation: -45, duration: 0.3, ease: "power2.out" }, "<");
      tl.to(t1, { scaleX: 0, opacity: 0, duration: 0.2, ease: "power2.out" }, "<");
    } else {
      // Desktop: Annnimate Signature 2-Phase Sequence (Vertical Stadium then Horizontal Card)
      // Phase 1: Vertical growth (Circle 56px -> Stadium)
      tl.to(body, {
        height: targetHeight,
        duration: 0.36,
        ease: "power3.inOut",
      });

      tl.to(t0, { y: -7, duration: 0.36, ease: "power3.inOut" }, 0);
      tl.to(t2, { y: 7, duration: 0.36, ease: "power3.inOut" }, 0);

      // Phase 2: Horizontal growth (Stadium -> Rounded Card) strictly after Phase 1
      tl.to(
        body,
        {
          width: targetWidth,
          borderRadius: 20,
          duration: 0.44,
          ease: "power3.out",
        },
        ">"
      );

      // Ticks morph into close 'X'
      tl.to(t0, { y: 0, rotation: 45, duration: 0.35, ease: "power2.out" }, "<");
      tl.to(t2, { y: 0, rotation: -45, duration: 0.35, ease: "power2.out" }, "<");
      tl.to(t1, { scaleX: 0, opacity: 0, duration: 0.2, ease: "power2.out" }, "<");
    }

    // Uncover content surface
    tl.to(
      surface,
      {
        opacity: 1,
        duration: 0.25,
        ease: "power2.out",
      },
      "<0.1"
    );

    // Stagger main navigation links
    const rows = surface.querySelectorAll(".anm-pillar-row");
    if (rows.length) {
      tl.fromTo(
        rows,
        { opacity: 0, x: -24 },
        {
          opacity: 1,
          x: 0,
          stagger: 0.04,
          duration: 0.38,
          ease: "power2.out",
        },
        "<0.05"
      );
    }

    // Secondary links
    const subLinks = surface.querySelectorAll(".anm-pillar-sub");
    if (subLinks.length) {
      tl.fromTo(
        subLinks,
        { opacity: 0, x: -16 },
        {
          opacity: 1,
          x: 0,
          stagger: 0.03,
          duration: 0.32,
          ease: "power2.out",
        },
        "<0.1"
      );
    }

    // Tile image reveal
    if (img) {
      tl.fromTo(
        img,
        { opacity: 0, scale: 1.08 },
        {
          opacity: 1,
          scale: 1,
          duration: 0.45,
          ease: "power2.out",
        },
        "<"
      );
    }

    // Tile caption
    if (caption) {
      tl.fromTo(
        caption,
        { opacity: 0, y: 10 },
        {
          opacity: 1,
          y: 0,
          duration: 0.35,
          ease: "power2.out",
        },
        "<0.1"
      );
    }
  }, []);

  const closeMenu = useCallback(() => {
    const body = bodyRef.current;
    const surface = surfaceRef.current;
    const t0 = tick0Ref.current;
    const t1 = tick1Ref.current;
    const t2 = tick2Ref.current;
    if (!body || !surface || !t0 || !t1 || !t2) return;

    if (timelineRef.current) {
      timelineRef.current.kill();
    }

    const isMobile = window.innerWidth < 768;

    const tl = gsap.timeline({
      onComplete: () => {
        setIsOpen(false);
      },
    });
    timelineRef.current = tl;

    // 1. Instant fade-out of content
    tl.to(surface, {
      opacity: 0,
      duration: 0.16,
      ease: "power2.in",
    });

    if (isMobile) {
      tl.to(
        body,
        {
          width: 56,
          height: 56,
          borderRadius: 28,
          duration: 0.32,
          ease: "power3.inOut",
        },
        "<0.05"
      );
      tl.to(t0, { y: -5, rotation: 0, duration: 0.25, ease: "power2.inOut" }, "<");
      tl.to(t2, { y: 5, rotation: 0, duration: 0.25, ease: "power2.inOut" }, "<");
      tl.to(t1, { scaleX: 1, opacity: 1, duration: 0.2, ease: "power2.inOut" }, "<");
    } else {
      // Desktop: Reverse 2-phase sequence
      // 2. Horizontal collapse: width shrinks to 56px (stadium)
      tl.to(
        body,
        {
          width: 56,
          borderRadius: 28,
          duration: 0.36,
          ease: "power3.inOut",
        },
        "<0.05"
      );

      // Ticks rotate back to Parted state (-7, +7)
      tl.to(t0, { y: -7, rotation: 0, duration: 0.3, ease: "power2.inOut" }, "<");
      tl.to(t2, { y: 7, rotation: 0, duration: 0.3, ease: "power2.inOut" }, "<");
      tl.to(t1, { scaleX: 1, opacity: 1, duration: 0.25, ease: "power2.inOut" }, "<0.1");

      // 3. Vertical collapse: height shrinks to 56px (circle)
      tl.to(
        body,
        {
          height: 56,
          duration: 0.3,
          ease: "power3.inOut",
        },
        ">"
      );

      tl.to(t0, { y: -5, duration: 0.3, ease: "power3.inOut" }, "<");
      tl.to(t2, { y: 5, duration: 0.3, ease: "power3.inOut" }, "<");
    }
  }, []);

  const toggleMenu = useCallback(() => {
    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  }, [isOpen, closeMenu, openMenu]);

  // Close menu when navigating to another route
  useEffect(() => {
    if (isOpen) {
      closeMenu();
    }
  }, [pathname]);

  // Support custom window events from external trigger buttons (like mobile header)
  useEffect(() => {
    const handleOpen = () => openMenu();
    const handleClose = () => closeMenu();
    const handleToggle = () => toggleMenu();

    window.addEventListener("anm-pillar:open", handleOpen);
    window.addEventListener("anm-pillar:close", handleClose);
    window.addEventListener("anm-pillar:toggle", handleToggle);

    return () => {
      window.removeEventListener("anm-pillar:open", handleOpen);
      window.removeEventListener("anm-pillar:close", handleClose);
      window.removeEventListener("anm-pillar:toggle", handleToggle);
    };
  }, [openMenu, closeMenu, toggleMenu]);

  // Close on Escape key
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        closeMenu();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, closeMenu]);

  return (
    <div
      ref={rootRef}
      className={`anm-pillar-root ${isOpen ? "is-open" : ""}`}
      data-anm-kit-menu-pillar
      data-state={isOpen ? "open" : "closed"}
    >
      {/* Backdrop for outside click / dismiss */}
      <div className="anm-pillar-backdrop" onClick={closeMenu} aria-hidden="true" />

      {/* Fixed anchor on screen */}
      <div className="anm-pillar-anchor" data-anm-kit-menu-pillar-anchor>
        {/* Morphing surface */}
        <div className="anm-pillar-body" data-anm-kit-menu-pillar-body ref={bodyRef}>
          {/* Gutter containing trigger button */}
          <div className="anm-pillar-gutter">
            <button
              type="button"
              className="anm-pillar-trigger"
              data-anm-kit-menu-pillar-trigger
              onClick={toggleMenu}
              aria-label={isOpen ? "Tancar menú" : "Obrir menú"}
              aria-expanded={isOpen}
            >
              <div className="anm-pillar-ticks-wrap" aria-hidden="true">
                <span ref={tick0Ref} className="anm-pillar-tick anm-pillar-tick--0" />
                <span ref={tick1Ref} className="anm-pillar-tick anm-pillar-tick--1" />
                <span ref={tick2Ref} className="anm-pillar-tick anm-pillar-tick--2" />
              </div>
            </button>
            <div className="anm-pillar-gutter-line" aria-hidden="true" />
          </div>

          {/* Unfolding surface content */}
          <div className="anm-pillar-surface" data-anm-kit-menu-pillar-surface ref={surfaceRef}>
            <div className="anm-pillar-content" data-anm-kit-menu-pillar-content>
              {/* Column 1: Links */}
              <nav className="anm-pillar-index" data-anm-kit-menu-pillar-index aria-label="Navegació Miquel Gil">
                <ul className="anm-pillar-rows">
                  {MAIN_LINKS.map((link, idx) => {
                    const isActive = pathname === link.href;
                    return (
                      <li key={link.href} className="anm-pillar-row-item">
                        <a
                          href={link.href}
                          className={`anm-pillar-row ${isActive ? "is-active" : ""}`}
                          data-anm-kit-menu-pillar-row
                          onClick={closeMenu}
                        >
                          <span
                            className="anm-pillar-numeral"
                            data-anm-kit-menu-pillar-numeral
                            aria-hidden="true"
                          >
                            {String(idx + 1).padStart(2, "0")}
                          </span>
                          <span className="anm-pillar-label" data-anm-kit-menu-pillar-label>
                            {link.label}
                          </span>
                        </a>
                      </li>
                    );
                  })}
                </ul>

                {/* Secondary navigation links */}
                <div className="anm-pillar-secondary">
                  <span className="anm-pillar-sec-title">Més apartats</span>
                  <div className="anm-pillar-sub-group">
                    {SECONDARY_LINKS.map((sub) => (
                      <a
                        key={sub.href}
                        href={sub.href}
                        className={`anm-pillar-sub ${pathname === sub.href ? "is-active" : ""}`}
                        data-anm-kit-menu-pillar-sub
                        onClick={closeMenu}
                      >
                        {sub.label}
                      </a>
                    ))}
                  </div>
                </div>

                {/* Social icons */}
                <div className="anm-pillar-socials">
                  <a
                    href="https://open.spotify.com/artist/77EuhX4yF25gC4o8aRjNqm"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Spotify"
                  >
                    <i className="fab fa-spotify" />
                  </a>
                  <a
                    href="https://www.youtube.com/channel/UC-p55vXvR6tJcMvhZpT6DSw"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="YouTube"
                  >
                    <i className="fab fa-youtube" />
                  </a>
                  <a
                    href="https://www.instagram.com/miquelgiloficial/"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Instagram"
                  >
                    <i className="fab fa-instagram" />
                  </a>
                  <a
                    href="https://www.facebook.com/miquelgil.oficial"
                    target="_blank"
                    rel="noopener noreferrer"
                    aria-label="Facebook"
                  >
                    <i className="fab fa-facebook-f" />
                  </a>
                </div>
              </nav>

              {/* Column 2: Feature Image Tile */}
              <div className="anm-pillar-tile" data-anm-kit-menu-pillar-tile>
                <a href="/discografia" className="anm-pillar-tile-link" onClick={closeMenu}>
                  <div className="anm-pillar-tile-media" data-anm-kit-menu-pillar-tile-media>
                    <img
                      ref={tileImgRef}
                      src="/images/viatgerO1.jpg"
                      alt="Miquel Gil — Viatger"
                      className="anm-pillar-tile-img"
                      data-anm-kit-menu-pillar-tile-img
                    />
                    <div className="anm-pillar-tile-roller" data-anm-kit-menu-pillar-tile-roller>
                      <span className="anm-roller-label">Veure discografia</span>
                      <svg
                        width="12"
                        height="12"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="2.5"
                      >
                        <path d="M7 17L17 7M17 7H7M17 7V17" />
                      </svg>
                    </div>
                  </div>
                  <div
                    ref={captionRef}
                    className="anm-pillar-tile-caption"
                    data-anm-kit-menu-pillar-tile-caption
                  >
                    <span className="anm-tile-title">Miquel Gil</span>
                    <span className="anm-tile-sub">Viatger — 25 anys de trajectòria</span>
                  </div>
                </a>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
