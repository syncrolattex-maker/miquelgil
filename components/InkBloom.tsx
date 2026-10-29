"use client";

import React, { useEffect, useRef } from "react";
import * as THREE from "three";
import gsap from "gsap";
import "./InkBloom.css";

export interface InkBloomProps {
  color?: string; // Core ink color, default: #b80018 (deep vivid blood crimson)
  colorOuter?: string; // Outer glow tint, default: #ff0528 (intense saturated electric red)
  ground?: string; // Background color, default: transparent
  edge?: "top" | "bottom"; // Bloom edge, default: top
  className?: string;
  style?: React.CSSProperties;
  parentRef?: React.RefObject<HTMLElement>; // Optional parent container to track mouse events across
}

const vertexShader = `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

const fragmentShader = `
  precision highp float;

  uniform vec2  uResolution;
  uniform vec3  uColor;
  uniform vec3  uColorOuter;
  uniform int   uEdge;
  uniform float uSpread;
  uniform float uDetail;
  uniform float uDensity;
  uniform vec2  uFocal;
  uniform vec2  uAim;
  uniform vec2  uRoot;
  uniform float uStretch;
  uniform float uTime;
  uniform float uPull;
  uniform float uReach;
  uniform float uZone;
  uniform float uCollapse;

  varying vec2 vUv;

  const float SCALE   = 8.0;
  const float PINCH   = 0.25;
  const float STEEP   = 0.9;
  const float WARP    = 0.6;
  const float RAGGED  = 0.5;
  const float LUMP    = 0.85;
  const float CARVE   = 0.3;
  const float FALLOFF = 1.6;

  const float TONGUE_W = 1.05;
  const float TIP      = 1.25;
  const float BULGE    = 0.12;
  const float ENDS     = 0.4;
  const float FLOW     = 1.0;
  const float WANDER   = 1.6;
  const float CURRENT  = 3.0;
  const float GRADE_LO = 0.12;
  const float GRADE_HI = 0.85;
  const float WISP     = 0.9;
  const float DENSE    = 0.06;
  const float BEND     = 0.6;
  const float FEATHER  = 1.35;
  const float FLOOR    = 0.72;
  const float BREAKUP  = 0.8;
  const float GONE     = 0.75;

  float hash21(vec2 p) {
    p = fract(p * vec2(127.1, 311.7));
    p += dot(p, p + 19.19);
    return fract(p.x * p.y);
  }

  float hashDither(vec2 p) {
    vec3 p3 = fract(vec3(p.xyx) * 0.1031);
    p3 += dot(p3, p3.yzx + 33.33);
    return fract((p3.x + p3.y) * p3.z);
  }

  float valueNoise(vec2 p) {
    vec2 i = floor(p);
    vec2 f = fract(p);
    vec2 u = f * f * (3.0 - 2.0 * f);
    return mix(
      mix(hash21(i),                  hash21(i + vec2(1.0, 0.0)), u.x),
      mix(hash21(i + vec2(0.0, 1.0)), hash21(i + vec2(1.0, 1.0)), u.x),
      u.y
    );
  }

  float fbm(vec2 p) {
    float v = 0.0;
    float a = 0.5;
    mat2  m = mat2(1.6, 1.2, -1.2, 1.6);
    for (int i = 0; i < 5; i++) {
      v += a * valueNoise(p);
      p  = m * p;
      a *= 0.5;
    }
    return v;
  }

  vec2 toLocal(vec2 uv) {
    if (uEdge == 0) return vec2(uv.x, 1.0 - uv.y);
    if (uEdge == 1) return vec2(uv.x, uv.y);
    if (uEdge == 2) return vec2(uv.y, uv.x);
    return vec2(uv.y, 1.0 - uv.x);
  }

  void main() {
    float aspect = uResolution.x / uResolution.y;
    float along  = (uEdge < 2) ? aspect : 1.0 / aspect;
    vec2 p = toLocal(vUv);
    vec2  aim    = toLocal(uAim);
    vec2  root   = toLocal(uRoot);
    float deep   = min(aim.y, uReach);
    float cx     = mix(root.x, aim.x, clamp(p.y / max(deep, 0.001), 0.0, 1.0));
    float da     = (p.x - cx) * along;
    float width  = TONGUE_W * uZone;
    float cusp   = exp(-(da * da) / (width * width));
    float grip   = cusp * uPull;

    vec2  toAim  = vec2((aim.x - p.x) * along, aim.y - p.y);
    float zone   = exp(-dot(toAim, toAim) / (uZone * uZone)) * uPull;
    vec2  lean   = toAim * BEND * zone;
    vec2  pw     = p - vec2(lean.x / along, lean.y);

    vec2 f = toLocal(uFocal);

    float dt     = (pw.x - f.x) * along;
    float waist  = sqrt(dt * dt + PINCH * PINCH);
    float across = (pw.y - f.y) / waist;
    across = across / sqrt(1.0 + (across / STEEP) * (across / STEEP));
    vec2 q = vec2(pw.x * along / uStretch, across) * SCALE;

    float tip    = max(deep / TIP, uSpread + BULGE);
    float ends   = 1.0 - smoothstep(ENDS, 1.0, abs(2.0 * p.x - 1.0));
    float spread = (uSpread + (tip - uSpread) * grip) * ends * (1.0 - uCollapse);
    spread = max(spread, 0.0001);

    vec2 wander = vec2(
      sin(uTime * 0.37) + 0.6 * sin(uTime * 0.83 + 1.7),
      0.3 * sin(uTime * 0.29 + 0.4) + 0.2 * sin(uTime * 0.71 + 2.1)
    );
    vec2 current = vec2(
      valueNoise(q * 0.12 + vec2(uTime * 0.21, 4.2)),
      valueNoise(q * 0.12 + vec2(9.1, -uTime * 0.17))
    ) - 0.5;
    q += (wander * WANDER + current * CURRENT) * FLOW;
    vec2 sway = vec2(uTime, -uTime * 0.6);
    vec2 wv = vec2(
      fbm(q * 0.6 + vec2(3.1, 7.3) + sway),
      fbm(q * 0.6 + vec2(11.7, 2.9) - sway)
    ) - 0.5;
    float strand = smoothstep(0.24, 0.76, fbm(q + WARP * wv));

    float detail = uDetail * (1.0 + WISP * grip) * (1.0 + BREAKUP * uCollapse);
    float x = max(pw.y, 0.0) / spread + ((strand - 0.5) * RAGGED + wv.x * LUMP) * detail;
    x = max(x, 0.0);
    float body = exp(-FALLOFF * pow(x, FEATHER));
    float a = body * (1.0 - CARVE * detail * (1.0 - strand));
    a = clamp(a * (uDensity + DENSE * grip), 0.0, 1.0);
    a = pow(a, 0.82); // Vibrant ink pigment body
    a *= 1.0 - smoothstep(FLOOR, 1.0, p.y);
    a *= 1.0 - smoothstep(GONE, 1.0, uCollapse);

    float tri = hashDither(gl_FragCoord.xy) + hashDither(gl_FragCoord.xy + 37.17) - 1.0;
    a = clamp(a + tri / 255.0 * smoothstep(0.0, 0.02, a), 0.0, 1.0);

    vec3 col = mix(uColorOuter, uColor, smoothstep(GRADE_LO, GRADE_HI, body));
    col = clamp(col * 1.05, 0.0, 1.0);
    gl_FragColor = vec4(col * a, a);
  }
