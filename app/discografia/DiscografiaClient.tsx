"use client";

import React, { useState, useCallback } from "react";
import { albums as siteAlbums } from "@/lib/site";
import {
  spotifyTracks,
  type SpotifyTrack,
} from "@/lib/spotifyTracks";
import AudioPlayerBottom from "@/components/AudioPlayerBottom";
import MorphingAlbumList from "@/components/MorphingAlbumList";
import EqualizerBars from "@/components/EqualizerBars";

export default function DiscografiaClient() {
  const [currentTrack, setCurrentTrack] = useState<SpotifyTrack>(spotifyTracks[0]);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // Control de reproducció sincronitzat amb el reproductor flotant inferior
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

  const handlePlayLatestAlbum = useCallback(() => {
    // Disc més recent: Viatger (2024)
    const viatgerTrack = spotifyTracks.find((t) =>
      t.album.toLowerCase().includes("viatger")
    ) || spotifyTracks[0];
    setCurrentTrack(viatgerTrack);
    setIsPlaying(true);
  }, []);

  return (
    <div className="discografia-page cassette-theme">
      {/* ============================================================
          AUDIO EQUALIZER BARS — RISOGRAPH PRINT VISUAL METRONOME
          ============================================================ */}
      <div className="disco-top-equalizer-wrap">
        <EqualizerBars barCount={56} active={isPlaying} />
      </div>

      {/* ============================================================
          HERO EDITORIAL — CASSETTE DESIGN SYSTEM
          ============================================================ */}
      <header className="disco-hero">
        <div className="disco-hero-inner">
          {/* 1. Cassette Section Badge (900px pill, 1px solid #f0e226, two-line stacked) */}
          <div className="cassette-badge-wrap">
            <div className="cassette-section-badge">
              <span className="cassette-badge-primary">
                CATÀLEG DISCOGRÀFIC <span className="cassette-asterisk">✱</span> 1996 — 2024
              </span>
              <span className="cassette-badge-secondary">
                MIQUEL GIL // ARXIU D&apos;ARREL I FUSIÓ MEDITERRÀNIA
              </span>
            </div>
          </div>

          {/* 2. Display Wordmark (Edge-to-edge electric Apercu/Coign in #f0e226) */}
          <h1 className="disco-hero-wordmark">
            DISCOGRAFIA
          </h1>

          {/* 3. City Label Row / Geographic & Catalog Liner Notes */}
          <div className="cassette-city-row" aria-label="Nodes geogràfics i catàleg">
            <span className="city-cell">VALÈNCIA</span>
            <span className="city-sep">✱</span>
            <span className="city-cell">CATARROJA</span>
            <span className="city-sep">✱</span>
            <span className="city-cell">BARCELONA</span>
            <span className="city-sep">✱</span>
            <span className="city-cell">1996 — 2024</span>
            <span className="city-sep">✱</span>
            <span className="city-cell">23 TREBALLS DISCOGRÀFICS</span>
          </div>

          {/* 4. Section Heading (37px weight 400 Bone with #f0e226 highlight) */}
          <div className="disco-hero-heading-block">
            <h2 className="disco-hero-heading">
              Vint-i-tres treballs d&apos;arrel viva i{" "}
              <span className="cassette-highlight-underline">fusió mediterrània</span>
            </h2>
            <p className="disco-hero-body">
              UN VIATGE SONOR PER LA MÚSICA D&apos;ARREL, LA CANÇÓ D&apos;AUTOR I LA FUSIÓ
              MEDITERRÀNIA CONTEMPORÀNIA: DE LA POLIFONIA TRADICIONAL AL JAZZ, EL FLAMENC
              I LA MÚSICA ÀRAB CULTA.
            </p>
          </div>

          {/* 5. Pill Buttons Cluster (Filled #f0e226 & Outlined 1px #f0e226, 900px pills) */}
          <div className="cassette-actions-cluster">
            <button
              type="button"
              className="cassette-pill-btn cassette-pill-btn--filled"
              onClick={handlePlayLatestAlbum}
            >
              <span className="pill-icon">▶</span>
              REPRODUIR ÚLTIM DISC (VIATGER)
            </button>
            <a
              href="#cataleg-albums"
              className="cassette-pill-btn cassette-pill-btn--outlined"
            >
              <span className="pill-icon">◉</span>
              EXPLORAR 8 ÀLBUMS D&apos;ESTUDI
            </a>
          </div>

          {/* 6. 4-Column Logo Grid / Stats Grid with 1px Charcoal #272727 borders */}
          <div className="cassette-stats-grid">
            <div className="cassette-grid-cell">
              <span className="cassette-cell-num">8</span>
              <span className="cassette-cell-label">ÀLBURMS D&apos;ESTUDI</span>
            </div>
            <div className="cassette-grid-cell">
              <span className="cassette-cell-num">1996 — 2024</span>
              <span className="cassette-cell-label">PERÍODE EDITORIAL</span>
            </div>
            <div className="cassette-grid-cell">
              <span className="cassette-cell-num">80+</span>
              <span className="cassette-cell-label">PISTES EN CATÀLEG</span>
            </div>
            <div className="cassette-grid-cell">
              <span className="cassette-cell-num">100%</span>
              <span className="cassette-cell-label">ARREL &amp; MEDITERRANI</span>
            </div>
          </div>
        </div>
      </header>

      {/* ============================================================
          SISTEMA DE SELECCIÓ D'ÀLBUMS: ANNNIMATE MORPHING LIST
          ============================================================ */}
      <section
        id="cataleg-albums"
        className="disco-morphing-section"
        aria-label="Catàleg d'àlbums interactiu"
      >
        <MorphingAlbumList
          albums={siteAlbums}
          currentTrack={currentTrack}
          isPlaying={isPlaying}
          onPlayTrack={handlePlaySpotifyTrack}
          duration={0.55}
        />
      </section>

      {/* ============================================================
          REPRODUCTOR D'ÀUDIO PERSISTENT INFERIOR FLOTANT
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
