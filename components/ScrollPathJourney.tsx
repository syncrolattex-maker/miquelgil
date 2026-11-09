"use client";

import React, { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { MotionPathPlugin } from "gsap/MotionPathPlugin";
import { BIO_SECTIONS, type BioSection } from "@/app/biografia/bioData";
import { chronologyFites } from "@/lib/site";
import "./ScrollPathJourney.css";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger, MotionPathPlugin);
}

interface CheckpointData {
  id: string;
  year: string;
  badge: string;
  stageNum: string;
  stageId: string;
  isMajorStage?: boolean;
  title: string;
  subtitle?: string;
  text: string;
  quote?: string;
  media: string;
  progress: number;
  pinX: string;
  pinY: string;
  side: "left" | "right";
}

const CHECKPOINTS: CheckpointData[] = [
  {
    id: "cp-1956",
    year: "1956",
    badge: "1956 · CATARROJA",
    stageNum: "01",
    stageId: "comencar-comencant",
    title: "BRESSOL I PRIMERS PASSOS",
    text: "Naix a Catarroja (Horta Sud, València), bressol d'arrel i de tradició musical valenciana.",
    media: "/images/07-1978-6.jpg",
    progress: 0.08,
    pinX: "26%",
    pinY: "9%",
    side: "right",
  },
  {
    id: "cp-1971",
    year: "1971",
    badge: "H. 1971 · PRADA",
    stageNum: "01",
    stageId: "comencar-comencant",
    title: "TROBADA AMB VICENT TORRENT",
    text: "Als 15 anys coneix Vicent Torrent a la Universitat Catalana d'Estiu de Prada; Torrent li proposa formar un grup.",
    media: "/images/trobada-vicent-torrent.png",
    progress: 0.17,
    pinX: "74%",
    pinY: "17%",
    side: "left",
  },
  {
    id: "cp-1975",
    year: "1973—1985",
    badge: "ETAPA 01 · 1973—1985 · AL TALL",
    stageNum: "01",
    stageId: "comencar-comencant",
    isMajorStage: true,
    title: "COMENÇAR COMENÇANT",
    subtitle: "Al Tall i la recuperació de la veu d'arrel",
    text: "Amb 16 anys cofunda Al Tall al costat de Vicent Torrent i Manolo Miralles en plena clandestinitat. Culmina l'etapa amb l'històric 'Xarq Al-andalus' (1985).",
    quote: "Al Tall fou l'escola perfecta per a aprendre les formes de la música tradicional i mediterrània.",
    media: "/images/07-1978-6.jpg",
    progress: 0.26,
    pinX: "26%",
    pinY: "25%",
    side: "right",
  },
  {
    id: "cp-1986",
    year: "1986—1988",
    badge: "ETAPA 02 · 1986—1988 · SOLITARI",
    stageNum: "02",
    stageId: "transicio-musical",
    isMajorStage: true,
    title: "TRANSICIÓ MUSICAL",
    subtitle: "L'esperit lliure i la recerca d'altres aires",
    text: "Deixa Al Tall per emprendre un camí propi. Guanya els 'Encuentros de canción de autor' i compon per a teatre, cinema, televisió i doblatge.",
    quote: "La necessitat de respirar altres aires i transgredir els límits del folk tradicional.",
    media: "/images/miquel-gil-delange-detras.jpg",
    progress: 0.35,
    pinX: "74%",
    pinY: "34%",
    side: "left",
  },
  {
    id: "cp-1988",
    year: "1988—1994",
    badge: "ETAPA 03 · 1988—1994 · TERMINAL SUR",
    stageNum: "03",
    stageId: "eclecticisme",
    isMajorStage: true,
    title: "ECLECTICISME I FUSIÓ",
    subtitle: "Terminal Sur: una dècada avançats a la world music",
    text: "Amb Terminal Sur i Vicente Sabater grava 'Viajero' (1988), connectant sintetitzadors, samplers i loops amb llaüts, bouzoukis i cants de batre.",
    quote: "On acaba el Nord i comença el Sud: sintetitzadors, samplers i instruments ancestrals de doble corda.",
    media: "/images/TerminalSur.jpg",
    progress: 0.44,
    pinX: "26%",
    pinY: "43%",
    side: "right",
  },
  {
    id: "cp-1997",
    year: "1997",
    badge: "ETAPA 04 · 1997 · SEMINOLA",
    stageNum: "04",
    stageId: "organic",
    title: "'BUSCANDO TU OLOR'",
    text: "Primer disc en solitari publicat amb el seu propi nom: Miquel Gil, amb la veu i les composicions pròpies com a eix.",
    media: "/images/buscando-tu-olor-1997.jpg",
    progress: 0.53,
    pinX: "74%",
    pinY: "52%",
    side: "left",
  },
  {
    id: "cp-2001",
    year: "1995—2003",
    badge: "ETAPA 04 · 2001 · ORGÀNIC",
    stageNum: "04",
    stageId: "organic",
    isMajorStage: true,
    title: "LA REVOLUCIÓ D'ORGÀNIC",
    subtitle: "En primera persona i punt d'inflexió mediterrani",
    text: "'Orgànic' (Sonifolk / Galileo MC): tres anys de recerca amb poesia d'Estellés i Casasses que redefiniren per sempre la música mediterrània contemporània.",
    quote: "Quan Miquel Gil canta és la terra mateixa que s’expressa.",
    media: "/images/disco_7.jpg",
    progress: 0.62,
    pinX: "26%",
    pinY: "61%",
    side: "right",
  },
  {
    id: "cp-2004",
    year: "2004—PRESENT",
    badge: "ETAPA 05 · 2004 · KATÀ",
    stageNum: "05",
    stageId: "kata-projeccio",
    isMajorStage: true,
    title: "KATÀ I PROJECCIÓ UNIVERSAL",
    subtitle: "World Music Charts Europe i gires internacionals",
    text: "Amb 'Katà' entra al Top 5 de la World Music Charts Europe i porta el cant valencià als grans festivals d'Europa, el Magrib i la FIL de Guadalajara (Mèxic).",
    quote: "La veu d'arrel que no s'atura de viatjar: de les llistes europees fins a 'Viatger'.",
    media: "/images/disco_6.png",
    progress: 0.71,
    pinX: "74%",
    pinY: "70%",
    side: "left",
  },
  {
    id: "cp-2006",
    year: "2006",
    badge: "ETAPA 05 · 2006 · EIXOS",
    stageNum: "05",
    stageId: "kata-projeccio",
    title: "PREMIS OVIDI MONTLLOR",
    text: "'Eixos' (amb producció de Borja Penalba) esdevé el gran guanyador en la primera edició dels Premis Ovidi Montllor.",
    media: "/images/disco_5.png",
    progress: 0.80,
    pinX: "26%",
    pinY: "79%",
    side: "right",
  },
  {
    id: "cp-2019",
    year: "2019",
    badge: "ETAPA 05 · 2019 · GEOMETRIES",
    stageNum: "05",
    stageId: "kata-projeccio",
    title: "PALAU DE LA MÚSICA & À PUNT",
    text: "'Geometries' (Temps Record), presentat al Palau de la Música de València, i conductor de 'Bambant per casa' a À Punt.",
    media: "/images/disco_2.png",
    progress: 0.89,
    pinX: "74%",
    pinY: "88%",
    side: "left",
  },
  {
    id: "cp-2024",
    year: "2024—2026",
    badge: "ETAPA 05 · 2024—2026 · VIATGER",
    stageNum: "05",
    stageId: "kata-projeccio",
    isMajorStage: true,
    title: "VIATGER & MIG SEGLE D'ESCENARIS",
    subtitle: "Teatre Principal de València i continuïtat viva",
    text: "Estrena de 'Viatger' en memòria de Manolo Miralles, single solidari per la DANA nominat als Premis Ovidi i 50 anys de trajectòria viva.",
    media: "/images/MiquelGilViatger_Principal.webp",
    progress: 0.97,
    pinX: "50%",
    pinY: "96%",
    side: "left",
  },
];

