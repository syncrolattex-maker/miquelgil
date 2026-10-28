"use client";

import { useEffect, useRef, useState, useCallback } from "react";
import gsap from "gsap";
import type { SpotifyTrack } from "@/lib/spotifyTracks";

interface AudioPlayerBottomProps {
  tracks: SpotifyTrack[];
  currentTrack: SpotifyTrack;
  isPlaying: boolean;
  onTrackChange: (track: SpotifyTrack) => void;
  onTogglePlay: () => void;
}

export default function AudioPlayerBottom({
  tracks,
  currentTrack,
  isPlaying,
  onTrackChange,
  onTogglePlay,
}: AudioPlayerBottomProps) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const progressBarRef = useRef<HTMLDivElement | null>(null);

  // GSAP animation refs
  const playerContainerRef = useRef<HTMLElement | null>(null);
  const expandedContentRef = useRef<HTMLDivElement | null>(null);
  const miniContentRef = useRef<HTMLDivElement | null>(null);
  const timelineRef = useRef<gsap.core.Timeline | null>(null);
  const isFirstRender = useRef(true);

  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(30); // 30s preview default
  const [volume, setVolume] = useState<number>(0.85);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isPlaylistOpen, setIsPlaylistOpen] = useState<boolean>(false);
  const [isMinimized, setIsMinimized] = useState<boolean>(false);
  const [isSeeking, setIsSeeking] = useState<boolean>(false);

  // Sync audio play/pause with isPlaying prop
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;

    if (isPlaying) {
      const playPromise = audio.play();
      if (playPromise !== undefined) {
        playPromise.catch((err) => {
          console.warn("Audio autoplay blocked by browser policy:", err);
        });
      }
    } else {
      audio.pause();
    }
  }, [isPlaying, currentTrack]);

  // Update volume and mute
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = isMuted ? 0 : volume;
  }, [volume, isMuted]);

  // Handle audio time update
  const handleTimeUpdate = () => {
    if (isSeeking || !audioRef.current) return;
    setCurrentTime(audioRef.current.currentTime);
  };

  const handleLoadedMetadata = () => {
    if (!audioRef.current) return;
    if (audioRef.current.duration && !isNaN(audioRef.current.duration)) {
      setDuration(audioRef.current.duration);
    }
  };

  // When track ends, play next track
  const handleTrackEnded = useCallback(() => {
    const currentIndex = tracks.findIndex((t) => t.id === currentTrack.id);
    const nextIndex = (currentIndex + 1) % tracks.length;
    onTrackChange(tracks[nextIndex]);
  }, [tracks, currentTrack, onTrackChange]);

  const handlePrevTrack = () => {
    const currentIndex = tracks.findIndex((t) => t.id === currentTrack.id);
    const prevIndex = (currentIndex - 1 + tracks.length) % tracks.length;
    onTrackChange(tracks[prevIndex]);
  };

  const handleNextTrack = () => {
    const currentIndex = tracks.findIndex((t) => t.id === currentTrack.id);
    const nextIndex = (currentIndex + 1) % tracks.length;
    onTrackChange(tracks[nextIndex]);
  };

  // Seek bar interaction
  const handleSeek = (e: React.MouseEvent<HTMLDivElement>) => {
    const bar = progressBarRef.current;
    const audio = audioRef.current;
    if (!bar || !audio) return;

    const rect = bar.getBoundingClientRect();
    const clickX = e.clientX - rect.left;
    const fraction = Math.max(0, Math.min(1, clickX / rect.width));
    const newTime = fraction * duration;

    audio.currentTime = newTime;
    setCurrentTime(newTime);
  };

  // Keyboard shortcut: Space toggles play/pause
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement;
      if (
        target &&
        (target.tagName === "INPUT" ||
          target.tagName === "TEXTAREA" ||
          target.isContentEditable)
      ) {
        return;
      }

      if (e.code === "Space") {
        e.preventDefault();
        onTogglePlay();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onTogglePlay]);

  // GSAP Morph Animation entre estats Minimitzat (Floating Capsule) i Desplegat (Floating Island)
  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const container = playerContainerRef.current;
    const expandedEl = expandedContentRef.current;
    const miniEl = miniContentRef.current;
    if (!container) return;

    if (timelineRef.current) {
      timelineRef.current.kill();
    }

    const isMobile = window.innerWidth < 768;
    const targetWidth = isMobile
      ? "calc(100vw - 32px)"
      : Math.min(1040, window.innerWidth - 48);
    const miniWidth = isMobile ? "min(320px, calc(100vw - 32px))" : "330px";

    const tl = gsap.timeline();
    timelineRef.current = tl;

    if (isMinimized) {
      setIsPlaylistOpen(false);

      // 1. Ocultar contingut expandit
      if (expandedEl) {
        tl.to(expandedEl, {
          opacity: 0,
          scale: 0.94,
          duration: 0.18,
          ease: "power2.in",
          onComplete: () => {
            gsap.set(expandedEl, { display: "none" });
          },
        });
      }

      // 2. Transformar contenidor a càpsula flotant compacta
      tl.to(
        container,
        {
          width: miniWidth,
          height: 54,
          borderRadius: 27,
          duration: 0.42,
          ease: "power3.inOut",
        },
        "-=0.08"
      );

      // 3. Desplegar contingut mini amb suau pop elàstic
      if (miniEl) {
        tl.set(miniEl, { display: "flex" });
        tl.fromTo(
          miniEl,
          { opacity: 0, scale: 0.88 },
          { opacity: 1, scale: 1, duration: 0.3, ease: "back.out(1.5)" },
          "-=0.15"
        );
      }
    } else {
      // 1. Ocultar contingut mini
      if (miniEl) {
        tl.to(miniEl, {
          opacity: 0,
          scale: 0.88,
          duration: 0.16,
          ease: "power2.in",
          onComplete: () => {
            gsap.set(miniEl, { display: "none" });
          },
        });
      }

      // 2. Transformar contenidor a illa flotant ampla
      tl.to(
        container,
        {
          width: targetWidth,
          height: 78,
          borderRadius: 22,
          duration: 0.45,
          ease: "power3.out",
        },
        "-=0.06"
      );

      // 3. Desplegar contingut complet
      if (expandedEl) {
        tl.set(expandedEl, { display: "grid" });
        tl.fromTo(
          expandedEl,
          { opacity: 0, scale: 0.96 },
          { opacity: 1, scale: 1, duration: 0.32, ease: "power2.out" },
          "-=0.2"
        );
      }
    }
  }, [isMinimized]);

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return "0:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <>
      {/* Element d'àudio HTML ocult */}
      <audio
        ref={audioRef}
        src={currentTrack.localAudio}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleTrackEnded}
        preload="metadata"
      />

      {/* Playlist Drawer Flotant (Pop-up) */}
      <div
        className={`bottom-player-playlist-drawer ${
          isPlaylistOpen ? "is-open" : ""
        }`}
        aria-hidden={!isPlaylistOpen}
      >
        <div className="playlist-drawer-header">
          <div className="playlist-drawer-title-group">
            <span className="playlist-drawer-badge">Mostres oficials</span>
            <h4 className="playlist-drawer-title">Pistes de Spotify (10 temes)</h4>
          </div>
          <button
            type="button"
            className="playlist-drawer-close"
            onClick={() => setIsPlaylistOpen(false)}
            aria-label="Tancar llista de reproducció"
          >
            ✕
          </button>
        </div>

        <ul className="playlist-drawer-list">
          {tracks.map((track, idx) => {
            const isSelected = track.id === currentTrack.id;
            return (
              <li
                key={track.id}
                className={`playlist-drawer-item ${
                  isSelected ? "is-selected" : ""
                }`}
                onClick={() => {
                  onTrackChange(track);
                  if (!isPlaying) onTogglePlay();
                }}
              >
                <div className="playlist-item-left">
                  <span className="playlist-item-index">
                    {isSelected && isPlaying ? (
                      <span className="mini-eq">
                        <span></span>
                        <span></span>
                        <span></span>
                      </span>
                    ) : (
                      String(idx + 1).padStart(2, "0")
                    )}
                  </span>
                  <img
                    src={track.cover}
                    alt={track.title}
                    className="playlist-item-cover"
                    loading="lazy"
                  />
                  <div className="playlist-item-meta">
                    <span className="playlist-item-title">{track.title}</span>
                    <span className="playlist-item-album">
                      {track.album} {track.year ? `(${track.year})` : ""}
                    </span>
                  </div>
                </div>

                <div className="playlist-item-right">
                  <span className="playlist-item-tag">30s preview</span>
                  <a
                    href={track.spotifyUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="playlist-item-spotify"
                    onClick={(e) => e.stopPropagation()}
                    title="Escoltar a Spotify"
                  >
                    <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                      <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
                    </svg>
                  </a>
                </div>
              </li>
            );
          })}
        </ul>
      </div>

      {/* REPRODUCTOR FLOTANT D'ÀUDIO (Card Island animada amb GSAP) */}
      <aside
        ref={playerContainerRef}
        className={`floating-audio-player ${
          isMinimized ? "is-minimized" : "is-expanded"
        }`}
        aria-label="Reproductor d'àudio flotant de la discografia"
        onClick={isMinimized ? () => setIsMinimized(false) : undefined}
      >
        {/* VISTA MINIMITZADA (Càpsula Flotant Dinàmica) */}
        <div
          ref={miniContentRef}
          className="floating-player-mini"
          style={{ display: isMinimized ? "flex" : "none" }}
        >
          <div className="mini-cover-wrap">
            <img
              src={currentTrack.cover}
              alt={currentTrack.title}
              className={`mini-cover ${isPlaying ? "is-spinning" : ""}`}
            />
            {isPlaying && <span className="mini-pulse-ring" />}
          </div>

          <div className="mini-info">
            <span className="mini-title" title={currentTrack.title}>
              {currentTrack.title}
            </span>
            <span className="mini-artist">Miquel Gil</span>
          </div>

          {isPlaying && (
            <div className="mini-eq-bars" aria-label="Reproduint">
              <span className="mini-eq-bar" />
              <span className="mini-eq-bar" />
              <span className="mini-eq-bar" />
            </div>
          )}

          <div className="mini-actions" onClick={(e) => e.stopPropagation()}>
            <button
              type="button"
              className={`mini-play-btn ${isPlaying ? "is-playing" : ""}`}
              onClick={onTogglePlay}
              title={isPlaying ? "Pausar (Espai)" : "Reproduir (Espai)"}
              aria-label={isPlaying ? "Pausar" : "Reproduir"}
            >
              {isPlaying ? (
                <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                  <rect x="6" y="4" width="4" height="16" rx="1" />
                  <rect x="14" y="4" width="4" height="16" rx="1" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor" style={{ marginLeft: "1px" }}>
                  <polygon points="6 4 20 12 6 20 6 4" />
                </svg>
              )}
            </button>

            <button
              type="button"
              className="mini-expand-btn"
              onClick={() => setIsMinimized(false)}
              title="Desplegar reproductor complet"
              aria-label="Desplegar reproductor"
            >
              <svg
                viewBox="0 0 24 24"
                width="14"
                height="14"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="15 3 21 3 21 9" />
                <polyline points="9 21 3 21 3 15" />
                <line x1="21" y1="3" x2="14" y2="10" />
                <line x1="3" y1="21" x2="10" y2="14" />
              </svg>
            </button>
          </div>
        </div>

        {/* VISTA EXPANDIDA (Illa Flotant Completa) */}
        <div
          ref={expandedContentRef}
          className="floating-player-expanded"
          style={{ display: isMinimized ? "none" : "grid" }}
        >
          {/* ESQUERRA: Info cançó i caràtula */}
          <div className="bottom-player-track">
            <div className="bottom-player-cover-wrap">
              <img
                src={currentTrack.cover}
                alt={currentTrack.title}
                className="bottom-player-cover"
              />
              {isPlaying && (
                <div className="bottom-player-playing-indicator" title="Reproduint">
                  <span className="dot dot-1" />
                  <span className="dot dot-2" />
                  <span className="dot dot-3" />
                </div>
              )}
            </div>

            <div className="bottom-player-info">
              <div className="bottom-player-title-row">
                <span className="bottom-player-title" title={currentTrack.title}>
                  {currentTrack.title}
                </span>
                <span className="bottom-player-badge">PREVIEW</span>
              </div>
              <span className="bottom-player-album" title={currentTrack.album}>
                {currentTrack.album} {currentTrack.year ? `(${currentTrack.year})` : ""}
              </span>
            </div>
          </div>

          {/* CENTRE: Controls d'àudio i barra de progrés */}
          <div className="bottom-player-center">
            {/* Fila de botons */}
            <div className="bottom-player-controls">
              <button
                type="button"
                className="bottom-player-btn bottom-player-btn--skip"
                onClick={handlePrevTrack}
                title="Pista anterior"
                aria-label="Pista anterior"
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                  <polygon points="19 20 9 12 19 4 19 20" />
                  <line
                    x1="5"
                    y1="19"
                    x2="5"
                    y2="5"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </svg>
              </button>

              <button
                type="button"
                className={`bottom-player-btn bottom-player-btn--play ${
                  isPlaying ? "is-playing" : ""
                }`}
                onClick={onTogglePlay}
                title={isPlaying ? "Pausa (Espai)" : "Reproduir (Espai)"}
                aria-label={isPlaying ? "Pausa" : "Reproduir"}
              >
                {isPlaying ? (
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                    <rect x="6" y="4" width="4" height="16" rx="1.5" />
                    <rect x="14" y="4" width="4" height="16" rx="1.5" />
                  </svg>
                ) : (
                  <svg
                    viewBox="0 0 24 24"
                    width="18"
                    height="18"
                    fill="currentColor"
                    style={{ marginLeft: "2px" }}
                  >
                    <polygon points="6 4 20 12 6 20 6 4" />
                  </svg>
                )}
              </button>

              <button
                type="button"
                className="bottom-player-btn bottom-player-btn--skip"
                onClick={handleNextTrack}
                title="Pista següent"
                aria-label="Pista següent"
              >
                <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                  <polygon points="5 4 15 12 5 20 5 4" />
                  <line
                    x1="19"
                    y1="5"
                    x2="19"
                    y2="19"
                    stroke="currentColor"
                    strokeWidth="2.5"
                    strokeLinecap="round"
                  />
                </svg>
              </button>
            </div>

            {/* Barra de progrés scrubber */}
            <div className="bottom-player-scrubber-group">
              <span className="bottom-player-time bottom-player-time--current">
                {formatTime(currentTime)}
              </span>

              <div
                className="bottom-player-progress-bar"
                ref={progressBarRef}
                onClick={handleSeek}
                title="Avançar / Retrocedir"
              >
                <div
                  className="bottom-player-progress-fill"
                  style={{ width: `${progressPercent}%` }}
                >
                  <span className="bottom-player-progress-thumb" />
                </div>
              </div>

              <span className="bottom-player-time bottom-player-time--total">
                {formatTime(duration)}
              </span>
            </div>
          </div>

          {/* DRETA: Accions, volum, Spotify i minimitzador */}
          <div className="bottom-player-right">
            {/* Selector de llista de reproducció */}
            <button
              type="button"
              className={`bottom-player-action-btn ${
                isPlaylistOpen ? "is-active" : ""
              }`}
              onClick={() => setIsPlaylistOpen((prev) => !prev)}
              title="Veure les 10 pistes de Spotify"
              aria-label="Veure llista de pistes"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="8" y1="6" x2="21" y2="6" strokeLinecap="round" />
                <line x1="8" y1="12" x2="21" y2="12" strokeLinecap="round" />
                <line x1="8" y1="18" x2="21" y2="18" strokeLinecap="round" />
                <circle cx="3.5" cy="6" r="1.5" fill="currentColor" stroke="none" />
                <circle cx="3.5" cy="12" r="1.5" fill="currentColor" stroke="none" />
                <circle cx="3.5" cy="18" r="1.5" fill="currentColor" stroke="none" />
              </svg>
              <span className="bottom-player-action-label">Pistes (10)</span>
            </button>

            {/* Control de volum */}
            <div className="bottom-player-volume-wrap">
              <button
                type="button"
                className="bottom-player-volume-btn"
                onClick={() => setIsMuted((prev) => !prev)}
                title={isMuted ? "Activar so" : "Silenciar"}
                aria-label={isMuted ? "Activar so" : "Silenciar"}
              >
                {isMuted || volume === 0 ? (
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="1" y1="1" x2="23" y2="23" strokeLinecap="round" />
                    <path d="M9 9l-4 4H1v-2h4l4-4v2z" />
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" strokeDasharray="3 3" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2">
                    <polygon points="11 5 6 9 2 9 2 15 6 15 11 19 11 5" fill="currentColor" stroke="none" />
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" strokeLinecap="round" />
                    <path d="M19.07 4.93a10 10 0 0 1 0 14.14" strokeLinecap="round" />
                  </svg>
                )}
              </button>

              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={(e) => {
                  const val = parseFloat(e.target.value);
                  setVolume(val);
                  if (isMuted && val > 0) setIsMuted(false);
                }}
                className="bottom-player-volume-slider"
                title="Control de volum"
                aria-label="Control de volum"
              />
            </div>

            {/* Enllaç extern Spotify */}
            <a
              href={currentTrack.spotifyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bottom-player-spotify-link"
              title="Escoltar sencer a Spotify"
            >
              <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
              </svg>
              <span>Spotify</span>
            </a>

            {/* BOTÓ DE MINIMITZAR (GSAP TOGGLE) */}
            <button
              type="button"
              className="bottom-player-minimize-toggle"
              onClick={() => setIsMinimized(true)}
              title="Minimitzar reproductor a càpsula flotant"
              aria-label="Minimitzar reproductor"
            >
              <svg
                viewBox="0 0 24 24"
                width="16"
                height="16"
                fill="none"
                stroke="currentColor"
                strokeWidth="2.2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <polyline points="4 14 10 14 10 20" />
                <polyline points="20 10 14 10 14 4" />
                <line x1="14" y1="10" x2="21" y2="3" />
                <line x1="3" y1="21" x2="10" y2="14" />
              </svg>
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}
