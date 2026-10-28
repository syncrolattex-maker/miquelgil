"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import gsap from "gsap";
import type { BioSection } from "@/app/biografia/bioData";
import "./ExpandingStrip.css";

interface ExpandingStripProps {
  sections: BioSection[];
  initialIndex?: number;
  onOpenChronology?: () => void;
}

export default function ExpandingStrip({
  sections,
  initialIndex = 0,
  onOpenChronology,
}: ExpandingStripProps) {
  // activeIndex: -1 when at rest (all equal), or 0..4 when a panel is expanded
  const [activeIndex, setActiveIndex] = useState<number>(initialIndex);
  const [lockedIndex, setLockedIndex] = useState<number>(initialIndex);
  const [modalSection, setModalSection] = useState<BioSection | null>(null);

  const containerRef = useRef<HTMLDivElement>(null);
  const panelsRef = useRef<(HTMLDivElement | null)[]>([]);
  const imagesRef = useRef<(HTMLImageElement | null)[]>([]);
  const shadesRef = useRef<(HTMLDivElement | null)[]>([]);
  const scrimsRef = useRef<(HTMLDivElement | null)[]>([]);
  const vlabelsRef = useRef<(HTMLSpanElement | null)[]>([]);
  const textWrapsRef = useRef<(HTMLDivElement | null)[]>([]);
  const titlesRef = useRef<(HTMLSpanElement | null)[]>([]);
  const labelsRef = useRef<(HTMLSpanElement | null)[]>([]);
  const extrasRef = useRef<(HTMLDivElement | null)[]>([]);

  const modalBackdropRef = useRef<HTMLDivElement>(null);
  const modalCardRef = useRef<HTMLDivElement>(null);
  const modalTimelineRef = useRef<gsap.core.Timeline | null>(null);

  // Annnimate Gaussian Wave Expanding Physics
  const animateTo = useCallback(
    (targetIndex: number) => {
      const b = 0.7; // Gaussian falloff width
      const c = 5.0; // Peak expand factor for active panel
      const v = 0.38; // Compression factor for non-active panels
      const h = 1.22; // Initial subtle zoom
      const y = 6; // Image parallax shift percentage
      const w = 5; // Blur in px for neighbor panels
      const x = 0.65; // Dim darkness for neighbor panels
      const g = 0.82; // Brightness at rest (all equal)
      const duration = targetIndex < 0 ? 0.65 : 0.55;
      const ease = "power3.out";

      // Gaussian distribution around active panel
      const q = (i: number) => {
        if (targetIndex < 0) return 0;
        if (i === targetIndex) return 1;
        const dist = Math.abs(i - targetIndex);
        return Math.exp(-(dist * dist) / (2 * b * b));
      };

      // Flex-grow value per panel
      const L = (i: number) => {
        return targetIndex < 0 ? 1 : v + (c - v) * q(i);
      };

      // 1. Panels flexGrow expansion & compression
      panelsRef.current.forEach((panel, i) => {
        if (!panel) return;
        gsap.to(panel, {
          flexGrow: L(i),
          duration,
          ease,
          overwrite: "auto",
        });
      });

      // 2. Background images zoom & parallax
      const isMobile = typeof window !== "undefined" && window.innerWidth <= 767;
      imagesRef.current.forEach((img, i) => {
        if (!img) return;
        gsap.to(img, {
          scale: targetIndex < 0 ? h : h - (h - 1) * q(i),
          xPercent:
            !isMobile && targetIndex >= 0 && i !== targetIndex
              ? (i < targetIndex ? -1 : 1) * y * (1 - q(i))
              : 0,
          yPercent:
            isMobile && targetIndex >= 0 && i !== targetIndex
              ? (i < targetIndex ? -1 : 1) * y * (1 - q(i))
              : 0,
          duration,
          ease,
          force3D: true,
          overwrite: "auto",
        });
      });

      // 3. Shades: Gaussian backdrop blur and dim on neighbors
      shadesRef.current.forEach((shade, i) => {
        if (!shade) return;
        const blurPx = targetIndex < 0 ? 0 : w * (1 - q(i));
        const dimAlpha = targetIndex < 0 ? 1 - g : x * (1 - q(i));
        gsap.to(shade, {
          backdropFilter: `blur(${blurPx}px)`,
          webkitBackdropFilter: `blur(${blurPx}px)`,
          backgroundColor: `rgba(0, 0, 0, ${dimAlpha})`,
          duration,
          ease,
          overwrite: "auto",
        });
      });

      // 4. Scrims: Dark gradient rise on active panel
      scrimsRef.current.forEach((scrim, i) => {
        if (!scrim) return;
        const isTarget = i === targetIndex;
        gsap.to(scrim, {
          opacity: isTarget ? 1 : 0,
          duration: isTarget ? duration : 0.28,
          ease,
          overwrite: "auto",
        });
      });

      // 5. Vertical sliver labels: slide out when blooming, slide in when compressed/rest
      vlabelsRef.current.forEach((vlabel, i) => {
        if (!vlabel) return;
        const isTarget = i === targetIndex;
        gsap.to(vlabel, {
          xPercent: isTarget ? 115 : 0,
          opacity: isTarget ? 0 : 1,
          duration: duration * 0.75,
          ease,
          overwrite: "auto",
        });
      });

      // 6. Text content reveal (Container, Title, Subtitle, Quote, Actions)
      sections.forEach((_, i) => {
        const isTarget = i === targetIndex;
        const textWrap = textWrapsRef.current[i];
        const titleEl = titlesRef.current[i];
        const labelEl = labelsRef.current[i];
        const extraEl = extrasRef.current[i];

        if (textWrap) {
          gsap.to(textWrap, {
            opacity: isTarget ? 1 : 0,
            duration: isTarget ? 0.35 : 0.2,
            overwrite: "auto",
          });
        }

        if (titleEl) {
          gsap.to(titleEl, {
            yPercent: isTarget ? 0 : 115,
            y: 0,
            opacity: isTarget ? 1 : 0,
            duration: isTarget ? 0.5 : 0.24,
            delay: isTarget ? 0.06 : 0,
            ease: "expo.out",
            force3D: true,
            overwrite: "auto",
          });
        }

        if (labelEl) {
          gsap.to(labelEl, {
            yPercent: isTarget ? 0 : 115,
            y: 0,
            opacity: isTarget ? 1 : 0,
            duration: isTarget ? 0.5 : 0.24,
            delay: isTarget ? 0.1 : 0,
            ease: "expo.out",
            force3D: true,
            overwrite: "auto",
          });
        }

        if (extraEl) {
          gsap.to(extraEl, {
            yPercent: isTarget ? 0 : 25,
            y: 0,
            opacity: isTarget ? 1 : 0,
            duration: isTarget ? 0.5 : 0.2,
            delay: isTarget ? 0.14 : 0,
            ease: "expo.out",
            force3D: true,
            overwrite: "auto",
          });
        }
      });
    },
    [sections]
  );

  // Initialize and run initial expand
  useEffect(() => {
    animateTo(initialIndex);
  }, [animateTo, initialIndex]);

  // Handle panel hover
  const handlePanelMouseEnter = (index: number) => {
    setActiveIndex(index);
    animateTo(index);
  };

  // Handle mouse leave container: return to locked panel or rest
  const handleContainerMouseLeave = () => {
    setActiveIndex(lockedIndex);
    animateTo(lockedIndex);
  };

  // Handle panel click
  const handlePanelClick = (index: number) => {
    if (lockedIndex === index && activeIndex === index) {
      // Toggle off to rest state
      setLockedIndex(-1);
      setActiveIndex(-1);
      animateTo(-1);
    } else {
      setLockedIndex(index);
      setActiveIndex(index);
      animateTo(index);
    }
  };

  // Modal open & close
  const openModal = useCallback((sec: BioSection) => {
    setModalSection(sec);
  }, []);

  const closeModal = useCallback(() => {
    if (modalTimelineRef.current) {
      modalTimelineRef.current.kill();
    }
    const backdrop = modalBackdropRef.current;
    const card = modalCardRef.current;
    if (!backdrop || !card) {
      setModalSection(null);
      return;
    }

    const tl = gsap.timeline({
      onComplete: () => {
        setModalSection(null);
      },
    });
    modalTimelineRef.current = tl;

    tl.to(card, {
      opacity: 0,
      y: 25,
      scale: 0.95,
      duration: 0.2,
      ease: "power2.in",
    }).to(
      backdrop,
      {
        opacity: 0,
        duration: 0.18,
        ease: "power2.in",
      },
      "-=0.08"
    );
  }, []);

  // Modal opening animation
  useEffect(() => {
    if (!modalSection) return;

    const backdrop = modalBackdropRef.current;
    const card = modalCardRef.current;
    if (!backdrop || !card) return;

    const header = card.querySelector(".expanding-modal__header");
    const closeBtn = card.querySelector(".expanding-modal__close");
    const media = card.querySelector(".expanding-modal__media");
    const quote = card.querySelector(".expanding-modal__quote");
    const body = card.querySelector(".expanding-modal__body");
    const fites = card.querySelector(".expanding-modal__fites");
    const tags = card.querySelector(".expanding-modal__tags");

    const tl = gsap.timeline();
    modalTimelineRef.current = tl;

    tl.fromTo(
      backdrop,
      { opacity: 0 },
      { opacity: 1, duration: 0.3, ease: "power2.out" }
    );

    tl.fromTo(
      card,
      {
        opacity: 0,
        y: 40,
        scale: 0.92,
      },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.45,
        ease: "power3.out",
      },
      "-=0.2"
    );

    if (closeBtn) {
      tl.fromTo(
        closeBtn,
        { opacity: 0, scale: 0.7, rotation: -90 },
        { opacity: 1, scale: 1, rotation: 0, duration: 0.3, ease: "back.out(2)" },
        "-=0.3"
      );
    }

    const innerElements = [header, media, quote, body, fites, tags].filter(Boolean);
    if (innerElements.length > 0) {
      tl.fromTo(
        innerElements,
        { opacity: 0, y: 15 },
        { opacity: 1, y: 0, duration: 0.35, stagger: 0.04, ease: "power2.out" },
        "-=0.25"
      );
    }
  }, [modalSection]);

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (modalSection) {
        if (e.key === "Escape") closeModal();
        return;
      }

      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        const next = activeIndex < 0 ? 0 : (activeIndex + 1) % sections.length;
        setLockedIndex(next);
        setActiveIndex(next);
        animateTo(next);
        panelsRef.current[next]?.focus();
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        const prev = activeIndex <= 0 ? sections.length - 1 : activeIndex - 1;
        setLockedIndex(prev);
        setActiveIndex(prev);
        animateTo(prev);
        panelsRef.current[prev]?.focus();
      } else if (e.key === "Enter" || e.key === " ") {
        if (activeIndex >= 0 && sections[activeIndex]) {
          e.preventDefault();
          openModal(sections[activeIndex]);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [modalSection, activeIndex, sections, closeModal, openModal, animateTo]);

  return (
    <div className="exs_container_wrapper">
      {/* Official Annnimate Expanding Strip Component */}
      <div
        ref={containerRef}
        className="exs_wrap"
        data-anm-expanding-strip
        data-anm-expand="5.0"
        data-anm-min="0.38"
        data-anm-duration="0.55"
        data-anm-falloff="0.7"
        data-anm-zoom="1.22"
        data-anm-pan="6"
        data-anm-blur="5"
        data-anm-dim="0.65"
        role="group"
        aria-label="Cinc etapes biogràfiques de Miquel Gil"
        tabIndex={0}
        onMouseLeave={handleContainerMouseLeave}
      >
        {sections.map((sec, idx) => {
          const isExpanded = idx === activeIndex;

          return (
            <div
              key={sec.id}
              ref={(el) => {
                panelsRef.current[idx] = el;
              }}
              className={`exs_panel ${isExpanded ? "is-expanded" : "is-compressed"}`}
              data-anm-exs-panel
              data-title={sec.title}
              data-label={`${sec.period} · ${sec.subtitle}`}
              tabIndex={0}
              role="button"
              aria-label={`Etapa ${sec.num}: ${sec.title}`}
              aria-expanded={isExpanded}
              onMouseEnter={() => handlePanelMouseEnter(idx)}
              onClick={() => handlePanelClick(idx)}
              onFocus={() => handlePanelMouseEnter(idx)}
            >
              {/* Vertical Slim Label (Visible when strip is compressed or at rest) */}
              <span className="exs_vlabel" data-anm-exs-vlabel aria-hidden={isExpanded}>
                <span
                  ref={(el) => {
                    vlabelsRef.current[idx] = el;
                  }}
                  className="exs_vlabel_inner"
                >
                  <span className="exs_vlabel_num">{sec.num}</span>
                  <span className="exs_vlabel_dot">·</span>
                  <span className="exs_vlabel_title">{sec.title}</span>
                </span>
              </span>

              {/* Background Image with GSAP Parallax Pan & Zoom */}
              <img
                ref={(el) => {
                  imagesRef.current[idx] = el;
                }}
                className="exs_img"
                src={sec.image}
                alt={sec.imageAlt}
                loading="lazy"
                draggable={false}
              />

              {/* Dynamic Backdrop Blur & Dim Shade */}
              <div
                ref={(el) => {
                  shadesRef.current[idx] = el;
                }}
                className="exs_shade"
                data-anm-exs-shade
                aria-hidden="true"
              />

              {/* Bottom Gradient Scrim */}
              <div
                ref={(el) => {
                  scrimsRef.current[idx] = el;
                }}
                className="exs_scrim"
                data-anm-exs-scrim
                aria-hidden="true"
              />

              {/* Bottom Text Content with Staggered Rise */}
              <div
                ref={(el) => {
                  textWrapsRef.current[idx] = el;
                }}
                className={`exs_text ${isExpanded ? "is-visible" : "is-hidden"}`}
                data-anm-exs-text
              >
                {/* Period Badge (/start chromatic style: stark red badge) */}
                <div className="exs_badge_wrap">
                  <span className="exs_badge">
                    ETAPA {sec.num} <span className="exs_badge_sep">/</span> {sec.period}
                  </span>
                </div>

                {/* Primary Title (Grifinito L) */}
                <p className="exs_title">
                  <span
                    ref={(el) => {
                      titlesRef.current[idx] = el;
                    }}
                    className="exs_title_inner"
                    data-anm-exs-title
                  >
                    {sec.title}
                  </span>
                </p>

                {/* Subtitle Label (Graphik) */}
                <p className="exs_label">
                  <span
                    ref={(el) => {
                      labelsRef.current[idx] = el;
                    }}
                    className="exs_label_inner"
                    data-anm-exs-label
                  >
                    {sec.subtitle}
                  </span>
                </p>

                {/* Extra Content & Action Buttons */}
                <div
                  ref={(el) => {
                    extrasRef.current[idx] = el;
                  }}
                  className="exs_extra"
                >
                  {sec.quote && (
                    <blockquote className="exs_quote">
                      «{sec.quote}»
                    </blockquote>
                  )}

                  <div className="exs_actions">
                    <button
                      type="button"
                      className="exs_btn_chronicle"
                      onClick={(e) => {
                        e.stopPropagation();
                        openModal(sec);
                      }}
                    >
                      <span>Llegir crònica completa</span>
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                        <line x1="5" y1="12" x2="19" y2="12" />
                        <polyline points="12 5 19 12 12 19" />
                      </svg>
                    </button>

                    {onOpenChronology && (
                      <button
                        type="button"
                        className="exs_btn_fites"
                        onClick={(e) => {
                          e.stopPropagation();
                          onOpenChronology();
                        }}
                      >
                        <span>Fites històriques</span>
                        <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                          <line x1="12" y1="5" x2="12" y2="19" />
                          <polyline points="19 12 12 19 5 12" />
                        </svg>
                      </button>
                    )}
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* FULL CHRONICLE MODAL (Refactored to /start chromatic palette: Black, White & Red) */}
      {modalSection && (
        <div
          ref={modalBackdropRef}
          className="expanding-modal-backdrop"
          onClick={closeModal}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-section-title"
        >
          <div
            ref={modalCardRef}
            className="expanding-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Close Button X (Explicit click handler & pointerEvents fix) */}
            <button
              type="button"
              className="expanding-modal__close"
              onClick={(e) => {
                e.stopPropagation();
                closeModal();
              }}
              aria-label="Tancar crònica (Esc)"
              title="Tancar crònica (Esc)"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ pointerEvents: "none" }}>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            <div className="expanding-modal__header">
              <div className="expanding-modal__meta">
                <span className="modal-meta__num">ETAPA {modalSection.num}</span>
                <span className="modal-meta__sep">/</span>
                <span className="modal-meta__period">{modalSection.period}</span>
              </div>
              <h2 id="modal-section-title" className="expanding-modal__title">
                {modalSection.title}
              </h2>
              <p className="expanding-modal__subtitle">{modalSection.subtitle}</p>
            </div>

            <div className="expanding-modal__media">
              <img
                src={modalSection.image}
                alt={modalSection.imageAlt}
                className="expanding-modal__img"
              />
              <span className="expanding-modal__caption">{modalSection.imageAlt}</span>
            </div>

            {modalSection.quote && (
              <blockquote className="expanding-modal__quote">
                «{modalSection.quote}»
              </blockquote>
            )}

            <div className="expanding-modal__body">
              {modalSection.paragraphs.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
            </div>

            {modalSection.keyMilestones.length > 0 && (
              <div className="expanding-modal__fites">
                <h4 className="modal-fites__title">Fites clau d'aquesta etapa</h4>
                <div className="modal-fites__grid">
                  {modalSection.keyMilestones.map((fita, idx) => (
                    <div key={idx} className="modal-fita__item">
                      <span className="modal-fita__year">{fita.year}</span>
                      <span className="modal-fita__text">{fita.title}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            <div className="expanding-modal__tags">
              {modalSection.tags.map((tag) => (
                <span key={tag} className="modal-tag">
                  #{tag}
                </span>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
