'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import * as THREE from 'three';
import gsap from 'gsap';
import AnnnimateVideoPlayer from '@/components/AnnnimateVideoPlayer';
import { AlbumDetail } from './albumData';
import { initDissolve } from './dissolveEngine';
import './production.css';

interface ProductionClientProps {
  album: AlbumDetail;
}

export default function ProductionClient({ album }: ProductionClientProps) {
  // Estados para el Modal de Vídeo y Lightbox Cinemático
  const [trailerOpen, setTrailerOpen] = useState(false);
  const [isPlaying, setIsPlaying] = useState(true);
  const [isMuted, setIsMuted] = useState(false);
  const [currentTime, setCurrentTime] = useState('00:00');
  const [totalTime, setTotalTime] = useState('04:42');
  const [progress, setProgress] = useState(0);
  const [volume, setVolume] = useState(65);

  // Format seconds to MM:SS
  const formatSeconds = (totalSec: number) => {
    if (isNaN(totalSec) || totalSec < 0) return '00:00';
    const m = Math.floor(totalSec / 60);
    const s = Math.floor(totalSec % 60);
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  // Extraer ID de YouTube
  const getYouTubeId = (url: string) => {
    const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|&v=)([^#&?]*).*/;
    const match = url.match(regExp);
    return match && match[2].length === 11 ? match[2] : 'yVT-HCsypyk';
  };

  const videoId = getYouTubeId(album.trailerSrc);

  // Refs de elementos
  const containerRef = useRef<HTMLDivElement>(null);
  const heroRef = useRef<HTMLElement>(null);
  const trailerRef = useRef<HTMLElement>(null);
  const dissolveCanvasRef = useRef<HTMLCanvasElement>(null);
  const scrollNextRef = useRef<HTMLElement>(null);
  const upNextCanvasContainerRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const playerRef = useRef<any>(null);
  const expandBoxRef = useRef<HTMLDivElement>(null);
  const isScrubbingRef = useRef<boolean>(false);

  const [pushProgress, setPushProgress] = useState(0);

  // ============================================================================
  // YOUTUBE IFRAME API CONTROLS INTEGRATION
  // ============================================================================
  useEffect(() => {
    if (!trailerOpen) {
      if (playerRef.current) {
        try {
          playerRef.current.destroy();
        } catch (e) {
          // ignore
        }
        playerRef.current = null;
      }
      return;
    }

    let intervalId: NodeJS.Timeout | null = null;

    const initPlayer = () => {
      const YT = (window as any).YT;
      if (!YT || !YT.Player) return;

      playerRef.current = new YT.Player('yt-trailer-player', {
        events: {
          onReady: (event: any) => {
            try {
              event.target.playVideo();
              setIsPlaying(true);
              const dur = event.target.getDuration();
              if (dur && dur > 0) {
                setTotalTime(formatSeconds(dur));
              }
              if (isMuted) {
                event.target.mute();
              } else {
                event.target.unMute();
                event.target.setVolume(volume);
              }
            } catch (err) {
              console.warn('YT onReady error:', err);
            }
          },
          onStateChange: (event: any) => {
            // YT.PlayerState: 1 = PLAYING, 2 = PAUSED, 0 = ENDED
            if (event.data === 1) {
              setIsPlaying(true);
            } else if (event.data === 2) {
              setIsPlaying(false);
            } else if (event.data === 0) {
              setIsPlaying(false);
              setProgress(100);
            }
          }
        }
      });

      // Poll current time and sync with custom controls
      intervalId = setInterval(() => {
        if (!playerRef.current || isScrubbingRef.current) return;
        try {
          if (typeof playerRef.current.getCurrentTime === 'function' && typeof playerRef.current.getDuration === 'function') {
            const cur = playerRef.current.getCurrentTime() || 0;
            const dur = playerRef.current.getDuration() || 0;
            if (dur > 0) {
              setCurrentTime(formatSeconds(cur));
              setTotalTime(formatSeconds(dur));
              setProgress((cur / dur) * 100);
            }
          }
        } catch (e) {
          // player might be unmounting
        }
      }, 250);
    };

    if ((window as any).YT && (window as any).YT.Player) {
      // Small timeout to allow DOM element to render
      const timer = setTimeout(initPlayer, 100);
      return () => {
        clearTimeout(timer);
        if (intervalId) clearInterval(intervalId);
      };
    } else {
      (window as any).onYouTubeIframeAPIReady = () => {
        initPlayer();
      };
    }

    return () => {
      if (intervalId) clearInterval(intervalId);
    };
  }, [trailerOpen, volume, isMuted]);

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
  // 2. SEPARADOR LÍQUIDO A24 (DATA-DISSOLVE ENGINE: MARCHING SQUARES + CURSOR)
  // ============================================================================
  useEffect(() => {
    if (!containerRef.current) return;
    const cleanup = initDissolve(containerRef.current);
    return () => {
      cleanup?.();
    };
  }, []);

  // ============================================================================
  // 3. REPRODUCTOR TRAILER LIGHTBOX & ANIMACIÓN LÍQUIDA DE CIERRE
  // ============================================================================
  const openTrailer = useCallback((e?: React.MouseEvent) => {
    // Si se pulsa desde un botón, animar cuadro negro expandiéndose desde el botón hacia pantalla completa
    let sourceRect: DOMRect | null = null;
    if (e?.currentTarget) {
      sourceRect = (e.currentTarget as HTMLElement).getBoundingClientRect();
    }

    const box = expandBoxRef.current;
    if (box && sourceRect) {
      gsap.set(box, {
        display: 'block',
        position: 'fixed',
        left: sourceRect.left,
        top: sourceRect.top,
        width: sourceRect.width,
        height: sourceRect.height,
        borderRadius: 0,
        backgroundColor: '#000000',
        zIndex: 9999,
        opacity: 1
      });

      gsap.to(box, {
        left: 0,
        top: 0,
        width: '100vw',
        height: '100vh',
        duration: 0.65,
        ease: 'power3.inOut',
        onComplete: () => {
          setTrailerOpen(true);
          setIsPlaying(true);
          gsap.to(box, { opacity: 0, duration: 0.2, onComplete: () => {
            box.style.display = 'none';
          }});
        }
      });
    } else {
      setTrailerOpen(true);
      setIsPlaying(true);
    }

    if (typeof window !== 'undefined' && !(window as any).YT) {
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
    const duration = 850; // 0.85s curva de disolución líquida A24
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
  // 4. ESCENA 3D "UP NEXT" (DISCO 3D SEGÚN ESPECIFICACIÓN A24 CON PUSH INTERACTION)
  // ============================================================================
  useEffect(() => {
    const container = upNextCanvasContainerRef.current;
    const section = scrollNextRef.current;
    if (!container || !section) return;

    let animId: number;
    let isDisposed = false;
    let isLeaving = false;

    // Métricas del viewport y canvas
    let width = container.clientWidth || window.innerWidth;
    let height = container.clientHeight || window.innerHeight;

    // Configuración Three.js
    const scene = new THREE.Scene();
    const cameraFOV = 40;
    const cameraDistance = 4.4;
    const camera = new THREE.PerspectiveCamera(cameraFOV, width / height, 0.1, 100);
    camera.position.set(0, 0, cameraDistance);

    const renderer = new THREE.WebGLRenderer({
      alpha: true,
      antialias: true,
      powerPreference: 'high-performance'
    });
    renderer.setSize(width, height);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 0.86;
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.setClearColor(0x000000, 0);

    container.innerHTML = '';
    container.appendChild(renderer.domElement);

    // Jerarquía de grupos A24:
    // rootGroup -> maneja posición, inclinaciones generales (arrive, rest, push) y escala
    // wobbleGroup -> maneja balanceo orgánico / idle float
    // spinGroup -> maneja giro del disco en el eje Z
    const rootGroup = new THREE.Group();
    const wobbleGroup = new THREE.Group();
    const spinGroup = new THREE.Group();

    rootGroup.add(wobbleGroup);
    wobbleGroup.add(spinGroup);
    scene.add(rootGroup);

    // Iluminación cinemática A24
    const ambientLight = new THREE.AmbientLight(0xffffff, 0.35);
    scene.add(ambientLight);

    const keyLight = new THREE.DirectionalLight(0xfff9e8, 0.9);
    keyLight.position.set(3.5, 5, 6);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xffffff, 0.35);
    fillLight.position.set(-5, -2, 4);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0x499ff5, 0.85);
    rimLight.position.set(0, 3, -6);
    scene.add(rimLight);

    const topLight = new THREE.DirectionalLight(0xffffff, 1.4);
    topLight.position.set(0, 3.2, 3);
    scene.add(topLight);

    // Geometría y materiales del disco óptico CD
    const holeRadius = 0.14;
    const hubRadius = 0.24;
    const discRadius = 0.985;

    // 1. Cara frontal con artwork del siguiente álbum
    const frontGeom = new THREE.RingGeometry(hubRadius, discRadius, 128, 8);
    const pos = frontGeom.attributes.position;
    const uvs = frontGeom.attributes.uv;
    for (let i = 0; i < pos.count; i++) {
      uvs.setXY(i, (pos.getX(i) + 1) * 0.5, (pos.getY(i) + 1) * 0.5);
    }
    uvs.needsUpdate = true;

    const textureLoader = new THREE.TextureLoader();
    const discTexture = textureLoader.load(album.nextAlbum.discArtUrl);
    discTexture.colorSpace = THREE.SRGBColorSpace;
    discTexture.anisotropy = renderer.capabilities.getMaxAnisotropy();

    const frontMaterial = new THREE.MeshPhysicalMaterial({
      map: discTexture,
      roughness: 0.38,
      metalness: 0.42,
      clearcoat: 0.8,
      clearcoatRoughness: 0.08,
      side: THREE.FrontSide
    });
    const frontMesh = new THREE.Mesh(frontGeom, frontMaterial);
    spinGroup.add(frontMesh);

    // 2. Cara trasera oscura con iridiscencia metálica
    const backGeom = new THREE.RingGeometry(hubRadius, discRadius, 128, 8);
    const backMaterial = new THREE.MeshPhysicalMaterial({
      color: 0x1a1e2a,
      roughness: 0.25,
      metalness: 0.85,
      clearcoat: 0.4,
      side: THREE.BackSide
    });
    const backMesh = new THREE.Mesh(backGeom, backMaterial);
    spinGroup.add(backMesh);

    // 3. Borde perimetral exterior
    const edgeGeom = new THREE.CylinderGeometry(discRadius + 0.005, discRadius + 0.005, 0.012, 128, 1, true);
    edgeGeom.rotateX(Math.PI / 2);
    const edgeMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      roughness: 0.05,
      metalness: 0.55,
      clearcoat: 0.7,
      side: THREE.DoubleSide
    });
    const edgeMesh = new THREE.Mesh(edgeGeom, edgeMaterial);
    spinGroup.add(edgeMesh);

    // 4. Hub central acrílico transparente
    const hubGeom = new THREE.RingGeometry(holeRadius, hubRadius, 64, 2);
    const hubMaterial = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      roughness: 0.25,
      metalness: 0.05,
      transmission: 0.75,
      thickness: 0.5,
      ior: 1.5,
      transparent: true,
      side: THREE.DoubleSide
    });
    const hubMesh = new THREE.Mesh(hubGeom, hubMaterial);
    spinGroup.add(hubMesh);

    // Variables de estado físico y animación
    let ht = 0.01;
    let pt = 1.0;
    let mt = 0;
    let Ce = 0; // Scroll progress (0 a 1)
    let pushProgressTarget = 0;
    let smoothedPush = 0;
    let lastPushActionTime = 0;
    let wheelArmedTime = 0;
    let lastWheelTime = 0;
    let isWheelArmed = false;
    let idleTimer = 0;
    let currentSpinZ = 0;
    let hasPoppedIn = false;
    const revealedRules: boolean[] = [false, false, false, false, false];

    const popScaleState = { value: 0.35 };
    const exitPhysics = { spin: 0, lift: 0 };

    // Cálculo de dimensiones y escala en unidades de mundo
    const updateDimensions = () => {
      width = container.clientWidth || window.innerWidth;
      height = container.clientHeight || window.innerHeight;
      renderer.setSize(width, height);
      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      camera.aspect = width / height;
      camera.updateProjectionMatrix();

      // Conversión de píxeles a unidades Three.js
      ht = (2 * cameraDistance * Math.tan(THREE.MathUtils.degToRad(cameraFOV) / 2)) / height;
      pt = (Math.min(1.2 * height, 1.3 * width) * ht) / 2;

      // Alineación con la 4ª línea separadora horizontal (.divider-horizontal)
      const rows = section.querySelectorAll<HTMLElement>('.scroll-to__row > .divider-horizontal');
      if (rows.length >= 4) {
        const sRect = section.getBoundingClientRect();
        const rTop = rows[3].getBoundingClientRect().top - sRect.top;
        const restTiltRad = THREE.MathUtils.degToRad(-30);
        const topOffset = pt * Math.cos(restTiltRad);
        mt = -(rTop - height / 2) * ht - topOffset;
      } else {
        mt = -pt * 0.15;
      }
    };

    updateDimensions();

    // Helper para compensación horizontal de perspectiva en rotación (vt)
    const centerMatrix = new THREE.Matrix4();
    const getCenterComp = (euler: THREE.Euler) => {
      centerMatrix.makeRotationFromEuler(euler);
      const el = centerMatrix.elements;
      const ang = Math.atan2(el[5], el[1]);
      return Math.cos(ang) * el[0] + Math.sin(ang) * el[4];
    };

    // Comprobación de cursor dentro del disco con polígono 3D proyectado de 48 puntos
    const checkDiscHover = (clientX: number, clientY: number) => {
      if (!container || !camera || !wobbleGroup) return false;
      const rect = container.getBoundingClientRect();
      const ndcX = ((clientX - rect.left) / rect.width) * 2 - 1;
      const ndcY = 1 - ((clientY - rect.top) / rect.height) * 2;

      const vec = new THREE.Vector3();
      const poly: [number, number][] = [];
      for (let i = 0; i < 48; i++) {
        const theta = (i / 48) * Math.PI * 2;
        vec.set(Math.cos(theta), Math.sin(theta), 0);
        vec.applyMatrix4(wobbleGroup.matrixWorld);
        vec.project(camera);
        poly.push([vec.x, vec.y]);
      }

      let inside = false;
      for (let i = 0, j = 47; i < 48; j = i++) {
        const [xi, yi] = poly[i];
        const [xj, yj] = poly[j];
        if (yi > ndcY !== yj > ndcY && ndcX < ((xj - xi) * (ndcY - yi)) / (yj - yi) + xi) {
          inside = !inside;
        }
      }
      return inside;
    };

    // Secuencia de salida (Exit timeline: al llegar a push 1.0 o hacer clic en el disco)
    const triggerExit = () => {
      if (isLeaving) return;
      isLeaving = true;
      pushProgressTarget = 1;
      smoothedPush = 1;
      section.setAttribute('data-scroll-next-leaving', 'true');

      const exitTl = gsap.timeline();

      // 1. Giro rápido y elevación del disco
      exitTl.to(
        exitPhysics,
        {
          spin: -16,
          lift: 0.35,
          duration: 0.7,
          ease: 'power2.in'
        },
        0
      );

      // 2. Encogimiento del disco (popOut a 0.35)
      exitTl.to(
        popScaleState,
        {
          value: 0.35,
          duration: 0.45,
          ease: 'power2.in'
        },
        0
      );

      // 3. Subida del texto fuera de la pantalla (yPercent -120)
      const texts = section.querySelectorAll(
        '[data-scroll-next-kicker], [data-scroll-next-title], [data-reveal]'
      );
      if (texts.length) {
        exitTl.to(texts, { yPercent: -120, duration: 0.45, ease: 'power3.out', stagger: 0.03 }, 0);
      }

      // 4. Colapso de las líneas horizontales
      const rowEls = section.querySelectorAll('.scroll-to__row > .divider-horizontal');
      if (rowEls.length) {
        exitTl.to(
          rowEls,
          {
            scaleX: 0,
            duration: 0.5,
            ease: 'power3.out',
            stagger: { each: 0.04, from: 'end' }
          },
          0.05
        );
      }

      // 5. Navegación a la siguiente ficha en 0.48s
      exitTl.call(
        () => {
          window.location.href = `/discografia/${album.nextAlbum.slug}/`;
        },
        [],
        0.48
      );
    };

    // Control de scroll y revelación de elementos
    const updateScroll = () => {
      if (!section) return;
      const rect = section.getBoundingClientRect();
      const vh = window.innerHeight;
      const total = rect.height;
      const current = vh - rect.top;
      Ce = Math.max(0, Math.min(1, current / total));

      // Pop-in al cruzar el 30% (arriveStart: 0.3)
      if (!hasPoppedIn && Ce >= 0.3) {
        hasPoppedIn = true;
        gsap.to(popScaleState, {
          value: 1.0,
          duration: 1.05,
          ease: 'power3.out'
        });
      }

      // Revelación progresiva de las líneas horizontales
      const rowEls = section.querySelectorAll<HTMLElement>('.scroll-to__row > .divider-horizontal');
      rowEls.forEach((row, idx) => {
        const thresh = (idx + 1) / (rowEls.length + 1);
        if (Ce >= thresh && !revealedRules[idx]) {
          revealedRules[idx] = true;
          gsap.to(row, { scaleX: 1, duration: 0.9, ease: 'power3.out' });
        }
      });
    };

    const isAtBottom = () => {
      const maxScroll = document.documentElement.scrollHeight - window.innerHeight;
      return window.scrollY >= maxScroll - 3;
    };

    // Gestión del gesto de empuje (Wheel / Touch / Keys)
    const onWheel = (e: WheelEvent) => {
      if (isLeaving) return;
      let delta = e.deltaY;
      if (e.deltaMode === 1) delta *= 16;
      else if (e.deltaMode === 2) delta *= window.innerHeight;
      if (!delta) return;

      const now = performance.now();
      if (!isAtBottom()) return;

      if (!wheelArmedTime) wheelArmedTime = now;
      if (!isWheelArmed) {
        const settled = now - wheelArmedTime >= 350; // pushSettle
        const gap = now - lastWheelTime >= 140; // pushGap
        if (!settled || !gap) return;
        isWheelArmed = true;
      }
      lastWheelTime = now;

      const clampedDelta = Math.max(-140, Math.min(140, delta));
      pushProgressTarget = Math.max(0, Math.min(1, pushProgressTarget + clampedDelta / 620));
      lastPushActionTime = now;

      if (pushProgressTarget >= 1) {
        triggerExit();
      }
    };

    let touchStartY: number | null = null;
    const onTouchStart = (e: TouchEvent) => {
      touchStartY = e.touches[0]?.clientY ?? null;
    };
    const onTouchMove = (e: TouchEvent) => {
      if (isLeaving || touchStartY === null) return;
      const currentY = e.touches[0]?.clientY;
      if (currentY === undefined) return;
      const delta = touchStartY - currentY;
      touchStartY = currentY;

      if (!isAtBottom() || delta <= 0) return;

      pushProgressTarget = Math.max(0, Math.min(1, pushProgressTarget + delta / 380));
      lastPushActionTime = performance.now();

      if (pushProgressTarget >= 1) {
        triggerExit();
      }
    };
    const onTouchEnd = () => {
      touchStartY = null;
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (isLeaving) return;
      if (e.target && (e.target as HTMLElement).tagName.match(/INPUT|TEXTAREA|SELECT/)) return;
      if (e.key === 'ArrowDown' || e.key === 'PageDown' || e.key === ' ') {
        if (!isAtBottom()) return;
        pushProgressTarget = Math.max(0, Math.min(1, pushProgressTarget + 0.34));
        lastPushActionTime = performance.now();
        if (pushProgressTarget >= 1) {
          triggerExit();
        }
      }
    };

    // Eventos sobre el enlace del disco
    const linkEl = section.querySelector<HTMLElement>('[data-scroll-next-link]');
    const onPointerMove = (e: PointerEvent) => {
      if (isLeaving) return;
      if (checkDiscHover(e.clientX, e.clientY)) {
        section.setAttribute('data-scroll-next-over', '');
      } else {
        section.removeAttribute('data-scroll-next-over');
      }
    };
    const onPointerLeave = () => {
      section.removeAttribute('data-scroll-next-over');
    };
    const onLinkClick = (e: MouseEvent) => {
      e.preventDefault();
      if (!isLeaving && checkDiscHover(e.clientX, e.clientY)) {
        triggerExit();
      }
    };

    if (linkEl) {
      linkEl.addEventListener('pointermove', onPointerMove);
      linkEl.addEventListener('pointerleave', onPointerLeave);
      linkEl.addEventListener('click', onLinkClick);
    }

    window.addEventListener('scroll', updateScroll, { passive: true });
    window.addEventListener('resize', updateDimensions);
    window.addEventListener('wheel', onWheel, { passive: true });
    window.addEventListener('touchstart', onTouchStart, { passive: true });
    window.addEventListener('touchmove', onTouchMove, { passive: true });
    window.addEventListener('touchend', onTouchEnd, { passive: true });
    window.addEventListener('keydown', onKeyDown);

    updateScroll();

    // Bucle de renderizado animado a 60 fps
    let lastTime = performance.now();
    const animate = (now: number) => {
      if (isDisposed) return;
      animId = requestAnimationFrame(animate);

      const dt = Math.max(0.001, Math.min(0.05, (now - lastTime) / 1000));
      lastTime = now;

      // Drenaje de empuje (pushDrain: 0.9/s tras pushHold de 180ms)
      if (!isLeaving && now - lastPushActionTime > 180) {
        pushProgressTarget = Math.max(0, pushProgressTarget - dt * 0.9);
      }

      // Suavizado de la interacción de empuje (pushEase: 10)
      smoothedPush += (pushProgressTarget - smoothedPush) * Math.min(1, dt * 10);
      if (Math.abs(pushProgressTarget - smoothedPush) < 0.001) smoothedPush = pushProgressTarget;

      const o = smoothedPush;
      setPushProgress(o);

      // Interpolación de llegada de scroll (arriveStart: 0.3 -> arriveEnd: 0.97)
      const arriveProgress = Math.max(0, Math.min(1, (Ce - 0.3) / (0.97 - 0.3)));
      const a = arriveProgress;

      // Rotación en el eje Z (giro constante de reposo -0.14 + giro acelerado con el empuje)
      const idleSpinDelta = -0.14 * a;
      const pushSpinDelta = -6.0 * o;
      currentSpinZ += (idleSpinDelta + pushSpinDelta + exitPhysics.spin) * dt;
      spinGroup.rotation.z = currentSpinZ;

      // Balanceo orgánico (idle floating)
      idleTimer += dt;
      const idleAmp = 0.022 * a;
      wobbleGroup.rotation.x = Math.sin(idleTimer * 0.5 * Math.PI) * idleAmp;
      wobbleGroup.rotation.y = Math.cos(idleTimer * 0.5 * Math.PI * 0.7) * idleAmp;

      // Inclinación cinematográfica (arriveTilt -> restTilt -> pushTilt)
      const rad = THREE.MathUtils.degToRad;
      const tiltX = rad(-52) * (1 - a) + rad(-30) * a * (1 - o) + rad(-16) * a * o;
      const tiltY = rad(10) * (1 - a) + rad(-30) * a * (1 - o) + rad(-10) * a * o;
      rootGroup.rotation.x = tiltX;
      rootGroup.rotation.y = tiltY;

      // Escala del disco con factor de crecimiento por empuje (pushGrow: 1.04)
      const popScale = popScaleState.value;
      const discScale = pt * Math.max(0.0001, popScale) * (1 + 0.04 * o);
      const compX = getCenterComp(rootGroup.rotation);

      // Posición con caída de llegada (arriveDrop: 0.9) y elevación por empuje (pushLift: 0.1)
      rootGroup.position.set(
        -compX * discScale,
        mt - 0.9 * pt * (1 - a) + 0.1 * pt * o + exitPhysics.lift * pt,
        0
      );
      rootGroup.scale.setScalar(discScale);
      rootGroup.visible = popScale >= 0.34;

      renderer.render(scene, camera);
    };

    animate(performance.now());

    return () => {
      isDisposed = true;
      cancelAnimationFrame(animId);
      window.removeEventListener('scroll', updateScroll);
      window.removeEventListener('resize', updateDimensions);
      window.removeEventListener('wheel', onWheel);
      window.removeEventListener('touchstart', onTouchStart);
      window.removeEventListener('touchmove', onTouchMove);
      window.removeEventListener('touchend', onTouchEnd);
      window.removeEventListener('keydown', onKeyDown);

      if (linkEl) {
        linkEl.removeEventListener('pointermove', onPointerMove);
        linkEl.removeEventListener('pointerleave', onPointerLeave);
        linkEl.removeEventListener('click', onLinkClick);
      }

      frontGeom.dispose();
      frontMaterial.dispose();
      backGeom.dispose();
      backMaterial.dispose();
      edgeGeom.dispose();
      edgeMaterial.dispose();
      hubGeom.dispose();
      hubMaterial.dispose();
      discTexture.dispose();
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
          1. HERO SECTION (LA "CORTINA" SUPERIOR CON data-dissolve)
             Se recorta por abajo con marching squares en 16px grid.
         ============================================================ */}
      <div data-dissolve-track="" className="reveal-track">
        <section
          id="production_hero"
          ref={heroRef}
          data-dissolve=""
          className="production-hero"
        >
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
            2. FITXA AUDIOVISUAL (CAPA INFERIOR, INMEDIATAMENTE DETRÁS)
               Sube por detrás mediante calc(-1 * var(--dissolve-overlap)).
               Al recortarse la cortina blanca superior, esta imagen inunda hacia arriba.
           ============================================================ */}
        <section ref={trailerRef} data-theme-change="nav:base" className="trailer theme-dark">
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
          4. SECCIÓN UP NEXT (3D DISC & PUSH INTERACTION SEGÚN A24)
         ============================================================ */}
      <section
        ref={scrollNextRef}
        data-scroll-next=""
        data-theme-change="nav:dark"
        data-scroll-next-disc-vh="120"
        data-scroll-next-disc-vw="130"
        className="scroll-to theme-base"
      >
        <div className="scroll-to__vh">
          <div className="container">
            <div className="scroll-to__content">
              <div className="scroll-to__row">
                <div className="divider-horizontal" />
              </div>
              <div className="scroll-to__row">
                <div className="divider-horizontal" />
              </div>
              <div className="scroll-to__row">
                <div className="divider-horizontal" />
              </div>
              <div className="scroll-to__row">
                <div className="divider-horizontal" />
              </div>
              <div className="scroll-to__row">
                <div className="divider-horizontal" />
              </div>
            </div>
          </div>

          {/* Lienzo WebGL Three.js con el disco 3D */}
          <div
            ref={upNextCanvasContainerRef}
            data-scroll-next-canvas=""
            className="scroll-to__canvas"
          />

          {/* Etiqueta y Título en mayúsculas PP Eiko */}
          <div data-scroll-next-label="" className="scroll-to__label">
            <p data-scroll-next-kicker="" className="subheading-xs">
              DISC SEGÜENT
            </p>
            <h2 data-scroll-next-title="" className="heading-l">
              {album.nextAlbum.title.toUpperCase()}
            </h2>
          </div>

          {/* Bloque de créditos del disco siguiente */}
          <div data-scroll-next-credit="" className="scroll-to__credit">
            <div data-reveal="" className="text-right">
              <span className="subheading-xs block">ANY</span>
              <span className="paragraph-m font-medium">{album.nextAlbum.year}</span>
            </div>
            <div data-reveal="" className="text-right mt-3">
              <span className="subheading-xs block">GÈNERE</span>
              <span className="paragraph-m font-medium">{album.nextAlbum.genre}</span>
            </div>
          </div>

          {/* Enlace interactivo por polígono de 48 puntos sobre el disco */}
          <a
            aria-label={`Passar al disc següent: ${album.nextAlbum.title.toUpperCase()}`}
            data-scroll-next-link=""
            href={`/discografia/${album.nextAlbum.slug}/`}
            className="scroll-to__link"
          />

          {/* Indicador de ayuda y barra de progreso de empuje */}
          <div data-scroll-next-hint="" className="scroll-to__hint">
            <div className="scroll-to__hint-inner">
              <span className="subheading-xs">EMPENY PER PASSAR DE DISC</span>
              <div className="scroll-to__push-bar">
                <div
                  className="scroll-to__push-fill"
                  style={{ width: `${Math.round(pushProgress * 100)}%` }}
                />
              </div>
            </div>
          </div>

          {/* Lista oculta de datos para resolución de producciones */}
          <div data-scroll-next-list="" style={{ display: 'none' }} aria-hidden="true">
            <div data-scroll-next-item="">
              <span data-scroll-next-field="title">{album.nextAlbum.title}</span>
              <span data-scroll-next-field="type">{album.nextAlbum.type}</span>
              <span data-scroll-next-field="disc-art-url">{album.nextAlbum.discArtUrl}</span>
              <span data-scroll-next-field="slug">{album.nextAlbum.slug}</span>
              <span data-scroll-next-field="year">{album.nextAlbum.year}</span>
              <span data-scroll-next-field="genre">{album.nextAlbum.genre}</span>
              <span data-scroll-next-field="runtime">{album.nextAlbum.runtime}</span>
            </div>
          </div>
        </div>
      </section>

      {/* ============================================================
          5. REPRODUCTOR LIGHTBOX DEL TRÁILER (A24 CINEMATIC LIGHTBOX)
         ============================================================ */}
      {/* Caja negra en expansión desde el botón hacia pantalla completa */}
      <div
        ref={expandBoxRef}
        className="pointer-events-none"
        style={{ display: 'none' }}
        aria-hidden="true"
      />

      <div
        className="trailer-lightbox"
        data-trailer-status={trailerOpen ? 'open' : 'closed'}
        aria-hidden={!trailerOpen}
      >
        {/* Canvas de disolución líquida (marching squares noise) */}
        <canvas ref={dissolveCanvasRef} className="trailer-lightbox__canvas" />

        {/* Info editorial idéntica al bloque superior izquierdo de /discografia */}
        <div className="trailer-lightbox__editorial a24-top-left-block pointer-events-none">
          <div className="pb-2.5">
            <span className="subheading-xs block text-white/60 mb-1">PRODUCCIÓ OFICIAL</span>
            <h2 className="a24-serif-title uppercase text-white font-normal" style={{ color: '#ffffff' }}>
              {album.title.toUpperCase()}
            </h2>
          </div>
          <div className="editorial-line" style={{ backgroundColor: 'rgba(255, 255, 255, 0.25)' }} />
          <div className="a24-meta-row">
            <span className="a24-meta-label" style={{ color: 'rgba(255, 255, 255, 0.65)' }}>DIRECCIÓ</span>
            <span className="a24-meta-value text-right" style={{ color: '#ffffff' }}>{album.director}</span>
          </div>
          <div className="editorial-line" style={{ backgroundColor: 'rgba(255, 255, 255, 0.25)' }} />
          <div className="a24-meta-row">
            <span className="a24-meta-label" style={{ color: 'rgba(255, 255, 255, 0.65)' }}>ANY</span>
            <span className="a24-meta-value text-right" style={{ color: '#ffffff' }}>{album.year}</span>
          </div>
          <div className="editorial-line" style={{ backgroundColor: 'rgba(255, 255, 255, 0.25)' }} />
          <div className="a24-meta-row a24-meta-row--starring">
            <span className="a24-meta-label" style={{ color: 'rgba(255, 255, 255, 0.65)' }}>CRÈDITS</span>
            <span className="a24-meta-value text-right" style={{ color: '#ffffff' }}>
              {album.videoCredits || album.musicians || album.director}
            </span>
          </div>
        </div>

        {/* Escenario del reproductor a pantalla completa */}
        <div className="trailer-lightbox__stage">
          <div className="trailer-lightbox__player">
            {trailerOpen && (
              album.videoSrc ? (
                <AnnnimateVideoPlayer
                  src={album.videoSrc}
                  poster={album.videoPoster || album.trailerStill || '/video/nineta_frame.jpg'}
                  title={`${album.title} — Videoclip Oficial`}
                  credits={album.videoCredits || album.director}
                />
              ) : (
                <iframe
                  ref={iframeRef}
                  id="yt-trailer-player"
                  src={`https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&controls=0&disablekb=1&modestbranding=1&rel=0&iv_load_policy=3&playsinline=1&enablejsapi=1&origin=${typeof window !== 'undefined' ? window.location.origin : ''}`}
                  title={`${album.title} — Trailer`}
                  allow="autoplay; encrypted-media; picture-in-picture; fullscreen"
                  allowFullScreen
                />
              )
            )}
          </div>
        </div>

        {/* Barra superior e inferior de controles con la misma tipografía y botones que la web */}
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
              className="trailer-lightbox__ctl btn a24-btn"
              title="Tancar vídeo i minimitzar amb líquid separador"
            >
              TANCAR [ESC] ✕
            </button>
          </div>

          <div className="trailer-lightbox__bottom">
            <button
              type="button"
              onClick={() => {
                const nextPlaying = !isPlaying;
                setIsPlaying(nextPlaying);
                if (playerRef.current) {
                  if (nextPlaying) playerRef.current.playVideo?.();
                  else playerRef.current.pauseVideo?.();
                }
              }}
              className="trailer-lightbox__ctl btn a24-btn"
            >
              {isPlaying ? 'PAUSA' : 'REPRODUIR'}
            </button>

            <span className="trailer-lightbox__time">
              {currentTime} / {totalTime}
            </span>

            {/* Barra de progreso / Timeline */}
            <div
              className="trailer-lightbox__timeline"
              onClick={(e) => {
                const rect = e.currentTarget.getBoundingClientRect();
                const pos = (e.clientX - rect.left) / rect.width;
                setProgress(pos * 100);
                if (playerRef.current && typeof playerRef.current.getDuration === 'function') {
                  const dur = playerRef.current.getDuration();
                  playerRef.current.seekTo?.(pos * dur, true);
                }
              }}
            >
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
                onClick={() => {
                  const nextMuted = !isMuted;
                  setIsMuted(nextMuted);
                  if (playerRef.current) {
                    if (nextMuted) playerRef.current.mute?.();
                    else playerRef.current.unMute?.();
                  }
                }}
                className="trailer-lightbox__ctl btn a24-btn"
              >
                {isMuted ? 'ACTIVAR SO' : 'SO'}
              </button>
              <div
                className="trailer-lightbox__volume hidden sm:flex"
                onClick={(e) => {
                  const rect = e.currentTarget.getBoundingClientRect();
                  const val = Math.max(0, Math.min(100, Math.round(((e.clientX - rect.left) / rect.width) * 100)));
                  setVolume(val);
                  setIsMuted(false);
                  if (playerRef.current) {
                    playerRef.current.unMute?.();
                    playerRef.current.setVolume?.(val);
                  }
                }}
              >
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
              className="trailer-lightbox__ctl btn a24-btn hidden md:inline-block"
            >
              PANTALLA COMPLETA
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
