"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import A24Nav from "@/components/A24Nav";
import { bookingInfo, downloads } from "@/lib/site";
import "./contractacio.css";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

interface FormatDetail {
  id: string;
  num: string;
  name: string;
  subtitle: string;
  musicians: string[];
  duration: string;
  idealVenues: string;
  recentHighlight: string;
  technicalSummary: string;
  riderLink: string;
  badge: string;
}

const FORMAT_DETAILS: FormatDetail[] = [
  {
    id: "duo",
    num: "01",
    name: "Duo Acústic d'Arrel",
    subtitle: "Miquel Gil & Eduard Navarro",
    musicians: [
      "Miquel Gil — Veu principal i guitarra acústica",
      "Eduard Navarro — Dolçaina, gralla, xirimia, ney, duduc, cítola i moraharpa",
    ],
    duration: "60 — 75 minuts",
    idealVenues:
      "Claustres patrimonials, ermites, museus, auditoris de cambra i festivals de paisatge.",
    recentHighlight: "Can Soler (Mataró) · Festival 2 Terços (2026).",
    technicalSummary:
      "2 línies de veu, microfonia d'instruments acústics de vent i corda polsada, 2 enviaments de monitor o in-ear. Il·luminació càlida de proximitat.",
    riderLink: "https://drive.google.com/open?id=1SfJ6nymMaJlXS7g4FYKcYQZH_S6gi8a1",
    badge: "FORMAT 01 · ÍNTIM & ACÚSTIC",
  },
  {
    id: "trio",
    num: "02",
    name: "Miquel Gil Trio",
    subtitle: "Veu, Teclats i Baix Elèctric",
    musicians: [
      "Miquel Gil — Veu principal i guitarra",
      "Nelo Alfonso — Teclats, sintetitzadors, piano i cors",
      "Gusmà Gil — Baix elèctric",
    ],
    duration: "70 — 75 minuts",
    idealVenues:
      "Teatres municipals, cases de cultura, sales de mitjà aforament i cicles de cançó d'autor.",
    recentHighlight: "Teatre Kursaal de Manresa (abril 2024).",
    technicalSummary:
      "D.I. estèreo de teclats, D.I. de baix elèctric, veu principal i guitarra electroacústica, 3 mescles independents de monitoratge.",
    riderLink: "https://drive.google.com/open?id=1SfJ6nymMaJlXS7g4FYKcYQZH_S6gi8a1",
    badge: "FORMAT 02 · VERSÀTIL & CONTEMPORANI",
  },
  {
    id: "banda",
    num: "03",
    name: "Banda Completa (6 Músics)",
    subtitle: "La màxima potència tímbrica i escènica",
    musicians: [
      "Miquel Gil — Veu principal i guitarra",
      "Toni Porcar — Guitarra flamenca i elèctrica",
      "Eduard Navarro — Instruments tradicionals de vent i corda",
      "Nelo Alfonso — Teclats i sintetitzadors",
      "José María Reillo — Bateria mediterrània i percussions tradicionals",
      "Gusmà Gil — Baix elèctric",
    ],
    duration: "90 minuts",
    idealVenues:
      "Grans teatres, places majors, auditoris a l'aire lliure i festivals internacionals.",
    recentHighlight: "Gira 20 anys d'Orgànic · Festival ETNO de València (2023).",
    technicalSummary:
      "Sistema P.A. dimensionat a l'aforament, set complet de percussions microfades, 6 mescles independents, disseny d'il·luminació escènica.",
    riderLink: "https://drive.google.com/open?id=1R9nioosA6mmmuegtHsc2TClQRR1iIFDl",
    badge: "FORMAT 03 · GRAN FORMAT ESCÈNIC",
  },
  {
    id: "nus",
    num: "04",
    name: "«Nus» amb Pep Gimeno «Botifarra»",
    subtitle: "Diàleg despullat entre dues veus cabdals de la tradició",
    musicians: [
      "Miquel Gil — Veu i guitarra acústica",
      "Pep Gimeno «Botifarra» — Veu, pandereta, postisses i percussions tradicionals",
    ],
    duration: "75 — 80 minuts",
    idealVenues:
      "Teatres històrics, auditoris culturals i grans trobades de música d'arrel.",
    recentHighlight:
      "Més de tres anys de gira conjunta amb entrades exhaurides arreu del país.",
    technicalSummary:
      "2 micròfons vocals d'alta sensibilitat, microfonia d'instruments acústics i percussió de mà, 2 mescles de monitoratge a terra.",
    riderLink: "https://drive.google.com/open?id=1SfJ6nymMaJlXS7g4FYKcYQZH_S6gi8a1",
    badge: "FORMAT 04 · PRODUCCIÓ COMPARTIDA",
  },
  {
    id: "estrena",
    num: "05",
    name: "Estrena amb Convidats",
    subtitle: "Produccions Simfòniques i Grans Esdeveniments",
    musicians: [
      "Banda Completa de Miquel Gil",
      "Artistes convidats de l'escena musical segons repertori i projecte",
    ],
    duration: "90 — 100 minuts",
    idealVenues:
      "Teatres principals, concerts inaugurals de festival i auditoris simfònics.",
    recentHighlight:
      "Palau de la Música de València (2019) i Teatre Principal de València (2024).",
    technicalSummary:
      "Rider tècnic ampliat amb producció escenogràfica, backline i coordinació tècnica a mida de l'auditori.",
    riderLink: "https://drive.google.com/open?id=1R9nioosA6mmmuegtHsc2TClQRR1iIFDl",
    badge: "FORMAT 05 · PRODUCCIÓ ESPECIAL",
  },
];

