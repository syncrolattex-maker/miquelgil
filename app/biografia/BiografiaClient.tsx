"use client";

import React, { useState, useRef, useEffect } from "react";
import Link from "next/link";
import ExpandingStrip from "@/components/ExpandingStrip";
import { BIO_SECTIONS } from "./bioData";
import { siteKeyMessage, chronologyFites, bookingInfo } from "@/lib/site";
import "./biografia.css";

export default function BiografiaClient() {
  const [chronoFilter, setChronoFilter] = useState<string>("all");
  const chronoRef = useRef<HTMLElement>(null);

  const scrollToChronology = () => {
    chronoRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  const filteredChrono = chronologyFites.filter((fita) => {
    if (chronoFilter === "all") return true;

    // Extreure l'any com a número
    const match = fita.year.match(/\d{4}/);
    if (!match) return true;
    const year = parseInt(match[0], 10);

    if (chronoFilter === "altall") return year <= 1985;
    if (chronoFilter === "transicio") return year >= 1986 && year <= 2000;
    if (chronoFilter === "organic") return year >= 2001 && year <= 2015;
    if (chronoFilter === "recent") return year >= 2016;
    return true;
  });

  return (
    <main className="bio-page">
      {/* 1. HERO HEADER (Dins del contenidor centrat) */}
      <div className="bio-container">
        <header className="biografia-hero">
          <div className="biografia-hero__kicker">
            <span className="biografia-hero__kicker-dot" />
            <span>Trajectòria Oficial · Mig Segle d'Arrel</span>
          </div>

          <h1 className="biografia-hero__title">
            Miquel Gil: el cantador que no deixa d'explorar.
          </h1>

          <p className="biografia-hero__lead">
            {siteKeyMessage.tagline}. Des de la fundació d'Al Tall el 1975 fins a l'estrena de <em>Viatger</em> (2024), 
            mig segle d'arrel valenciana, poesia contemporània i exploració sonora sense repetir mai fórmules.
          </p>

          <div className="biografia-hero__stats">
            <div className="bio-stat">
              <span className="bio-stat__val">50+</span>
              <span className="bio-stat__label">Anys de Trajectòria</span>
            </div>
            <div className="bio-stat">
              <span className="bio-stat__val">25</span>
              <span className="bio-stat__label">Discos Signats & Col·laboracions</span>
            </div>
            <div className="bio-stat">
              <span className="bio-stat__val">5</span>
              <span className="bio-stat__label">Grans Etapes Creatives</span>
            </div>
            <div className="bio-stat">
              <span className="bio-stat__val">#05</span>
              <span className="bio-stat__label">Top World Music Charts Europe</span>
            </div>
          </div>
        </header>
      </div>

      {/* 2. SECCIÓ EXPANDING STRIP (100% FULLWIDTH EDGE-TO-EDGE) */}
      <section className="bio-strip-fullwidth" aria-label="Les cinc grans etapes biogràfiques">
        <div className="bio-strip-fullwidth__header">
          <h2 className="bio-strip-header__title">Cinc Posicions, Una Vida de Música</h2>
          <span className="bio-strip-header__desc">
            Explora les cinc etapes capitals de Miquel Gil passant el cursor o seleccionant cada panell.
          </span>
        </div>

        <div className="bio-strip-fullwidth__strip-wrap">
          <ExpandingStrip
            sections={BIO_SECTIONS}
            initialIndex={0}
            onOpenChronology={scrollToChronology}
          />
        </div>
      </section>

      {/* 3. RESTA DE CONTINGUTS (Dins del contenidor centrat) */}
      <div className="bio-container">
        {/* SÍNTESI EDITORIAL OFICIAL (250 PARAULES DEL GUIÓ) */}
        <section className="bio-editorial-section" aria-label="Síntesi de trajectòria">
          <div className="bio-editorial__quote-box">
            <span className="bio-editorial__badge">Veu i Territori</span>
            <blockquote className="bio-editorial__big-quote">
              «Quan Miquel Gil canta és la terra mateixa que s’expressa.»
            </blockquote>
            <span className="bio-editorial__author">
              Catarroja (Horta Sud, València) · 1956
            </span>
          </div>

          <div className="bio-editorial__text-box">
            <p className="bio-editorial__p-lead">
              Miquel Gil és una de les veus de referència de la música d'arrel mediterrània, 
              i aquest espai conta mig segle de carrera guiada per una pulsió innegociable: la tradició com a 
              matèria viva que sempre camina cap endavant.
            </p>
            <p>
              Va cofundar Al Tall el 1975 amb Vicent Torrent i Manolo Miralles, peça clau en la recuperació 
              de la memòria tradicional valenciana en plena clandestinitat i transició democràtica. 
              A mitjan anys huitanta encetà el seu camí en solitari, avançant-se a la world music amb 
              Terminal Sur i consolidant a partir de 1997 una de les carreres més respectades i inconfusibles 
              dels Països Catalans.
            </p>
            <p>
              Amb àlbums d'impacte continental com <em>Orgànic</em> (2001) o <em>Katà</em> (2004), 
              ha combinat la transmissió oral (jotes, fandangos, albaes) amb el jazz, l'electrònica i 
              la poesia d'Enric Casasses o Vicent Andrés Estellés. Guardonat als Premis Ovidi i aclamat per la crítica, 
              el seu disc <em>Viatger</em> (2024) sintetitza la saviesa d'un cantador que mai no ha deixat de cercar.
            </p>
          </div>
        </section>

        {/* CRONOLOGIA DE FITES HISTÒRIQUES (18 FITES) */}
        <section
          id="cronologia"
          ref={chronoRef}
          className="bio-chrono-section"
          aria-label="Cronologia històrica"
        >
          <div className="bio-chrono-header">
            <span className="bio-chrono__kicker">Arxiu Històric</span>
            <h2 className="bio-chrono__title">Cronologia: de Catarroja a l'Actualitat</h2>
            <p className="bio-chrono__desc">
              Totes les fites clau que han marcat la trajectòria professional i humana de Miquel Gil (1956 — 2026).
            </p>

            <div className="bio-chrono__filters" role="group" aria-label="Filtrar cronologia per etapes">
              <button
                type="button"
                className={`chrono-filter-btn ${chronoFilter === "all" ? "is-active" : ""}`}
                onClick={() => setChronoFilter("all")}
              >
                Totes les fites ({chronologyFites.length})
              </button>
              <button
                type="button"
                className={`chrono-filter-btn ${chronoFilter === "altall" ? "is-active" : ""}`}
                onClick={() => setChronoFilter("altall")}
              >
                1956—1985 (Al Tall)
              </button>
              <button
                type="button"
                className={`chrono-filter-btn ${chronoFilter === "transicio" ? "is-active" : ""}`}
                onClick={() => setChronoFilter("transicio")}
              >
                1986—2000 (Transició & Terminal Sur)
              </button>
              <button
                type="button"
                className={`chrono-filter-btn ${chronoFilter === "organic" ? "is-active" : ""}`}
                onClick={() => setChronoFilter("organic")}
              >
                2001—2015 (Orgànic & Katà)
              </button>
              <button
                type="button"
                className={`chrono-filter-btn ${chronoFilter === "recent" ? "is-active" : ""}`}
                onClick={() => setChronoFilter("recent")}
              >
                2016—2026 (Geometries & Viatger)
              </button>
            </div>
          </div>

          <div className="bio-chrono__timeline">
            {filteredChrono.map((fita, index) => (
              <div key={`${fita.year}-${index}`} className="chrono-row">
                <span className="chrono-row__year">{fita.year}</span>
                <span className="chrono-row__text">{fita.text}</span>
              </div>
            ))}
          </div>
        </section>

        {/* RECINTES I FESTIVALS DESTACATS */}
        <section className="bio-venues-section" aria-label="Escenaris destacats">
          <span className="bio-venues__label">Ha actuat als principals escenaris i festivals internacionals:</span>
          <div className="bio-venues__grid">
            {bookingInfo.featuredVenues.map((venue) => (
              <span key={venue} className="venue-chip">
                {venue}
              </span>
            ))}
          </div>
        </section>

        {/* ACCIONS I PÀGINES RELACIONADES */}
        <section className="bio-cta-section" aria-label="Explora més continguts">
          <Link href="/discografia" className="bio-cta-card">
            <span className="bio-cta-card__num">01 / MÚSICA</span>
            <h3 className="bio-cta-card__title">
              <span>Discografia</span>
              <span>→</span>
            </h3>
            <p className="bio-cta-card__desc">
              Descobreix tots els àlbums, des d'Orgànic i Katà fins a Viatger (2024), lletres i escolta incrustada.
            </p>
          </Link>

          <Link href="/agenda" className="bio-cta-card">
            <span className="bio-cta-card__num">02 / DIRECTES</span>
            <h3 className="bio-cta-card__title">
              <span>Agenda de Concerts</span>
              <span>→</span>
            </h3>
            <p className="bio-cta-card__desc">
              Consulta les pròximes dates en directe i l'històric d'actuacions arreu del territori.
            </p>
          </Link>

          <Link href="/contractacio" className="bio-cta-card">
            <span className="bio-cta-card__num">03 / MANAGEMENT</span>
            <h3 className="bio-cta-card__title">
              <span>Contractació & Riders</span>
              <span>→</span>
            </h3>
            <p className="bio-cta-card__desc">
              Els 5 formats en directe (Duo, Trio, Banda, Nus, Estrena), riders tècnics descarregables i contacte oficial.
            </p>
          </Link>
        </section>
      </div>
    </main>
  );
}
