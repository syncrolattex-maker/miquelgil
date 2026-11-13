"use client";

import React, { useEffect, useRef } from "react";
import Link from "next/link";
import gsap from "gsap";
import A24Nav from "@/components/A24Nav";
import ScrollPathJourney from "@/components/ScrollPathJourney";
import {
  siteKeyMessage,
  biographyIntro,
} from "@/lib/site";
import { initDissolve } from "../discografia/[slug]/dissolveEngine";
import "./biografia.css";

const ARTISTIC_PILLARS = [
  {
    num: "01",
    title: "Tradició Oral Mediterrània",
    desc: "Jotes, albaes, cants de batre, fandangos i romanços apresos des de l'escola fundacional d'Al Tall i projectats cap al segle XXI.",
  },
  {
    num: "02",
    title: "Experimentació i Fusió Sonora",
    desc: "Pioner amb Terminal Sur en l'ús de sintetitzadors, samplers i loops combinats amb llaüts, bouzoukis, guitarrons i percussions d'arrel.",
  },
  {
    num: "03",
    title: "Poesia Contemporània",
    desc: "Musicalització de grans veus líriques com Vicent Andrés Estellés, Enric Casasses, Ramon Guillem, Teresa Pasqual, Imma Màñez i Mario Benedetti.",
  },
  {
    num: "04",
    title: "Projecció Internacional",
    desc: "Presència destacada a la World Music Charts Europe (Top 5 amb Katà), Premis Ovidi Montllor i gires per Europa, el Magrib i Amèrica.",
  },
];

