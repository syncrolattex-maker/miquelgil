"use client";

import React, { useEffect, useState } from "react";
import "./siteLockGate.css";

// Clau mestra per desbloquejar el portal privat
const MASTER_KEY = "mgil2026";
const STORAGE_KEY = "mg_site_unlocked";

export default function SiteLockGate({
  children,
}: {
  children: React.ReactNode;
}) {
  const [isUnlocked, setIsUnlocked] = useState<boolean>(false);
  const [showAuthModal, setShowAuthModal] = useState<boolean>(false);
  const [passInput, setPassInput] = useState<string>("");
  const [errorMsg, setErrorMsg] = useState<string>("");

  useEffect(() => {
    if (typeof window === "undefined") return;

    try {
      // 1. Comprovar si s'ha passat clau per paràmetre d'URL (?preview=mgil2026 o ?pass=mgil2026)
      const params = new URLSearchParams(window.location.search);
      const urlKey = params.get("pass") || params.get("preview");

      if (urlKey === MASTER_KEY || urlKey === "true") {
        localStorage.setItem(STORAGE_KEY, "true");
        sessionStorage.setItem(STORAGE_KEY, "true");
        // Netejar la URL per no deixar visible la clau
        const cleanUrl = window.location.pathname;
        window.history.replaceState({}, "", cleanUrl);
        setIsUnlocked(true);
        return;
      }

      // 2. Comprovar si ja s'havia desbloquejat en aquesta sessió / dispositiu
      const stored =
        localStorage.getItem(STORAGE_KEY) === "true" ||
        sessionStorage.getItem(STORAGE_KEY) === "true";

      if (stored) {
        setIsUnlocked(true);
      }
    } catch {
      // Fallback si l'accés a storage està restringit
    }
  }, []);

  const handleUnlock = (e: React.FormEvent) => {
    e.preventDefault();
    if (passInput.trim() === MASTER_KEY) {
      try {
        localStorage.setItem(STORAGE_KEY, "true");
        sessionStorage.setItem(STORAGE_KEY, "true");
      } catch {
        // Ignorar
      }
      setIsUnlocked(true);
      setShowAuthModal(false);
      setErrorMsg("");
    } else {
      setErrorMsg("Clau d'accés incorrecta.");
    }
  };

  const handleLock = () => {
    try {
      localStorage.removeItem(STORAGE_KEY);
      sessionStorage.removeItem(STORAGE_KEY);
    } catch {
      // Ignorar
    }
    setIsUnlocked(false);
    setPassInput("");
    setErrorMsg("");
  };

  // 1. Si està desbloquejat: Renderitzar la web sencera + indicador flotant per tornar a bloquejar
  if (isUnlocked) {
    return (
      <>
        {children}

        {/* Indicador flotant discret per al desenvolupador per poder tornar a bloquejar la web */}
        <div className="site-unlocked-badge" title="Web en mode ocult. Només visible amb la clau.">
          <span>🔒 Mode Ocult Actiu (Privat)</span>
          <button type="button" onClick={handleLock}>
            Bloquejar web
          </button>
        </div>
      </>
    );
  }

  // 2. Si NO està desbloquejat: Mostrar pantalla de Mode Ocult / Manteniment
  return (
    <div className="site-lock-root">
      {/* Capçalera superior */}
      <header className="site-lock-header">
        <span className="site-lock-brand">Miquel Gil — Arxiu Oficial</span>
        <span className="site-lock-status-badge">
          <span className="site-lock-status-dot" />
          En preparació
        </span>
      </header>

      {/* Cos principal de la pantalla de manteniment */}
      <main className="site-lock-main">
        <img
          src="/images/logo-W.png"
          alt="Miquel Gil Logo Oficial"
          className="site-lock-logo"
        />

        <h1 className="site-lock-title">
          Memòria Viva
          <br />
          en Construcció
        </h1>

        <div className="site-lock-divider" />

        <p className="site-lock-desc">
          La nova plataforma i arxiu discogràfic oficial de Miquel Gil s’està
          actualitzant i enllestint. Molt prompte estarà disponible amb mig segle de música,
          cant tradicional i poesia viva.
        </p>

        <div className="site-lock-contact">
          <span>Per a contractació, premsa o consultes institucionals:</span>
          <a href="mailto:managementgusma@gmail.com">
            managementgusma@gmail.com
          </a>
        </div>
      </main>

      {/* Peu de pàgina amb accés discret */}
      <footer className="site-lock-footer">
        <span>© 2026 Miquel Gil · Tots els drets reservats</span>

        <button
          type="button"
          className="site-lock-trigger-btn"
          onClick={() => setShowAuthModal(true)}
          aria-label="Accés per a desenvolupament"
        >
          <span>🔒</span>
          <span>Accés privat</span>
        </button>
      </footer>

      {/* Modal d'autenticació per a desenvolupament / previsualització */}
      {showAuthModal && (
        <div
          className="site-lock-modal-backdrop"
          onClick={(e) => {
            if (e.target === e.currentTarget) setShowAuthModal(false);
          }}
        >
          <div className="site-lock-modal">
            <h3>Accés Privat</h3>
            <p>Introdueix la clau per previsualitzar la web:</p>

            <form onSubmit={handleUnlock} className="site-lock-input-group">
              <input
                type="password"
                className="site-lock-input"
                placeholder="Clau d'accés..."
                value={passInput}
                onChange={(e) => {
                  setPassInput(e.target.value);
                  setErrorMsg("");
                }}
                autoFocus
              />

              {errorMsg && <span className="site-lock-error">{errorMsg}</span>}

              <button type="submit" className="site-lock-submit-btn">
                Desbloquejar
              </button>
            </form>

            <button
              type="button"
              className="site-lock-cancel-btn"
              onClick={() => setShowAuthModal(false)}
            >
              Cancel·lar
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
