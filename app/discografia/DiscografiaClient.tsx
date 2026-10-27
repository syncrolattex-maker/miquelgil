"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import { albums as siteAlbums, type Album } from "@/lib/site";
import {
  spotifyTracks,
  findSpotifyTrack,
  findSpotifyTrackForAlbum,
  type SpotifyTrack,
} from "@/lib/spotifyTracks";
import AudioPlayerBottom from "@/components/AudioPlayerBottom";

// Mapa de caràtules d'alta resolució netes per a cada àlbum
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

export default function DiscografiaClient() {
  const [currentTrack, setCurrentTrack] = useState<SpotifyTrack>(spotifyTracks[0]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [activeAlbumSlug, setActiveAlbumSlug] = useState<string>("all");

  // Observer per actualitzar el botó actiu de la barra cronològica segons el scroll
  useEffect(() => {
    const sections = document.querySelectorAll<HTMLElement>(".disco-album-item");
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const slug = (entry.target as HTMLElement).getAttribute("data-album-slug");
            if (slug) setActiveAlbumSlug(slug);
          }
        });
      },
      { rootMargin: "-30% 0px -50% 0px", threshold: 0.1 }
    );

    sections.forEach((sec) => observer.observe(sec));
    return () => observer.disconnect();
  }, []);

  // Control de reproducció
  const handlePlaySpotifyTrack = useCallback((track: SpotifyTrack) => {
    setCurrentTrack((prev) => {
      if (prev.id === track.id) {
        setIsPlaying((p) => !p);
        return prev;
      }
      setIsPlaying(true);
      return track;
    });
  }, []);

  const handleTogglePlay = useCallback(() => {
    setIsPlaying((prev) => !prev);
  }, []);

  const handleTrackChange = useCallback((track: SpotifyTrack) => {
    setCurrentTrack(track);
    setIsPlaying(true);
  }, []);

  // Salt suau a un àlbum específic
  const scrollToAlbum = (slug: string) => {
    if (slug === "all") {
      window.scrollTo({ top: 0, behavior: "smooth" });
      setActiveAlbumSlug("all");
      return;
    }
    const target = document.getElementById(`album-${slug}`);
    if (target) {
      const topOffset = target.getBoundingClientRect().top + window.scrollY - 64;
      window.scrollTo({ top: topOffset, behavior: "smooth" });
      setActiveAlbumSlug(slug);
    }
  };

  return (
    <div className="discografia-page">
      {/* ============================================================
          HERO EDITORIAL
          ============================================================ */}
      <header className="disco-hero">
        <div className="disco-hero-inner">
          <span className="disco-hero-eyebrow">
            Catàleg Oficial // 1996 — 2024
          </span>
          <h1 className="disco-hero-title">Discografia</h1>
          <p className="disco-hero-lead">
            Vint-i-tres treballs discogràfics propis i més de cent col·laboracions.
            Un viatge sonor per la música d&apos;arrel, la cançó d&apos;autor i la fusió
            mediterrània contemporània: de la polifonia tradicional al jazz, el flamenc
            i la música àrab culta.
          </p>

          <div className="disco-hero-stats">
            <div className="disco-stat-item">
              <span className="disco-stat-num">8</span>
              <span className="disco-stat-lbl">Àlbums d&apos;estudi</span>
            </div>
            <div className="disco-stat-item">
              <span className="disco-stat-num">1996 — 2024</span>
              <span className="disco-stat-lbl">Període</span>
            </div>
            <div className="disco-stat-item">
              <span className="disco-stat-num">80+</span>
              <span className="disco-stat-lbl">Cançons compostes</span>
            </div>
            <div className="disco-stat-item">
              <span className="disco-stat-num">100%</span>
              <span className="disco-stat-lbl">Ànima Mediterrània</span>
            </div>
          </div>
        </div>
      </header>

      {/* ============================================================
          BARRA DE TIMELINE I SALT RÀPID (STICKY)
          ============================================================ */}
      <nav className="disco-timeline-wrap" aria-label="Navegació cronològica d'àlbums">
        <div className="disco-timeline-nav">
          <button
            type="button"
            className={`disco-timeline-pill ${activeAlbumSlug === "all" ? "is-active" : ""}`}
            onClick={() => scrollToAlbum("all")}
          >
            Tots els àlbums
          </button>
          {siteAlbums.map((album) => {
            const isActive = activeAlbumSlug === album.slug;
            return (
              <button
                key={album.slug}
                type="button"
                className={`disco-timeline-pill ${isActive ? "is-active" : ""}`}
                onClick={() => scrollToAlbum(album.slug)}
              >
                <span className="disco-pill-year">{album.year}</span>
                <span>{album.title}</span>
              </button>
            );
          })}
        </div>
      </nav>

      {/* ============================================================
          SECCIONS D'ÀLBUMS (EDITORIAL SHOWCASE)
          ============================================================ */}
      <main className="disco-albums-container">
        {siteAlbums.map((album, idx) => {
          const coverImg = ALBUM_COVERS[album.slug] || album.cover;
          const albumPreviewTrack = findSpotifyTrackForAlbum(album.title, album.tracks);
          const isAlbumPlaying = isPlaying && currentTrack.album.toLowerCase().includes(album.title.toLowerCase());

          return (
            <section
              key={album.slug}
              id={`album-${album.slug}`}
              data-album-slug={album.slug}
              className="disco-album-item"
              aria-labelledby={`heading-${album.slug}`}
            >
              <div className="disco-album-grid">
                {/* ----------------------------------------------------
                    COLUMNA ESQUERRA: FUNDA I VINIL INTERACTIU
                    ---------------------------------------------------- */}
                <div className="disco-cover-wrapper">
                  <div
                    className="disco-sleeve-stage"
                    onClick={() => albumPreviewTrack && handlePlaySpotifyTrack(albumPreviewTrack)}
                    title={`Reproduir mostra de ${album.title}`}
                  >
                    {/* Disc de vinil que llisca cap a fora en passar el cursor */}
                    <div className="disco-vinyl-disc" aria-hidden="true">
                      <div
                        className="disco-vinyl-label"
                        style={{ backgroundImage: `url(${coverImg})` }}
                      >
                        <div className="disco-vinyl-hole" />
                      </div>
                    </div>

                    {/* Funda (Sleeve) de l'àlbum */}
                    <div className="disco-sleeve-card">
                      <img
                        src={coverImg}
                        alt={`Caràtula de l'àlbum ${album.title} (${album.year}) de Miquel Gil`}
                        className="disco-sleeve-img"
                        loading={idx < 2 ? "eager" : "lazy"}
                      />

                      {/* Botó flotant de reproducció ràpida */}
                      {albumPreviewTrack && (
                        <button
                          type="button"
                          className={`disco-sleeve-play-badge ${isAlbumPlaying ? "is-playing" : ""}`}
                          aria-label={isAlbumPlaying ? "Pausar reproducció" : `Reproduir mostra de ${album.title}`}
                          onClick={(e) => {
                            e.stopPropagation();
                            handlePlaySpotifyTrack(albumPreviewTrack);
                          }}
                        >
                          <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                            {isAlbumPlaying ? (
                              <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                            ) : (
                              <polygon points="6 4 20 12 6 20 6 4" />
                            )}
                          </svg>
                          <span>{isAlbumPlaying ? "Reproduint" : "Escoltar mostra"}</span>
                        </button>
                      )}
                    </div>
                  </div>

                  {/* Metadades i enllaç a Spotify */}
                  <div className="disco-cover-meta">
                    <div className="disco-badges-row">
                      <span className="disco-meta-pill disco-meta-pill--year">{album.year}</span>
                      <span className="disco-meta-pill">{album.label}</span>
                      <span className="disco-meta-pill">{album.tracks.length} pistes</span>
                    </div>

                    <a
                      href={`https://open.spotify.com/search/${encodeURIComponent(`Miquel Gil ${album.title}`)}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="disco-spotify-btn"
                      title={`Obrir ${album.title} a Spotify`}
                    >
                      <svg viewBox="0 0 24 24">
                        <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.498 17.306c-.215.352-.676.463-1.028.248-2.816-1.72-6.36-2.11-10.536-1.157-.403.093-.808-.16-.9-.562-.092-.403.16-.807.563-.9 4.568-1.044 8.508-.598 11.653 1.343.352.215.463.676.248 1.028zm1.468-3.262c-.27.44-.848.578-1.288.308-3.224-1.982-8.14-2.557-11.954-1.399-.496.15-1.025-.133-1.176-.628-.15-.496.133-1.025.628-1.176 4.364-1.324 9.791-.684 13.482 1.583.44.27.578.848.308 1.288zm.126-3.41c-3.866-2.296-10.245-2.508-13.935-1.387-.593.18-1.22-.16-1.4-.753-.18-.593.16-1.22.753-1.4 4.24-1.288 11.284-1.04 15.68 1.57.533.316.708 1.01.392 1.543-.316.533-1.01.708-1.543.392z" />
                      </svg>
                      <span>Escolta l&apos;àlbum a Spotify</span>
                    </a>
                  </div>
                </div>

                {/* ----------------------------------------------------
                    COLUMNA DRETA: DETALLS EDITORIALS I TRACKLIST
                    ---------------------------------------------------- */}
                <div className="disco-details-col">
                  <div className="disco-album-header">
                    <span className="disco-album-kicker">
                      {album.label} — {album.year}
                    </span>
                    <h2 id={`heading-${album.slug}`} className="disco-album-title">
                      {album.title}
                    </h2>
                  </div>

                  <p className="disco-album-desc">{album.description}</p>

                  {/* Tracklist interactiu amb pistes reproduïbles */}
                  <div className="disco-tracklist-section">
                    <div className="disco-tracklist-title-row">
                      <span className="disco-tracklist-heading">Llista de cançons</span>
                      <span className="disco-tracklist-count">
                        {album.tracks.length} cançons
                      </span>
                    </div>

                    <div className="disco-tracks-list" role="list">
                      {album.tracks.map((trackName, tIdx) => {
                        const matchedSpotify = findSpotifyTrack(trackName);
                        const isThisTrackPlaying =
                          isPlaying &&
                          matchedSpotify &&
                          currentTrack.id === matchedSpotify.id;

                        const trackNumberStr = String(tIdx + 1).padStart(2, "0");

                        return (
                          <div
                            key={`${album.slug}-${tIdx}`}
                            role="listitem"
                            className={`disco-track-card ${isThisTrackPlaying ? "is-active" : ""}`}
                            onClick={() => {
                              if (matchedSpotify) {
                                handlePlaySpotifyTrack(matchedSpotify);
                              } else if (albumPreviewTrack) {
                                handlePlaySpotifyTrack(albumPreviewTrack);
                              }
                            }}
                          >
                            <div className="disco-track-left">
                              <span className="disco-track-num">{trackNumberStr}</span>
                              <span className="disco-track-name">{trackName}</span>
                            </div>

                            <div className="disco-track-right">
                              {matchedSpotify ? (
                                <>
                                  {isThisTrackPlaying ? (
                                    <div className="disco-eq-bars" aria-label="Reproduint àudio">
                                      <span className="disco-eq-bar" />
                                      <span className="disco-eq-bar" />
                                      <span className="disco-eq-bar" />
                                    </div>
                                  ) : (
                                    <span className="disco-track-badge-preview">Mostra</span>
                                  )}

                                  <button
                                    type="button"
                                    className="disco-track-play-btn"
                                    aria-label={
                                      isThisTrackPlaying
                                        ? `Pausar ${trackName}`
                                        : `Reproduir mostra de ${trackName}`
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
                                <button
                                  type="button"
                                  className="disco-track-play-btn"
                                  aria-label={`Reproduir àlbum ${album.title}`}
                                  title="Reproduir àudio de l'àlbum"
                                >
                                  <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor">
                                    <polygon points="6 4 20 12 6 20 6 4" />
                                  </svg>
                                </button>
                              )}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </div>
                </div>
              </div>
            </section>
          );
        })}
      </main>

      {/* ============================================================
          REPRODUCTOR D'ÀUDIO PERSISTENT INFERIOR
          ============================================================ */}
      <AudioPlayerBottom
        tracks={spotifyTracks}
        currentTrack={currentTrack}
        isPlaying={isPlaying}
        onTrackChange={handleTrackChange}
        onTogglePlay={handleTogglePlay}
      />
    </div>
  );
}
