"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import "./AnnnimateVideoPlayer.css";

interface AnnnimateVideoPlayerProps {
  src: string;
  poster?: string;
  title?: string;
  credits?: string;
}

export default function AnnnimateVideoPlayer({
  src,
  poster = "/video/nineta_frame.jpg",
  title = "Nineta",
  credits = "Tubal Perales, Vicent Todolí i Enric Alepuz",
}: AnnnimateVideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const scrubBarRef = useRef<HTMLDivElement | null>(null);
  const hideControlsTimerRef = useRef<NodeJS.Timeout | null>(null);

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [duration, setDuration] = useState<number>(0);
  const [bufferedEnd, setBufferedEnd] = useState<number>(0);
  const [volume, setVolume] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isLooping, setIsLooping] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showControls, setShowControls] = useState<boolean>(true);
  const [isScrubbing, setIsScrubbing] = useState<boolean>(false);

  // Scrubber hover preview
  const [isHoveringScrubber, setIsHoveringScrubber] = useState<boolean>(false);
  const [hoverTime, setHoverTime] = useState<number>(0);
  const [hoverPosPercent, setHoverPosPercent] = useState<number>(0);

  // Formatting helper: seconds to M:SS or MM:SS
  const formatTime = (timeInSeconds: number) => {
    if (isNaN(timeInSeconds) || timeInSeconds < 0) return "0:00";
    const minutes = Math.floor(timeInSeconds / 60);
    const seconds = Math.floor(timeInSeconds % 60);
    return `${minutes}:${seconds < 10 ? "0" : ""}${seconds}`;
  };

  // Play / Pause toggle
  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused || video.ended) {
      video.play().then(() => setIsPlaying(true)).catch((err) => {
        console.warn("Playback error:", err);
      });
    } else {
      video.pause();
      setIsPlaying(false);
    }
  }, []);

  // Time update listener
  const handleTimeUpdate = () => {
    const video = videoRef.current;
    if (!video || isScrubbing) return;
    setCurrentTime(video.currentTime);

    // Buffer tracking
    if (video.buffered.length > 0) {
      const lastBufferedIndex = video.buffered.length - 1;
      setBufferedEnd(video.buffered.end(lastBufferedIndex));
    }
  };

  // Metadata loaded
  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    if (!video) return;
    setDuration(video.duration);
  };

  // Autohide controls logic
  const resetControlsTimer = useCallback(() => {
    setShowControls(true);
    if (hideControlsTimerRef.current) {
      clearTimeout(hideControlsTimerRef.current);
    }
    if (isPlaying && !isScrubbing && !isHoveringScrubber) {
      hideControlsTimerRef.current = setTimeout(() => {
        setShowControls(false);
      }, 2500);
    }
  }, [isPlaying, isScrubbing, isHoveringScrubber]);

  useEffect(() => {
    resetControlsTimer();
    return () => {
      if (hideControlsTimerRef.current) clearTimeout(hideControlsTimerRef.current);
    };
  }, [isPlaying, resetControlsTimer]);

  // Volume & Mute handlers
  const handleVolumeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newVol = parseFloat(e.target.value);
    setVolume(newVol);
    if (videoRef.current) {
      videoRef.current.volume = newVol;
      videoRef.current.muted = newVol === 0;
      setIsMuted(newVol === 0);
    }
  };

  const toggleMute = () => {
    if (!videoRef.current) return;
    if (isMuted) {
      videoRef.current.muted = false;
      setIsMuted(false);
      if (volume === 0) {
        setVolume(0.5);
        videoRef.current.volume = 0.5;
      }
    } else {
      videoRef.current.muted = true;
      setIsMuted(true);
    }
  };

  const toggleLoop = () => {
    if (!videoRef.current) return;
    const nextLoop = !isLooping;
    videoRef.current.loop = nextLoop;
    setIsLooping(nextLoop);
  };

  // Fullscreen handler
  const toggleFullscreen = useCallback(() => {
    const container = containerRef.current;
    if (!container) return;

    if (!document.fullscreenElement) {
      if (container.requestFullscreen) {
        container.requestFullscreen().catch(() => {
          setIsFullscreen(true);
        });
      } else {
        setIsFullscreen(true);
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      }
      setIsFullscreen(false);
    }
  }, []);

  // Listen to fullscreen changes
  useEffect(() => {
    const onFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", onFullscreenChange);
    return () => {
      document.removeEventListener("fullscreenchange", onFullscreenChange);
    };
  }, []);

  // Keyboard accessibility
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Only process when focused inside container or playing
      if (!containerRef.current?.contains(document.activeElement) && !isFullscreen) {
        return;
      }

      if (e.code === "Space" || e.key === "k") {
        e.preventDefault();
        togglePlay();
      } else if (e.key === "f") {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key === "m") {
        e.preventDefault();
        toggleMute();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        if (videoRef.current) {
          videoRef.current.currentTime = Math.max(0, videoRef.current.currentTime - 5);
          setCurrentTime(videoRef.current.currentTime);
        }
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        if (videoRef.current) {
          videoRef.current.currentTime = Math.min(duration, videoRef.current.currentTime + 5);
          setCurrentTime(videoRef.current.currentTime);
        }
      } else if (e.key === "ArrowUp") {
        e.preventDefault();
        setVolume((v) => {
          const next = Math.min(1, v + 0.1);
          if (videoRef.current) videoRef.current.volume = next;
          return next;
        });
      } else if (e.key === "ArrowDown") {
        e.preventDefault();
        setVolume((v) => {
          const next = Math.max(0, v - 0.1);
          if (videoRef.current) videoRef.current.volume = next;
          return next;
        });
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [togglePlay, toggleFullscreen, duration, isFullscreen]);

  // Scrub bar mouse/touch interactions
  const calculateScrubPosition = (clientX: number) => {
    if (!scrubBarRef.current || duration === 0) return 0;
    const rect = scrubBarRef.current.getBoundingClientRect();
    const clampedX = Math.max(0, Math.min(clientX - rect.left, rect.width));
    return (clampedX / rect.width) * duration;
  };

  const handleScrubberMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!scrubBarRef.current || duration === 0) return;
    const rect = scrubBarRef.current.getBoundingClientRect();
    const clampedX = Math.max(0, Math.min(e.clientX - rect.left, rect.width));
    const percent = (clampedX / rect.width) * 100;
    const timeAtPos = (clampedX / rect.width) * duration;

    setIsHoveringScrubber(true);
    setHoverPosPercent(percent);
    setHoverTime(timeAtPos);
  };

  const handleScrubberMouseLeave = () => {
    setIsHoveringScrubber(false);
  };

  const handleScrubberMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    setIsScrubbing(true);
    const newTime = calculateScrubPosition(e.clientX);
    setCurrentTime(newTime);
    if (videoRef.current) {
      videoRef.current.currentTime = newTime;
    }

    const onMouseMove = (moveEvent: MouseEvent) => {
      const moveTime = calculateScrubPosition(moveEvent.clientX);
      setCurrentTime(moveTime);
      if (videoRef.current) {
        videoRef.current.currentTime = moveTime;
      }
    };

    const onMouseUp = () => {
      setIsScrubbing(false);
      window.removeEventListener("mousemove", onMouseMove);
      window.removeEventListener("mouseup", onMouseUp);
    };

    window.addEventListener("mousemove", onMouseMove);
    window.addEventListener("mouseup", onMouseUp);
  };

  // Progress percentages
  const progressPercent = duration > 0 ? (currentTime / duration) * 100 : 0;
  const bufferPercent = duration > 0 ? (bufferedEnd / duration) * 100 : 0;

  return (
    <div
      ref={containerRef}
      className={`ann-player ${isFullscreen ? "is-fullscreen" : ""} ${
        isPlaying ? "is-playing" : "is-paused"
      }`}
      tabIndex={0}
      onMouseMove={resetControlsTimer}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      aria-label="Reproductor de vídeo Nineta de Miquel Gil"
    >
      {/* Video element */}
      <video
        ref={videoRef}
        src={src}
        poster={poster}
        playsInline
        preload="metadata"
        className="ann-player-video"
        onClick={togglePlay}
        onTimeUpdate={handleTimeUpdate}
        onLoadedMetadata={handleLoadedMetadata}
        onEnded={() => setIsPlaying(false)}
      />

      {/* Top Header Badge (Title & HD indicator) */}
      <div className={`ann-player-topbar ${showControls || !isPlaying ? "is-visible" : ""}`}>
        <div className="ann-player-topbar-info">
          <span className="ann-player-topbar-tag">CLIP OFICIAL</span>
          <span className="ann-player-topbar-title">{title}</span>
        </div>
        <span className="ann-player-badge-hd">HD 1080p</span>
      </div>

      {/* Center Big Play/Pause Button */}
      <button
        type="button"
        className={`ann-player-center-play ${
          isPlaying ? "is-hidden" : "is-visible"
        }`}
        onClick={togglePlay}
        aria-label={isPlaying ? "Pausar vídeo" : "Reproduir vídeo"}
      >
        <div className="ann-player-play-icon-wrap">
          <svg viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
            <polygon points="7 4 20 12 7 20 7 4" />
          </svg>
        </div>
      </button>

      {/* Bottom Controls Bar */}
      <div
        className={`ann-player-controls ${
          showControls || !isPlaying || isScrubbing ? "is-visible" : ""
        }`}
      >
        {/* Scrubber / Progress Bar */}
        <div
          ref={scrubBarRef}
          className="ann-player-scrubber"
          onMouseMove={handleScrubberMouseMove}
          onMouseLeave={handleScrubberMouseLeave}
          onMouseDown={handleScrubberMouseDown}
          role="slider"
          aria-label="Progrés del vídeo"
          aria-valuemin={0}
          aria-valuemax={duration}
          aria-valuenow={currentTime}
        >
          {/* Hover Time Tooltip */}
          {isHoveringScrubber && (
            <div
              className="ann-player-tooltip"
              style={{ left: `${hoverPosPercent}%` }}
            >
              {formatTime(hoverTime)}
            </div>
          )}

          {/* Background Track */}
          <div className="ann-player-track-bg" />

          {/* Buffer Progress */}
          <div
            className="ann-player-track-buffer"
            style={{ width: `${Math.min(100, bufferPercent)}%` }}
          />

          {/* Played Progress */}
          <div
            className="ann-player-track-played"
            style={{ width: `${progressPercent}%` }}
          >
            <div className="ann-player-track-thumb" />
          </div>
        </div>

        {/* Action Controls Row */}
        <div className="ann-player-actions">
          {/* LEFT: Play/Pause & Time */}
          <div className="ann-player-actions-left">
            <button
              type="button"
              className="ann-player-btn ann-player-btn--play"
              onClick={togglePlay}
              aria-label={isPlaying ? "Pausa (Espai)" : "Reproduir (Espai)"}
              title={isPlaying ? "Pausa (Espai)" : "Reproduir (Espai)"}
            >
              {isPlaying ? (
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <polygon points="6 4 20 12 6 20 6 4" />
                </svg>
              )}
            </button>

            {/* Time Stamp */}
            <div className="ann-player-time">
              <span className="ann-player-time-current">{formatTime(currentTime)}</span>
              <span className="ann-player-time-sep">/</span>
              <span className="ann-player-time-total">{formatTime(duration)}</span>
            </div>
          </div>

          {/* RIGHT: Volume, Loop, Fullscreen */}
          <div className="ann-player-actions-right">
            {/* Volume Group */}
            <div className="ann-player-volume-group">
              <button
                type="button"
                className="ann-player-btn ann-player-btn--volume"
                onClick={toggleMute}
                aria-label={isMuted ? "Activar so (M)" : "Silenciar (M)"}
                title={isMuted ? "Activar so (M)" : "Silenciar (M)"}
              >
                {isMuted || volume === 0 ? (
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                    <path d="M16.5 12c0-1.77-1.02-3.29-2.5-4.03v2.21l2.45 2.45c.03-.2.05-.41.05-.63zm2.5 0c0 .94-.2 1.82-.54 2.64l1.51 1.51C20.63 14.91 21 13.5 21 12c0-4.28-2.99-7.86-7-8.77v2.06c2.89.86 5 3.54 5 6.71zM4.27 3L3 4.27 7.73 9H3v6h4l5 5v-6.73l4.25 4.25c-.67.52-1.42.93-2.25 1.18v2.06c1.38-.31 2.63-.95 3.69-1.81L19.73 21 21 19.73l-9-9L4.27 3zM12 4L9.91 6.09 12 8.18V4z" />
                  </svg>
                ) : volume < 0.5 ? (
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                    <path d="M18.5 12c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM5 9v6h4l5 5V4L9 9H5z" />
                  </svg>
                ) : (
                  <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                    <path d="M3 9v6h4l5 5V4L7 9H3zm13.5 3c0-1.77-1.02-3.29-2.5-4.03v8.05c1.48-.73 2.5-2.25 2.5-4.02zM14 3.23v2.06c2.89.86 5 3.54 5 6.71s-2.11 5.85-5 6.71v2.06c4.01-.91 7-4.49 7-8.77s-2.99-7.86-7-8.77z" />
                  </svg>
                )}
              </button>

              <input
                type="range"
                min="0"
                max="1"
                step="0.05"
                value={isMuted ? 0 : volume}
                onChange={handleVolumeChange}
                className="ann-player-volume-slider"
                aria-label="Volum d'àudio"
              />
            </div>

            {/* Loop Toggle */}
            <button
              type="button"
              className={`ann-player-btn ann-player-btn--loop ${isLooping ? "is-active" : ""}`}
              onClick={toggleLoop}
              aria-label={isLooping ? "Bucle activat" : "Repetir vídeo"}
              title={isLooping ? "Bucle activat" : "Repetir vídeo"}
            >
              <svg viewBox="0 0 24 24" width="16" height="16" fill="currentColor">
                <path d="M7 7h10v3l4-4-4-4v3H5v6h2V7zm10 10H7v-3l-4 4 4 4v-3h12v-6h-2v4z" />
              </svg>
            </button>

            {/* Fullscreen Button */}
            <button
              type="button"
              className="ann-player-btn ann-player-btn--fullscreen"
              onClick={toggleFullscreen}
              aria-label={isFullscreen ? "Sortir de pantalla completa (F)" : "Pantalla completa (F)"}
              title={isFullscreen ? "Sortir de pantalla completa (F)" : "Pantalla completa (F)"}
            >
              {isFullscreen ? (
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <path d="M5 16h3v3h2v-5H5v2zm3-8H5v2h5V5H8v3zm6 11h2v-3h3v-2h-5v5zm2-11V5h-2v5h5V8h-3z" />
                </svg>
              ) : (
                <svg viewBox="0 0 24 24" width="18" height="18" fill="currentColor">
                  <path d="M7 14H5v5h5v-2H7v-3zm-2-4h2V7h3V5H5v5zm12 7h-3v2h5v-5h-2v3zM14 5v2h3v3h2V5h-5z" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
