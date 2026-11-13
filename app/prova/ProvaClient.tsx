'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import * as THREE from 'three';
import gsap from 'gsap';
import './prova.css';

/**
 * Matriu Bayer 4x4 oficial utilitzada per Damar Pramudita (@damarberlari)
 * a "Ordered Dithering - A Close-Up Look" (CodePen LENBEzy / visualizing-dithering-codrops).
 */
const BAYER_4X4 = {
  rows: 4,
  cols: 4,
  data: [
    0, 8, 2, 10,
    12, 4, 14, 6,
    3, 11, 1, 9,
    15, 7, 13, 5,
  ],
};

/**
 * Vertex Shader exacte de Damar Berlari (`visualizing-dithering-codrops/src/Grid/shaders/vertexShader.glsl`).
 * Mode 1: Image Grid
 *   - Comença en escala de grisos continua (imageColor = texture2D(...).r) a zPos inici
 *   - En creuar el llindar a meitat del recorregut Z esdevé dithered monochrome (step(threshold, imageColor))
 *   - Inclou el vorell perimetral negre (borderThreshold)
 * Mode 2: Threshold Map Grid
 *   - Mostra la matriu de llindars Bayer 4x4 en escala de grisos
 *   - S'encongeix a escala 0 quan els cubs de la imatge el travessen
 */
const DAMAR_VERTEX_SHADER = /* glsl */ `
  uniform vec2 uZPositionRange;
  uniform vec2 uCellScaleRange;
  uniform float uAnimationProgress;
  uniform float uAnimationMinDelay;
  uniform float uAnimationMaxDelay;
  uniform float uGridType;     // 1.0 = Image Grid, 2.0 = Threshold Map Grid
  uniform float uFlatShading;  // 0.0 = volum isomètric amb ombra, 1.0 = pla pur en pantalla completa
  uniform float uBorderFade;   // 0.0 = vorell negre visible, 1.0 = vorell fos a pantalla completa
  uniform sampler2D uTexture;

  attribute float aRowIdNormalized;
  attribute float aColumnIdNormalized;
  attribute float aCellIdNormalized;
  attribute float aDitheringThreshold;

  varying vec3 vColor;

  float random(vec2 st) {
    return fract(sin(dot(st.xy, vec2(12.9898, 78.233))) * 43758.5453123);
  }

  void main() {
    // Retard cel·la a cel·la (DELAY_TYPE == 1 a visualizing-dithering-codrops)
    float delayFactor = aCellIdNormalized;

    float animationStart = mix(uAnimationMinDelay, uAnimationMaxDelay, delayFactor);
    float animationDuration = max(0.02, 1.0 - uAnimationMaxDelay);
    float animationEnd = animationStart + animationDuration;

    float localProgress = smoothstep(animationStart, animationEnd, uAnimationProgress);

    // Escala del cub
    float cellScale = max(mix(uCellScaleRange.x, uCellScaleRange.y, localProgress), 0.0);
    vec3 cellLocalPosition = position * cellScale;

    vec4 cellWorldPosition = modelMatrix * instanceMatrix * vec4(cellLocalPosition, 1.0);

    // Posició Z animada
    float zPos = mix(uZPositionRange.x, uZPositionRange.y, localProgress);
    cellWorldPosition.z += zPos;

    gl_Position = projectionMatrix * viewMatrix * cellWorldPosition;

    vec3 baseColor;
    if (uGridType < 1.5) {
      // 1. Image Grid: imatge fotogràfica -> comparació llindar -> dithered 1-bit
      vec4 texVal = texture2D(uTexture, vec2(aColumnIdNormalized, 1.0 - aRowIdNormalized));
      // Lluminositat perceptual estàndard
      float lum = dot(texVal.rgb, vec3(0.299, 0.587, 0.114));
      float imageColor = clamp(lum, 0.0, 1.0);

      float ditheringThreshold = aDitheringThreshold;
      float ditheredColor = step(ditheringThreshold, imageColor);

      // La transformació a dithered succeeix exactament a meitat del recorregut Z (en creuar z=0)
      float colorAnimationStart = animationStart + animationDuration * 0.48;
      float colorAnimationEnd = colorAnimationStart + animationDuration * 0.08;
      float colorAnimationProgress = smoothstep(colorAnimationStart, colorAnimationEnd, uAnimationProgress);

      float finalVal = mix(imageColor, ditheredColor, colorAnimationProgress);

      // Vorell perimetral característic de la làmina de Damar
      float borderThreshold = 0.0055;
      float borderX = step(aColumnIdNormalized, borderThreshold) + step(1.0 - borderThreshold, aColumnIdNormalized);
      float borderY = step(aRowIdNormalized, borderThreshold) + step(1.0 - borderThreshold, aRowIdNormalized);
      float isBorder = clamp(borderX + borderY, 0.0, 1.0) * (1.0 - uBorderFade);

      finalVal = mix(finalVal, 0.0, isBorder);
      baseColor = vec3(finalVal);
    } else {
      // 2. Threshold Map Mode: patró pur de la matriu Bayer 4x4
      baseColor = vec3(aDitheringThreshold);
    }

    // Ombrejat suau de les cares 3D en perspectiva isomètrica (+X, +Y, +Z)
    vec4 modelNormal = modelMatrix * instanceMatrix * vec4(normal, 0.0);
    vec3 norm = normalize(modelNormal.xyz);
    float shadow = dot(normalize(vec3(0.35, 0.45, 0.82)), norm);
    float light = 0.88 + 0.12 * max(shadow, 0.0);
    float finalLight = mix(light, 1.0, uFlatShading);

    vColor = baseColor * finalLight;
  }
`;

