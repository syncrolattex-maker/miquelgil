"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import gsap from "gsap";

interface SandRevealProps {
  children: React.ReactNode;
  brushSize?: number;
  starterCue?: boolean;
  className?: string;
}

const clamp = (v: number, a: number, b: number) => Math.max(a, Math.min(b, v));

const random = (i: number) => {
  const n = Math.sin(i * 127.1 + 311.7) * 43758.5453;
  return n - Math.floor(n);
};

interface Particle {
  x: number;
  y: number;
  z: number;
  vx: number;
  vy: number;
  vz: number;
  r: number;
  color: string;
}

interface StrokePoint {
  x: number;
  y: number;
  time?: number;
}

export default function SandReveal({
  children,
  brushSize = 85,
  starterCue = true,
  className = "",
}: SandRevealProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const [isBrushing, setIsBrushing] = useState(false);

  // References to mutable simulation state to keep animations at 60fps without React re-renders
  const stateRef = useRef({
    ctx: null as CanvasRenderingContext2D | null,
    width: 0,
    height: 0,
    gridW: 0,
    gridH: 0,
    dpr: 1,
    scale: 2,
    heightmap: null as Float32Array | null,
    slopes: null as Float32Array | null,
    coarseNoise: null as Float32Array | null,
    pixelNoise: null as Float32Array | null,
    imageData: null as ImageData | null,
    brush: clamp(brushSize, 24, 140),
    particles: [] as Particle[],
    isTicking: false,
    needsRedraw: true,
    settleTime: 0,
    strokeCount: 0,
    pointerId: null as number | null,
    lastPointer: null as StrokePoint | null,
    dragStart: null as { x: number; y: number } | null,
    lastW: 0,
    lastH: 0,
    isMobile: false,
  });

  const sample = useCallback((x: number, y: number) => {
    const s = stateRef.current;
    if (!s.heightmap) return 0;
    const cx = clamp(x, 0, s.gridW - 1);
    const cy = clamp(y, 0, s.gridH - 1);
    return s.heightmap[cy * s.gridW + cx];
  }, []);

  const deposit = useCallback((x: number, y: number, amount: number) => {
    const s = stateRef.current;
    if (!s.heightmap) return;
    const ix = Math.floor(x);
    const iy = Math.floor(y);
    if (ix < 1 || iy < 1 || ix >= s.gridW - 2 || iy >= s.gridH - 2) return;
    const fx = x - ix;
    const fy = y - iy;
    const i = iy * s.gridW + ix;
    s.heightmap[i] += amount * (1 - fx) * (1 - fy);
    s.heightmap[i + 1] += amount * fx * (1 - fy);
    s.heightmap[i + s.gridW] += amount * (1 - fx) * fy;
    s.heightmap[i + s.gridW + 1] += amount * fx * fy;
  }, []);

  const draw = useCallback(() => {
    const s = stateRef.current;
    if (!s.ctx || !s.imageData || !s.heightmap || !s.slopes || !s.coarseNoise || !s.pixelNoise) return;

    const pixels = s.imageData.data;

    // Calculate slopes on heightmap
    for (let y = 0; y < s.gridH; y++) {
      for (let x = 0; x < s.gridW; x++) {
        const sx = sample(x - 2, y) - sample(x + 2, y);
        const sy = sample(x, y - 2) - sample(x, y + 2);
        const broadX = sample(x - 8, y) - sample(x + 8, y);
        const broadY = sample(x, y - 8) - sample(x, y + 8);
        s.slopes[y * s.gridW + x] = clamp(
          -(sx * 0.65 + sy) * 26 - (broadX * 0.65 + broadY) * 15,
          -65,
          42
        );
      }
    }

    // Bilinear interpolation and surface normal slope shading
    for (let y = 0; y < s.height; y++) {
      const gy = y / s.scale;
      const iy = Math.floor(gy);
      const fy = gy - iy;

      for (let x = 0; x < s.width; x++) {
        const gx = x / s.scale;
        const ix = Math.floor(gx);
        const fx = gx - ix;
        const p = (y * s.width + x) * 4;

        const index = iy * s.gridW + ix;
        const right = ix + 1 < s.gridW ? index + 1 : index;
        const below = iy + 1 < s.gridH ? index + s.gridW : index;
        const diagonal = iy + 1 < s.gridH ? right + s.gridW : right;

        const d =
          (s.heightmap[index] * (1 - fx) + s.heightmap[right] * fx) * (1 - fy) +
          (s.heightmap[below] * (1 - fx) + s.heightmap[diagonal] * fx) * fy;

        const n = s.pixelNoise[y * s.width + x];

        // Transparent if sand has been brushed away: reveals black text on white page
        if (d < 0.04 || (d < 0.75 && n > d / 0.75)) {
          pixels[p + 3] = 0;
          continue;
        }

        const slope =
          (s.slopes[index] * (1 - fx) + s.slopes[right] * fx) * (1 - fy) +
          (s.slopes[below] * (1 - fx) + s.slopes[diagonal] * fx) * fy;

        const coarse = s.coarseNoise[index];
        const texture = (n - 0.5) * 46 + (coarse - 0.5) * 12;
        const sparkle = n > 0.975 ? 18 : n < 0.04 ? -22 : 0;
        const shade = slope + texture + sparkle - Math.min(d, 7) * 1.2;

        // Warm authentic Mediterranean beach sand palette
        pixels[p] = clamp(204 + shade, 60, 245);
        pixels[p + 1] = clamp(188 + shade, 50, 238);
        pixels[p + 2] = clamp(158 + shade * 0.92, 35, 218);
        pixels[p + 3] = d < 0.09 ? 180 : 255;
      }
    }

    s.ctx.putImageData(s.imageData, 0, 0);

    // Draw flying sand grains
    for (const pt of s.particles) {
      s.ctx.fillStyle = "rgba(0, 0, 0, 0.16)";
      s.ctx.fillRect(pt.x + pt.z * 0.5, pt.y + pt.z * 0.4, pt.r, pt.r);
      s.ctx.fillStyle = pt.color;
      s.ctx.fillRect(pt.x, pt.y - pt.z, pt.r, pt.r);
    }

    s.needsRedraw = false;
  }, [sample]);

  // Sand avalanche physics
  const flowSand = useCallback(() => {
    const s = stateRef.current;
    if (!s.heightmap) return;
    for (let y = 1; y < s.gridH - 1; y++) {
      for (let x = 1; x < s.gridW - 1; x++) {
        const i = y * s.gridW + x;
        if (s.heightmap[i] < 1.35) continue;
        for (const offset of [-1, 1, -s.gridW, s.gridW]) {
          const j = i + offset;
          const diff = s.heightmap[i] - s.heightmap[j];
          if (diff > 0.34) {
            const flow = (diff - 0.34) * 0.16;
            s.heightmap[i] -= flow;
            s.heightmap[j] += flow;
          }
        }
      }
    }
  }, []);

  const fillDunes = useCallback(() => {
    const s = stateRef.current;
    if (!s.heightmap || !s.coarseNoise) return;

    const isMob = s.isMobile;

    if (!isMob) {
      // =========================================================================
      // DESKTOP: Canvas a pantalla completa (Full screen 100vw x 100vh).
      // Degradat d'esquerra a dreta (sense tapar la imatge):
      // L'arena cobreix la zona de text a l'esquerra (nx <= 0.24)
      // i descendeix suaument en pendent de duna orgànica fins arribar a 0
      // just a la vora de la fotografia de la dreta (nx >= 0.48).
      // Mai està limitada a un requadre, sinó que abasta tota la pantalla.
      // =========================================================================
      for (let y = 0; y < s.gridH; y++) {
        for (let x = 0; x < s.gridW; x++) {
          const i = y * s.gridW + x;
          const nx = x / s.gridW;
          const ny = y / s.gridH;

          // Pertorbació orgànica dels contorns de les dunes al llarg de l'alçada
          const duneWarp =
            0.045 * Math.sin(ny * 6.5 + 0.5) +
            0.03 * Math.sin(ny * 12.0 - 0.8) +
            0.015 * Math.cos(ny * 20.0 + nx * 4.0);

          // Pendent de degradat d'esquerra a dreta:
          // nx <= xSolid: arena profunda i compacta cobrint el text
          // xSolid < nx < xFadeEnd: descens suau i orgànic cap a 0
          // nx >= xFadeEnd: 0 absolut d'arena, mai toca la imatge de la dreta
          const xSolid = 0.24 + duneWarp * 0.25;
          const xFadeEnd = 0.48 + duneWarp * 0.35;

          let xFalloff = 0;
          if (nx <= xSolid) {
            xFalloff = 1.0;
          } else if (nx < xFadeEnd) {
            const t = (xFadeEnd - nx) / (xFadeEnd - xSolid);
            xFalloff = Math.pow(t, 1.35);
          } else {
            xFalloff = 0;
          }

          // A dalt i a baix l'arena abasta pràcticament tota l'alçada (sensació de paisatge ampli)
          let yFalloff = 1.0;
          if (ny < 0.02) {
            yFalloff = ny / 0.02;
          } else if (ny > 0.98) {
            yFalloff = (1.0 - ny) / 0.02;
          }

          const base = xFalloff * yFalloff;
          if (base <= 0.002) {
            s.heightmap[i] = 0;
            continue;
          }

          let depth = base * 5.2;

          // Rínxols de vent mediterrani i crestes suaus de duna
          const windRipples = 0.22 * Math.sin(nx * 14.0 + ny * 8.0 + duneWarp * 8.0) * base;
          const duneRidge = Math.sin((nx * 1.6 - ny * 0.35) * Math.PI * 2.0) * 0.16 * base;
          depth += windRipples + duneRidge;

          // Textura granulada orgànica
          const flecks = s.coarseNoise[i] > 0.8 ? s.coarseNoise[i] * 0.24 * base : 0;
          depth = Math.max(0, depth * (0.96 + s.coarseNoise[i] * 0.08) + flecks);

          s.heightmap[i] = depth;
        }
      }
    } else {
      // =========================================================================
      // MÒBIL: Canvas a pantalla completa. L'arena entra de BAIX a DALT (sensació de platja)
      // Imatge a dalt (~36vh), text a baix (~64vh).
      // L'arena és compacta a la part inferior sobre el text (ny >= ~0.52),
      // puja suaument en pendent d'onatge (0.35 < ny < 0.52),
      // i es queda a 0 a la part superior (ny <= 0.35) respectant la foto de la platja.
      // Abasta tot l'ample de la pantalla (100vw) d'extrem a extrem sense requadre.
      // =========================================================================
      for (let y = 0; y < s.gridH; y++) {
        for (let x = 0; x < s.gridW; x++) {
          const i = y * s.gridW + x;
          const nx = x / s.gridW;
          const ny = y / s.gridH;

          // Línia de marea i riba orgànica
          const shoreWarp =
            0.04 * Math.sin(nx * 7.0 + 0.4) +
            0.025 * Math.sin(nx * 15.0 - 1.0) +
            0.015 * Math.cos(nx * 24.0 + 1.5);

          // Entrada de baix a dalt:
          // ny >= ySolid: arena compacta a la part inferior sobre el text i enllaços
          // yShoreline < ny < ySolid: pendent ascendent suau cap a la riba
          // ny <= yShoreline: 0 absolut d'arena just on connecta amb la foto de dalt
          const ySolid = 0.52 + shoreWarp * 0.25;
          const yShoreline = 0.35 + shoreWarp * 0.35;

          let yFalloff = 0;
          if (ny >= ySolid) {
            yFalloff = 1.0;
          } else if (ny > yShoreline) {
            const t = (ny - yShoreline) / (ySolid - yShoreline);
            yFalloff = Math.pow(t, 1.25);
          } else {
            yFalloff = 0;
          }

          // Abasta tot l'ample de la pantalla de vora a vora sense caixes
          let xFalloff = 1.0;
          if (nx < 0.015) {
            xFalloff = nx / 0.015;
          } else if (nx > 0.985) {
            xFalloff = (1.0 - nx) / 0.015;
          }

          const base = yFalloff * xFalloff;
          if (base <= 0.002) {
            s.heightmap[i] = 0;
            continue;
          }

          let depth = base * 5.2;

          // Rínxols de l'onatge i marques de marea horitzontals
          const tideRipples = 0.26 * Math.sin(ny * 20.0 + shoreWarp * 10.0) * base;
          const beachContour = Math.sin((ny * 2.2 + nx * 0.35) * Math.PI * 2) * 0.15 * base;
          depth += tideRipples + beachContour;

          // Grans d'arena de platja
          const flecks = s.coarseNoise[i] > 0.8 ? s.coarseNoise[i] * 0.22 * base : 0;
          depth = Math.max(0, depth * (0.96 + s.coarseNoise[i] * 0.08) + flecks);

          s.heightmap[i] = depth;
        }
      }
    }
  }, []);

  const sweep = useCallback(
    (points: StrokePoint[]) => {
      const s = stateRef.current;
      if (!s.heightmap || points.length < 2) return;

      const brushRadius = (s.brush * s.dpr) / s.scale;

      for (let step = 1; step < points.length; step++) {
        const p0 = points[step - 1];
        const p1 = points[step];

        const x0 = clamp(p0.x, 0, 1) * s.gridW;
        const y0 = clamp(p0.y, 0, 1) * s.gridH;
        const dx = clamp(p1.x, 0, 1) * s.gridW - x0;
        const dy = clamp(p1.y, 0, 1) * s.gridH - y0;

        const dist = Math.hypot(dx, dy);
        const subSteps = Math.max(1, Math.ceil(dist / (brushRadius * 0.23)));
        const dt = Math.max(1, (p1.time ?? 16) - (p0.time ?? 0));
        const speed = clamp(((dist * s.scale) / dt) * 2, 0.3, 12);

        for (let j = 1; j <= subSteps; j++) {
          const cx = x0 + (dx * j) / subSteps;
          const cy = y0 + (dy * j) / subSteps;
          const sx = dx / subSteps;
          const sy = dy / subSteps;

          const hyp = Math.hypot(sx, sy);
          if (hyp < 0.001) continue;
          const uX = sx / hyp;
          const uY = sy / hyp;

          const minX = Math.max(1, Math.floor(cx - brushRadius));
          const maxX = Math.min(s.gridW - 2, Math.ceil(cx + brushRadius));
          const minY = Math.max(1, Math.floor(cy - brushRadius));
          const maxY = Math.min(s.gridH - 2, Math.ceil(cy + brushRadius));

          s.strokeCount++;
          const displaced: [number, number, number][] = [];

          for (let py = minY; py <= maxY; py++) {
            for (let px = minX; px <= maxX; px++) {
              const rx = px - cx;
              const ry = py - cy;
              const across = -rx * uY + ry * uX;
              const along = rx * uX + ry * uY;

              const idx = py * s.gridW + px;
              const mass = s.heightmap[idx];
              if (mass < 0.035) continue;

              const edge = brushRadius * (0.88 + 0.055 * Math.sin(across * 0.71) + 0.04 * Math.sin(across * 1.89));
              const shape = (across * across) / (edge * edge) + (along * along) / (brushRadius * brushRadius * 0.48);
              if (shape > 1) continue;

              const bristle = Math.pow(0.5 + 0.5 * Math.sin(across * 2.8), 12);
              const residue = 0.015 + bristle * 0.115;
              const force = clamp((1 - shape) * 9, 0, 1);
              const moved = Math.max(0, mass - residue) * force;
              if (moved < 0.015) continue;

              s.heightmap[idx] -= moved;

              const r1 = random(idx + s.strokeCount * 13);
              const r2 = random(idx + s.strokeCount * 27 + 400);
              const front = brushRadius * 0.64 * Math.sqrt(Math.max(0, 1 - (across / brushRadius) ** 2));
              const reach = front + 3 + r1 * r1 * brushRadius * 0.9 + Math.min(speed, 5) * r2 * 1.5;
              const lateral = across * 1.09 + (r2 - 0.5) * brushRadius * 0.28;

              displaced.push([cx + uX * reach - uY * lateral, cy + uY * reach + uX * lateral, moved]);

              if (speed > 1.5 && r1 > 0.995 && s.particles.length < 140) {
                s.particles.push({
                  x: px * s.scale,
                  y: py * s.scale,
                  z: 1,
                  vx: uX * speed * 0.5 + (r2 - 0.5),
                  vy: uY * speed * 0.5 + (r1 - 0.5),
                  vz: 1 + Math.min(speed * 0.17, 2.4),
                  r: 0.8 + r2 * 0.7,
                  color: r2 > 0.5 ? "#eedebc" : "#bfb08e",
                });
              }
            }
          }

          for (const d of displaced) {
            deposit(d[0], d[1], d[2]);
          }
        }
      }

      s.needsRedraw = true;
      s.settleTime = 18;
      startTicker();
    },
    [deposit]
  );

  const onTick = useCallback(
    (_time: number, delta: number) => {
      const s = stateRef.current;
      const step = Math.min(Math.max(delta, 16.7), 32) / 16.7;

      if (s.particles.length) {
        s.particles = s.particles.filter((pt) => {
          pt.x += pt.vx * step;
          pt.y += pt.vy * step;
          pt.z += pt.vz * step;
          pt.vx *= Math.pow(0.91, step);
          pt.vy *= Math.pow(0.91, step);
          pt.vz -= 0.34 * step;

          if (pt.z <= 0) {
            deposit(pt.x / s.scale, pt.y / s.scale, 0.07);
            return false;
          }
          return true;
        });
        s.needsRedraw = true;
      }

      if (s.settleTime > 0) {
        flowSand();
        s.settleTime -= step;
        s.needsRedraw = true;
      }

      if (s.needsRedraw) {
        draw();
      }

      if (!s.particles.length && s.settleTime <= 0) {
        stopTicker();
      }
    },
    [deposit, draw, flowSand]
  );

  const startTicker = useCallback(() => {
    const s = stateRef.current;
    if (!s.isTicking) {
      s.isTicking = true;
      gsap.ticker.add(onTick);
    }
  }, [onTick]);

  const stopTicker = useCallback(() => {
    const s = stateRef.current;
    if (s.isTicking) {
      s.isTicking = false;
      gsap.ticker.remove(onTick);
    }
  }, [onTick]);

  const initCanvas = useCallback(() => {
    const container = containerRef.current;
    const canvas = canvasRef.current;
    if (!container || !canvas) return;

    const s = stateRef.current;
    const rect = container.getBoundingClientRect();
    const w = container.clientWidth || rect.width || 480;
    const h = container.clientHeight || rect.height || 400;

    // Evitar reinicialitzacions innecessàries si les dimensions no han canviat
    if (Math.abs(w - s.lastW) < 2 && Math.abs(h - s.lastH) < 2 && s.heightmap) {
      return;
    }
    s.lastW = w;
    s.lastH = h;

    const isMobile = w <= 768 || (w < 860 && w < h);
    s.isMobile = isMobile;
    const brush = isMobile ? Math.min(brushSize, 65) : brushSize;
    s.brush = clamp(brush, 24, 140);

    const dpr = Math.min(1.25, window.devicePixelRatio || 1, 1200 / Math.max(w, h));
    const width = Math.max(1, Math.round(w * dpr));
    const height = Math.max(1, Math.round(h * dpr));
    const scale = 2 * dpr;
    const gridW = Math.ceil(width / scale);
    const gridH = Math.ceil(height / scale);

    s.dpr = dpr;
    s.width = width;
    s.height = height;
    s.scale = scale;
    s.gridW = gridW;
    s.gridH = gridH;

    canvas.width = width;
    canvas.height = height;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    s.ctx = ctx;

    s.heightmap = new Float32Array(gridW * gridH);
    s.slopes = new Float32Array(gridW * gridH);
    s.coarseNoise = new Float32Array(gridW * gridH);
    s.pixelNoise = new Float32Array(width * height);
    s.imageData = ctx.createImageData(width, height);

    for (let i = 0; i < s.coarseNoise.length; i++) {
      s.coarseNoise[i] = random(i);
    }
    for (let i = 0; i < s.pixelNoise.length; i++) {
      s.pixelNoise[i] = random(i + 8117);
    }

    fillDunes();
    s.particles = [];
    s.settleTime = 0;
    s.needsRedraw = true;

    // Traç inicial subtil i orgànic sobre "Si vols" per convidar a apartar l'arena
    if (starterCue) {
      const subtitle = container.querySelector(".contacte-subtitle");

      let startX = isMobile ? 0.14 : 0.10;
      let startY = isMobile ? 0.46 : 0.28;

      if (subtitle) {
        const cRect = container.getBoundingClientRect();
        const sRect = subtitle.getBoundingClientRect();
        if (cRect.width > 0 && cRect.height > 0) {
          startX = clamp((sRect.left - cRect.left + 35) / cRect.width, 0.05, 0.40);
          startY = clamp((sRect.top - cRect.top + 30) / cRect.height, 0.10, 0.65);
        }
      }

      const p1: StrokePoint = { x: startX, y: startY, time: 0 };
      const p2: StrokePoint = { x: startX + (isMobile ? 0.20 : 0.12), y: startY + 0.02, time: 100 };
      const p3: StrokePoint = { x: startX + (isMobile ? 0.32 : 0.22), y: startY - 0.01, time: 200 };

      sweep([p1, p2, p3]);
      for (let i = 0; i < 4; i++) {
        flowSand();
      }
    }

    draw();
  }, [draw, fillDunes, flowSand, starterCue, sweep]);

  // Pointer event helpers
  const getCanvasCoords = useCallback((e: React.PointerEvent): StrokePoint => {
    const canvas = canvasRef.current;
    if (!canvas) return { x: 0, y: 0 };
    const rect = canvas.getBoundingClientRect();
    return {
      x: (e.clientX - rect.left) / rect.width,
      y: (e.clientY - rect.top) / rect.height,
      time: e.timeStamp,
    };
  }, []);

  const handlePointerDown = (e: React.PointerEvent<HTMLCanvasElement>) => {
    if (e.button !== 0) return;
    const canvas = canvasRef.current;
    if (!canvas) return;

    canvas.setPointerCapture(e.pointerId);
    stateRef.current.pointerId = e.pointerId;
    stateRef.current.dragStart = { x: e.clientX, y: e.clientY };
    const pt = getCanvasCoords(e);
    stateRef.current.lastPointer = pt;
    setIsBrushing(true);
  };

  const handlePointerMove = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const s = stateRef.current;
    const canvas = canvasRef.current;
    if (!canvas) return;

    if (e.pointerId === s.pointerId && s.lastPointer) {
      // Actively brushing/dragging sand
      const currentPt = getCanvasCoords(e);
      sweep([s.lastPointer, currentPt]);
      s.lastPointer = currentPt;
    } else if (s.pointerId === null) {
      // Hovering: check if cursor is over a cleared link area or empty area
      const pt = getCanvasCoords(e);
      const sandAmount = sample(pt.x * s.gridW, pt.y * s.gridH);
      if (sandAmount < 0.25) {
        const elements = document.elementsFromPoint(e.clientX, e.clientY);
        const anchor = elements.find((el) => el.tagName === "A" || el.closest("a"));
        if (anchor) {
          canvas.style.cursor = "pointer";
          return;
        }
        // If there is no sand at all under cursor (e.g. over the photo on the right)
        if (sandAmount < 0.05) {
          canvas.style.cursor = "default";
          return;
        }
      }
      canvas.style.cursor = "crosshair";
    }
  };

  const handlePointerUp = (e: React.PointerEvent<HTMLCanvasElement>) => {
    const s = stateRef.current;
    const canvas = canvasRef.current;

    // Check if it was a quick tap/click rather than a drag stroke
    if (s.dragStart) {
      const dist = Math.hypot(e.clientX - s.dragStart.x, e.clientY - s.dragStart.y);
      if (dist < 8) {
        const pt = getCanvasCoords(e);
        const sandAmount = sample(pt.x * s.gridW, pt.y * s.gridH);
        // Only trigger underlying link if sand has been cleared over that spot
        if (sandAmount < 0.4) {
          const elements = document.elementsFromPoint(e.clientX, e.clientY);
          const anchor = elements.find((el) => el.tagName === "A" || el.closest("a")) as HTMLAnchorElement | undefined;
          const targetLink = anchor?.tagName === "A" ? anchor : (anchor?.closest("a") as HTMLAnchorElement | null);
          if (targetLink && targetLink.href) {
            if (targetLink.target === "_blank") {
              window.open(targetLink.href, "_blank", "noopener,noreferrer");
            } else {
              targetLink.click();
            }
          }
        }
      }
    }

    if (canvas && s.pointerId !== null && canvas.hasPointerCapture(s.pointerId)) {
      canvas.releasePointerCapture(s.pointerId);
    }
    s.pointerId = null;
    s.lastPointer = null;
    s.dragStart = null;
    setIsBrushing(false);
  };

  useEffect(() => {
    initCanvas();

    const container = containerRef.current;
    if (!container) return;

    const resizeObserver = new ResizeObserver(() => {
      initCanvas();
    });
    resizeObserver.observe(container);

    return () => {
      resizeObserver.disconnect();
      stopTicker();
    };
  }, [initCanvas, stopTicker]);

  return (
    <div
      ref={containerRef}
      className={`sand-reveal-container ${isBrushing ? "is-brushing" : ""} ${className}`}
    >
      {/* The original content: black text on white background */}
      <div className="sand-reveal-content">
        {children}
      </div>

      {/* The interactive physical sand canvas placed directly over the text */}
      <canvas
        ref={canvasRef}
        className={`sand-reveal-canvas ${isBrushing ? "is-brushing" : ""}`}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
        aria-label="Efecte interactiu d'arena. Arrossega el cursor per apartar l'arena i descobrir el text."
      />
    </div>
  );
}
