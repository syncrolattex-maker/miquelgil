'use client';

import React, { useEffect, useRef } from 'react';
import * as THREE from 'three';
import gsap from 'gsap';
import './discografia.css';

interface ReviewData {
  pub: string;
  quote: string;
  stars: string;
}

interface FilmData {
  index: number;
  node: HTMLElement;
  title: string;
  description: string;
  director: string;
  year: string;
  starring: string;
  detailUrl: string;
  discUrl: string;
  reviews: ReviewData[];
}

interface DiscHolderUserData {
  index: number;
  frontMat: THREE.MeshPhysicalMaterial;
  dragSpinX: number;
  dragSpinY: number;
  zeroGOffset: THREE.Vector3;
  zeroGRot: THREE.Vector3;
  zeroGTween: gsap.core.Timeline | null;
  hoverWeight: number;
  hoverTiltTargetX: number;
  hoverTiltTargetY: number;
  hoverTiltCurrentX: number;
  hoverTiltCurrentY: number;
  floatPhase: number;
}

interface ScribbleRingData {
  baseRadius: number;
  geometry: THREE.BufferGeometry;
  positions: Float32Array;
  mesh: THREE.Mesh;
  noiseValues: Float32Array;
  startAngle: number;
  sweepFraction: number;
}

export default function DiscografiaClient() {
  const galleryRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const container = galleryRef.current;
    if (!container) return;

    const canvas = container.querySelector('[data-disc-canvas]') as HTMLCanvasElement | null;
    if (!canvas) return;

    const itemNodes = Array.from(
      container.querySelectorAll('[data-film-list] [data-film-item]')
    ) as HTMLElement[];
    const N = itemNodes.length;
    if (N === 0) return;

    container.setAttribute('data-disc-gallery-init', 'true');

    // 1. Parseo de datos desde el DOM ([data-film-list])
    const films: FilmData[] = itemNodes.map((node, idx) => {
      node.setAttribute('data-film-index', String(idx));
      node.setAttribute('data-film-status', idx === 0 ? 'active' : 'inactive');
      const getField = (name: string) => {
        const el = node.querySelector(`[data-film-field="${name}"]`);
        return el ? (el.textContent || '').trim() : '';
      };
      const rawReviews = getField('reviews');
      const reviews: ReviewData[] = rawReviews
        ? rawReviews.split(';').map((chunk) => {
            const [pub, quote, stars] = chunk.split('|');
            return { pub: pub || '', quote: quote || '', stars: stars || '★★★★★' };
          })
        : [];
      return {
        index: idx,
        node,
        title: getField('title'),
        description: getField('description'),
        director: getField('director'),
        year: getField('year'),
        starring: getField('starring'),
        detailUrl: getField('detailUrl'),
        discUrl: getField('discUrl'),
        reviews
      };
    });

    // 2. Constantes exactas de la especificación (dmtrbrl/discography - A24 base)
    const SPEC = {
      hGap: 2.8,
      narrowWidth: 650,
      depthGap: 1.0,
      activeDiscY: 0.06,
      galleryRotX: THREE.MathUtils.degToRad(-22),
      galleryRotY: THREE.MathUtils.degToRad(-22),
      galleryScale: 1.08,
      fov: 40,
      camDistance: 4.4,
      exposure: 0.86,
      discRadius: 1.0,
      discThickness: 0.01,
      holeRadius: 0.14,
      hubRadius: 0.24,
      renderRadius: 5,
      initialPreloadRadius: 5,
      inactiveScale: 0.8,
      flowLean: 0.11,
      flowBank: 0.20,
      flowDip: 0.032,
      hoverTiltStrength: 0.21,
      snapDuration: 0.46,
      dragStartDistance: 5,
      dragSensitivity: 0.95,
      dragVelocitySmoothing: 0.32,
      touchDragSpan: 1.8,
      touchFlickVelocity: 0.035,
      flipFlickVelocity: 0.08,
      flipDuration: 0.9,
      friction: 0.89,
      snapFreq: 9.5,
      snapDamping: 12,
      wheelNoiseFloor: 0.3,
      wheelEnvelopeTau: 550,
      wheelTickGap: 34,
      wheelMinStepTick: 90,
      wheelMinStepFlick: 190,
      wheelPauseGap: 130,
      wheelIdleReset: 150,
      wheelSustainDelay: 480,
      wheelStepThreshold: 6
    };

    const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

    // Estado principal del carrusel (dmtrbrl/discography)
    let L = 0; // Posición continua (decimal)
    let W = 0; // Índice activo entero
    let targetL = 0; // Destino en curso
    let dragInertia = 0; // Inercia física conservada al soltar
    let settleVelocity = 0; // Velocidad del muelle crítico de asentamiento
    let prevL = 0;
    let velocityVisual = 0;
    let kickBoost = 0;
    let activeTween: gsap.core.Tween | null = null;
    let isDisposed = false;
    let isTransitioningOut = false; // Bloqueo durante la animación de salida a la ficha

    const activeIndex = () => Math.round(Math.max(0, Math.min(N - 1, L)));
    const targetIndex = () => (activeTween ? Math.round(targetL) : activeIndex());

    // 3. Configuración Three.js (WebGLRenderer + PerspectiveCamera)
    // Match Three.js r128 color and lighting pipeline in modern Three.js
    THREE.ColorManagement.enabled = false;

    const scene = new THREE.Scene();
    const camera = new THREE.PerspectiveCamera(
      SPEC.fov,
      container.clientWidth / container.clientHeight,
      0.1,
      50
    );
    camera.position.set(0, 0, SPEC.camDistance);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      alpha: true,
      powerPreference: 'high-performance'
    });
    renderer.outputColorSpace = THREE.LinearSRGBColorSpace;
    renderer.setSize(container.clientWidth, container.clientHeight);
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = SPEC.exposure;

    // Iluminación según especificación: key, fill, rim azul (#499FF5) y tira superior
    // Multiply by Math.PI to match r128 non-physical punctual light scaleFactor
    const LIGHT_SCALE = Math.PI;
    const keyLight = new THREE.DirectionalLight(0xffffff, 2.2 * LIGHT_SCALE);
    keyLight.position.set(2.8, 3.8, 4.2);
    scene.add(keyLight);

    const fillLight = new THREE.DirectionalLight(0xf5f7fa, 1.15 * LIGHT_SCALE);
    fillLight.position.set(-3.2, 1.0, 3.0);
    scene.add(fillLight);

    const rimLight = new THREE.DirectionalLight(0x499FF5, 1.65 * LIGHT_SCALE);
    rimLight.position.set(0.0, -3.2, -2.5);
    scene.add(rimLight);

    const topStripLight = new THREE.DirectionalLight(0xffffff, 1.45 * LIGHT_SCALE);
    topStripLight.position.set(0.0, 5.5, 1.5);
    scene.add(topStripLight);

    scene.add(new THREE.AmbientLight(0xffffff, 0.75 * LIGHT_SCALE));

    // Grupo principal inclinado galleryRotX = -22°, galleryRotY = -22°
    const galleryGroup = new THREE.Group();
    galleryGroup.rotation.set(SPEC.galleryRotX, SPEC.galleryRotY, 0);
    galleryGroup.scale.setScalar(SPEC.galleryScale);
    scene.add(galleryGroup);

    // Ajuste responsivo avanzado de cámara y escala (vigilar responsive móvil)
    function updateCameraAndScale() {
      if (!container || isDisposed) return;
      const w = container.clientWidth;
      const h = container.clientHeight;
      if (w === 0 || h === 0) return;

      camera.aspect = w / h;
      camera.updateProjectionMatrix();
      renderer.setSize(w, h);

      if (w <= 650) {
        // En versión móvil, formato más pequeño de los CDs para que el título quepa arriba y las críticas abajo
        camera.position.set(0, 0, 6.2);
        galleryGroup.scale.setScalar(0.55);
        galleryGroup.position.set(0, -0.06, 0);
      } else if (w <= 1024) {
        camera.position.set(0, 0, 5.0);
        galleryGroup.scale.setScalar(0.82);
        galleryGroup.position.set(0, 0, 0);
      } else {
        camera.position.set(0, 0, SPEC.camDistance);
        galleryGroup.scale.setScalar(SPEC.galleryScale);
        galleryGroup.position.set(0, 0, 0);
      }
    }

    updateCameraAndScale();

    // 4. Mapa procedural de serigrafía (bumpMap + roughnessMap de 1024 px)
    function createSilkscreenPrintMaps() {
      const size = 512;
      const bumpCanvas = document.createElement('canvas');
      bumpCanvas.width = size;
      bumpCanvas.height = size;
      const bCtx = bumpCanvas.getContext('2d')!;

      const imgData = bCtx.createImageData(size, size);
      const data = imgData.data;
      const cx = size / 2;
      const cy = size / 2;

      for (let y = 0; y < size; y++) {
        for (let x = 0; x < size; x++) {
          const dx = x - cx;
          const dy = y - cy;
          const r = Math.sqrt(dx * dx + dy * dy) / (size / 2);
          const idx = (y * size + x) * 4;

          // Trama de serigrafía + surcos ópticos concéntricos
          const halftone = (Math.sin(x * 1.35 + y * 1.35) * 0.5 + 0.5) * 28;
          const groove = (Math.sin(r * 220) * 0.5 + 0.5) * 18;
          const grain = (Math.random() - 0.5) * 22;
          const val = Math.max(0, Math.min(255, 128 + halftone + groove + grain));

          data[idx] = val;
          data[idx + 1] = val;
          data[idx + 2] = val;
          data[idx + 3] = 255;
        }
      }
      bCtx.putImageData(imgData, 0, 0);

      const bumpMap = new THREE.CanvasTexture(bumpCanvas);
      bumpMap.needsUpdate = true;
      return { bumpMap, roughnessMap: bumpMap };
    }

    const printMaps = createSilkscreenPrintMaps();

    // Generador de textura de 1024px por disco con estampación serigráfica
    const textureRecords = new Map<number, { promise: Promise<THREE.CanvasTexture | null> }>();

    function buildDiscCanvasTexture(film: FilmData, loadedImg: HTMLImageElement | null) {
      const size = 1024;
      const c = document.createElement('canvas');
      c.width = size;
      c.height = size;
      const ctx = c.getContext('2d')!;
      const cx = size / 2;
      const cy = size / 2;

      // Base policarbonato / plata reflectante
      ctx.fillStyle = '#e7e7e4';
      ctx.beginPath();
      ctx.arc(cx, cy, size * 0.495, 0, Math.PI * 2);
      ctx.fill();

      // Portada impresa en serigrafía dentro del área de impresión (radio 0.24 a 0.985)
      ctx.save();
      ctx.beginPath();
      ctx.arc(cx, cy, size * 0.485, 0, Math.PI * 2);
      ctx.arc(cx, cy, size * 0.125, 0, Math.PI * 2, true);
      ctx.clip('evenodd');

      if (loadedImg) {
        ctx.drawImage(loadedImg, 0, 0, size, size);
      } else {
        const grad = ctx.createRadialGradient(cx, cy, size * 0.1, cx, cy, size * 0.5);
        grad.addColorStop(0, '#2a2a28');
        grad.addColorStop(1, '#111111');
        ctx.fillStyle = grad;
        ctx.fillRect(0, 0, size, size);
      }

      // Trama sutil de tinta serigráfica sobre el arte
      ctx.fillStyle = 'rgba(255,255,255,0.04)';
      for (let r = size * 0.14; r < size * 0.48; r += 6) {
        ctx.beginPath();
        ctx.arc(cx, cy, r, 0, Math.PI * 2);
        ctx.strokeStyle = 'rgba(0,0,0,0.035)';
        ctx.lineWidth = 1;
        ctx.stroke();
      }

      // Anell perimetral d'arxiu oficial en serigrafia
      ctx.fillStyle = 'rgba(255,255,255,0.88)';
      ctx.font = '600 18px "PP Neue Montreal", Arial, sans-serif';
      ctx.textAlign = 'center';
      ctx.fillText(`${film.title.toUpperCase()} · ${film.year} · ARXIU ÒPTIC MIQUEL GIL`, cx, size * 0.93);
      ctx.restore();

      // Anillo espejo de matriz (matrix ring alrededor del buje)
      ctx.strokeStyle = 'rgba(30, 30, 30, 0.35)';
      ctx.lineWidth = 10;
      ctx.beginPath();
      ctx.arc(cx, cy, size * 0.13, 0, Math.PI * 2);
      ctx.stroke();

      const tex = new THREE.CanvasTexture(c);
      tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
      tex.needsUpdate = true;
      return tex;
    }

    // 5. Geometrías compartidas del CD (grosor 0.01, agujero 0.14, buje 0.24, radio 1.0)
    function remapRingUVs(geo: THREE.RingGeometry, outerR: number) {
      const pos = geo.attributes.position;
      const uvs = geo.attributes.uv;
      for (let i = 0; i < pos.count; i++) {
        const x = pos.getX(i);
        const y = pos.getY(i);
        uvs.setXY(i, x / (outerR * 2) + 0.5, y / (outerR * 2) + 0.5);
      }
    }

    const sharedDiscGeo = new THREE.RingGeometry(SPEC.hubRadius, SPEC.discRadius, 72, 1);
    remapRingUVs(sharedDiscGeo, SPEC.discRadius);

    const sharedHubGeo = new THREE.RingGeometry(SPEC.holeRadius, SPEC.hubRadius, 64, 1);
    remapRingUVs(sharedHubGeo, SPEC.discRadius);

    const sharedEdgeGeo = new THREE.CylinderGeometry(
      SPEC.discRadius,
      SPEC.discRadius,
      SPEC.discThickness,
      72,
      1,
      true
    );
    sharedEdgeGeo.rotateX(Math.PI / 2);

    // Material trasero iridiscente (Cara B láser)
    function createIridescentBackTexture() {
      const size = 512;
      const c = document.createElement('canvas');
      c.width = size;
      c.height = size;
      const ctx = c.getContext('2d')!;
      const cx = size / 2;
      const cy = size / 2;
      const grad = ctx.createConicGradient(0, cx, cy);
      grad.addColorStop(0.0, '#d8dee9');
      grad.addColorStop(0.18, '#a3be8c');
      grad.addColorStop(0.35, '#88c0d0');
      grad.addColorStop(0.5, '#e5e9f0');
      grad.addColorStop(0.68, '#b48ead');
      grad.addColorStop(0.85, '#81a1c1');
      grad.addColorStop(1.0, '#d8dee9');
      ctx.fillStyle = grad;
      ctx.fillRect(0, 0, size, size);
      return new THREE.CanvasTexture(c);
    }

    const backMatShared = new THREE.MeshPhysicalMaterial({
      map: createIridescentBackTexture(),
      roughness: 0.08,
      metalness: 0.82,
      clearcoat: 1.0,
      clearcoatRoughness: 0.04,
      side: THREE.BackSide
    });

    const sharedHubMat = new THREE.MeshPhysicalMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.42,
      roughness: 0.12,
      metalness: 0.05,
      clearcoat: 1.0
    });

    const sharedEdgeMat = new THREE.MeshPhysicalMaterial({
      color: 0xd0d4dc,
      roughness: 0.15,
      metalness: 0.35
    });

    // Construcción de los 12 discos
    const discHolders: THREE.Group[] = [];
    const discHitMeshes: THREE.Mesh[] = [];

    films.forEach((_film, i) => {
      const holder = new THREE.Group();

      const frontMat = new THREE.MeshPhysicalMaterial({
        color: 0xffffff,
        roughness: 0.24,
        metalness: 0.18,
        bumpMap: printMaps.bumpMap,
        bumpScale: 0.004,
        roughnessMap: printMaps.roughnessMap,
        clearcoat: 0.85,
        clearcoatRoughness: 0.14
      });

      const frontMesh = new THREE.Mesh(sharedDiscGeo, frontMat);
      frontMesh.position.z = SPEC.discThickness * 0.5;

      const backMesh = new THREE.Mesh(sharedDiscGeo, backMatShared);
      backMesh.position.z = -SPEC.discThickness * 0.5;

      const hubMesh = new THREE.Mesh(sharedHubGeo, sharedHubMat);
      hubMesh.name = 'hub';

      const edgeMesh = new THREE.Mesh(sharedEdgeGeo, sharedEdgeMat);

      // Malla invisible para hit-testing preciso sobre todo el círculo de radio 1
      const hitMesh = new THREE.Mesh(
        new THREE.CircleGeometry(SPEC.discRadius, 36),
        new THREE.MeshBasicMaterial({ visible: false, side: THREE.DoubleSide })
      );
      hitMesh.userData = { discIndex: i };
      discHitMeshes.push(hitMesh);

      // Estados de interacción por disco (Zero-G y flotabilidad en cualquier disco + drag spin)
      const userData: DiscHolderUserData = {
        index: i,
        frontMat,
        dragSpinX: 0,
        dragSpinY: 0,
        zeroGOffset: new THREE.Vector3(),
        zeroGRot: new THREE.Vector3(),
        zeroGTween: null,
        hoverWeight: 0,
        hoverTiltTargetX: 0,
        hoverTiltTargetY: 0,
        hoverTiltCurrentX: 0,
        hoverTiltCurrentY: 0,
        floatPhase: i * 1.37
      };
      holder.userData = userData;

      holder.add(frontMesh, backMesh, hubMesh, edgeMesh, hitMesh);
      galleryGroup.add(holder);
      discHolders.push(holder);
    });

    function ensureDiscTexture(index: number): Promise<THREE.CanvasTexture | null> {
      if (index < 0 || index >= N) return Promise.resolve(null);
      if (textureRecords.has(index)) {
        return textureRecords.get(index)!.promise;
      }

      const film = films[index];
      // Textura inicial inmediata mientras carga la imagen remota
      const placeholderTex = buildDiscCanvasTexture(film, null);
      if (discHolders[index] && (discHolders[index].userData as DiscHolderUserData).frontMat) {
        const mat = (discHolders[index].userData as DiscHolderUserData).frontMat;
        mat.map = placeholderTex;
        mat.needsUpdate = true;
      }

      // Resolve local /images/... path if available to avoid CORS issues locally
      const localUrl = film.discUrl.replace(/^https?:\/\/miquelgil\.vercel\.app/, '');

      const promise = new Promise<THREE.CanvasTexture | null>((resolve) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.onload = () => {
          if (isDisposed) {
            resolve(null);
            return;
          }
          const finalTex = buildDiscCanvasTexture(film, img);
          if (discHolders[index] && (discHolders[index].userData as DiscHolderUserData).frontMat) {
            const mat = (discHolders[index].userData as DiscHolderUserData).frontMat;
            mat.map = finalTex;
            mat.needsUpdate = true;
          }
          resolve(finalTex);
        };
        img.onerror = () => {
          if (img.src !== film.discUrl && film.discUrl) {
            img.src = film.discUrl;
            return;
          }
          resolve(placeholderTex);
        };
        img.src = localUrl || film.discUrl;
      });

      textureRecords.set(index, { promise });
      return promise;
    }

    function preloadAround(centerIdx: number, radius = SPEC.renderRadius) {
      const promises: Promise<THREE.CanvasTexture | null>[] = [];
      const start = Math.max(0, Math.floor(centerIdx - radius));
      const end = Math.min(N - 1, Math.ceil(centerIdx + radius));
      for (let i = start; i <= end; i++) {
        promises.push(ensureDiscTexture(i));
      }
      return Promise.all(promises);
    }

    // Precarga inicial en radio 5
    preloadAround(0, SPEC.initialPreloadRadius);

    // ============================================================================
    // 6. SISTEMA SCRIBBLE (TRAZO NEGRO A MANO SEGÚN ESPECIFICACIÓN EXACTA)
    // ============================================================================
    const SCRIBBLE_SPEC = {
      segments: 72,
      baseRadii: [1.06, 1.105], // padding 0.06, loopGap 0.045
      thickness: 0.012,
      taperMin: 0.15,
      noiseCount: 24,
      noiseAmp: 0.028, // ±2.8% del radio
      baseSweep: 0.68,
      sweepVariance: 0.20, // ±20% -> [0.544, 0.816]
      fpsIntervalMs: 100, // 10 fps
      lag: 15,
      enterFrames: [0.3, 0.5, 0.72, 1.0],
      exitFrames: [0.72, 0.5, 0.3, 0.0]
    };

    const scribbleColorAttr = container.getAttribute('data-disc-scribble-color') || '#000000';
    const scribbleMaterial = new THREE.MeshBasicMaterial({
      color: new THREE.Color(scribbleColorAttr),
      side: THREE.DoubleSide,
      depthWrite: false,
      depthTest: false,
      transparent: true
    });

    const scribbleGroup = new THREE.Group();
    scribbleGroup.visible = false;
    scribbleGroup.renderOrder = 900;
    galleryGroup.add(scribbleGroup);

    function createScribbleRingData(baseRadius: number): ScribbleRingData {
      const segs = SCRIBBLE_SPEC.segments; // 72
      const vertexCount = (segs + 1) * 2; // 146 vértices
      const indexCount = segs * 6; // 432 índices

      const geometry = new THREE.BufferGeometry();
      const positions = new Float32Array(vertexCount * 3);
      const indices = new Uint16Array(indexCount);

      let ptr = 0;
      for (let i = 0; i < segs; i++) {
        const v0 = i * 2;
        const v1 = v0 + 1;
        const v2 = v0 + 2;
        const v3 = v0 + 3;
        indices[ptr++] = v0;
        indices[ptr++] = v2;
        indices[ptr++] = v1;
        indices[ptr++] = v1;
        indices[ptr++] = v2;
        indices[ptr++] = v3;
      }

      geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
      geometry.setIndex(new THREE.BufferAttribute(indices, 1));

      const mesh = new THREE.Mesh(geometry, scribbleMaterial);
      mesh.renderOrder = 900;
      scribbleGroup.add(mesh);

      return {
        baseRadius,
        geometry,
        positions,
        mesh,
        noiseValues: new Float32Array(SCRIBBLE_SPEC.noiseCount),
        startAngle: 0,
        sweepFraction: SCRIBBLE_SPEC.baseSweep
      };
    }

    const scribbleRings: ScribbleRingData[] = [
      createScribbleRingData(SCRIBBLE_SPEC.baseRadii[0]),
      createScribbleRingData(SCRIBBLE_SPEC.baseRadii[1])
    ];

    function randomizeRingParameters(ring: ScribbleRingData) {
      for (let k = 0; k < SCRIBBLE_SPEC.noiseCount; k++) {
        ring.noiseValues[k] = (Math.random() * 2 - 1) * SCRIBBLE_SPEC.noiseAmp;
      }
      ring.startAngle = Math.random() * Math.PI * 2;
      const factor = 1 + (Math.random() * 2 - 1) * SCRIBBLE_SPEC.sweepVariance;
      ring.sweepFraction = SCRIBBLE_SPEC.baseSweep * factor; // entre ~0.544 y ~0.816
    }

    function sampleSmoothNoise(noiseArr: Float32Array, u: number) {
      const len = noiseArr.length;
      const scaled = (((u % 1) + 1) % 1) * len;
      const i0 = Math.floor(scaled) % len;
      const i1 = (i0 + 1) % len;
      const frac = scaled - Math.floor(scaled);
      const smooth = frac * frac * (3 - 2 * frac); // smoothstep
      return noiseArr[i0] * (1 - smooth) + noiseArr[i1] * smooth;
    }

    function rebuildRingRibbonGeometry(ring: ScribbleRingData, progress: number) {
      const segs = SCRIBBLE_SPEC.segments;
      const pos = ring.positions;
      const activeSweep = ring.sweepFraction * Math.max(0.001, progress) * Math.PI * 2;

      for (let i = 0; i <= segs; i++) {
        const t = i / segs;
        const theta = ring.startAngle + t * activeSweep;

        // Muestreo de ruido suavizado alrededor de la vuelta
        const normAngle = (t * ring.sweepFraction * Math.max(0.001, progress)) % 1;
        const radialNoise = sampleSmoothNoise(ring.noiseValues, normAngle);
        const rCenter = ring.baseRadius * (1 + radialNoise);

        // Afilado de los extremos hasta el 15% (taperMin = 0.15)
        const edgeDist = Math.min(t, 1 - t);
        const taperZone = 0.18;
        const taperRatio = Math.min(1, edgeDist / taperZone);
        const smoothTaper = taperRatio * taperRatio * (3 - 2 * taperRatio);
        const halfWidth =
          SCRIBBLE_SPEC.thickness *
          0.5 *
          (SCRIBBLE_SPEC.taperMin + (1 - SCRIBBLE_SPEC.taperMin) * smoothTaper);

        const rInner = rCenter - halfWidth;
        const rOuter = rCenter + halfWidth;

        const cosA = Math.cos(theta);
        const sinA = Math.sin(theta);

        const vIdx = i * 6;
        pos[vIdx] = cosA * rInner;
        pos[vIdx + 1] = sinA * rInner;
        pos[vIdx + 2] = 0.008;

        pos[vIdx + 3] = cosA * rOuter;
        pos[vIdx + 4] = sinA * rOuter;
        pos[vIdx + 5] = 0.008;
      }

      ring.geometry.attributes.position.needsUpdate = true;
    }

    const scribbleState = {
      phase: 'hidden' as 'hidden' | 'entering' | 'active' | 'exiting',
      frameIdx: 0,
      progress: 0,
      lastStepTime: 0,
      wantActive: false
    };

    const scribbleStatusEl = container.querySelector('#scribble-status') as HTMLElement | null;

    function setScribbleActiveIntent(flag: boolean) {
      const activeFilm = films[W];
      const canShow = Boolean(activeFilm && activeFilm.detailUrl);
      const desired = flag && canShow;
      if (desired === scribbleState.wantActive) return;
      scribbleState.wantActive = desired;

      if (desired) {
        scribbleState.phase = 'entering';
        scribbleState.frameIdx = 0;
        scribbleGroup.visible = true;
        // Primer frame inmediato al entrar
        scribbleRings.forEach(randomizeRingParameters);
        scribbleState.progress = SCRIBBLE_SPEC.enterFrames[0];
        scribbleRings.forEach((r) => rebuildRingRibbonGeometry(r, scribbleState.progress));
        scribbleState.lastStepTime = performance.now();
        if (scribbleStatusEl) scribbleStatusEl.textContent = 'TRAÇ ACTIU (ANIMACIÓ 10 FPS)';
      } else {
        if (scribbleState.phase !== 'hidden') {
          scribbleState.phase = 'exiting';
          scribbleState.frameIdx = 0;
          scribbleState.lastStepTime = performance.now();
        }
        if (scribbleStatusEl) scribbleStatusEl.textContent = 'PASSA EL CURSOR PEL DISC PER AL TRAÇ';
      }
    }

    function updateScribbleStep(now: number, dt: number) {
      const activeHolder = discHolders[W];
      if (!activeHolder) return;

      // Seguimiento del disco activo: pegado mientras el carrusel se mueve, con lag 15 en reposo
      const isMoving = Math.abs(L - W) > 0.002;
      if (isMoving || scribbleState.phase === 'hidden') {
        scribbleGroup.position.copy(activeHolder.position);
        scribbleGroup.quaternion.copy(activeHolder.quaternion);
        scribbleGroup.scale.copy(activeHolder.scale);
      } else {
        const alpha = 1 - Math.exp(-SCRIBBLE_SPEC.lag * dt);
        scribbleGroup.position.lerp(activeHolder.position, alpha);
        scribbleGroup.quaternion.slerp(activeHolder.quaternion, alpha);
        scribbleGroup.scale.lerp(activeHolder.scale, alpha);
      }

      if (scribbleState.phase === 'hidden') return;

      // Respetar prefers-reduced-motion: no avanza más allá del primer frame
      if (prefersReducedMotion) {
        if (!scribbleState.wantActive) {
          scribbleState.phase = 'hidden';
          scribbleGroup.visible = false;
        }
        return;
      }

      if (now - scribbleState.lastStepTime < SCRIBBLE_SPEC.fpsIntervalMs) return;
      scribbleState.lastStepTime = now;

      if (scribbleState.phase === 'entering') {
        scribbleState.frameIdx++;
        if (scribbleState.frameIdx >= SCRIBBLE_SPEC.enterFrames.length - 1) {
          scribbleState.progress = 1.0;
          scribbleState.phase = 'active';
        } else {
          scribbleState.progress = SCRIBBLE_SPEC.enterFrames[scribbleState.frameIdx];
        }
        scribbleRings.forEach((ring) => {
          randomizeRingParameters(ring);
          rebuildRingRibbonGeometry(ring, scribbleState.progress);
        });
      } else if (scribbleState.phase === 'active') {
        scribbleState.progress = 1.0;
        scribbleRings.forEach((ring) => {
          randomizeRingParameters(ring);
          rebuildRingRibbonGeometry(ring, 1.0);
        });
      } else if (scribbleState.phase === 'exiting') {
        const exitStep = SCRIBBLE_SPEC.exitFrames[scribbleState.frameIdx];
        if (exitStep === undefined || exitStep <= 0) {
          scribbleState.phase = 'hidden';
          scribbleState.progress = 0;
          scribbleGroup.visible = false;
          return;
        }
        scribbleState.progress = exitStep;
        scribbleRings.forEach((ring) => {
          randomizeRingParameters(ring);
          rebuildRingRibbonGeometry(ring, scribbleState.progress);
        });
        scribbleState.frameIdx++;
      }
    }

    // ============================================================================
    // 7. ANIMACIÓN DE PANELES DE TEXTO Y REVELADO CINÉTICO GSAP
    // ============================================================================
    const leftPanel = container.querySelector('#left-editorial-panel') as HTMLElement | null;
    const uiCatalogNum = container.querySelector('#ui-catalog-num') as HTMLElement | null;
    const uiTitle = container.querySelector('#ui-title') as HTMLElement | null;
    const uiDescription = container.querySelector('#ui-description') as HTMLElement | null;
    const uiDirector = container.querySelector('#ui-director') as HTMLElement | null;
    const uiYear = container.querySelector('#ui-year') as HTMLElement | null;
    const uiStarring = container.querySelector('#ui-starring') as HTMLElement | null;
    const uiReviews = container.querySelector('#ui-reviews') as HTMLElement | null;
    const uiQuickList = container.querySelector('#ui-quick-list') as HTMLElement | null;
    const uiRuler = container.querySelector('#ui-ruler') as HTMLElement | null;
    const liveRegion = container.querySelector('#gallery-live-region') as HTMLElement | null;
    const prevBtn = container.querySelector('[data-disc-prev]') as HTMLButtonElement | null;
    const nextBtn = container.querySelector('[data-disc-next]') as HTMLButtonElement | null;

    // Construir lista lateral derecha y enlaces del cajón Index ([data-film-scroll])
    const indexGrid = container.querySelector('#index-links-grid') as HTMLElement | null;
    if (uiQuickList) uiQuickList.innerHTML = '';
    if (indexGrid) indexGrid.innerHTML = '';

    films.forEach((f, idx) => {
      if (uiQuickList) {
        const li = document.createElement('li');
        const btn = document.createElement('button');
        btn.type = 'button';
        btn.setAttribute('data-film-scroll', f.title);
        btn.className = 'a24-label hover:text-black transition-colors text-right';
        btn.innerHTML = `<span class="QuickTitle">${f.title}</span> <span class="opacity-50 ml-1">${f.year}</span>`;
        li.appendChild(btn);
        uiQuickList.appendChild(li);
      }

      if (indexGrid) {
        const card = document.createElement('a');
        card.href = f.detailUrl;
        card.className =
          'p-4 border border-black/10 rounded hover:border-black transition flex justify-between items-center group';
        card.innerHTML = `<span class="a24-value group-hover:underline">${String(idx + 1).padStart(2, '0')} — ${f.title}</span><span class="a24-label">${f.year} · FITXA →</span>`;
        indexGrid.appendChild(card);
      }
    });

    function splitAndAnimateChars(element: HTMLElement | null, text: string, delay = 0) {
      if (!element) return;
      element.innerHTML = '';
      const upperText = (text || '').toUpperCase();
      const words = upperText.split(' ');
      words.forEach((word, wIdx) => {
        const wordWrap = document.createElement('span');
        wordWrap.className = 'inline-block whitespace-nowrap';
        for (let c = 0; c < word.length; c++) {
          const mask = document.createElement('span');
          mask.className = 'char-mask';
          const inner = document.createElement('span');
          inner.className = 'char-inner text-black font-bold';
          inner.style.color = '#000000';
          inner.textContent = word[c];
          mask.appendChild(inner);
          wordWrap.appendChild(mask);
        }
        element.appendChild(wordWrap);
        if (wIdx < words.length - 1) {
          const sp = document.createElement('span');
          sp.innerHTML = '&nbsp;';
          element.appendChild(sp);
        }
      });

      if (prefersReducedMotion) return;
      gsap.fromTo(
        element.querySelectorAll('.char-inner'),
        { yPercent: 115, opacity: 0, rotateZ: 3 },
        {
          yPercent: 0,
          opacity: 1,
          rotateZ: 0,
          duration: 0.58,
          stagger: 0.015,
          delay,
          ease: 'expo.out',
          overwrite: true
        }
      );
    }

    // Animación por palabras/líneas con máscara para la descripción del CD y bloques
    function animateMaskedLines(element: HTMLElement | null, text: string, delay = 0.06) {
      if (!element) return;
      element.innerHTML = '';
      const words = (text || '').split(' ');
      words.forEach((w, i) => {
        const mask = document.createElement('span');
        mask.className = 'char-mask';
        const inner = document.createElement('span');
        inner.className = 'char-inner text-black font-normal';
        inner.style.color = '#000000';
        inner.textContent = w;
        mask.appendChild(inner);
        element.appendChild(mask);
        if (i < words.length - 1) {
          const sp = document.createElement('span');
          sp.innerHTML = ' ';
          element.appendChild(sp);
        }
      });

      if (prefersReducedMotion) return;
      gsap.fromTo(
        element.querySelectorAll('.char-inner'),
        { yPercent: 110, opacity: 0 },
        {
          yPercent: 0,
          opacity: 1,
          duration: 0.55,
          stagger: 0.008,
          delay,
          ease: 'expo.out',
          overwrite: true
        }
      );
    }

    // Listener del evento `discgallerychange` para animar título serif, líneas divisorias, descripción y créditos con GSAP
    const handleDiscGalleryChange = (ev: Event) => {
      const e = ev as CustomEvent<{ index: number; film: FilmData }>;
      const { index, film } = e.detail;

      if (uiCatalogNum) {
        uiCatalogNum.textContent = `A24—${String(index + 1).padStart(2, '0')}`;
        uiCatalogNum.className = 'text-black font-mono font-bold text-[10px]';
      }

      // Restablecer contenedores editoriales en color negro nítido y opacidad 1
      gsap.set(['#ui-title', '#ui-description', '#ui-director', '#ui-year', '#ui-starring', '#ui-reviews'], {
        opacity: 1,
        y: 0
      });

      // 1. Título en tipografía Serif en MAYÚSCULAS y negro
      splitAndAnimateChars(uiTitle, film.title.toUpperCase(), 0);

      // 2. Líneas divisorias horizontales animadas con GSAP (scaleX: 0 -> 1)
      if (leftPanel && !prefersReducedMotion) {
        const lines = leftPanel.querySelectorAll('.editorial-line');
        gsap.fromTo(
          lines,
          { scaleX: 0, opacity: 0.3 },
          {
            scaleX: 1,
            opacity: 1,
            duration: 0.7,
            stagger: 0.07,
            ease: 'expo.out',
            overwrite: true
          }
        );
      }

      // 3. Descripción del CD con revelado en cascada en color negro
      animateMaskedLines(uiDescription, film.description, 0.05);

      // 4. Productor / Director y Año
      splitAndAnimateChars(uiDirector, film.director, 0.09);
      splitAndAnimateChars(uiYear, film.year, 0.12);

      // 5. Reparto / Featuring
      if (uiStarring) {
        const items = film.starring.split(/,\s*/);
        uiStarring.innerHTML = '';
        items.forEach((itemText) => {
          const lineMask = document.createElement('span');
          lineMask.className = 'line-mask';
          const lineInner = document.createElement('span');
          lineInner.className = 'line-inner text-black font-medium';
          lineInner.style.color = '#000000';
          lineInner.textContent = itemText;
          lineMask.appendChild(lineInner);
          uiStarring.appendChild(lineMask);
        });
        if (!prefersReducedMotion) {
          gsap.fromTo(
            uiStarring.querySelectorAll('.line-inner'),
            { yPercent: 105, opacity: 0 },
            {
              yPercent: 0,
              opacity: 1,
              duration: 0.52,
              stagger: 0.045,
              delay: 0.14,
              ease: 'expo.out',
              overwrite: true
            }
          );
        }
      }

      // 6. Reseñas ampliadas y destacadas debajo de los CDs
      if (uiReviews) {
        uiReviews.innerHTML = '';
        film.reviews.forEach((rev) => {
          const block = document.createElement('div');
          block.className = 'flex flex-col items-center justify-center px-4 py-1.5 max-w-xs sm:max-w-sm';
          block.innerHTML = `
            <div class="text-[10px] sm:text-xs font-bold tracking-widest text-black uppercase mb-1">${rev.pub}</div>
            <div class="text-xs sm:text-base md:text-lg font-medium tracking-tight text-black leading-snug">“${rev.quote}”</div>
            <div class="text-xs sm:text-sm tracking-widest text-black mt-1">${rev.stars}</div>
          `;
          uiReviews.appendChild(block);
        });
        if (!prefersReducedMotion) {
          gsap.fromTo(
            Array.from(uiReviews.children),
            { y: 14, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.5, stagger: 0.08, delay: 0.08, ease: 'expo.out' }
          );
        }
      }

      // Resaltar activo en la lista derecha
      if (uiQuickList) {
        Array.from(uiQuickList.querySelectorAll('button')).forEach((btn, idx) => {
          if (idx === index) {
            btn.className = 'a24-value font-bold text-black text-right';
          } else {
            btn.className = 'a24-label text-black/75 hover:text-black font-medium transition-colors text-right';
          }
        });
      }

      // Mover regla inferior
      if (uiRuler) {
        uiRuler.style.transform = `translateX(${(5 - index) * 14}px)`;
      }

      // Enllaç del títol a la fitxa
      const uiTitleLink = container.querySelector('#ui-title-link') as HTMLAnchorElement | null;
      if (uiTitleLink) {
        uiTitleLink.href = film.detailUrl;
      }
    };

    container.addEventListener('discgallerychange', handleDiscGalleryChange);

    // ============================================================================
    // 8. FUNCIÓN DE ACTIVACIÓN ur(index) Y NAVEGACIÓN CENTRAL mr(index, {source})
    // ============================================================================
    let ariaTimer: ReturnType<typeof setTimeout> | null = null;
    let prefetchTimer: ReturnType<typeof setTimeout> | null = null;

    function ur(index: number) {
      W = index;
      const activeFilm = films[W];

      container!.setAttribute('data-active-film-index', String(W));

      films.forEach((f, idx) => {
        const isAct = idx === W;
        f.node.setAttribute('data-film-status', isAct ? 'active' : 'inactive');
        if (isAct) {
          f.node.setAttribute('aria-current', 'true');
        } else {
          f.node.removeAttribute('aria-current');
        }
      });

      container!.querySelectorAll('[data-film-counter="current"]').forEach((el) => {
        el.textContent = String(W + 1);
      });
      container!.querySelectorAll('[data-film-counter="total"]').forEach((el) => {
        el.textContent = String(N);
      });

      if (prevBtn) prevBtn.disabled = W <= 0;
      if (nextBtn) nextBtn.disabled = W >= N - 1;

      // Anuncio por aria-live a los 350 ms
      if (ariaTimer) clearTimeout(ariaTimer);
      ariaTimer = setTimeout(() => {
        if (liveRegion && activeFilm) {
          liveRegion.textContent = `${activeFilm.title}, ${W + 1} de ${N}`;
        }
      }, 350);

      // Precarga de la ficha con barba.prefetch a los 450 ms
      if (prefetchTimer) clearTimeout(prefetchTimer);
      prefetchTimer = setTimeout(() => {
        const w = window as unknown as { barba?: { prefetch?: (url: string) => void } };
        if (activeFilm && activeFilm.detailUrl && w.barba && typeof w.barba.prefetch === 'function') {
          try {
            w.barba.prefetch(activeFilm.detailUrl);
          } catch (_) {}
        }
      }, 450);

      // Disparar evento discgallerychange (bubbles: true)
      container!.dispatchEvent(
        new CustomEvent('discgallerychange', {
          bubbles: true,
          detail: { index: W, film: activeFilm }
        })
      );
    }

    // ============================================================================
    // 8. FUNCIÓN DE ACTIVACIÓN ur(index) Y NAVEGACIÓN CENTRAL goTo(index, source)
    // ============================================================================
    function motionFor(source: string, distance: number) {
      const base = SPEC.snapDuration; // 0.46
      let duration = base;
      let kick = 1.6;
      const ease = 'power2.out';

      if (source === 'wheel') {
        duration = base + 0.05; // 0.51 s
        kick = 2.5;
      } else if (source === 'key') {
        duration = base; // 0.46 s
        kick = 1.8;
      } else if (source === 'click') {
        const clampedSqrt = Math.min(1.6, Math.max(1.0, Math.sqrt(distance)));
        duration = base * clampedSqrt;
        kick = 2.0;
      } else if (source === 'flick') {
        duration = base * 0.9; // 0.414 s
        kick = 2.2;
      }

      return { duration, kick, ease };
    }

    async function goTo(targetIdx: number, source = 'default') {
      if (isTransitioningOut) return;

      // 1. Limita el índice a 0…N-1 (sin bucle)
      const clamped = Math.max(0, Math.min(N - 1, Math.round(targetIdx)));
      const distance = Math.abs(clamped - L);

      // 2. Si el destino está a más de 5 discos, espera a cargar sus texturas antes de animar
      if (Math.abs(clamped - W) > SPEC.renderRadius) {
        await preloadAround(clamped, SPEC.renderRadius);
      } else {
        preloadAround(clamped, SPEC.renderRadius);
      }

      // 3. Duración e impulso (kick) según origen con motionFor(source, distance)
      const { duration, kick, ease } = motionFor(source, distance);

      // Detener inercia física y velocidad del muelle
      dragInertia = 0;
      settleVelocity = 0;

      const dir = Math.sign(clamped - L) || 1;
      kickBoost = dir * kick * 0.22;

      if (activeTween) activeTween.kill();

      if (prefersReducedMotion || distance < 0.0001) {
        L = clamped;
        targetL = clamped;
        ur(clamped);
        return;
      }

      const oldIndex = W;
      let hasSwappedMeta = false;

      // Suave desvanecimiento del texto anterior al iniciar el viaje si cambiamos de disco (manteniendo el título nítido)
      if (clamped !== oldIndex && leftPanel && !prefersReducedMotion) {
        gsap.to(['#ui-description', '#ui-director', '#ui-year', '#ui-starring', '#ui-reviews'], {
          opacity: 0.35,
          y: dir > 0 ? -4 : 4,
          duration: 0.18,
          ease: 'power2.in',
          overwrite: 'auto'
        });
      }

      targetL = clamped;
      const animState = { val: L };
      activeTween = gsap.to(animState, {
        val: clamped,
        duration,
        ease,
        onUpdate: () => {
          L = animState.val;
          // Actualización armónica de la ficha a mitad del trayecto (38%) para sincronía perfecta
          const prog = distance > 0 ? 1 - Math.abs(clamped - L) / distance : 1;
          if (!hasSwappedMeta && (prog >= 0.38 || distance < 0.05)) {
            hasSwappedMeta = true;
            ur(clamped);
          }
        },
        onComplete: () => {
          L = clamped;
          activeTween = null;
          if (!hasSwappedMeta) {
            ur(clamped);
          }
          // Sutil impulso Zero-G al asentarse en el centro para dar peso físico
          if (discHolders[clamped]) {
            triggerSingleZeroGImpulse(discHolders[clamped], true);
          }
        }
      });
    }

    function step(delta: number) {
      wheelState.accum = 0;
      wheelState.lockedInGesture = false;
      wheelState.lastStepTime = performance.now();
      goTo(targetIndex() + delta, 'key');
    }

    // Alias mr para compatibilidad
    const mr = (targetIndex: number, opts?: { source?: string }) => goTo(targetIndex, opts?.source || 'default');

    const onPrevClick = () => goTo(W - 1, 'click');
    const onNextClick = () => goTo(W + 1, 'click');
    if (prevBtn) prevBtn.addEventListener('click', onPrevClick);
    if (nextBtn) nextBtn.addEventListener('click', onNextClick);

    // ============================================================================
    // 9. ENTRADA DE RUEDA / TRACKPAD (Con envolvente y huecos de referencia)
    // ============================================================================
    const wheelState = {
      accum: 0,
      lastEventTime: 0,
      lastStepTime: 0,
      envelope: 0,
      lockedInGesture: false
    };

    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || isTransitioningOut) return;
      e.preventDefault();

      const now = performance.now();
      const dt = now - wheelState.lastEventTime;
      wheelState.lastEventTime = now;

      // Si el modal de detalle está abierto, la rueda no mueve la fila (solo se sigue el gesto para no heredar cola)
      const isModalOpen = Boolean(detailModal && !detailModal.classList.contains('opacity-0'));

      // Normalización de deltaMode
      const modeMultiplier = e.deltaMode === 1 ? 16 : e.deltaMode === 2 ? 100 : 1;
      const dx = e.deltaX * modeMultiplier;
      const dy = e.deltaY * modeMultiplier;

      // Elegir eje dominante (horizontal si |dx| > 1.25 * |dy|)
      const isHorizontal = Math.abs(dx) > 1.25 * Math.abs(dy);
      const rawDelta = isHorizontal ? dx : dy;
      const absDelta = Math.abs(rawDelta);

      // Suelo de ruido wheelNoiseFloor 0.3
      if (absDelta < SPEC.wheelNoiseFloor) return;

      // Envolvente exponencial (wheelEnvelopeTau = 550 ms) para distinguir tic de rueda de cola inercial de trackpad
      const decay = Math.exp(-dt / SPEC.wheelEnvelopeTau);
      wheelState.envelope = Math.max(absDelta, wheelState.envelope * decay);

      if (dt > SPEC.wheelIdleReset) {
        wheelState.accum = 0;
        wheelState.lockedInGesture = false;
        wheelState.envelope = 0;
      } else if (dt > SPEC.wheelPauseGap) {
        wheelState.lockedInGesture = false;
      }

      const sinceLastStep = now - wheelState.lastStepTime;
      const isCleanTick = dt <= SPEC.wheelTickGap && sinceLastStep >= SPEC.wheelMinStepTick;
      const isFlick = sinceLastStep >= SPEC.wheelMinStepFlick && absDelta > 10;
      const isSustained = sinceLastStep >= SPEC.wheelSustainDelay && absDelta > 4;

      if (isCleanTick || isFlick || isSustained) {
        wheelState.lockedInGesture = false;
      }

      const clampedDelta = Math.sign(rawDelta) * Math.min(24, absDelta);
      wheelState.accum += clampedDelta;

      if (!wheelState.lockedInGesture && Math.abs(wheelState.accum) >= SPEC.wheelStepThreshold) {
        const stepDir = Math.sign(wheelState.accum);
        wheelState.accum = 0;
        wheelState.lockedInGesture = true;
        wheelState.lastStepTime = now;

        if (!isModalOpen) {
          goTo(targetIndex() + stepDir, 'wheel');
        }
      }
    };

    container.addEventListener('wheel', onWheel, { passive: false });

    // ============================================================================
    // 10. HIT-TESTING, HOVER CON FLOTABILIDAD EN TODOS LOS DISCOS Y ARRASTRE POINTER*
    // ============================================================================
    const raycaster = new THREE.Raycaster();
    const pointerNDC = new THREE.Vector2(99, 99);
    let hoveredDiscIndex = -1;
    let isPointerInside = false;
    let keyboardNavMode = false;
    let suppressClickUntil = 0;

    function updateRaycasterFromEvent(clientX: number, clientY: number) {
      const rect = container!.getBoundingClientRect();
      pointerNDC.x = ((clientX - rect.left) / rect.width) * 2 - 1;
      pointerNDC.y = -((clientY - rect.top) / rect.height) * 2 + 1;
      raycaster.setFromCamera(pointerNDC, camera);
      const hits = raycaster.intersectObjects(discHitMeshes, false);
      if (hits.length > 0) {
        const hit = hits[0];
        const idx = hit.object.userData.discIndex as number;
        const localPt = discHolders[idx].worldToLocal(hit.point.clone());
        return { index: idx, localPt };
      }
      return { index: -1, localPt: null };
    }

    // Impulso de flotabilidad Zero-G al entrar con el cursor sobre CUALQUIER disco (central o lateral)
    function triggerSingleZeroGImpulse(holder: THREE.Group, isCenter: boolean) {
      if (!holder || prefersReducedMotion) return;
      const u = holder.userData as DiscHolderUserData;
      if (u.zeroGTween) u.zeroGTween.kill();

      const amp = isCenter ? 1.0 : 0.85;
      const tl = gsap.timeline();
      u.zeroGTween = tl;

      tl.to(
        u.zeroGOffset,
        {
          y: 0.065 * amp,
          z: 0.085 * amp,
          duration: 0.36,
          ease: 'power2.out'
        },
        0
      )
        .to(
          u.zeroGRot,
          {
            x: -0.095 * amp,
            y: 0.115 * amp,
            z: 0.04 * amp,
            duration: 0.36,
            ease: 'power2.out'
          },
          0
        )
        .to(
          u.zeroGOffset,
          {
            x: 0,
            y: 0,
            z: 0,
            duration: 0.82,
            ease: 'sine.inOut'
          },
          0.36
        )
        .to(
          u.zeroGRot,
          {
            x: 0,
            y: 0,
            z: 0,
            duration: 0.82,
            ease: 'sine.inOut'
          },
          0.36
        );
    }

    // Estado del arrastre pointer* (dmtrbrl/discography)
    const dragState = {
      active: false,
      pointerId: null as number | null,
      pointerType: 'mouse',
      startX: 0,
      startY: 0,
      lastX: 0,
      lastY: 0,
      lastTime: 0,
      movedBeyondThreshold: false,
      mode: 'carousel' as 'disc-spin' | 'carousel',
      velocity: 0,
      spinVelocityY: 0
    };

    function isInteractiveElement(el: EventTarget | null) {
      if (!el || !(el as Element).closest) return false;
      return Boolean(
        (el as Element).closest('a, button, input, select, textarea, label, [data-disc-no-drag]')
      );
    }

    const onPointerDown = (e: PointerEvent) => {
      if (!e.isPrimary || e.button !== 0 || isTransitioningOut) return;
      if (isInteractiveElement(e.target)) return;

      const hit = updateRaycasterFromEvent(e.clientX, e.clientY);
      dragState.active = true;
      dragState.pointerId = e.pointerId;
      dragState.pointerType = e.pointerType || 'mouse';
      dragState.startX = e.clientX;
      dragState.startY = e.clientY;
      dragState.lastX = e.clientX;
      dragState.lastY = e.clientY;
      dragState.lastTime = performance.now();
      dragState.movedBeyondThreshold = false;
      dragState.velocity = 0;
      dragState.spinVelocityY = 0;

      // Modo 1: Pulsar sobre el disco activo -> gira sobre sí mismo en X/Y
      // Modo 2: Pulsar en otro sitio -> mueve el carrusel (L)
      dragState.mode = hit.index === W ? 'disc-spin' : 'carousel';

      if (activeTween) {
        activeTween.kill();
        activeTween = null;
      }
      dragInertia = 0;
      settleVelocity = 0;

      try {
        container.setPointerCapture(e.pointerId);
      } catch (_) {}
    };

    const onPointerMove = (e: PointerEvent) => {
      isPointerInside = true;

      if (!dragState.active) {
        const hit = updateRaycasterFromEvent(e.clientX, e.clientY);
        const prevHovered = hoveredDiscIndex;
        hoveredDiscIndex = hit.index;

        // Al entrar a cualquier disco (central o lateral): activar impulso de flotabilidad
        if (hoveredDiscIndex !== prevHovered) {
          if (prevHovered >= 0 && discHolders[prevHovered]) {
            const prevU = discHolders[prevHovered].userData as DiscHolderUserData;
            prevU.hoverTiltTargetX = 0;
            prevU.hoverTiltTargetY = 0;
          }
          if (hoveredDiscIndex >= 0 && discHolders[hoveredDiscIndex]) {
            triggerSingleZeroGImpulse(discHolders[hoveredDiscIndex], hoveredDiscIndex === W);
          }
        }

        // El Scribble (halo negro) solo aparece cuando el cursor está sobre el disco activo (W)
        if (hoveredDiscIndex === W && prevHovered !== W) {
          keyboardNavMode = false;
          setScribbleActiveIntent(true);
        } else if (hoveredDiscIndex !== W && prevHovered === W && !keyboardNavMode) {
          setScribbleActiveIntent(false);
        }

        // Inclinación magnética de flotabilidad sobre el disco bajo el cursor (sea activo o inactivo)
        if (hoveredDiscIndex >= 0 && hit.localPt && discHolders[hoveredDiscIndex]) {
          const u = discHolders[hoveredDiscIndex].userData as DiscHolderUserData;
          const tiltScale =
            hoveredDiscIndex === W ? SPEC.hoverTiltStrength : SPEC.hoverTiltStrength * 1.15;
          u.hoverTiltTargetX = -hit.localPt.y * tiltScale;
          u.hoverTiltTargetY = hit.localPt.x * tiltScale;
        }

        if (hoveredDiscIndex >= 0) {
          container.style.cursor = 'pointer';
        } else {
          container.style.cursor = 'default';
        }
        return;
      }

      if (e.pointerId !== dragState.pointerId) return;

      const dxTotal = e.clientX - dragState.startX;
      const dyTotal = e.clientY - dragState.startY;
      const dist = Math.hypot(dxTotal, dyTotal);

      if (!dragState.movedBeyondThreshold) {
        if (dist < SPEC.dragStartDistance) return;
        dragState.movedBeyondThreshold = true;

        // En táctil, si el gesto es más horizontal que vertical, se desactiva el giro del disco y manda el carrusel
        if (dragState.pointerType !== 'mouse' && Math.abs(dxTotal) > Math.abs(dyTotal)) {
          dragState.mode = 'carousel';
        }
      }

      const now = performance.now();
      const dt = Math.max(1, now - dragState.lastTime);
      const dx = e.clientX - dragState.lastX;
      const dy = e.clientY - dragState.lastY;
      dragState.lastX = e.clientX;
      dragState.lastY = e.clientY;
      dragState.lastTime = now;

      const activeHolder = discHolders[W];

      if (dragState.mode === 'disc-spin' && activeHolder) {
        const rect = container.getBoundingClientRect();
        const u = activeHolder.userData as DiscHolderUserData;
        const spinDx = (dx / rect.width) * Math.PI * 2 * SPEC.dragSensitivity;
        const spinDy = (dy / rect.height) * Math.PI * 2 * SPEC.dragSensitivity;
        u.dragSpinY += spinDx;
        u.dragSpinX += spinDy;
        const instSpinVel = spinDx / (dt / 1000);
        dragState.spinVelocityY =
          dragState.spinVelocityY * (1 - SPEC.dragVelocitySmoothing) +
          instSpinVel * SPEC.dragVelocitySmoothing;
      } else {
        const width = Math.max(1, container.clientWidth);
        const span = dragState.pointerType === 'mouse' ? 6 * SPEC.dragSensitivity : SPEC.touchDragSpan;
        const deltaL = -(dx / width) * span;
        L = Math.max(0, Math.min(N - 1, L + deltaL));

        const framesDt = dt / 16.6667;
        const instVel = deltaL / Math.max(0.1, framesDt);
        dragState.velocity =
          dragState.velocity * (1 - SPEC.dragVelocitySmoothing) +
          instVel * SPEC.dragVelocitySmoothing;
      }
    };

    const endPointerDrag = (e: PointerEvent) => {
      if (!dragState.active || e.pointerId !== dragState.pointerId) return;
      dragState.active = false;

      try {
        container.releasePointerCapture(e.pointerId);
      } catch (_) {}

      if (!dragState.movedBeyondThreshold) return;

      // Bloquear clic posterior durante 140 ms para que arrastrar no cuente como clic
      suppressClickUntil = performance.now() + 140;

      const activeHolder = discHolders[W];
      if (dragState.mode === 'disc-spin' && activeHolder) {
        const u = activeHolder.userData as DiscHolderUserData;
        const absSpin = Math.abs(u.dragSpinY);
        const isFlipFlick = Math.abs(dragState.spinVelocityY) >= SPEC.flipFlickVelocity * 10;
        const shouldFlip = absSpin >= Math.PI / 2 || isFlipFlick;
        const targetSpinY = shouldFlip ? Math.sign(u.dragSpinY || 1) * Math.PI : 0;
        gsap.to(u, {
          dragSpinY: targetSpinY,
          dragSpinX: 0,
          duration: shouldFlip ? SPEC.flipDuration : 0.6,
          ease: 'power2.out'
        });
      } else {
        if (dragState.pointerType !== 'mouse') {
          // Táctil: si |inercia| ≥ touchFlickVelocity: 0.035, goTo(target, 'flick')
          if (Math.abs(dragState.velocity) >= SPEC.touchFlickVelocity) {
            const stepDelta = Math.sign(dragState.velocity) * Math.min(2, Math.max(1, Math.round(Math.abs(dragState.velocity) * 8)));
            goTo(activeIndex() + stepDelta, 'flick');
          } else {
            goTo(activeIndex(), 'default');
          }
        } else {
          // Ratón: no hace snap inmediato. Conserva inercia, la amortigua con fricción (friction: 0.89)
          // hasta que el muelle crítico (snapFreq: 9.5, snapDamping: 12) la atrae al índice más cercano.
          dragInertia = dragState.velocity;
          settleVelocity = 0;
        }
      }
      container.style.cursor = hoveredDiscIndex >= 0 ? 'pointer' : 'default';
    };

    const onPointerLeave = () => {
      isPointerInside = false;
      container.style.cursor = 'default';
      if (hoveredDiscIndex >= 0 && discHolders[hoveredDiscIndex]) {
        const u = discHolders[hoveredDiscIndex].userData as DiscHolderUserData;
        u.hoverTiltTargetX = 0;
        u.hoverTiltTargetY = 0;
      }
      hoveredDiscIndex = -1;
      if (!keyboardNavMode) {
        setScribbleActiveIntent(false);
      }
    };

    container.addEventListener('pointerdown', onPointerDown);
    container.addEventListener('pointermove', onPointerMove);
    container.addEventListener('pointerup', endPointerDrag);
    container.addEventListener('pointercancel', endPointerDrag);
    container.addEventListener('pointerleave', onPointerLeave);

    // ============================================================================
    // 11. CLIC Y APERTURA DE FICHA (detailUrl)
    // ============================================================================
    const detailModal = container.querySelector('#detail-modal') as HTMLElement | null;
    const modalTitle = container.querySelector('#modal-title') as HTMLElement | null;
    const modalYear = container.querySelector('#modal-year') as HTMLElement | null;
    const modalDesc = container.querySelector('#modal-desc') as HTMLElement | null;
    const modalSlug = container.querySelector('#modal-slug') as HTMLElement | null;
    const modalExtLink = container.querySelector('#modal-ext-link') as HTMLAnchorElement | null;
    const closeModalBtn = container.querySelector('#close-modal-btn') as HTMLButtonElement | null;

    function openFilmDetail(film: FilmData, openInNewTab = false) {
      if (!film || !film.detailUrl || isTransitioningOut) return;

      const targetUrl = film.detailUrl.startsWith('/')
        ? film.detailUrl
        : `/discografia/${film.detailUrl.replace(/^#\/production\//, '')}/`;

      if (openInNewTab) {
        window.open(targetUrl, '_blank', 'noopener');
        return;
      }

      if (prefersReducedMotion) {
        window.location.href = targetUrl;
        return;
      }

      isTransitioningOut = true;

      if (activeTween) {
        activeTween.kill();
        activeTween = null;
      }
      dragInertia = 0;
      settleVelocity = 0;
      setScribbleActiveIntent(false);

      const activeHolder = discHolders[W];
      const exitOverlay = (container ? container.querySelector('#exit-transition-overlay') : null) as HTMLElement | null;

      const exitTl = gsap.timeline({
        onComplete: () => {
          const w = window as unknown as { barba?: { go?: (url: string) => void } };
          if (w.barba && typeof w.barba.go === 'function') {
            try {
              w.barba.go(targetUrl);
              return;
            } catch (_) {}
          }
          window.location.href = targetUrl;
        }
      });

      // 1. Animació del CD actiu: gir ràpid sobre si mateix mentre disminueix de mida
      if (activeHolder) {
        const u = activeHolder.userData as DiscHolderUserData;
        exitTl.to(
          u,
          {
            dragSpinY: u.dragSpinY + Math.PI * 4,
            dragSpinX: 0,
            duration: 0.68,
            ease: 'power2.in'
          },
          0
        );

        exitTl.to(
          activeHolder.scale,
          {
            x: 0.001,
            y: 0.001,
            z: 0.001,
            duration: 0.65,
            ease: 'power3.in'
          },
          0
        );

        exitTl.to(
          activeHolder.position,
          {
            y: activeHolder.position.y + 0.12,
            z: activeHolder.position.z + 0.35,
            duration: 0.65,
            ease: 'power2.in'
          },
          0
        );
      }

      // 2. Els altres discs desapareixen ràpidament
      discHolders.forEach((holder, idx) => {
        if (idx !== W) {
          exitTl.to(
            holder.scale,
            {
              x: 0,
              y: 0,
              z: 0,
              duration: 0.35,
              ease: 'power2.in'
            },
            0
          );
        }
      });

      // 3. Desvaniment dels elements d'interfície
      exitTl.to(
        ['header', 'footer', '#left-editorial-panel', '#ui-reviews-container', '#ui-quick-list'],
        {
          opacity: 0,
          y: -10,
          duration: 0.35,
          ease: 'power2.in'
        },
        0
      );

      // 4. Fundit en blanc cap a la pàgina de la fitxa del CD
      if (exitOverlay) {
        exitTl.to(
          exitOverlay,
          {
            opacity: 1,
            duration: 0.45,
            ease: 'power2.out'
          },
          0.26
        );
      }
    }

    const onCloseModal = () => {
      if (detailModal) detailModal.classList.add('opacity-0', 'pointer-events-none');
    };

    if (closeModalBtn) {
      closeModalBtn.addEventListener('click', onCloseModal);
    }

    const onContainerClick = (e: MouseEvent) => {
      if (performance.now() < suppressClickUntil || isTransitioningOut) return;
      const target = e.target as Element | null;
      if (target && target.closest && target.closest('a, button, [data-disc-no-open]')) return;

      const hit = updateRaycasterFromEvent(e.clientX, e.clientY);
      if (hit.index < 0) return;

      if (hit.index !== W) {
        mr(hit.index, { source: 'click' });
      } else {
        openFilmDetail(films[W], e.metaKey || e.ctrlKey);
      }
    };

    container.addEventListener('click', onContainerClick);

    // Clic sobre el títol a dalt a l'esquerra per obrir la fitxa amb l'animació de sortida
    const uiTitleLink = container.querySelector('#ui-title-link') as HTMLAnchorElement | null;
    const onTitleLinkClick = (e: MouseEvent) => {
      e.preventDefault();
      openFilmDetail(films[W]);
    };
    if (uiTitleLink) {
      uiTitleLink.addEventListener('click', onTitleLinkClick);
    }

    // ============================================================================
    // 13. MENÚ INDEX Y CUSTOM EVENT 'discgallerynavigate'
    // ============================================================================
    const indexDrawer = container.querySelector('#index-drawer') as HTMLElement | null;
    const toggleIndexBtn = container.querySelector('#toggle-index-btn') as HTMLButtonElement | null;
    const closeIndexBtn = container.querySelector('#close-index-btn') as HTMLButtonElement | null;

    function openIndexDrawer() {
      if (indexDrawer) indexDrawer.classList.remove('opacity-0', 'invisible');
    }
    function closeIndexDrawer() {
      if (indexDrawer) indexDrawer.classList.add('opacity-0', 'invisible');
    }

    if (toggleIndexBtn) toggleIndexBtn.addEventListener('click', openIndexDrawer);
    if (closeIndexBtn) closeIndexBtn.addEventListener('click', closeIndexDrawer);

    function normalizeTitle(str: string | undefined) {
      return (str || '').trim().toLowerCase();
    }

    const onDiscGalleryNavigate = (ev: Event) => {
      const e = ev as CustomEvent<{ title?: string }>;
      const targetTitle = normalizeTitle(e.detail && e.detail.title);
      const foundIdx = films.findIndex((f) => normalizeTitle(f.title) === targetTitle);
      if (foundIdx !== -1) {
        mr(foundIdx, { source: 'click' });
        closeIndexDrawer();
        container.focus();
      }
    };

    container.addEventListener('discgallerynavigate', onDiscGalleryNavigate);

    const filmScrollLinks = Array.from(
      container.querySelectorAll('[data-film-scroll]')
    ) as HTMLElement[];
    const onFilmScrollClick = (e: Event) => {
      e.preventDefault();
      const link = e.currentTarget as HTMLElement;
      const title = link.getAttribute('data-film-scroll');
      const galleryEl = document.querySelector('[data-disc-gallery]');
      if (!galleryEl) return;
      galleryEl.dispatchEvent(
        new CustomEvent('discgallerynavigate', {
          detail: { title }
        })
      );
    };
    filmScrollLinks.forEach((link) => {
      link.addEventListener('click', onFilmScrollClick);
    });

    const onKeyDown = (e: KeyboardEvent) => {
      if (isTransitioningOut) return;
      if (e.key === 'Escape') {
        closeIndexDrawer();
        if (detailModal) detailModal.classList.add('opacity-0', 'pointer-events-none');
        return;
      }

      const activeEl = document.activeElement;
      const galleryFocused = activeEl === container || container.contains(activeEl);
      const nothingElseFocused = !activeEl || activeEl === document.body;

      if (!galleryFocused && !(isPointerInside && nothingElseFocused)) return;

      if (e.key === 'ArrowRight') {
        e.preventDefault();
        keyboardNavMode = true;
        step(1);
        setScribbleActiveIntent(true);
      } else if (e.key === 'ArrowLeft') {
        e.preventDefault();
        keyboardNavMode = true;
        step(-1);
        setScribbleActiveIntent(true);
      } else if (e.key === 'Home') {
        e.preventDefault();
        keyboardNavMode = true;
        goTo(0, 'key');
        setScribbleActiveIntent(true);
      } else if (e.key === 'End') {
        e.preventDefault();
        keyboardNavMode = true;
        goTo(N - 1, 'key');
        setScribbleActiveIntent(true);
      } else if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        openFilmDetail(films[W], e.metaKey || e.ctrlKey);
      }
    };

    window.addEventListener('keydown', onKeyDown);

    // ============================================================================
    // 14. LOOP DE RENDERIZADO Y COLOCACIÓN MATEMÁTICA DE LOS DISCOS
    // ============================================================================
    let lastFrameTime = performance.now();
    let rafId = 0;

    function renderLoop(now: number) {
      if (isDisposed) return;
      rafId = requestAnimationFrame(renderLoop);

      const dt = Math.min(0.05, Math.max(0.001, (now - lastFrameTime) / 1000));
      lastFrameTime = now;
      const timeSec = now * 0.001;
      const frames = dt / (1 / 60);

      // Fricción + Muelle crítico según especificación dmtrbrl/discography
      // Si no estás arrastrando y no hay un tween activo:
      // this.position += this.inertia * frames;
      // this.inertia *= Math.pow(this.friction, frames);
      // Si la inercia baja a 0, el muelle crítico tira hacia el entero más cercano:
      // offset = activeIndex() - this.position;
      // settleVelocity += (offset * snapFreq² - settleVelocity * 2 * snapDamping) * dt;
      // this.position += settleVelocity * dt;
      if (!dragState.active && !activeTween) {
        if (Math.abs(dragInertia) > 1e-4) {
          L += dragInertia * frames;
          dragInertia *= Math.pow(SPEC.friction, frames);

          if (L < 0) {
            L = 0;
            dragInertia = 0;
          } else if (L > N - 1) {
            L = N - 1;
            dragInertia = 0;
          }

          if (Math.abs(dragInertia) <= 1e-4) {
            dragInertia = 0;
          }

          const currentNearIdx = activeIndex();
          if (currentNearIdx !== W) {
            ur(currentNearIdx);
          }
        } else {
          const target = activeIndex();
          const offset = target - L;
          settleVelocity +=
            (offset * (SPEC.snapFreq * SPEC.snapFreq) - settleVelocity * 2 * SPEC.snapDamping) *
            dt;
          L += settleVelocity * dt;

          if (Math.abs(offset) < 0.0005 && Math.abs(settleVelocity) < 0.0005) {
            L = target;
            settleVelocity = 0;
          }

          if (target !== W) {
            ur(target);
          }
        }
      }

      // Velocidad e inercia visual con dinamismo elástico y amortiguación sedosa ("pequeño flow")
      const rawVel = (L - prevL) / Math.max(0.008, dt);
      prevL = L;
      velocityVisual += (rawVel * 0.28 - velocityVisual) * Math.min(1, dt * 7.5);
      kickBoost *= Math.exp(-dt * 3.6);
      const flowSignal = Math.max(-1.4, Math.min(1.4, velocityVisual + kickBoost));

      // Disposición en fila según especificación:
      // Espaciado horizontal: hGap: 2.8 (0.9x en pantallas <= narrowWidth 650 px, variable rowGap).
      // Profundidad: depthGap: 1. Elevación del disco activo: activeDiscY: 0.06.
      // Escala del inactivo: inactiveScale: 0.8.
      const rowGap = window.innerWidth <= SPEC.narrowWidth ? SPEC.hGap * 0.9 : SPEC.hGap;
      const v = Math.max(0.12, SPEC.depthGap);

      for (let p = 0; p < N; p++) {
        const holder = discHolders[p];
        const m = p - L;
        const absM = Math.abs(m);

        // Solo se renderizan/cargan los discos en un radio de renderRadius: 5 del activo.
        holder.visible = absM <= SPEC.renderRadius + 0.5;
        if (!holder.visible) continue;

        const u = holder.userData as DiscHolderUserData;

        // Interpolación suave de flotabilidad (hoverWeight) e inclinación en cada disco (central o lateral)
        const isHovered = p === hoveredDiscIndex;
        const targetHoverWeight = isHovered && !prefersReducedMotion ? 1 : 0;
        u.hoverWeight += (targetHoverWeight - u.hoverWeight) * Math.min(1, dt * 7.5);

        if (!isHovered) {
          u.hoverTiltTargetX = 0;
          u.hoverTiltTargetY = 0;
        }
        u.hoverTiltCurrentX += (u.hoverTiltTargetX - u.hoverTiltCurrentX) * 0.14;
        u.hoverTiltCurrentY += (u.hoverTiltTargetY - u.hoverTiltCurrentY) * 0.14;

        // Oscilación suave de flotabilidad mientras el cursor está encima del disco
        const buoyY = u.hoverWeight * (0.048 + Math.sin(timeSec * 2.6 + u.floatPhase) * 0.022);
        const buoyZ = u.hoverWeight * (0.075 + Math.cos(timeSec * 2.1 + u.floatPhase) * 0.02);
        const buoyRoll = u.hoverWeight * Math.sin(timeSec * 2.3 + u.floatPhase) * 0.032;
        const buoyPitch = u.hoverWeight * Math.cos(timeSec * 2.0 + u.floatPhase) * 0.026;

        // Colocación matemática
        const a = m * 0.35;
        const x = Math.sin(a) * rowGap * 2.4;
        const z = -Math.cos(a) * v * 2.4 + v * 2.4;

        const centerT = Math.max(0, 1 - absM);
        // Interpolación hermite (smoothstep) para evitar saltos y dar sensación continua
        const smoothCenter = centerT * centerT * (3 - 2 * centerT);
        const y = smoothCenter * SPEC.activeDiscY - Math.abs(flowSignal) * SPEC.flowDip;

        holder.position.set(
          x + u.zeroGOffset.x,
          y + u.zeroGOffset.y + buoyY,
          z + u.zeroGOffset.z + buoyZ
        );

        // Escala continua y sedosa: 1.0 en el centro exacto, desciende a inactiveScale = 0.8
        if (!isTransitioningOut) {
          const baseScale = SPEC.inactiveScale + smoothCenter * (1.0 - SPEC.inactiveScale);
          holder.scale.setScalar(baseScale + u.hoverWeight * 0.028);
        }

        // Rotación con cabeceo aerodinámico (flowLean), alabeo natural (flowBank) y balanceo
        const isAct = p === W;
        const rotX =
          flowSignal * SPEC.flowLean +
          u.hoverTiltCurrentX +
          u.zeroGRot.x +
          buoyPitch +
          (isAct ? u.dragSpinX : 0);
        const rotY =
          -a - flowSignal * 0.035 +
          u.hoverTiltCurrentY +
          u.zeroGRot.y +
          (isAct ? u.dragSpinY : 0);
        const rotZ =
          -flowSignal * SPEC.flowBank + u.zeroGRot.z + buoyRoll;

        holder.rotation.set(rotX, rotY, rotZ);
      }

      // Actualizar el efecto Scribble (halo negro de trazo a mano a 10 fps stop motion)
      updateScribbleStep(now, dt);

      renderer.render(scene, camera);
    }

    // Redimensionado responsivo
    const onResize = () => {
      updateCameraAndScale();
    };

    window.addEventListener('resize', onResize);

    // Inicializar el primer disco como activo y arrancar el loop
    ur(0);
    rafId = requestAnimationFrame(renderLoop);

    return () => {
      isDisposed = true;
      cancelAnimationFrame(rafId);
      if (ariaTimer) clearTimeout(ariaTimer);
      if (prefetchTimer) clearTimeout(prefetchTimer);
      if (activeTween) activeTween.kill();

      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('resize', onResize);

      container.removeEventListener('discgallerychange', handleDiscGalleryChange);
      container.removeEventListener('discgallerynavigate', onDiscGalleryNavigate);
      container.removeEventListener('wheel', onWheel);
      container.removeEventListener('pointerdown', onPointerDown);
      container.removeEventListener('pointermove', onPointerMove);
      container.removeEventListener('pointerup', endPointerDrag);
      container.removeEventListener('pointercancel', endPointerDrag);
      container.removeEventListener('pointerleave', onPointerLeave);
      container.removeEventListener('click', onContainerClick);
      if (uiTitleLink) uiTitleLink.removeEventListener('click', onTitleLinkClick);

      if (prevBtn) prevBtn.removeEventListener('click', onPrevClick);
      if (nextBtn) nextBtn.removeEventListener('click', onNextClick);
      if (toggleIndexBtn) toggleIndexBtn.removeEventListener('click', openIndexDrawer);
      if (closeIndexBtn) closeIndexBtn.removeEventListener('click', closeIndexDrawer);
      if (closeModalBtn) closeModalBtn.removeEventListener('click', onCloseModal);
      filmScrollLinks.forEach((link) => {
        link.removeEventListener('click', onFilmScrollClick);
      });

      sharedDiscGeo.dispose();
      sharedHubGeo.dispose();
      sharedEdgeGeo.dispose();
      backMatShared.dispose();
      sharedHubMat.dispose();
      sharedEdgeMat.dispose();
      scribbleMaterial.dispose();
      printMaps.bumpMap.dispose();
      renderer.dispose();
      container.removeAttribute('data-disc-gallery-init');
    };
  }, []);

  return (
    <main
      ref={galleryRef}
      data-disc-gallery=""
      data-lenis-prevent-wheel=""
      data-disc-scribble-color="#000000"
      tabIndex={0}
      role="group"
      aria-roledescription="carrusel"
      aria-label="Galeria discogràfica de discos òptics"
    >
      {/* CANVAS 3D CON POINTER-EVENTS: NONE */}
      <canvas data-disc-canvas=""></canvas>

      {/* REGIÓN ARIA-LIVE PARA ANUNCIOS A LOS 350 MS */}
      <div id="gallery-live-region" className="sr-only" aria-live="polite" aria-atomic="true"></div>

      {/* CABECERA SUPERIOR ESTILO A24 */}
      <header className="absolute top-0 left-0 w-full z-20 flex items-center justify-between px-6 py-5 pointer-events-none">
        <div className="flex items-center gap-6 pointer-events-auto">
          <span className="a24-value font-semibold tracking-widest">A24 — MIQUEL GIL</span>
          <span className="a24-label hidden sm:inline">ARXIU ÒPTIC (1988–2024)</span>
        </div>

        <nav className="flex items-center gap-6 pointer-events-auto">
          <button type="button" data-disc-no-drag="" className="a24-value">
            ÀLBUMS
          </button>
          <button
            type="button"
            data-disc-no-drag=""
            id="toggle-index-btn"
            className="a24-label hover:text-black transition-colors"
          >
            ÍNDEX <span data-film-counter="total">12</span>
          </button>
        </nav>

        <div className="flex items-center gap-4 pointer-events-auto">
          <span className="a24-label">
            <span data-film-counter="current">1</span> / <span data-film-counter="total">12</span>
          </span>
          <button
            type="button"
            data-disc-prev=""
            className="a24-value px-2 py-1 border border-black/15 rounded hover:border-black disabled:opacity-30 transition"
          >
            ←
          </button>
          <button
            type="button"
            data-disc-next=""
            className="a24-value px-2 py-1 border border-black/15 rounded hover:border-black disabled:opacity-30 transition"
          >
            →
          </button>
        </div>
      </header>

      {/* OVERLAY DE TRANSICIÓ DE SORTIDA (FUNDIT A LA FITXA) */}
      <div
        id="exit-transition-overlay"
        className="fixed inset-0 z-50 bg-white pointer-events-none opacity-0 transition-opacity"
        aria-hidden="true"
      />

      {/* BLOC EDITORIAL SUPERIOR ESQUERRA */}
      <div
        id="left-editorial-panel"
        className="absolute top-14 sm:top-16 md:top-20 left-4 sm:left-6 md:left-12 z-20 pointer-events-none w-[calc(100vw-2rem)] sm:w-80 md:w-96 lg:w-[26rem] max-w-sm sm:max-w-md flex flex-col"
      >
        {/* Número de catàleg i Títol en majúscules */}
        <div className="pb-1 sm:pb-2">
          <div className="a24-label mb-1 flex items-center justify-between font-bold text-black text-[10px]">
            <span className="text-black font-bold">EDICIÓ</span>
            <span id="ui-catalog-num" className="text-black font-mono font-bold text-[10px]">
              A24—01
            </span>
          </div>
          <a
            id="ui-title-link"
            href="/discografia/viatger/"
            className="pointer-events-auto block hover:opacity-80 transition-opacity"
            title="Veure la fitxa completa de l'edició"
          >
            <h1 id="ui-title" className="a24-serif-title uppercase font-semibold text-black"></h1>
          </a>
        </div>

        {/* Línia divisòria */}
        <div className="editorial-line my-1.5 sm:my-2"></div>

        {/* Descripció del CD (compacta en mòbil) */}
        <div className="py-1.5 sm:py-2">
          <div className="a24-label mb-1 font-bold text-black text-[10px]">SINOPSI / NOTES</div>
          <p id="ui-description" className="a24-desc text-black text-[11px] sm:text-xs leading-relaxed line-clamp-3 sm:line-clamp-none"></p>
        </div>

        {/* Línia divisòria */}
        <div className="editorial-line my-1.5 sm:my-2"></div>

        {/* Producció i Any */}
        <div className="py-1.5 sm:py-2 grid grid-cols-3 gap-2">
          <div className="col-span-2">
            <div className="a24-label mb-0.5 font-bold text-black text-[10px]">PRODUCCIÓ</div>
            <div id="ui-director" className="a24-value font-semibold text-black text-[11px] sm:text-xs"></div>
          </div>
          <div>
            <div className="a24-label mb-0.5 font-bold text-black text-[10px]">ANY</div>
            <div id="ui-year" className="a24-value font-semibold text-black text-[11px] sm:text-xs"></div>
          </div>
        </div>

        {/* Col·laboracions (ocult en mòbils molt estrets) */}
        <div className="editorial-line my-1.5 sm:my-2 hidden sm:block"></div>
        <div className="pt-1.5 hidden sm:block">
          <div className="a24-label mb-0.5 font-bold text-black text-[10px]">COL·LABORACIONS</div>
          <div id="ui-starring" className="a24-value font-semibold text-black text-[11px] sm:text-xs leading-relaxed whitespace-pre-line"></div>
        </div>
      </div>

      {/* LLISTA RÀPIDA VERTICAL DRETA (NOMÉS ESCRIPTORI) */}
      <ul
        id="ui-quick-list"
        className="absolute top-16 md:top-20 right-6 md:right-12 z-20 hidden lg:flex flex-col gap-1.5 text-right pointer-events-auto"
      ></ul>

      {/* SECCIÓ DE RESSENYES AMPLIADES A SOTA DELS DISCOS */}
      <div
        id="ui-reviews-container"
        className="absolute bottom-12 sm:bottom-14 md:bottom-16 left-0 w-full z-20 pointer-events-none flex items-center justify-center px-4 sm:px-6"
      >
        <div
          id="ui-reviews"
          className="w-full max-w-4xl flex flex-col sm:flex-row items-center justify-center gap-4 sm:gap-8 md:gap-16 text-center pointer-events-auto"
        ></div>
      </div>

      {/* PIE DE PÁGINA CON REGLA NUMÉRICA Y AYUDA */}
      <footer className="absolute bottom-0 left-0 w-full z-20 flex items-center justify-between px-6 py-5 pointer-events-none">
        <div className="flex items-center gap-5 pointer-events-auto">
          <span id="scribble-status" className="a24-label">
            PASSA EL CURSOR PEL DISC PER AL TRAÇ
          </span>
        </div>

        {/* Cinta / Regla numérica sincronizada */}
        <div className="w-56 overflow-hidden text-center pointer-events-none">
          <div
            id="ui-ruler"
            className="whitespace-nowrap a24-label transition-transform duration-300 ease-out"
          >
            A &nbsp; 0 &nbsp; 1 &nbsp; 2 &nbsp; 3 &nbsp; 4 &nbsp; 5 &nbsp; 6 &nbsp; 7 &nbsp; 8 &nbsp; 9
            &nbsp; 10 &nbsp; 11 &nbsp; 12
          </div>
        </div>

        <div className="a24-label text-right">RODA · ARROSSEGA · FES CLIC AL DISC PER A VEURE LA FITXA</div>
      </footer>

      {/* MENÚ INDEX SUPERPUESTO (Usa [data-film-scroll="<título>"]) */}
      <div
        id="index-drawer"
        className="index-drawer fixed inset-0 z-30 bg-white/95 backdrop-blur-md opacity-0 invisible flex flex-col justify-between p-8"
      >
        <div className="flex justify-between items-center border-b border-black/10 pb-4">
          <span className="a24-title font-medium tracking-wide">ÍNDEX DEL CATÀLEG — 12 EDICIONS</span>
          <button
            type="button"
            id="close-index-btn"
            className="a24-value px-3 py-1 border border-black/20 rounded hover:bg-black hover:text-white transition"
          >
            TANCAR [ESC]
          </button>
        </div>
        <div
          id="index-links-grid"
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 my-auto max-w-5xl mx-auto w-full"
        ></div>
        <div className="a24-label border-t border-black/10 pt-4 flex justify-between">
          <span>TRIA UNA EDICIÓ PER A DESPLAÇAR EL CARRUSEL 3D</span>
          <span>ARXIU MIQUEL GIL</span>
        </div>
      </div>

      {/* MODAL DE FICHA DE PRODUCCIÓN (Simula la navegación Barba a detailUrl) */}
      <div
        id="detail-modal"
        className="fixed inset-0 z-40 bg-white opacity-0 pointer-events-none transition-opacity duration-300 flex flex-col justify-between p-8"
      >
        <div className="flex justify-between items-center border-b border-black/10 pb-4">
          <span id="modal-slug" className="a24-label">
            FITXA DE PRODUCCIÓ
          </span>
          <button
            type="button"
            id="close-modal-btn"
            className="a24-value px-3 py-1 border border-black/20 rounded hover:bg-black hover:text-white transition"
          >
            ← TORNAR A L&apos;ARXIU
          </button>
        </div>
        <div className="max-w-3xl my-auto space-y-6">
          <div id="modal-year" className="a24-label"></div>
          <h2 id="modal-title" className="text-4xl md:text-6xl font-medium uppercase tracking-tight"></h2>
          <p id="modal-desc" className="text-sm text-black/70 leading-relaxed max-w-xl"></p>
          <div className="pt-4 flex gap-4">
            <a
              id="modal-ext-link"
              href="https://miquelgil.vercel.app/discografia/"
              target="_blank"
              rel="noopener noreferrer"
              className="a24-value px-4 py-2 bg-black text-white rounded"
            >
              VEURE EDICIÓ OFICIAL ↗
            </a>
          </div>
        </div>
        <div className="a24-label border-t border-black/10 pt-4">FITXA TÈCNICA NORMALITZADA</div>
      </div>

      {/* FUENTE DE DATOS OCULTA EN EL DOM ([data-film-list] con 12 discos) */}
      <ul data-film-list="" aria-hidden="true" className="hidden">
        <li data-film-item="">
          <span data-film-field="title">Viatger</span>
          <span data-film-field="description">
            Un viatge sonor d&apos;arrel viva que celebra vint-i-cinc anys de trajectòria en solitari,
            fusionant cants mediterranis amb textures contemporànies.
          </span>
          <span data-film-field="director">Toni Xuclà &amp; Miquel Gil</span>
          <span data-film-field="year">2024</span>
          <span data-film-field="starring">Arrel Viva, Fusió, Tradició Contemporània</span>
          <span data-film-field="detailUrl">/discografia/viatger/</span>
          <span data-film-field="discUrl">https://miquelgil.vercel.app/images/disco_8.webp</span>
          <span data-film-field="reviews">
            Enderrock|Foc en moviment continu|★★★★★;Diari La Veu|Vint-i-cinc anys de mestratge|★★★★☆
          </span>
        </li>
        <li data-film-item="">
          <span data-film-field="title">Geometries</span>
          <span data-film-field="description">
            Arquitectura polifònica construïda sobre versos de Vicent Andrés Estellés i Enric Casasses, on
            la veu traça polígons emocionals d&apos;alta precisió.
          </span>
          <span data-film-field="director">Miquel Gil &amp; Col·lectiu</span>
          <span data-film-field="year">2019</span>
          <span data-film-field="starring">Vicent Andrés Estellés, Enric Casasses</span>
          <span data-film-field="detailUrl">/discografia/geometries/</span>
          <span data-film-field="discUrl">https://miquelgil.vercel.app/images/disco_7.jpg</span>
          <span data-film-field="reviews">
            Mondosonoro|Arquitectura polifònica fascinant|★★★★★;Tresdeu|Polígons emocionals perfectes|★★★★☆
          </span>
        </li>
        <li data-film-item="">
          <span data-film-field="title">Per marcianes</span>
          <span data-film-field="description">
            Laboratori d&apos;experimentació acústica i elèctrica on els cants de batre i les melodies
            valencianes viatgen cap a coordenades inèdites.
          </span>
          <span data-film-field="director">Eduard Navarro</span>
          <span data-film-field="year">2011</span>
          <span data-film-field="starring">Tradició Mutant, Experimentació Sonora</span>
          <span data-film-field="detailUrl">/discografia/per-marcianes/</span>
          <span data-film-field="discUrl">https://miquelgil.vercel.app/images/disco_6.png</span>
          <span data-film-field="reviews">
            World Music Central|Electricitat i tradició|★★★★★;Sons Mediterrània|Rumb a nous planetes|★★★★☆
          </span>
        </li>
        <li data-film-item="">
          <span data-film-field="title">Gil &amp; Camp Trio</span>
          <span data-film-field="description">
            Diàleg íntim i lliure entre el piano jazzístic de Manel Camp i la gola tel·lúrica de Miquel
            Gil, enregistrat amb respiració de música de cambra.
          </span>
          <span data-film-field="director">Manel Camp &amp; Miquel Gil</span>
          <span data-film-field="year">2009</span>
          <span data-film-field="starring">David Pastor, Jazz, Improvisació</span>
          <span data-film-field="detailUrl">/discografia/gil-camp-trio/</span>
          <span data-film-field="discUrl">https://miquelgil.vercel.app/images/disco_4.png</span>
          <span data-film-field="reviews">
            Cuadernos de Jazz|Diàleg hipnòtic i lliure|★★★★★;El País|Jazz de cambra mediterrani|★★★★★
          </span>
        </li>
        <li data-film-item="">
          <span data-film-field="title">Eixos</span>
          <span data-film-field="description">
            Cartografia sonora d&apos;una Mediterrània oberta i cosmopolita que connecta poetes contemporanis
            amb ritmes ancestrals de ribera a ribera.
          </span>
          <span data-film-field="director">Miquel Gil</span>
          <span data-film-field="year">2006</span>
          <span data-film-field="starring">Mediterrània Cosmopolita, Poetes</span>
          <span data-film-field="detailUrl">/discografia/eixos/</span>
          <span data-film-field="discUrl">https://miquelgil.vercel.app/images/disco_5.png</span>
          <span data-film-field="reviews">
            Folker Magazine|Gran veu de la Mediterrània|★★★★★;RootsWorld|Cartografia sonora impecable|★★★★☆
          </span>
        </li>
        <li data-film-item="">
          <span data-film-field="title">En Concert</span>
          <span data-film-field="description">
            Registre en viu de la força escènica i la improvisació vocal en directe, capturant l&apos;energia
            crua i orgànica del repertori mediterrani.
          </span>
          <span data-film-field="director">Galileo MC</span>
          <span data-film-field="year">2006</span>
          <span data-film-field="starring">Directe, Acústic, Energia Escènica</span>
          <span data-film-field="detailUrl">/discografia/en-concert/</span>
          <span data-film-field="discUrl">https://miquelgil.vercel.app/images/disco_4.png</span>
          <span data-film-field="reviews">
            Enderrock|Dimensió tel·lúrica irrepetible|★★★★★;B-Ritmos|Força escènica absoluta|★★★★★
          </span>
        </li>
        <li data-film-item="">
          <span data-film-field="title">Katà</span>
          <span data-film-field="description">
            Pont sonor entre Orient i Occident impulsat per llaüts, cordes pulsades i percussions que van
            situar l&apos;àlbum a les llistes europees de World Music.
          </span>
          <span data-film-field="director">Miquel Gil</span>
          <span data-film-field="year">2004</span>
          <span data-film-field="starring">World Music, Llaüt, Percussió</span>
          <span data-film-field="detailUrl">/discografia/kata/</span>
          <span data-film-field="discUrl">https://miquelgil.vercel.app/images/disco_3.png</span>
          <span data-film-field="reviews">
            fRoots Magazine|Pont sonor fascinant|★★★★★;World Music Charts|Selecció Europea|★★★★★
          </span>
        </li>
        <li data-film-item="">
          <span data-film-field="title">Orgànic</span>
          <span data-film-field="description">
            Obra fundacional de la neo-tradició valenciana que posa música a Ausiàs March i redefineix el
            cànon del cant d&apos;estil per al segle XXI.
          </span>
          <span data-film-field="director">Sonifolk</span>
          <span data-film-field="year">2001</span>
          <span data-film-field="starring">Ausiàs March, Neo-Tradició</span>
          <span data-film-field="detailUrl">/discografia/organic/</span>
          <span data-film-field="discUrl">https://miquelgil.vercel.app/images/disco_2.png</span>
          <span data-film-field="reviews">
            El País|Obra mestra fundacional|★★★★★;La Vanguardia|Redefineix l&apos;arrel|★★★★★
          </span>
        </li>
        <li data-film-item="">
          <span data-film-field="title">Buscando tu olor</span>
          <span data-film-field="description">
            Primer treball en solitari on l&apos;ex-vocalista d&apos;Al Tall explora lliurement la fusió amb el
            flamenc, el rock i la poesia urbana.
          </span>
          <span data-film-field="director">Miquel Gil</span>
          <span data-film-field="year">1997</span>
          <span data-film-field="starring">Fusió, Flamenc, Experimentació</span>
          <span data-film-field="detailUrl">/discografia/buscando-tu-olor/</span>
          <span data-film-field="discUrl">https://miquelgil.vercel.app/images/disco_1.jpg</span>
          <span data-film-field="reviews">
            Arxiu Valencià|Debut en solitari valent|★★★★☆;Levante EMV|Laboratori sonor inèdit|★★★★☆
          </span>
        </li>
        <li data-film-item="">
          <span data-film-field="title">Viajero</span>
          <span data-film-field="description">
            Aventura pionera amb el grup Terminal Sur als anys vuitanta, combinant sintetitzadors
            analògics, programacions i modalitat mediterrània.
          </span>
          <span data-film-field="director">Terminal Sur</span>
          <span data-film-field="year">1988</span>
          <span data-film-field="starring">Electro-Mediterrània, Sintetitzadors</span>
          <span data-film-field="detailUrl">/discografia/viajero/</span>
          <span data-film-field="discUrl">https://miquelgil.vercel.app/images/disco_1.jpg</span>
          <span data-film-field="reviews">
            RNE Radio 3|Avançat al seu temps|★★★★★;Discos Medicinales|Pioners de la fusió|★★★★★
          </span>
        </li>
        <li data-film-item="">
          <span data-film-field="title">Cants d&apos;Arrel</span>
          <span data-film-field="description">
            Antologia essencial de polifonia tradicional i cant d&apos;estil que preserva el llegat oral de
            les comarques centrals i l&apos;Horta.
          </span>
          <span data-film-field="director">Al Tall &amp; Miquel Gil</span>
          <span data-film-field="year">1985</span>
          <span data-film-field="starring">Cant Valencià, Polifonia Tradicional</span>
          <span data-film-field="detailUrl">/discografia/cants-arrel/</span>
          <span data-film-field="discUrl">https://miquelgil.vercel.app/images/disco_8.webp</span>
          <span data-film-field="reviews">
            Serra d&apos;Or|Memòria viva d&apos;un poble|★★★★★;Enderrock|Clàssic essencial|★★★★★
          </span>
        </li>
        <li data-film-item="">
          <span data-film-field="title">Tocs i Vares</span>
          <span data-film-field="description">
            Registre fonogràfic de percussions de canya, corda fregada i melismes populars de l&apos;Horta
            Sud en estat pur.
          </span>
          <span data-film-field="director">Arxiu Fonogràfic</span>
          <span data-film-field="year">1982</span>
          <span data-film-field="starring">Horta Sud, Percussions i Corda</span>
          <span data-film-field="detailUrl">/discografia/tocs-i-vares/</span>
          <span data-film-field="discUrl">https://miquelgil.vercel.app/images/disco_7.jpg</span>
          <span data-film-field="reviews">
            Fonoteca|Registre històric imprescindible|★★★★★;Cultura Popular|Raig d&apos;autenticitat|★★★★☆
          </span>
        </li>
      </ul>
    </main>
  );
}
