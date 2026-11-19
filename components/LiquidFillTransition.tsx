"use client";

import React, {
  useEffect,
  useRef,
  useImperativeHandle,
  forwardRef,
  useCallback,
  useState,
} from "react";
import * as THREE from "three";
import gsap from "gsap";
import "./LiquidFillTransition.css";

export interface LiquidFillTransitionHandle {
  trigger: (originX?: number, originY?: number, onComplete?: () => void) => void;
  reset: () => void;
}

export interface LiquidFillTransitionProps {
  color?: string; // Default: "#050505"
  duration?: number; // In seconds, default: 0.85
  className?: string;
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

  #define NUM_DROPLETS 14

  uniform vec2  uResolution;
  uniform float uTime;
  uniform float uProgress;
  uniform vec2  uOrigin;
  uniform vec3  uColor;
  uniform vec2  uDropletOffsets[NUM_DROPLETS];
  uniform vec2  uDropletVelocities[NUM_DROPLETS];
  uniform float uDropletSizes[NUM_DROPLETS];

  varying vec2 vUv;

  // Polynomial smooth minimum (Inigo Quilez) per a la fusió de metaballs líquids
  float smin(float a, float b, float k) {
    float h = max(k - abs(a - b), 0.0) / k;
    return min(a, b) - h * h * h * k * (1.0 / 6.0);
  }

  // Value noise per a la tensió superficial i ondulació orgànica del fluid
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
    if (uProgress <= 0.0001) {
      discard;
    }

    float aspect = uResolution.x / uResolution.y;
    vec2 p = vec2(vUv.x * aspect, vUv.y);
    vec2 origin = vec2(uOrigin.x * aspect, uOrigin.y);

    float smoothing = 0.28;

    // 1. Blob primari que brolla directament des de la posició del botó d'entrada
    float rOrigin = uProgress * 2.3;
    float field = length(p - origin) - rOrigin;

    // 2. Clúster de gotes i filaments líquids secundaris que es projecten cap amunt i en ventall
    for (int i = 0; i < NUM_DROPLETS; i++) {
      float tDrop = pow(uProgress, 0.72);
      vec2 dropPos = origin + uDropletOffsets[i] + uDropletVelocities[i] * tDrop;
      dropPos.x *= aspect;

      // Creixement i expansió dinàmica de cada gota amb tensió superficial
      float dropR = uDropletSizes[i] * (uProgress * 1.85 + sin(uProgress * 3.14159) * 0.45);
      float dDrop = length(p - dropPos) - dropR;
      field = smin(field, dDrop, smoothing);
    }

    // 3. Marea d'inundació que ascendeix des de la base amb ondulació sinusoïdal
    float waveBase = (uProgress * 1.55) - 0.28;
    float waveDist = p.y - waveBase;
    waveDist -= sin(p.x * 3.8 + uTime * 2.5) * 0.06 * (1.0 - uProgress);
    waveDist -= sin(p.x * 7.2 - uTime * 1.8) * 0.03 * (1.0 - uProgress);
    field = smin(field, waveDist, smoothing);

    // 4. Marea superior secundària per assegurar cobertura 100% hermètica als vèrtexs
    float topWaveBase = 1.0 + 0.28 - (uProgress * 1.55);
    float topWaveDist = topWaveBase - p.y;
    if (uProgress > 0.45) {
      float topP = (uProgress - 0.45) / 0.55;
      topWaveDist -= sin(p.x * 4.5 + uTime * 2.2) * 0.05 * (1.0 - topP);
      field = smin(field, topWaveDist, smoothing);
    }

    // 5. Ondulació orgànica del límit líquid (soroll procedural de vora viva)
    vec2 noiseUv = p * 4.5 + vec2(uTime * 0.65, uTime * 0.45);
    float wobble = (noise2D(noiseUv) - 0.5) * 0.16 * (1.0 - uProgress * 0.85);
    field += wobble;

    // 6. Feathering suau a la vora del fluid
    float feather = 0.012;
    float alpha = smoothstep(feather, -feather, field);

    if (alpha <= 0.001) {
      discard;
    }

