"use client";

import React, { useState, useRef, useEffect, useCallback } from "react";
import gsap from "gsap";
import { Flip } from "gsap/Flip";
import "./AnnnimateVideoPlayer.css";

// Register GSAP Flip plugin safely in browser
if (typeof window !== "undefined") {
  gsap.registerPlugin(Flip);
}

export interface AnnnimateVideoPlayerProps {
  src: string;
  poster?: string;
  title?: string;
  credits?: string;
  duration?: number; // flip transition duration, default: 0.9s (Annnimate spec)
}

export default function AnnnimateVideoPlayer({
  src,
  poster = "/video/nineta_frame.jpg",
  title = "Nineta — Videoclip Oficial",
  credits = "Tubal Perales, Vicent Todolí i Enric Alepuz",
  duration = 0.9,
}: AnnnimateVideoPlayerProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const surfaceRef = useRef<HTMLDivElement | null>(null);
  const backdropRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const scrubBarRef = useRef<HTMLDivElement | null>(null);
  const volumeBarRef = useRef<HTMLDivElement | null>(null);

  const hideControlsTimerRef = useRef<NodeJS.Timeout | null>(null);
  const flipTimelineRef = useRef<gsap.core.Timeline | null>(null);

  const [isPlaying, setIsPlaying] = useState<boolean>(false);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [videoDuration, setVideoDuration] = useState<number>(0);
  const [bufferedEnd, setBufferedEnd] = useState<number>(0);
  const [volume, setVolume] = useState<number>(1);
  const [isMuted, setIsMuted] = useState<boolean>(false);
  const [isLooping, setIsLooping] = useState<boolean>(false);
  const [isFullscreen, setIsFullscreen] = useState<boolean>(false);
  const [showControls, setShowControls] = useState<boolean>(true);
  const [isScrubbing, setIsScrubbing] = useState<boolean>(false);

  // Scrubber hover state
  const [isHoveringScrub, setIsHoveringScrub] = useState<boolean>(false);
  const [hoverScrubTime, setHoverScrubTime] = useState<number>(0);
  const [hoverScrubPercent, setHoverScrubPercent] = useState<number>(0);

  // Format seconds to M:SS
  const formatTime = (secs: number) => {
    if (isNaN(secs) || secs < 0) return "0:00";
    const m = Math.floor(secs / 60);
    const s = Math.floor(secs % 60);
    return `${m}:${s < 10 ? "0" : ""}${s}`;
  };

  // Play / Pause toggle
  const togglePlay = useCallback(() => {
    const video = videoRef.current;
    if (!video) return;

    if (video.paused || video.ended) {
      video
        .play()
        .then(() => setIsPlaying(true))
        .catch((err) => console.warn("Playback error:", err));
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

    if (video.buffered.length > 0) {
      const last = video.buffered.length - 1;
      setBufferedEnd(video.buffered.end(last));
    }
  };

  const handleLoadedMetadata = () => {
    const video = videoRef.current;
    if (!video) return;
    setVideoDuration(video.duration);
  };

  // Autohide controls during playback
  const resetControlsTimer = useCallback(() => {
    setShowControls(true);
    if (hideControlsTimerRef.current) {
      clearTimeout(hideControlsTimerRef.current);
    }
    if (isPlaying && !isScrubbing && !isHoveringScrub) {
      hideControlsTimerRef.current = setTimeout(() => {
        setShowControls(false);
      }, 2600);
    }
  }, [isPlaying, isScrubbing, isHoveringScrub]);

  useEffect(() => {
    resetControlsTimer();
    return () => {
      if (hideControlsTimerRef.current) clearTimeout(hideControlsTimerRef.current);
    };
  }, [isPlaying, resetControlsTimer]);

  // ANNNIMATE FLIP EXPANSION ANIMATION
  // Grows out of its slot to fill the entire viewport, and flies back on close,
  // without ever stopping or reloading the video!
  const toggleFullscreen = useCallback(() => {
    const container = containerRef.current;
    const surface = surfaceRef.current;
    const backdrop = backdropRef.current;
    if (!container || !surface) return;

    if (flipTimelineRef.current) {
      flipTimelineRef.current.kill();
    }

    const willBeFullscreen = !isFullscreen;
    setIsFullscreen(willBeFullscreen);

    // 1. Capture current first position & bounding box with GSAP Flip
    const state = Flip.getState(surface);

    // 2. Toggle class so surface targets its fullwidth/fullscreen fixed layout
    if (willBeFullscreen) {
      container.classList.add("vp_is_lifted", "vp_is_expanded");
      document.body.style.overflow = "hidden";
    } else {
      container.classList.remove("vp_is_expanded");
      document.body.style.overflow = "";
    }

    // 3. FLIP from old rect to new rect with smooth Annnimate exponential curve
    const tl = gsap.timeline({
      onComplete: () => {
        if (!willBeFullscreen) {
          container.classList.remove("vp_is_lifted");
        }
        flipTimelineRef.current = null;
      },
    });
    flipTimelineRef.current = tl;

    tl.add(
      Flip.from(state, {
        duration,
        ease: "expo.inOut",
      }),
      0
    );

    // Smoothly square off corners when expanding, or round again when returning
    tl.to(
      surface,
      {
        borderRadius: willBeFullscreen ? 0 : 20,
        duration,
        ease: "expo.inOut",
      },
      0
    );

    // Dim or brighten backdrop
    if (backdrop) {
      tl.to(
        backdrop,
        {
          autoAlpha: willBeFullscreen ? 0.85 : 0,
          duration,
          ease: "expo.inOut",
        },
        0
      );
    }
  }, [isFullscreen, duration]);

  // Volume & Mute
  const handleVolumeTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!volumeBarRef.current || !videoRef.current) return;
    const rect = volumeBarRef.current.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setVolume(ratio);
    videoRef.current.volume = ratio;
    const muted = ratio === 0;
    videoRef.current.muted = muted;
    setIsMuted(muted);
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
    const next = !isLooping;
    videoRef.current.loop = next;
    setIsLooping(next);
  };

  // Keyboard accessibility
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore typing in input fields
      const target = e.target as HTMLElement;
      if (target && (target.tagName === "INPUT" || target.tagName === "TEXTAREA")) return;

      if (e.key === "Escape" && isFullscreen) {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.key === "f" || e.key === "F") {
        e.preventDefault();
        toggleFullscreen();
      } else if (e.code === "Space" || e.key === "k" || e.key === "K") {
        e.preventDefault();
        togglePlay();
      } else if (e.key === "m" || e.key === "M") {
        e.preventDefault();
        toggleMute();
      } else if (e.key === "l" || e.key === "L") {
        e.preventDefault();
        toggleLoop();
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        if (videoRef.current) {
          const t = Math.max(0, videoRef.current.currentTime - 5);
          videoRef.current.currentTime = t;
          setCurrentTime(t);
        }
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        if (videoRef.current) {
          const t = Math.min(videoDuration, videoRef.current.currentTime + 5);
          videoRef.current.currentTime = t;
          setCurrentTime(t);
        }
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [isFullscreen, toggleFullscreen, togglePlay, videoDuration]);

  // Continuous Scrubber interactions
  const handleScrubMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!scrubBarRef.current || videoDuration === 0) return;
    const rect = scrubBarRef.current.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    setIsHoveringScrub(true);
    setHoverScrubPercent(ratio * 100);
    setHoverScrubTime(ratio * videoDuration);
  };

  const handleScrubMouseLeave = () => {
    setIsHoveringScrub(false);
  };

  const handleScrubMouseDown = (e: React.MouseEvent<HTMLDivElement>) => {
    if (!scrubBarRef.current || videoDuration === 0) return;
    setIsScrubbing(true);
    const rect = scrubBarRef.current.getBoundingClientRect();
    const ratio = Math.max(0, Math.min(1, (e.clientX - rect.left) / rect.width));
    const newTime = ratio * videoDuration;
    setCurrentTime(newTime);
    if (videoRef.current) videoRef.current.currentTime = newTime;

    const onMove = (me: MouseEvent) => {
      const curRatio = Math.max(0, Math.min(1, (me.clientX - rect.left) / rect.width));
      const curTime = curRatio * videoDuration;
      setCurrentTime(curTime);
      if (videoRef.current) videoRef.current.currentTime = curTime;
    };

    const onUp = () => {
      setIsScrubbing(false);
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    };

    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  };

  const progressPercent = videoDuration > 0 ? (currentTime / videoDuration) * 100 : 0;
  const bufferPercent = videoDuration > 0 ? (bufferedEnd / videoDuration) * 100 : 0;
  const currentVolume = isMuted ? 0 : volume;

  return (
    <div
      ref={containerRef}
      className={`vp_player ${isFullscreen ? "vp_is_expanded vp_is_lifted" : ""}`}
      data-anm-video-player
      data-anm-duration={duration}
      data-anm-ease="annnimateInOut"
      data-anm-radius="20"
      data-anm-backdrop="0.8"
      data-anm-fit="cover"
      data-anm-native-fullscreen="false"
      onMouseMove={resetControlsTimer}
      onMouseEnter={() => setShowControls(true)}
      onMouseLeave={() => isPlaying && setShowControls(false)}
      aria-label={`Reproductor de vídeo ${title}`}
    >
      {/* 1. Backdrop for dimming page behind the player when growing */}
      <div
        ref={backdropRef}
        className="vp_backdrop"
        data-anm-vp-backdrop
        onClick={isFullscreen ? toggleFullscreen : undefined}
        aria-hidden={!isFullscreen}
      />

      {/* 2. The Animated Surface that FLIP-grows out of its slot to fill the viewport */}
      <div
        ref={surfaceRef}
        className="vp_surface"
        data-anm-vp-surface
        tabIndex={0}
        role="region"
        aria-label={`Vídeo ${title}`}
        onClick={togglePlay}
      >
        {/* Video Element (Keeps playing continuously without moving in DOM) */}
        <video
          ref={videoRef}
          className="vp_video"
          data-anm-vp-video
          src={src}
          poster={poster}
          playsInline
          preload="metadata"
          onTimeUpdate={handleTimeUpdate}
          onLoadedMetadata={handleLoadedMetadata}
          onEnded={() => setIsPlaying(false)}
        />

        {/* Subtle Dark Gradient Scrim at bottom */}
        <span className="vp_scrim" data-anm-vp-scrim aria-hidden="true" />

        {/* Top Header Badge (Title & HD indicator) */}
        <div
          className={`vp_topbar ${showControls || !isPlaying ? "is-visible" : "is-hidden"}`}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="vp_topbar_info">
            <span className="vp_tag">CLIP OFICIAL</span>
            <span className="vp_title">{title}</span>
          </div>
          <div className="vp_topbar_actions">
            <span className="vp_hd_badge">HD 1080p</span>
            {isFullscreen && (
              <button
                type="button"
                className="vp_close_btn"
                onClick={toggleFullscreen}
                aria-label="Tancar pantalla completa (Esc)"
                title="Tancar pantalla completa (Esc)"
              >
                <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18"></line>
                  <line x1="6" y1="6" x2="18" y2="18"></line>
                </svg>
              </button>
            )}
          </div>
        </div>

        {/* Big Center Play / Pause Icon Button */}
        <button
          type="button"
          className={`vp_big_play ${isPlaying ? "is-hidden" : "is-visible"}`}
          data-anm-vp-big-play
          aria-label={isPlaying ? "Pausar vídeo" : "Reproduir vídeo"}
          onClick={(e) => {
            e.stopPropagation();
            togglePlay();
          }}
        >
          <svg className="vp_big_play_icon" viewBox="0 0 24 24" width="28" height="28" fill="currentColor">
            <polygon points="7 4.2 20 12 7 19.8" />
          </svg>
        </button>

        {/* Bottom Floating Glass Control Bar */}
        <div
          className={`vp_bar ${showControls || !isPlaying || isScrubbing ? "is-visible" : "is-hidden"}`}
          data-anm-vp-bar
          onClick={(e) => e.stopPropagation()}
        >
          <span className="vp_bar_bg" data-anm-vp-bar-bg aria-hidden="true" />
          <div className="vp_bar_inner" data-anm-vp-bar-inner>
            {/* Play/Pause Button */}
            <button
              type="button"
              className="vp_btn vp_btn--play"
              data-anm-vp-play
              onClick={togglePlay}
              aria-label={isPlaying ? "Pausar (Espai)" : "Reproduir (Espai)"}
              title={isPlaying ? "Pausar (Espai)" : "Reproduir (Espai)"}
            >
              {isPlaying ? (
                <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
                  <rect x="3.5" y="3" width="3" height="10" rx="1" />
                  <rect x="9.5" y="3" width="3" height="10" rx="1" />
                </svg>
              ) : (
                <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor" style={{ marginLeft: "1px" }}>
                  <path d="M4.5 2.8v10.4L13 8z" />
                </svg>
              )}
            </button>

            {/* Time Indicator */}
            <span className="vp_time">
              <span data-anm-vp-current>{formatTime(currentTime)}</span>
              <span className="vp_time_sep"> / </span>
              <span className="vp_time_total" data-anm-vp-duration>{formatTime(videoDuration)}</span>
            </span>

            {/* Scrubber Progress Slider */}
            <div
              ref={scrubBarRef}
              className="vp_slider vp_scrub"
              data-anm-vp-scrub
              role="slider"
              tabIndex={0}
              aria-label="Avançar / Retrocedir vídeo"
              aria-valuemin={0}
              aria-valuemax={videoDuration}
              aria-valuenow={currentTime}
              aria-valuetext={`${formatTime(currentTime)} de ${formatTime(videoDuration)}`}
              onMouseMove={handleScrubMouseMove}
              onMouseLeave={handleScrubMouseLeave}
              onMouseDown={handleScrubMouseDown}
            >
              <span className="vp_track" data-anm-vp-scrub-track>
                <span
                  className="vp_track_buffered"
                  style={{ width: `${Math.min(100, bufferPercent)}%` }}
                />
                <span
                  className="vp_track_fill"
                  style={{ width: `${progressPercent}%` }}
                />
              </span>

              {/* Scrubber Thumb */}
              <span
                className="vp_thumb_pos"
                style={{ left: `${progressPercent}%` }}
              >
                <span className="vp_thumb" data-anm-vp-scrub-thumb />
              </span>

              {/* Hover Tooltip */}
              {isHoveringScrub && (
                <span
                  className="vp_tip_pos"
                  style={{ left: `${hoverScrubPercent}%` }}
                >
                  <span className="vp_tip" data-anm-vp-tip>
                    {formatTime(hoverScrubTime)}
                  </span>
                </span>
              )}
            </div>

            {/* Volume Button */}
            <button
              type="button"
              className="vp_btn vp_mute"
              data-anm-vp-mute
              onClick={toggleMute}
              aria-label={isMuted || currentVolume === 0 ? "Activar so (M)" : "Silenciar (M)"}
              title={isMuted || currentVolume === 0 ? "Activar so (M)" : "Silenciar (M)"}
            >
              {isMuted || currentVolume === 0 ? (
                <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
                  <path d="M2.5 6h2.2L8 3.2v9.6L4.7 10H2.5z" />
                  <path d="M10.8 6.2l3 3.6M13.8 6.2l-3 3.6" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              ) : currentVolume < 0.5 ? (
                <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
                  <path d="M2.5 6h2.2L8 3.2v9.6L4.7 10H2.5z" />
                  <path d="M10.5 5.8a3.2 3.2 0 0 1 0 4.4" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              ) : (
                <svg viewBox="0 0 16 16" width="16" height="16" fill="currentColor">
                  <path d="M2.5 6h2.2L8 3.2v9.6L4.7 10H2.5z" />
                  <path d="M10.5 5.8a3.2 3.2 0 0 1 0 4.4M12.4 4a5.8 5.8 0 0 1 0 8" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" />
                </svg>
              )}
            </button>

            {/* Volume Mini Slider */}
            <div
              ref={volumeBarRef}
              className="vp_slider vp_volume"
              data-anm-vp-volume
              role="slider"
              tabIndex={0}
              aria-label="Volum d'àudio"
              aria-valuemin={0}
              aria-valuemax={100}
              aria-valuenow={Math.round(currentVolume * 100)}
              onClick={handleVolumeTrackClick}
            >
              <span className="vp_track" data-anm-vp-volume-track>
                <span
                  className="vp_track_fill"
                  style={{ width: `${currentVolume * 100}%` }}
                />
              </span>
              <span
                className="vp_thumb_pos"
                style={{ left: `${currentVolume * 100}%` }}
              >
                <span className="vp_thumb" data-anm-vp-volume-thumb />
              </span>
            </div>

            {/* Loop Toggle Button */}
            <button
              type="button"
              className={`vp_btn vp_btn--loop ${isLooping ? "is-active" : ""}`}
              data-anm-vp-loop
              onClick={toggleLoop}
              aria-label={isLooping ? "Desactivar bucle (L)" : "Activar bucle (L)"}
              title={isLooping ? "Desactivar bucle (L)" : "Activar bucle (L)"}
            >
              <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                <path d="M3 8.5V6.5a2 2 0 0 1 2-2h7.5M13 7.5v2a2 2 0 0 1-2 2H3.5" />
                <path d="M11 2.5l2 2-2 2M5 9.5l-2 2 2 2" />
                {isLooping && <circle cx="8" cy="8" r="1.4" fill="currentColor" />}
              </svg>
            </button>

            {/* Fullscreen / Fullwidth FLIP Button */}
            <button
              type="button"
              className="vp_btn vp_btn--fullscreen"
              data-anm-vp-fullscreen
              onClick={toggleFullscreen}
              aria-label={isFullscreen ? "Sortir de pantalla completa (F / Esc)" : "Pantalla completa (F)"}
              title={isFullscreen ? "Sortir de pantalla completa (F / Esc)" : "Pantalla completa (F)"}
            >
              {isFullscreen ? (
                <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M6 2.5V6H2.5M13.5 6H10V2.5M10 13.5V10h3.5M2.5 10H6v3.5" />
                </svg>
              ) : (
                <svg viewBox="0 0 16 16" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M2.5 6V2.5H6M10 2.5h3.5V6M13.5 10v3.5H10M6 13.5H2.5V10" />
                </svg>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
