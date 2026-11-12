"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Concert,
  ConcertStatus,
  FORMAT_PRESETS,
  PALETTE_SWATCHES,
} from "@/types/concert";
import {
  getConcerts,
  saveConcert,
  deleteConcert,
  quickUpdateStatus,
  resetToDefaults,
  subscribeToConcerts,
} from "@/lib/concertsService";
import { isSupabaseConfigured } from "@/lib/supabase";
import "./admin.css";

// Clau mestra per defecte per a la gestió directa sense codi
const MASTER_KEY = "mgil2026";
const AUTH_STORAGE_KEY = "miquel_gil_admin_logged_in";

/* -------------------------------------------------------------------------
   ICONES MINIMALISTES (1.5px stroke, coherents amb l'estètica editorial)
   ------------------------------------------------------------------------- */
function IconSearch() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-3.5-3.5" />
    </svg>
  );
}

function IconPlus() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" aria-hidden="true">
      <path d="M12 5v14M5 12h14" />
    </svg>
  );
}

function IconReset() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
      <path d="M3 3v5h5" />
    </svg>
  );
}

function IconEdit() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 20h9" />
      <path d="M16.5 3.5a2.1 2.1 0 0 1 3 3L7 19l-4 1 1-4Z" />
    </svg>
  );
}

function IconDuplicate() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <rect x="9" y="9" width="11" height="11" rx="2" />
      <path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" />
    </svg>
  );
}

function IconTrash() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 6h18" />
      <path d="M8 6V4a1 1 0 0 1 1-1h6a1 1 0 0 1 1 1v2" />
      <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6" />
    </svg>
  );
}

function IconPin() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M12 21s-6-5.3-6-11a6 6 0 1 1 12 0c0 5.7-6 11-6 11Z" />
      <circle cx="12" cy="10" r="2.2" />
    </svg>
  );
}

function IconTicket() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M3 9a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v1a2 2 0 0 0 0 4v1a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-1a2 2 0 0 0 0-4V9Z" />
      <path d="M13 7v10" strokeDasharray="2 2" />
    </svg>
  );
}

function IconStar() {
  return (
    <svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M12 2.5 14.9 8.4l6.5.9-4.7 4.6 1.1 6.5L12 17.3l-5.8 3.1 1.1-6.5-4.7-4.6 6.5-.9L12 2.5Z" />
    </svg>
  );
}

function IconClock() {
  return (
    <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </svg>
  );
}

function IconClose() {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" aria-hidden="true">
      <path d="M18 6 6 18M6 6l12 12" />
    </svg>
  );
}

function IconEye({ open }: { open: boolean }) {
  return open ? (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M2 12s3.5-7 10-7 10 7 10 7-3.5 7-10 7-10-7-10-7Z" />
      <circle cx="12" cy="12" r="3" />
    </svg>
  ) : (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M10.6 5.1A10.6 10.6 0 0 1 12 5c6.5 0 10 7 10 7a16.8 16.8 0 0 1-3.2 4.2" />
      <path d="M6.6 6.6A16.5 16.5 0 0 0 2 12s3.5 7 10 7a10.4 10.4 0 0 0 5.4-1.5" />
      <path d="M3 3l18 18" />
    </svg>
  );
}

function IconCheck() {
  return (
    <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M20 6 9 17l-5-5" />
    </svg>
  );
}