`;

function hexToVec3(hex: string): THREE.Vector3 {
  let c = hex.replace("#", "");
  if (c.length === 3) c = c[0] + c[0] + c[1] + c[1] + c[2] + c[2];
  return new THREE.Vector3(
    parseInt(c.slice(0, 2), 16) / 255,
    parseInt(c.slice(2, 4), 16) / 255,
    parseInt(c.slice(4, 6), 16) / 255
  );
}

export default function InkBloom({
  color = "#b80018",
  colorOuter = "#ff0528",
  ground = "transparent",
  edge = "top",
  className = "",
  style = {},
  parentRef,
}: InkBloomProps) {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    // Use parentRef if provided, otherwise the canvas parent element
    const container = parentRef?.current || canvas.parentElement || canvas;

    let renderer: THREE.WebGLRenderer | null = null;
    try {
      renderer = new THREE.WebGLRenderer({
        canvas,
        antialias: false,
        alpha: true,
        premultipliedAlpha: true,
        powerPreference: "low-power",
      });
    } catch (e) {
      console.warn("WebGL not supported for InkBloom:", e);
      return;
    }

    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setClearColor(0x000000, 0);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
    const geometry = new THREE.PlaneGeometry(2, 2);

    const edgeCode = edge === "top" ? 0 : 1;
    const uniforms = {
      uResolution: { value: new THREE.Vector2(1, 1) },
      uColor: { value: hexToVec3(color) },
      uColorOuter: { value: hexToVec3(colorOuter) },
      uEdge: { value: edgeCode },
      uSpread: { value: 0.35 },
      uDetail: { value: 0.75 },
      uDensity: { value: 0.95 },
      uFocal: { value: new THREE.Vector2(0.98, -0.35) },
      uAim: { value: new THREE.Vector2(0.5, 0.0) },
      uRoot: { value: new THREE.Vector2(0.5, 0.0) },
      uStretch: { value: 6.0 },
      uTime: { value: 0 },
      uPull: { value: 0 },
      uReach: { value: 0.88 },
      uZone: { value: 0.42 },
      uCollapse: { value: 0 },
    };

    const material = new THREE.ShaderMaterial({
      uniforms,
      vertexShader,
      fragmentShader,
      blending: THREE.NoBlending,
    });

    scene.add(new THREE.Mesh(geometry, material));

    // Spring physics controllers
    const aimVec = uniforms.uAim.value;
    const rootVec = uniforms.uRoot.value;
    const createSpring = (obj: any, key: string, stiff: number, damp: number) => ({
      o: obj,
      k: key,
      to: obj[key],
      v: 0,
      stiff,
      c: 2 * Math.sqrt(stiff) * damp,
    });

    const springs = {
      tipX: createSpring(aimVec, "x", 26, 0.72),
      tipY: createSpring(aimVec, "y", 26, 0.72),
      rootX: createSpring(rootVec, "x", 120, 1),
      rootY: createSpring(rootVec, "y", 120, 1),
      pull: createSpring(uniforms.uPull, "value", 34, 1),
    };
    const springList = Object.values(springs);

    const renderScene = () => {
      if (renderer) renderer.render(scene, camera);
    };

    const tick = () => {
      uniforms.uTime.value = 0.2 * gsap.ticker.time;
      renderScene();
    };

    let springsActive = false;
    const flushSprings = () => {
      const dt = 1 / 60;
      let moving = false;
      for (let i = 0; i < springList.length; i++) {
        const s = springList[i];
        const disp = s.o[s.k] - s.to;
        const fSpring = -s.stiff * disp;
        const fDamper = -s.c * s.v;
        const a = fSpring + fDamper;
        s.v += a * dt;
        s.o[s.k] += s.v * dt;
        if (Math.abs(disp) > 0.0005 || Math.abs(s.v) > 0.0005) {
          moving = true;
        } else {
          s.o[s.k] = s.to;
          s.v = 0;
        }
      }
      if (!moving) {
        gsap.ticker.remove(flushSprings);
        springsActive = false;
      }
    };

    const wakeSprings = () => {
      if (!springsActive) {
        springsActive = true;
        gsap.ticker.add(flushSprings);
      }
    };

    const handleResize = () => {
      if (!container || !renderer) return;
      const w = container.clientWidth || window.innerWidth;
      const h = container.clientHeight || 400;
      renderer.setSize(w, h, false);
      uniforms.uResolution.value.set(w, h);
      renderScene();
    };

    const ro = new ResizeObserver(handleResize);
    ro.observe(container);
    handleResize();

    // Mouse interactions
    const handleMouseMove = (e: MouseEvent) => {
      const rect = container.getBoundingClientRect();
      if (!rect.width || !rect.height) return;
      const u = (e.clientX - rect.left) / rect.width;
      const v = 1 - (e.clientY - rect.top) / rect.height;

      // If just entering, snap spring origins to avoid jumping
      if (uniforms.uPull.value < 0.05) {
        springs.tipX.o.x = u;
        springs.tipX.v = 0;
        springs.tipY.o.y = v;
        springs.tipY.v = 0;
        springs.rootX.o.x = u;
        springs.rootX.v = 0;
        springs.rootY.o.y = v;
        springs.rootY.v = 0;
      }

      // Animate springs to cursor position
      springs.tipX.to = u;
      springs.tipY.to = v;
      springs.rootX.to = u;
      springs.rootY.to = v;
      springs.pull.to = 1.0;
      wakeSprings();
    };

    const handleMouseLeave = () => {
      springs.pull.to = 0.0;
      wakeSprings();
    };

    container.addEventListener("mousemove", handleMouseMove);
    container.addEventListener("mouseleave", handleMouseLeave);

    // Ticker starts for fluid ambient drift
    gsap.ticker.add(tick);

    // Pause when out of view
    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        gsap.ticker.add(tick);
      } else {
        gsap.ticker.remove(tick);
      }
    });
    io.observe(container);

    return () => {
      gsap.ticker.remove(tick);
      gsap.ticker.remove(flushSprings);
      container.removeEventListener("mousemove", handleMouseMove);
      container.removeEventListener("mouseleave", handleMouseLeave);
      ro.disconnect();
      io.disconnect();
      geometry.dispose();
      material.dispose();
      if (renderer) {
        renderer.dispose();
        renderer.forceContextLoss();
      }
    };
  }, [color, colorOuter, ground, edge, parentRef]);

  return (
    <canvas
      ref={canvasRef}
      className={`ink-bloom-canvas ${className}`}
      style={style}
      aria-hidden="true"
    />
  );
}
