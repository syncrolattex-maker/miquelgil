"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
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
  const [selectedIndex, setSelectedIndex] = useState<number>(initialIndex);
  const [hoveredIndex, setHoveredIndex] = useState<number | null>(null);
  const [modalSection, setModalSection] = useState<BioSection | null>(null);
  const [isMobile, setIsMobile] = useState<boolean>(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Determinar active index: hover prevaleix en desktop; si no hi ha hover, selectedIndex
  const activeIndex = hoveredIndex !== null ? hoveredIndex : selectedIndex;

  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 960);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Navegació amb teclat
  const handleKeyDown = useCallback(
    (e: KeyboardEvent) => {
      if (modalSection) {
        if (e.key === "Escape") setModalSection(null);
        return;
      }

      if (e.key === "ArrowRight" || e.key === "ArrowDown") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev + 1) % sections.length);
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp") {
        e.preventDefault();
        setSelectedIndex((prev) => (prev - 1 + sections.length) % sections.length);
      } else if (e.key === "Enter" || e.key === " ") {
        // Obri la fitxa completa de la secció activa
        const current = sections[activeIndex];
        if (current) {
          e.preventDefault();
          setModalSection(current);
        }
      }
    },
    [modalSection, sections, activeIndex]
  );

  useEffect(() => {
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [handleKeyDown]);

  return (
    <div className="expanding-strip-wrapper" ref={containerRef}>
      {/* Contenidor Annnimate Expanding Strip (5 posicions) */}
      <div
        className="expanding-strip-container"
        onMouseLeave={() => setHoveredIndex(null)}
      >
        {sections.map((sec, idx) => {
          const isActive = idx === activeIndex;
          const isCompressed = !isActive;

          return (
            <div
              key={sec.id}
              id={`strip-panel-${sec.id}`}
              role="region"
              aria-label={`Secció ${sec.num}: ${sec.title}`}
              aria-expanded={isActive}
              tabIndex={0}
              className={`expanding-strip-panel ${isActive ? "is-active" : "is-compressed"}`}
              onMouseEnter={() => {
                if (!isMobile) setHoveredIndex(idx);
              }}
              onClick={() => {
                setSelectedIndex(idx);
                setHoveredIndex(null);
              }}
              onFocus={() => setSelectedIndex(idx)}
            >
              {/* Fotografia de fons */}
              <div className="expanding-strip__bg-wrap">
                <img
                  src={sec.image}
                  alt={sec.imageAlt}
                  className="expanding-strip__bg-img"
                  loading="lazy"
                />
                <div className="expanding-strip__overlay" />
                <div className="expanding-strip__grain" />
              </div>

              {/* VISTA COMPRIMIDA (Quan una altra secció està activa o al repòs) */}
              <div
                className={`expanding-strip__compressed ${
                  isCompressed ? "is-visible" : "is-hidden"
                }`}
                aria-hidden={isActive}
              >
                <div className="expanding-strip__comp-top">
                  <span className="expanding-strip__comp-num">{sec.num}</span>
                  <span className="expanding-strip__comp-dot" />
                </div>

                <div className="expanding-strip__comp-middle">
                  <span className="expanding-strip__comp-title">{sec.title}</span>
                </div>

                <div className="expanding-strip__comp-bottom">
                  <span className="expanding-strip__comp-period">{sec.period}</span>
                </div>
              </div>

              {/* VISTA EXPANDIDA (Annnimate 4.0 bloom: El títol i contingut s'eleven) */}
              <div
                className={`expanding-strip__expanded ${
                  isActive ? "is-visible" : "is-hidden"
                }`}
                aria-hidden={!isActive}
              >
                <div className="expanding-strip__exp-inner">
                  {/* Barra superior de metadades */}
                  <div className="expanding-strip__exp-meta">
                    <div className="expanding-strip__exp-badge">
                      <span className="exp-badge__num">SECCIÓ {sec.num}</span>
                      <span className="exp-badge__sep">/</span>
                      <span className="exp-badge__period">{sec.period}</span>
                    </div>
                    <span className="expanding-strip__exp-kicker">{sec.subtitle}</span>
                  </div>

                  {/* Títol principal amb animació ascendent */}
                  <h3 className="expanding-strip__exp-title">{sec.title}</h3>

                  {/* Cita destacada d'arxiu */}
                  {sec.quote && (
                    <blockquote className="expanding-strip__exp-quote">
                      «{sec.quote}»
                    </blockquote>
                  )}

                  {/* Text narratiu editorial */}
                  <div className="expanding-strip__exp-prose">
                    <p className="expanding-strip__exp-summary">{sec.summary}</p>
                    <p className="expanding-strip__exp-p2">{sec.paragraphs[1]}</p>
                  </div>

                  {/* Fites i etiquetes clau de la secció */}
                  <div className="expanding-strip__exp-footer">
                    <div className="expanding-strip__exp-tags">
                      {sec.tags.slice(0, 4).map((tag) => (
                        <span key={tag} className="expanding-strip__tag">
                          {tag}
                        </span>
                      ))}
                    </div>

                    <div className="expanding-strip__exp-actions">
                      <button
                        type="button"
                        className="expanding-strip__btn-expand"
                        onClick={(e) => {
                          e.stopPropagation();
                          setModalSection(sec);
                        }}
                      >
                        <span>Llegir crònica completa</span>
                        <svg
                          width="16"
                          height="16"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        >
                          <path d="M5 12h14" />
                          <path d="M12 5l7 7-7 7" />
                        </svg>
                      </button>

                      {onOpenChronology && (
                        <button
                          type="button"
                          className="expanding-strip__btn-ghost"
                          onClick={(e) => {
                            e.stopPropagation();
                            onOpenChronology();
                          }}
                        >
                          <span>Veure fites històriques</span>
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* MODAL DE CRÒNICA HISTÒRICA COMPLETA */}
      {modalSection && (
        <div
          className="expanding-modal-backdrop"
          onClick={() => setModalSection(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="modal-section-title"
        >
          <div
            className="expanding-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            <button
              type="button"
              className="expanding-modal__close"
              onClick={() => setModalSection(null)}
              aria-label="Tancar crònica"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" stroke="currentColor" strokeWidth="2">
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            <div className="expanding-modal__header">
              <div className="expanding-modal__meta">
                <span className="modal-meta__num">SECCIÓ {modalSection.num}</span>
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
                <h4 className="modal-fites__title">Fites d'aquesta etapa</h4>
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
