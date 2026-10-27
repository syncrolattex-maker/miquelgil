"use client";

import React, { useState } from "react";
import Link from "next/link";
import { bookingInfo, liveFormats } from "@/lib/site";

interface Concert {
  id: string;
  title: string;
  format: string;
  dateStr: string;
  year: string;
  venue: string;
  city: string;
  status: "upcoming" | "postponed" | "past";
  statusText: string;
  description: string;
  ticketUrl?: string;
  infoUrl?: string;
  isFeatured?: boolean;
}

const CONCERTS: Concert[] = [
  {
    id: "mataro-2026",
    title: "Festival 2 Terços — Can Soler",
    format: "Duo amb Eduard Navarro",
    dateStr: "Pendent de nova data (2026)",
    year: "2026",
    venue: "Can Soler (Espai Agrari i Natural)",
    city: "Mataró (Maresme)",
    status: "postponed",
    statusText: "Ajornat per pluja · Nova data properament",
    description:
      "Concert íntim d'arrel mediterrània en format duo amb Eduard Navarro (vents tradicionals i corda polsada). Actuació emmarcada en el festival de cultura i paisatge 2 Terços.",
    infoUrl: "https://www.mataro.cat/ca/actualitat/agenda/2026-miquel-gil-i-eduard-navarro",
    isFeatured: true,
  },
  {
    id: "kursaal-2024",
    title: "Miquel Gil Trio al Kursaal",
    format: "Trio (Nelo Alfonso & Gusmà Gil)",
    dateStr: "13 d'abril de 2024 · 20:00 h",
    year: "2024",
    venue: "Teatre Kursaal (Sala Petita)",
    city: "Manresa (Bages)",
    status: "past",
    statusText: "Completat amb èxit",
    description:
      "Presentació del repertori contemporani i peces clau de la trajectòria de Miquel Gil acompanyat per Nelo Alfonso als teclats i Gusmà Gil al baix elèctric.",
    infoUrl: "https://surtdecasa.cat/centre/agenda/2024/concert-de-miquel-gil-trio/224743",
  },
  {
    id: "principal-2024",
    title: "Estrena Oficial de «Viatger»",
    format: "Estrena amb Convidats",
    dateStr: "9 de març de 2024 · 20:30 h",
    year: "2024",
    venue: "Teatre Principal de València",
    city: "València",
    status: "past",
    statusText: "Entrades Esgotades",
    description:
      "Gran concert de presentació de l'àlbum «Viatger», dedicat a la memòria de Manolo Miralles. Una producció especial d'alta volada artística amb col·laboracions especials.",
    isFeatured: true,
  },
  {
    id: "etno-2023",
    title: "Inauguració Festival l'ETNO — 20 anys d'Orgànic",
    format: "Banda Completa (6 músics)",
    dateStr: "27 d'abril de 2023 · 21:00 h",
    year: "2023",
    venue: "L'ETNO (Centre Cultural La Beneficència)",
    city: "València",
    status: "past",
    statusText: "Concert Inaugural",
    description:
      "Concert de celebració de les dues dècades del disc fundacional «Orgànic», amb la formació de gala: Eduard Navarro, Toni Porcar, Nelo Alfonso, Gusmà Gil i José María Reillo.",
    infoUrl: "https://letno.dival.es/en/actividad/concert-or-spectacle/miquel-gil",
  },
  {
    id: "palau-2019",
    title: "Presentació «Geometries» al Palau",
    format: "Banda i Convidats Especials",
    dateStr: "15 de novembre de 2019 · 21:00 h",
    year: "2019",
    venue: "Palau de la Música de València",
    city: "València",
    status: "past",
    statusText: "Entrades Esgotades",
    description:
      "Estrena solemnement aclamada de l'àlbum «Geometries» amb la participació de Pep Gimeno «Botifarra», Borja Penalba, Mireia Vives i Marta Margaix.",
    infoUrl: "https://www.vilaweb.cat/noticies/pep-gimeno-botifarra-borja-penalba-mireia-vives-i-marta-margaix-convidats-de-miquel-gil-al-palau/",
  },
  {
    id: "nus-tour",
    title: "Gira «Nus» amb Botifarra",
    format: "Duo amb Pep Gimeno «Botifarra»",
    dateStr: "2015 — 2018 (Més de 50 concerts)",
    year: "2015",
    venue: "Auditoris i teatres arreu del territori",
    city: "País Valencià i Catalunya",
    status: "past",
    statusText: "Gira Històrica",
    description:
      "Troba íntima i despullada entre dos cims del cant popular valencià. Només veus, guitarra acústica i xicotetes percussions tradicionals.",
  },
];

export default function AgendaClient() {
  const [activeFilter, setActiveFilter] = useState<"all" | "upcoming" | "past">("all");

  const filteredConcerts = CONCERTS.filter((c) => {
    if (activeFilter === "upcoming") return c.status === "upcoming" || c.status === "postponed";
    if (activeFilter === "past") return c.status === "past";
    return true;
  });

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
              Totes les dates ({CONCERTS.length})
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
          LLISTAT DE CONCERTS
          ============================================================ */}
      <section className="agenda-concerts-section">
        <div className="agenda-concerts-inner">
          <div className="agenda-concerts-grid">
            {filteredConcerts.map((concert) => {
              const isPostponed = concert.status === "postponed";
              return (
                <article
                  key={concert.id}
                  className={`agenda-card ${concert.isFeatured ? "is-featured" : ""} ${
                    isPostponed ? "is-postponed" : ""
                  }`}
                >
                  <div className="agenda-card-header">
                    <div className="agenda-card-date-badge">
                      <span className="agenda-card-year">{concert.year}</span>
                      <span className={`agenda-card-status-pill status-${concert.status}`}>
                        {concert.statusText}
                      </span>
                    </div>
                    <span className="agenda-card-format-tag">{concert.format}</span>
                  </div>

                  <h2 className="agenda-card-title">{concert.title}</h2>

                  <div className="agenda-card-location">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
                      <circle cx="12" cy="10" r="3" />
                    </svg>
                    <span>
                      <strong>{concert.venue}</strong> — {concert.city}
                    </span>
                  </div>

                  <div className="agenda-card-schedule">
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                      <circle cx="12" cy="12" r="10" />
                      <polyline points="12 6 12 12 16 14" />
                    </svg>
                    <span>{concert.dateStr}</span>
                  </div>

                  <p className="agenda-card-desc">{concert.description}</p>

                  <div className="agenda-card-actions">
                    {concert.infoUrl && (
                      <a
                        href={concert.infoUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="agenda-btn agenda-btn--secondary"
                      >
                        Més informació
                      </a>
                    )}
                    <Link
                      href="/contractacio"
                      className="agenda-btn agenda-btn--primary"
                    >
                      Fitxa artística i rider
                    </Link>
                  </div>
                </article>
              );
            })}
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