/**
 * Fragment Shader exacte de Damar Berlari (`visualizing-dithering-codrops/src/Grid/shaders/fragmentShader.glsl`).
 */
const DAMAR_FRAGMENT_SHADER = /* glsl */ `
  varying vec3 vColor;
  void main() {
    gl_FragColor = vec4(vColor, 1.0);
  }
`;

function createDamarGrid(options: {
  cols: number;
  rows: number;
  cellSize: number;
  cellThickness: number;
  gridType: number;
  zRange: THREE.Vector2;
  scaleRange: THREE.Vector2;
  minDelay: number;
  maxDelay: number;
  texture: THREE.Texture;
}) {
  const {
    cols,
    rows,
    cellSize,
    cellThickness,
    gridType,
    zRange,
    scaleRange,
    minDelay,
    maxDelay,
    texture,
  } = options;

  const count = cols * rows;
  const geometry = new THREE.BoxGeometry(cellSize, cellSize, cellThickness);

  const cellIds = new Float32Array(count);
  const rowIds = new Float32Array(count);
  const colIds = new Float32Array(count);
  const thresholds = new Float32Array(count);

  const bSize = BAYER_4X4.data.length; // 16
  for (let i = 0; i < count; i++) {
    const r = Math.floor(i / cols);
    const c = i % cols;
    cellIds[i] = i / Math.max(1, count - 1);
    rowIds[i] = r / Math.max(1, rows - 1);
    colIds[i] = c / Math.max(1, cols - 1);

    const mRow = r % BAYER_4X4.rows;
    const mCol = c % BAYER_4X4.cols;
    thresholds[i] = BAYER_4X4.data[mCol + mRow * BAYER_4X4.cols] / bSize;
  }

  geometry.setAttribute('aCellIdNormalized', new THREE.InstancedBufferAttribute(cellIds, 1));
  geometry.setAttribute('aRowIdNormalized', new THREE.InstancedBufferAttribute(rowIds, 1));
  geometry.setAttribute('aColumnIdNormalized', new THREE.InstancedBufferAttribute(colIds, 1));
  geometry.setAttribute('aDitheringThreshold', new THREE.InstancedBufferAttribute(thresholds, 1));

  const material = new THREE.ShaderMaterial({
    vertexShader: DAMAR_VERTEX_SHADER,
    fragmentShader: DAMAR_FRAGMENT_SHADER,
    uniforms: {
      uZPositionRange: { value: zRange },
      uCellScaleRange: { value: scaleRange },
      uAnimationProgress: { value: 0 },
      uAnimationMinDelay: { value: minDelay },
      uAnimationMaxDelay: { value: maxDelay },
      uGridType: { value: gridType },
      uFlatShading: { value: 0 },
      uBorderFade: { value: 0 },
      uTexture: { value: texture },
    },
  });

  const mesh = new THREE.InstancedMesh(geometry, material, count);
  mesh.frustumCulled = false;

  const dummy = new THREE.Object3D();
  for (let i = 0; i < count; i++) {
    const r = Math.floor(i / cols);
    const c = i % cols;
    const x = (c - (cols - 1) / 2) * cellSize;
    const y = (-r + (rows - 1) / 2) * cellSize;
    dummy.position.set(x, y, 0);
    dummy.updateMatrix();
    mesh.setMatrixAt(i, dummy.matrix);
  }
  mesh.instanceMatrix.needsUpdate = true;

  return { mesh, geometry, material };
}

