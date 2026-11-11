'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import * as THREE from 'three';
import gsap from 'gsap';
import './prova.css';

// Matriu oficial Bayer 4x4 de Damar Pramudita (@damarberlari)
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

const BLOCK_VERTEX_SHADER = /* glsl */ `
  uniform vec2 uZPositionRange;
  uniform vec2 uCellScaleRange;
  uniform float uAnimationProgress;
  uniform float uAnimationMinDelay;
  uniform float uAnimationMaxDelay;
  uniform float uGridMode;    // 1.0 = Image Grid, 2.0 = Threshold Map Grid
  uniform float uFlatShading; // 0.0 = volum 3D isomètric, 1.0 = pla perfecte en pantalla completa
  uniform float uBorderFade;  // 0.0 = vora negra tipus marc 3D, 1.0 = sense vora en pantalla completa
  uniform sampler2D uTexture;

  attribute float aCellIdNormalized;
  attribute float aRowIdNormalized;
  attribute float aColumnIdNormalized;
  attribute float aDitheringThreshold;

  varying vec3 vColor;

  void main() {
    // Escaneig cel·la a cel·la (DELAY_TYPE == 1 a visualizing-dithering-codrops)
    float delayFactor = aCellIdNormalized;

    float animationStart = mix(uAnimationMinDelay, uAnimationMaxDelay, delayFactor);
    float animationDuration = max(0.05, 1.0 - uAnimationMaxDelay);
    float animationEnd = animationStart + animationDuration;

    float localProgress = smoothstep(animationStart, animationEnd, uAnimationProgress);

    // Escala i posició Z de cada cub 3D en travessar el pla Threshold Map
    float cellScale = max(mix(uCellScaleRange.x, uCellScaleRange.y, localProgress), 0.0);
    vec3 cellLocalPosition = position * cellScale;

    vec4 cellWorldPosition = modelMatrix * instanceMatrix * vec4(cellLocalPosition, 1.0);
    cellWorldPosition.z += mix(uZPositionRange.x, uZPositionRange.y, localProgress);

    gl_Position = projectionMatrix * viewMatrix * cellWorldPosition;

    vec3 baseColor;
    if (uGridMode < 1.5) {
      // Three.js descodifica sRGB -> Linear automàticament en samplejar textura sRGB;
      // tornem a sRGB perceptual abans de comparar amb la matriu Bayer 4x4.
      vec3 texLinear = texture2D(uTexture, vec2(aColumnIdNormalized, 1.0 - aRowIdNormalized)).rgb;
      vec3 texSrgb = pow(max(texLinear, vec3(0.0)), vec3(1.0 / 2.2));
      float lum = dot(texSrgb, vec3(0.299, 0.587, 0.114));

      float ditherBit = step(aDitheringThreshold, clamp((lum - 0.48) * 1.14 + 0.52, 0.0, 1.0));
      vec3 ditheredBlock = mix(vec3(0.004), vec3(0.955, 0.948, 0.925), ditherBit);

      // Transformació de blocs dithered 1-bit -> textura fotogràfica en travessar z=0
      float colorStart = animationStart + animationDuration * 0.42;
      float colorEnd = animationStart + animationDuration * 0.72;
      float colorProgress = smoothstep(colorStart, colorEnd, uAnimationProgress);
      baseColor = mix(ditheredBlock, texLinear, colorProgress);

      // Marc negre perimetral de Damar Berlari (es difumina abans d'entrar a pantalla completa)
      float borderThreshold = 0.0055;
      float borderX = step(aColumnIdNormalized, borderThreshold) + step(1.0 - borderThreshold, aColumnIdNormalized);
      float borderY = step(aRowIdNormalized, borderThreshold) + step(1.0 - borderThreshold, aRowIdNormalized);
      float isBorder = clamp(borderX + borderY, 0.0, 1.0) * (1.0 - uBorderFade);
      baseColor = mix(baseColor, vec3(0.003), isBorder);
    } else {
      // Threshold Map Grid Bayer 4x4 en escala de grisos linealitzada correctament
      float perceptualGray = 0.06 + aDitheringThreshold * 0.88;
      baseColor = pow(vec3(perceptualGray), vec3(2.2));
    }

    // Il·luminació direccional de les cares dels cubs 3D en vista isomètrica (+X, +Y, +Z visibles)
    vec3 worldNormal = normalize(mat3(modelMatrix) * mat3(instanceMatrix) * normal);
    vec3 lightDir = normalize(vec3(0.35, 0.65, 0.92));
    float diff = 0.58 + 0.42 * max(dot(worldNormal, lightDir), 0.0);
    float lightFactor = mix(diff, 1.0, uFlatShading);

    vColor = baseColor * lightFactor;
  }
`;

