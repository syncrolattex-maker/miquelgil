"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import gsap from "gsap";
import { CustomEase } from "gsap/CustomEase";
import "./MorphingPillNav.css";

// Register CustomEase once
if (typeof window !== "undefined") {
  try {
    gsap.registerPlugin(CustomEase);
    if (!CustomEase.get("anmEase")) {
      CustomEase.create("anmEase", "M0,0 C0.3,0.9 0.1,1 1,1");
    }
  } catch (_) {}
}

export interface NavLinkItem {
  id: string;
  title: string;
  url: string;
}

export const NAV_LINKS: NavLinkItem[] = [
  { id: "01", title: "DISCOGRAFIA", url: "/discografia/" },
  { id: "02", title: "DIRECTES", url: "/directes/" },
  { id: "03", title: "BIOGRAFIA", url: "/biografia/" },
  { id: "04", title: "CONTRACTACIÓ", url: "/contractacio/" },
  { id: "05", title: "CONTACTE", url: "/contacte/" },
];

export const SOCIAL_LINKS = [
  { name: "SPOTIFY", url: "https://open.spotify.com/intl-es/artist/3wgWeRgIV5sU41Yqz6V7qn" },
  { name: "YOUTUBE", url: "https://www.youtube.com/watch?v=kNwJUff7NlU" },
  { name: "INSTAGRAM", url: "https://www.instagram.com/miquelgil.oficial/" },
];

export interface MorphingPillNavProps {
  currentSection?: string;
  theme?: "dark" | "base";
}