// Mapa dels punts de progrés de cada gran etapa per al navegador ràpid superior
const STAGE_PROGRESS_MAP: Record<string, number> = {
  "comencar-comencant": 0.26,
  "transicio-musical": 0.35,
  "eclecticisme": 0.44,
  "organic": 0.62,
  "kata-projeccio": 0.71,
};

export default function ScrollPathJourney() {
  const containerRef = useRef<HTMLDivElement>(null);
  const stRef = useRef<ScrollTrigger | null>(null);
  const [showFullArchive, setShowFullArchive] = useState(false);
  const [activeStageId, setActiveStageId] = useState<string>(BIO_SECTIONS[0].id);
  const [modalSection, setModalSection] = useState<BioSection | null>(null);

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

        // Actualitzar l'etapa activa segons la posició de la guia del punter
        if (p < 0.31) {
          setActiveStageId("comencar-comencant");
        } else if (p < 0.40) {
          setActiveStageId("transicio-musical");
        } else if (p < 0.49) {
          setActiveStageId("eclecticisme");
        } else if (p < 0.67) {
          setActiveStageId("organic");
        } else {
          setActiveStageId("kata-projeccio");
        }

        if (!checkpointElements) return;

        checkpointElements.forEach((cp) => {
          const targetP = parseFloat(cp.dataset.progress || "0");
          const isActive = Math.abs(p - targetP) < 0.055;
          const isPassed = p >= targetP - 0.015;
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

      stRef.current = st;
    }, containerRef);

    return () => ctx.revert();
  }, []);

  // Tancar el modal amb Escape
  useEffect(() => {
    if (!modalSection) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") setModalSection(null);
    };
    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [modalSection]);

  const jumpToProgress = (targetP: number) => {
    const st = stRef.current;
    if (!st) return;
    const targetScroll = st.start + (st.end - st.start) * targetP;
    window.scrollTo({ top: targetScroll, behavior: "smooth" });
  };

  const handleStageTabClick = (stage: BioSection) => {
    setActiveStageId(stage.id);
    const targetP = STAGE_PROGRESS_MAP[stage.id] ?? 0.08;
    jumpToProgress(targetP);
  };

  const openStageModal = (stageId: string, e?: React.MouseEvent) => {
    if (e) e.stopPropagation();
    const found = BIO_SECTIONS.find((s) => s.id === stageId);
    if (found) {
      setModalSection(found);
    }
  };

  const activeStageObj = BIO_SECTIONS.find((s) => s.id === activeStageId) || BIO_SECTIONS[0];

  return (
    <div className="journey-scroll theme-dark" ref={containerRef} data-path-journey id="cronologia">
      {/* Barra superior sticky A24 amb indicador d'etapa i percentatge del punter */}
      <div className="journey-bar">
        <div className="journey-bar__left">
          <span className="journey-bar__kicker">GUIA INTERACTIVA D&apos;ETAPES</span>
          <span className="journey-bar__sep">—</span>
          <span className="journey-bar__stage">
            ETAPA {activeStageObj.num}: {activeStageObj.title.toUpperCase()} ({activeStageObj.period})
          </span>
        </div>

        <div className="journey-bar__stages-pills" role="tablist" aria-label="Saltar a etapa">
          {BIO_SECTIONS.map((sec) => (
            <button
              key={sec.id}
              type="button"
              onClick={() => handleStageTabClick(sec)}
              className={`journey-bar__pill ${activeStageId === sec.id ? "is-active" : ""}`}
              title={`Anar a Etapa ${sec.num}: ${sec.title} (${sec.period})`}
            >
              <span>{sec.num}</span>
              <span className="journey-bar__pill-name">{sec.title}</span>
            </button>
          ))}
        </div>

        <span className="journey-bar__progress">
          RECORREGUT <span data-journey-progress-text>0%</span>
        </span>
      </div>

      {/* Capçalera editorial A24 de la guia d'etapes i cronologia */}
      <header className="journey-head">
        <div className="journey-head__title">
          <p className="journey-kicker">03 / LES 5 ETAPES I CRONOLOGIA INTERACTIVA (1956 — 2026)</p>
          <h2>CINC DÈCADES DE CAMÍ I MÚSICA</h2>
        </div>
        <div className="journey-head__intro">
          <p className="journey-lede">
            De la fundació d&apos;Al Tall en plena clandestinitat a la revolució d&apos;<em>Orgànic</em>, l&apos;èxit europeu de <em>Katà</em> i l&apos;estrena de <em>Viatger</em>: segueix el punter al llarg de la guia per recórrer les cinc etapes biogràfiques i les fites històriques.
          </p>
          <p className="journey-prompt">
            <span className="journey-prompt__dot" aria-hidden="true"></span>
            <strong>FES SCROLL PER FER BAIXAR EL PUNTER PER LA GUIA</strong>
            <span>O CLICA QUALSEVOL ETAPA PER SALTAR-HI I LLEGIR LA CRÒNICA</span>
          </p>
        </div>
      </header>

      {/* Selector A24 de les 5 Grans Etapes connectat a la guia */}
      <div className="journey-stages-index">
        {BIO_SECTIONS.map((sec) => {
          const isCurrent = activeStageId === sec.id;
          return (
            <div
              key={sec.id}
              className={`journey-stage-card ${isCurrent ? "is-active" : ""}`}
              onClick={() => handleStageTabClick(sec)}
              role="button"
              tabIndex={0}
              onKeyDown={(e) => {
                if (e.key === "Enter" || e.key === " ") {
                  e.preventDefault();
                  handleStageTabClick(sec);
                }
              }}
            >
              <div className="journey-stage-card__top">
                <span className="journey-stage-card__num">ETAPA {sec.num}</span>
                <span className="journey-stage-card__period">{sec.period}</span>
              </div>
              <h3 className="journey-stage-card__title">{sec.title}</h3>
              <p className="journey-stage-card__sub">{sec.subtitle}</p>
              <div className="journey-stage-card__actions">
                <span className="journey-stage-card__goto">BAIXAR A LA GUIA ↓</span>
                <button
                  type="button"
                  className="journey-stage-card__read"
                  onClick={(e) => openStageModal(sec.id, e)}
                >
                  CRÒNICA COMPLETA ↗
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Escenari de la Guia Interactiva amb el Punter (MotionPathPlugin) */}
      <div className="journey-stage">
        {/* Ruta Sinuosa Desktop SVG */}
        <svg
          className="journey-map journey-map--desktop"
          viewBox="0 0 1000 4800"
          aria-hidden="true"
          focusable="false"
        >
          {/* Ruta Guia Puntejada Base */}
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
          {/* Ruta de Progrés Il·luminada pel Punter */}
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
          {/* Path Guia de Moviment del Punter */}
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

        {/* Ruta Lineal Mòbil SVG */}
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

        {/* Punter Guia en Moviment (Marker Bead amb direcció) */}
        <span className="journey-marker" data-journey-marker aria-hidden="true">
          <span className="journey-marker__nose"></span>
        </span>

        {/* Fites i Etapes al llarg de la Guia */}
        <ol className="checkpoint-list">
          {CHECKPOINTS.map((cp) => (
            <li key={cp.id}>
              <div
                role="button"
                tabIndex={0}
                className={`checkpoint checkpoint--${cp.side} ${
                  cp.isMajorStage ? "checkpoint--stage" : ""
                }`}
                data-journey-checkpoint
                data-progress={cp.progress}
                onClick={() => jumpToProgress(cp.progress)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    jumpToProgress(cp.progress);
                  }
                }}
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
                    width={420}
                    height={260}
                    loading="lazy"
                    decoding="async"
                  />
                  {cp.isMajorStage && (
                    <span className="checkpoint-stage-pill">ETAPA {cp.stageNum}</span>
                  )}
                </span>

                <span className="checkpoint-copy">
                  <span className="checkpoint-day">{cp.badge}</span>
                  <strong className="checkpoint-title">{cp.title}</strong>
                  {cp.subtitle && (
                    <span className="checkpoint-subtitle">{cp.subtitle}</span>
                  )}
                  <span className="checkpoint-note">{cp.text}</span>
                  {cp.quote && (
                    <span className="checkpoint-quote">“{cp.quote}”</span>
                  )}

                  <span className="checkpoint-actions">
                    <button
                      type="button"
                      className="checkpoint-read-btn"
                      onClick={(e) => openStageModal(cp.stageId, e)}
                    >
                      <span>LLEGIR CRÒNICA DE L&apos;ETAPA {cp.stageNum} ↗</span>
                    </button>
                  </span>
                </span>
              </div>
            </li>
          ))}
        </ol>
      </div>

      {/* Botó A24 per desplegar el quadre complet de les 18 fites històriques */}
      <div className="journey-archive-toggle">
        <button
          type="button"
          className="btn a24-btn"
          onClick={() => setShowFullArchive((prev) => !prev)}
        >
          <div className="btn__divider" />
          <span className="btn__p-mask">
            <span
              className="btn__p"
              data-hover-inner
              data-text={
                showFullArchive
                  ? "AMAGAR L'ARXIU CRONOLÒGIC COMPLET ↑"
                  : "DESPLEGAR LES 18 FITES HISTÒRIQUES VERIFICADES ↓"
              }
            >
              <span>
                {showFullArchive
                  ? "AMAGAR L'ARXIU CRONOLÒGIC COMPLET ↑"
                  : "DESPLEGAR LES 18 FITES HISTÒRIQUES VERIFICADES ↓"}
              </span>
            </span>
          </span>
          <div className="btn__divider" />
        </button>
      </div>

      {/* Quadre Editorial Complet de les 18 Fites (Desplegable) */}
      {showFullArchive && (
        <div className="journey-full-ledger">
          <div className="journey-full-ledger__head">
            <span className="subheading-xs">ÍNDEX CRONOLÒGIC COMPLET (1956 — 2026)</span>
            <span className="subheading-xs">18 FITES OFICIALS</span>
          </div>
          {chronologyFites.map((fita, idx) => (
            <div key={`${fita.year}-${idx}`} className="ledger-row">
              <span className="ledger-idx">
                {idx + 1 < 10 ? `0${idx + 1}` : idx + 1} / {chronologyFites.length}
              </span>
              <span className="ledger-year">{fita.year}</span>
              <span className="ledger-text">{fita.text}</span>
            </div>
          ))}
        </div>
      )}

      {/* MODAL EDITORIAL A24 DE CRÒNICA COMPLETA DE L'ETAPA */}
      {modalSection && (
        <div
          className="journey-modal-backdrop"
          onClick={() => setModalSection(null)}
          role="dialog"
          aria-modal="true"
          aria-labelledby="journey-modal-title"
        >
          <div
            className="journey-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Capçalera fixa del modal */}
            <div className="journey-modal__top">
              <div className="journey-modal__meta">
                <span className="subheading-xs">
                  ETAPA {modalSection.num} · {modalSection.period}
                </span>
              </div>
              <button
                type="button"
                className="journey-modal__close"
                onClick={() => setModalSection(null)}
                aria-label="Tancar crònica"
              >
                TANCAR [ESC] ✕
              </button>
            </div>

            <div className="journey-modal__scroll">
              <div className="journey-modal__header">
                <span className="subheading-xs">{modalSection.subtitle}</span>
                <h2 id="journey-modal-title" className="heading-m">
                  {modalSection.title}
                </h2>
              </div>

              <div className="journey-modal__grid">
                <div className="journey-modal__media-col">
                  <figure className="journey-modal__figure">
                    <img
                      src={modalSection.image}
                      alt={modalSection.imageAlt}
                      className="journey-modal__img"
                    />
                  </figure>
                  <div className="journey-modal__caption">
                    <span className="subheading-xs">{modalSection.imageAlt}</span>
                    <span className="subheading-xs">{modalSection.period}</span>
                  </div>

                  {modalSection.quote && (
                    <blockquote className="journey-modal__quote">
                      “{modalSection.quote}”
                    </blockquote>
                  )}

                  <div className="journey-modal__tags">
                    {modalSection.tags.map((tag) => (
                      <span key={tag} className="journey-modal__tag">
                        {tag}
                      </span>
                    ))}
                  </div>
                </div>

                <div className="journey-modal__text-col">
                  <p className="paragraph-xl" style={{ margin: 0, color: "#ffffff" }}>
                    {modalSection.summary}
                  </p>

                  <div className="divider-local" />

                  <div className="journey-modal__paragraphs">
                    {modalSection.paragraphs.map((p, i) => (
                      <p key={i} className="paragraph-l" style={{ margin: 0 }}>
                        {p}
                      </p>
                    ))}
                  </div>

                  {modalSection.keyMilestones.length > 0 && (
                    <div className="journey-modal__milestones">
                      <span className="subheading-xs">
                        FITES CLAU DE L&apos;ETAPA ({modalSection.period})
                      </span>
                      {modalSection.keyMilestones.map((m, idx) => (
                        <div key={idx} className="journey-modal__milestone-row">
                          <span className="journey-modal__milestone-year">{m.year}</span>
                          <span className="paragraph-m">{m.title}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Navegació entre les 5 etapes dins del modal */}
              <div className="journey-modal__footer">
                {BIO_SECTIONS.map((sec) => (
                  <button
                    key={sec.id}
                    type="button"
                    onClick={() => setModalSection(sec)}
                    className={`journey-modal__stage-switch ${
                      modalSection.id === sec.id ? "is-active" : ""
                    }`}
                  >
                    <span className="subheading-xs">ETAPA {sec.num}</span>
                    <span className="journey-modal__stage-switch-title">{sec.title}</span>
                  </button>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
