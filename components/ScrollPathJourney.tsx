"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { chronologyFites } from "@/lib/site";
import "./ScrollPathJourney.css";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);
}

interface CheckpointData {
  year: string;
  badge: string;
  title: string;
  text: string;
  media: string;
  progress: number;
  pinX: string;
  pinY: string;
  side: "left" | "right";
}

const CHECKPOINTS: CheckpointData[] = [
  {
    year: "1956",
    badge: "1956 · Catarroja",
    title: "Bressol i primers passos",
    text: "Naix a Catarroja (Horta Sud, València), bressol d'arrel i de tradició musical valenciana.",
    media: "/images/07-1978-6.jpg",
    progress: 0.08,
    pinX: "26%",
    pinY: "9%",
    side: "right",
  },
  {
    year: "1971",
    badge: "h. 1971 · Prada",
    title: "Trobada amb Vicent Torrent",
    text: "Als 15 anys coneix Vicent Torrent a la Universitat Catalana d'Estiu de Prada; Torrent li proposa formar un grup.",
    media: "/images/trobada-vicent-torrent.png",
    progress: 0.17,
    pinX: "74%",
    pinY: "17%",
    side: "left",
  },
  {
    year: "1975",
    badge: "1975 · Al Tall",
    title: "Fundació en clandestinitat",
    text: "Funda Al Tall amb Vicent Torrent i Manolo Miralles, peça clau en la recuperació de la música tradicional valenciana.",
    media: "/images/07-1978-6.jpg",
    progress: 0.26,
    pinX: "26%",
    pinY: "25%",
    side: "right",
  },
  {
    year: "1986",
    badge: "1986 · Solitari",
    title: "Inici del camí propi",
    text: "Deixa Al Tall per continuar en solitari. Guanya els 'Encuentros de canción de autor para jóvenes intérpretes'.",
    media: "/images/miquel-gil-delange-detras.jpg",
    progress: 0.35,
    pinX: "74%",
    pinY: "34%",
    side: "left",
  },
  {
    year: "1988",
    badge: "1988 · Terminal Sur",
    title: "'Viajero' i world music",
    text: "Amb el grup Terminal Sur grava 'Viajero' (Plataforma Discos), obrint vies pioneres a la fusió mediterrània i el mestissatge.",
    media: "/images/TerminalSur.jpg",
    progress: 0.44,
    pinX: "26%",
    pinY: "43%",
    side: "right",
  },
  {
    year: "1997",
    badge: "1997 · Seminola",
    title: "'Buscando tu olor'",
    text: "Primer disc en solitari publicat amb el seu propi nom: Miquel Gil.",
    media: "/images/buscando-tu-olor-1997.jpg",
    progress: 0.53,
    pinX: "74%",
    pinY: "52%",
    side: "left",
  },
  {
    year: "2001",
    badge: "2001 · Orgànic",
    title: "El gran punt d'inflexió",
    text: "'Orgànic' (Sonifolk / Galileo MC): fita capital de l'arrel mediterrània contemporània i consagració internacional.",
    media: "/images/disco_7.jpg",
    progress: 0.62,
    pinX: "26%",
    pinY: "61%",
    side: "right",
  },
  {
    year: "2004",
    badge: "2004 · Katà",
    title: "World Music Charts Europe",
    text: "Entra al top dels charts europeus (núms. 8 i 5) i actua a la FIL de Guadalajara (Mèxic).",
    media: "/images/disco_6.png",
    progress: 0.71,
    pinX: "74%",
    pinY: "70%",
    side: "left",
  },
  {
    year: "2006",
    badge: "2006 · Eixos",
    title: "Premis Ovidi Montllor",
    text: "'Eixos' (producció de Borja Penalba). Gran guanyador en la primera edició dels Premis Ovidi.",
    media: "/images/disco_5.png",
    progress: 0.80,
    pinX: "26%",
    pinY: "79%",
    side: "right",
  },
  {
    year: "2019",
    badge: "2019 · Geometries",
    title: "Palau de la Música & À Punt",
    text: "'Geometries' (Temps Record), presentat al Palau de la Música. Conductor de 'Bambant per casa' a À Punt.",
    media: "/images/disco_2.png",
    progress: 0.89,
    pinX: "74%",
    pinY: "88%",
    side: "left",
  },
  {
    year: "2024–26",
    badge: "2024–2026 · Viatger",
    title: "Teatre Principal & Mig Segle",
    text: "Estrena de 'Viatger' en memòria de Manolo Miralles, single solidari per la DANA i continuïtat en directe arreu del territori.",
    media: "/images/MiquelGilViatger_Principal.webp",
    progress: 0.97,
    pinX: "50%",
    pinY: "96%",
    side: "left",
  },
];

