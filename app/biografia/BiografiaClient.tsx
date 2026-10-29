"use client";

import React, { useRef } from "react";
import ExpandingStrip from "@/components/ExpandingStrip";
import RectangleTextReveal from "@/components/RectangleTextReveal";
import TighteningWordLines from "@/components/TighteningWordLines";
import ScrollPathJourney from "@/components/ScrollPathJourney";
import { BIO_SECTIONS } from "./bioData";
import { siteKeyMessage } from "@/lib/site";
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
          <RectangleTextReveal
            lines={[
              "Miquel Gil:",
              "el cantador que no deixa d'explorar."
            ]}
            color="#FF0000"
            direction="left"
            tag="h1"
            lineClassName="biografia-hero__title"
            immediate
            duration={0.9}
          />

          <RectangleTextReveal
            lines={[
              `${siteKeyMessage.tagline}.`,
              "Des de la fundació d'Al Tall el 1975 fins a l'estrena de Viatger (2024),",
              "mig segle d'arrel valenciana, poesia contemporània i exploració sonora sense repetir mai fórmules."
            ]}
            color="#222222"
            direction="left"
            tag="p"
            lineClassName="biografia-hero__lead"
            immediate
            delay={0.25}
            duration={0.8}
          />
        </header>
      </div>

      {/* 2. SECCIÓ EXPANDING STRIP (100% FULLWIDTH EDGE-TO-EDGE) */}
      <section className="bio-strip-fullwidth" aria-label="Les cinc grans etapes biogràfiques">
        <div className="bio-strip-fullwidth__header">
          <RectangleTextReveal
            lines={["CINC POSICIONS, UNA VIDA DE MÚSICA"]}
            color="#FF0000"
            direction="left"
            tag="h2"
            lineClassName="bio-strip-header__title"
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

      {/* 3. SÍNTESI EDITORIAL: TIGHTENING WORD LINES (MadeWithGSAP Tutorial 097) */}
      <TighteningWordLines />

      {/* 4. CRONOLOGIA HISTÒRICA: SCROLL PATH JOURNEY (GSAP Vault Storytelling) */}
      <div ref={chronoRef as React.RefObject<HTMLDivElement>}>
        <ScrollPathJourney />
      </div>

      {/* 5. RESTA DE CONTINGUTS (Dins del contenidor centrat) */}
      <div className="bio-container">
        {/* ESCENARIS I FESTIVALS DESTACATS (REDISEÑAT) */}
        <section className="bio-venues-section" aria-label="Escenaris i festivals internacionals">
          <div className="bio-venues__header">
            <span className="bio-venues__kicker">Circuits & Directes</span>
            <RectangleTextReveal
              lines={["PRINCIPALS ESCENARIS I FESTIVALS INTERNACIONALS"]}
              color="#FF0000"
              direction="left"
              tag="h2"
              lineClassName="bio-venues__title"
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
