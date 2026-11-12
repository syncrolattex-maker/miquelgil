"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import A24Nav from "@/components/A24Nav";
import SandReveal from "@/components/SandReveal";
import { SocialIcon } from "@/components/Icons";
import { bookingInfo, socials } from "@/lib/site";
import "./contacte.css";

export default function ContactePage() {
  // En mòbil bloquegem el scroll del document per evitar desplaçaments accidentals i preservar l'experiència tàctil de l'arena
  useEffect(() => {
    const isMobile = window.innerWidth <= 768;
    if (isMobile) {
      const prevOverflow = document.body.style.overflow;
      const prevTouchAction = document.body.style.touchAction;
      const prevOverscroll = document.body.style.overscrollBehavior;

      document.body.style.overflow = "hidden";
      document.body.style.touchAction = "none";
      document.body.style.overscrollBehavior = "none";

      return () => {
        document.body.style.overflow = prevOverflow;
        document.body.style.touchAction = prevTouchAction;
        document.body.style.overscrollBehavior = prevOverscroll;
      };
    }
  }, []);

  return (
    <main className="contacte-a24-page">
      {/* MENÚ DE NAVEGACIÓ A24 UNIFICAT */}
      <A24Nav currentSection="/contacte/" theme="dark" />

      {/* MANTELL D'ARENA INTERACTIU A PANTALLA COMPLETA (SAND REVEAL) */}
      <SandReveal
        className="contacte-sand-fullscreen"
        starterCue={true}
        brushSize={85}
      >
        <div className="contacte-main-wrapper">
          {/* COLUMNA ESQUERRA: DOSSIER EDITORIAL DE CONTACTE A24 (SOTA L'ARENA) */}
          <section
            className="contacte-content-col"
            aria-label="Informació de contacte oficial de Miquel Gil"
          >
            <div className="contacte-editorial-panel">
              {/* 1. Kicker i Títol Monumental PP Eiko */}
              <div className="contacte-header-block">
                <span className="contacte-kicker">
                  05 / CANALS OFICIALS · MANAGEMENT &amp; XARXES
                </span>
                <h1 className="contacte-display-title">CONTACTE</h1>
              </div>

              <div className="contacte-divider" />

              {/* 2. Frase editorial en PP Eiko (visible en escriptori) */}
              <p className="contacte-subtitle">
                Si vols posar-te en contacte amb mi per a concerts, projectes
                artístics o premsa, pots fer-ho a través dels canals oficials.
              </p>

              <div className="contacte-divider mobile-hidden" />

              {/* 3. Graella Tabular Editorial A24 */}
              <div className="contacte-grid">
                {/* Bloc 01: Management & Booking */}
                <div className="contacte-cell">
                  <div className="contacte-cell__head">
                    <span className="contacte-cell__num">01</span>
                    <span className="contacte-cell__label">
                      MANAGEMENT &amp; BOOKING
                    </span>
                  </div>
                  <p className="contacte-cell__role">
                    Gusmà Gil · PPF Produccions Culturals
                  </p>
                  <a
                    href={`mailto:${bookingInfo.managementEmail}`}
                    className="contacte-primary-link"
                    title="Enviar correu a Management"
                  >
                    {bookingInfo.managementEmail} ↗
                  </a>
                  <span className="contacte-cell__meta">
                    ATENCIÓ A PROGRAMADORS, AJUNTAMENTS I FESTIVALS
                  </span>
                </div>

                {/* Bloc 02: Dossier i Riders de Contractació */}
                <div className="contacte-cell">
                  <div className="contacte-cell__head">
                    <span className="contacte-cell__num">02</span>
                    <span className="contacte-cell__label">
                      DOSSIER TÈCNIC &amp; FORMATS
                    </span>
                  </div>
                  <p className="contacte-cell__role">
                    Duo · Trio · Banda Completa · «Nus»
                  </p>
                  <Link href="/contractacio/" className="contacte-primary-link">
                    OBRIR DOSSIER DE CONTRACTACIÓ ↗
                  </Link>
                  <span className="contacte-cell__meta">
                    RIDERS TÈCNICS, STAGE PLOTS I SOL·LICITUD DE DATA
                  </span>
                </div>
              </div>

              <div className="contacte-divider" />

              {/* 4. Xarxes Oficials i Plataformes Digitals */}
              <div className="contacte-socials-section">
                <div className="contacte-cell__head">
                  <span className="contacte-cell__num">03</span>
                  <span className="contacte-cell__label">
                    XARXES SOCIALS &amp; PLATAFORMES D&apos;ESCOLTA
                  </span>
                </div>

                {/* FILA D'ICONES MINIMALISTES PER A MÒBIL (CABEN TOTES EN UNA SOLA LÍNIA SENSE SCROLL) */}
                <div
                  className="contacte-socials-icons-row"
                  aria-label="Xarxes socials de Miquel Gil"
                >
                  {socials.map((soc) => (
                    <a
                      key={soc.name}
                      href={soc.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="contacte-social-icon-btn"
                      aria-label={soc.name}
                      title={soc.name}
                    >
                      <SocialIcon icon={soc.icon} />
                    </a>
                  ))}
                </div>

                {/* PASTILLES EDITORIALS EN ESCRIPTORI */}
                <div className="contacte-socials-grid">
                  {socials.map((soc, idx) => (
                    <a
                      key={soc.name}
                      href={soc.href}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="contacte-social-pill"
                    >
                      <span className="contacte-social-pill__icon">
                        <SocialIcon icon={soc.icon} />
                      </span>
                      <span className="contacte-social-pill__idx">
                        0{idx + 1}
                      </span>
                      <span className="contacte-social-pill__name">
                        {soc.name}
                      </span>
                      <span className="contacte-social-pill__arrow">↗</span>
                    </a>
                  ))}
                </div>
              </div>

              <div className="contacte-divider" />

              {/* 5. Peu de Crèdits d'Arxiu */}
              <footer className="contacte-archival-footer">
                <span>CATARROJA · L&apos;HORTA SUD · PAÍS VALENCIÀ</span>
                <span>© {new Date().getFullYear()} MIQUEL GIL — ARXIU OFICIAL</span>
              </footer>
            </div>
          </section>

          {/* COLUMNA DRETA: FOTOGRAFIA DE MIQUEL GIL A LA PLATJA */}
          <aside
            className="contacte-photo-col"
            role="img"
            aria-label="Miquel Gil caminant per la vora de la mar a la platja"
          >
            <div className="contacte-photo-caption">
              <span>ARXIU MEDITERRANI · COSTES DEL SUD</span>
              <span>MIQUEL GIL</span>
            </div>
          </aside>
        </div>
      </SandReveal>
    </main>
  );
}
