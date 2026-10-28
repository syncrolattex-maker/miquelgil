"use client";

import React, { useEffect, useRef, useState } from "react";
import * as THREE from "three";
import gsap from "gsap";
import "./GooeyHoverReveal.css";

export interface GooeyHoverRevealProps {
  blobCount?: number;      // user requested: 256
  blobRadius?: number;     // user requested: 180
  smoothness?: number;     // user requested: 75
  blobColor?: string;      // cover color, default "#000000"
  lifetime?: number;       // default: 2.5s
  spawnDistance?: number;  // default: 40px
  threshold?: number;      // default: 0.5
  cursorLag?: number;      // default: 0.35
  growDuration?: number;   // default: 0.12s
  children?: React.ReactNode;
  className?: string;
  hintText?: string;
}

interface BlobItem {
  x: number;
  y: number;
  t: number;
}

interface TrailSession {
  blobs: BlobItem[];
  phase: number;
  closing: boolean;
  cx: number;
  cy: number;
  ax: number;
  ay: number;
}

export default function GooeyHoverReveal({
  blobCount = 256,
  blobRadius = 180,
  smoothness = 75,
  blobColor = "#000000",
  lifetime = 2.5,
  spawnDistance = 40,
  threshold = 0.5,
  cursorLag = 0.35,
  growDuration = 0.12,
  children,
  className = "",
  hintText = "Mou el cursor per descobrir",
}: GooeyHoverRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [interacted, setInteracted] = useState(false);

  useEffect(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const maxBlobs = Math.min(Math.max(blobCount, 3), 256);
    const radius = Math.max(blobRadius, 10);
    const smooth = Math.max(smoothness, 1);
    const life = Math.max(lifetime, 0.2);
    const spawnDist = Math.max(spawnDistance, 1);
    const thresh = Math.max(Math.min(threshold, 0.99), 0.01);
    const lag = Math.min(Math.max(cursorLag, 0.01), 1);
    const grow = Math.max(growDuration, 0.01);
    const maxCapacity = 256;

    // Parse hex color into normalized RGB
    let cleanHex = blobColor.replace("#", "");
    if (cleanHex.length === 3) {
      cleanHex = cleanHex[0] + cleanHex[0] + cleanHex[1] + cleanHex[1] + cleanHex[2] + cleanHex[2];
    }
    const colorVec = new THREE.Vector3(
      parseInt(cleanHex.slice(0, 2), 16) / 255,
      parseInt(cleanHex.slice(2, 4), 16) / 255,
      parseInt(cleanHex.slice(4, 6), 16) / 255
    );

    // Three.js renderer & scene setup
    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: false,
      alpha: true,
      powerPreference: "high-performance",
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const geometry = new THREE.PlaneGeometry(2, 2);

    // Initial uniform vectors
    const initialVectors: THREE.Vector2[] = [];
    for (let i = 0; i < maxCapacity; i++) {
      initialVectors.push(new THREE.Vector2(0, 0));
    }

    const uniforms = {
      uBlobs: { value: initialVectors },
      uBlobScales: { value: new Float32Array(maxCapacity) },
      uBlobCount: { value: 0 },
      uBlobRadius: { value: radius },
      uRadiusScale: { value: 1.0 },
      uSmoothing: { value: smooth },
      uThreshold: { value: thresh },
      uColor: { value: colorVec },
      uResolution: { value: new THREE.Vector2(1, 1) },
      uTime: { value: 0 },
    };

    const vertexShader = `
      varying vec2 vUv;
      void main() {
        vUv = uv;
        gl_Position = vec4(position, 1.0);
      }
    `;

    const fragmentShader = `
      precision mediump float;

      #define MAX_BLOBS 256
      #define NOISE_SCALE 6.0
      #define WOBBLE_AMP  0.4
      #define EDGE_FEATHER 0.015

      uniform vec2  uBlobs[MAX_BLOBS];
      uniform float uBlobScales[MAX_BLOBS];
      uniform int   uBlobCount;
      uniform float uBlobRadius;
      uniform float uRadiusScale;
      uniform float uSmoothing;
      uniform float uThreshold;
      uniform vec3  uColor;
      uniform vec2  uResolution;
      uniform float uTime;

      varying vec2 vUv;

      // Polynomial smooth minimum (Inigo Quilez)
      float smin(float a, float b, float k) {
        float h = max(k - abs(a - b), 0.0) / k;
        return min(a, b) - h * h * h * k * (1.0 / 6.0);
      }

      // Value noise for liquid organic edge wobble
      float hash21(vec2 p) {
        p = fract(p * vec2(123.34, 456.21));
        p += dot(p, p + 45.32);
        return fract(p.x * p.y);
      }

      float noise2D(vec2 p) {
        vec2 i = floor(p);
        vec2 f = fract(p);
        f = f * f * (3.0 - 2.0 * f);
        return mix(
          mix(hash21(i), hash21(i + vec2(1.0, 0.0)), f.x),
          mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0, 1.0)), f.x),
          f.y
        );
      }

      void main() {
        float aspect = uResolution.x / uResolution.y;
        vec2 p = vec2(vUv.x * aspect, vUv.y);

        // Effective radius scaled by resolution and close scale
        float rBase = uBlobRadius * uRadiusScale / uResolution.y;

        // Single field merging all active trail blobs with smin
        float field = 1.0e6;
        for (int i = 0; i < MAX_BLOBS; i++) {
          if (i >= uBlobCount) break;
          vec2 pos = vec2(uBlobs[i].x * aspect, uBlobs[i].y);
          float dist = length(p - pos) - rBase * uBlobScales[i];
          field = smin(field, dist, uSmoothing / uResolution.y);
        }

        // Liquid edge wobble
        vec2 noiseUv = p * NOISE_SCALE + vec2(uTime * 0.6, uTime * 0.4);
        field += (noise2D(noiseUv) - 0.5) * WOBBLE_AMP * rBase;

        // Soft edge feather
        float edge = (uThreshold - 0.5) * rBase;
        float feather = EDGE_FEATHER * rBase;
        float alpha = smoothstep(edge - feather, edge + feather, field);

        if (alpha < 0.001) discard;
        gl_FragColor = vec4(uColor, alpha);
      }
    `;

    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader,
      transparent: true,
      depthWrite: false,
    });

    const mesh = new THREE.Mesh(geometry, material);
    scene.add(mesh);

    // State
    let isHidden = false;
    let prevTime = 0;
    let lastMoveTime = -Infinity;
    let lastSpawnX: number | null = null;
    let lastSpawnY: number | null = null;
    let lastRawX: number | null = null;
    let lastRawY: number | null = null;
    let hasMoved = false;

    let targetX = 0;
    let targetY = 0;
    let smoothX = 0;
    let smoothY = 0;

    const sessions: TrailSession[] = [];
    let activeSession: TrailSession | null = null;

    function addBlob(x: number, y: number, time: number) {
      if (!activeSession) {
        activeSession = {
          blobs: [],
          phase: 0,
          closing: false,
          cx: 0.5,
          cy: 0.5,
          ax: 1,
          ay: 0,
        };
        sessions.push(activeSession);
      }
      const bList = activeSession.blobs;
      if (bList.length >= maxBlobs) {
        bList.shift();
      }
      bList.push({ x, y, t: time });
    }

    function packBlobs(session: TrailSession, startIndex: number, time: number): number {
      const closingPhase = session.closing ? session.phase : 0;
      const phase2 = closingPhase * closingPhase;
      const phase4 = phase2 * phase2;
      const stayFrac = 1 - phase4;
      const shrinkAxis = 1 - 0.5 * phase4;
      const bList = session.blobs;

      let idx = startIndex;
      for (let i = 0; i < bList.length && idx < maxCapacity; i++) {
        const item = bList[i];
        let bx: number, by: number;

        if (closingPhase > 0) {
          const dx = item.x - session.cx;
          const dy = item.y - session.cy;
          const proj = dx * session.ax + dy * session.ay;
          const projX = proj * session.ax;
          const projY = proj * session.ay;
          bx = session.cx + projX * shrinkAxis + (dx - projX) * stayFrac;
          by = session.cy + projY * shrinkAxis + (dy - projY) * stayFrac;
        } else {
          bx = item.x;
          by = item.y;
        }

        // WebGL Y inverted
        uniforms.uBlobs.value[idx].set(bx, 1 - by);

        const age = Math.min(1, (time - item.t) / grow);
        const bloom = 1 - Math.pow(1 - age, 3);
        uniforms.uBlobScales.value[idx] = bloom * stayFrac;
        idx++;
      }
      return idx;
    }

    function updateSimulation(dt: number) {
      const now = gsap.ticker.time;

      if (hasMoved) {
        const rate = 1 - Math.pow(1 - lag, 60 * dt);
        smoothX += (targetX - smoothX) * rate;
        smoothY += (targetY - smoothY) * rate;
        if (Math.hypot(targetX - smoothX, targetY - smoothY) > 0.001) {
          lastMoveTime = now;
        }
      }

      // Trail generation while moving
      if (hasMoved && now - lastMoveTime < 0.05) {
        if (lastSpawnX === null || lastSpawnY === null) {
          addBlob(smoothX, smoothY, now);
          lastSpawnX = smoothX;
          lastSpawnY = smoothY;
        } else {
          const resX = uniforms.uResolution.value.x;
          const resY = uniforms.uResolution.value.y;
          const distPxX = (smoothX - lastSpawnX) * resX;
          const distPxY = (smoothY - lastSpawnY) * resY;
          const dist = Math.hypot(distPxX, distPxY);

          if (dist >= spawnDist) {
            const steps = Math.floor(dist / spawnDist);
            for (let s = 1; s <= steps; s++) {
              const frac = (s * spawnDist) / dist;
              addBlob(
                lastSpawnX + (smoothX - lastSpawnX) * frac,
                lastSpawnY + (smoothY - lastSpawnY) * frac,
                now
              );
            }
            const frac = (steps * spawnDist) / dist;
            lastSpawnX += (smoothX - lastSpawnX) * frac;
            lastSpawnY += (smoothY - lastSpawnY) * frac;
          }
        }
      } else if (activeSession) {
        // Idle: close active session and compute centroid + principal axis
        const closingSes = activeSession;
        activeSession = null;
        lastSpawnX = null;
        lastSpawnY = null;

        if (closingSes) {
          const bList = closingSes.blobs;
          const count = bList.length;
          if (count === 0) {
            const idx = sessions.indexOf(closingSes);
            if (idx !== -1) sessions.splice(idx, 1);
          } else {
            let sumX = 0, sumY = 0;
            for (let i = 0; i < count; i++) {
              sumX += bList[i].x;
              sumY += bList[i].y;
            }
            closingSes.cx = sumX / count;
            closingSes.cy = sumY / count;

            let varX = 0, varY = 0, covXY = 0;
            for (let i = 0; i < count; i++) {
              const dx = bList[i].x - closingSes.cx;
              const dy = bList[i].y - closingSes.cy;
              varX += dx * dx;
              varY += dy * dy;
              covXY += dx * dy;
            }

            if (varX + varY < 1e-8) {
              closingSes.ax = 1;
              closingSes.ay = 0;
            } else {
              const trace = varX + varY;
              const det = varX * varY - covXY * covXY;
              const lambda = 0.5 * trace + 0.5 * Math.sqrt(Math.max(0, trace * trace - 4 * det));
              let eigX: number, eigY: number;
              if (Math.abs(covXY) > 1e-6) {
                eigX = lambda - varY;
                eigY = covXY;
              } else if (varX >= varY) {
                eigX = 1;
                eigY = 0;
              } else {
                eigX = 0;
                eigY = 1;
              }
              const len = Math.hypot(eigX, eigY);
              closingSes.ax = eigX / len;
              closingSes.ay = eigY / len;
            }
            closingSes.closing = true;
          }
        }
      }

      // Age closing sessions
      for (let i = sessions.length - 1; i >= 0; i--) {
        const ses = sessions[i];
        if (ses.closing) {
          ses.phase = Math.min(1, ses.phase + dt / life);
          if (ses.phase >= 1) {
            sessions.splice(i, 1);
          }
        }
      }

      // Upload uniforms
      let activeCount = 0;
      if (activeSession) {
        activeCount = packBlobs(activeSession, activeCount, now);
      }
      for (let i = 0; i < sessions.length && activeCount < maxCapacity; i++) {
        if (sessions[i] !== activeSession) {
          activeCount = packBlobs(sessions[i], activeCount, now);
        }
      }

      uniforms.uBlobCount.value = activeCount;
      uniforms.uRadiusScale.value = 1.0;
      uniforms.uTime.value = now;
    }

    function renderLoop() {
      if (isHidden) return;
      const now = gsap.ticker.time;
      const dt = prevTime === 0 ? 0 : Math.min(now - prevTime, 0.1);
      prevTime = now;
      updateSimulation(dt);
      renderer.render(scene, camera);
    }

    function handleResize() {
      if (!container) return;
      const width = container.offsetWidth;
      const height = container.offsetHeight;
      renderer.setSize(width, height);
      uniforms.uResolution.value.set(width, height);
    }

    const resizeObserver = new ResizeObserver(() => {
      handleResize();
    });
    resizeObserver.observe(container);
    handleResize();

    function onPointerMove(e: PointerEvent | MouseEvent | TouchEvent) {
      if (!container) return;
      let clientX: number, clientY: number;
      if ("touches" in e && e.touches && e.touches.length > 0) {
        clientX = e.touches[0].clientX;
        clientY = e.touches[0].clientY;
      } else if ("clientX" in e) {
        clientX = (e as MouseEvent).clientX;
        clientY = (e as MouseEvent).clientY;
      } else {
        return;
      }

      if (lastRawX !== null && lastRawY !== null) {
        if (Math.hypot(clientX - lastRawX, clientY - lastRawY) < 1.5) {
          return;
        }
      }
      lastRawX = clientX;
      lastRawY = clientY;
      lastMoveTime = gsap.ticker.time;

      const rect = container.getBoundingClientRect();
      targetX = (clientX - rect.left) / rect.width;
      targetY = (clientY - rect.top) / rect.height;

      if (!hasMoved) {
        smoothX = targetX;
        smoothY = targetY;
        hasMoved = true;
        setInteracted(true);
      }
    }

    function onVisibilityChange() {
      isHidden = document.hidden;
      if (!isHidden) {
        renderer.render(scene, camera);
      }
    }

    // Attach listeners
    container.addEventListener("pointermove", onPointerMove, { passive: true });
    container.addEventListener("pointerdown", onPointerMove, { passive: true });
    container.addEventListener("touchmove", onPointerMove, { passive: true });
    container.addEventListener("touchstart", onPointerMove, { passive: true });
    document.addEventListener("visibilitychange", onVisibilityChange);

    renderer.render(scene, camera);
    gsap.ticker.add(renderLoop);
    gsap.ticker.lagSmoothing(0);

    return () => {
      gsap.ticker.remove(renderLoop);
      resizeObserver.disconnect();
      container.removeEventListener("pointermove", onPointerMove);
      container.removeEventListener("pointerdown", onPointerMove);
      container.removeEventListener("touchmove", onPointerMove);
      container.removeEventListener("touchstart", onPointerMove);
      document.removeEventListener("visibilitychange", onVisibilityChange);

      geometry.dispose();
      material.dispose();
      renderer.forceContextLoss();
      renderer.dispose();
    };
  }, [
    blobCount,
    blobRadius,
    smoothness,
    blobColor,
    lifetime,
    spawnDistance,
    threshold,
    cursorLag,
    growDuration,
  ]);

  return (
    <div
      ref={containerRef}
      className={`ghr_wrap ${className}`}
      data-anm-gooey-hover-reveal
      data-anm-blob-count={blobCount}
      data-anm-blob-radius={blobRadius}
      data-anm-smoothness={smoothness}
      data-anm-blob-color={blobColor}
      data-anm-lifetime={lifetime}
      data-anm-spawn-distance={spawnDistance}
      data-anm-threshold={threshold}
      data-anm-cursor-lag={cursorLag}
      data-anm-grow-duration={growDuration}
    >
      <div className="ghr_content" data-anm-ghr-content>
        {children}
      </div>
      <canvas ref={canvasRef} aria-hidden="true" className="ghr_canvas" />
      {hintText && (
        <div className={`ghr_hint ${interacted ? "ghr_hint--hidden" : ""}`}>
          <span className="ghr_hint_text">{hintText}</span>
        </div>
      )}
    </div>
  );
}