const BLOCK_FRAGMENT_SHADER = /* glsl */ `
  varying vec3 vColor;
  void main() {
    gl_FragColor = vec4(vColor, 1.0);
    #include <colorspace_fragment>
  }
`;

function createInstancedBlockGrid(options: {
  cols: number;
  rows: number;
  cellSize: number;
  cellThickness: number;
  gridMode: number;
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
    gridMode,
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

  const bSize = BAYER_4X4.data.length;
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
    vertexShader: BLOCK_VERTEX_SHADER,
    fragmentShader: BLOCK_FRAGMENT_SHADER,
    uniforms: {
      uZPositionRange: { value: zRange },
      uCellScaleRange: { value: scaleRange },
      uAnimationProgress: { value: 0 },
      uAnimationMinDelay: { value: minDelay },
      uAnimationMaxDelay: { value: maxDelay },
      uGridMode: { value: gridMode },
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

    // Estat inicial isomètric idèntic a Damar Berlari (Ordered Dithering - A Close-Up Look)
    cameraAnchor.rotation.set(-Math.PI * 0.15, Math.PI * 0.25, 0);
    camera.zoom = fitIsoZoom * 1.24;
    camera.updateProjectionMatrix();

    imageMat.uniforms.uAnimationProgress.value = 0;
    imageMat.uniforms.uFlatShading.value = 0;
    imageMat.uniforms.uBorderFade.value = 0;
    thresholdMat.uniforms.uAnimationProgress.value = 0;
    fullResMat.opacity = 0;

    gsap.ticker.lagSmoothing(800, 33);

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
      },
    });
    tlRef.current = tl;

    // 1. Primer pla dels cubs 3D -> enquadrament isomètric complet sobre #6171E5
    tl.to(
      camera,
      {
        zoom: fitIsoZoom * 1.12,
        duration: 1.25,
        ease: 'power2.out',
        onUpdate: () => camera.updateProjectionMatrix(),
      },
      0.15
    );

    // 2. Cascada de milers de cubs 3D travessant el Threshold Map Bayer 4x4 (z: +22 -> -22)
    const blockState = { progress: 0 };
    tl.to(
      blockState,
      {
        progress: 1,
        duration: 2.65,
        ease: 'none',
        onUpdate: () => {
          imageMat.uniforms.uAnimationProgress.value = blockState.progress;
          thresholdMat.uniforms.uAnimationProgress.value = blockState.progress;
        },
      },
      0.2
    );

    // 3. Gir frontal suau de la càmera i zoom fi fins a cobrir 100vw x 100dvh
    tl.to(
      cameraAnchor.rotation,
      {
        x: 0,
        y: 0,
        duration: 1.55,
        ease: 'power3.inOut',
      },
      2.35
    );

    tl.to(
      camera,
      {
        zoom: coverZoom,
        duration: 1.6,
        ease: 'power3.inOut',
        onUpdate: () => camera.updateProjectionMatrix(),
      },
      2.35
    );

    tl.to(
      imageMat.uniforms.uFlatShading,
      {
        value: 1,
        duration: 0.85,
        ease: 'power2.out',
      },
      2.8
    );

    tl.to(
      imageMat.uniforms.uBorderFade,
      {
        value: 1,
        duration: 0.65,
        ease: 'power2.out',
      },
      2.65
    );

    // 4. Fosa final d'alta resolució amb la fotografia completa de Miquel Gil
    tl.to(
      fullResMat,
      {
        opacity: 1,
        duration: 0.55,
        ease: 'power2.out',
      },
      3.45
    );
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let rafId = 0;
    let isDisposed = false;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#6171E5');

    const isMobileViewport = window.innerWidth <= 768;
    const COLS = isMobileViewport ? 180 : 260;
    const ROWS = isMobileViewport ? 120 : 176;
    const CELL_SIZE = 1.0;

    const camera = new THREE.OrthographicCamera(-130, 130, 88, -88, 0.1, 1200);
    camera.position.set(0, 0, 500);
    camera.lookAt(0, 0, 0);

    const cameraAnchor = new THREE.Group();
    cameraAnchor.rotation.reorder('YXZ');
    cameraAnchor.add(camera);
    scene.add(cameraAnchor);

    const renderer = new THREE.WebGLRenderer({
      canvas,
      antialias: true,
      powerPreference: 'high-performance',
    });
    renderer.outputColorSpace = THREE.SRGBColorSpace;
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

      // En vista isomètrica (y=45°, x=-27°), projecció màxima per emmarcar tota la làmina dins pantalla
      const projectedW = gridW * 0.72 + 44 * 0.72;
      const projectedH = gridH * 0.90 + gridW * 0.34 + 44 * 0.68;
      const fitZoomX = (gridH * aspect * 0.78) / projectedW;
      const fitZoomY = (gridH * 0.76) / projectedH;
      const fitIsoZoom = Math.min(fitZoomX, fitZoomY);

      const coverZoom = (aspect > gridAspect ? aspect / gridAspect : 1.0) * 1.015;

      return { fitIsoZoom, coverZoom };
    };

    const textureLoader = new THREE.TextureLoader();
    const texture = textureLoader.load(
      '/images/miquel-gil-juan-miguel-morales-14-scaled.jpg',
      (tex) => {
        if (isDisposed) return;
        tex.colorSpace = THREE.SRGBColorSpace;
        tex.minFilter = THREE.LinearFilter;
        tex.magFilter = THREE.LinearFilter;
        imageGrid.material.needsUpdate = true;
        playAnimation();
      }
    );

    // 1. Image Grid d'alta densitat en blocs 3D (z: +22 -> -22)
    const imageGrid = createInstancedBlockGrid({
      cols: COLS,
      rows: ROWS,
      cellSize: CELL_SIZE,
      cellThickness: 0.5,
      gridMode: 1.0,
      zRange: new THREE.Vector2(22, -22),
      scaleRange: new THREE.Vector2(1.0, 1.0),
      minDelay: 0.0,
      maxDelay: 0.88,
      texture,
    });
    scene.add(imageGrid.mesh);

    // 2. Threshold Map Grid Bayer 4x4 (z: 0 -> -22, es contreu a 0 en ser travessat)
    const thresholdGrid = createInstancedBlockGrid({
      cols: COLS,
      rows: ROWS,
      cellSize: CELL_SIZE,
      cellThickness: 0.1,
      gridMode: 2.0,
      zRange: new THREE.Vector2(0, -22),
      scaleRange: new THREE.Vector2(1.0, 0.0),
      minDelay: 0.04,
      maxDelay: 0.92,
      texture,
    });
    scene.add(thresholdGrid.mesh);

    // 3. Pla fotogràfic d'alta resolució per al tancament final en pantalla completa
    const fullResGeom = new THREE.PlaneGeometry(COLS * CELL_SIZE, ROWS * CELL_SIZE);
    const fullResMat = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      opacity: 0,
      depthTest: false,
    });
    const fullResPlane = new THREE.Mesh(fullResGeom, fullResMat);
    fullResPlane.position.z = -21.5;
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
      texture.dispose();
      renderer.dispose();
    };
  }, [playAnimation]);

  return (
    <main className="prova-screen">
      <canvas
        ref={canvasRef}
        className="prova-canvas"
        aria-label="Animació en blocs 3D Ordered Dithering de Miquel Gil"
      />
      <div
        className={`prova-vignette ${isFinished ? 'is-ready' : ''}`}
        aria-hidden="true"
      />

      <div
        ref={ctaRef}
        className={`prova-cta-wrap ${isFinished ? 'is-ready' : ''}`}
      >
        <Link href="/discografia/" className="prova-enter-btn">
          <span>Entrar a la Web</span>
          <span className="prova-enter-arrow" aria-hidden="true">↗</span>
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