export default function MorphingPillNav({
  currentSection,
  theme = "dark",
}: MorphingPillNavProps) {
  const pathname = usePathname();
  const [isOpen, setIsOpen] = useState(false);

  const wrapRef = useRef<HTMLDivElement>(null);
  const surfaceRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const scrimRef = useRef<HTMLDivElement>(null);
  const toggleBtnRef = useRef<HTMLButtonElement>(null);
  const textRollerRef = useRef<HTMLSpanElement>(null);
  const iconRollerRef = useRef<HTMLSpanElement>(null);
  const iconFaceDotsRef = useRef<HTMLSpanElement>(null);

  const morphTlRef = useRef<gsap.core.Timeline | null>(null);
  const idleRippleTimerRef = useRef<NodeJS.Timeout | null>(null);
  const initialDimensionsRef = useRef<{ w: number; h: number }>({ w: 220, h: 48 });

  // Play audio click feedback
  const playClick = useCallback(() => {
    try {
      const audio = new Audio("/audio/menu-click.mp3");
      audio.volume = 0.35;
      audio.play().catch(() => {});
    } catch (_) {}
  }, []);

  // Determine if a section is active
  const isSectionActive = useCallback(
    (secUrl: string) => {
      const activePath = (currentSection || pathname || "/discografia/").replace(/\/$/, "");
      const normSec = secUrl.replace(/\/$/, "");
      if (activePath === normSec) return true;
      if (normSec === "/discografia" && activePath.startsWith("/discografia")) return true;
      if (
        (normSec === "/directes" || normSec === "/agenda") &&
        (activePath.startsWith("/agenda") || activePath.startsWith("/directes"))
      ) {
        return true;
      }
      return false;
    },
    [currentSection, pathname]
  );

  // Measure target expanded dimensions
  const getExpandedDimensions = useCallback(() => {
    if (typeof window === "undefined") return { w: 520, h: 450 };
    const maxW = Math.min(540, window.innerWidth - 32);
    const maxH = Math.min(460, window.innerHeight - 44);
    return { w: maxW, h: maxH };
  }, []);

  // 9-dot idle ripple animation (Annnimate signature detail)
  const runDotRipple = useCallback(() => {
    if (isOpen || !iconFaceDotsRef.current) return;
    const dots = iconFaceDotsRef.current.querySelectorAll(".mpm_dot");
    if (!dots || dots.length !== 9) return;

    gsap.fromTo(
      dots,
      { opacity: 1 },
      {
        opacity: 0.25,
        duration: 0.22,
        yoyo: true,
        repeat: 1,
        ease: "power2.inOut",
        stagger: {
          grid: [3, 3],
          from: "center",
          each: 0.045,
        },
        overwrite: "auto",
      }
    );
  }, [isOpen]);

  // Periodic idle wave trigger
  useEffect(() => {
    if (isOpen) {
      if (idleRippleTimerRef.current) clearInterval(idleRippleTimerRef.current);
      return;
    }

    idleRippleTimerRef.current = setInterval(() => {
      runDotRipple();
    }, 5500);

    return () => {
      if (idleRippleTimerRef.current) clearInterval(idleRippleTimerRef.current);
    };
  }, [isOpen, runDotRipple]);

  // Record initial collapsed pill dimensions once on mount
  useEffect(() => {
    const surface = surfaceRef.current;
    if (!surface) return;

    // Small delay to allow fonts and CSS layout to settle
    const t = setTimeout(() => {
      const rect = surface.getBoundingClientRect();
      if (rect.width > 50 && rect.height > 20) {
        initialDimensionsRef.current = {
          w: Math.round(rect.width),
          h: Math.round(rect.height),
        };
      }
    }, 60);

    return () => clearTimeout(t);
  }, []);

  // Open animation (Morphing Pill to Full Navigation Card)
  const openMenu = useCallback(() => {
    const surface = surfaceRef.current;
    const panel = panelRef.current;
    const scrim = scrimRef.current;
    const textRoller = textRollerRef.current;
    const iconRoller = iconRollerRef.current;

    if (!surface || !panel) return;

    setIsOpen(true);
    playClick();

    if (morphTlRef.current) morphTlRef.current.kill();

    const { w: targetW, h: targetH } = getExpandedDimensions();
    const ease = CustomEase.get("anmEase") || "power2.out";

    // Set panel visibility for measurement and layout
    gsap.set(panel, { display: "flex", autoAlpha: 0 });

    const tl = gsap.timeline({
      defaults: { force3D: true },
      onComplete: () => {
        // Accessibility focus
        panel.focus?.();
      },
    });

    // 1. Text & icon rollers slide to "TANCAR" and "[×]"
    if (textRoller) {
      tl.to(textRoller, { yPercent: -50, duration: 0.38, ease: "power2.out" }, 0);
    }
    if (iconRoller) {
      tl.to(iconRoller, { yPercent: -50, duration: 0.38, ease: "power2.out" }, 0);
    }

    // 2. Scrim fade in
    if (scrim) {
      tl.to(scrim, { autoAlpha: 1, duration: 0.45, ease: "power2.out" }, 0.02);
    }

    // 3. Surface width pours open first
    tl.to(
      surface,
      {
        width: targetW,
        borderRadius: 22,
        duration: 0.75,
        ease: ease,
      },
      0.04
    );

    // 4. Surface height follows a beat later
    tl.to(
      surface,
      {
        height: targetH,
        duration: 0.75,
        ease: ease,
      },
      0.04 + 0.06
    );

    // 5. Panel content arrives
    tl.to(
      panel,
      {
        autoAlpha: 1,
        duration: 0.35,
        ease: "power2.out",
      },
      0.04 + 0.16
    );

    // 6. Cascading letter entrance across links
    const linkItems = panel.querySelectorAll<HTMLElement>(".mpm_item");
    linkItems.forEach((item, itemIdx) => {
      const charInners = item.querySelectorAll<HTMLElement>(".mpm_char_inner");
      const indexNum = item.querySelector<HTMLElement>(".mpm_link_num");
      const activeDot = item.querySelector<HTMLElement>(".mpm_link_active_dot");

      if (charInners.length) {
        gsap.set(charInners, { yPercent: 115, opacity: 0 });
        tl.to(
          charInners,
          {
            yPercent: 0,
            opacity: 1,
            duration: 0.6,
            ease: "power2.out",
            stagger: 0.0125,
          },
          0.18 + itemIdx * 0.045
        );
      }

      if (indexNum) {
        gsap.set(indexNum, { opacity: 0, x: -8 });
        tl.to(
          indexNum,
          {
            opacity: 1,
            x: 0,
            duration: 0.45,
            ease: "power2.out",
          },
          0.18 + itemIdx * 0.045
        );
      }

      if (activeDot) {
        gsap.set(activeDot, { opacity: 0, scale: 0.4 });
        tl.to(
          activeDot,
          {
            opacity: 1,
            scale: 1,
            duration: 0.4,
            ease: "back.out(2)",
          },
          0.22 + itemIdx * 0.045
        );
      }
    });

    // 7. Sub-footer fades in last
    const footer = panel.querySelector<HTMLElement>(".mpm_footer");
    if (footer) {
      gsap.set(footer, { opacity: 0, y: 8 });
      tl.to(
        footer,
        {
          opacity: 1,
          y: 0,
          duration: 0.4,
          ease: "power2.out",
        },
        0.35
      );
    }

    morphTlRef.current = tl;
  }, [getExpandedDimensions, playClick]);

  // Close animation (Card morphs back into compact pill)
  const closeMenu = useCallback(() => {
    const surface = surfaceRef.current;
    const panel = panelRef.current;
    const scrim = scrimRef.current;
    const textRoller = textRollerRef.current;
    const iconRoller = iconRollerRef.current;

    if (!surface || !panel) return;

    setIsOpen(false);
    playClick();

    if (morphTlRef.current) morphTlRef.current.kill();

    const { w: initW, h: initH } = initialDimensionsRef.current;
    const ease = CustomEase.get("anmEase") || "power2.inOut";

    const tl = gsap.timeline({
      defaults: { force3D: true },
      onComplete: () => {
        gsap.set(panel, { display: "none" });
      },
    });

    // 1. Text & icon rollers return to "MENÚ" and 9-dots
    if (textRoller) {
      tl.to(textRoller, { yPercent: 0, duration: 0.35, ease: "power2.out" }, 0);
    }
    if (iconRoller) {
      tl.to(iconRoller, { yPercent: 0, duration: 0.35, ease: "power2.out" }, 0);
    }

    // 2. Panel content clears out quickly
    tl.to(
      panel,
      {
        autoAlpha: 0,
        duration: 0.22,
        ease: "power2.in",
      },
      0
    );

    // 3. Scrim lifts
    if (scrim) {
      tl.to(scrim, { autoAlpha: 0, duration: 0.32, ease: "power2.in" }, 0);
    }

    // 4. Surface height shrinks first
    tl.to(
      surface,
      {
        height: initH || 48,
        duration: 0.65,
        ease: ease,
      },
      0.08
    );

    // 5. Width returns to pill shape and restores pill border-radius
    tl.to(
      surface,
      {
        width: initW || 220,
        borderRadius: (initH || 48) / 2,
        duration: 0.65,
        ease: ease,
      },
      0.14
    );

    morphTlRef.current = tl;
  }, [playClick]);

  const toggleMenu = useCallback(() => {
    if (isOpen) {
      closeMenu();
    } else {
      openMenu();
    }
  }, [isOpen, closeMenu, openMenu]);

  // Rolling hover effect on links ("roll on hover")
  const handleLinkPointerEnter = useCallback((linkEl: HTMLElement) => {
    const charInners = linkEl.querySelectorAll<HTMLElement>(".mpm_char_inner");
    if (!charInners.length) return;

    // Interrupt previous tween cleanly
    gsap.killTweensOf(charInners);

    // Animate dual-face characters rolling up
    gsap.fromTo(
      charInners,
      { yPercent: 0 },
      {
        yPercent: -110,
        duration: 0.45,
        ease: "power2.out",
        stagger: 0.014,
        onComplete: () => {
          // Seamless reset since face and face_next display identical glyph
          gsap.set(charInners, { yPercent: 0 });
        },
      }
    );
  }, []);

  // Keyboard navigation & escape key listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isOpen) {
        closeMenu();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, closeMenu]);

  // Close when window resizes significantly
  useEffect(() => {
    const handleResize = () => {
      if (isOpen) {
        closeMenu();
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, [isOpen, closeMenu]);

  // Helper to split text into characters with dual-face structure
  const renderRollingText = (text: string) => {
    const chars = Array.from(text);
    return chars.map((char, index) => {
      if (char === " ") {
        return (
          <span key={index} className="mpm_char_space">
            &nbsp;
          </span>
        );
      }
      return (
        <span key={index} className="mpm_char" aria-hidden="true">
          <span className="mpm_char_inner">
            <span className="mpm_char_face">{char}</span>
            <span className="mpm_char_face_next">{char}</span>
          </span>
        </span>
      );
    });
  };

  return (
    <>
      {/* Soft page scrim dimming when menu is open */}
      <div
        ref={scrimRef}
        className={`mpm_scrim ${isOpen ? "is-open" : ""}`}
        onClick={closeMenu}
        aria-hidden="true"
      />

      {/* Morphing Pill Container */}
      <header
        ref={wrapRef}
        className={`mpm_wrap ${theme === "base" ? "theme-base" : "theme-dark"}`}
        role="banner"
      >
        <div
          ref={surfaceRef}
          className={`mpm_surface ${isOpen ? "is-expanded" : ""}`}
          data-anm-mpm-surface
        >
          {/* Header Bar inside Pill (Logo + Separator + Morphing Toggle) */}
          <div ref={headerRef} className="mpm_header">
            {/* Logo oficial Miquel Gil */}
            <Link
              href="/discografia/"
              className="mpm_logo"
              aria-label="Miquel Gil — Inici Discografia"
              onClick={() => {
                if (isOpen) closeMenu();
              }}
            >
              <img
                src="/images/logo-W.png"
                alt="Miquel Gil"
                className="mpm_logo_img"
              />
            </Link>

            <span className="mpm_header_divider" aria-hidden="true" />

            {/* Toggle Button with Vertical Text & Icon Rollers */}
            <button
              ref={toggleBtnRef}
              type="button"
              className="mpm_toggle"
              aria-expanded={isOpen}
              aria-controls="mpm_nav_panel"
              aria-label={isOpen ? "Tancar menú de navegació" : "Obrir menú de navegació"}
              onClick={toggleMenu}
            >
              {/* Text Roller: MENÚ / TANCAR */}
              <span className="mpm_toggle_text">
                <span ref={textRollerRef} className="mpm_toggle_text_roller">
                  <span className="mpm_toggle_line">MENÚ</span>
                  <span className="mpm_toggle_line">TANCAR</span>
                </span>
              </span>

              {/* Icon Roller: 9-Dot Matrix / Cross [X] */}
              <span className="mpm_toggle_icon" aria-hidden="true">
                <span ref={iconRollerRef} className="mpm_toggle_icon_roller">
                  {/* Face 1: 9-dot matrix */}
                  <span ref={iconFaceDotsRef} className="mpm_toggle_icon_face">
                    <svg
                      viewBox="0 0 20 20"
                      width="16"
                      height="16"
                      fill="currentColor"
                      aria-hidden="true"
                    >
                      <circle cx="4" cy="4" r="1.5" className="mpm_dot" />
                      <circle cx="10" cy="4" r="1.5" className="mpm_dot" />
                      <circle cx="16" cy="4" r="1.5" className="mpm_dot" />
                      <circle cx="4" cy="10" r="1.5" className="mpm_dot" />
                      <circle cx="10" cy="10" r="1.5" className="mpm_dot" />
                      <circle cx="16" cy="10" r="1.5" className="mpm_dot" />
                      <circle cx="4" cy="16" r="1.5" className="mpm_dot" />
                      <circle cx="10" cy="16" r="1.5" className="mpm_dot" />
                      <circle cx="16" cy="16" r="1.5" className="mpm_dot" />
                    </svg>
                  </span>
                  {/* Face 2: Cross [X] */}
                  <span className="mpm_toggle_icon_face">
                    <svg
                      viewBox="0 0 16 16"
                      width="14"
                      height="14"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="1.8"
                      strokeLinecap="round"
                      aria-hidden="true"
                    >
                      <path d="M3.5 3.5 L12.5 12.5 M12.5 3.5 L3.5 12.5" />
                    </svg>
                  </span>
                </span>
              </span>
            </button>
          </div>

          {/* Expanded Navigation Panel (No Image, Large Editorial Typography) */}
          <div
            ref={panelRef}
            id="mpm_nav_panel"
            className="mpm_panel"
            role="dialog"
            aria-modal="true"
            aria-label="Menú principal de navegació"
            tabIndex={-1}
          >
            <nav className="mpm_nav" aria-label="Seccions principals">
              <ul className="mpm_list" role="list">
                {NAV_LINKS.map((item) => {
                  const active = isSectionActive(item.url);
                  return (
                    <li key={item.id} className="mpm_item" role="listitem">
                      <Link
                        href={item.url}
                        className={`mpm_link ${active ? "is-active" : ""}`}
                        aria-current={active ? "page" : undefined}
                        onClick={() => {
                          closeMenu();
                        }}
                        onPointerEnter={(e) => handleLinkPointerEnter(e.currentTarget)}
                        onFocus={(e) => handleLinkPointerEnter(e.currentTarget)}
                      >
                        <span className="mpm_link_num" aria-hidden="true">
                          {item.id}
                        </span>

                        <span className="mpm_link_bullet" aria-hidden="true">
                          ·
                        </span>

                        <span className="mpm_link_title" aria-label={item.title}>
                          {renderRollingText(item.title)}
                        </span>

                        {active && (
                          <span
                            className="mpm_link_active_dot"
                            title="Secció activa"
                            aria-hidden="true"
                          />
                        )}
                      </Link>
                    </li>
                  );
                })}
              </ul>
            </nav>

            {/* Sub-footer: Social & Streaming Links */}
            <div className="mpm_footer">
              <div className="mpm_footer_tagline">ARXIU OFICIAL · 1975–2026</div>
              <div className="mpm_footer_socials">
                {SOCIAL_LINKS.map((soc) => (
                  <a
                    key={soc.name}
                    href={soc.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mpm_footer_link"
                  >
                    <span>{soc.name}</span>
                    <span className="mpm_footer_arrow" aria-hidden="true">
                      ↗
                    </span>
                  </a>
                ))}
              </div>
            </div>
          </div>
        </div>
      </header>
    </>
  );
}