export default function ProvaClient() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const ctaRef = useRef<HTMLDivElement>(null);
  const tlRef = useRef<gsap.core.Timeline | null>(null);
  const animRigRef = useRef<{
    imageMat: THREE.ShaderMaterial;
    thresholdMat: THREE.ShaderMaterial;
    fullResMat: THREE.MeshBasicMaterial;
    cameraAnchor: THREE.Group;
    camera: THREE.OrthographicCamera;
    getMetrics: () => { fitIsoZoom: number; coverZoom: number };
  } | null>(null);

  const [isFinished, setIsFinished] = useState(false);

  const playAnimation = useCallback(() => {
    const rig = animRigRef.current;
    if (!rig) return;

    if (tlRef.current) {
      tlRef.current.kill();
    }

    const { imageMat, thresholdMat, fullResMat, cameraAnchor, camera, getMetrics } = rig;
    const { fitIsoZoom, coverZoom } = getMetrics();

    setIsFinished(false);
    if (ctaRef.current) {
      gsap.set(ctaRef.current, { opacity: 0, y: 24 });
    }

    // Estat inicial isomètric exacte de Damar Berlari a visualizing-dithering-codrops
    cameraAnchor.rotation.set(-Math.PI * 0.15, Math.PI * 0.25, 0);
    camera.zoom = fitIsoZoom * 1.15;
    camera.updateProjectionMatrix();

    imageMat.uniforms.uAnimationProgress.value = 0;
    imageMat.uniforms.uFlatShading.value = 0;
    imageMat.uniforms.uBorderFade.value = 0;
    thresholdMat.uniforms.uAnimationProgress.value = 0;
    fullResMat.opacity = 0;

    const tl = gsap.timeline({
      onComplete: () => {
        setIsFinished(true);
        if (ctaRef.current) {
          gsap.fromTo(
            ctaRef.current,
            { opacity: 0, y: 20 },
            { opacity: 1, y: 0, duration: 0.7, ease: 'power2.out' }
          );
        }
      },
    });
    tlRef.current = tl;

    // 1. Lleuger zoom isomètric d'ajust
    tl.to(
      camera,
      {
        zoom: fitIsoZoom * 1.05,
        duration: 1.0,
        ease: 'power2.out',
        onUpdate: () => camera.updateProjectionMatrix(),
      },
      0
    );

    // 2. Cascada d'Ordered Dithering: els cubs travessen la matriu Bayer 4x4
    tl.to(
      imageMat.uniforms.uAnimationProgress,
      {
        value: 1,
        duration: 2.6,
        ease: 'none',
        onUpdate: () => {
          thresholdMat.uniforms.uAnimationProgress.value = imageMat.uniforms.uAnimationProgress.value;
        },
      },
      0.1
    );

    // 3. Gir frontal de la càmera i expansió a pantalla completa
    tl.to(
      cameraAnchor.rotation,
      {
        x: 0,
        y: 0,
        duration: 1.4,
        ease: 'power3.inOut',
      },
      2.3
    );

    tl.to(
      camera,
      {
        zoom: coverZoom,
        duration: 1.45,
        ease: 'power3.inOut',
        onUpdate: () => camera.updateProjectionMatrix(),
      },
      2.3
    );

    tl.to(
      imageMat.uniforms.uFlatShading,
      {
        value: 1,
        duration: 0.75,
        ease: 'power2.out',
      },
      2.7
    );

    tl.to(
      imageMat.uniforms.uBorderFade,
      {
        value: 1,
        duration: 0.55,
        ease: 'power2.out',
      },
      2.6
    );

    // 4. Pla fotogràfic d'alta resolució final a pantalla completa
    tl.to(
      fullResMat,
      {
        opacity: 1,
        duration: 0.45,
        ease: 'power2.out',
      },
      3.35
    );
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let rafId = 0;
    let isDisposed = false;

    // Fons blau exactament idèntic al CodePen i Codrops de Damar Berlari (#6171E5)
    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#6171E5');

    // Desactivem el lag smoothing per garantir que l'animació avanci a temps de rellotge real
    gsap.ticker.lagSmoothing(false);

    // Densitat equilibrada: màxima definició de la matriu Bayer 4x4 amb 60fps sòlids
    const isMobileViewport = window.innerWidth <= 768;
    const COLS = isMobileViewport ? 160 : 220;
    const ROWS = isMobileViewport ? 108 : 148;
    const CELL_SIZE = 1.0;

    const camera = new THREE.OrthographicCamera(-130, 130, 88, -88, 0.01, 1000);
    camera.position.set(0, 0, 400);
    camera.lookAt(0, 0, 0);

    const cameraAnchor = new THREE.Group();
    cameraAnchor.name = 'cameraAnchor';
    cameraAnchor.rotation.reorder('YXZ');
    cameraAnchor.add(camera);
    scene.add(cameraAnchor);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      preserveDrawingBuffer: true,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
    renderer.setSize(window.innerWidth, window.innerHeight, false);

    const updateFrustumAndGetMetrics = () => {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const aspect = w / Math.max(1, h);
      const gridH = ROWS * CELL_SIZE;
      const gridW = COLS * CELL_SIZE;
      const gridAspect = gridW / gridH;

      camera.top = gridH / 2;
      camera.bottom = -gridH / 2;
      camera.left = (-gridH / 2) * aspect;
      camera.right = (gridH / 2) * aspect;
      camera.updateProjectionMatrix();

      renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
      renderer.setSize(w, h, false);

      // Càlcul de zoom d'enquadrament isomètric i de cobertura total
      const projectedW = gridW * 0.72 + 40 * 0.72;
      const projectedH = gridH * 0.90 + gridW * 0.34 + 40 * 0.68;
      const fitZoomX = (gridH * aspect * 0.78) / projectedW;
      const fitZoomY = (gridH * 0.76) / projectedH;
      const fitIsoZoom = Math.min(fitZoomX, fitZoomY);

      const coverZoom = (aspect > gridAspect ? aspect / gridAspect : 1.0) * 1.02;

      return { fitIsoZoom, coverZoom };
    };

    const dummyTexture = new THREE.DataTexture(new Uint8Array([128, 128, 128, 255]), 1, 1);
    dummyTexture.needsUpdate = true;

    // 1. Image Grid de Damar Berlari:
    // zPositionRange: (20, -20)
    // cellScaleRange: (1, 1)
    // animationMinDelay: 0, animationMaxDelay: 0.90
    const imageGrid = createDamarGrid({
      cols: COLS,
      rows: ROWS,
      cellSize: CELL_SIZE,
      cellThickness: 0.5,
      gridType: 1.0,
      zRange: new THREE.Vector2(20, -20),
      scaleRange: new THREE.Vector2(1.0, 1.0),
      minDelay: 0.0,
      maxDelay: 0.9,
      texture: dummyTexture,
    });
    scene.add(imageGrid.mesh);

    // 2. Threshold Map Grid de Damar Berlari:
    // zPositionRange: (0, -20)
    // cellScaleRange: (1, 0) -> s'encongeix a mesura que és travessat
    // animationMinDelay: 0.05, animationMaxDelay: 0.95
    const thresholdGrid = createDamarGrid({
      cols: COLS,
      rows: ROWS,
      cellSize: CELL_SIZE,
      cellThickness: 0.1,
      gridType: 2.0,
      zRange: new THREE.Vector2(0, -20),
      scaleRange: new THREE.Vector2(1.0, 0.0),
      minDelay: 0.05,
      maxDelay: 0.95,
      texture: dummyTexture,
    });
    scene.add(thresholdGrid.mesh);

    // 3. Làmina d'alta resolució final a pantalla completa
    const fullResGeom = new THREE.PlaneGeometry(COLS * CELL_SIZE, ROWS * CELL_SIZE);
    const fullResMat = new THREE.MeshBasicMaterial({
      map: dummyTexture,
      transparent: true,
      opacity: 0,
      depthTest: false,
    });
    const fullResPlane = new THREE.Mesh(fullResGeom, fullResMat);
    fullResPlane.position.z = -19.5;
    fullResPlane.renderOrder = 10;
    scene.add(fullResPlane);

    animRigRef.current = {
      imageMat: imageGrid.material,
      thresholdMat: thresholdGrid.material,
      fullResMat,
      cameraAnchor,
      camera,
      getMetrics: updateFrustumAndGetMetrics,
    };

    updateFrustumAndGetMetrics();

    let activeTexture: THREE.Texture = dummyTexture;
    const textureLoader = new THREE.TextureLoader();
    textureLoader.load(
      '/images/miquel-gil-juan-miguel-morales-14-scaled.jpg',
      (tex) => {
        if (isDisposed) return;
        activeTexture = tex;
        tex.minFilter = THREE.LinearFilter;
        tex.magFilter = THREE.LinearFilter;
        imageGrid.material.uniforms.uTexture.value = tex;
        imageGrid.material.needsUpdate = true;
        fullResMat.map = tex;
        fullResMat.needsUpdate = true;
        playAnimation();
      }
    );

    const onResize = () => {
      const { coverZoom } = updateFrustumAndGetMetrics();
      if (tlRef.current && tlRef.current.progress() >= 0.99) {
        camera.zoom = coverZoom;
        camera.updateProjectionMatrix();
      }
    };

    window.addEventListener('resize', onResize);

    const renderLoop = () => {
      if (isDisposed) return;
      rafId = requestAnimationFrame(renderLoop);
      renderer.render(scene, camera);
    };
    rafId = requestAnimationFrame(renderLoop);

    return () => {
      isDisposed = true;
      cancelAnimationFrame(rafId);
      window.removeEventListener('resize', onResize);
      gsap.ticker.lagSmoothing(500, 33);
      if (tlRef.current) tlRef.current.kill();
      imageGrid.geometry.dispose();
      imageGrid.material.dispose();
      thresholdGrid.geometry.dispose();
      thresholdGrid.material.dispose();
      fullResGeom.dispose();
      fullResMat.dispose();
      dummyTexture.dispose();
      activeTexture.dispose();
      renderer.dispose();
    };
  }, [playAnimation]);

  return (
    <main className="prova-screen">
      <canvas
        ref={canvasRef}
        className="prova-canvas"
        aria-label="Animació en blocs 3D Ordered Dithering de Miquel Gil (Damar Berlari)"
      />
      <div
        className={`prova-vignette ${isFinished ? 'is-ready' : ''}`}
        aria-hidden="true"
      />

      <div
        ref={ctaRef}
        className={`prova-cta-wrap ${isFinished ? 'is-ready' : ''}`}
      >
        <Link href="/discografia/" className="btn a24-btn prova-a24-btn">
          <span className="btn__divider" aria-hidden="true" />
          <span className="btn__p-mask">
            <span className="btn__p">
              <span>Entrar a la web</span>
            </span>
          </span>
          <span className="btn__divider" aria-hidden="true" />
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