export default function AdminClient() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [passwordInput, setPasswordInput] = useState<string>("");
  const [showPassword, setShowPassword] = useState<boolean>(false);
  const [authError, setAuthError] = useState<string>("");

  const [concerts, setConcerts] = useState<Concert[]>([]);
  const [loading, setLoading] = useState<boolean>(true);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [toastMessage, setToastMessage] = useState<string>("");

  // Editor Modal State
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [editingConcert, setEditingConcert] = useState<Partial<Concert> | null>(null);

  // Comprovació d'inici de sessió
  useEffect(() => {
    if (typeof window !== "undefined") {
      const stored = sessionStorage.getItem(AUTH_STORAGE_KEY);
      if (stored === "true") {
        setIsAuthenticated(true);
      }
    }
  }, []);

  // Càrrega de concerts i subscripció
  useEffect(() => {
    let isMounted = true;
    getConcerts().then((data) => {
      if (isMounted) {
        setConcerts(data);
        setLoading(false);
      }
    });

    const unsubscribe = subscribeToConcerts((updated) => {
      if (isMounted) setConcerts(updated);
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const showToast = (msg: string) => {
    setToastMessage(msg);
    setTimeout(() => setToastMessage(""), 3500);
  };

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (passwordInput.trim() === MASTER_KEY) {
      setIsAuthenticated(true);
      if (typeof window !== "undefined") {
        sessionStorage.setItem(AUTH_STORAGE_KEY, "true");
      }
      setAuthError("");
    } else {
      setAuthError("Clau d'accés incorrecta. Torna-ho a provar.");
    }
  };

  const handleLogout = () => {
    setIsAuthenticated(false);
    if (typeof window !== "undefined") {
      sessionStorage.removeItem(AUTH_STORAGE_KEY);
    }
  };

  // Filtres
  const filteredConcerts = useMemo(() => {
    return concerts.filter((c) => {
      const matchesSearch =
        c.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.venue.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.city.toLowerCase().includes(searchTerm.toLowerCase()) ||
        c.format.toLowerCase().includes(searchTerm.toLowerCase());

      if (!matchesSearch) return false;
      if (statusFilter === "all") return true;
      return c.status === statusFilter;
    });
  }, [concerts, searchTerm, statusFilter]);

  // Obrir formulari nou concert
  const handleOpenCreate = () => {
    const defaultPreset = FORMAT_PRESETS[1]; // Trio
    const currentYear = new Date().getFullYear().toString();
    setEditingConcert({
      id: `concert-${Date.now()}`,
      title: "",
      format: defaultPreset.name,
      badge: defaultPreset.badge,
      bg: defaultPreset.bg,
      fg: defaultPreset.fg,
      dateStr: "",
      year: currentYear,
      venue: "",
      city: "",
      status: "upcoming",
      statusText: "Entrades a la venda",
      description: "",
      ticketUrl: "",
      infoUrl: "",
      isFeatured: true,
      order: (concerts.length || 0) + 1,
    });
    setIsModalOpen(true);
  };

  // Obrir formulari editar concert
  const handleOpenEdit = (concert: Concert) => {
    setEditingConcert({ ...concert });
    setIsModalOpen(true);
  };

  // Duplicar concert
  const handleDuplicate = async (concert: Concert) => {
    const duplicated: Partial<Concert> = {
      ...concert,
      id: `concert-${Date.now()}`,
      title: `${concert.title} (Còpia)`,
      dateStr: "Pendent de confirmació",
      status: "upcoming",
      statusText: "Properament",
    };
    await saveConcert(duplicated);
    showToast("Concert duplicat correctament");
  };

  // Eliminar concert
  const handleDelete = async (id: string, title: string) => {
    if (window.confirm(`Segur que vols eliminar el concert «${title}»?`)) {
      await deleteConcert(id);
      showToast("Concert eliminat");
    }
  };

  // Canviar estat amb 1 clic
  const handleQuickStatus = async (concert: Concert) => {
    let nextStatus: ConcertStatus = "upcoming";
    let nextText = "Entrades a la venda";

    if (concert.status === "upcoming") {
      nextStatus = "past";
      nextText = "Entrades Esgotades";
    } else if (concert.status === "past") {
      nextStatus = "postponed";
      nextText = "Ajornat · Nova data";
    } else {
      nextStatus = "upcoming";
      nextText = "Entrades a la venda";
    }

    await quickUpdateStatus(concert.id, nextStatus, nextText);
    showToast(`Estat actualitzat: ${nextText}`);
  };

  // Canviar preset de format al formulari
  const handleSelectFormatPreset = (formatName: string) => {
    const preset = FORMAT_PRESETS.find((p) => p.name === formatName);
    if (preset && editingConcert) {
      setEditingConcert({
        ...editingConcert,
        format: preset.name,
        badge: preset.badge,
        bg: preset.bg,
        fg: preset.fg,
      });
    }
  };

  // Guardar formulari
  const handleSaveModal = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingConcert || !editingConcert.title?.trim()) {
      alert("Si us plau, indica almenys el títol del concert.");
      return;
    }

    await saveConcert(editingConcert);
    setIsModalOpen(false);
    setEditingConcert(null);
    showToast("Canvis guardats correctament");
  };

  // Restablir inicials
  const handleResetDefaults = async () => {
    if (
      window.confirm(
        "Vols restablir la llista als concerts inicials de Miquel Gil? (Això recuperarà les dates oficials)."
      )
    ) {
      await resetToDefaults();
      showToast("Concerts restablits a l'estat inicial");
    }
  };

  // -----------------------------------------------------------------------
  // PANTALLA D'ACCÉS (LOGIN EDITORIAL)
  // -----------------------------------------------------------------------
  if (!isAuthenticated) {
    return (
      <main className="admin-login-wrap">
        <div className="admin-login-card">
          <div className="admin-corner-row" aria-hidden="true">
            <span>+</span>
            <span>+</span>
          </div>

          <span className="admin-login-badge">Intranet de Gestió</span>
          <h1 className="admin-login-title">Miquel Gil</h1>
          <p className="admin-login-subtitle">
            Estudi d&apos;edició privada per a gestionar l&apos;agenda de directes, recintes i entrades en temps real.
          </p>

          <div className="admin-hairline" />

          <form onSubmit={handleLogin} className="admin-login-form">
            <div>
              <label htmlFor="admin-pin" className="admin-login-label">
                Clau d&apos;accés d&apos;administració
              </label>
              <div className="admin-input-wrap">
                <input
                  id="admin-pin"
                  type={showPassword ? "text" : "password"}
                  className="admin-login-input"
                  placeholder="Introdueix la clau d'accés"
                  value={passwordInput}
                  onChange={(e) => setPasswordInput(e.target.value)}
                  autoFocus
                />
                <button
                  type="button"
                  className="admin-input-eye"
                  onClick={() => setShowPassword((v) => !v)}
                  aria-label={showPassword ? "Amagar clau" : "Mostrar clau"}
                >
                  <IconEye open={showPassword} />
                </button>
              </div>
              {authError && <p className="admin-login-error">{authError}</p>}
            </div>

            <button type="submit" className="admin-login-btn">
              <span>Entrar al Panell</span>
              <span aria-hidden="true">↗</span>
            </button>
          </form>

          <p className="admin-login-hint">
            Clau de demostració: <strong>mgil2026</strong>
          </p>

          <div className="admin-login-footer">
            <Link href="/directes" className="admin-back-link">
              ← Tornar als Directes públics
            </Link>
          </div>

          <div className="admin-corner-row bottom" aria-hidden="true">
            <span>+</span>
            <span>+</span>
          </div>
        </div>
      </main>
    );
  }

  // -----------------------------------------------------------------------
  // PANELL PRINCIPAL D'ADMINISTRACIÓ
  // -----------------------------------------------------------------------
  const stats = {
    total: concerts.length,
    upcoming: concerts.filter((c) => c.status === "upcoming").length,
    postponed: concerts.filter((c) => c.status === "postponed").length,
    past: concerts.filter((c) => c.status === "past").length,
  };

  return (
    <div className="admin-root">
      {/* NAVBAR */}
      <header className="admin-navbar">
        <div className="admin-navbar-inner">
          <div className="admin-brand">
            <h1 className="admin-brand-title">Miquel Gil</h1>
            <span className="admin-brand-divider" aria-hidden="true">/</span>
            <span className="admin-brand-tag">Intranet de Gestió</span>
          </div>

          <div className="admin-nav-actions">
            <div className="admin-sync-indicator" title="Mode d'emmagatzematge de dades">
              <span className={`admin-sync-dot ${isSupabaseConfigured ? "" : "local"}`} />
              <span>
                {isSupabaseConfigured ? "Supabase Cloud" : "Mode Local"}
              </span>
            </div>

            <Link href="/directes" target="_blank" className="admin-nav-btn">
              <span>Veure Directes</span>
              <span aria-hidden="true">↗</span>
            </Link>

            <button onClick={handleLogout} className="admin-nav-btn logout">
              Eixir
            </button>
          </div>
        </div>
      </header>

      {/* CONTAINER */}
      <main className="admin-container">
        {/* CAPÇALERA D'ESTUDI */}
        <section className="admin-page-head">
          <div>
            <p className="admin-page-kicker">Arxiu &amp; Programació 2026 / 27</p>
            <h2 className="admin-page-heading">Agenda de Directes</h2>
          </div>
          <button onClick={handleOpenCreate} className="admin-create-btn">
            <IconPlus />
            <span>Nou Concert</span>
          </button>
        </section>

        {/* STATS LEDGER */}
        <section className="admin-stats-grid" aria-label="Resum de concerts">
          <div className="admin-stat-card">
            <span className="admin-stat-label">Total Concerts</span>
            <span className="admin-stat-value">{stats.total}</span>
            <span className="admin-stat-hint">Registrats al catàleg</span>
          </div>
          <div className="admin-stat-card">
            <span className="admin-stat-label">
              <span className="admin-stat-dot is-upcoming" /> Entrades a la Venda
            </span>
            <span className="admin-stat-value">{stats.upcoming}</span>
            <span className="admin-stat-hint">Dates actives programades</span>
          </div>
          <div className="admin-stat-card">
            <span className="admin-stat-label">
              <span className="admin-stat-dot is-postponed" /> Ajornats
            </span>
            <span className="admin-stat-value">{stats.postponed}</span>
            <span className="admin-stat-hint">Pendents de nova data</span>
          </div>
          <div className="admin-stat-card">
            <span className="admin-stat-label">
              <span className="admin-stat-dot is-past" /> Exhaurits / Històrics
            </span>
            <span className="admin-stat-value">{stats.past}</span>
            <span className="admin-stat-hint">Arxiu de cites anteriors</span>
          </div>
        </section>

        {/* ACTION BAR */}
        <section className="admin-action-bar">
          <div className="admin-search-wrap">
            <span className="admin-search-icon">
              <IconSearch />
            </span>
            <input
              type="text"
              className="admin-search-input"
              placeholder="Cerca per títol, teatre, format o municipi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
            {searchTerm && (
              <button
                type="button"
                className="admin-search-clear"
                onClick={() => setSearchTerm("")}
                aria-label="Netejar cerca"
              >
                <IconClose />
              </button>
            )}
          </div>

          <div className="admin-filter-tabs" role="tablist" aria-label="Filtrar per estat">
            <button
              className={`admin-filter-tab ${statusFilter === "all" ? "active" : ""}`}
              onClick={() => setStatusFilter("all")}
            >
              Tots ({concerts.length})
            </button>
            <button
              className={`admin-filter-tab ${statusFilter === "upcoming" ? "active" : ""}`}
              onClick={() => setStatusFilter("upcoming")}
            >
              A la venda ({stats.upcoming})
            </button>
            <button
              className={`admin-filter-tab ${statusFilter === "postponed" ? "active" : ""}`}
              onClick={() => setStatusFilter("postponed")}
            >
              Ajornats ({stats.postponed})
            </button>
            <button
              className={`admin-filter-tab ${statusFilter === "past" ? "active" : ""}`}
              onClick={() => setStatusFilter("past")}
            >
              Passats ({stats.past})
            </button>
          </div>

          <button
            onClick={handleResetDefaults}
            className="admin-nav-btn admin-reset-btn"
            title="Restablir concerts inicials"
          >
            <IconReset />
            <span>Restablir</span>
          </button>
        </section>

        {/* CONCERTS LIST */}
        <section className="admin-table-wrap">
          {loading ? (
            <div className="admin-empty">Carregant concerts...</div>
          ) : filteredConcerts.length === 0 ? (
            <div className="admin-empty">
              <p className="admin-empty-title">Cap concert trobat</p>
              <p className="admin-empty-sub">No hi ha concerts amb aquests criteris de cerca o filtre.</p>
            </div>
          ) : (
            <div className="admin-list">
              {filteredConcerts.map((c) => (
                <article key={c.id} className="admin-item">
                  {/* Stripe color de la targeta */}
                  <div className="admin-item-stripe" style={{ backgroundColor: c.bg }} />

                  {/* Informació del concert */}
                  <div className="admin-item-content">
                    <div className="admin-item-row-top">
                      <span
                        className="admin-item-badge"
                        style={{
                          borderColor: `${c.bg}55`,
                          color: c.bg,
                        }}
                      >
                        {c.badge || c.format}
                      </span>
                      <span className="admin-item-date">{c.dateStr}</span>
                      {c.isFeatured && (
                        <span className="admin-featured-pill">
                          <IconStar />
                          <span>Destacat</span>
                        </span>
                      )}
                    </div>

                    <h3 className="admin-item-title">{c.title}</h3>

                    <div className="admin-item-details">
                      <span className="admin-item-detail-icon">
                        <IconPin />
                        <span>
                          {c.venue}
                          {c.city ? ` · ${c.city}` : ""}
                        </span>
                      </span>
                      <span className="admin-item-detail-sep" aria-hidden="true">/</span>
                      <span>Format: {c.format}</span>
                      {c.ticketUrl && (
                        <>
                          <span className="admin-item-detail-sep" aria-hidden="true">/</span>
                          <a
                            href={c.ticketUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="admin-ticket-link"
                          >
                            <IconTicket />
                            <span>Entrades oficials ↗</span>
                          </a>
                        </>
                      )}
                    </div>
                  </div>

                  {/* Accions ràpides */}
                  <div className="admin-item-actions">
                    <button
                      className={`admin-status-toggle ${c.status}`}
                      onClick={() => handleQuickStatus(c)}
                      title="Fes clic per canviar d'estat"
                    >
                      {c.statusText || c.status}
                    </button>

                    <div className="admin-item-icon-group">
                      <button
                        className="admin-icon-btn"
                        onClick={() => handleOpenEdit(c)}
                        title="Editar concert"
                        aria-label={`Editar ${c.title}`}
                      >
                        <IconEdit />
                      </button>

                      <button
                        className="admin-icon-btn"
                        onClick={() => handleDuplicate(c)}
                        title="Duplicar concert"
                        aria-label={`Duplicar ${c.title}`}
                      >
                        <IconDuplicate />
                      </button>

                      <button
                        className="admin-icon-btn delete"
                        onClick={() => handleDelete(c.id, c.title)}
                        title="Eliminar concert"
                        aria-label={`Eliminar ${c.title}`}
                      >
                        <IconTrash />
                      </button>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      </main>

      {/* -------------------------------------------------------------------
          MODAL D'EDICIÓ I CREACIÓ (FORMULARI AMB LIVE PREVIEW)
         ------------------------------------------------------------------- */}
      {isModalOpen && editingConcert && (
        <div className="admin-modal-backdrop" onClick={() => setIsModalOpen(false)}>
          <div className="admin-modal" onClick={(e) => e.stopPropagation()}>
            <div className="admin-modal-header">
              <div>
                <span className="admin-modal-kicker">Fitxa de Concert</span>
                <h2 className="admin-modal-title">
                  {editingConcert.title ? editingConcert.title : "Nou Concert"}
                </h2>
              </div>
              <button
                type="button"
                className="admin-modal-close"
                onClick={() => setIsModalOpen(false)}
                aria-label="Tancar modal"
              >
                <IconClose />
              </button>
            </div>

            <form onSubmit={handleSaveModal}>
              <div className="admin-modal-body">
                {/* COLUMNA ESQUERRA: FORMULARI */}
                <div>
                  <div className="admin-form-group">
                    <label className="admin-label">Títol del Concert o Festival *</label>
                    <input
                      type="text"
                      className="admin-input"
                      placeholder="Ex: Festival 2 Terços — Can Soler"
                      value={editingConcert.title || ""}
                      onChange={(e) =>
                        setEditingConcert({ ...editingConcert, title: e.target.value })
                      }
                      required
                    />
                  </div>

                  <div className="admin-form-row">
                    <div className="admin-form-group">
                      <label className="admin-label">Format Artístic</label>
                      <select
                        className="admin-select"
                        value={editingConcert.format || ""}
                        onChange={(e) => {
                          const val = e.target.value;
                          setEditingConcert({ ...editingConcert, format: val });
                          handleSelectFormatPreset(val);
                        }}
                      >
                        {FORMAT_PRESETS.map((p) => (
                          <option key={p.name} value={p.name}>
                            {p.name}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="admin-form-group">
                      <label className="admin-label">Etiqueta de la Targeta</label>
                      <input
                        type="text"
                        className="admin-input"
                        placeholder="Ex: Format Trio"
                        value={editingConcert.badge || ""}
                        onChange={(e) =>
                          setEditingConcert({ ...editingConcert, badge: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="admin-form-row">
                    <div className="admin-form-group">
                      <label className="admin-label">Data del Concert (Text Oficial) *</label>
                      <input
                        type="text"
                        className="admin-input"
                        placeholder="Ex: 13 d'abril de 2026 · 20:00 h"
                        value={editingConcert.dateStr || ""}
                        onChange={(e) =>
                          setEditingConcert({ ...editingConcert, dateStr: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div className="admin-form-group">
                      <label className="admin-label">Any</label>
                      <input
                        type="text"
                        className="admin-input"
                        placeholder="2026"
                        value={editingConcert.year || ""}
                        onChange={(e) =>
                          setEditingConcert({ ...editingConcert, year: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="admin-form-row">
                    <div className="admin-form-group">
                      <label className="admin-label">Recinte / Sala / Espai *</label>
                      <input
                        type="text"
                        className="admin-input"
                        placeholder="Ex: Teatre Kursaal (Sala Petita)"
                        value={editingConcert.venue || ""}
                        onChange={(e) =>
                          setEditingConcert({ ...editingConcert, venue: e.target.value })
                        }
                        required
                      />
                    </div>

                    <div className="admin-form-group">
                      <label className="admin-label">Municipi / Comarca</label>
                      <input
                        type="text"
                        className="admin-input"
                        placeholder="Ex: Manresa (Bages)"
                        value={editingConcert.city || ""}
                        onChange={(e) =>
                          setEditingConcert({ ...editingConcert, city: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="admin-form-row">
                    <div className="admin-form-group">
                      <label className="admin-label">Estat del Concert</label>
                      <select
                        className="admin-select"
                        value={editingConcert.status || "upcoming"}
                        onChange={(e) => {
                          const st = e.target.value as ConcertStatus;
                          let text = "Entrades a la venda";
                          if (st === "past") text = "Entrades Esgotades";
                          if (st === "postponed") text = "Ajornat · Nova data";
                          setEditingConcert({
                            ...editingConcert,
                            status: st,
                            statusText: text,
                          });
                        }}
                      >
                        <option value="upcoming">Entrades a la Venda (Propers)</option>
                        <option value="postponed">Ajornat (Nova data properament)</option>
                        <option value="past">Entrades Esgotades / Realitzat</option>
                      </select>
                    </div>

                    <div className="admin-form-group">
                      <label className="admin-label">Text de l&apos;Estat</label>
                      <input
                        type="text"
                        className="admin-input"
                        placeholder="Ex: Entrades Esgotades"
                        value={editingConcert.statusText || ""}
                        onChange={(e) =>
                          setEditingConcert({ ...editingConcert, statusText: e.target.value })
                        }
                      />
                    </div>
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-label">Enllaç per comprar entrades (URL)</label>
                    <input
                      type="url"
                      className="admin-input"
                      placeholder="https://entrapolis.com/..."
                      value={editingConcert.ticketUrl || ""}
                      onChange={(e) =>
                        setEditingConcert({ ...editingConcert, ticketUrl: e.target.value })
                      }
                    />
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-label">Paleta de Color de la Targeta</label>
                    <div className="admin-palette-wrap">
                      {PALETTE_SWATCHES.map((swatch) => (
                        <button
                          key={swatch.bg}
                          type="button"
                          className={`admin-swatch ${editingConcert.bg === swatch.bg ? "active" : ""}`}
                          style={{ backgroundColor: swatch.bg }}
                          title={swatch.label}
                          aria-label={swatch.label}
                          onClick={() =>
                            setEditingConcert({
                              ...editingConcert,
                              bg: swatch.bg,
                              fg: swatch.fg,
                            })
                          }
                        />
                      ))}
                    </div>
                  </div>

                  <div className="admin-form-group">
                    <label className="admin-label">Descripció / Crònica Artística</label>
                    <textarea
                      className="admin-textarea"
                      placeholder="Explica breument el repertori, músics i context d'aquest concert..."
                      value={editingConcert.description || ""}
                      onChange={(e) =>
                        setEditingConcert({ ...editingConcert, description: e.target.value })
                      }
                    />
                  </div>

                  <label className="admin-checkbox-row" htmlFor="isFeatured">
                    <input
                      type="checkbox"
                      id="isFeatured"
                      className="admin-checkbox"
                      checked={editingConcert.isFeatured ?? true}
                      onChange={(e) =>
                        setEditingConcert({ ...editingConcert, isFeatured: e.target.checked })
                      }
                    />
                    <span>Mostrar com a targeta destacada als directes interactius</span>
                  </label>
                </div>

                {/* COLUMNA DRETA: LIVE CARD PREVIEW EN TEMPS REAL */}
                <div className="admin-preview-col">
                  <div className="admin-preview-kicker">
                    <span className="admin-preview-dot" />
                    Vista prèvia en directe
                  </div>

                  <div className="admin-preview-card-frame">
                    <article
                      className="agenda-card"
                      style={{
                        backgroundColor: editingConcert.bg || "#F4A261",
                        color: editingConcert.fg || "#111211",
                        width: "100%",
                        maxWidth: "310px",
                        height: "420px",
                        borderRadius: "14px",
                        padding: "24px 22px 20px",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        boxShadow: "0 20px 44px rgba(0,0,0,0.45)",
                        boxSizing: "border-box",
                        position: "relative",
                      }}
                    >
                      {/* Capçalera targeta */}
                      <div>
                        <div
                          style={{
                            display: "flex",
                            justifyContent: "space-between",
                            alignItems: "center",
                            marginBottom: "14px",
                          }}
                        >
                          <span
                            style={{
                              fontSize: "0.68rem",
                              fontWeight: 700,
                              letterSpacing: "0.08em",
                              textTransform: "uppercase",
                              opacity: 0.85,
                            }}
                          >
                            {editingConcert.badge || editingConcert.format || "Format"}
                          </span>
                          <span
                            style={{
                              fontFamily: "var(--font-maelstrom, var(--font-coign, Georgia, serif))",
                              fontSize: "0.95rem",
                              fontWeight: 700,
                              opacity: 0.65,
                            }}
                          >
                            {editingConcert.year || "2026"}
                          </span>
                        </div>

                        {/* Títol concert */}
                        <h3
                          style={{
                            fontFamily: "var(--font-grifinito, Georgia, serif)",
                            fontSize: "1.55rem",
                            lineHeight: 1.12,
                            margin: "0 0 14px",
                            fontWeight: 400,
                          }}
                        >
                          {editingConcert.title || "Títol del Concert"}
                        </h3>

                        {/* Lloc i data */}
                        <p
                          style={{
                            fontSize: "0.82rem",
                            margin: "0 0 6px",
                            fontWeight: 600,
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                          }}
                        >
                          <IconPin />
                          <span>
                            {editingConcert.venue || "Recinte"}
                            {editingConcert.city ? ` · ${editingConcert.city}` : ""}
                          </span>
                        </p>
                        <p
                          style={{
                            fontSize: "0.78rem",
                            margin: "0 0 12px",
                            opacity: 0.78,
                            display: "flex",
                            alignItems: "center",
                            gap: "6px",
                          }}
                        >
                          <IconClock />
                          <span>{editingConcert.dateStr || "Data per confirmar"}</span>
                        </p>

                        {/* Descripció curta */}
                        <p
                          style={{
                            fontSize: "0.78rem",
                            lineHeight: 1.45,
                            opacity: 0.85,
                            display: "-webkit-box",
                            WebkitLineClamp: 3,
                            WebkitBoxOrient: "vertical",
                            overflow: "hidden",
                            margin: 0,
                          }}
                        >
                          {editingConcert.description ||
                            "Descripció breu del concert i repertori artístic..."}
                        </p>
                      </div>

                      {/* Footer targeta */}
                      <div
                        style={{
                          borderTop: "1px dashed rgba(17,18,17,0.28)",
                          paddingTop: "12px",
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                        }}
                      >
                        <span
                          style={{
                            fontSize: "0.7rem",
                            fontWeight: 700,
                            letterSpacing: "0.05em",
                            textTransform: "uppercase",
                          }}
                        >
                          {editingConcert.statusText || "Entrades a la venda"}
                        </span>
                        <div
                          style={{
                            width: "30px",
                            height: "30px",
                            borderRadius: "50%",
                            background: "rgba(17,18,17,0.14)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "0.85rem",
                          }}
                        >
                          ↗
                        </div>
                      </div>
                    </article>
                  </div>
                </div>
              </div>

              {/* FOOTER DEL MODAL */}
              <div className="admin-modal-footer">
                <button
                  type="button"
                  className="admin-btn-secondary"
                  onClick={() => setIsModalOpen(false)}
                >
                  Cancel·lar
                </button>
                <button type="submit" className="admin-btn-primary">
                  Guardar Canvis
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* TOAST DE CONFIRMACIÓ */}
      {toastMessage && (
        <div className="admin-toast" role="status">
          <IconCheck />
          <span>{toastMessage}</span>
        </div>
      )}
    </div>
  );
}
