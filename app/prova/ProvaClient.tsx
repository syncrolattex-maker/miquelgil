'use client';

import React, { useEffect, useRef, useState, useCallback } from 'react';
import Link from 'next/link';
import * as THREE from 'three';
import gsap from 'gsap';
import './prova.css';

// Matrius oficials de Damar Pramudita (@damarberlari)
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
  uniform float uGridMode; // 1.0 = Image Blocks, 2.0 = Threshold Map Grid
  uniform float uFlatShading; // 0.0 = relleu 3D isomètric, 1.0 = pla perfecte en pantalla completa
  uniform sampler2D uTexture;

  attribute float aRowIdNormalized;
  attribute float aColumnIdNormalized;
  attribute float aDitheringThreshold;

  varying vec3 vColor;

  void main() {
    // Ona diagonal des de la cantonada superior esquerra fins a la inferior dreta (DELAY_TYPE 5)
    float delayFactor = distance(vec2(aRowIdNormalized, aColumnIdNormalized), vec2(0.0, 0.0));
    delayFactor = smoothstep(0.0, 1.42, delayFactor);

    float animationStart = mix(uAnimationMinDelay, uAnimationMaxDelay, delayFactor);
    float animationDuration = max(0.05, 1.0 - uAnimationMaxDelay);
    float animationEnd = animationStart + animationDuration;

    float localProgress = smoothstep(animationStart, animationEnd, uAnimationProgress);

    // Escala individual de cada bloc 3D
    float cellScale = mix(uCellScaleRange.x, uCellScaleRange.y, localProgress);
    vec3 cellLocalPosition = position * cellScale;

    vec4 cellWorldPosition = modelMatrix * instanceMatrix * vec4(cellLocalPosition, 1.0);
    cellWorldPosition.z += mix(uZPositionRange.x, uZPositionRange.y, localProgress);

    gl_Position = projectionMatrix * viewMatrix * cellWorldPosition;

    // Càlcul de color: de blocs dithered (Bayer 4x4) -> fotografia de Miquel Gil
    vec3 baseColor;
    if (uGridMode < 1.5) {
      vec3 texColor = texture2D(uTexture, vec2(aColumnIdNormalized, 1.0 - aRowIdNormalized)).rgb;
      float lum = dot(texColor, vec3(0.299, 0.587, 0.114));
      float ditherBit = step(aDitheringThreshold, clamp((lum - 0.5) * 1.15 + 0.5, 0.0, 1.0));
      vec3 ditheredBlock = mix(vec3(0.04, 0.04, 0.038), vec3(0.955, 0.945, 0.92), ditherBit);

      float colorStart = animationStart + animationDuration * 0.35;
      float colorEnd = animationEnd;
      float colorProgress = smoothstep(colorStart, colorEnd, uAnimationProgress);
      baseColor = mix(ditheredBlock, texColor, colorProgress);
    } else {
      // Threshold Map Grid: blocs en escala de grisos mostrant la matriu Bayer 4x4
      baseColor = vec3(0.18 + aDitheringThreshold * 0.72);
    }

    // Il·luminació direccional subtil per ressaltar les cares 3D dels blocs en vista isomètrica
    vec3 lightDir = normalize(vec3(0.45, 0.7, 0.85));
    float diff = 0.76 + 0.32 * max(dot(normalize(normal), lightDir), 0.0);
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

  const rowIds = new Float32Array(count);
  const colIds = new Float32Array(count);
  const thresholds = new Float32Array(count);

  const bSize = BAYER_4X4.data.length;
  for (let i = 0; i < count; i++) {
    const r = Math.floor(i / cols);
    const c = i % cols;
    rowIds[i] = r / Math.max(1, rows - 1);
    colIds[i] = c / Math.max(1, cols - 1);

    const mRow = r % BAYER_4X4.rows;
    const mCol = c % BAYER_4X4.cols;
    thresholds[i] = BAYER_4X4.data[mCol + mRow * BAYER_4X4.cols] / bSize;
  }

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
      uTexture: { value: texture },
    },
  });

  const mesh = new THREE.InstancedMesh(geometry, material, count);
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
    getCoverZoom: () => number;
  } | null>(null);

  const [isFinished, setIsFinished] = useState(false);

  const playAnimation = useCallback(() => {
    const rig = animRigRef.current;
    if (!rig) return;

    if (tlRef.current) {
      tlRef.current.kill();
    }

    const { imageMat, thresholdMat, fullResMat, cameraAnchor, camera, getCoverZoom } = rig;
    const coverZoom = getCoverZoom();
    const isMobile = typeof window !== 'undefined' && window.innerWidth <= 768;

    setIsFinished(false);
    if (ctaRef.current) {
      gsap.set(ctaRef.current, { opacity: 0, y: 24 });
    }

    // Estat inicial idèntic a la vista isomètrica de blocs 3D de Damar Berlari
    cameraAnchor.rotation.set(-Math.PI * 0.16, Math.PI * 0.24, 0);
    camera.zoom = isMobile ? coverZoom * 0.52 : coverZoom * 0.72;
    camera.updateProjectionMatrix();

    imageMat.uniforms.uAnimationProgress.value = 0;
    imageMat.uniforms.uFlatShading.value = 0;
    thresholdMat.uniforms.uAnimationProgress.value = 0;
    fullResMat.opacity = 0;

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

    // 1. Els blocs 3D de la foto travessen el pla del Threshold Map en ona diagonal
    const blockState = { progress: 0 };
    tl.to(
      blockState,
      {
        progress: 1,
        duration: 2.55,
        ease: 'power2.inOut',
        onUpdate: () => {
          imageMat.uniforms.uAnimationProgress.value = blockState.progress;
          thresholdMat.uniforms.uAnimationProgress.value = blockState.progress;
        },
      },
      0.25
    );

    // 2. La càmera isomètrica gira frontalment i s'acosta fins a pantalla completa
    tl.to(
      cameraAnchor.rotation,
      {
        x: 0,
        y: 0,
        duration: 1.85,
        ease: 'power3.inOut',
      },
      1.35
    );

    tl.to(
      camera,
      {
        zoom: coverZoom,
        duration: 1.9,
        ease: 'power3.inOut',
        onUpdate: () => camera.updateProjectionMatrix(),
      },
      1.35
    );

    tl.to(
      imageMat.uniforms.uFlatShading,
      {
        value: 1,
        duration: 0.9,
        ease: 'power2.out',
      },
      2.15
    );

    // 3. Fosa final nítida amb la fotografia d'alta resolució cobrint tota la pantalla
    tl.to(
      fullResMat,
      {
        opacity: 1,
        duration: 0.65,
        ease: 'power2.out',
      },
      2.75
    );
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    let rafId = 0;
    let isDisposed = false;

    const scene = new THREE.Scene();
    scene.background = new THREE.Color('#0c0c0b');

    const COLS = 78;
    const ROWS = 52; // Proporció 1.50 igual que la foto 2560x1725 amb blocs 3D ben definits
    const CELL_SIZE = 1.0;

    const camera = new THREE.OrthographicCamera(-75, 75, 50, -50, 0.1, 1000);
    camera.position.set(0, 0, 320);
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

    const updateFrustumAndGetCoverZoom = () => {
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

      return aspect > gridAspect ? aspect / gridAspect : 1.0;
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

    // 1. Graella de blocs d'imatge 3D (comença elevada en z=+18 amb separació visible entre blocs -> baixa a z=0 i s'uneix)
    const imageGrid = createInstancedBlockGrid({
      cols: COLS,
      rows: ROWS,
      cellSize: CELL_SIZE,
      cellThickness: 1.65,
      gridMode: 1.0,
      zRange: new THREE.Vector2(18, 0),
      scaleRange: new THREE.Vector2(0.8, 1.0),
      minDelay: 0.0,
      maxDelay: 0.72,
      texture,
    });
    scene.add(imageGrid.mesh);

    // 2. Graella inferior del Threshold Map Bayer 4x4 (en escala de grisos, baixa i desapareix en ser travessada)
    const thresholdGrid = createInstancedBlockGrid({
      cols: COLS,
      rows: ROWS,
      cellSize: CELL_SIZE,
      cellThickness: 0.5,
      gridMode: 2.0,
      zRange: new THREE.Vector2(0, -14),
      scaleRange: new THREE.Vector2(0.82, 0.0),
      minDelay: 0.06,
      maxDelay: 0.78,
      texture,
    });
    scene.add(thresholdGrid.mesh);

    // 3. Pla d'alta resolució per al tancament final completament nítid
    const fullResGeom = new THREE.PlaneGeometry(COLS * CELL_SIZE, ROWS * CELL_SIZE);
    const fullResMat = new THREE.MeshBasicMaterial({
      map: texture,
      transparent: true,
      opacity: 0,
      depthTest: false,
    });
    const fullResPlane = new THREE.Mesh(fullResGeom, fullResMat);
    fullResPlane.position.z = 1.0;
    fullResPlane.renderOrder = 10;
    scene.add(fullResPlane);

    animRigRef.current = {
      imageMat: imageGrid.material,
      thresholdMat: thresholdGrid.material,
      fullResMat,
      cameraAnchor,
      camera,
      getCoverZoom: updateFrustumAndGetCoverZoom,
    };

    updateFrustumAndGetCoverZoom();

    const onResize = () => {
      const nextCoverZoom = updateFrustumAndGetCoverZoom();
      if (tlRef.current && tlRef.current.progress() >= 0.99) {
        camera.zoom = nextCoverZoom;
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