    // Subtil reflex especular a la vora de tensió superficial del líquid
    float rim = smoothstep(0.045, 0.0, abs(field)) * (1.0 - uProgress);
    vec3 finalColor = mix(uColor, uColor + vec3(0.08, 0.08, 0.08), rim * 0.6);

    gl_FragColor = vec4(finalColor, alpha);
  }
`;

const LiquidFillTransition = forwardRef<LiquidFillTransitionHandle, LiquidFillTransitionProps>(
  ({ color = "#050505", duration = 0.85, className = "" }, ref) => {
    const canvasRef = useRef<HTMLCanvasElement | null>(null);
    const fallbackRef = useRef<HTMLDivElement | null>(null);
    const [useFallback, setUseFallback] = useState<boolean>(false);

    const animStateRef = useRef<{ progress: number }>({ progress: 0 });
    const uniformsRef = useRef<any>(null);
    const rendererRef = useRef<THREE.WebGLRenderer | null>(null);
    const sceneRef = useRef<THREE.Scene | null>(null);
    const cameraRef = useRef<THREE.OrthographicCamera | null>(null);
    const meshRef = useRef<THREE.Mesh | null>(null);
    const tweenRef = useRef<gsap.core.Tween | null>(null);
    const isRunningRef = useRef<boolean>(false);

    // Parse color
    const parseColor = useCallback((hex: string) => {
      let clean = hex.replace("#", "");
      if (clean.length === 3) {
        clean = clean[0] + clean[0] + clean[1] + clean[1] + clean[2] + clean[2];
      }
      return new THREE.Vector3(
        parseInt(clean.slice(0, 2), 16) / 255,
        parseInt(clean.slice(2, 4), 16) / 255,
        parseInt(clean.slice(4, 6), 16) / 255
      );
    }, []);

    useEffect(() => {
      const canvas = canvasRef.current;
      if (!canvas) return;

      // Verificació segura de context WebGL
      let gl: WebGLRenderingContext | WebGL2RenderingContext | null = null;
      try {
        gl = (canvas.getContext("webgl2") ||
          canvas.getContext("webgl") ||
          canvas.getContext("experimental-webgl")) as any;
      } catch (_) {
        gl = null;
      }

      if (!gl) {
        setUseFallback(true);
        return;
      }

      let renderer: THREE.WebGLRenderer | null = null;
      try {
        renderer = new THREE.WebGLRenderer({
          canvas,
          alpha: true,
          antialias: false,
          powerPreference: "high-performance",
        });
        renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
        renderer.setClearColor(0x000000, 0);
        rendererRef.current = renderer;
      } catch (err) {
        console.warn("LiquidFillTransition WebGL initialization fallback:", err);
        setUseFallback(true);
        return;
      }

      const scene = new THREE.Scene();
      sceneRef.current = scene;

      const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);
      cameraRef.current = camera;

      const geometry = new THREE.PlaneGeometry(2, 2);

      // Precalcular velocitats i trajectòries orgàniques de les 14 gotes de líquid
      const dropletOffsets: THREE.Vector2[] = [];
      const dropletVelocities: THREE.Vector2[] = [];
      const dropletSizes: number[] = [
        0.32, 0.28, 0.35, 0.25, 0.38, 0.30, 0.26, 0.34, 0.29, 0.36, 0.27, 0.33, 0.24, 0.31,
      ];

      // Dispersió en ventall cap amunt i laterals
      const angles = [
        -0.85, -0.65, -0.45, -0.28, -0.12, 0.05, 0.22, 0.40, 0.60, 0.80, -0.38, 0.32, -0.15, 0.18,
      ];
      const speeds = [
        1.15, 1.28, 1.45, 1.55, 1.62, 1.58, 1.52, 1.48, 1.35, 1.20, 1.38, 1.42, 1.60, 1.50,
      ];

      for (let i = 0; i < 14; i++) {
        dropletOffsets.push(
          new THREE.Vector2((Math.random() - 0.5) * 0.12, (Math.random() - 0.5) * 0.05)
        );
        const ang = angles[i];
        const spd = speeds[i];
        dropletVelocities.push(new THREE.Vector2(Math.sin(ang) * spd * 0.75, Math.cos(ang) * spd));
      }

      const uniforms = {
        uResolution: { value: new THREE.Vector2(window.innerWidth, window.innerHeight) },
        uTime: { value: 0 },
        uProgress: { value: 0 },
        uOrigin: { value: new THREE.Vector2(0.5, 0.12) },
        uColor: { value: parseColor(color) },
        uDropletOffsets: { value: dropletOffsets },
        uDropletVelocities: { value: dropletVelocities },
        uDropletSizes: { value: dropletSizes },
      };
      uniformsRef.current = uniforms;

      const material = new THREE.ShaderMaterial({
        vertexShader,
        fragmentShader,
        uniforms,
        transparent: true,
        depthWrite: false,
      });

      const mesh = new THREE.Mesh(geometry, material);
      meshRef.current = mesh;
      scene.add(mesh);

      const handleResize = () => {
        if (!rendererRef.current) return;
        const w = window.innerWidth;
        const h = window.innerHeight;
        rendererRef.current.setSize(w, h);
        uniforms.uResolution.value.set(w, h);
      };

      handleResize();
      window.addEventListener("resize", handleResize);

      // Render loop
      let animId = 0;
      const render = (time: number) => {
        if (
          rendererRef.current &&
          sceneRef.current &&
          cameraRef.current &&
          (isRunningRef.current || uniforms.uProgress.value > 0)
        ) {
          uniforms.uTime.value = time * 0.001;
          uniforms.uProgress.value = animStateRef.current.progress;
          rendererRef.current.render(sceneRef.current, cameraRef.current);
        }
        animId = requestAnimationFrame(render);
      };
      animId = requestAnimationFrame(render);

      return () => {
        cancelAnimationFrame(animId);
        window.removeEventListener("resize", handleResize);
        if (tweenRef.current) tweenRef.current.kill();
        geometry.dispose();
        material.dispose();
        if (rendererRef.current) {
          rendererRef.current.forceContextLoss();
          rendererRef.current.dispose();
        }
      };
    }, [color, parseColor]);

    useImperativeHandle(ref, () => ({
      trigger: (originX = 0.5, originY = 0.88, onComplete) => {
        if (tweenRef.current) {
          tweenRef.current.kill();
        }

        isRunningRef.current = true;
        animStateRef.current.progress = 0;

        if (useFallback || !rendererRef.current) {
          // Fallback CSS/SVG fluid overlay
          if (fallbackRef.current) {
            fallbackRef.current.style.opacity = "1";
            fallbackRef.current.style.transform = "scale(1)";
          }
          tweenRef.current = gsap.to(animStateRef.current, {
            progress: 1,
            duration,
            ease: "power2.inOut",
            onComplete: () => {
              if (onComplete) onComplete();
            },
          });
          return;
        }

        if (uniformsRef.current) {
          uniformsRef.current.uOrigin.value.set(originX, 1.0 - originY);
        }

        tweenRef.current = gsap.to(animStateRef.current, {
          progress: 1,
          duration,
          ease: "power2.inOut",
          onUpdate: () => {
            if (uniformsRef.current) {
              uniformsRef.current.uProgress.value = animStateRef.current.progress;
            }
          },
          onComplete: () => {
            if (onComplete) {
              onComplete();
            }
          },
        });
      },
      reset: () => {
        if (tweenRef.current) tweenRef.current.kill();
        animStateRef.current.progress = 0;
        if (uniformsRef.current) {
          uniformsRef.current.uProgress.value = 0;
        }
        isRunningRef.current = false;
        if (rendererRef.current && sceneRef.current && cameraRef.current) {
          rendererRef.current.clear();
        }
        if (fallbackRef.current) {
          fallbackRef.current.style.opacity = "0";
        }
      },
    }));

    return (
      <>
        <canvas
          ref={canvasRef}
          aria-hidden="true"
          className={`liquid-fill-canvas ${className}`}
        />
        {useFallback && (
          <div
            ref={fallbackRef}
            className="liquid-fill-fallback"
            style={{ backgroundColor: color }}
          />
        )}
      </>
    );
  }
);

LiquidFillTransition.displayName = "LiquidFillTransition";

export default LiquidFillTransition;