export default function ScrollPathJourney() {
  const containerRef = useRef<HTMLDivElement>(null);
  const [showFullArchive, setShowFullArchive] = useState(false);

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      const isMobile = window.innerWidth <= 768;
      const pathSelector = isMobile
        ? '[data-journey-path="mobile"]'
        : '[data-journey-path="desktop"]';
      const progressSelector = isMobile
        ? '[data-journey-progress="mobile"]'
        : '[data-journey-progress="desktop"]';

      const motionPath = containerRef.current?.querySelector<SVGPathElement>(pathSelector);
      const progressBar = containerRef.current?.querySelector<SVGPathElement>(progressSelector);
      const marker = containerRef.current?.querySelector<HTMLElement>("[data-journey-marker]");
      const progressText = containerRef.current?.querySelector<HTMLElement>("[data-journey-progress-text]");
      const checkpointElements = containerRef.current?.querySelectorAll<HTMLElement>("[data-journey-checkpoint]");

      if (!motionPath || !progressBar || !marker) return;

      const pathLength = motionPath.getTotalLength();
      gsap.set(progressBar, { strokeDasharray: pathLength, strokeDashoffset: pathLength });

      const tl = gsap.timeline({ paused: true });
      tl.to(progressBar, { strokeDashoffset: 0, duration: 1, ease: "none" }, 0);
      tl.to(
        marker,
        {
          motionPath: {
            path: motionPath,
            align: motionPath,
            alignOrigin: [0.5, 0.5],
            autoRotate: true,
          },
          duration: 1,
          ease: "none",
        },
        0
      );

      const updateCheckpoints = (p: number) => {
        if (progressText) {
          progressText.textContent = `${Math.round(p * 100)}%`;
        }
        if (!checkpointElements) return;

        checkpointElements.forEach((cp) => {
          const targetP = parseFloat(cp.dataset.progress || "0");
          const isActive = Math.abs(p - targetP) < 0.055;
          const isPassed = p >= targetP;
          cp.classList.toggle("is-active", isActive);
          cp.classList.toggle("is-passed", isPassed);
        });
      };

      const st = ScrollTrigger.create({
        trigger: containerRef.current,
        start: "top top",
        end: "bottom bottom",
        scrub: 0.7,
        animation: tl,
        invalidateOnRefresh: true,
        onUpdate: (self) => {
          updateCheckpoints(self.progress);
        },
      });

      // Jump to checkpoint on click
      checkpointElements?.forEach((cp) => {
        cp.onclick = () => {
          const targetP = parseFloat(cp.dataset.progress || "0");
          const targetScroll = st.start + (st.end - st.start) * targetP;
          window.scrollTo({ top: targetScroll, behavior: "smooth" });
        };
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

  return (
    <div className="journey-scroll" ref={containerRef} data-path-journey id="cronologia">
      {/* Sticky Journey Progress Bar */}
      <div className="journey-bar">
        <span className="journey-bar__title">Cronologia: de Catarroja a l'actualitat</span>
        <span className="journey-bar__progress">
          Trajectòria recorreguda <span data-journey-progress-text>0%</span>
        </span>
      </div>

      {/* Journey Head */}
      <header className="journey-head">
        <div className="journey-head__title">
          <p className="journey-kicker">1956 — 2026 · Arxiu Històric</p>
          <h2>Cinc dècades de camí i música</h2>
        </div>
        <div className="journey-head__intro">
          <p className="journey-lede">
            De la fundació d'Al Tall en plena clandestinitat a l'estrena de <em>Viatger</em> i el present: 
            una ruta viva traçada al llarg de mig segle d'arrel i creació mediterrània.
          </p>
          <p className="journey-prompt">
            <span className="journey-prompt__dot" aria-hidden="true"></span>
            <strong>Fes scroll per seguir la ruta</strong>
            <span>o selecciona una fita per saltar-hi</span>
          </p>
        </div>
      </header>

      {/* Journey Stage */}
      <div className="journey-stage">
        {/* Desktop Sinuous Route SVG */}
        <svg
          className="journey-map journey-map--desktop"
          viewBox="0 0 1000 4800"
          aria-hidden="true"
          focusable="false"
        >
          {/* Dashed Shadow Route */}
          <path
            className="route-shadow"
            d="
              M 260 200
              C 160 380, 260 480, 260 580
              C 260 760, 740 720, 740 920
              C 740 1120, 260 1080, 260 1300
              C 260 1520, 740 1480, 740 1700
              C 740 1920, 260 1880, 260 2100
              C 260 2320, 740 2280, 740 2500
              C 740 2720, 260 2680, 260 2900
              C 260 3120, 740 3080, 740 3300
              C 740 3520, 260 3480, 260 3700
              C 260 3920, 740 3880, 740 4100
              C 740 4320, 500 4420, 500 4650
            "
          />
          {/* Animated Red Progress Route */}
          <path
            className="route-progress"
            data-journey-progress="desktop"
            d="
              M 260 200
              C 160 380, 260 480, 260 580
              C 260 760, 740 720, 740 920
              C 740 1120, 260 1080, 260 1300
              C 260 1520, 740 1480, 740 1700
              C 740 1920, 260 1880, 260 2100
              C 260 2320, 740 2280, 740 2500
              C 740 2720, 260 2680, 260 2900
              C 260 3120, 740 3080, 740 3300
              C 740 3520, 260 3480, 260 3700
              C 260 3920, 740 3880, 740 4100
              C 740 4320, 500 4420, 500 4650
            "
          />
          {/* Motion Guide Path */}
          <path
            className="route-motion"
            data-journey-path="desktop"
            d="
              M 260 200
              C 160 380, 260 480, 260 580
              C 260 760, 740 720, 740 920
              C 740 1120, 260 1080, 260 1300
              C 260 1520, 740 1480, 740 1700
              C 740 1920, 260 1880, 260 2100
              C 260 2320, 740 2280, 740 2500
              C 740 2720, 260 2680, 260 2900
              C 260 3120, 740 3080, 740 3300
              C 740 3520, 260 3480, 260 3700
              C 260 3920, 740 3880, 740 4100
              C 740 4320, 500 4420, 500 4650
            "
          />
        </svg>

        {/* Mobile Linear Route SVG */}
        <svg
          className="journey-map journey-map--mobile"
          viewBox="0 0 380 4800"
          aria-hidden="true"
          focusable="false"
        >
          <path className="route-shadow" d="M 44 80 L 44 4650" />
          <path className="route-progress" data-journey-progress="mobile" d="M 44 80 L 44 4650" />
          <path className="route-motion" data-journey-path="mobile" d="M 44 80 L 44 4650" />
        </svg>

        {/* Moving Marker Bead */}
        <span className="journey-marker" data-journey-marker aria-hidden="true">
          <span className="journey-marker__nose"></span>
        </span>

        {/* Checkpoint Milestone List */}
        <ol className="checkpoint-list">
          {CHECKPOINTS.map((cp, idx) => (
            <li key={`${cp.year}-${idx}`}>
              <button
                type="button"
                className={`checkpoint checkpoint--${cp.side}`}
                data-journey-checkpoint
                data-progress={cp.progress}
                style={
                  {
                    "--pin-x": cp.pinX,
                    "--pin-y": cp.pinY,
                    "--pin-x-m": "44px",
                    "--pin-y-m": cp.pinY,
                  } as React.CSSProperties
                }
              >
                <span className="checkpoint-pin" aria-hidden="true"></span>
                <span className="checkpoint-media">
                  <img
                    src={cp.media}
                    alt={cp.title}
                    width={400}
                    height={250}
                    loading="lazy"
                    decoding="async"
                  />
                </span>
                <span className="checkpoint-copy">
                  <span className="checkpoint-day">{cp.badge}</span>
                  <strong>{cp.title}</strong>
                  <span className="checkpoint-note">{cp.text}</span>
                </span>
              </button>
            </li>
          ))}
        </ol>
      </div>

      {/* Toggle to view all 18 complete milestones */}
      <div className="journey-archive-toggle">
        <button
          type="button"
          className="journey-archive-btn"
          onClick={() => setShowFullArchive((prev) => !prev)}
        >
          <span>{showFullArchive ? "Amaga l'arxiu complet" : "Veure les 18 fites històriques completes"}</span>
          <svg
            width="14"
            height="14"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2.5"
            style={{
              transform: showFullArchive ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.3s ease",
            }}
          >
            <path d="M6 9l6 6 6-6" />
          </svg>
        </button>
      </div>

      {/* Complete Historical Ledger (18 items) */}
      {showFullArchive && (
        <div className="journey-full-ledger bio-container">
          {chronologyFites.map((fita, idx) => (
            <div key={`${fita.year}-${idx}`} className="ledger-row">
              <span className="ledger-year">{fita.year}</span>
              <span className="ledger-text">{fita.text}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
