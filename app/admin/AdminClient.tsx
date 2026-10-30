"use client";

import React, { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import {
  Concert,
  ConcertStatus,
  FORMAT_PRESETS,
  PALETTE_SWATCHES,
  DEFAULT_CONCERTS,
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

export default function AdminClient() {
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);
  const [passwordInput, setPasswordInput] = useState<string>("");
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
    showToast(`Concert duplicat correctament`);
  };

  // Eliminar concert
  const handleDelete = async (id: string, title: string) => {
    if (window.confirm(`Segur que vols eliminar el concert «${title}»?`)) {
      await deleteConcert(id);
      showToast(`Concert eliminat`);
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
    showToast(`Estat canviat a: ${nextText}`);
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
    showToast(`Concert guardat correctament!`);
  };

  // Restablir inicials
  const handleResetDefaults = async () => {
    if (
      window.confirm(
        "Vols restablir la llista als concerts inicials de Miquel Gil? (Això recuperarà les 6 dates oficials)."
      )
    ) {
      await resetToDefaults();
      showToast("Concerts restablits a l'estat inicial");
    }
  };

  // -----------------------------------------------------------------------
  // PANTALLA D'ACCÉS (LOGIN)
  // -----------------------------------------------------------------------
  if (!isAuthenticated) {
    return (
      <main className="admin-login-wrap">
        <div className="admin-login-card">
          <span className="admin-login-badge">Intranet de Gestió</span>
          <h1 className="admin-login-title">Miquel Gil</h1>
          <p className="admin-login-subtitle">
            Panell d'administració per a gestionar l'agenda de concerts, recintes i entrades sense codi.
          </p>

          <form onSubmit={handleLogin} className="admin-login-form">
            <div>
              <label htmlFor="admin-pin" className="admin-login-label">
                Clau d'accés d'administració
              </label>
              <input
                id="admin-pin"
                type="password"
                className="admin-login-input"
                placeholder="Introdueix la clau d'accés..."
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                autoFocus
              />
              {authError && (
                <p style={{ color: "#E63946", fontSize: "0.82rem", margin: "6px 0 0" }}>
                  {authError}
                </p>
              )}
            </div>

            <button type="submit" className="admin-login-btn">
              Entrar al Panell
            </button>
          </form>

          <p className="admin-login-hint">
            Clau mestra inicial de demostració: <strong style={{ color: "#F4A261" }}>mgil2026</strong>
          </p>
          <div style={{ marginTop: "16px" }}>
            <Link
              href="/agenda"
              style={{
                color: "rgba(255,255,255,0.5)",
                fontSize: "0.82rem",
                textDecoration: "underline",
              }}
            >
              ← Tornar a l'Agenda pública
            </Link>
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
        <div className="admin-brand">
          <h1 className="admin-brand-title">Miquel Gil</h1>
          <span className="admin-brand-tag">Intranet</span>
        </div>

        <div className="admin-nav-actions">
          <div className="admin-sync-indicator" title="Mode d'emmagatzematge de dades">
            <span className={`admin-sync-dot ${isSupabaseConfigured ? "" : "local"}`} />
            <span>
              {isSupabaseConfigured ? "Supabase Cloud connectat" : "Mode local actiu (Sense codi)"}
            </span>
          </div>

          <Link href="/agenda" target="_blank" className="admin-nav-btn">
            ↗ Veure Agenda
          </Link>

          <button onClick={handleLogout} className="admin-nav-btn logout">
            Eixir
          </button>
        </div>
      </header>

      {/* CONTAINER */}
      <main className="admin-container">
        {/* STATS */}
        <section className="admin-stats-grid">
          <div className="admin-stat-card">
            <span className="admin-stat-label">Total Concerts</span>
            <span className="admin-stat-value">{stats.total}</span>
            <span className="admin-stat-hint">Registrats al sistema</span>
          </div>
          <div className="admin-stat-card">
            <span className="admin-stat-label">Entrades a la Venda</span>
            <span className="admin-stat-value" style={{ color: "#2A9D8F" }}>
              {stats.upcoming}
            </span>
            <span className="admin-stat-hint">Dates actives programades</span>
          </div>
          <div className="admin-stat-card">
            <span className="admin-stat-label">Ajornats</span>
            <span className="admin-stat-value" style={{ color: "#F4A261" }}>
              {stats.postponed}
            </span>
            <span className="admin-stat-hint">Pendents de nova data</span>
          </div>
          <div className="admin-stat-card">
            <span className="admin-stat-label">Exhaurits / Històrics</span>
            <span className="admin-stat-value" style={{ color: "rgba(255,255,255,0.6)" }}>
              {stats.past}
            </span>
            <span className="admin-stat-hint">Arxiu de grans cites</span>
          </div>
        </section>

        {/* ACTION BAR */}
        <section className="admin-action-bar">
          <div className="admin-search-wrap">
            <span className="admin-search-icon">🔍</span>
            <input
              type="text"
              className="admin-search-input"
              placeholder="Cerca per concert, teatre, format o municipi..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />
          </div>

          <div className="admin-filter-tabs">
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

          <div style={{ display: "flex", gap: "10px" }}>
            <button onClick={handleResetDefaults} className="admin-nav-btn" title="Restablir inicials">
              ↺ Restablir dades
            </button>
            <button onClick={handleOpenCreate} className="admin-create-btn">
              <span>+</span> Nou Concert
            </button>
          </div>
        </section>

        {/* CONCERTS LIST */}
        <section className="admin-table-wrap">
          {loading ? (
            <div className="admin-empty">Carregant concerts...</div>
          ) : filteredConcerts.length === 0 ? (
            <div className="admin-empty">
              <p className="admin-empty-title">Cap concert trobat</p>
              <p>No hi ha concerts amb aquests filtres de cerca.</p>
            </div>
          ) : (
            <div className="admin-list">
              {filteredConcerts.map((c) => (
                <div key={c.id} className="admin-item">
                  {/* Stripe color de la targeta */}
                  <div className="admin-item-stripe" style={{ backgroundColor: c.bg }} />

                  {/* Informació del concert */}
                  <div className="admin-item-content">
                    <div className="admin-item-row-top">
                      <span
                        className="admin-item-badge"
                        style={{ backgroundColor: `${c.bg}25`, color: c.bg }}
                      >
                        {c.badge || c.format}
                      </span>
                      <span className="admin-item-date">{c.dateStr}</span>
                      {c.isFeatured && (
                        <span
                          style={{
                            fontSize: "0.7rem",
                            color: "#E9C46A",
                            display: "inline-flex",
                            alignItems: "center",
                            gap: "3px",
                          }}
                        >
                          ★ Al cartell interactiu
                        </span>
                      )}
                    </div>

                    <h2 className="admin-item-title">{c.title}</h2>

                    <div className="admin-item-details">
                      <span className="admin-item-detail-icon">
                        📍 {c.venue} {c.city ? `· ${c.city}` : ""}
                      </span>
                      <span>Format: {c.format}</span>
                      {c.ticketUrl && (
                        <a
                          href={c.ticketUrl}
                          target="_blank"
                          rel="noopener noreferrer"
                          style={{ color: "#2A9D8F", textDecoration: "underline" }}
                        >
                          🎟️ Entrades oficials
                        </a>
                      )}
                    </div>
                  </div>

                  {/* Accions ràpides */}
                  <div className="admin-item-actions">
                    {/* Botó ràpid per canviar estat a 1 clic */}
                    <button
                      className={`admin-status-toggle ${c.status}`}
                      onClick={() => handleQuickStatus(c)}
                      title="Fes clic per canviar d'estat ràpidament"
                    >
                      {c.statusText || c.status}
                    </button>

                    <button
                      className="admin-icon-btn"
                      onClick={() => handleOpenEdit(c)}
                      title="Editar concert"
                    >
                      ✏️
                    </button>

                    <button
                      className="admin-icon-btn"
                      onClick={() => handleDuplicate(c)}
                      title="Duplicar concert"
                    >
                      📋
                    </button>

                    <button
                      className="admin-icon-btn delete"
                      onClick={() => handleDelete(c.id, c.title)}
                      title="Eliminar concert"
                    >
                      🗑️
                    </button>
                  </div>
                </div>
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
              <h2 className="admin-modal-title">
                {editingConcert.title ? `Editar: ${editingConcert.title}` : "Afegir Nou Concert"}
              </h2>
              <button className="admin-modal-close" onClick={() => setIsModalOpen(false)}>
                ✕
              </button>
            </div>

            <form onSubmit={handleSaveModal}>
              <div className="admin-modal-body">
                {/* COLUMNA ESQUERRA: FORMULARI SENSE CODI */}
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
                          if (st === "postponed") text = "Ajornat per pluja · Nova data";
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
                      <label className="admin-label">Text de l'Estat</label>
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

                  <div style={{ display: "flex", alignItems: "center", gap: "10px", marginTop: "12px" }}>
                    <input
                      type="checkbox"
                      id="isFeatured"
                      checked={editingConcert.isFeatured ?? true}
                      onChange={(e) =>
                        setEditingConcert({ ...editingConcert, isFeatured: e.target.checked })
                      }
                    />
                    <label
                      htmlFor="isFeatured"
                      style={{ fontSize: "0.85rem", color: "rgba(255,255,255,0.85)", cursor: "pointer" }}
                    >
                      Mostrar com a targeta destacada a la baralla interactiva d'inici
                    </label>
                  </div>
                </div>

                {/* COLUMNA DRETA: LIVE CARD PREVIEW EN TEMPS REAL */}
                <div className="admin-preview-col">
                  <div className="admin-preview-kicker">
                    <span className="admin-preview-dot" />
                    Vista prèvia en directe de la targeta
                  </div>

                  <div className="admin-preview-card-frame">
                    <article
                      className="agenda-card"
                      style={{
                        backgroundColor: editingConcert.bg || "#F4A261",
                        color: editingConcert.fg || "#111211",
                        width: "100%",
                        maxWidth: "320px",
                        height: "440px",
                        borderRadius: "18px",
                        padding: "24px 22px 20px",
                        display: "flex",
                        flexDirection: "column",
                        justifyContent: "space-between",
                        boxShadow: "0 18px 40px rgba(0,0,0,0.5)",
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
                              opacity: 0.6,
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
                            lineHeight: 1.15,
                            margin: "0 0 14px",
                            fontWeight: 400,
                          }}
                        >
                          {editingConcert.title || "Títol del Concert"}
                        </h3>

                        {/* Lloc i data */}
                        <p style={{ fontSize: "0.82rem", margin: "0 0 6px", fontWeight: 600 }}>
                          📍 {editingConcert.venue || "Recinte"}
                          {editingConcert.city ? ` · ${editingConcert.city}` : ""}
                        </p>
                        <p style={{ fontSize: "0.78rem", margin: "0 0 12px", opacity: 0.75 }}>
                          🕒 {editingConcert.dateStr || "Data per confirmar"}
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
                          borderTop: "1px dashed rgba(17,18,17,0.25)",
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
                            width: "32px",
                            height: "32px",
                            borderRadius: "50%",
                            background: "rgba(17,18,17,0.15)",
                            display: "flex",
                            alignItems: "center",
                            justifyContent: "center",
                            fontSize: "0.85rem",
                          }}
                        >
                          →
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
      {toastMessage && <div className="admin-toast">{toastMessage}</div>}
    </div>
  );
}
