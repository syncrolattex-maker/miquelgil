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
  const heroRef = useRef<HTMLElement>(null);
  const trailerRef = useRef<HTMLElement>(null);
  const svgStrokeRef = useRef<SVGPathElement>(null);
  const svgGlowRef = useRef<SVGPathElement>(null);
  const dissolveCanvasRef = useRef<HTMLCanvasElement>(null);
  const upNextCanvasContainerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const playerRef = useRef<any>(null);

  // Extraer ID de YouTube
  const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : 'yVT-HCsypyk';
  };

  const videoId = getYouTubeId(album.trailerSrc);

  // ============================================================================
  // 1. ANIMACIÓN DE ENTRADA DE BOTONES (GSAP SEGÚN ESPECIFICACIÓN A24)
  // ============================================================================
  useEffect(() => {
    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const buttons = containerRef.current?.querySelectorAll<HTMLElement>('[data-reveal="btn"]');
    if (!buttons || !buttons.length) return;

    if (prefersReducedMotion) {
      buttons.forEach((btn) => {
        const dividers = btn.querySelectorAll<HTMLElement>('.btn__divider');
        const text = btn.querySelector<HTMLElement>('.btn__p');
        gsap.set(dividers, { scaleX: 1 });
        if (text) gsap.set(text, { yPercent: 0 });
      });
      return;
    }

    const ctaStart = 0.48; // ctaStart 0.38 + 0.1
    const btnStagger = 0.09;
    const duration = 0.7;
    const textDelay = 0.04;
    const easeCurve = 'power3.out';

    buttons.forEach((btn, idx) => {
      const startTime = ctaStart + idx * btnStagger;
      const dividers = btn.querySelectorAll<HTMLElement>('.btn__divider');
      const text = btn.querySelector<HTMLElement>('.btn__p');

      // Estado inicial
      gsap.set(dividers, { scaleX: 0, transformOrigin: 'left center' });
      if (text) gsap.set(text, { yPercent: 120 });

      // Crecimiento de las líneas
      gsap.to(dividers, {
        scaleX: 1,
        duration: duration,
        ease: easeCurve,
        delay: startTime,
        overwrite: 'auto'
      });

      // Subida del texto con 0.04s de retraso
      if (text) {
        gsap.to(text, {
          yPercent: 0,
          duration: duration,
          ease: easeCurve,
          delay: startTime + textDelay,
          overwrite: 'auto'
        });
      }
    });
  }, []);

  // ============================================================================
  // 2. SEPARADOR LÍQUID DINÀMIC AMB SIMULACIÓ FÍSICA I RESPOSTA AL CURSOR
  // ============================================================================
  useEffect(() => {
    const trailer = trailerRef.current;
    if (!trailer) return;

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    const supportsClipPath =
      typeof CSS !== 'undefined' &&
      typeof CSS.supports === 'function' &&
      CSS.supports('clip-path', 'path("M 0 0 L 1 0 Z")');

    if (prefersReducedMotion) return;

    let animId: number;
    let isDisposed = false;

    // Número de nodes per a la simulació de malla líquida (Wave Equation)
    const N = 85;
    const yOffsets = new Float32Array(N);
    const velocities = new Float32Array(N);

    // Paràmetres físics del fluid
    const springK = 0.038;  // Rigidesa de tensió superficial
    const damping = 0.042;  // Viscositat del medi
    const spread = 0.24;    // Propagació d'ona horitzontal

    let H = 0;
    let lastTime = performance.now();
    let lastScrollY = window.scrollY;
    let scrollVelocity = 0;

    // Seguiment de posició i velocitat del cursor
    let lastPointerX = -1000;
    let lastPointerY = -1000;
    let lastPointerTime = performance.now();

    const handlePointerMove = (e: PointerEvent) => {
      if (isDisposed || !trailer) return;
      const rect = trailer.getBoundingClientRect();
      const W = trailer.offsetWidth;
      const baseY = 85;
      const liquidLineY = rect.top + baseY;
      const distY = e.clientY - liquidLineY;

      // S'activa en una franja àmplia de ±180px al voltant de la línia líquida
      if (Math.abs(distY) < 180) {
        const now = performance.now();
        const dt = Math.max(0.001, (now - lastPointerTime) / 1000);
        lastPointerTime = now;

        const vx = (e.clientX - lastPointerX) / dt;
        const vy = (e.clientY - lastPointerY) / dt;
        lastPointerX = e.clientX;
        lastPointerY = e.clientY;

        const speed = Math.sqrt(vx * vx + vy * vy);

        // Índex del node sota el cursor
        const u = Math.max(0, Math.min(1, (e.clientX - rect.left) / W));
        const k = Math.round(u * (N - 1));

        // Impuls hidrodinàmic en funció de la velocitat del cursor
        const impulse = Math.max(
          -55,
          Math.min(55, vy * 0.045 + (distY < 0 ? -1 : 1) * Math.min(35, speed * 0.03))
        );

        // Dispersió de l'onada amb campana gaussiana a través dels veïns
        const radius = 8;
        for (let j = Math.max(0, k - radius); j <= Math.min(N - 1, k + radius); j++) {
          const dist = Math.abs(j - k);
          const weight = Math.exp(-(dist * dist) / 12);
          velocities[j] += impulse * weight;
        }

        // Estirament viscós directe sota el cursor
        const suction = Math.max(-30, Math.min(30, -distY * 0.35));
        yOffsets[k] += (suction - yOffsets[k]) * 0.25;
      }
    };

    const handlePointerDown = (e: PointerEvent) => {
      if (isDisposed || !trailer) return;
      const rect = trailer.getBoundingClientRect();
      const W = trailer.offsetWidth;
      const baseY = 85;
      const liquidLineY = rect.top + baseY;
      const distY = e.clientY - liquidLineY;

      if (Math.abs(distY) < 200) {
        const u = Math.max(0, Math.min(1, (e.clientX - rect.left) / W));
        const k = Math.round(u * (N - 1));
        const radius = 12;
        for (let j = Math.max(0, k - radius); j <= Math.min(N - 1, k + radius); j++) {
          const dist = Math.abs(j - k);
          const weight = Math.exp(-(dist * dist) / 16);
          velocities[j] += 48 * weight;
        }
      }
    };

    window.addEventListener('pointermove', handlePointerMove, { passive: true });
    window.addEventListener('pointerdown', handlePointerDown, { passive: true });

    const updateLiquidWave = (now: number) => {
      if (isDisposed) return;
      animId = requestAnimationFrame(updateLiquidWave);

      const dt = Math.min(0.05, (now - lastTime) / 1000);
      lastTime = now;

      // Velocitat de scroll
      const currentScrollY = window.scrollY;
      const scrollDiff = currentScrollY - lastScrollY;
      scrollVelocity = scrollDiff / (dt * 1000);
      lastScrollY = currentScrollY;

      const trailerRect = trailer.getBoundingClientRect();
      const W = trailer.offsetWidth;
      const H_total = trailer.offsetHeight;

      // Si està fora de visió, pausar el renderitzat intensiu
      if (trailerRect.bottom < -100 || trailerRect.top > window.innerHeight + 150) return;

      // 1. Equació d'ones mecàniques (molles acoblades)
      for (let i = 0; i < N; i++) {
        const force = -springK * yOffsets[i] - damping * velocities[i];
        velocities[i] += force;
        yOffsets[i] += velocities[i];
      }

      // Propagació de la tensió superficial entre nodes adjacents
      for (let pass = 0; pass < 5; pass++) {
        for (let i = 0; i < N; i++) {
          if (i > 0) {
            const dL = spread * (yOffsets[i] - yOffsets[i - 1]);
            yOffsets[i - 1] += dL;
            velocities[i - 1] += dL * 0.25;
          }
          if (i < N - 1) {
            const dR = spread * (yOffsets[i] - yOffsets[i + 1]);
            yOffsets[i + 1] += dR;
            velocities[i + 1] += dR * 0.25;
          }
        }
      }

      // 2. Respiració orgànica contínua de fluid
      const agitate = 1 + Math.min(2.5, Math.abs(scrollVelocity) * 0.002);
      H += dt * 0.25 * Math.PI * 2 * agitate;

      const baseY = 85;
      const surge = Math.min(25, Math.abs(scrollVelocity) * 0.035);

      const points: Array<[number, number]> = [];

      for (let i = 0; i < N; i++) {
        const u = i / (N - 1);
        const x = u * W;

        // Modulació suau als extrems
        const edgeEnvelope = Math.sin(u * Math.PI);
        const centerBell = 0.85 + 0.15 * Math.sin(u * Math.PI);

        // Harmònics de fluid orgànic
        const w1 = Math.sin(u * 9 + H) * 0.55;
        const w2 = Math.cos(u * 21 - H * 1.3) * 0.35;
        const w3 = Math.sin(u * 5 + H * 0.65) * 0.25;
        const organicNoise = (w1 + w2 + w3) * (14 + surge) * centerBell;

        // Desplaçament total: baseline + resposta interactiva al cursor + harmònics orgànics
        const totalY = Math.max(
          10,
          baseY + yOffsets[i] * (0.3 + 0.7 * edgeEnvelope) + organicNoise * (0.3 + 0.7 * edgeEnvelope)
        );
        points.push([x, totalY]);
      }

      // 3. Traçat suau en corba de Bézier (clip-path i menisc lluminós SVG)
      let pathStr = `M 0 ${points[0][1].toFixed(1)}`;
      let crestStr = `M 0 ${points[0][1].toFixed(1)}`;

      for (let i = 0; i < points.length - 1; i++) {
        const p0 = points[i];
        const p1 = points[i + 1];
        const midX = (p0[0] + p1[0]) / 2;
        const midY = (p0[1] + p1[1]) / 2;
        const segment = ` Q ${p0[0].toFixed(1)} ${p0[1].toFixed(1)} ${midX.toFixed(1)} ${midY.toFixed(1)}`;
        pathStr += segment;
        crestStr += segment;
      }

      const lastP = points[points.length - 1];
      pathStr += ` L ${W} ${lastP[1].toFixed(1)} L ${W} ${H_total} L 0 ${H_total} Z`;
      crestStr += ` L ${W} ${lastP[1].toFixed(1)}`;

      if (supportsClipPath) {
        trailer.style.clipPath = `path("${pathStr}")`;
      }

      if (svgStrokeRef.current) {
        svgStrokeRef.current.setAttribute('d', crestStr);
      }
      if (svgGlowRef.current) {
        svgGlowRef.current.setAttribute('d', crestStr);
      }
    };

    animId = requestAnimationFrame(updateLiquidWave);

    return () => {
      isDisposed = true;
      cancelAnimationFrame(animId);
      window.removeEventListener('pointermove', handlePointerMove);
      window.removeEventListener('pointerdown', handlePointerDown);
      if (trailer) trailer.style.clipPath = '';
    };
  }, []);

  // ============================================================================
  // 3. REPRODUCTOR TRAILER LIGHTBOX & DISSOLVE CANVAS
  // ============================================================================
  const openTrailer = useCallback(() => {
    setTrailerOpen(true);
    setIsPlaying(true);

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
  // 4. ESCENA 3D "UP NEXT" (DISCO 3D CON EMPUJE / PUSH GESTURE)
  // ============================================================================
  useEffect(() => {
    const container = upNextCanvasContainerRef.current;
    if (!container) return;

    let animId: number;
    let pushProgress = 0;
    let isDisposed = false;

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

    const ambientLight = new THREE.AmbientLight(0xffffff, 0.8);
    scene.add(ambientLight);

    const dirLight = new THREE.DirectionalLight(0xffffff, 2.5);
    dirLight.position.set(3, 4, 4);
    scene.add(dirLight);

    const blueRim = new THREE.DirectionalLight(0x499ff5, 1.8);
    blueRim.position.set(-3, -2, -2);
    scene.add(blueRim);

    const discRadius = 1.0;
    const holeRadius = 0.14;
    const discGeometry = new THREE.RingGeometry(holeRadius, discRadius, 64, 8);

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

    const onWheel = (e: WheelEvent) => {
      const rect = container.getBoundingClientRect();
      const inView = rect.top < window.innerHeight && rect.bottom > 0;
      if (!inView) return;

      if (e.deltaY > 0) {
        pushProgress += 0.04;
        if (pushProgress >= 1) {
          pushProgress = 1;
          window.location.href = `/discografia/${album.nextAlbum.slug}/`;
        }
      }
    };

    window.addEventListener('wheel', onWheel, { passive: true });

    const animate = () => {
      if (isDisposed) return;
      animId = requestAnimationFrame(animate);

      pushProgress = Math.max(0, pushProgress - 0.005);
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
            className="a24-label px-3 py-1 border border-black/30 hover:border-black text-black/80 hover:text-black bg-transparent transition-colors"
          >
            VÍDEO
          </button>
        </div>
      </header>

      {/* ============================================================
          1. HERO SECTION (ZONA BLANCA CON BOTONES 100% LIMPIOS)
         ============================================================ */}
      <div data-dissolve-track="" className="reveal-track">
        <section id="production_hero" ref={heroRef} className="production-hero">
          <div className="production-content">
            <div className="production__info">
              {/* TÍTULO EN MAYÚSCULAS CON PP EIKO */}
              <div className="production__title">
                <span className="subheading-xs block mb-2">{album.editionNumber}</span>
                <h1 className="heading-l">{album.title.toUpperCase()}</h1>
              </div>

              {/* LÍNEA SEPARADORA FULLWIDTH */}
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

              {/* LÍNEA SEPARADORA FULLWIDTH */}
              <div className="divider-horizontal my-4" />

              {/* Metadatos en cuadrícula tabular */}
              <div className="production__metadata">
                <div className="production-metadata__item">
                  <div className="metadata-item__content">
                    <span className="subheading-xs">ANY</span>
                    <span className="paragraph-m font-medium">{album.year}</span>
                  </div>
                </div>

                <div className="production-metadata__item">
                  <div className="metadata-item__content">
                    <span className="subheading-xs">GÈNERE</span>
                    <span className="paragraph-m font-medium">{album.genre}</span>
                  </div>
                </div>

                <div className="production-metadata__item">
                  <div className="metadata-item__content">
                    <span className="subheading-xs">DURADA</span>
                    <span className="paragraph-m font-medium">{album.runtime}</span>
                  </div>
                </div>

                <div className="production-metadata__item">
                  <div className="metadata-item__content">
                    <span className="subheading-xs">FORMAT</span>
                    <span className="paragraph-m font-medium">{album.format}</span>
                  </div>
                </div>
              </div>
            </div>

            {/* ============================================================
                CONTENEDOR FULLWIDTH PARA BOTONES Y CRUCES VECTORIALES
               ============================================================ */}
            <div className="production__cta-wrap">
              {/* LÍNEA FULLWIDTH SUPERIOR DE BOTONES */}
              <div className="divider-horizontal absolute top-0" />

              {/* Cruces vectoriales a los extremos de la pantalla */}
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

              <div className="production__cta">
                {/* BOTÓN 1: ESCOLTAR EN STREAMING */}
                <a
                  data-reveal="btn"
                  data-hover=""
                  href={album.streamUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="btn a24-btn"
                >
                  <div className="btn__divider" />
                  <span className="btn__p-mask">
                    <span
                      className="btn__p"
                      data-hover-inner
                      data-text="ESCOLTAR EN STREAMING ↗"
                    >
                      <span data-hover-text>ESCOLTAR EN STREAMING ↗</span>
                    </span>
                  </span>
                  <div className="btn__divider" />
                </a>

                {/* BOTÓN 2: VEURE VÍDEO OFICIAL */}
                <button
                  type="button"
                  data-reveal="btn"
                  data-hover=""
                  onClick={openTrailer}
                  className="btn a24-btn"
                >
                  <div className="btn__divider" />
                  <span className="btn__p-mask">
                    <span
                      className="btn__p"
                      data-hover-inner
                      data-text="VEURE VÍDEO OFICIAL ▶"
                    >
                      <span data-hover-text>VEURE VÍDEO OFICIAL ▶</span>
                    </span>
                  </span>
                  <div className="btn__divider" />
                </button>
              </div>

              {/* LÍNEA FULLWIDTH INFERIOR DE BOTONES */}
              <div className="divider-horizontal absolute bottom-0" />
            </div>
          </div>
        </section>

        {/* ============================================================
            2. FITXA AUDIOVISUAL: LA OLA LÍQUIDA ACTÚA SOBRE LA FOTO DE ABAJO
               JUGANDO EN LA TRANSICIÓN ENTRE LOS BOTONES Y LA IMAGEN
           ============================================================ */}
        <section ref={trailerRef} data-theme-change="nav:base" className="trailer theme-dark">
          {/* LÍNIA DE MENISC LÍQUID (ONDA INTERACTIVA AMB CURSOR) */}
          <svg className="trailer-liquid-svg" aria-hidden="true">
            <path ref={svgGlowRef} className="liquid-glow" />
            <path ref={svgStrokeRef} className="liquid-crest" />
          </svg>

          <div data-dissolve-bleed="" className="trailer__vh">
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
                  className="btn a24-btn"
                  data-hover=""
                  data-trailer-src={album.trailerSrc}
                >
                  <div className="btn__divider" />
                  <span className="btn__p-mask">
                    <span
                      className="btn__p text-white"
                      data-hover-inner
                      data-text="REPRODUIR EN EL LIGHTBOX ▶"
                    >
                      <span data-hover-text>REPRODUIR EN EL LIGHTBOX ▶</span>
                    </span>
                  </span>
                  <div className="btn__divider" />
                </button>
              </div>
            </div>
          </div>
        </section>
      </div>

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
            <h2 className="heading-l">{album.nextAlbum.title.toUpperCase()}</h2>
            <span className="subheading-xs block mt-2 text-black/60">
              {album.nextAlbum.year} · {album.nextAlbum.genre}
            </span>
          </div>

          <Link
            href={`/discografia/${album.nextAlbum.slug}/`}
            className="btn a24-btn mt-6"
            data-hover=""
          >
            <div className="btn__divider" />
            <span className="btn__p-mask">
              <span
                className="btn__p"
                data-hover-inner
                data-text={`VEURE FITXA DE ${album.nextAlbum.title.toUpperCase()} →`}
              >
                <span data-hover-text>{`VEURE FITXA DE ${album.nextAlbum.title.toUpperCase()} →`}</span>
              </span>
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
              <span className="subheading-xs text-white/80">{album.title.toUpperCase()}</span>
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
