'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import * as THREE from 'three';
import gsap from 'gsap';
import './prova.css';

const VERTEX_SHADER = /* glsl */ `
  varying vec2 vUv;
  void main() {
    vUv = uv;
    gl_Position = vec4(position, 1.0);
  }
`;

const FRAGMENT_SHADER = /* glsl */ `
  precision highp float;

  varying vec2 vUv;

  uniform sampler2D uTexture;
  uniform vec2 uResolution;
  uniform vec2 uImageSize;
  uniform float uZoom;
  uniform float uPixelSize;
  uniform float uDitherMix;
  uniform float uGridAlpha;
  uniform float uTime;
  uniform float uScanBoost;

  // Matriu de Bayer recursiva 8x8 sense indexació dinàmica d'arrays (100% compatible mòbil/WebGL1)
  float bayer2(vec2 a) {
    a = floor(a);
    return fract(a.x * 0.5 + a.y * a.y * 0.75);
  }

  float bayer4(vec2 a) {
    return bayer2(0.5 * a) * 0.25 + bayer2(a);
  }

  float bayer8(vec2 a) {
    return bayer4(0.5 * a) * 0.25 + bayer2(a);
  }

  // Càlcul d'UVs estil object-fit: cover centrat lleugerament cap al rostre (y = 0.56)
  vec2 getCoverUv(vec2 screenUv, float zoom) {
    float screenAspect = uResolution.x / max(1.0, uResolution.y);
    float imageAspect = uImageSize.x / max(1.0, uImageSize.y);

    vec2 scale = vec2(1.0);
    if (screenAspect > imageAspect) {
      scale.y = imageAspect / screenAspect;
    } else {
      scale.x = screenAspect / imageAspect;
    }

    vec2 focus = vec2(0.5, 0.58);
    vec2 centered = (screenUv - 0.5) / max(1.0, zoom);
    vec2 uv = centered * scale + focus;
    return clamp(uv, 0.001, 0.999);
  }

  void main() {
    vec2 fragCoord = vUv * uResolution;

    // Quantització en cel·les de píxels per a l'efecte "Close-Up Look"
    float px = max(1.0, uPixelSize);
    vec2 cellIndex = floor(fragCoord / px);
    vec2 cellCenterCoord = (cellIndex + 0.5) * px;
    vec2 cellScreenUv = cellCenterCoord / uResolution;

    vec2 sampleUv = getCoverUv(cellScreenUv, uZoom);
    vec2 crispUv = getCoverUv(vUv, uZoom);

    vec3 quantizedColor = texture2D(uTexture, sampleUv).rgb;
    vec3 fullColor = texture2D(uTexture, crispUv).rgb;

    float lum = dot(quantizedColor, vec3(0.299, 0.587, 0.114));
    // Lleuger contrast editorial + pols subtil en fase de primer pla
    float scanWave = sin(cellIndex.y * 0.45 - uTime * 3.2) * 0.045 * uScanBoost;
    float adjustedLum = clamp((lum - 0.5) * 1.18 + 0.5 + scanWave, 0.0, 1.0);

    // Matriu ordenada Bayer 8x8 aplicada a les cel·les
    float threshold = bayer8(mod(cellIndex, 8.0));
    float bw = step(threshold, adjustedLum);

    vec3 inkBlack = vec3(0.031, 0.031, 0.028);   // #080807
    vec3 paperCream = vec3(0.957, 0.949, 0.925); // #f4f2ec
    vec3 ditheredColor = mix(inkBlack, paperCream, bw);

    // Dibuixar línies fines de la graella quan els píxels són grans en primer pla
    vec2 cellLocal = fract(fragCoord / px);
    float edgeDist = min(min(cellLocal.x, 1.0 - cellLocal.x), min(cellLocal.y, 1.0 - cellLocal.y));
    float borderPx = edgeDist * px;
    float gridLine = 1.0 - smoothstep(0.0, 1.4, borderPx);
    vec3 gridColor = mix(vec3(0.22), vec3(0.14), bw);
    ditheredColor = mix(ditheredColor, gridColor, gridLine * uGridAlpha);

    // Transició progressiva cap a la fotografia nítida a pantalla completa
    vec3 finalColor = mix(fullColor, ditheredColor, clamp(uDitherMix, 0.0, 1.0));

    gl_FragColor = vec4(finalColor, 1.0);
  }
`;