const OFFICIAL_DOCUMENTS = [
  {
    idx: "DOC 01",
    category: "DOSSIER OFICIAL",
    title: "Dossier Artístic de Gira 2026 / 2027",
    description:
      "Biografia actualitzada, trajectòria artística, fitxes dels 5 formats d'espectacle, repertori i reculls de premsa especialitzada.",
    meta: "FORMAT PDF · DOCUMENT OFICIAL",
    actionLabel: "DESCARREGAR DOSSIER ↗",
    href: downloads[0]?.links[0]?.href || "#",
  },
  {
    idx: "DOC 02",
    category: "RIDER TÈCNIC · GRAN FORMAT",
    title: "Rider Tècnic Banda Completa (6 Músics)",
    description:
      "Taula de canals d'entrada (Input List), plànol d'escenari (Stage Plot), microfonia requerida, monitoratge i especificacions de P.A.",
    meta: "FORMAT PDF · EQUIP TÈCNIC",
    actionLabel: "DESCARREGAR RIDER BANDA ↗",
    href: downloads[5]?.links[0]?.href || "#",
  },
  {
    idx: "DOC 03",
    category: "RIDER TÈCNIC · ACÚSTIC",
    title: "Rider Tècnic Duo, Trio & Format «Nus»",
    description:
      "Requeriments tècnics simplificats per a espais patrimonials, claustres, auditoris de cambra i teatres de petit o mitjà aforament.",
    meta: "FORMAT PDF · EQUIP TÈCNIC",
    actionLabel: "DESCARREGAR RIDER ACÚSTIC ↗",
    href: downloads[5]?.links[1]?.href || "#",
  },
  {
    idx: "DOC 04",
    category: "PREMSA & CARTELLERIA",
    title: "Material Promocional en Alta Resolució",
    description:
      "Carpeta oficial per a programadors i mitjans amb drets cedits per a programes de mà, cartelleria i comunicació cultural.",
    meta: "GOOGLE DRIVE · ALTA RESOLUCIÓ",
    actionLabel: "OBRIR CARPETA DE PREMSA ↗",
    href: downloads[2]?.links[0]?.href || "#",
  },
  {
    idx: "DOC 05",
    category: "DOSSIER DE PREMSA",
    title: "Recull Històric i Crítica Musical",
    description:
      "Selecció d'articles, entrevistes i ressenyes en publicacions nacionals i internacionals (World Music Charts Europe, Enderrock, El País).",
    meta: "GOOGLE DRIVE · ARXIU DE PREMSA",
    actionLabel: "CONSULTAR DOSSIER PREMSA ↗",
    href: downloads[1]?.links[0]?.href || "#",
  },
];

