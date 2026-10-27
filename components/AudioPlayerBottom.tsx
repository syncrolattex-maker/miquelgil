"use client";

import { useEffect, useRef, useState, useCallback } from "react";
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
          // Autoplay policy might block unmuted play before user interaction
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
      // Don't trigger if user is focused on an input or textarea
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

  const formatTime = (secs: number) => {
    if (isNaN(secs)) return "0:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;

  return (
    <>
      {/* Hidden audio element */}
      <audio
        ref={audioRef}
        src={currentTrack.localAudio}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={handleTrackEnded}
        preload="metadata"
      />

      {/* Playlist Drawer (Pop-up) */}
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

      {/* Bottom Sticky Player Bar */}
      <aside
        className={`bottom-audio-player ${
          isMinimized ? "is-minimized" : ""
        }`}
        aria-label="Reproductor d'àudio de la discografia"
      >
        {/* Toggle Minimize/Maximize button */}
        <button
          type="button"
          className="bottom-player-minimize-btn"
          onClick={() => setIsMinimized((prev) => !prev)}
          title={isMinimized ? "Desplegar reproductor" : "Minimitzar reproductor"}
          aria-label={isMinimized ? "Desplegar reproductor" : "Minimitzar reproductor"}
        >
          <svg
            viewBox="0 0 24 24"
            width="16"
            height="16"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
            style={{
              transform: isMinimized ? "rotate(180deg)" : "rotate(0deg)",
              transition: "transform 0.3s ease",
            }}
          >
            <polyline points="6 9 12 15 18 9" />
          </svg>
        </button>

        <div className="bottom-player-inner">
          {/* LEFT: Current Track Info */}
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

          {/* CENTER: Audio Controls & Scrubber */}
          <div className="bottom-player-center">
            {/* Buttons Row */}
            <div className="bottom-player-controls">
              <button
                type="button"
                className="bottom-player-btn bottom-player-btn--skip"
                onClick={handlePrevTrack}
                title="Pista anterior"
                aria-label="Pista anterior"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
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
                  <svg viewBox="0 0 24 24" width="20" height="20" fill="currentColor">
                    <rect x="6" y="4" width="4" height="16" rx="1.5" />
                    <rect x="14" y="4" width="4" height="16" rx="1.5" />
                  </svg>
                ) : (
                  <svg
                    viewBox="0 0 24 24"
                    width="22"
                    height="22"
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
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
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

            {/* Scrubber Progress Bar */}
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

          {/* RIGHT: Extra actions (Playlist Drawer, Volume, Spotify Link) */}
          <div className="bottom-player-right">
            {/* Playlist drawer toggle button */}
            <button
              type="button"
              className={`bottom-player-action-btn ${
                isPlaylistOpen ? "is-active" : ""
              }`}
              onClick={() => setIsPlaylistOpen((prev) => !prev)}
              title="Veure les 10 pistes de Spotify"
              aria-label="Veure llista de pistes"
            >
              <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                <line x1="8" y1="6" x2="21" y2="6" strokeLinecap="round" />
                <line x1="8" y1="12" x2="21" y2="12" strokeLinecap="round" />
                <line x1="8" y1="18" x2="21" y2="18" strokeLinecap="round" />
                <circle cx="3.5" cy="6" r="1.5" fill="currentColor" stroke="none" />
                <circle cx="3.5" cy="12" r="1.5" fill="currentColor" stroke="none" />
                <circle cx="3.5" cy="18" r="1.5" fill="currentColor" stroke="none" />
              </svg>
              <span className="bottom-player-action-label">Pistes (10)</span>
            </button>

            {/* Volume control */}
            <div className="bottom-player-volume-wrap">
              <button
                type="button"
                className="bottom-player-volume-btn"
                onClick={() => setIsMuted((prev) => !prev)}
                title={isMuted ? "Activar so" : "Silenciar"}
                aria-label={isMuted ? "Activar so" : "Silenciar"}
              >
                {isMuted || volume === 0 ? (
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
                    <line x1="1" y1="1" x2="23" y2="23" strokeLinecap="round" />
                    <path d="M9 9l-4 4H1v-2h4l4-4v2z" />
                    <path d="M15.54 8.46a5 5 0 0 1 0 7.07" strokeDasharray="3 3" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2">
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

            {/* Open on Spotify Button */}
            <a
              href={currentTrack.spotifyUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="bottom-player-spotify-link"
              title="Escoltar sencer a Spotify"
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M12 0C5.4 0 0 5.4 0 12s5.4 12 12 12 12-5.4 12-12S18.66 0 12 0zm5.521 17.34c-.24.359-.66.48-1.021.24-2.82-1.74-6.36-2.101-10.561-1.141-.418.122-.779-.179-.899-.539-.12-.421.18-.78.54-.9 4.56-1.021 8.52-.6 11.64 1.32.42.18.479.659.301 1.02zm1.44-3.3c-.301.42-.841.6-1.262.3-3.239-1.98-8.159-2.58-11.939-1.38-.479.12-1.02-.12-1.14-.6-.12-.48.12-1.021.6-1.141C9.6 9.9 15 10.561 18.72 12.84c.361.181.54.78.241 1.2zm.12-3.36C15.24 8.4 8.82 8.16 5.16 9.301c-.6.179-1.2-.181-1.38-.721-.18-.601.18-1.2.72-1.381 4.26-1.26 11.28-1.02 15.721 1.621.539.3.719 1.02.419 1.56-.299.421-1.02.599-1.559.3z" />
              </svg>
              <span>Spotify</span>
            </a>
          </div>
        </div>
      </aside>
    </>
  );
}