export default function BiografiaClient() {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const journeyWrapRef = useRef<HTMLElement>(null);

  // ============================================================================
  // 1. ANIMACIÓ D'ENTRADA EN CORTINA SINCRONITZADA (DE DALT A BAIX)
  // ============================================================================
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const heroInfo = heroRef.current?.querySelector<HTMLElement>(".bio-hero__info");
    const heroTitle = heroInfo?.querySelector<HTMLElement>(".bio-hero__title");
    const heroCredits = heroInfo?.querySelector<HTMLElement>(".bio-hero__credits");
    const heroMetaItems = heroInfo?.querySelectorAll<HTMLElement>(".bio-metadata__item");
    const heroDividers = heroInfo?.querySelectorAll<HTMLElement>(".divider-horizontal");
    const ctaWrap = heroRef.current?.querySelector<HTMLElement>(".bio-hero__cta-wrap");
    const ctaDividers = ctaWrap?.querySelectorAll<HTMLElement>(":scope > .divider-horizontal");
    const ctaCrosses = ctaWrap?.querySelectorAll<HTMLElement>(".plus");
    const buttons = heroRef.current?.querySelectorAll<HTMLElement>('[data-reveal="btn"]');

    if (prefersReducedMotion) {
      if (buttons) {
        buttons.forEach((btn) => {
          const dividers = btn.querySelectorAll<HTMLElement>(".btn__divider");
          const text = btn.querySelector<HTMLElement>(".btn__p");
          gsap.set(dividers, { scaleX: 1 });
          if (text) gsap.set(text, { yPercent: 0 });
        });
      }
      return;
    }

    const entranceTl = gsap.timeline({ defaults: { ease: "power3.out" } });

    // 1. Títol emergeix de baix cap a dalt
    if (heroTitle) {
      entranceTl.fromTo(
        heroTitle,
        { opacity: 0, y: 35 },
        { opacity: 1, y: 0, duration: 0.85 },
        0.05
      );
    }

    // 2. Primera línia horitzontal es desplega d'esquerra a dreta
    if (heroDividers && heroDividers[0]) {
      entranceTl.fromTo(
        heroDividers[0],
        { scaleX: 0, transformOrigin: "left center" },
        { scaleX: 1, duration: 0.75 },
        0.25
      );
    }

    // 3. Subtítols i crèdits emergeixen de baix cap a dalt
    if (heroCredits) {
      entranceTl.fromTo(
        heroCredits,
        { opacity: 0, y: 25 },
        { opacity: 1, y: 0, duration: 0.7 },
        0.45
      );
    }

    // 4. Segona línia horitzontal es desplega d'esquerra a dreta
    if (heroDividers && heroDividers[1]) {
      entranceTl.fromTo(
        heroDividers[1],
        { scaleX: 0, transformOrigin: "left center" },
        { scaleX: 1, duration: 0.75 },
        0.65
      );
    }

    // 5. Metadades tabulars en cascada de baix cap a dalt
    if (heroMetaItems && heroMetaItems.length) {
      entranceTl.fromTo(
        heroMetaItems,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.65, stagger: 0.08 },
        0.8
      );
    }

    // 6. Línies de tancament dels CTAs i creus vectorials
    if (ctaDividers && ctaDividers.length) {
      entranceTl.fromTo(
        ctaDividers,
        { scaleX: 0, transformOrigin: "left center" },
        { scaleX: 1, duration: 0.75, stagger: 0.1 },
        1.0
      );
    }

    if (ctaCrosses && ctaCrosses.length) {
      entranceTl.fromTo(
        ctaCrosses,
        { opacity: 0, scale: 0.5 },
        { opacity: 1, scale: 1, duration: 0.5, stagger: 0.05 },
        1.05
      );
    }

    // 7. Botons d'acció A24
    if (buttons && buttons.length) {
      const ctaStart = 1.15;
      const btnStagger = 0.09;
      const duration = 0.7;
      const textDelay = 0.04;

      buttons.forEach((btn, idx) => {
        const startTime = ctaStart + idx * btnStagger;
        const dividers = btn.querySelectorAll<HTMLElement>(".btn__divider");
        const text = btn.querySelector<HTMLElement>(".btn__p");

        gsap.set(dividers, { scaleX: 0, transformOrigin: "left center" });
        if (text) gsap.set(text, { yPercent: 120 });

        gsap.to(dividers, {
          scaleX: 1,
          duration,
          ease: "power3.out",
          delay: startTime,
          overwrite: "auto",
        });

        if (text) {
          gsap.to(text, {
            yPercent: 0,
            duration,
            ease: "power3.out",
            delay: startTime + textDelay,
            overwrite: "auto",
          });
        }
      });
    }
  }, []);

  // ============================================================================
  // 2. MOTOR DE DISSOLUCIÓ LÍQUIDA A24 (MARCHING SQUARES)
  // ============================================================================
  useEffect(() => {
    if (!containerRef.current) return;
    initDissolve(containerRef.current);
  }, []);

  const scrollToChapters = () => {
    journeyWrapRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const scrollToChrono = () => {
    journeyWrapRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const bioParagraphs = siteKeyMessage.shortBio250.split("\n\n");

  return (
    <div ref={containerRef} className="bio-a24-page" data-bio-hero-init="true">
      {/* MENÚ DE NAVEGACIÓ A24 INTEGRAT */}
      <A24Nav currentSection="/biografia/" theme="dark" />

      {/* ============================================================
          1 & 2. TRACK DE REVELACIÓ AMB SEPARADOR LÍQUID A24
         ============================================================ */}
      <div data-dissolve-track="" className="reveal-track">
        {/* 1. HERO BIOGRÀFIC (CORTINA BLANCA SUPERIOR) */}
        <section id="bio_hero" ref={heroRef} data-dissolve="" className="bio-hero">
          <div className="bio-hero__content">
            <div className="bio-hero__info">
              {/* TÍTOL MONUMENTAL EN MAJÚSCULES AMB PP EIKO */}
              <div className="bio-hero__title">
                <h1 className="heading-l">MIQUEL GIL</h1>
              </div>

              {/* LÍNIA SEPARADORA 1 (100VW) */}
              <div className="divider-horizontal my-4" />

              {/* CRÈDITS I DEFINICIÓ ARTÍSTICA */}
              <div className="bio-hero__credits">
                <span className="subheading-xs">ORIGEN</span>
                <span className="paragraph-m font-medium">Catarroja (Horta Sud, València)</span>

                <span className="subheading-xs ml-4">FUNDACIÓ</span>
                <span className="paragraph-m font-medium">Al Tall (1975) · Terminal Sur (1988)</span>

                <span className="subheading-xs ml-4"> IDENTITAT</span>
                <span className="paragraph-m font-medium">
                  Cantador contemporani, compositor i productor
                </span>

                <span className="subheading-xs ml-4">PREMIS</span>
                <span className="paragraph-m font-medium">
                  World Music Charts Europe · Premis Ovidi Montllor
                </span>
              </div>

              {/* LÍNIA SEPARADORA 2 (100VW) */}
              <div className="divider-horizontal my-4" />

              {/* METADADES TABULARS EN QUADRÍCULA */}
              <div className="bio-hero__metadata">
                <div className="bio-metadata__item">
                  <span className="subheading-xs">NAIXEMENT</span>
                  <div className="bio-metadata__content">
                    <span className="paragraph-m font-medium">Catarroja, 1956</span>
                    <span className="subheading-xs">Horta Sud</span>
                  </div>
                </div>

                <div className="bio-metadata__item">
                  <span className="subheading-xs">TRAJECTÒRIA</span>
                  <div className="bio-metadata__content">
                    <span className="paragraph-m font-medium">Més de 50 anys d&apos;escenaris</span>
                    <span className="subheading-xs">1973 — 2026</span>
                  </div>
                </div>

                <div className="bio-metadata__item">
                  <span className="subheading-xs">OBRA ENREGISTRADA</span>
                  <div className="bio-metadata__content">
                    <span className="paragraph-m font-medium">23 discos propis</span>
                    <span className="subheading-xs">+100 col·laboracions</span>
                  </div>
                </div>

                <div className="bio-metadata__item">
                  <span className="subheading-xs">DARRERA PRODUCCIÓ</span>
                  <div className="bio-metadata__content">
                    <span className="paragraph-m font-medium">Viatger (Temps Record)</span>
                    <span className="subheading-xs">2024 — 2026</span>
                  </div>
                </div>
              </div>
            </div>

            {/* CONTENIDOR FULLWIDTH PER A BOTONS I CREUS VECTORIALS */}
            <div className="bio-hero__cta-wrap">
              <div className="divider-horizontal" style={{ position: "absolute", top: 0 }} />

              <div className="plus is--tl">
                <div className="plus-stroke is--hor" />
                <div className="plus-stroke is--ver" />
              </div>
              <div className="plus is--tr">
                <div className="plus-stroke is--hor" />
                <div className="plus-stroke is--ver" />
              </div>
              <div className="plus is--bl">
                <div className="plus-stroke is--hor" />
                <div className="plus-stroke is--ver" />
              </div>
              <div className="plus is--br">
                <div className="plus-stroke is--hor" />
                <div className="plus-stroke is--ver" />
              </div>

              <div className="bio-hero__cta">
                <button
                  type="button"
                  data-reveal="btn"
                  onClick={scrollToChapters}
                  className="btn a24-btn"
                >
                  <div className="btn__divider" />
                  <span className="btn__p-mask">
                    <span
                      className="btn__p"
                      data-hover-inner
                      data-text="LES 5 ETAPES CAPITALS ↓"
                    >
                      <span>LES 5 ETAPES CAPITALS ↓</span>
                    </span>
                  </span>
                  <div className="btn__divider" />
                </button>

                <button
                  type="button"
                  data-reveal="btn"
                  onClick={scrollToChrono}
                  className="btn a24-btn"
                >
                  <div className="btn__divider" />
                  <span className="btn__p-mask">
                    <span
                      className="btn__p"
                      data-hover-inner
                      data-text="CRONOLOGIA 1956—2026 ↓"
                    >
                      <span>CRONOLOGIA 1956—2026 ↓</span>
                    </span>
                  </span>
                  <div className="btn__divider" />
                </button>

                <Link
                  href="/discografia/"
                  data-reveal="btn"
                  className="btn a24-btn"
                >
                  <div className="btn__divider" />
                  <span className="btn__p-mask">
                    <span
                      className="btn__p"
                      data-hover-inner
                      data-text="EXPLORAR DISCOGRAFIA ↗"
                    >
                      <span>EXPLORAR DISCOGRAFIA ↗</span>
                    </span>
                  </span>
                  <div className="btn__divider" />
                </Link>
              </div>

              <div className="divider-horizontal" style={{ position: "absolute", bottom: 0 }} />
            </div>
          </div>
        </section>

        {/* 2. SECCIÓ DE RETRAT A PANTALLA COMPLETA (100VH VISIBLE SOTA LA CORTINA LÍQUIDA) */}
        <section data-theme-change="nav:base" className="bio-portrait-bleed theme-dark">
          <div data-dissolve-bleed="" className="bio-portrait-bleed__vh">
            <img
              src="/images/miquel-gil-juan-miguel-morales-14-scaled.jpg"
              alt="Miquel Gil en directe — Fotografia de Juan Miguel Morales"
              className="bio-portrait-bleed__bg"
            />
            <div className="bio-portrait-bleed__overlay" />

            <div className="bio-portrait-bleed__content">
              <span className="subheading-xs" style={{ color: "rgba(255, 255, 255, 0.7)" }}>
                {siteKeyMessage.motto.toUpperCase()}
              </span>
              <blockquote className="bio-portrait-quote">
                “Quan Miquel Gil canta és la terra mateixa que s’expressa: mig segle transformant la memòria oral mediterrània en llenguatge viu del present.”
              </blockquote>
              <span className="subheading-xs" style={{ color: "rgba(255, 255, 255, 0.55)" }}>
                {siteKeyMessage.tagline}
              </span>

              <div style={{ marginTop: "1rem" }}>
                <button
                  type="button"
                  onClick={scrollToChapters}
                  className="btn a24-btn"
                >
                  <div className="btn__divider" />
                  <span className="btn__p-mask">
                    <span
                      className="btn__p"
                      data-hover-inner
                      data-text="LLEGIR BIOGRAFIA COMPLETA ↓"
                    >
                      <span>LLEGIR BIOGRAFIA COMPLETA ↓</span>
                    </span>
                  </span>
                  <div className="btn__divider" />
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>

      {/* ============================================================
          3. SÍNTESI BIOGRÀFICA I PILARS ARTÍSTICS
         ============================================================ */}
      <section className="bio-synthesis">
        <div className="bio-synthesis__grid">
          {/* Columna Esquerra: Assaig Biogràfic */}
          <div className="bio-synthesis__left">
            <p className="paragraph-xl" style={{ margin: 0 }}>
              {biographyIntro}
            </p>
            <div className="bio-synthesis__essay">
              {bioParagraphs.map((para, i) => (
                <p key={i} className="paragraph-l" style={{ margin: 0 }}>
                  {para}
                </p>
              ))}
            </div>
          </div>

          {/* Columna Dreta: Retrat d'Arxiu i Pilars */}
          <div className="bio-synthesis__right">
            <div>
              <div className="bio-portrait-card">
                <img
                  src="/images/miquel-gil-juan-miguel-morales-8-scaled.jpg"
                  alt="Retrat de Miquel Gil per Juan Miguel Morales"
                  className="bio-portrait-card__img"
                />
              </div>
              <div className="bio-portrait-card__caption">
                <span className="subheading-xs">RETRAT D&apos;ARXIU · ÈPOCA ORGÀNIC</span>
                <span className="paragraph-m">Foto: Juan Miguel Morales</span>
              </div>
            </div>

            <div className="bio-pillars-list">
              <div className="divider-local" />
              {ARTISTIC_PILLARS.map((pillar) => (
                <div key={pillar.num} className="bio-pillar-item">
                  <span className="bio-pillar-item__num">{pillar.num}</span>
                  <div className="bio-pillar-item__body">
                    <h3 className="bio-pillar-item__title">{pillar.title}</h3>
                    <p className="paragraph-m" style={{ margin: 0, color: "rgba(17,17,17,0.75)" }}>
                      {pillar.desc}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          4. GUIA INTERACTIVA D'ETAPES I CRONOLOGIA AMB PUNTER (1956 — 2026)
         ============================================================ */}
      <section ref={journeyWrapRef} aria-label="Guia interactiva d'etapes i cronologia">
        <ScrollPathJourney />
      </section>

      {/* ============================================================
          5. PEU EDITORIAL A24 — SEGÜENT PAS (DISCOGRAFIA & CONTRACTACIÓ)
         ============================================================ */}
      <footer className="bio-next-footer">
        <div className="divider-horizontal" />

        <div className="bio-next-footer__inner" style={{ position: "relative" }}>
          <div className="plus is--tl">
            <div className="plus-stroke is--hor" />
            <div className="plus-stroke is--ver" />
          </div>
          <div className="plus is--tr">
            <div className="plus-stroke is--hor" />
            <div className="plus-stroke is--ver" />
          </div>
          <div className="plus is--bl">
            <div className="plus-stroke is--hor" />
            <div className="plus-stroke is--ver" />
          </div>
          <div className="plus is--br">
            <div className="plus-stroke is--hor" />
            <div className="plus-stroke is--ver" />
          </div>

          <h2 className="heading-l">DISCOGRAFIA OFICIAL</h2>
          <p className="paragraph-m" style={{ maxWidth: "48ch", margin: 0 }}>
            Recorre les 10 produccions essencials de Miquel Gil en edició interactiva: des de Viajero (1988) i Orgànic (2001) fins a Viatger (2024).
          </p>

          <div className="bio-hero__cta" style={{ marginTop: "0.5rem" }}>
            <Link href="/discografia/" className="btn a24-btn">
              <div className="btn__divider" />
              <span className="btn__p-mask">
                <span
                  className="btn__p"
                  data-hover-inner
                  data-text="OBRIR CATÀLEG DISCOGRÀFIC ↗"
                >
                  <span>OBRIR CATÀLEG DISCOGRÀFIC ↗</span>
                </span>
              </span>
              <div className="btn__divider" />
            </Link>

            <Link href="/contractacio/" className="btn a24-btn">
              <div className="btn__divider" />
              <span className="btn__p-mask">
                <span
                  className="btn__p"
                  data-hover-inner
                  data-text="CONTRACTACIÓ & MANAGEMENT ↗"
                >
                  <span>CONTRACTACIÓ & MANAGEMENT ↗</span>
                </span>
              </span>
              <div className="btn__divider" />
            </Link>
          </div>
        </div>

        <div className="divider-horizontal" />
      </footer>
    </div>
  );
}
