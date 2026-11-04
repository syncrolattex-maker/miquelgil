'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import * as THREE from 'three';
import gsap from 'gsap';
import { AlbumDetail } from './albumData';
import './production.css';

interface ProductionClientProps {
  album: AlbumDetail;
}

export default function ProductionClient({ album }: ProductionClientProps) {
  // Estados para el Lightbox
  const [trailerOpen, setTrailerOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState('00:00');
  const [totalTime, setTotalTime] = useState('04:42');
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(55);

  // Refs de elementos
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const dissolveCanvasRef = useRef<HTMLCanvasElement>(null);
  const upNextCanvasContainerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const playerRef = useRef<any>(null);
  const timelineIntervalRef = useRef<any>(null);

  // Extraer ID de YouTube
  const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : 'yVT-HCsypyk';
  };

  const videoId = getYouTubeId(album.trailerSrc);

  // ============================================================================
  // 1. REPRODUCTOR TRAILER LIGHTBOX & DISSOLVE CANVAS
  // ============================================================================
  const openTrailer = useCallback(() => {
    setTrailerOpen(true);
    setIsPlaying(true);

    // Cargar YouTube Iframe API si no existe
    if (!(window as any).YT) {
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      document.body.appendChild(tag);
    }
  }, []);

  const closeTrailer = useCallback(() => {
    const canvas = dissolveCanvasRef.current;
    if (!canvas) {
      setTrailerOpen(false);
      return;
    }

    // Efecto procedural de disolución A24 con ruido sobre canvas 2D
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      setTrailerOpen(false);
      return;
    }

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const w = canvas.width;
    const h = canvas.height;

    let progressVal = 0;
    const duration = 850; // 0.85s según especificación
    const startTime = performance.now();

    const renderDissolve = (now: number) => {
      const elapsed = now - startTime;
      progressVal = Math.min(1, elapsed / duration);

      ctx.clearRect(0, 0, w, h);
      ctx.fillStyle = '#000000';

      // Dibujar cuadrícula orgánica de disolución descendente
      const cellSize = 16;
      const cols = Math.ceil(w / cellSize);
      const rows = Math.ceil(h / cellSize);

      for (let r = 0; r < rows; r++) {
        const rowProgress = r / rows;
        for (let c = 0; c < cols; c++) {
          const noise = Math.sin(c * 0.4 + progressVal * 6) * 0.2 + Math.cos(r * 0.3) * 0.2;
          const threshold = rowProgress + noise;
          if (threshold < progressVal * 1.3) {
            ctx.fillRect(c * cellSize, r * cellSize, cellSize, cellSize);
          }
        }
      }

      if (progressVal < 1) {
        requestAnimationFrame(renderDissolve);
      } else {
        ctx.clearRect(0, 0, w, h);
        setTrailerOpen(false);
        if (playerRef.current && typeof playerRef.current.pauseVideo === 'function') {
          playerRef.current.pauseVideo();
        }
      }
    };

    requestAnimationFrame(renderDissolve);
  }, []);

  // Control de teclado ESC para cerrar tráiler
  useEffect(() => {
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && trailerOpen) {
        closeTrailer();
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [trailerOpen, closeTrailer]);

  // ============================================================================
  // 2. ESCENA 3D "UP NEXT" (DISCO 3D CON EMPUJE / PUSH GESTURE)
  // ============================================================================
  useEffect(() => {
    const container = upNextCanvasContainerRef.current;
    if (!container) return;

    let animId: number;
    let pushProgress = 0;
    let isDisposed = false;

    // Configuración Three.js
    const width = container.clientWidth || 320;
    const height = container.clientHeight || 320;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(40, width / height, 0.1, 50);
    camera.position.set(0, 0, 3.8);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;
    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Luces
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 2.5);
    dirLight.position.set(3, 4, 4);
    scene.add(dirLight);

    const blueRim = new THREE.DirectionalLight(0x499ff5, 1.8);
    blueRim.position.set(-3, -2, -2);
    scene.add(blueRim);

    // Geometría y materiales del disco de la siguiente edición
    const discRadius = 1.0;
    const holeRadius = 0.14;
    const discGeometry = new THREE.RingGeometry(holeRadius, discRadius, 64, 8);

    // Generar textura serigrafiada para el disco siguiente
    const cv = document.createElement('canvas');
    cv.width = 1024;
    cv.height = 1024;
    const ctx = cv.getContext('2d')!;
    ctx.fillStyle = '#18181c';
    ctx.fillRect(0, 0, 1024, 1024);

    ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.arc(512, 512, 480, 0, Math.PI * 2);
    ctx.stroke();

    ctx.fillStyle = '#ffffff';
    ctx.font = '600 32px "PP Neue Montreal", sans-serif';
    ctx.textAlign = 'center';
    ctx.fillText(`${album.nextAlbum.title.toUpperCase()} · ${album.nextAlbum.year}`, 512, 940);
    ctx.font = '500 24px "PP Museum", serif';
    ctx.fillText('SEGÜENT EDICIÓ — ARXIU MIQUEL GIL', 512, 980);

    const texture = new THREE.CanvasTexture(cv);
    const discMaterial = new THREE.MeshStandardMaterial({
      map: texture,
      roughness: 0.35,
      metalness: 0.25,
      side: THREE.DoubleSide
    });

    const discMesh = new THREE.Mesh(discGeometry, discMaterial);
    discMesh.rotation.x = THREE.MathUtils.degToRad(-15);
    discMesh.rotation.y = THREE.MathUtils.degToRad(-25);
    scene.add(discMesh);

    // Anillo de brillo central (buje)
    const hubGeom = new THREE.RingGeometry(holeRadius, 0.25, 48);
    const hubMat = new THREE.MeshStandardMaterial({
      color: 0xcccccc,
      metalness: 0.9,
      roughness: 0.1,
      side: THREE.DoubleSide
    });
    const hubMesh = new THREE.Mesh(hubGeom, hubMat);
    hubMesh.position.z = 0.002;
    discMesh.add(hubMesh);

    // Control de empuje (Wheel & Touch push hacia el siguiente disco)
    const onWheel = (e: WheelEvent) => {
      const rect = container.getBoundingClientRect();
      const inView = rect.top < window.innerHeight && rect.bottom > 0;
      if (!inView) return;

      if (e.deltaY > 0) {
        pushProgress += 0.04;
        if (pushProgress >= 1) {
          pushProgress = 1;
          // Navegar a la siguiente edición
          window.location.href = `/discografia/${album.nextAlbum.slug}/`;
        }
      }
    };

    window.addEventListener('wheel', onWheel, { passive: true });

    // Loop de renderizado
    const animate = () => {
      if (isDisposed) return;
      animId = requestAnimationFrame(animate);

      // Desaceleración del push si no hay interacción continua
      pushProgress = Math.max(0, pushProgress - 0.005);

      // Rotación continua con impulso según push
      const spinSpeed = 0.004 + pushProgress * 0.05;
      discMesh.rotation.z -= spinSpeed;
      discMesh.scale.setScalar(1.0 + pushProgress * 0.1);

      renderer.render(scene, camera);
    };

    animate();

    return () => {
      isDisposed = true;
      cancelAnimationFrame(animId);
      window.removeEventListener('wheel', onWheel);
      discGeometry.dispose();
      discMaterial.dispose();
      hubGeom.dispose();
      hubMat.dispose();
      renderer.dispose();
    };
  }, [album.nextAlbum]);

  return (
    <div ref={containerRef} className="production-page" data-production-hero-init="true">
      {/* HEADER MINIMALISTA A24 */}
      <header className="fixed top-0 left-0 w-full z-40 flex items-center justify-between px-6 py-5 bg-white/80 backdrop-blur-md border-b border-black/5">
        <Link
          href="/discografia"
          className="a24-label flex items-center gap-2 hover:text-black transition-colors"
        >
          <span>←</span>
          <span>ARXIU / DISCOGRAFIA</span>
        </Link>
        <span className="a24-label tracking-widest font-medium">
          MIQUEL GIL — {album.editionNumber}
        </span>
        <div className="flex items-center gap-4">
          <span className="a24-label hidden sm:inline">{album.year}</span>
          <button
            onClick={openTrailer}
            className="a24-label px-3 py-1 border border-black/20 rounded hover:bg-black hover:text-white transition-colors"
          >
            VÍDEO
          </button>
        </div>
      </header>

      {/* ============================================================
          1. HERO SECTION ([data-production-hero])
         ============================================================ */}
      <section id="production_hero" className="production-hero">
        <div className="production-content">
          <div className="production__info">
            {/* Título en formato grande con PP Eiko */}
            <div className="production__title">
              <span className="subheading-xs block mb-2">{album.editionNumber}</span>
              <h1 className="heading-l">{album.title}</h1>
            </div>

            <div className="divider-horizontal my-4" />

            {/* Créditos de producción */}
            <div className="production__credits">
              <span className="subheading-xs">PRODUCCIÓ</span>
              <span className="paragraph-m font-medium">{album.director}</span>

              <span className="subheading-xs ml-4">SEGELL</span>
              <span className="paragraph-m font-medium">{album.label}</span>

              <span className="subheading-xs ml-4">LLETRES I POEMES</span>
              <span className="paragraph-m font-medium">{album.lyrics}</span>

              <span className="subheading-xs ml-4">MÚSICS</span>
              <span className="paragraph-m font-medium">{album.musicians}</span>
            </div>

            {/* Metadatos en cuadrícula tabular */}
            <div className="production__metadata">
              <div className="production-metadata__item">
                <div className="divider-horizontal" />
                <div className="metadata-item__content">
                  <span className="subheading-xs">ANY</span>
                  <span className="paragraph-m font-medium">{album.year}</span>
                </div>
              </div>

              <div className="production-metadata__item">
                <div className="divider-horizontal" />
                <div className="metadata-item__content">
                  <span className="subheading-xs">GÈNERE</span>
                  <span className="paragraph-m font-medium">{album.genre}</span>
                </div>
              </div>

              <div className="production-metadata__item">
                <div className="divider-horizontal" />
                <div className="metadata-item__content">
                  <span className="subheading-xs">DURADA</span>
                  <span className="paragraph-m font-medium">{album.runtime}</span>
                </div>
              </div>

              <div className="production-metadata__item">
                <div className="divider-horizontal" />
                <div className="metadata-item__content">
                  <span className="subheading-xs">FORMAT</span>
                  <span className="paragraph-m font-medium">{album.format}</span>
                </div>
              </div>
            </div>
          </div>

          {/* Botones CTA con cruces vectoriales A24 */}
          <div className="production__cta">
            <div className="plus is--tl">
              <div className="plus-stroke is--hor" />
              <div className="plus-stroke is--ver" />
            </div>
            <div className="plus is--tr">
              <div className="plus-stroke is--hor" />
              <div className="plus-stroke is--ver" />
            </div>
            <div className="plus is--bl">
              <div className="plus-stroke is--hor" />
              <div className="plus-stroke is--ver" />
            </div>
            <div className="plus is--br">
              <div className="plus-stroke is--hor" />
              <div className="plus-stroke is--ver" />
            </div>

            <a
              href={album.streamUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="btn"
            >
              <div className="btn__divider" />
              <span className="btn__p-mask">
                <span className="btn__p">ESCOLTAR EN STREAMING ↗</span>
              </span>
              <div className="btn__divider" />
            </a>

            <button type="button" onClick={openTrailer} className="btn">
              <div className="btn__divider" />
              <span className="btn__p-mask">
                <span className="btn__p">VEURE VÍDEO OFICIAL ▶</span>
              </span>
              <div className="btn__divider" />
            </button>
          </div>
        </div>
      </section>

      {/* ============================================================
          2. SECCIÓN TRAILER / TEASER (THEME DARK)
         ============================================================ */}
      <section className="trailer">
        <div className="trailer__vh">
          <img
            src={album.trailerStill}
            alt={album.title}
            className="trailer__bg"
          />
          <div className="trailer__content">
            <div className="trailer-content__row">
              <span className="subheading-xs text-white/60">FITXA AUDIOVISUAL</span>
              <p className="trailer-quote-text">“{album.quote}”</p>
              {album.quoteAuthor && (
                <span className="subheading-xs text-white/50">{album.quoteAuthor}</span>
              )}
            </div>

            <div className="divider-horizontal my-4" />

            <div className="trailer-content__row">
              <button
                type="button"
                onClick={openTrailer}
                className="btn"
                data-trailer-src={album.trailerSrc}
              >
                <div className="btn__divider" />
                <span className="btn__p-mask">
                  <span className="btn__p">REPRODUIR EN EL LIGHTBOX ▶</span>
                </span>
                <div className="btn__divider" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          3. SECCIÓN DESCRIPCIÓN Y TRACKLIST
         ============================================================ */}
      <section id="production_desc" className="production-description">
        <div className="description-content">
          {/* Sinopsis editorial */}
          <div className="description__synopsis">
            <span className="subheading-xs">SINOPSI I CONTEXT</span>
            <p className="paragraph-xl">{album.synopsis}</p>
          </div>

          {/* Tracklist & Reconocimientos */}
          <div className="description__awards">
            <span className="subheading-xs">LLISTAT DE PISTES ({album.tracklist.length} TEMES)</span>
            <div className="space-y-1">
              {album.tracklist.map((track) => (
                <div key={track.num} className="tracklist-item">
                  <span className="paragraph-m font-mono text-black/50 mr-4">{track.num}</span>
                  <span className="paragraph-m font-medium flex-1">{track.title}</span>
                  <span className="paragraph-m text-black/40 text-xs">{track.time}</span>
                </div>
              ))}
            </div>

            {album.awards && album.awards.length > 0 && (
              <div className="mt-8 pt-6 border-t border-black/10">
                <span className="subheading-xs block mb-4">RECONEIXEMENTS</span>
                <div className="space-y-3">
                  {album.awards.map((a, i) => (
                    <div key={i} className="flex justify-between items-baseline gap-4">
                      <span className="subheading-xs">{a.title}</span>
                      <span className="paragraph-m font-medium text-right">{a.value}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      </section>

      {/* ============================================================
          4. SECCIÓN UP NEXT (3D DISC & PUSH INTERACTION)
         ============================================================ */}
      <section className="scroll-to">
        <div className="scroll-to__vh">
          <span className="subheading-xs tracking-widest text-black/50">
            SEGÜENT PRODUCCIÓ AL CATÀLEG
          </span>

          <div
            ref={upNextCanvasContainerRef}
            className="scroll-to__canvas cursor-grab"
            title="Arrossega o fes roda per a passar a la següent producció"
          />

          <div className="scroll-to__label">
            <span className="subheading-xs block mb-1">UP NEXT</span>
            <h2 className="heading-l">{album.nextAlbum.title}</h2>
            <span className="subheading-xs block mt-2 text-black/60">
              {album.nextAlbum.year} · {album.nextAlbum.genre}
            </span>
          </div>

          <Link
            href={`/discografia/${album.nextAlbum.slug}/`}
            className="btn mt-6"
          >
            <div className="btn__divider" />
            <span className="btn__p-mask">
              <span className="btn__p">VEURE FITXA DE {album.nextAlbum.title.toUpperCase()} →</span>
            </span>
            <div className="btn__divider" />
          </Link>

          <p className="scroll-to__push-hint">
            RODA O ARROSSEGA CAP AMUNT PER A AVANÇAR
          </p>
        </div>
      </section>

      {/* ============================================================
          5. REPRODUCTOR LIGHTBOX DEL TRÁILER (A24 CINEMATIC LIGHTBOX)
         ============================================================ */}
      <div
        className="trailer-lightbox"
        data-trailer-status={trailerOpen ? 'open' : 'closed'}
        aria-hidden={!trailerOpen}
      >
        {/* Canvas de disolución procedural */}
        <canvas ref={dissolveCanvasRef} className="trailer-lightbox__canvas" />

        {/* Barra superior de controles */}
        <div className="trailer-lightbox__ui">
          <div className="trailer-lightbox__top">
            <div className="flex items-center gap-3">
              <span className="subheading-xs text-white/80">{album.title}</span>
              <span className="subheading-xs text-white/40">·</span>
              <span className="subheading-xs text-white/60">VÍDEO OFICIAL</span>
            </div>
            <button
              type="button"
              onClick={closeTrailer}
              className="trailer-lightbox__ctl"
            >
              TANCAR [ESC]
            </button>
          </div>

          {/* Barra inferior de controles */}
          <div className="trailer-lightbox__bottom">
            <button
              type="button"
              onClick={() => setIsPlaying(!isPlaying)}
              className="trailer-lightbox__ctl"
            >
              {isPlaying ? 'PAUSA' : 'REPRODUIR'}
            </button>

            <span className="trailer-lightbox__time">
              {currentTime} / {totalTime}
            </span>

            {/* Barra de progreso / Timeline */}
            <div className="trailer-lightbox__timeline">
              <div className="trailer-lightbox__timeline-rule" />
              <div
                className="trailer-lightbox__timeline-progress"
                style={{ width: `${progress}%` }}
              />
            </div>

            {/* Control de sonido y volumen */}
            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => setIsMuted(!isMuted)}
                className="trailer-lightbox__ctl"
              >
                {isMuted ? 'ACTIVAR SO' : 'SO'}
              </button>
              <div className="trailer-lightbox__volume hidden sm:flex">
                <div className="trailer-lightbox__volume-rule" />
                <div
                  className="trailer-lightbox__volume-level"
                  style={{ width: isMuted ? '0%' : `${volume}%` }}
                />
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                if (!document.fullscreenElement) {
                  document.documentElement.requestFullscreen?.();
                } else {
                  document.exitFullscreen?.();
                }
              }}
              className="trailer-lightbox__ctl hidden md:inline-block"
            >
              PANTALLA COMPLETA
            </button>
          </div>
        </div>

        {/* Escenario del reproductor */}
        <div className="trailer-lightbox__stage">
          <div className="trailer-lightbox__player">
            {trailerOpen && (
              <iframe
                ref={iframeRef}
                src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&controls=0&rel=0&modestbranding=1&playsinline=1&enablejsapi=1`}
                title={`${album.title} — Trailer`}
                allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                allowFullScreen
              />
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
