"use client";

import React, { useState, useCallback } from "react";
import { albums as siteAlbums } from "@/lib/site";
import {
  spotifyTracks,
  type SpotifyTrack,
} from "@/lib/spotifyTracks";
import AudioPlayerBottom from "@/components/AudioPlayerBottom";
import MorphingAlbumList from "@/components/MorphingAlbumList";

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
          SISTEMA DE SELECCIÓ D'ÀLBUMS: ANNNIMATE MORPHING LIST
          ============================================================ */}
      <section className="disco-morphing-section" aria-label="Catàleg d'àlbums interactiu">
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