export default function ContractacioClient() {
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const formatsRef = useRef<HTMLElement>(null);
  const formatPanelRef = useRef<HTMLElement>(null);
  const docsRef = useRef<HTMLElement>(null);

  const [activeFormatId, setActiveFormatId] = useState<string>("duo");
  const [selectedFormat, setSelectedFormat] = useState<string>("duo");
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);

  const [formData, setFormData] = useState({
    entity: "",
    city: "",
    date: "",
    venue: "",
    contactName: "",
    email: "",
    phone: "",
    notes: "",
  });

  const modalBackdropRef = useRef<HTMLDivElement>(null);
  const modalCardRef = useRef<HTMLDivElement>(null);
  const modalTimelineRef = useRef<gsap.core.Timeline | null>(null);

  const currentTabFormat =
    FORMAT_DETAILS.find((f) => f.id === activeFormatId) || FORMAT_DETAILS[0];

  const activeFormatObj =
    FORMAT_DETAILS.find((f) => f.id === selectedFormat) || FORMAT_DETAILS[0];

  const handleInputChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleOpenModal = (formatId: string) => {
    setSelectedFormat(formatId);
    setIsModalOpen(true);
  };

  const handleCloseModal = useCallback(() => {
    if (modalTimelineRef.current) {
      modalTimelineRef.current.kill();
    }
    const backdrop = modalBackdropRef.current;
    const card = modalCardRef.current;
    if (!backdrop || !card) {
      setIsModalOpen(false);
      return;
    }

    const tl = gsap.timeline({
      onComplete: () => {
        setIsModalOpen(false);
      },
    });
    modalTimelineRef.current = tl;

    tl.to(card, {
      opacity: 0,
      y: 20,
      duration: 0.2,
      ease: "power2.in",
    }).to(
      backdrop,
      {
        opacity: 0,
        duration: 0.18,
        ease: "power2.in",
      },
      "-=0.1"
    );
  }, []);

  // ============================================================================
  // 1. ANIMACIÓ D'ENTRADA EN CORTINA SINCRONITZADA (HERO DE DALT A BAIX)
  // ============================================================================
  useEffect(() => {
    window.scrollTo({ top: 0, left: 0, behavior: "instant" as ScrollBehavior });

    const prefersReducedMotion = window.matchMedia(
      "(prefers-reduced-motion: reduce)"
    ).matches;
    const heroInfo = heroRef.current?.querySelector<HTMLElement>(".contract-hero__info");
    const heroTitle = heroInfo?.querySelector<HTMLElement>(".contract-hero__title");
    const heroCredits = heroInfo?.querySelector<HTMLElement>(".contract-hero__credits");
    const heroMetaItems = heroInfo?.querySelectorAll<HTMLElement>(
      ".contract-metadata__item"
    );
    const heroDividers = heroInfo?.querySelectorAll<HTMLElement>(".divider-horizontal");
    const ctaWrap = heroRef.current?.querySelector<HTMLElement>(
      ".contract-hero__cta-wrap"
    );
    const ctaDividers = ctaWrap?.querySelectorAll<HTMLElement>(
      ":scope > .divider-horizontal"
    );
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

    if (heroTitle) {
      entranceTl.fromTo(
        heroTitle,
        { opacity: 0, y: 35 },
        { opacity: 1, y: 0, duration: 0.85 },
        0.05
      );
    }

    if (heroDividers && heroDividers[0]) {
      entranceTl.fromTo(
        heroDividers[0],
        { scaleX: 0, transformOrigin: "left center" },
        { scaleX: 1, duration: 0.75 },
        0.25
      );
    }

    if (heroCredits) {
      entranceTl.fromTo(
        heroCredits,
        { opacity: 0, y: 25 },
        { opacity: 1, y: 0, duration: 0.7 },
        0.45
      );
    }

    if (heroDividers && heroDividers[1]) {
      entranceTl.fromTo(
        heroDividers[1],
        { scaleX: 0, transformOrigin: "left center" },
        { scaleX: 1, duration: 0.75 },
        0.65
      );
    }

    if (heroMetaItems && heroMetaItems.length) {
      entranceTl.fromTo(
        heroMetaItems,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.65, stagger: 0.08 },
        0.8
      );
    }

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
  // 2. ANIMACIÓ EN CORTINA QUAN ES PREM UN NÚMERO DE FORMAT (01 — 05)
  // ============================================================================
  useEffect(() => {
    const panel = formatPanelRef.current;
    if (!panel) return;

    const numEl = panel.querySelector<HTMLElement>(".contract-format-panel__num");
    const badgeEl = panel.querySelector<HTMLElement>(".contract-format-panel__badge");
    const titleEl = panel.querySelector<HTMLElement>(".contract-format-panel__title");
    const subEl = panel.querySelector<HTMLElement>(".contract-format-panel__subtitle");
    const ruleEl = panel.querySelector<HTMLElement>(".contract-format-panel__rule");
    const specBlocks = panel.querySelectorAll<HTMLElement>(".contract-spec-block");
    const actionsWrap = panel.querySelector<HTMLElement>(
      ".contract-format-panel__actions"
    );

    const tl = gsap.timeline({ defaults: { ease: "power3.out" } });

    if (numEl) {
      tl.fromTo(
        numEl,
        { opacity: 0, y: 24, filter: "blur(8px)" },
        { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.55 },
        0
      );
    }

    if (badgeEl) {
      tl.fromTo(
        badgeEl,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.45 },
        0.05
      );
    }

    if (titleEl) {
      tl.fromTo(
        titleEl,
        { opacity: 0, y: 28, filter: "blur(8px)" },
        { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.6 },
        0.08
      );
    }

    if (subEl) {
      tl.fromTo(
        subEl,
        { opacity: 0, y: 18 },
        { opacity: 1, y: 0, duration: 0.5 },
        0.16
      );
    }

    if (ruleEl) {
      tl.fromTo(
        ruleEl,
        { scaleX: 0, transformOrigin: "left center" },
        { scaleX: 1, duration: 0.65, ease: "power3.inOut" },
        0.2
      );
    }

    if (specBlocks.length) {
      tl.fromTo(
        specBlocks,
        { opacity: 0, y: 20 },
        { opacity: 1, y: 0, duration: 0.5, stagger: 0.06 },
        0.26
      );
    }

    if (actionsWrap) {
      tl.fromTo(
        actionsWrap,
        { opacity: 0, y: 16 },
        { opacity: 1, y: 0, duration: 0.5 },
        0.44
      );
    }

    return () => {
      tl.kill();
    };
  }, [activeFormatId]);

  // ============================================================================
  // 3. GSAP MODAL ANIMATION & KEYBOARD ESCAPE
  // ============================================================================
  useEffect(() => {
    if (!isModalOpen) return;

    const backdrop = modalBackdropRef.current;
    const card = modalCardRef.current;
    if (!backdrop || !card) return;

    const closeBtn = card.querySelector(".contract-modal__close");
    const formFields = card.querySelectorAll(
      ".contract-field-group, .contract-fields-row, .contract-modal__submit-wrap"
    );

    const tl = gsap.timeline();
    modalTimelineRef.current = tl;

    tl.fromTo(
      backdrop,
      { opacity: 0 },
      { opacity: 1, duration: 0.28, ease: "power2.out" }
    );

    tl.fromTo(
      card,
      { opacity: 0, y: 28 },
      { opacity: 1, y: 0, duration: 0.4, ease: "power3.out" },
      "-=0.16"
    );

    if (closeBtn) {
      tl.fromTo(
        closeBtn,
        { opacity: 0, scale: 0.85 },
        { opacity: 1, scale: 1, duration: 0.25, ease: "power2.out" },
        "-=0.25"
      );
    }

    if (formFields.length > 0) {
      tl.fromTo(
        formFields,
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.28, stagger: 0.03, ease: "power2.out" },
        "-=0.22"
      );
    }
  }, [isModalOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isModalOpen) {
        handleCloseModal();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen, handleCloseModal]);

  const scrollToFormats = () => {
    formatsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const scrollToDocs = () => {
    docsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const generateMailtoUrl = () => {
    const subject = `Sol·licitud de contractació: ${activeFormatObj.name} — ${
      formData.city || "Nova data"
    }`;
    const body = `Hola equip de management de Miquel Gil,

Us contacte des de ${
      formData.entity || "la nostra entitat / ajuntament / festival"
    } per sol·licitar disponibilitat i pressupost per al concert:

- Format desitjat: ${activeFormatObj.name} (${activeFormatObj.subtitle})
- Municipi / Ciutat: ${formData.city || "Per concretar"}
- Espai o recinte: ${formData.venue || "Per concretar"}
- Data o període proposat: ${formData.date || "Per concretar"}

Dades de contacte de l'organització:
- Persona de contacte: ${formData.contactName || "—"}
- Correu electrònic: ${formData.email || "—"}
- Telèfon: ${formData.phone || "—"}

Observacions addicionals:
${formData.notes || "Cap observació."}

Moltes gràcies.`;

    return `mailto:${bookingInfo.managementEmail}?subject=${encodeURIComponent(
      subject
    )}&body=${encodeURIComponent(body)}`;
  };

  return (
    <div ref={containerRef} className="contract-a24-page">
      {/* MENÚ DE NAVEGACIÓ A24 INTEGRAT */}
      <A24Nav currentSection="/contractacio/" theme="dark" />

      {/* ============================================================
          1. HERO INFORMATIU DE CONTRACTACIÓ (SENSE FOTOS)
         ============================================================ */}
      <section id="contract_hero" ref={heroRef} className="contract-hero">
        <div className="contract-hero__content">
          <div className="contract-hero__info">
            <div className="contract-hero__title">
              <span className="subheading-xs block mb-2">
                DOSSIER OFICIAL DE CONTRACTACIÓ & MANAGEMENT — TEMPORADA 2026 · 2027
              </span>
              <h1 className="heading-l">CONTRACTACIÓ</h1>
            </div>

            <div className="divider-horizontal my-4" />

            <div className="contract-hero__credits">
              <span className="subheading-xs">DIRECCIÓ & BOOKING</span>
              <span className="paragraph-m font-medium">
                Gusmà Gil · PPF Produccions Culturals
              </span>

              <span className="subheading-xs ml-4">FORMATS EN ACTIU</span>
              <span className="paragraph-m font-medium">
                Duo · Trio · Banda Completa · «Nus» amb Botifarra · Estrenes
              </span>

              <span className="subheading-xs ml-4">TRAMITACIÓ</span>
              <span className="paragraph-m font-medium">
                Contractació directa i Plataforma de Contractació Pública
              </span>
            </div>

            <div className="divider-horizontal my-4" />

            <div className="contract-hero__metadata">
              <div className="contract-metadata__item">
                <span className="subheading-xs">CATÀLEG ESCÈNIC</span>
                <div className="contract-metadata__content">
                  <span className="paragraph-m font-medium">
                    5 formats dimensionables
                  </span>
                  <span className="subheading-xs">2 a 6+ músics</span>
                </div>
              </div>

              <div className="contract-metadata__item">
                <span className="subheading-xs">REPERTORI ACTUAL</span>
                <div className="contract-metadata__content">
                  <span className="paragraph-m font-medium">
                    Viatger & Antologia d&apos;Arrel
                  </span>
                  <span className="subheading-xs">60 — 100 min</span>
                </div>
              </div>

              <div className="contract-metadata__item">
                <span className="subheading-xs">DOCUMENTACIÓ TÈCNICA</span>
                <div className="contract-metadata__content">
                  <span className="paragraph-m font-medium">
                    Riders, Stage Plots & Dossier
                  </span>
                  <span className="subheading-xs">PDF Oficials</span>
                </div>
              </div>

              <div className="contract-metadata__item">
                <span className="subheading-xs">CONTACTE DIRECTE</span>
                <div className="contract-metadata__content">
                  <span className="paragraph-m font-medium">
                    {bookingInfo.managementEmail}
                  </span>
                  <span className="subheading-xs">Resposta 24/48h</span>
                </div>
              </div>
            </div>
          </div>

          {/* CONTENIDOR FULLWIDTH PER A BOTONS I CREUS VECTORIALS */}
          <div className="contract-hero__cta-wrap">
            <div
              className="divider-horizontal"
              style={{ position: "absolute", top: 0 }}
            />

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

            <div className="contract-hero__cta">
              <button
                type="button"
                data-reveal="btn"
                onClick={scrollToFormats}
                className="btn a24-btn"
              >
                <div className="btn__divider" />
                <span className="btn__p-mask">
                  <span
                    className="btn__p"
                    data-hover-inner
                    data-text="ELS 5 FORMATS DE CONCERT ↓"
                  >
                    <span>ELS 5 FORMATS DE CONCERT ↓</span>
                  </span>
                </span>
                <div className="btn__divider" />
              </button>

              <button
                type="button"
                data-reveal="btn"
                onClick={scrollToDocs}
                className="btn a24-btn"
              >
                <div className="btn__divider" />
                <span className="btn__p-mask">
                  <span
                    className="btn__p"
                    data-hover-inner
                    data-text="RIDERS TÈCNICS & DOSSIERS ↓"
                  >
                    <span>RIDERS TÈCNICS & DOSSIERS ↓</span>
                  </span>
                </span>
                <div className="btn__divider" />
              </button>

              <button
                type="button"
                data-reveal="btn"
                onClick={() => handleOpenModal(activeFormatId)}
                className="btn a24-btn"
              >
                <div className="btn__divider" />
                <span className="btn__p-mask">
                  <span
                    className="btn__p"
                    data-hover-inner
                    data-text="SOL·LICITAR DISPONIBILITAT +"
                  >
                    <span>SOL·LICITAR DISPONIBILITAT +</span>
                  </span>
                </span>
                <div className="btn__divider" />
              </button>
            </div>

            <div
              className="divider-horizontal"
              style={{ position: "absolute", bottom: 0 }}
            />
          </div>
        </div>
      </section>

      {/* ============================================================
          2. SELECTOR NUMÈRIC INTERACTIU DELS 5 FORMATS (01 — 05)
             En prémer sobre el número, a sota apareix la fitxa d'aquell format
         ============================================================ */}
      <section
        id="formats"
        ref={formatsRef}
        className="contract-formats"
        aria-label="Selector interactiu dels 5 formats de concert"
      >
        <div className="contract-formats__header">
          <div>
            <span className="subheading-xs block mb-2">
              01 / CATÀLEG D&apos;ESPECTACLES EN ACTIU
            </span>
            <h2 className="heading-m">FORMATS DE CONCERT</h2>
          </div>
          <p className="paragraph-l" style={{ maxWidth: "46ch", margin: 0 }}>
            Selecciona qualsevol dels cinc números per desplegar a sota la fitxa
            artística, la formació escènica, els requeriments tècnics i el rider
            corresponent.
          </p>
        </div>

        {/* Barra de 5 números interactius (01 — 05) */}
        <div className="divider-horizontal" />
        <div className="contract-formats__index" role="tablist" aria-label="Formats de concert">
          {FORMAT_DETAILS.map((fmt) => {
            const isActive = fmt.id === activeFormatId;
            return (
              <button
                key={fmt.id}
                type="button"
                role="tab"
                aria-selected={isActive}
                onClick={() => setActiveFormatId(fmt.id)}
                className={`contract-index-cell ${isActive ? "is-active" : ""}`}
              >
                <div className="contract-index-cell__top">
                  <span className="contract-index-cell__num">{fmt.num}</span>
                  <span className="subheading-xs">{fmt.duration}</span>
                </div>
                <span className="contract-index-cell__name">{fmt.name}</span>
                <span className="contract-index-cell__sub">{fmt.subtitle}</span>
              </button>
            );
          })}
        </div>
        <div className="divider-horizontal" />

        {/* Secció informativa que apareix a sota en prémer el número */}
        <div className="contract-formats__panel-wrap">
          <article
            ref={formatPanelRef}
            key={currentTabFormat.id}
            role="tabpanel"
            className="contract-format-panel"
          >
            {/* Capçalera monumental del format seleccionat */}
            <div className="contract-format-panel__top">
              <span className="contract-format-panel__num">
                {currentTabFormat.num}
              </span>

              <div className="contract-format-panel__headings">
                <span className="subheading-xs contract-format-panel__badge">
                  {currentTabFormat.badge}
                </span>
                <h3 className="contract-format-panel__title">
                  {currentTabFormat.name}
                </h3>
                <p className="contract-format-panel__subtitle">
                  {currentTabFormat.subtitle}
                </p>
              </div>

              <div className="contract-format-panel__duration">
                <span className="subheading-xs">DURADA ESCÈNICA</span>
                <span className="paragraph-m font-medium">
                  {currentTabFormat.duration}
                </span>
              </div>
            </div>

            <div className="contract-format-panel__rule" />

            {/* Especificacions tècniques i artístiques (sense fotos, 100% informatiu) */}
            <div className="contract-format-panel__grid">
              {/* Columna Esquerra: Músics a l'escenari */}
              <div className="contract-spec-block">
                <span className="subheading-xs">
                  01 / FORMACIÓ I MÚSICS A L&apos;ESCENARI
                </span>
                <ul className="contract-musicians-list">
                  {currentTabFormat.musicians.map((m, idx) => (
                    <li key={idx} className="paragraph-m font-medium">
                      {m}
                    </li>
                  ))}
                </ul>
              </div>

              {/* Columna Dreta: Espais ideals, Referència i Requeriments tècnics */}
              <div className="contract-format-panel__right">
                <div className="contract-spec-grid">
                  <div className="contract-spec-block">
                    <span className="subheading-xs">
                      02 / ESPAIS I AFORAMENTS IDEALS
                    </span>
                    <p className="paragraph-m" style={{ margin: 0 }}>
                      {currentTabFormat.idealVenues}
                    </p>
                  </div>

                  <div className="contract-spec-block">
                    <span className="subheading-xs">03 / REFERÈNCIA RECENT</span>
                    <p className="paragraph-m font-medium" style={{ margin: 0 }}>
                      {currentTabFormat.recentHighlight}
                    </p>
                  </div>
                </div>

                <div className="contract-spec-block">
                  <span className="subheading-xs">
                    04 / SÍNTESI DE REQUERIMENTS TÈCNICS (SO, MICROFONIA I LLUM)
                  </span>
                  <p className="paragraph-m" style={{ margin: 0 }}>
                    {currentTabFormat.technicalSummary}
                  </p>
                </div>

                {/* Botons d'acció A24 per al format actiu */}
                <div className="contract-format-panel__actions">
                  <button
                    type="button"
                    onClick={() => handleOpenModal(currentTabFormat.id)}
                    className="btn a24-btn"
                  >
                    <div className="btn__divider" />
                    <span className="btn__p-mask">
                      <span
                        className="btn__p"
                        data-hover-inner
                        data-text={`SOL·LICITAR DISPONIBILITAT · FORMAT ${currentTabFormat.num} +`}
                      >
                        <span>
                          SOL·LICITAR DISPONIBILITAT · FORMAT {currentTabFormat.num} +
                        </span>
                      </span>
                    </span>
                    <div className="btn__divider" />
                  </button>

                  <a
                    href={currentTabFormat.riderLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="btn a24-btn"
                  >
                    <div className="btn__divider" />
                    <span className="btn__p-mask">
                      <span
                        className="btn__p"
                        data-hover-inner
                        data-text="DESCARREGAR RIDER TÈCNIC (PDF) ↗"
                      >
                        <span>DESCARREGAR RIDER TÈCNIC (PDF) ↗</span>
                      </span>
                    </span>
                    <div className="btn__divider" />
                  </a>
                </div>
              </div>
            </div>
          </article>
        </div>
      </section>

      <div className="divider-horizontal" />

      {/* ============================================================
          3. TAULA EDITORIAL DE DOSSIERS I RIDERS OFICIALS
         ============================================================ */}
      <section
        id="documents"
        ref={docsRef}
        className="contract-docs"
        aria-label="Dossiers i riders oficials per a professionals"
      >
        <div className="contract-docs__inner">
          <div className="contract-docs__header">
            <div>
              <span className="subheading-xs block mb-2">
                02 / DOCUMENTACIÓ TÈCNICA I ARTÍSTICA
              </span>
              <h2 className="heading-m">DOSSIERS I RIDERS OFICIALS</h2>
            </div>
            <p className="paragraph-l" style={{ maxWidth: "44ch", margin: 0 }}>
              Material verificat d&apos;accés directe per a caps tècnics de sala,
              programadors culturals, regidories i equips de comunicació.
            </p>
          </div>

          <div className="contract-docs__ledger">
            <div className="contract-docs__ledger-head">
              <span className="subheading-xs">CODI</span>
              <span className="subheading-xs">CATEGORIA</span>
              <span className="subheading-xs">DOCUMENT & ESPECIFICACIONS</span>
              <span className="subheading-xs" style={{ textAlign: "right" }}>
                ACCIÓ DIRECTA
              </span>
            </div>

            {OFFICIAL_DOCUMENTS.map((doc) => (
              <a
                key={doc.idx}
                href={doc.href}
                target="_blank"
                rel="noopener noreferrer"
                className="contract-doc-row"
              >
                <span className="contract-doc-row__idx">{doc.idx}</span>
                <div className="contract-doc-row__cat">
                  <span className="subheading-xs">{doc.category}</span>
                  <span className="contract-doc-row__meta">{doc.meta}</span>
                </div>
                <div className="contract-doc-row__main">
                  <h3 className="contract-doc-row__title">{doc.title}</h3>
                  <p className="contract-doc-row__desc">{doc.description}</p>
                </div>
                <div className="contract-doc-row__action">
                  <span className="contract-doc-row__cta">{doc.actionLabel}</span>
                </div>
              </a>
            ))}
          </div>
        </div>
      </section>

      <div className="divider-horizontal" />

      {/* ============================================================
          4. OFICINA DE MANAGEMENT & CONTRACTACIÓ PÚBLICA
         ============================================================ */}
      <section
        className="contract-management"
        aria-label="Oficina de Management i Contacte Directe"
      >
        <div className="contract-management__inner">
          <div className="contract-management__left">
            <span className="subheading-xs">03 / OFICINA DE MANAGEMENT OFICIAL</span>
            <h2 className="heading-s" style={{ marginTop: "0.4rem" }}>
              GUSMÀ GIL · PPF PRODUCCIONS CULTURALS
            </h2>
            <p className="paragraph-l" style={{ margin: "0.75rem 0 0 0" }}>
              Atenció directa a ajuntaments, diputacions, universitats, festivals i
              circuit internacional. Es realitza facturació i tramitació íntegra a
              través de la Plataforma de Contractació del Sector Públic (FACE / DIR3).
            </p>
          </div>

          <div className="contract-management__right">
            <div className="contract-mgmt-item">
              <span className="subheading-xs">CORREU ELECTRÒNIC OFICIAL</span>
              <a
                href={`mailto:${bookingInfo.managementEmail}`}
                className="contract-mgmt-item__val"
              >
                {bookingInfo.managementEmail} ↗
              </a>
            </div>

            <div className="contract-mgmt-item">
              <span className="subheading-xs">AGÈNCIA REPRESENTANT</span>
              <span className="contract-mgmt-item__val">
                PPF Produccions Culturals
              </span>
            </div>

            <div className="contract-mgmt-item">
              <span className="subheading-xs">SOL·LICITUD IMMEDIATA</span>
              <div style={{ marginTop: "0.5rem" }}>
                <button
                  type="button"
                  onClick={() => handleOpenModal(activeFormatId)}
                  className="btn a24-btn"
                >
                  <div className="btn__divider" />
                  <span className="btn__p-mask">
                    <span
                      className="btn__p"
                      data-hover-inner
                      data-text="OBRIR FORMULARI DE CONTRACTACIÓ +"
                    >
                      <span>OBRIR FORMULARI DE CONTRACTACIÓ +</span>
                    </span>
                  </span>
                  <div className="btn__divider" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          5. PEU EDITORIAL A24 — SEGÜENT PAS
         ============================================================ */}
      <footer className="contract-next-footer">
        <div className="divider-horizontal" />

        <div className="contract-next-footer__inner" style={{ position: "relative" }}>
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

          <span className="subheading-xs">CONTINUAR EXPLORANT L&apos;ARXIU</span>
          <h2 className="heading-l">DISCOGRAFIA & DIRECTES</h2>
          <p className="paragraph-m" style={{ maxWidth: "48ch", margin: 0 }}>
            Consulta l&apos;agenda interactiva de concerts en directe o explora les 10
            produccions discogràfiques essencials de Miquel Gil.
          </p>

          <div className="contract-hero__cta" style={{ marginTop: "0.5rem" }}>
            <Link href="/agenda/" className="btn a24-btn">
              <div className="btn__divider" />
              <span className="btn__p-mask">
                <span
                  className="btn__p"
                  data-hover-inner
                  data-text="VEURE AGENDA DE DIRECTES ↗"
                >
                  <span>VEURE AGENDA DE DIRECTES ↗</span>
                </span>
              </span>
              <div className="btn__divider" />
            </Link>

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

            <Link href="/biografia/" className="btn a24-btn">
              <div className="btn__divider" />
              <span className="btn__p-mask">
                <span
                  className="btn__p"
                  data-hover-inner
                  data-text="LLEGIR BIOGRAFIA OFICIAL ↗"
                >
                  <span>LLEGIR BIOGRAFIA OFICIAL ↗</span>
                </span>
              </span>
              <div className="btn__divider" />
            </Link>
          </div>
        </div>

        <div className="divider-horizontal" />
      </footer>

      {/* ============================================================
          6. POPUP MODAL EDITORIAL A24 (AMB MÉS PADDING LATERAL I ENCAIXAT EN PANTALLA)
         ============================================================ */}
      {isModalOpen && (
        <div
          ref={modalBackdropRef}
          className="contract-modal-backdrop"
          onClick={handleCloseModal}
          role="dialog"
          aria-modal="true"
          aria-labelledby="contract-modal-title"
        >
          <div
            ref={modalCardRef}
            className="contract-modal"
            onClick={(e) => e.stopPropagation()}
          >
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

            <div className="contract-modal__top">
              <div>
                <span className="subheading-xs block mb-1">
                  SOL·LICITUD DE DISPONIBILITAT & PRESSUPOST · RESPOSTA 24/48H
                </span>
                <h2 id="contract-modal-title" className="heading-s">
                  {activeFormatObj.name}
                </h2>
              </div>

              <button
                type="button"
                className="contract-modal__close"
                onClick={handleCloseModal}
                aria-label="Tancar formulari (Esc)"
              >
                <span>TANCAR [ESC]</span>
              </button>
            </div>

            <div className="divider-local" style={{ margin: "0.85rem 0 1rem 0" }} />

            <form
              className="contract-form"
              onSubmit={(e) => {
                e.preventDefault();
                window.location.href = generateMailtoUrl();
              }}
            >
              <div className="contract-fields-row">
                <div className="contract-field-group">
                  <label className="subheading-xs">FORMAT D&apos;ESPECTACLE *</label>
                  <select
                    name="selectedFormat"
                    value={selectedFormat}
                    onChange={(e) => setSelectedFormat(e.target.value)}
                    className="contract-select"
                  >
                    {FORMAT_DETAILS.map((f) => (
                      <option key={f.id} value={f.id}>
                        FORMAT {f.num}: {f.name} ({f.duration})
                      </option>
                    ))}
                  </select>
                </div>

                <div className="contract-field-group">
                  <label className="subheading-xs">
                    ENTITAT, AJUNTAMENT O FESTIVAL *
                  </label>
                  <input
                    type="text"
                    name="entity"
                    placeholder="Ex: Regidoria de Cultura / Festival..."
                    value={formData.entity}
                    onChange={handleInputChange}
                    required
                    className="contract-input"
                  />
                </div>
              </div>

              <div className="contract-fields-row contract-fields-row--3">
                <div className="contract-field-group">
                  <label className="subheading-xs">MUNICIPI O CIUTAT *</label>
                  <input
                    type="text"
                    name="city"
                    placeholder="Ex: València, Manresa..."
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                    className="contract-input"
                  />
                </div>

                <div className="contract-field-group">
                  <label className="subheading-xs">DATA O PERÍODE PREVIST</label>
                  <input
                    type="text"
                    name="date"
                    placeholder="Ex: Octubre 2026"
                    value={formData.date}
                    onChange={handleInputChange}
                    className="contract-input"
                  />
                </div>

                <div className="contract-field-group">
                  <label className="subheading-xs">ESPAI O RECINTE</label>
                  <input
                    type="text"
                    name="venue"
                    placeholder="Ex: Teatre Municipal / Claustre"
                    value={formData.venue}
                    onChange={handleInputChange}
                    className="contract-input"
                  />
                </div>
              </div>

              <div className="contract-fields-row contract-fields-row--3">
                <div className="contract-field-group">
                  <label className="subheading-xs">PERSONA DE CONTACTE *</label>
                  <input
                    type="text"
                    name="contactName"
                    placeholder="Nom i cognoms"
                    value={formData.contactName}
                    onChange={handleInputChange}
                    required
                    className="contract-input"
                  />
                </div>

                <div className="contract-field-group">
                  <label className="subheading-xs">CORREU ELECTRÒNIC *</label>
                  <input
                    type="email"
                    name="email"
                    placeholder="correu@entitat.cat"
                    value={formData.email}
                    onChange={handleInputChange}
                    required
                    className="contract-input"
                  />
                </div>

                <div className="contract-field-group">
                  <label className="subheading-xs">TELÈFON DE CONTACTE</label>
                  <input
                    type="tel"
                    name="phone"
                    placeholder="+34 600 000 000"
                    value={formData.phone}
                    onChange={handleInputChange}
                    className="contract-input"
                  />
                </div>
              </div>

              <div className="contract-field-group">
                <label className="subheading-xs">
                  OBSERVACIONS O NECESSITATS PARTICULARS
                </label>
                <textarea
                  name="notes"
                  rows={2}
                  placeholder="Detalls sobre el cicle, horaris, condicions tècniques o administratives..."
                  value={formData.notes}
                  onChange={handleInputChange}
                  className="contract-textarea"
                />
              </div>

              <div className="contract-modal__submit-wrap">
                <button type="submit" className="btn a24-btn" style={{ width: "100%" }}>
                  <div className="btn__divider" />
                  <span className="btn__p-mask">
                    <span
                      className="btn__p"
                      data-hover-inner
                      data-text={`ENVIAR SOL·LICITUD PER A ${activeFormatObj.name.toUpperCase()} ↗`}
                    >
                      <span>
                        ENVIAR SOL·LICITUD PER A {activeFormatObj.name.toUpperCase()} ↗
                      </span>
                    </span>
                  </span>
                  <div className="btn__divider" />
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
