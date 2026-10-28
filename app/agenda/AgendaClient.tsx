"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import gsap from "gsap";
import { bookingInfo } from "@/lib/site";
import { Concert, DEFAULT_CONCERTS } from "@/types/concert";
import { getConcerts, subscribeToConcerts } from "@/lib/concertsService";

// Resting fan geometry constants (Tutorial 025 baseline)
const RESTING_ROTATIONS = [-3.8, 1.9, -2.4, 2.7, -1.8, 3.1];
const RESTING_Y_OFFSETS = [-6, 8, -4, 10, -3, 6];

export default function AgendaClient() {
  const [concertsList, setConcertsList] = useState<Concert[]>(DEFAULT_CONCERTS);
  const [activeFilter, setActiveFilter] = useState<"all" | "upcoming" | "past">("all");
  const [exposedIndex, setExposedIndex] = useState<number | null>(null);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

  const deckRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);

  // Carrega reactiva de concerts des de Supabase o memòria cau local
  useEffect(() => {
    let isMounted = true;
    getConcerts().then((data) => {
      if (isMounted) setConcertsList(data);
    });

    const unsubscribe = subscribeToConcerts((updated) => {
      if (isMounted) setConcertsList(updated);
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const filteredConcerts = concertsList.filter((c) => {
    if (activeFilter === "upcoming") return c.status === "upcoming" || c.status === "postponed";
    if (activeFilter === "past") return c.status === "past";
    return true;
  });

  // Reset resting fanned state
  const resetRestingState = useCallback(() => {
    const cards = cardRefs.current.filter(Boolean) as HTMLElement[];
    cards.forEach((card, i) => {
      card.classList.remove("is-focused", "is-exposed", "is-dimmed");
      gsap.to(card, {
        x: 0,
        y: RESTING_Y_OFFSETS[i % RESTING_Y_OFFSETS.length] || 0,
        rotation: RESTING_ROTATIONS[i % RESTING_ROTATIONS.length] || 0,
        scale: 1,
        opacity: 1,
        filter: "blur(0px)",
        duration: 0.55,
        ease: "power3.out",
        overwrite: "auto",
      });
      card.style.zIndex = (i + 1).toString();
    });
  }, []);

  // Update resting positions whenever filtered concerts change
  useEffect(() => {
    setExposedIndex(null);
    setFocusedIndex(null);
    resetRestingState();
  }, [filteredConcerts.length, resetRestingState]);

  // Expose a card directly in the foreground (primer pla) without a popup
  const handleExposeCard = useCallback((index: number) => {
    setExposedIndex(index);
    setFocusedIndex(index);
    const cards = cardRefs.current.filter(Boolean) as HTMLElement[];
    const deck = deckRef.current;
    if (!deck || cards.length === 0) return;

    const total = cards.length;
    const isMobile = window.innerWidth <= 900;

    if (isMobile) {
      const viewport = deck.parentElement;
      if (viewport) {
        const card = cards[index];
        const targetScrollLeft = card.offsetLeft - (viewport.clientWidth - card.offsetWidth) / 2;
        viewport.scrollTo({ left: Math.max(0, targetScrollLeft), behavior: "smooth" });
      }
    }

    const deckCenter = deck.clientWidth / 2;

    cards.forEach((card, i) => {
      const naturalCenter = card.offsetLeft + card.offsetWidth / 2;

      if (i === index) {
        card.classList.add("is-exposed");
        card.classList.remove("is-dimmed", "is-focused");
        card.style.zIndex = "120";

        const targetX = isMobile ? 0 : deckCenter - naturalCenter;

        gsap.to(card, {
          x: targetX,
          y: -28,
          rotation: 0,
          scale: isMobile ? 1.05 : 1.15,
          opacity: 1,
          filter: "blur(0px)",
          duration: 0.52,
          ease: "power3.out",
          overwrite: "auto",
        });
      } else {
        card.classList.remove("is-exposed", "is-focused");
        card.classList.add("is-dimmed");

        const isLeft = i < index;
        const dist = Math.abs(index - i);

        let targetX = 0;
        if (isMobile) {
          targetX = isLeft ? -90 - (dist - 1) * 20 : 90 + (dist - 1) * 20;
        } else {
          const desiredCenter = isLeft
            ? deckCenter - 210 - (dist - 1) * 44
            : deckCenter + 210 + (dist - 1) * 44;
          targetX = desiredCenter - naturalCenter;
        }

        const shiftRot = isLeft ? -8 - (dist - 1) * 1.5 : 8 + (dist - 1) * 1.5;

        gsap.to(card, {
          x: targetX,
          y: (RESTING_Y_OFFSETS[i % RESTING_Y_OFFSETS.length] || 0) + 14,
          rotation: shiftRot,
          scale: 0.9,
          opacity: 0.22,
          filter: "blur(1.5px)",
          duration: 0.52,
          ease: "power3.out",
          overwrite: "auto",
        });
        card.style.zIndex = (isLeft ? i + 1 : total - i).toString();
      }
    });
  }, []);

  // Return card to resting fan
  const handleCloseExposed = useCallback(() => {
    setExposedIndex(null);
    setFocusedIndex(null);
    resetRestingState();
  }, [resetRestingState]);

  // Cursor movement over the card deck (Tutorial 025: Randomize & Focus)
  const handleDeckMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    // If a card is already exposed in primer pla, don't disrupt with hover
    if (exposedIndex !== null) return;

    const deck = deckRef.current;
    if (!deck) return;
    const cards = cardRefs.current.filter(Boolean) as HTMLElement[];
    if (cards.length === 0) return;

    const mouseX = e.clientX;
    let closestIdx = 0;
    let minDistance = Infinity;

    cards.forEach((card, i) => {
      const rect = card.getBoundingClientRect();
      const cardCenter = rect.left + rect.width / 2;
      const dist = Math.abs(mouseX - cardCenter);
      if (dist < minDistance) {
        minDistance = dist;
        closestIdx = i;
      }
    });

    setFocusedIndex(closestIdx);

    const total = cards.length;
    cards.forEach((card, i) => {
      if (i === closestIdx) {
        card.classList.add("is-focused");
        gsap.to(card, {
          x: 0,
          y: -26,
          rotation: 0,
          scale: 1.05,
          duration: 0.38,
          ease: "power2.out",
          overwrite: "auto",
        });
        card.style.zIndex = "50";
      } else if (i < closestIdx) {
        card.classList.remove("is-focused");
        const dist = closestIdx - i;
        const shiftX = -110 - (dist - 1) * 22;
        const rot = -6 - (dist - 1) * 1.5;
        gsap.to(card, {
          x: shiftX,
          y: (RESTING_Y_OFFSETS[i % RESTING_Y_OFFSETS.length] || 0) + 4,
          rotation: rot,
          scale: 0.97,
          duration: 0.38,
          ease: "power2.out",
          overwrite: "auto",
        });
        card.style.zIndex = (i + 1).toString();
      } else {
        card.classList.remove("is-focused");
        const dist = i - closestIdx;
        const shiftX = 110 + (dist - 1) * 22;
        const rot = 6 + (dist - 1) * 1.5;
        gsap.to(card, {
          x: shiftX,
          y: (RESTING_Y_OFFSETS[i % RESTING_Y_OFFSETS.length] || 0) + 4,
          rotation: rot,
          scale: 0.97,
          duration: 0.38,
          ease: "power2.out",
          overwrite: "auto",
        });
        card.style.zIndex = (total - i).toString();
      }
    });
  };

  const handleDeckMouseLeave = () => {
    if (exposedIndex !== null) return;
    setFocusedIndex(null);
    resetRestingState();
  };

  // Keyboard shortcut: Escape to close exposed card
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && exposedIndex !== null) {
        handleCloseExposed();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [exposedIndex, handleCloseExposed]);

  return (
    <div className="agenda-page">
      {/* ============================================================
          HERO EDITORIAL
          ============================================================ */}
      <header className="agenda-hero">
        <div className="agenda-hero-inner">
          <span className="agenda-hero-eyebrow">Directes // Gira 2026 — 2027</span>
          <h1 className="agenda-hero-title">Agenda de Concerts</h1>
          <p className="agenda-hero-lead">
            Cinquanta anys de carrera dalt dels escenaris sense repetir fórmules. De la
            intimitat del duo a la potència de la banda completa, Miquel Gil continua
            recorrent teatres, auditoris i festivals mediterranis.
          </p>

          <div className="agenda-hero-stats">
            <div className="agenda-stat-item">
              <span className="agenda-stat-num">5 Formats</span>
              <span className="agenda-stat-lbl">De Duo a Banda Completa</span>
            </div>
            <div className="agenda-stat-item">
              <span className="agenda-stat-num">50 Anys</span>
              <span className="agenda-stat-lbl">De música en directe</span>
            </div>
            <div className="agenda-stat-item">
              <span className="agenda-stat-num">100% Arrel</span>
              <span className="agenda-stat-lbl">Tradició que camina cap endavant</span>
            </div>
          </div>
        </div>
      </header>

      {/* ============================================================
          BARRA DE FILTRES I ACCÉS A CONTRACTACIÓ
          ============================================================ */}
      <div className="agenda-filter-bar">
        <div className="agenda-filter-inner">
          <div className="agenda-filter-pills" role="tablist">
            <button
              type="button"
              className={`agenda-pill ${activeFilter === "all" ? "is-active" : ""}`}
              onClick={() => setActiveFilter("all")}
            >
              Totes les dates ({concertsList.length})
            </button>
            <button
              type="button"
              className={`agenda-pill ${activeFilter === "upcoming" ? "is-active" : ""}`}
              onClick={() => setActiveFilter("upcoming")}
            >
              Propers / En curs
            </button>
            <button
              type="button"
              className={`agenda-pill ${activeFilter === "past" ? "is-active" : ""}`}
              onClick={() => setActiveFilter("past")}
            >
              Històric destacat
            </button>
          </div>

          <Link href="/contractacio" className="agenda-cta-contract-link">
            <span>Dossier i Contractació</span>
            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M5 12h14M12 5l7 7-7 7" />
            </svg>
          </Link>
        </div>
      </div>

      {/* ============================================================
          SHOWCASE TUTORIAL 025: RANDOMIZE & FOCUS CARD DECK
          Referència: https://madewithgsap.com/effects/tutorial025
          ============================================================ */}
      <section
        className={`agenda-showcase-section ${exposedIndex !== null ? "has-exposed-card" : ""}`}
        aria-label="Baralla interactiva de concerts"
        onClick={(e) => {
          if (exposedIndex !== null && !(e.target as HTMLElement).closest(".agenda-deck-card")) {
            handleCloseExposed();
          }
        }}
      >
        <div className="agenda-showcase-inner">
          <div className="agenda-deck-header">
            <h2 className="agenda-deck-title">Cartell de Concerts</h2>
            <p className="agenda-deck-subtitle">
              Passa el cursor per sobre de la baralla per separar les cartes. Fes clic a qualsevol concert per exposar la fitxa en primer pla amb tota la informació.
            </p>
          </div>

          {/* Viewport for the overlapping GSAP fan deck */}
          <div className="agenda-deck-viewport">
            <div
              ref={deckRef}
              className="agenda-deck-container"
              onMouseMove={handleDeckMouseMove}
              onMouseLeave={handleDeckMouseLeave}
            >
              {filteredConcerts.map((concert, idx) => {
                const isExposed = exposedIndex === idx;
                const isFocused = focusedIndex === idx;

                return (
                  <article
                    key={concert.id}
                    ref={(el) => {
                      cardRefs.current[idx] = el;
                    }}
                    data-index={idx}
                    className={`agenda-deck-card ${concert.isFeatured ? "is-featured" : ""} ${
                      isFocused ? "is-focused" : ""
                    } ${isExposed ? "is-exposed" : ""}`}
                    style={{
                      backgroundColor: concert.bg,
                      color: concert.fg,
                    }}
                    onClick={() => {
                      if (isExposed) {
                        handleCloseExposed();
                      } else {
                        handleExposeCard(idx);
                      }
                    }}
                  >
                    {/* Top: format tag & year badge & in-card close icon */}
                    <div className="deck-card-top">
                      <div className="deck-card-top-left">
                        <span className="deck-card-format">{concert.badge || concert.format}</span>
                        <span className="deck-card-year">{concert.year}</span>
                      </div>

                      <button
                        type="button"
                        className="deck-card-close-btn"
                        aria-label="Tancar primer pla"
                        title="Tancar primer pla"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleCloseExposed();
                        }}
                      >
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round">
                          <line x1="18" y1="6" x2="6" y2="18" />
                          <line x1="6" y1="6" x2="18" y2="18" />
                        </svg>
                      </button>
                    </div>

                    {/* Body: Title in Grifinito L, Venue, Date & Full Desc */}
                    <div className="deck-card-body">
                      <h3 className="deck-card-title">{concert.title}</h3>

                      <div className="deck-card-meta">
                        <div className="deck-card-meta-row">
                          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                            <circle cx="12" cy="10" r="3" />
                          </svg>
                          <span>
                            <strong>{concert.venue}</strong>
                            {concert.city ? ` · ${concert.city}` : ""}
                          </span>
                        </div>

                        <div className="deck-card-meta-row">
                          <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                            <circle cx="12" cy="12" r="10" />
                            <polyline points="12 6 12 12 16 14" />
                          </svg>
                          <span>{concert.dateStr}</span>
                        </div>

                        {concert.format && (
                          <div className="deck-card-meta-row deck-card-meta-format">
                            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                              <path d="M9 18V5l12-2v13" />
                              <circle cx="6" cy="18" r="3" />
                              <circle cx="18" cy="16" r="3" />
                            </svg>
                            <span>Format: {concert.format}</span>
                          </div>
                        )}
                      </div>

                      <p className="deck-card-desc">{concert.description}</p>
                    </div>

                    {/* Dotted divider matching Tutorial 025 */}
                    <hr className="deck-card-divider" />

                    {/* Footer: status pill & action arrow button */}
                    <div className="deck-card-footer">
                      <span className="deck-card-status">{concert.statusText}</span>

                      {/* Resting view arrow button */}
                      <button
                        type="button"
                        className="deck-card-action-btn"
                        aria-label={`Exposar ${concert.title} en primer pla`}
                        title="Exposar en primer pla"
                        onClick={(e) => {
                          e.stopPropagation();
                          if (isExposed) {
                            handleCloseExposed();
                          } else {
                            handleExposeCard(idx);
                          }
                        }}
                      >
                        <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2">
                          <path d="M5 12h14M12 5l7 7-7 7" />
                        </svg>
                      </button>

                      {/* In-card action links revealed when exposed in foreground */}
                      <div className="deck-card-expanded-actions">
                        {concert.infoUrl && (
                          <a
                            href={concert.infoUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="deck-card-btn deck-card-btn--primary"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <span>Web / Entrades</span>
                            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.4">
                              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" />
                            </svg>
                          </a>
                        )}
                        {concert.ticketUrl && concert.ticketUrl !== concert.infoUrl && (
                          <a
                            href={concert.ticketUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="deck-card-btn deck-card-btn--primary"
                            onClick={(e) => e.stopPropagation()}
                          >
                            <span>Comprar</span>
                            <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.4">
                              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" />
                            </svg>
                          </a>
                        )}
                        <Link
                          href="/contractacio"
                          className="deck-card-btn deck-card-btn--secondary"
                          onClick={(e) => e.stopPropagation()}
                        >
                          <span>Dossier</span>
                          <svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" strokeWidth="2.4">
                            <line x1="5" y1="12" x2="19" y2="12" />
                            <polyline points="12 5 19 12 12 19" />
                          </svg>
                        </Link>
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          BANNER DE CONTRACTACIÓ PER A PROGRAMADORS
          ============================================================ */}
      <section className="agenda-booking-callout">
        <div className="agenda-callout-inner">
          <div className="agenda-callout-content">
            <span className="agenda-callout-kicker">Programadors i Festivals</span>
            <h2 className="agenda-callout-title">
              Vols programar Miquel Gil a la teua ciutat o festival?
            </h2>
            <p className="agenda-callout-desc">
              Disposem de 5 formats escènics adaptables a tota mena d&apos;espais: des de
              l&apos;acústica d&apos;un claustre patrimonial en format Duo fins a la màxima
              potència per a grans auditoris i festivals a l&apos;aire lliure amb Banda Completa.
            </p>
            <div className="agenda-callout-actions">
              <Link href="/contractacio" className="agenda-callout-btn agenda-callout-btn--main">
                Veure formats i descarregar riders
              </Link>
              <a
                href={`mailto:${bookingInfo.managementEmail}?subject=${encodeURIComponent(
                  "Sol·licitud de disponibilitat de concert — Miquel Gil"
                )}`}
                className="agenda-callout-btn agenda-callout-btn--alt"
              >
                Contacte ràpid amb Management
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          ESPAIS I FESTIVALS HISTÒRICS DE REFERÈNCIA
          ============================================================ */}
      <section className="agenda-venues-section">
        <div className="agenda-venues-inner">
          <div className="agenda-venues-header">
            <span className="agenda-venues-kicker">Trajectòria escènica</span>
            <h2 className="agenda-venues-title">Escenaris i festivals de referència</h2>
            <p className="agenda-venues-subtitle">
              Miquel Gil ha actuat en alguns dels teatres i festivals de músiques del món més
              prestigiosos d&apos;Europa i Amèrica.
            </p>
          </div>

          <div className="agenda-venues-grid">
            {bookingInfo.featuredVenues.map((venue, idx) => (
              <div key={idx} className="agenda-venue-chip">
                <span className="agenda-venue-dot" />
                <span className="agenda-venue-name">{venue}</span>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}
