"use client";

import React, { useRef } from "react";
import ExpandingStrip from "@/components/ExpandingStrip";
import { BlockReveal, AnimatedTitle } from "@/components/TextAnimations";
import { BIO_SECTIONS } from "./bioData";
import { siteKeyMessage, chronologyFites } from "@/lib/site";
import "./biografia.css";

const FEATURED_VENUES = [
  {
    name: "Palau de la Música",
    city: "València",
    territory: "País Valencià",
    type: "Auditori Simfònic & Grans Concerts",
  },
  {
    name: "Teatre Principal",
    city: "València",
    territory: "País Valencià",
    type: "Teatre Històric · Estrena de Viatger",
  },
  {
    name: "Barnasants",
    city: "Barcelona",
    territory: "Catalunya",
    type: "Festival de Cançó d'Autor",
  },
  {
    name: "Tradicionàrius (C.A.T.)",
    city: "Barcelona",
    territory: "Catalunya",
    type: "Festival Folk Internacional",
  },
  {
    name: "Festival Strenes",
    city: "Girona",
    territory: "Catalunya",
    type: "Festival de Grans Estrenes",
  },
  {
    name: "Fira Mediterrània",
    city: "Manresa",
    territory: "Catalunya",
    type: "Mercat d'Arrel i Projecció Internacional",
  },
  {
    name: "Glatt & Verkehrt",
    city: "Krems an der Donau",
    territory: "Àustria",
    type: "Festival Europeu de World Music",
  },
  {
    name: "FIL de Guadalajara",
    city: "Guadalajara",
    territory: "Mèxic",
    type: "Institut Ramon Llull & Projecció Americana",
  },
];

export default function BiografiaClient() {
  const chronoRef = useRef<HTMLElement>(null);

  const scrollToChronology = () => {
    chronoRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  return (
    <main className="bio-page">
      {/* 1. HERO HEADER */}
      <div className="bio-container">
        <header className="biografia-hero">
          <BlockReveal color="#FF0000" direction="lr" delay={100} duration={650}>
            <h1 className="biografia-hero__title">
              Miquel Gil: el cantador que no deixa d'explorar.
            </h1>
          </BlockReveal>

          <BlockReveal color="#111211" direction="lr" delay={250} duration={700}>
            <p className="biografia-hero__lead">
              {siteKeyMessage.tagline}. Des de la fundació d'Al Tall el 1975 fins a l'estrena de <em>Viatger</em> (2024), 
              mig segle d'arrel valenciana, poesia contemporània i exploració sonora sense repetir mai fórmules.
            </p>
          </BlockReveal>
        </header>
      </div>

      {/* 2. SECCIÓ EXPANDING STRIP (100% FULLWIDTH EDGE-TO-EDGE) */}
      <section className="bio-strip-fullwidth" aria-label="Les cinc grans etapes biogràfiques">
        <div className="bio-strip-fullwidth__header">
          <AnimatedTitle
            text="CINC POSICIONS, UNA VIDA DE MÚSICA"
            color="#FFFFFF"
            className="bio-strip-header__title"
          />
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
            <BlockReveal color="#FF0000" direction="lr" delay={150} duration={700}>
              <blockquote className="bio-editorial__big-quote">
                «Quan Miquel Gil canta és la terra mateixa que s’expressa.»
              </blockquote>
            </BlockReveal>
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

        {/* CRONOLOGIA DE FITES HISTÒRIQUES (18 FITES EN FILERA CONTINUA) */}
        <section
          id="cronologia"
          ref={chronoRef}
          className="bio-chrono-section"
          aria-label="Cronologia històrica"
        >
          <div className="bio-chrono-header">
            <span className="bio-chrono__kicker">Arxiu Històric</span>
            <AnimatedTitle
              text="CRONOLOGIA: DE CATARROJA A L'ACTUALITAT"
              color="#FFFFFF"
              className="bio-chrono__title"
            />
            <p className="bio-chrono__desc">
              Totes les fites clau que han marcat la trajectòria professional i humana de Miquel Gil (1956 — 2026).
            </p>
          </div>

          <div className="bio-chrono__timeline">
            {chronologyFites.map((fita, index) => (
              <div key={`${fita.year}-${index}`} className="chrono-row">
                <span className="chrono-row__year">{fita.year}</span>
                <span className="chrono-row__text">{fita.text}</span>
              </div>
            ))}
          </div>
        </section>

        {/* ESCENARIS I FESTIVALS DESTACATS (REDISEÑAT) */}
        <section className="bio-venues-section" aria-label="Escenaris i festivals internacionals">
          <div className="bio-venues__header">
            <span className="bio-venues__kicker">Circuits & Directes</span>
            <AnimatedTitle
              text="PRINCIPALS ESCENARIS I FESTIVALS INTERNACIONALS"
              color="#FFFFFF"
              className="bio-venues__title"
            />
            <p className="bio-venues__subtitle">
              De les grans sales simfòniques i teatres emblemàtics del país a referents internacionals de la world music a Europa i Amèrica.
            </p>
          </div>

          <div className="bio-venues__grid">
            {FEATURED_VENUES.map((item) => (
              <div key={item.name} className="bio-venue-card">
                <div className="bio-venue-card__top">
                  <span className="bio-venue-card__territory">{item.territory}</span>
                  <span className="bio-venue-card__city">{item.city}</span>
                </div>
                <h3 className="bio-venue-card__name">{item.name}</h3>
                <span className="bio-venue-card__type">{item.type}</span>
              </div>
            ))}
          </div>
        </section>
      </div>
    </main>
  );
}
