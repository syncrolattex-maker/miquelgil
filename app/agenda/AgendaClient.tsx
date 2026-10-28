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
  const [selectedConcert, setSelectedConcert] = useState<Concert | null>(null);
  const [focusedIndex, setFocusedIndex] = useState<number | null>(null);

  const deckRef = useRef<HTMLDivElement>(null);
  const cardRefs = useRef<(HTMLElement | null)[]>([]);
  const modalBackdropRef = useRef<HTMLDivElement>(null);
  const modalCardRef = useRef<HTMLDivElement>(null);

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
      card.classList.remove("is-focused");
      gsap.to(card, {
        x: 0,
        y: RESTING_Y_OFFSETS[i % RESTING_Y_OFFSETS.length] || 0,
        rotation: RESTING_ROTATIONS[i % RESTING_ROTATIONS.length] || 0,
        scale: 1,
        duration: 0.65,
        ease: "power3.out",
        overwrite: "auto",
      });
      card.style.zIndex = (i + 1).toString();
    });
  }, []);

  // Update resting positions whenever filtered concerts change
  useEffect(() => {
    resetRestingState();
  }, [filteredConcerts.length, resetRestingState]);

  // Cursor movement over the card deck (Tutorial 025: Randomize & Focus)
  const handleDeckMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
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
    setFocusedIndex(null);
    resetRestingState();
  };

  // Touch focus handler for mobile / tablet
  const handleCardTouchFocus = (index: number) => {
    const cards = cardRefs.current.filter(Boolean) as HTMLElement[];
    if (index === focusedIndex) {
      // Toggle modal if already focused
      setSelectedConcert(filteredConcerts[index]);
      return;
    }
    setFocusedIndex(index);
    const total = cards.length;
    cards.forEach((card, i) => {
      if (i === index) {
        card.classList.add("is-focused");
        gsap.to(card, {
          x: 0,
          y: -22,
          rotation: 0,
          scale: 1.04,
          duration: 0.35,
          ease: "power2.out",
          overwrite: "auto",
        });
        card.style.zIndex = "50";
      } else if (i < index) {
        card.classList.remove("is-focused");
        const dist = index - i;
        gsap.to(card, {
          x: -90 - (dist - 1) * 18,
          y: RESTING_Y_OFFSETS[i % RESTING_Y_OFFSETS.length] || 0,
          rotation: -5 - (dist - 1) * 1.5,
          scale: 0.97,
          duration: 0.35,
          ease: "power2.out",
          overwrite: "auto",
        });
        card.style.zIndex = (i + 1).toString();
      } else {
        card.classList.remove("is-focused");
        const dist = i - index;
        gsap.to(card, {
          x: 90 + (dist - 1) * 18,
          y: RESTING_Y_OFFSETS[i % RESTING_Y_OFFSETS.length] || 0,
          rotation: 5 + (dist - 1) * 1.5,
          scale: 0.97,
          duration: 0.35,
          ease: "power2.out",
          overwrite: "auto",
        });
        card.style.zIndex = (total - i).toString();
      }
    });
  };

  // Close modal animation
  const handleCloseModal = useCallback(() => {
    const backdrop = modalBackdropRef.current;
    const card = modalCardRef.current;
    if (!backdrop || !card) {
      setSelectedConcert(null);
      return;
    }
    gsap.timeline({
      onComplete: () => setSelectedConcert(null),
    })
      .to(card, { opacity: 0, y: 25, scale: 0.94, duration: 0.22, ease: "power2.in" })
      .to(backdrop, { opacity: 0, duration: 0.18, ease: "power2.in" }, "-=0.1");
  }, []);

  // Modal entrance animation
  useEffect(() => {
    if (!selectedConcert) return;
    const backdrop = modalBackdropRef.current;
    const card = modalCardRef.current;
    if (!backdrop || !card) return;

    gsap.timeline()
      .fromTo(backdrop, { opacity: 0 }, { opacity: 1, duration: 0.3, ease: "power2.out" })
      .fromTo(
        card,
        { opacity: 0, y: 35, scale: 0.92 },
        { opacity: 1, y: 0, scale: 1, duration: 0.42, ease: "power3.out" },
        "-=0.18"
      );
  }, [selectedConcert]);

  // Keyboard shortcut: Escape to close modal
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && selectedConcert) {
        handleCloseModal();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [selectedConcert, handleCloseModal]);

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
      <section className="agenda-showcase-section" aria-label="Baralla interactiva de concerts">
        <div className="agenda-showcase-inner">
          <div className="agenda-deck-header">
            <h2 className="agenda-deck-title">Cartell de Concerts</h2>
            <p className="agenda-deck-subtitle">
              Passa el cursor per sobre de la baralla per separar les cartes i enfocar cada data. Fes clic a qualsevol concert per obrir-ne la fitxa sencera.
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
              {filteredConcerts.map((concert, idx) => (
                <article
                  key={concert.id}
                  ref={(el) => {
                    cardRefs.current[idx] = el;
                  }}
                  data-index={idx}
                  className={`agenda-deck-card ${concert.isFeatured ? "is-featured" : ""} ${
                    focusedIndex === idx ? "is-focused" : ""
                  }`}
                  style={{
                    backgroundColor: concert.bg,
                    color: concert.fg,
                  }}
                  onClick={() => setSelectedConcert(concert)}
                  onTouchStart={() => handleCardTouchFocus(idx)}
                >
                  {/* Top: format tag & year badge */}
                  <div className="deck-card-top">
                    <span className="deck-card-format">{concert.format}</span>
                    <span className="deck-card-year">{concert.year}</span>
                  </div>

                  {/* Body: Title in Grifinito L, Venue & Desc */}
                  <div className="deck-card-body">
                    <h3 className="deck-card-title">{concert.title}</h3>

                    <div className="deck-card-meta">
                      <div className="deck-card-meta-row">
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                          <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                          <circle cx="12" cy="10" r="3" />
                        </svg>
                        <span>
                          <strong>{concert.venue}</strong> · {concert.city}
                        </span>
                      </div>

                      <div className="deck-card-meta-row">
                        <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                          <circle cx="12" cy="12" r="10" />
                          <polyline points="12 6 12 12 16 14" />
                        </svg>
                        <span>{concert.dateStr}</span>
                      </div>
                    </div>

                    <p className="deck-card-desc">{concert.description}</p>
                  </div>

                  {/* Dotted divider matching Tutorial 025 */}
                  <hr className="deck-card-divider" />

                  {/* Footer: status pill & action arrow button */}
                  <div className="deck-card-footer">
                    <span className="deck-card-status">{concert.statusText}</span>
                    <button
                      type="button"
                      className="deck-card-action-btn"
                      aria-label={`Veure detalls de ${concert.title}`}
                      title="Veure detalls"
                    >
                      <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" strokeWidth="2.2">
                        <path d="M5 12h14M12 5l7 7-7 7" />
                      </svg>
                    </button>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          POPUP MODAL DE DETALL DEL CONCERT (ANIMACIÓ GSAP)
          ============================================================ */}
      {selectedConcert && (
        <div
          ref={modalBackdropRef}
          className="agenda-modal-backdrop"
          onClick={handleCloseModal}
          role="dialog"
          aria-modal="true"
          aria-labelledby="agenda-modal-title"
        >
          <div
            ref={modalCardRef}
            className="agenda-modal-card"
            style={{ borderTop: `4px solid ${selectedConcert.bg}` }}
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="agenda-modal-close"
              onClick={handleCloseModal}
              aria-label="Tancar finestra (Esc)"
              title="Tancar (Esc)"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            <div className="agenda-modal-header">
              <div className="agenda-modal-tags">
                <span className="agenda-modal-badge" style={{ backgroundColor: selectedConcert.bg }}>
                  {selectedConcert.badge}
                </span>
                <span className="agenda-modal-year">{selectedConcert.year}</span>
                <span className="agenda-modal-status">{selectedConcert.statusText}</span>
              </div>
              <h2 id="agenda-modal-title" className="agenda-modal-title">
                {selectedConcert.title}
              </h2>
              <span className="agenda-modal-format">{selectedConcert.format}</span>
            </div>

            <div className="agenda-modal-body">
              <div className="agenda-modal-info-grid">
                <div className="agenda-modal-info-item">
                  <span className="info-label">Espai / Recinte:</span>
                  <p className="info-val">
                    <strong>{selectedConcert.venue}</strong>
                  </p>
                </div>
                <div className="agenda-modal-info-item">
                  <span className="info-label">Població / Comarca:</span>
                  <p className="info-val">{selectedConcert.city}</p>
                </div>
                <div className="agenda-modal-info-item">
                  <span className="info-label">Data i Horari:</span>
                  <p className="info-val">{selectedConcert.dateStr}</p>
                </div>
                <div className="agenda-modal-info-item">
                  <span className="info-label">Estat de la convocatòria:</span>
                  <p className="info-val">{selectedConcert.statusText}</p>
                </div>
              </div>

              <div className="agenda-modal-desc-box">
                <span className="info-label">Crònica i detalls artístics:</span>
                <p className="agenda-modal-desc-text">{selectedConcert.description}</p>
              </div>

              <div className="agenda-modal-actions">
                {selectedConcert.infoUrl && (
                  <a
                    href={selectedConcert.infoUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="agenda-modal-btn agenda-modal-btn--primary"
                  >
                    <span>Web oficial / Venda d&apos;entrades</span>
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" />
                    </svg>
                  </a>
                )}
                <Link
                  href="/contractacio"
                  className="agenda-modal-btn agenda-modal-btn--secondary"
                >
                  <span>Dossier de contractació i riders</span>
                  <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M5 12h14M12 5l7 7-7 7" />
                  </svg>
                </Link>
              </div>
            </div>
          </div>
        </div>
      )}

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
