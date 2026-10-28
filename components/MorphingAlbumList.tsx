"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { type Album } from "@/lib/site";
import {
  type SpotifyTrack,
  findSpotifyTrack,
  findSpotifyTrackForAlbum,
  getFullTrackForAlbum,
} from "@/lib/spotifyTracks";
import gsap from "gsap";
import "./MorphingAlbumList.css";

// Helper to format ms to mm:ss
function formatDurationMs(ms?: number): string {
  if (!ms) return "";
  const totalSecs = Math.round(ms / 1000);
  const m = Math.floor(totalSecs / 60);
  const s = totalSecs % 60;
  return `${m}:${s < 10 ? "0" : ""}${s}`;
}

function normalizeStr(s: string): string {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/^[\d#]+\.?\s*[-–—]?\s*/, "")
    .replace(/[''’`]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

// High-resolution clean cover map
const ALBUM_COVERS: Record<string, string> = {
  "viatger": "/images/disco_8.webp",
  "geometries": "/images/disco_7.jpg",
  "marcianes": "/images/disco_6.png",
  "jazz-manel-camp": "/images/disco_4.png",
  "eixos": "/images/disco_5.png",
  "en-concert": "/images/disco_4.png",
  "kata": "/images/disco_3.png",
  "organic": "/images/disco_2.png",
  "buscando-tu-olor": "/images/disco_1.jpg",
  "terminal-sur": "/images/disco_1.jpg",
};

// Helper to set viewTransitionName safely
function setVTName(el: HTMLElement | null | undefined, name: string) {
  if (!el) return;
  (el.style as any).viewTransitionName = name;
}

interface MorphingAlbumListProps {
  albums: Album[];
  currentTrack: SpotifyTrack;
  isPlaying: boolean;
  onPlayTrack: (track: SpotifyTrack) => void;
  duration?: number; // default: 0.55s (from Annnimate spec)
}

export default function MorphingAlbumList({
  albums,
  currentTrack,
  isPlaying,
  onPlayTrack,
  duration = 0.55,
}: MorphingAlbumListProps) {
  const [selectedAlbum, setSelectedAlbum] = useState<Album | null>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const panelRef = useRef<HTMLDialogElement>(null);
  const activeRowRef = useRef<HTMLButtonElement | null>(null);
  const isTransitioningRef = useRef<boolean>(false);

  // Helper to get album cover
  const getCover = (album: Album) => ALBUM_COVERS[album.slug] || album.cover;

  // View transitions support check
  const supportsViewTransitions = useCallback(() => {
    if (typeof document === "undefined") return false;
    if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return false;
    return typeof (document as any).startViewTransition === "function";
  }, []);

  // Open album in morphing panel
  const handleOpenAlbum = (album: Album, rowEl: HTMLButtonElement) => {
    if (isTransitioningRef.current) return;
    activeRowRef.current = rowEl;
    const panel = panelRef.current;
    if (!panel) return;

    if (!supportsViewTransitions()) {
      setSelectedAlbum(album);
      if (typeof panel.showModal === "function") {
        panel.showModal();
      }
      return;
    }

    isTransitioningRef.current = true;
    const docEl = document.documentElement;
    docEl.style.setProperty("--mlst-dur", `${duration}s`);
    docEl.classList.add("mlst-vt", "mlst-vt-open");

    // Assign view-transition-names to source row elements
    rowEl.classList.add("is-morphing");
    setVTName(rowEl, "mlst-surface");
    const mediaEl = rowEl.querySelector<HTMLElement>("[data-anm-mlst-media]");
    setVTName(mediaEl, "mlst-media");
    const titleEl = rowEl.querySelector<HTMLElement>("[data-anm-mlst-title]");
    setVTName(titleEl, "mlst-title");
    const metaEls = rowEl.querySelectorAll<HTMLElement>("[data-anm-mlst-meta]");
    metaEls.forEach((el, idx) => {
      setVTName(el, `mlst-meta-${idx}`);
    });

    const transition = (document as any).startViewTransition(() => {
      // Clear row names
      setVTName(rowEl, "");
      setVTName(mediaEl, "");
      setVTName(titleEl, "");
      metaEls.forEach((el) => {
        setVTName(el, "");
      });

      // Update React state to render panel contents
      setSelectedAlbum(album);
      if (typeof panel.showModal === "function") {
        panel.showModal();
      }
      rowEl.classList.add("is-active");

      // Set view-transition-names on destination panel elements
      setVTName(panel, "mlst-surface");
      const pMedia = panel.querySelector<HTMLElement>("[data-anm-mlst-media]");
      setVTName(pMedia, "mlst-media");
      const pTitle = panel.querySelector<HTMLElement>("[data-anm-mlst-title]");
      setVTName(pTitle, "mlst-title");
      const pMetas = panel.querySelectorAll<HTMLElement>("[data-anm-mlst-meta]");
      pMetas.forEach((el, idx) => {
        setVTName(el, `mlst-meta-${idx}`);
      });
    });

    transition.finished
      .catch(() => {})
      .finally(() => {
        // Cleanup transition styles
        setVTName(panel, "");
        const pMedia = panel.querySelector<HTMLElement>("[data-anm-mlst-media]");
        setVTName(pMedia, "");
        const pTitle = panel.querySelector<HTMLElement>("[data-anm-mlst-title]");
        setVTName(pTitle, "");
        const pMetas = panel.querySelectorAll<HTMLElement>("[data-anm-mlst-meta]");
        pMetas.forEach((el) => {
          setVTName(el, "");
        });

        rowEl.classList.remove("is-morphing");
        docEl.classList.remove("mlst-vt", "mlst-vt-open");
        docEl.style.removeProperty("--mlst-dur");
        isTransitioningRef.current = false;
      });
  };

  // Close panel and morph back to row
  const handleClosePanel = () => {
    if (isTransitioningRef.current) return;
    const panel = panelRef.current;
    const rowEl = activeRowRef.current;
    if (!panel || !rowEl) {
      if (panel && typeof panel.close === "function") panel.close();
      setSelectedAlbum(null);
      return;
    }

    if (!supportsViewTransitions()) {
      if (typeof panel.close === "function") panel.close();
      rowEl.classList.remove("is-active");
      setSelectedAlbum(null);
      activeRowRef.current = null;
      return;
    }

    isTransitioningRef.current = true;
    const docEl = document.documentElement;
    const closeDur = duration * 0.8;
    docEl.style.setProperty("--mlst-dur", `${closeDur}s`);
    docEl.classList.add("mlst-vt", "mlst-vt-close");

    // Set view-transition-names on panel elements before transition
    setVTName(panel, "mlst-surface");
    const pMedia = panel.querySelector<HTMLElement>("[data-anm-mlst-media]");
    setVTName(pMedia, "mlst-media");
    const pTitle = panel.querySelector<HTMLElement>("[data-anm-mlst-title]");
    setVTName(pTitle, "mlst-title");
    const pMetas = panel.querySelectorAll<HTMLElement>("[data-anm-mlst-meta]");
    pMetas.forEach((el, idx) => {
      setVTName(el, `mlst-meta-${idx}`);
    });

    const transition = (document as any).startViewTransition(() => {
      // Clear panel names and close
      setVTName(panel, "");
      setVTName(pMedia, "");
      setVTName(pTitle, "");
      pMetas.forEach((el) => {
        setVTName(el, "");
      });

      if (typeof panel.close === "function") panel.close();
      rowEl.classList.remove("is-active");

      // Set names on destination row
      rowEl.classList.add("is-morphing");
      setVTName(rowEl, "mlst-surface");
      const mediaEl = rowEl.querySelector<HTMLElement>("[data-anm-mlst-media]");
      setVTName(mediaEl, "mlst-media");
      const titleEl = rowEl.querySelector<HTMLElement>("[data-anm-mlst-title]");
      setVTName(titleEl, "mlst-title");
      const metaEls = rowEl.querySelectorAll<HTMLElement>("[data-anm-mlst-meta]");
      metaEls.forEach((el, idx) => {
        setVTName(el, `mlst-meta-${idx}`);
      });
    });

    transition.finished
      .catch(() => {})
      .finally(() => {
        setVTName(rowEl, "");
        const mediaEl = rowEl.querySelector<HTMLElement>("[data-anm-mlst-media]");
        setVTName(mediaEl, "");
        const titleEl = rowEl.querySelector<HTMLElement>("[data-anm-mlst-title]");
        setVTName(titleEl, "");
        const metaEls = rowEl.querySelectorAll<HTMLElement>("[data-anm-mlst-meta]");
        metaEls.forEach((el) => {
          setVTName(el, "");
        });

        rowEl.classList.remove("is-morphing");
        docEl.classList.remove("mlst-vt", "mlst-vt-close");
        docEl.style.removeProperty("--mlst-dur");
        setSelectedAlbum(null);
        activeRowRef.current = null;
        isTransitioningRef.current = false;
      });
  };

  // Close when clicking outside panel inner card
  const handleDialogBackdropClick = (e: React.MouseEvent<HTMLDialogElement>) => {
    if (panelRef.current && e.target === panelRef.current) {
      handleClosePanel();
    }
  };

  const currentAlbumPreviewTrack = selectedAlbum
    ? findSpotifyTrackForAlbum(selectedAlbum.title, selectedAlbum.tracks, selectedAlbum.slug)
    : null;
  const isSelectedAlbumPlaying =
    selectedAlbum &&
    isPlaying &&
    (currentTrack.albumSlug === selectedAlbum.slug ||
      currentTrack.album.toLowerCase().includes(selectedAlbum.title.toLowerCase()) ||
      selectedAlbum.title.toLowerCase().includes(currentTrack.album.toLowerCase()));

  return (
    <div className="mlst_stage" ref={stageRef} data-anm-morphing-list data-anm-duration={duration}>
      {/* Morphing List Container */}
      <ul className="mlst_list" data-anm-mlst-list>
        {albums.map((album) => {
          const cover = getCover(album);
          return (
            <li key={album.slug} className="mlst_item">
              <button
                type="button"
                className="mlst_row"
                data-anm-mlst-row
                aria-haspopup="dialog"
                onClick={(e) => handleOpenAlbum(album, e.currentTarget)}
              >
                {/* 1. Thumbnail Cover */}
                <span className="mlst_thumb" data-anm-mlst-media>
                  <img
                    className="mlst_img"
                    src={cover}
                    alt={`Caràtula de ${album.title}`}
                    loading="lazy"
                    decoding="async"
                  />
                </span>

                {/* 2. Album Title */}
                <span className="mlst_title" data-anm-mlst-title>
                  {album.title}
                </span>

                {/* 3. Record Label */}
                <span className="mlst_meta mlst_meta_discipline" data-anm-mlst-meta>
                  {album.label}
                </span>

                {/* 4. Tracks Count Badge */}
                <span className="mlst_meta mlst_meta_tracks" data-anm-mlst-meta>
                  {album.tracks.length} pistes
                </span>

                {/* 5. Year */}
                <span className="mlst_meta mlst_meta_year" data-anm-mlst-meta>
                  {album.year}
                </span>

                {/* 6. Arrow Indicator */}
                <span className="mlst_arrow" aria-hidden="true">
                  <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
                    <path
                      fillRule="evenodd"
                      d="M4.646 1.646a.5.5 0 0 1 .708 0l6 6a.5.5 0 0 1 0 .708l-6 6a.5.5 0 0 1-.708-.708L10.293 8 4.646 2.354a.5.5 0 0 1 0-.708z"
                    />
                  </svg>
                </span>
              </button>
            </li>
          );
        })}
      </ul>

      {/* Morphed Detail Panel Dialog */}
      <dialog
        ref={panelRef}
        className="mlst_panel"
        data-anm-mlst-panel
        onClick={handleDialogBackdropClick}
        onCancel={(e) => {
          e.preventDefault();
          handleClosePanel();
        }}
      >
        {selectedAlbum && (
          <div className="mlst_panel_inner">
            {/* Left Column: Media, Vinyl Sleeve & Audio Action */}
            <div className="mlst_panel_media" data-anm-mlst-media>
              <div
                className="disco-sleeve-stage"
                onClick={() => currentAlbumPreviewTrack && onPlayTrack(currentAlbumPreviewTrack)}
                title={`Reproduir mostra de ${selectedAlbum.title}`}
              >
                {/* Vinyl Disc that slides out */}
                <div className="disco-vinyl-disc" aria-hidden="true">
                  <div
                    className="disco-vinyl-label"
                    style={{ backgroundImage: `url(${getCover(selectedAlbum)})` }}
                  >
                    <div className="disco-vinyl-hole" />
                  </div>
                </div>

                {/* Album Cover Card */}
                <div className="disco-sleeve-card">
                  <img
                    className="mlst_img disco-sleeve-img"
                    src={getCover(selectedAlbum)}
                    alt={selectedAlbum.title}
                  />

                  {/* Play badge button over cover */}
                  {currentAlbumPreviewTrack && (
                    <button
                      type="button"
                      className={`disco-sleeve-play-badge ${isSelectedAlbumPlaying ? "is-playing" : ""}`}
                      aria-label={
                        isSelectedAlbumPlaying
                          ? "Pausar reproducció"
                          : `Reproduir cançó sencera de ${selectedAlbum.title}`
                      }
                      onClick={(e) => {
                        e.stopPropagation();
                        onPlayTrack(currentAlbumPreviewTrack);
                      }}
                    >
                      <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                        {isSelectedAlbumPlaying ? (
                          <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                        ) : (
                          <polygon points="6 4 20 12 6 20 6 4" />
                        )}
                      </svg>
                      <span>
                        {isSelectedAlbumPlaying
                          ? "Reproduint cançó sencera"
                          : "Reproduir cançó sencera"}
                      </span>
                    </button>
                  )}
                </div>
              </div>

              {/* Featured Full Song Highlight Card */}
              {currentAlbumPreviewTrack && (
                <div
                  className={`disco-sleeve-featured-card ${isSelectedAlbumPlaying ? "is-playing" : ""}`}
                  onClick={() => onPlayTrack(currentAlbumPreviewTrack)}
                  title={`Reproduir cançó completa: ${currentAlbumPreviewTrack.title}`}
                >
                  <div className="disco-sleeve-featured-header">
                    <span className="disco-sleeve-featured-pill">CANÇÓ COMPLETA</span>
                    {currentAlbumPreviewTrack.duration && (
                      <span className="disco-sleeve-featured-time">
                        {formatDurationMs(currentAlbumPreviewTrack.duration)}
                      </span>
                    )}
                  </div>
                  <div className="disco-sleeve-featured-title">
                    {currentAlbumPreviewTrack.title}
                  </div>
                </div>
              )}

              {/* Spotify Link Button */}
              <a
                href={`https://open.spotify.com/search/${encodeURIComponent(`Miquel Gil ${selectedAlbum.title}`)}`}
                target="_blank"
                rel="noopener noreferrer"
                className="disco-spotify-btn"
                title={`Obrir ${selectedAlbum.title} a Spotify`}
              >
                <svg viewBox="0 0 24 24">
                  <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.498 17.306c-.215.352-.676.463-1.028.248-2.816-1.72-6.36-2.11-10.536-1.157-.403.093-.808-.16-.9-.562-.092-.403.16-.807.563-.9 4.568-1.044 8.508-.598 11.653 1.343.352.215.463.676.248 1.028zm1.468-3.262c-.27.44-.848.578-1.288.308-3.224-1.982-8.14-2.557-11.954-1.399-.496.15-1.025-.133-1.176-.628-.15-.496.133-1.025.628-1.176 4.364-1.324 9.791-.684 13.482 1.583.44.27.578.848.308 1.288zm.126-3.41c-3.866-2.296-10.245-2.508-13.935-1.387-.593.18-1.22-.16-1.4-.753-.18-.593.16-1.22.753-1.4 4.24-1.288 11.284-1.04 15.68 1.57.533.316.708 1.01.392 1.543-.316.533-1.01.708-1.543.392z" />
                </svg>
                <span>Escolta a Spotify</span>
              </a>
            </div>

            {/* Right Column: Title, Metas, Description & Tracklist */}
            <div className="mlst_panel_content">
              {/* Close Button */}
              <button
                type="button"
                className="mlst_close"
                data-anm-mlst-close
                aria-label="Tancar panell"
                onClick={handleClosePanel}
              >
                <svg className="mlst_glyph" viewBox="0 0 16 16" fill="none" aria-hidden="true">
                  <path
                    d="M4 4L12 12M12 4L4 12"
                    stroke="currentColor"
                    strokeWidth="1.75"
                    strokeLinecap="round"
                  />
                </svg>
              </button>

              <div className="mlst_panel_head">
                <span className="disco-album-kicker">
                  {selectedAlbum.label} — {selectedAlbum.year}
                </span>
                <h2 className="mlst_panel_title" data-anm-mlst-title>
                  {selectedAlbum.title}
                </h2>
                <div className="mlst_panel_metas" data-anm-mlst-metas>
                  <span className="disco-meta-pill disco-meta-pill--year" data-anm-mlst-meta>
                    {selectedAlbum.year}
                  </span>
                  <span className="disco-meta-pill" data-anm-mlst-meta>
                    {selectedAlbum.label}
                  </span>
                  <span className="disco-meta-pill" data-anm-mlst-meta>
                    {selectedAlbum.tracks.length} pistes
                  </span>
                </div>
              </div>

              {/* Album Description */}
              <div className="mlst_panel_body" data-anm-mlst-body>
                <p className="mlst_text">{selectedAlbum.description}</p>
              </div>

              {/* Complete Interactive Tracklist */}
              <div className="disco-tracklist-section">
                <div className="disco-tracklist-title-row">
                  <span className="disco-tracklist-heading">Llista de cançons</span>
                  <span className="disco-tracklist-count">
                    {selectedAlbum.tracks.length} cançons
                  </span>
                </div>

                <div className="disco-tracks-list" role="list">
                  {selectedAlbum.tracks.map((trackName, tIdx) => {
                    const cleanTrack = normalizeStr(trackName);
                    const cleanFullTrack = currentAlbumPreviewTrack
                      ? normalizeStr(currentAlbumPreviewTrack.title)
                      : "";
                    const isThisTheFullTrack = Boolean(
                      currentAlbumPreviewTrack &&
                        cleanFullTrack &&
                        (cleanTrack === cleanFullTrack ||
                          cleanTrack.includes(cleanFullTrack) ||
                          cleanFullTrack.includes(cleanTrack))
                    );

                    const isThisTrackPlaying =
                      isPlaying &&
                      currentAlbumPreviewTrack &&
                      currentTrack.id === currentAlbumPreviewTrack.id &&
                      (isThisTheFullTrack || !selectedAlbum.tracks.some((t) => normalizeStr(t) === cleanFullTrack));

                    const trackNumberStr = String(tIdx + 1).padStart(2, "0");

                    return (
                      <div
                        key={`${selectedAlbum.slug}-${tIdx}`}
                        role="listitem"
                        className={`disco-track-card ${isThisTrackPlaying ? "is-active" : ""} ${
                          isThisTheFullTrack ? "is-full-track" : ""
                        }`}
                        onClick={() => {
                          if (currentAlbumPreviewTrack) {
                            onPlayTrack(currentAlbumPreviewTrack);
                          }
                        }}
                        title={
                          isThisTheFullTrack
                            ? `Reproduir cançó sencera: ${trackName}`
                            : `Reproduir cançó completa de l'àlbum (${currentAlbumPreviewTrack?.title})`
                        }
                      >
                        <div className="disco-track-left">
                          <span className="disco-track-num">{trackNumberStr}</span>
                          <span className="disco-track-name">{trackName}</span>
                        </div>

                        <div className="disco-track-right">
                          {isThisTheFullTrack ? (
                            <>
                              <span className="disco-track-badge-full">
                                <span className="disco-track-full-dot" />
                                Cançó sencera
                              </span>
                              {currentAlbumPreviewTrack?.duration && (
                                <span className="disco-track-duration">
                                  {formatDurationMs(currentAlbumPreviewTrack.duration)}
                                </span>
                              )}
                              {isThisTrackPlaying && (
                                <div className="disco-eq-bars" aria-label="Reproduint àudio">
                                  <span className="disco-eq-bar" />
                                  <span className="disco-eq-bar" />
                                  <span className="disco-eq-bar" />
                                </div>
                              )}
                              <button
                                type="button"
                                className="disco-track-play-btn"
                                aria-label={
                                  isThisTrackPlaying
                                    ? `Pausar ${trackName}`
                                    : `Reproduir cançó sencera: ${trackName}`
                                }
                              >
                                <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor">
                                  {isThisTrackPlaying ? (
                                    <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                                  ) : (
                                    <polygon points="6 4 20 12 6 20 6 4" />
                                  )}
                                </svg>
                              </button>
                            </>
                          ) : (
                            <>
                              <span className="disco-track-badge-sample">Pista de l&apos;àlbum</span>
                              <button
                                type="button"
                                className="disco-track-play-btn"
                                aria-label={`Reproduir cançó de ${selectedAlbum.title}`}
                                title={`Reproduir ${currentAlbumPreviewTrack?.title || "cançó sencera"}`}
                              >
                                <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor">
                                  <polygon points="6 4 20 12 6 20 6 4" />
                                </svg>
                              </button>
                            </>
                          )}
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>
        )}
      </dialog>
    </div>
  );
}
