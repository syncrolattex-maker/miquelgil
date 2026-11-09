"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import Link from "next/link";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import A24Nav from "@/components/A24Nav";
import { bookingInfo, downloads } from "@/lib/site";
import { initDissolve } from "../discografia/[slug]/dissolveEngine";
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
  media: string;
  mediaCaption: string;
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
    media: "/images/miquel-gil-juan-miguel-morales-8-scaled.jpg",
    mediaCaption: "Format Duo Acústic d'Arrel — Veu, guitarra i instruments mediterranis",
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
    media: "/images/miquel-gil-juan-miguel-morales-13-scaled.jpg",
    mediaCaption: "Miquel Gil Trio — Equilibri sonor per a teatres i auditoris",
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
    media: "/images/MiquelGilViatger_Principal.webp",
    mediaCaption: "Banda Completa de Miquel Gil en directe al Teatre Principal de València",
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
    media: "/images/2002espai2.jpg",
    mediaCaption: "Espectacle «Nus» — Complicitat escènica de dos mestres del cant valencià",
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
    media: "/images/miquel-gil-juan-miguel-morales-14-scaled.jpg",
    mediaCaption: "Producció especial per a grans auditoris i estrenes institucionals",
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
    title: "Pack de Fotografies en Alta Resolució",
    description:
      "Imatges promocionals d'autor (Juan Miguel Morales i arxiu oficial) amb drets cedits per a programes de mà, cartelleria i mitjans.",
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
  const docsRef = useRef<HTMLElement>(null);

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
      y: 24,
      duration: 0.22,
      ease: "power2.in",
    }).to(
      backdrop,
      {
        opacity: 0,
        duration: 0.2,
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
  // 2. MOTOR DE DISSOLUCIÓ LÍQUIDA A24 + REVELACIÓ EN CORTINA DE CADA FORMAT
  // ============================================================================
  useEffect(() => {
    if (!containerRef.current) return;
    initDissolve(containerRef.current);

    const ctx = gsap.context(() => {
      const formatRows = containerRef.current?.querySelectorAll<HTMLElement>(
        "[data-format-row]"
      );

      formatRows?.forEach((row) => {
        const topRule = row.querySelector<HTMLElement>(".contract-format-row__rule");
        const numEl = row.querySelector<HTMLElement>(".contract-format-row__num");
        const titleEl = row.querySelector<HTMLElement>(".contract-format-row__title");
        const subEl = row.querySelector<HTMLElement>(".contract-format-row__subtitle");
        const imgWrap = row.querySelector<HTMLElement>(".contract-format-row__img-wrap");
        const imgEl = row.querySelector<HTMLElement>(
          ".contract-format-row__img-wrap img"
        );
        const specBlocks = row.querySelectorAll<HTMLElement>(".contract-spec-block");
        const actionsWrap = row.querySelector<HTMLElement>(
          ".contract-format-row__actions"
        );

        const tl = gsap.timeline({
          scrollTrigger: {
            trigger: row,
            start: "top 84%",
            toggleActions: "play none none reverse",
          },
          defaults: { ease: "power3.out" },
        });

        if (topRule) {
          tl.fromTo(
            topRule,
            { scaleX: 0, transformOrigin: "left center" },
            { scaleX: 1, duration: 0.8, ease: "power3.inOut" },
            0
          );
        }

        if (numEl) {
          tl.fromTo(
            numEl,
            { opacity: 0, y: 28 },
            { opacity: 1, y: 0, duration: 0.7 },
            0.08
          );
        }

        if (titleEl) {
          tl.fromTo(
            titleEl,
            { opacity: 0, y: 34, filter: "blur(8px)" },
            { opacity: 1, y: 0, filter: "blur(0px)", duration: 0.8 },
            0.14
          );
        }

        if (subEl) {
          tl.fromTo(
            subEl,
            { opacity: 0, y: 22 },
            { opacity: 1, y: 0, duration: 0.65 },
            0.24
          );
        }

        if (imgWrap) {
          tl.fromTo(
            imgWrap,
            { clipPath: "inset(0% 100% 0% 0%)", opacity: 0 },
            {
              clipPath: "inset(0% 0% 0% 0%)",
              opacity: 1,
              duration: 0.95,
              ease: "power3.inOut",
            },
            0.16
          );
        }

        if (imgEl) {
          tl.fromTo(
            imgEl,
            { scale: 1.18 },
            { scale: 1, duration: 1.15, ease: "power3.out" },
            0.16
          );
        }

        if (specBlocks.length) {
          tl.fromTo(
            specBlocks,
            { opacity: 0, y: 22 },
            { opacity: 1, y: 0, duration: 0.65, stagger: 0.07 },
            0.32
          );
        }

        if (actionsWrap) {
          tl.fromTo(
            actionsWrap,
            { opacity: 0, y: 18 },
            { opacity: 1, y: 0, duration: 0.6 },
            0.52
          );
        }
      });
    }, containerRef);

    return () => ctx.revert();
  }, []);

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
      { opacity: 1, duration: 0.3, ease: "power2.out" }
    );

    tl.fromTo(
      card,
      { opacity: 0, y: 36 },
      { opacity: 1, y: 0, duration: 0.45, ease: "power3.out" },
      "-=0.18"
    );

    if (closeBtn) {
      tl.fromTo(
        closeBtn,
        { opacity: 0, scale: 0.8 },
        { opacity: 1, scale: 1, duration: 0.25, ease: "power2.out" },
        "-=0.25"
      );
    }

    if (formFields.length > 0) {
      tl.fromTo(
        formFields,
        { opacity: 0, y: 14 },
        { opacity: 1, y: 0, duration: 0.3, stagger: 0.035, ease: "power2.out" },
        "-=0.25"
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
          1 & 2. TRACK DE REVELACIÓ AMB SEPARADOR LÍQUID A24
         ============================================================ */}
      <div data-dissolve-track="" className="reveal-track">
        {/* 1. HERO DE CONTRACTACIÓ (CORTINA BLANCA SUPERIOR) */}
        <section
          id="contract_hero"
          ref={heroRef}
          data-dissolve=""
          className="contract-hero"
        >
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
                  onClick={() => handleOpenModal("duo")}
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

        {/* 2. SECCIÓ D'IMATGE DE FONS A PANTALLA COMPLETA (100VH SOTA LA CORTINA LÍQUIDA) */}
        <section
          data-theme-change="nav:base"
          className="contract-stage-bleed theme-dark"
        >
          <div data-dissolve-bleed="" className="contract-stage-bleed__vh">
            <img
              src="/images/MiquelGilViatger_Principal.webp"
              alt="Miquel Gil en directe al Teatre Principal de València"
              className="contract-stage-bleed__bg"
            />
            <div className="contract-stage-bleed__overlay" />

            <div className="contract-stage-bleed__content">
              <span
                className="subheading-xs"
                style={{ color: "rgba(255, 255, 255, 0.72)" }}
              >
                PRODUCCIÓ ESCÈNICA & DIVERSITAT DE FORMATS
              </span>
              <blockquote className="contract-stage-quote">
                “Cinc formats de concert concebuts amb rigor escènic i adaptables a
                qualsevol espai: des de la intimitat acústica d’un claustre fins a la
                plenitud simfònica dels grans auditoris.”
              </blockquote>
              <span
                className="subheading-xs"
                style={{ color: "rgba(255, 255, 255, 0.55)" }}
              >
                GIRA VIATGER & ANTOLOGIA MEDITERRÀNIA (2026 — 2027)
              </span>

              <div style={{ marginTop: "1rem" }}>
                <button
                  type="button"
                  onClick={() => handleOpenModal("banda")}
                  className="btn a24-btn"
                >
                  <div className="btn__divider" />
                  <span className="btn__p-mask">
                    <span
                      className="btn__p"
                      data-hover-inner
                      data-text="CONSULTAR DATES I PRESSUPOST +"
                    >
                      <span>CONSULTAR DATES I PRESSUPOST +</span>
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
          3. CATÀLEG EDITORIAL OBERT DELS 5 FORMATS DE CONCERT
             Sense caixes ni targetes arrodonides: estructura editorial A24
         ============================================================ */}
      <section
        id="formats"
        ref={formatsRef}
        className="contract-formats"
        aria-label="Catàleg dels 5 formats de concert"
      >
        <div className="contract-formats__header">
          <div>
            <span className="subheading-xs block mb-2">
              01 / CATÀLEG D&apos;ESPECTACLES EN ACTIU
            </span>
            <h2 className="heading-m">FORMATS DE CONCERT</h2>
          </div>
          <p className="paragraph-l" style={{ maxWidth: "46ch", margin: 0 }}>
            Cadascun dels cinc formats disposa de fitxa artística pròpia, requeriments
            tècnics dimensionats a l&apos;espai i repertori adaptable per a ajuntaments,
            teatres, cicles culturals i festivals.
          </p>
        </div>

        {/* Barra d'accés ràpid tabular als 5 formats */}
        <div className="divider-horizontal" />
        <div className="contract-formats__index">
          {FORMAT_DETAILS.map((fmt) => (
            <a
              key={fmt.id}
              href={`#format-${fmt.id}`}
              className="contract-index-cell"
            >
              <div className="contract-index-cell__top">
                <span className="subheading-xs">FORMAT {fmt.num}</span>
                <span className="subheading-xs">{fmt.duration}</span>
              </div>
              <span className="contract-index-cell__name">{fmt.name}</span>
              <span className="paragraph-m" style={{ opacity: 0.68 }}>
                {fmt.subtitle}
              </span>
            </a>
          ))}
        </div>
        <div className="divider-horizontal" />

        {/* Desplegament editorial de cada format */}
        <div className="contract-formats__list">
          {FORMAT_DETAILS.map((fmt) => (
            <article
              key={fmt.id}
              id={`format-${fmt.id}`}
              data-format-row
              className="contract-format-row"
            >
              <div className="contract-format-row__rule" />

              <div className="contract-format-row__inner">
                {/* Capçalera del format */}
                <div className="contract-format-row__top">
                  <span className="contract-format-row__num">{fmt.num}</span>
                  <div className="contract-format-row__headings">
                    <span className="subheading-xs">{fmt.badge}</span>
                    <h3 className="contract-format-row__title">{fmt.name}</h3>
                    <p className="contract-format-row__subtitle">{fmt.subtitle}</p>
                  </div>
                  <div className="contract-format-row__duration">
                    <span className="subheading-xs">DURADA ESCÈNICA</span>
                    <span className="paragraph-m font-medium">{fmt.duration}</span>
                  </div>
                </div>

                {/* Cos del format: Fotografia + Especificacions obertes */}
                <div className="contract-format-row__body">
                  {/* Columna visual */}
                  <figure className="contract-format-row__figure">
                    <div className="contract-format-row__img-wrap">
                      <img
                        src={fmt.media}
                        alt={fmt.name}
                        loading="lazy"
                        decoding="async"
                      />
                    </div>
                    <figcaption className="contract-format-row__caption">
                      <span>{fmt.mediaCaption}</span>
                      <span>FORMAT {fmt.num} / 05</span>
                    </figcaption>
                  </figure>

                  {/* Columna d'especificacions tècniques i artístiques */}
                  <div className="contract-format-row__specs">
                    <div className="contract-spec-block">
                      <span className="subheading-xs">FORMACIÓ A L&apos;ESCENARI</span>
                      <ul className="contract-musicians-list">
                        {fmt.musicians.map((m, idx) => (
                          <li key={idx} className="paragraph-m font-medium">
                            {m}
                          </li>
                        ))}
                      </ul>
                    </div>

                    <div className="contract-spec-grid">
                      <div className="contract-spec-block">
                        <span className="subheading-xs">ESPAIS I AFORAMENTS IDEALS</span>
                        <p className="paragraph-m" style={{ margin: 0 }}>
                          {fmt.idealVenues}
                        </p>
                      </div>

                      <div className="contract-spec-block">
                        <span className="subheading-xs">REFERÈNCIA RECENT</span>
                        <p className="paragraph-m font-medium" style={{ margin: 0 }}>
                          {fmt.recentHighlight}
                        </p>
                      </div>
                    </div>

                    <div className="contract-spec-block">
                      <span className="subheading-xs">
                        SÍNTESI DE REQUERIMENTS TÈCNICS (SO I LLUM)
                      </span>
                      <p className="paragraph-m" style={{ margin: 0 }}>
                        {fmt.technicalSummary}
                      </p>
                    </div>

                    {/* Botons A24 del format */}
                    <div className="contract-format-row__actions">
                      <button
                        type="button"
                        onClick={() => handleOpenModal(fmt.id)}
                        className="btn a24-btn"
                      >
                        <div className="btn__divider" />
                        <span className="btn__p-mask">
                          <span
                            className="btn__p"
                            data-hover-inner
                            data-text={`SOL·LICITAR FORMAT ${fmt.num} +`}
                          >
                            <span>SOL·LICITAR FORMAT {fmt.num} +</span>
                          </span>
                        </span>
                        <div className="btn__divider" />
                      </button>

                      <a
                        href={fmt.riderLink}
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
              </div>
            </article>
          ))}
        </div>
      </section>

      <div className="divider-horizontal" />

      {/* ============================================================
          4. TAULA EDITORIAL DE DOSSIERS I RIDERS OFICIALS
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
          5. OFICINA DE MANAGEMENT & CONTRACTACIÓ PÚBLICA
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
                  onClick={() => handleOpenModal("duo")}
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
          6. PEU EDITORIAL A24 — SEGÜENT PAS
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
          <h2 className="heading-l">DISCOGRAFIA & AGENDA</h2>
          <p className="paragraph-m" style={{ maxWidth: "48ch", margin: 0 }}>
            Consulta les pròximes dates en directe de la gira actual o explora les 10
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
          7. MODAL EDITORIAL A24 DE SOL·LICITUD DE DISPONIBILITAT
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
                <span className="subheading-xs block mb-2">
                  SOL·LICITUD DE DISPONIBILITAT & PRESSUPOST
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

            <div className="divider-local" style={{ margin: "1.25rem 0" }} />

            <p className="paragraph-m" style={{ margin: "0 0 1.5rem 0", opacity: 0.78 }}>
              Completa les dades de l&apos;esdeveniment i l&apos;oficina de management (
              {bookingInfo.managementEmail}) respondrà amb disponibilitat i proposta
              econòmica detallada en 24-48 hores.
            </p>

            <form
              className="contract-form"
              onSubmit={(e) => {
                e.preventDefault();
                window.location.href = generateMailtoUrl();
              }}
            >
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
                      FORMAT {f.num}: {f.name} — {f.subtitle} ({f.duration})
                    </option>
                  ))}
                </select>
              </div>

              <div className="contract-fields-row">
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

                <div className="contract-field-group">
                  <label className="subheading-xs">MUNICIPI O CIUTAT *</label>
                  <input
                    type="text"
                    name="city"
                    placeholder="Ex: València, Alcoi, Manresa..."
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                    className="contract-input"
                  />
                </div>
              </div>

              <div className="contract-fields-row">
                <div className="contract-field-group">
                  <label className="subheading-xs">DATA O PERÍODE PREVIST</label>
                  <input
                    type="text"
                    name="date"
                    placeholder="Ex: Octubre 2026 / Tardor 2026"
                    value={formData.date}
                    onChange={handleInputChange}
                    className="contract-input"
                  />
                </div>

                <div className="contract-field-group">
                  <label className="subheading-xs">ESPAI O RECINTE PREVIST</label>
                  <input
                    type="text"
                    name="venue"
                    placeholder="Ex: Teatre Municipal / Claustre / Plaça"
                    value={formData.venue}
                    onChange={handleInputChange}
                    className="contract-input"
                  />
                </div>
              </div>

              <div className="contract-fields-row">
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

              <div className="contract-field-group">
                <label className="subheading-xs">
                  OBSERVACIONS O NECESSITATS PARTICULARS
                </label>
                <textarea
                  name="notes"
                  rows={3}
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
