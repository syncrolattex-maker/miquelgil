"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import gsap from "gsap";
import { bookingInfo, downloads } from "@/lib/site";
import InkBloom from "@/components/InkBloom";

interface FormatDetail {
  id: string;
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
    name: "Duo Acústic d'Arrel",
    subtitle: "Miquel Gil & Eduard Navarro",
    musicians: [
      "Miquel Gil (veu principal i guitarra acústica)",
      "Eduard Navarro (dolçaina, gralla, xirimia, ney, duduc, cítola, moraharpa)",
    ],
    duration: "60 — 75 minuts",
    idealVenues: "Claustres, ermites, museus, auditoris de cambra i festivals de paisatge.",
    recentHighlight: "Can Soler (Mataró), Festival 2 Terços (2026).",
    technicalSummary: "2 línies de veu, microfonia d'instruments acústics de vent i corda, 2 enviaments de monitor/in-ear. Il·luminació càlida de proximitat.",
    riderLink: "https://drive.google.com/open?id=1R9nioosA6mmmuegtHsc2TClQRR1iIFDl",
    badge: "Format Íntim",
  },
  {
    id: "trio",
    name: "Miquel Gil Trio",
    subtitle: "Veu, Teclats i Baix Elèctric",
    musicians: [
      "Miquel Gil (veu principal i guitarra)",
      "Nelo Alfonso (teclats, sintetitzadors, piano i cors)",
      "Gusmà Gil (baix elèctric)",
    ],
    duration: "70 — 75 minuts",
    idealVenues: "Teatres municipals, cases de cultura, sales de mitjà aforament i cicles de cançó.",
    recentHighlight: "Teatre Kursaal de Manresa (abril 2024).",
    technicalSummary: "D.I. estèreo de teclats, D.I. de baix elèctric, veu principal i guitarra electroacústica, 3 mescles de monitor.",
    riderLink: "https://drive.google.com/open?id=1SfJ6nymMaJlXS7g4FYKcYQZH_S6gi8a1",
    badge: "Format Versàtil",
  },
  {
    id: "banda",
    name: "Banda Completa (6 Músics)",
    subtitle: "La màxima riquesa tímbrica i sonora",
    musicians: [
      "Miquel Gil (veu principal i guitarra)",
      "Toni Porcar (guitarra flamenca i elèctrica)",
      "Eduard Navarro (instruments tradicionals de vent i corda)",
      "Nelo Alfonso (teclats i sintetitzadors)",
      "José María Reillo (bateria mediterrània i percussions tradicionals)",
      "Gusmà Gil (baix elèctric)",
    ],
    duration: "90 minuts",
    idealVenues: "Grans teatres, places majors, auditoris a l'aire lliure i festivals d'estiu.",
    recentHighlight: "Gira 20 anys d'Orgànic a l'ETNO de València (abril 2023).",
    technicalSummary: "Sistema P.A. dimensionat, set complet de percussions microfades, 6 mescles independents, disseny d'il·luminació escènica.",
    riderLink: "https://drive.google.com/open?id=1R9nioosA6mmmuegtHsc2TClQRR1iIFDl",
    badge: "Gran Format",
  },
  {
    id: "nus",
    name: "«Nus» amb Pep Gimeno «Botifarra»",
    subtitle: "Diàleg íntim entre dues veus cabdals de la tradició",
    musicians: [
      "Miquel Gil (veu i guitarra acústica)",
      "Pep Gimeno «Botifarra» (veu, pandereta, postisses i percussions)",
    ],
    duration: "75 — 80 minuts",
    idealVenues: "Teatres, auditoris culturals i trobades de música d'arrel.",
    recentHighlight: "Més de tres anys de gira conjunta amb entrades exhaurides arreu del país.",
    technicalSummary: "2 micròfons de veu d'alta sensibilitat, microfonia d'instruments acústics i percussió de mà, 2 monitors.",
    riderLink: "https://drive.google.com/open?id=1SfJ6nymMaJlXS7g4FYKcYQZH_S6gi8a1",
    badge: "Espectacle Compartit",
  },
  {
    id: "estrena",
    name: "Estrena amb Convidats",
    subtitle: "Produccions Simfòniques i Grans Esdeveniments",
    musicians: [
      "Banda Completa de Miquel Gil",
      "Artistes convidats de l'escena musical segons repertori i projecte",
    ],
    duration: "90 — 100 minuts",
    idealVenues: "Teatres principals, festivals inaugurals i auditoris simfònics.",
    recentHighlight: "Palau de la Música de València (2019) i Teatre Principal de València (2024).",
    technicalSummary: "Rider tècnic ampliat amb producció escenogràfica i tècnica a mida.",
    riderLink: "https://drive.google.com/open?id=1R9nioosA6mmmuegtHsc2TClQRR1iIFDl",
    badge: "Producció Especial",
  },
];

