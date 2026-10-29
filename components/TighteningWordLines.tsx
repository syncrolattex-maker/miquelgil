"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./TighteningWordLines.css";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export default function TighteningWordLines() {
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      const isMobile = window.innerWidth <= 768;
      const lines = containerRef.current?.querySelectorAll<HTMLElement>("[data-t097-line]");
      if (!lines) return;

      lines.forEach((line) => {
        const isQuote = line.classList.contains("t097_quote_line");
        const maxSpacing = isMobile
          ? isQuote
            ? "3.5vw"
            : "2.2vw"
          : isQuote
          ? "6.5vw"
          : "4.2vw";

        gsap.fromTo(
          line,
          {
            wordSpacing: maxSpacing,
            opacity: 0.35,
          },
          {
            wordSpacing: "0.06em",
            opacity: 1,
            ease: "power2.out",
            scrollTrigger: {
              trigger: line,
              start: "top 95%",
              end: "top 52%",
              scrub: 0.5,
              invalidateOnRefresh: true,
            },
          }
        );
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <section className="mwg_effect097" ref={containerRef} aria-label="Veu i Territori">
      {/* Top Header Row */}
      <div className="t097_header">
        <span className="t097_kicker_head">Veu i Territori</span>
        <span className="t097_author_head">Catarroja (Horta Sud, València) · 1956</span>
      </div>

      <div className="t097_content">
        {/* 1. CITACIÓ DESTACADA */}
        <div className="t097_block">
          <span className="t097_kicker">Cita d'autor</span>
          <div className="t097_quote_line" data-t097-line>
            «Quan Miquel Gil canta és
          </div>
          <div className="t097_quote_line" data-t097-line>
            la terra mateixa que s’expressa.»
          </div>
        </div>

        {/* 2. PARÀGRAF INTRODUCTORI LEAD */}
        <div className="t097_block">
          <div className="t097_body_line" data-t097-line>
            Miquel Gil és una de les veus de referència
          </div>
          <div className="t097_body_line" data-t097-line>
            de la música d'arrel mediterrània, i aquest espai conta
          </div>
          <div className="t097_body_line" data-t097-line>
            mig segle de carrera guiada per una pulsió innegociable:
          </div>
          <div className="t097_body_line" data-t097-line>
            la tradició com a matèria viva que sempre camina cap endavant.
          </div>
        </div>

        {/* 3. BLOC 1: DE LA CLANDESTINITAT A LA WORLD MUSIC */}
        <div className="t097_block">
          <span className="t097_kicker">1 — De la Clandestinitat a la World Music</span>
          <div className="t097_body_line" data-t097-line>
            Va cofundar Al Tall el 1975 amb Vicent Torrent
          </div>
          <div className="t097_body_line" data-t097-line>
            i Manolo Miralles, peça clau en la recuperació
          </div>
          <div className="t097_body_line" data-t097-line>
            de la memòria tradicional valenciana en plena clandestinitat
          </div>
          <div className="t097_body_line" data-t097-line>
            i transició democràtica. A mitjan anys huitanta encetà
          </div>
          <div className="t097_body_line" data-t097-line>
            el seu camí en solitari, avançant-se a la world music
          </div>
          <div className="t097_body_line" data-t097-line>
            amb Terminal Sur i consolidant una trajectòria inconfusible.
          </div>
        </div>

        {/* 4. BLOC 2: ARREL, JAZZ I POESIA VIVA */}
        <div className="t097_block">
          <span className="t097_kicker">2 — Arrel, Jazz i Poesia Viva</span>
          <div className="t097_body_line" data-t097-line>
            Amb àlbums d'impacte continental com <em>Orgànic</em> o <em>Katà</em>,
          </div>
          <div className="t097_body_line" data-t097-line>
            ha combinat la transmissió oral —jotes, fandangos, albaes—
          </div>
          <div className="t097_body_line" data-t097-line>
            amb el jazz, l'electrònica i la poesia contemporània
          </div>
          <div className="t097_body_line" data-t097-line>
            d'Enric Casasses o Vicent Andrés Estellés.
          </div>
          <div className="t097_body_line" data-t097-line>
            Guardonat als Premis Ovidi i aclamat per la crítica,
          </div>
          <div className="t097_body_line" data-t097-line>
            el seu disc <em>Viatger</em> sintetitza la saviesa d'un cantador
          </div>
          <div className="t097_body_line" data-t097-line>
            que mai no ha deixat de cercar.
          </div>
        </div>
      </div>
    </section>
  );
}