export default function ProvaClient() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const uniformsRef = useRef<{
    uZoom: { value: number };
    uPixelSize: { value: number };
    uDitherMix: { value: number };
    uGridAlpha: { value: number };
    uScanBoost: { value: number };
  } | null>(null);

  const [isFinished, setIsFinished] = useState(false);

  const playAnimation = useCallback(() => {
    const uniforms = uniformsRef.current;
    if (!uniforms) return;

    if (tlRef.current) {
      tlRef.current.kill();
    }

    setIsFinished(false);
    if (ctaRef.current) {
      gsap.set(ctaRef.current, { opacity: 0, y: 22 });
    }

    // Estat inicial "Close-Up Look" (zoom fort, píxels gegants, trama Bayer 8x8 pura)
    uniforms.uZoom.value = 5.4;
    uniforms.uPixelSize.value = 34.0;
    uniforms.uDitherMix.value = 1.0;
    uniforms.uGridAlpha.value = 0.42;
    uniforms.uScanBoost.value = 1.0;

    const tl = gsap.timeline({
      onComplete: () => {
        setIsFinished(true);
        if (ctaRef.current) {
          gsap.fromTo(
            ctaRef.current,
            { opacity: 0, y: 24 },
            { opacity: 1, y: 0, duration: 0.75, ease: 'power3.out' }
          );
        }
      }
    });

    tlRef.current = tl;

    // 1. Pausa breu mostrant la trama Bayer en primer pla animada (0.0s -> 0.85s)
    tl.to(uniforms.uPixelSize, { value: 22.0, duration: 0.85, ease: 'power1.inOut' }, 0);

    // 2. Desplaçament progressiu de càmera cap enrere fins a pantalla completa + resolució gradual
    tl.to(
      uniforms.uZoom,
      {
        value: 1.0,
        duration: 2.55,
        ease: 'power3.inOut'
      },
      0.55
    );

    tl.to(
      uniforms.uPixelSize,
      {
        value: 6.0,
        duration: 1.4,
        ease: 'power2.inOut'
      },
      0.85
    );

    tl.to(
      uniforms.uPixelSize,
      {
        value: 1.0,
        duration: 1.1,
        ease: 'power2.out'
      },
      2.25
    );

    tl.to(
      uniforms.uGridAlpha,
      {
        value: 0.0,
        duration: 1.4,
        ease: 'power2.out'
      },
      1.15
    );

    tl.to(
      uniforms.uScanBoost,
      {
        value: 0.0,
        duration: 1.1,
        ease: 'power2.out'
      },
      1.5
    );

    // 3. Fosa final del patró de trama Bayer cap a la fotografia nítida a pantalla completa
    tl.to(
      uniforms.uDitherMix,
      {
        value: 0.0,
        duration: 1.15,
        ease: 'power2.inOut'
      },
      2.45
    );
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let rafId = 0;
    let isDisposed = false;

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: false,
      powerPreference: 'high-performance'
    });
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    renderer.setPixelRatio(dpr);
    renderer.setSize(window.innerWidth, window.innerHeight, false);

    const scene = new THREE.Scene();
    const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0, 1);

    const uniforms = {
      uTexture: { value: null as THREE.Texture | null },
      uResolution: {
        value: new THREE.Vector2(window.innerWidth, window.innerHeight)
      },
      uImageSize: { value: new THREE.Vector2(1920, 1280) },
      uZoom: { value: 5.4 },
      uPixelSize: { value: 34.0 },
      uDitherMix: { value: 1.0 },
      uGridAlpha: { value: 0.42 },
      uTime: { value: 0.0 },
      uScanBoost: { value: 1.0 }
    };

    uniformsRef.current = uniforms;

    const geometry = new THREE.PlaneGeometry(2, 2);
    const material = new THREE.ShaderMaterial({
      vertexShader: VERTEX_SHADER,
      fragmentShader: FRAGMENT_SHADER,
      uniforms,
      depthTest: false,
      depthWrite: false
    });

    const quad = new THREE.Mesh(geometry, material);
    scene.add(quad);

    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load(
      '/images/miquel-gil-juan-miguel-morales-14-scaled.jpg',
      (tex) => {
        if (isDisposed) return;
        tex.minFilter = THREE.LinearFilter;
        tex.magFilter = THREE.LinearFilter;
        tex.wrapS = THREE.ClampToEdgeWrapping;
        tex.wrapT = THREE.ClampToEdgeWrapping;

        const img = tex.image as HTMLImageElement | undefined;
        if (img && img.naturalWidth && img.naturalHeight) {
          uniforms.uImageSize.value.set(img.naturalWidth, img.naturalHeight);
        }

        uniforms.uTexture.value = tex;
        playAnimation();
      }
    );

    const onResize = () => {
      const nextDpr = Math.min(window.devicePixelRatio || 1, 2);
      renderer.setPixelRatio(nextDpr);
      renderer.setSize(window.innerWidth, window.innerHeight, false);
      uniforms.uResolution.value.set(window.innerWidth, window.innerHeight);
    };

    window.addEventListener('resize', onResize);

    const startTime = performance.now();
    const render = (now: number) => {
      if (isDisposed) return;
      rafId = requestAnimationFrame(render);
      uniforms.uTime.value = (now - startTime) * 0.001;
      if (uniforms.uTexture.value) {
        renderer.render(scene, camera);
      }
    };

    rafId = requestAnimationFrame(render);

    return () => {
      isDisposed = true;
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', onResize);
      if (tlRef.current) tlRef.current.kill();
      texture.dispose();
      geometry.dispose();
      material.dispose();
      renderer.dispose();
    };
  }, [playAnimation]);

  return (
    <main className="prova-screen">
      <canvas
        ref={canvasRef}
        className="prova-canvas"
        aria-label="Retrat animat de Miquel Gil en tramat ordenat Bayer"
      />
      <div className="prova-vignette" aria-hidden="true" />

      <div
        ref={ctaRef}
        className={`prova-cta-wrap ${isFinished ? 'is-ready' : ''}`}
      >
        <Link href="/discografia/" className="prova-enter-btn">
          <span>Entrar a la Web</span>
          <span aria-hidden="true">↗</span>
        </Link>

        <button
          type="button"
          onClick={playAnimation}
          className="prova-replay-btn"
        >
          Repetir animació
        </button>
      </div>
    </main>
  );
}