export default function ContractacioClient() {
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

  // Open modal with specific format preselected
  const handleOpenModal = (formatId: string) => {
    setSelectedFormat(formatId);
    setIsModalOpen(true);
  };

  // Smooth GSAP Close animation
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
      y: 25,
      scale: 0.94,
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

  // GSAP Entrance animation when modal opens
  useEffect(() => {
    if (!isModalOpen) return;

    const backdrop = modalBackdropRef.current;
    const card = modalCardRef.current;
    if (!backdrop || !card) return;

    const header = card.querySelector(".contract-modal-header");
    const closeBtn = card.querySelector(".contract-modal-close");
    const formFields = card.querySelectorAll(".contract-field-group, .contract-fields-row, .contract-submit-btn");

    const tl = gsap.timeline();
    modalTimelineRef.current = tl;

    tl.fromTo(
      backdrop,
      { opacity: 0 },
      { opacity: 1, duration: 0.32, ease: "power2.out" }
    );

    tl.fromTo(
      card,
      {
        opacity: 0,
        y: 40,
        scale: 0.92,
      },
      {
        opacity: 1,
        y: 0,
        scale: 1,
        duration: 0.46,
        ease: "power3.out",
      },
      "-=0.2"
    );

    if (closeBtn) {
      tl.fromTo(
        closeBtn,
        { opacity: 0, scale: 0.6, rotation: -90 },
        { opacity: 1, scale: 1, rotation: 0, duration: 0.3, ease: "back.out(2)" },
        "-=0.28"
      );
    }

    if (formFields.length > 0) {
      tl.fromTo(
        formFields,
        { opacity: 0, y: 12 },
        { opacity: 1, y: 0, duration: 0.3, stagger: 0.035, ease: "power2.out" },
        "-=0.25"
      );
    }
  }, [isModalOpen]);

  // Keyboard shortcut: Escape to close
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && isModalOpen) {
        handleCloseModal();
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isModalOpen, handleCloseModal]);

  const generateMailtoUrl = () => {
    const subject = `Sol·licitud de contractació: ${activeFormatObj.name} — ${formData.city || "Nova data"}`;
    const body = `Hola equip de management de Miquel Gil,

Us contacte des de ${formData.entity || "la nostra entitat / ajuntament / festival"} per sol·licitar disponibilitat i pressupost per al concert:

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
    <div className="contract-page">
      {/* ============================================================
          HERO EDITORIAL
          ============================================================ */}
      <header className="contract-hero">
        {/* InkBloom Effect at the top */}
        <InkBloom
          edge="top"
          color="#b80018"
          colorOuter="#ff0528"
          ground="transparent"
        />

        <div className="contract-hero-inner">
          <span className="contract-hero-eyebrow">
            Management & Programació // Temporada 2026 — 2027
          </span>
          <h1 className="contract-hero-title">Contractació</h1>
          <p className="contract-hero-lead">
            Cinc formats de concert pensats com a productes escènics clars i adaptables a
            qualsevol espai: des de la màxima intimitat acústica d&apos;un claustre patrimonial
            en format Duo fins a la potència d&apos;un festival a l&apos;aire lliure amb la Banda
            Completa.
          </p>

          <div className="contract-hero-pills">
            <a href="#formats" className="contract-quick-pill">
              5 Formats disponibles
            </a>
            <a href="#documents" className="contract-quick-pill">
              Riders tècnics (PDF)
            </a>
            <a href="#documents" className="contract-quick-pill">
              Dossier artístic
            </a>
            <button
              type="button"
              className="contract-quick-pill contract-quick-pill--red"
              onClick={() => handleOpenModal("duo")}
            >
              Sol·licitar disponibilitat
            </button>
          </div>
        </div>
      </header>

      {/* ============================================================
          SECCIÓ 1: ELS 5 FORMATS COM A PRODUCTES CLARS
          ============================================================ */}
      <section id="formats" className="contract-section">
        <div className="contract-section-inner">
          <div className="contract-section-header">
            <span className="contract-section-kicker">Catàleg d&apos;espectacles</span>
            <h2 className="contract-section-title">Formats de concert</h2>
            <p className="contract-section-subtitle">
              Cadascun dels formats disposa de fitxa artística, necessitats tècniques
              dimensionades i repertori adaptable.
            </p>
          </div>

          <div className="contract-formats-grid">
            {FORMAT_DETAILS.map((fmt) => (
              <div key={fmt.id} className="contract-format-card">
                <div className="contract-card-top">
                  <span className="contract-card-badge">{fmt.badge}</span>
                  <span className="contract-card-duration">{fmt.duration}</span>
                </div>

                <h3 className="contract-card-name">{fmt.name}</h3>
                <p className="contract-card-sub">{fmt.subtitle}</p>

                <div className="contract-card-details">
                  <div className="contract-detail-block">
                    <span className="contract-detail-label">Músics a l&apos;escenari:</span>
                    <ul className="contract-musicians-list">
                      {fmt.musicians.map((m, idx) => (
                        <li key={idx}>{m}</li>
                      ))}
                    </ul>
                  </div>

                  <div className="contract-detail-block">
                    <span className="contract-detail-label">Espais ideals:</span>
                    <p className="contract-detail-text">{fmt.idealVenues}</p>
                  </div>

                  <div className="contract-detail-block">
                    <span className="contract-detail-label">Exemple recent de referència:</span>
                    <p className="contract-detail-text contract-detail-text--highlight">
                      {fmt.recentHighlight}
                    </p>
                  </div>

                  <div className="contract-detail-block">
                    <span className="contract-detail-label">Requeriments tècnics bàsics:</span>
                    <p className="contract-detail-text">{fmt.technicalSummary}</p>
                  </div>
                </div>

                <div className="contract-card-actions">
                  {/* Clicking this button opens the booking modal preselected for this format */}
                  <button
                    type="button"
                    className="contract-card-btn contract-card-btn--primary"
                    onClick={() => handleOpenModal(fmt.id)}
                  >
                    Demanar disponibilitat
                  </button>

                  <a
                    href={fmt.riderLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="contract-card-btn contract-card-btn--secondary"
                    title={`Descarregar Rider tècnic de ${fmt.name}`}
                  >
                    <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                      <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
                    </svg>
                    <span>Rider tècnic</span>
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ============================================================
          SECCIÓ 2: CENTRE DE DESCÀRREGA DE DOCUMENTS I RIDERS
          ============================================================ */}
      <section id="documents" className="contract-section contract-section--alt">
        <div className="contract-section-inner">
          <div className="contract-section-header">
            <span className="contract-section-kicker">Material per a professionals</span>
            <h2 className="contract-section-title">Dossiers i riders oficials</h2>
            <p className="contract-section-subtitle">
              Documentació tècnica, plans d&apos;escenari i dossiers artístics per a caps
              tècnics, programadors i equips de producció.
            </p>
          </div>

          <div className="contract-docs-grid">
            <div className="contract-doc-card">
              <div className="contract-doc-icon">
                <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  <polyline points="14 2 14 8 20 8" />
                  <line x1="16" y1="13" x2="8" y2="13" />
                  <line x1="16" y1="17" x2="8" y2="17" />
                  <polyline points="10 9 9 9 8 9" />
                </svg>
              </div>
              <div className="contract-doc-info">
                <h4 className="contract-doc-title">Dossier Artístic de Gira 2026/27</h4>
                <p className="contract-doc-desc">
                  Biografia actualitzada, trajectòria, fitxes dels 5 formats de concert,
                  repertori i reculls de premsa.
                </p>
                <span className="contract-doc-meta">Format PDF · Actualitzat octubre 2026</span>
              </div>
              <a
                href={downloads[0]?.links[0]?.href || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="contract-doc-download-btn"
              >
                <span>Descarregar</span>
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
                </svg>
              </a>
            </div>

            <div className="contract-doc-card">
              <div className="contract-doc-icon">
                <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" />
                  <path d="M19.07 4.93a10 10 0 0 1 0 14.14M15.54 8.46a5 5 0 0 1 0 7.07" />
                </svg>
              </div>
              <div className="contract-doc-info">
                <h4 className="contract-doc-title">Rider Tècnic Banda Completa</h4>
                <p className="contract-doc-desc">
                  Taula d&apos;entrades (Input List), plànol d&apos;escenari (Stage Plot), microfonia,
                  necessitats de monitoratge i sistema de so.
                </p>
                <span className="contract-doc-meta">Format PDF · Document oficial</span>
              </div>
              <a
                href={downloads[5]?.links[0]?.href || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="contract-doc-download-btn"
              >
                <span>Descarregar</span>
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
                </svg>
              </a>
            </div>

            <div className="contract-doc-card">
              <div className="contract-doc-icon">
                <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <path d="M12 2v20M17 5H9.5a3.5 3.5 0 0 0 0 7h5a3.5 3.5 0 0 1 0 7H6" />
                </svg>
              </div>
              <div className="contract-doc-info">
                <h4 className="contract-doc-title">Rider Acústic Duo & Trio</h4>
                <p className="contract-doc-desc">
                  Requeriments tècnics simplificats per a espais patrimonials, auditoris
                  petits, claustres i teatres de petit aforament.
                </p>
                <span className="contract-doc-meta">Format PDF · Document oficial</span>
              </div>
              <a
                href={downloads[5]?.links[1]?.href || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="contract-doc-download-btn"
              >
                <span>Descarregar</span>
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4M7 10l5 5 5-5M12 15V3" />
                </svg>
              </a>
            </div>

            <div className="contract-doc-card">
              <div className="contract-doc-icon">
                <svg viewBox="0 0 24 24" width="28" height="28" fill="none" stroke="currentColor" strokeWidth="1.8">
                  <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                  <circle cx="8.5" cy="8.5" r="1.5" />
                  <polyline points="21 15 16 10 5 21" />
                </svg>
              </div>
              <div className="contract-doc-info">
                <h4 className="contract-doc-title">Pack de Fotografies en Alta Resolució</h4>
                <p className="contract-doc-desc">
                  Imatges promocionals d&apos;autor (Juan Miguel Morales i Eva Balcells) amb
                  drets cedits per a cartelleria i premsa cultural.
                </p>
                <span className="contract-doc-meta">Enllaç directe a Google Drive</span>
              </div>
              <a
                href={downloads[2]?.links[0]?.href || "#"}
                target="_blank"
                rel="noopener noreferrer"
                className="contract-doc-download-btn"
              >
                <span>Obrir carpeta</span>
                <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                  <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3" />
                </svg>
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          OFICINA DE MANAGEMENT EN PETIT (Discret, compacte i elegant)
          ============================================================ */}
      <section className="contract-mgmt-compact-section" aria-label="Oficina de Management">
        <div className="contract-mgmt-compact-inner">
          <div className="contract-mgmt-compact-header">
            <span className="contract-mgmt-compact-badge">Oficina de Management</span>
            <span className="contract-mgmt-compact-title">Gusmà Gil · PPF Produccions Culturals</span>
          </div>

          <div className="contract-mgmt-compact-info">
            <a
              href={`mailto:${bookingInfo.managementEmail}`}
              className="contract-mgmt-compact-link"
              title="Enviar correu a management"
            >
              <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z" />
                <polyline points="22,6 12,13 2,6" />
              </svg>
              <span>{bookingInfo.managementEmail}</span>
            </a>
            <span className="contract-mgmt-compact-sep">·</span>
            <span className="contract-mgmt-compact-text">Direcció de Producció i Booking Oficial</span>
            <span className="contract-mgmt-compact-sep">·</span>
            <span className="contract-mgmt-compact-note">
              Admet contractació directa i tramitació mitjançant Plataforma de Contractació Pública
            </span>
          </div>
        </div>
      </section>

      {/* ============================================================
          POPUP MODAL DEL FORMULARI (ANIMACIÓ GSAP PER AL FORMAT SELECCIONAT)
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
            className="contract-modal-card"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Botó de tancament 'X' */}
            <button
              type="button"
              className="contract-modal-close"
              onClick={handleCloseModal}
              aria-label="Tancar formulari (Esc)"
              title="Tancar formulari (Esc)"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" style={{ pointerEvents: "none" }}>
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
            </button>

            {/* Capçalera del Modal */}
            <div className="contract-modal-header">
              <span className="contract-modal-kicker">Sol·licitud de Disponibilitat</span>
              <h2 id="contract-modal-title" className="contract-modal-title">
                {activeFormatObj.name}
              </h2>
              <p className="contract-modal-desc">
                Ompli aquest formulari i l&apos;equip de management de Miquel Gil respondrà amb
                la disponibilitat i pressupost detallat en 24-48 hores.
              </p>

              {/* Format Preseleccionat Indicator */}
              <div className="contract-modal-format-badge">
                <span className="format-badge-dot" />
                <span>Format preseleccionat: <strong>{activeFormatObj.name}</strong> ({activeFormatObj.duration})</span>
              </div>
            </div>

            {/* Formulari amb acció Mailto */}
            <form
              className="contract-form"
              onSubmit={(e) => {
                e.preventDefault();
                window.location.href = generateMailtoUrl();
              }}
            >
              {/* Selector de format (per si vol canviar) */}
              <div className="contract-field-group">
                <label className="contract-label">Format de concert *</label>
                <select
                  name="selectedFormat"
                  value={selectedFormat}
                  onChange={(e) => setSelectedFormat(e.target.value)}
                  className="contract-select"
                >
                  {FORMAT_DETAILS.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.name} — {f.subtitle} ({f.duration})
                    </option>
                  ))}
                </select>
              </div>

              <div className="contract-fields-row">
                <div className="contract-field-group">
                  <label className="contract-label">Entitat, Ajuntament o Festival *</label>
                  <input
                    type="text"
                    name="entity"
                    placeholder="Ex: Regidoria de Cultura de..."
                    value={formData.entity}
                    onChange={handleInputChange}
                    required
                    className="contract-input"
                  />
                </div>

                <div className="contract-field-group">
                  <label className="contract-label">Municipi o Comarca *</label>
                  <input
                    type="text"
                    name="city"
                    placeholder="Ex: Alcoi, Gandia, Manresa..."
                    value={formData.city}
                    onChange={handleInputChange}
                    required
                    className="contract-input"
                  />
                </div>
              </div>

              <div className="contract-fields-row">
                <div className="contract-field-group">
                  <label className="contract-label">Data o període previst</label>
                  <input
                    type="text"
                    name="date"
                    placeholder="Ex: Juliol 2026 / Tardor 2026"
                    value={formData.date}
                    onChange={handleInputChange}
                    className="contract-input"
                  />
                </div>

                <div className="contract-field-group">
                  <label className="contract-label">Espai / Recinte previst</label>
                  <input
                    type="text"
                    name="venue"
                    placeholder="Ex: Teatre Municipal / Plaça Major"
                    value={formData.venue}
                    onChange={handleInputChange}
                    className="contract-input"
                  />
                </div>
              </div>

              <div className="contract-fields-row">
                <div className="contract-field-group">
                  <label className="contract-label">Persona de contacte *</label>
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
                  <label className="contract-label">Correu electrònic *</label>
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
                <label className="contract-label">Telèfon de contacte</label>
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
                <label className="contract-label">Observacions o necessitats particulars</label>
                <textarea
                  name="notes"
                  rows={3}
                  placeholder="Detalls sobre l'esdeveniment, cicle de concerts, condicions particulars d'escenari..."
                  value={formData.notes}
                  onChange={handleInputChange}
                  className="contract-textarea"
                />
              </div>

              <button type="submit" className="contract-submit-btn">
                <span>Generar i Enviar Sol·licitud per a {activeFormatObj.name}</span>
                <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
