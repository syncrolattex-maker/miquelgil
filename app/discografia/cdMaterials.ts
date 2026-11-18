import * as THREE from 'three';

/**
 * cdMaterials.ts
 *
 * Módulo de materiales y texturas fotorrealistas de alta fidelidad para discos ópticos (CD).
 * Emula la estética táctil serigráfica, micro-surcos de torneado óptico, laca protectora UV (clearcoat)
 * e iridiscencia espectral del diseño de referencia A24.
 */

export interface SilkscreenPrintMaps {
  normalMap: THREE.CanvasTexture;
  roughnessMap: THREE.CanvasTexture;
}

export interface OpticalBackMaps {
  colorMap: THREE.CanvasTexture;
  normalMap: THREE.CanvasTexture;
  roughnessMap: THREE.CanvasTexture;
  matrixMap: THREE.CanvasTexture;
}

// ----------------------------------------------------------------------------
// 1. DIBUJO DE TEXTO CURVADO SOBRE ARCO CIRCULAR (Canvas 2D)
// ----------------------------------------------------------------------------
export function drawCurvedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  cx: number,
  cy: number,
  radius: number,
  centerAngle: number,
  spacing: number = 0,
  inward: boolean = false
) {
  ctx.save();
  const chars = Array.from(text);
  const widths = chars.map((c) => ctx.measureText(c).width);
  const totalWidth = widths.reduce((a, b) => a + b, 0) + (chars.length - 1) * spacing;
  const totalAngle = totalWidth / radius;

  let currentAngle = inward
    ? centerAngle + totalAngle / 2
    : centerAngle - totalAngle / 2;

  for (let i = 0; i < chars.length; i++) {
    const c = chars[i];
    const w = widths[i];
    const charAngle = w / radius;
    const halfChar = charAngle / 2;

    if (inward) {
      currentAngle -= halfChar;
      const x = cx + radius * Math.cos(currentAngle);
      const y = cy + radius * Math.sin(currentAngle);
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(currentAngle - Math.PI / 2);
      ctx.fillText(c, 0, 0);
      ctx.restore();
      currentAngle -= halfChar + spacing / radius;
    } else {
      currentAngle += halfChar;
      const x = cx + radius * Math.cos(currentAngle);
      const y = cy + radius * Math.sin(currentAngle);
      ctx.save();
      ctx.translate(x, y);
      ctx.rotate(currentAngle + Math.PI / 2);
      ctx.fillText(c, 0, 0);
      ctx.restore();
      currentAngle += halfChar + spacing / radius;
    }
  }
  ctx.restore();
}

// ----------------------------------------------------------------------------
// 2. MAPA PROCEDURAL DE SERIGRAFÍA TÁCTIL (Normal Map + Roughness Map)
//    - Puntillado micro-poroso de tinta serigráfica
//    - Micro-surcos concéntricos de policarbonato
//    - Relieve escalonado físico en los límites de la impresión
// ----------------------------------------------------------------------------
function hash2D(ix: number, iy: number) {
  const n = Math.sin(ix * 127.1 + iy * 311.7) * 43758.5453123;
  return n - Math.floor(n);
}

function valueNoise(x: number, y: number) {
  const ix = Math.floor(x);
  const iy = Math.floor(y);
  const fx = x - ix;
  const fy = y - iy;
  const ux = fx * fx * (3 - 2 * fx);
  const uy = fy * fy * (3 - 2 * fy);
  const a = hash2D(ix, iy);
  const b = hash2D(ix + 1, iy);
  const c = hash2D(ix, iy + 1);
  const d = hash2D(ix + 1, iy + 1);
  return a + (b - a) * ux + (c - a) * uy + (a - b - c + d) * ux * uy;
}

export function createSilkscreenPrintMaps(renderer: THREE.WebGLRenderer): SilkscreenPrintMaps {
  const size = 512;
  const heights = new Float32Array(size * size);
  const half = size * 0.5;

  for (let y = 0; y < size; y++) {
    const dy = y - half;
    const dy2 = dy * dy;
    for (let x = 0; x < size; x++) {
      const dx = x - half;
      const r = Math.sqrt(dx * dx + dy2) / half;

      // Micro-surcos de torneado concéntrico del molde de inyección
      const groove = Math.sin(r * 520.0) * 0.35 + Math.sin(r * 210.0) * 0.22;

      // Grano táctil de tinta serigráfica (porosidad de curado UV)
      const stipple = (hash2D((x * 0.8) | 0, (y * 0.8) | 0) - 0.5) * 0.42;

      // Resalte físico del borde de la capa de tinta (labio perimetral de ~15 micras)
      const innerDist = Math.abs(r - 0.24);
      const outerDist = Math.abs(r - 0.974);
      const edgeLip = Math.exp(-innerDist * innerDist * 3200) * 0.55 + Math.exp(-outerDist * outerDist * 3200) * 0.55;

      if (r >= 0.22 && r <= 0.985) {
        heights[y * size + x] = 0.5 + (groove * 0.16 + stipple + edgeLip) * 0.24;
      } else {
        heights[y * size + x] = 0.5 + Math.sin(r * 320.0) * 0.04;
      }
    }
  }

  // Generación de Normal Map mediante filtro Sobel
  const normCanvas = document.createElement('canvas');
  normCanvas.width = size;
  normCanvas.height = size;
  const nCtx = normCanvas.getContext('2d')!;
  const nImg = nCtx.createImageData(size, size);
  const nData = nImg.data;
  const strength = 3.6;

  for (let y = 0; y < size; y++) {
    const yPrev = Math.max(0, y - 1);
    const yNext = Math.min(size - 1, y + 1);
    for (let x = 0; x < size; x++) {
      const xPrev = Math.max(0, x - 1);
      const xNext = Math.min(size - 1, x + 1);
      const dX = (heights[y * size + xNext] - heights[y * size + xPrev]) * strength;
      const dY = (heights[yNext * size + x] - heights[yPrev * size + x]) * strength;
      const invLen = 1 / Math.hypot(dX, dY, 1);
      const idx = (y * size + x) * 4;
      nData[idx] = Math.round((-dX * invLen * 0.5 + 0.5) * 255);
      nData[idx + 1] = Math.round((-dY * invLen * 0.5 + 0.5) * 255);
      nData[idx + 2] = Math.round((invLen * 0.5 + 0.5) * 255);
      nData[idx + 3] = 255;
    }
  }
  nCtx.putImageData(nImg, 0, 0);
  const normalMap = new THREE.CanvasTexture(normCanvas);
  normalMap.anisotropy = renderer.capabilities.getMaxAnisotropy();
  normalMap.generateMipmaps = true;
  normalMap.minFilter = THREE.LinearMipmapLinearFilter;
  normalMap.magFilter = THREE.LinearFilter;
  normalMap.needsUpdate = true;

  // Generación de Roughness Map
  const roughCanvas = document.createElement('canvas');
  roughCanvas.width = size;
  roughCanvas.height = size;
  const rCtx = roughCanvas.getContext('2d')!;
  const rImg = rCtx.createImageData(size, size);
  const rData = rImg.data;

  for (let y = 0; y < size; y++) {
    const dy = y - half;
    const dy2 = dy * dy;
    for (let x = 0; x < size; x++) {
      const dx = x - half;
      const r = Math.sqrt(dx * dx + dy2) / half;
      let roughnessVal = 0.36;

      if (r < 0.14) {
        roughnessVal = 0.05; // Agujero central
      } else if (r < 0.20) {
        roughnessVal = 0.46; // Anillo deslustrado (clamp ring)
      } else if (r < 0.24) {
        roughnessVal = 0.04; // Banda espejo de matriz IFPI
      } else if (r <= 0.974) {
        // Tinta serigráfica satinada con micro-grano
        const stipple = (hash2D((x * 0.8) | 0, (y * 0.8) | 0) - 0.5) * 0.08;
        roughnessVal = Math.max(0.28, Math.min(0.46, 0.36 + stipple));
      } else {
        roughnessVal = 0.06; // Borde exterior de policarbonato pulido
      }

      const byte = Math.round(roughnessVal * 255);
      const idx = (y * size + x) * 4;
      rData[idx] = byte;
      rData[idx + 1] = byte;
      rData[idx + 2] = byte;
      rData[idx + 3] = 255;
    }
  }
  rCtx.putImageData(rImg, 0, 0);
  const roughnessMap = new THREE.CanvasTexture(roughCanvas);
  roughnessMap.anisotropy = renderer.capabilities.getMaxAnisotropy();
  roughnessMap.generateMipmaps = true;
  roughnessMap.minFilter = THREE.LinearMipmapLinearFilter;
  roughnessMap.magFilter = THREE.LinearFilter;
  roughnessMap.needsUpdate = true;

  return { normalMap, roughnessMap };
}

// ----------------------------------------------------------------------------
// 3. MAPA DE ENTORNO REFLECTANTE DE ESTUDIO (PMREM Softboxes A24)
// ----------------------------------------------------------------------------
export function createStudioEnvMap(renderer: THREE.WebGLRenderer): THREE.WebGLRenderTarget {
  const envCanvas = document.createElement('canvas');
  envCanvas.width = 1024;
  envCanvas.height = 512;
  const eCtx = envCanvas.getContext('2d')!;

  const bgGrad = eCtx.createLinearGradient(0, 0, 0, 512);
  bgGrad.addColorStop(0, '#25282f');
  bgGrad.addColorStop(0.5, '#0e0f13');
  bgGrad.addColorStop(1, '#020203');
  eCtx.fillStyle = bgGrad;
  eCtx.fillRect(0, 0, 1024, 512);

  // Softboxes horizontales de estudio
  const lightStrips: [number, number, number][] = [
    [0.14, 0.07, 1.0],
    [0.4, 0.049, 0.6],
    [0.26, 0.077, 0.85],
    [0.62, 0.035, 0.35]
  ];
  for (const [yNorm, hNorm, alpha] of lightStrips) {
    const yCenter = 512 * yNorm;
    const halfH = 512 * hNorm;
    const sGrad = eCtx.createLinearGradient(0, yCenter - halfH, 0, yCenter + halfH);
    sGrad.addColorStop(0, 'rgba(255,255,255,0)');
    sGrad.addColorStop(0.5, `rgba(255,255,255,${alpha})`);
    sGrad.addColorStop(1, 'rgba(255,255,255,0)');
    eCtx.fillStyle = sGrad;
    eCtx.fillRect(0, yCenter - halfH, 1024, halfH * 2);
  }

  const equirectTex = new THREE.CanvasTexture(envCanvas);
  equirectTex.mapping = THREE.EquirectangularReflectionMapping;
  const pmrem = new THREE.PMREMGenerator(renderer);
  pmrem.compileEquirectangularShader();
  const envRT = pmrem.fromEquirectangular(equirectTex);
  equirectTex.dispose();
  pmrem.dispose();
  return envRT;
}

// ----------------------------------------------------------------------------
// 4. MAPAS ÓPTICOS DE LA CARA TRASERA (Cara B - Lectura Láser)
// ----------------------------------------------------------------------------
export function createOpticalBackMaps(
  renderer: THREE.WebGLRenderer,
  rFrostOuter: number,
  rMatrixOuter: number
): OpticalBackMaps {
  const nSize = 512;
  const heights = new Float32Array(nSize * nSize);
  const halfN = nSize * 0.5;

  for (let y = 0; y < nSize; y++) {
    for (let x = 0; x < nSize; x++) {
      const dx = x - halfN;
      const dy = y - halfN;
      const dist = Math.hypot(dx, dy);
      const ringGroove = Math.sin(dist * 3.2) * 0.5 + Math.sin(dist * 0.45) * 0.25;
      const microGrain = (valueNoise(x * 0.6, y * 0.6) - 0.5) * 0.08;
      heights[y * nSize + x] = 0.5 + ringGroove * 0.16 + microGrain;
    }
  }

  const normCanvas = document.createElement('canvas');
  normCanvas.width = nSize;
  normCanvas.height = nSize;
  const nCtx = normCanvas.getContext('2d')!;
  const nImg = nCtx.createImageData(nSize, nSize);
  const nData = nImg.data;
  const strength = 2.6;

  for (let y = 0; y < nSize; y++) {
    const yPrev = Math.max(0, y - 1);
    const yNext = Math.min(nSize - 1, y + 1);
    for (let x = 0; x < nSize; x++) {
      const xPrev = Math.max(0, x - 1);
      const xNext = Math.min(nSize - 1, x + 1);
      const dX = (heights[y * nSize + xNext] - heights[y * nSize + xPrev]) * strength;
      const dY = (heights[yNext * nSize + x] - heights[yPrev * nSize + x]) * strength;
      const invLen = 1 / Math.hypot(dX, dY, 1);
      const idx = (y * nSize + x) * 4;
      nData[idx] = Math.round((-dX * invLen * 0.5 + 0.5) * 255);
      nData[idx + 1] = Math.round((-dY * invLen * 0.5 + 0.5) * 255);
      nData[idx + 2] = Math.round((invLen * 0.5 + 0.5) * 255);
      nData[idx + 3] = 255;
    }
  }
  nCtx.putImageData(nImg, 0, 0);
  const normalMap = new THREE.CanvasTexture(normCanvas);
  normalMap.anisotropy = renderer.capabilities.getMaxAnisotropy();
  normalMap.needsUpdate = true;

  const rSize = 512;
  const roughCanvas = document.createElement('canvas');
  roughCanvas.width = rSize;
  roughCanvas.height = rSize;
  const rCtx = roughCanvas.getContext('2d')!;
  const rImg = rCtx.createImageData(rSize, rSize);
  const rData = rImg.data;
  const halfR = rSize * 0.5;

  for (let y = 0; y < rSize; y++) {
    for (let x = 0; x < rSize; x++) {
      const dx = x - halfR;
      const dy = y - halfR;
      const dist = Math.hypot(dx, dy);
      const normR = dist / halfR;
      const trackBand = Math.sin(dist * 1.6) * 0.05 + Math.sin(dist * 0.22) * 0.03;
      const grain = (valueNoise(x * 1.2, y * 1.2) - 0.5) * 0.035;
      const mirrorZone = (normR > 0.24 && normR < 0.29) || (normR > 0.93 && normR < 0.965) ? -0.1 : 0;
      const rVal = Math.max(0.06, Math.min(0.45, 0.21 + trackBand + grain + mirrorZone));
      const byte = Math.round(rVal * 255);
      const idx = (y * rSize + x) * 4;
      rData[idx] = byte;
      rData[idx + 1] = byte;
      rData[idx + 2] = byte;
      rData[idx + 3] = 255;
    }
  }
  rCtx.putImageData(rImg, 0, 0);
  const roughnessMap = new THREE.CanvasTexture(roughCanvas);
  roughnessMap.anisotropy = renderer.capabilities.getMaxAnisotropy();
  roughnessMap.needsUpdate = true;

  const cSize = 1024;
  const colCanvas = document.createElement('canvas');
  colCanvas.width = cSize;
  colCanvas.height = cSize;
  const cCtx = colCanvas.getContext('2d')!;
  const cx = cSize * 0.5;
  const cy = cSize * 0.5;

  const baseRad = cCtx.createRadialGradient(cx, cy, cSize * 0.11, cx, cy, cSize * 0.5);
  baseRad.addColorStop(0.0, '#2a2f3d');
  baseRad.addColorStop(0.24, '#394052');
  baseRad.addColorStop(0.27, '#5a6378');
  baseRad.addColorStop(0.31, '#262b38');
  baseRad.addColorStop(0.68, '#2f3545');
  baseRad.addColorStop(0.92, '#242936');
  baseRad.addColorStop(0.955, '#525b70');
  baseRad.addColorStop(1.0, '#1d212c');
  cCtx.fillStyle = baseRad;
  cCtx.fillRect(0, 0, cSize, cSize);

  // Mariposa óptica espectral (lóbulos de difracción cónica)
  const conic = cCtx.createConicGradient(-Math.PI * 0.18, cx, cy);
  conic.addColorStop(0.0, 'rgba(210, 222, 245, 0.34)');
  conic.addColorStop(0.07, 'rgba(94, 212, 235, 0.28)');
  conic.addColorStop(0.14, 'rgba(130, 232, 168, 0.25)');
  conic.addColorStop(0.21, 'rgba(240, 205, 120, 0.22)');
  conic.addColorStop(0.28, 'rgba(224, 130, 195, 0.26)');
  conic.addColorStop(0.36, 'rgba(125, 145, 235, 0.28)');
  conic.addColorStop(0.44, 'rgba(42, 48, 64, 0.18)');
  conic.addColorStop(0.5, 'rgba(215, 228, 250, 0.36)');
  conic.addColorStop(0.57, 'rgba(94, 212, 235, 0.28)');
  conic.addColorStop(0.64, 'rgba(130, 232, 168, 0.25)');
  conic.addColorStop(0.71, 'rgba(240, 205, 120, 0.22)');
  conic.addColorStop(0.78, 'rgba(224, 130, 195, 0.26)');
  conic.addColorStop(0.86, 'rgba(125, 145, 235, 0.28)');
  conic.addColorStop(0.94, 'rgba(42, 48, 64, 0.18)');
  conic.addColorStop(1.0, 'rgba(210, 222, 245, 0.34)');
  cCtx.fillStyle = conic;
  cCtx.fillRect(0, 0, cSize, cSize);

  const trackRadii = [0.285, 0.36, 0.48, 0.61, 0.74, 0.85, 0.935];
  trackRadii.forEach((rNorm, idx) => {
    cCtx.beginPath();
    cCtx.arc(cx, cy, cSize * 0.5 * rNorm, 0, Math.PI * 2);
    cCtx.strokeStyle = idx % 2 === 0 ? 'rgba(255, 255, 255, 0.14)' : 'rgba(12, 15, 22, 0.28)';
    cCtx.lineWidth = idx === 0 || idx === trackRadii.length - 1 ? 2.5 : 1.2;
    cCtx.stroke();
  });

  for (let r = cSize * 0.135; r < cSize * 0.485; r += 3.5) {
    cCtx.beginPath();
    cCtx.arc(cx, cy, r, 0, Math.PI * 2);
    cCtx.strokeStyle = 'rgba(255, 255, 255, 0.032)';
    cCtx.lineWidth = 0.75;
    cCtx.stroke();
  }

  cCtx.beginPath();
  cCtx.arc(cx, cy, cSize * 0.132, 0, Math.PI * 2);
  cCtx.strokeStyle = 'rgba(230, 236, 248, 0.65)';
  cCtx.lineWidth = 8;
  cCtx.stroke();

  cCtx.save();
  cCtx.translate(cx, cy);
  cCtx.fillStyle = 'rgba(235, 240, 250, 0.55)';
  cCtx.font = '600 13px "PP Neue Montreal", monospace';
  cCtx.textAlign = 'center';
  cCtx.fillText('IFPI L024 · MIQUEL GIL OPTICAL ARCHIVE MASTER · A24-MG', 0, -cSize * 0.136);
  cCtx.fillText('▮▯▮▮▯▮▯▮▮▯▮▯▮▮▯▮  MASTERING SID CODE IFPI 0788', 0, cSize * 0.144);
  cCtx.restore();

  const colorMap = new THREE.CanvasTexture(colCanvas);
  colorMap.anisotropy = renderer.capabilities.getMaxAnisotropy();
  colorMap.needsUpdate = true;

  const mSize = 512;
  const matCanvas = document.createElement('canvas');
  matCanvas.width = mSize;
  matCanvas.height = mSize;
  const mCtx = matCanvas.getContext('2d')!;
  const mImg = mCtx.createImageData(mSize, mSize);
  const mData = mImg.data;
  const halfM = mSize * 0.5;
  const rInM = rFrostOuter * halfM;
  const rOutM = rMatrixOuter * halfM;
  const spanM = Math.max(1e-4, rOutM - rInM);

  for (let y = 0; y < mSize; y++) {
    for (let x = 0; x < mSize; x++) {
      const t = (Math.hypot(x - halfM, y - halfM) - rInM) / spanM;
      let shade = 215;
      if (t >= 0 && t <= 1) {
        const edgeBand =
          (t > 0.05 && t < 0.12) || (t > 0.88 && t < 0.95)
            ? 0.52
            : 0.8 + Math.sin(t * Math.PI * 26) * 0.08;
        const n = (valueNoise(x * 0.9, y * 0.9) - 0.5) * 0.06;
        shade = Math.round(Math.max(90, Math.min(248, (edgeBand + n) * 255)));
      }
      const idx = (y * mSize + x) * 4;
      mData[idx] = shade;
      mData[idx + 1] = shade;
      mData[idx + 2] = Math.min(255, shade + 6);
      mData[idx + 3] = 255;
    }
  }
  mCtx.putImageData(mImg, 0, 0);
  const matrixMap = new THREE.CanvasTexture(matCanvas);
  matrixMap.needsUpdate = true;

  return { normalMap, roughnessMap, colorMap, matrixMap };
}

// ----------------------------------------------------------------------------
// 5. GENERADOR DE TEXTURA SERIGRÁFICA DE 2048 PX (Carátula, tipografía curvada y micro-grano)
// ----------------------------------------------------------------------------
export function buildArchivalDiscCanvasTexture(
  renderer: THREE.WebGLRenderer,
  title: string,
  year: string,
  index: number,
  loadedImg: HTMLImageElement | null
): THREE.CanvasTexture {
  const size = 2048;
  const c = document.createElement('canvas');
  c.width = size;
  c.height = size;
  const ctx = c.getContext('2d')!;
  const cx = size / 2;
  const cy = size / 2;

  // 1. Base policarbonato plateado / reflectante
  const baseGrad = ctx.createRadialGradient(cx, cy, size * 0.1, cx, cy, size * 0.5);
  baseGrad.addColorStop(0, '#f2f2ef');
  baseGrad.addColorStop(0.7, '#e4e4df');
  baseGrad.addColorStop(1, '#d5d5cf');
  ctx.fillStyle = baseGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, size * 0.495, 0, Math.PI * 2);
  ctx.fill();

  // Borde perimetral pulido de seguridad
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.lineWidth = 3;
  ctx.beginPath();
  ctx.arc(cx, cy, size * 0.492, 0, Math.PI * 2);
  ctx.stroke();

  // 2. Anillo espejo de matriz central (IFPI Matrix ring)
  const matrixGrad = ctx.createRadialGradient(cx, cy, size * 0.10, cx, cy, size * 0.122);
  matrixGrad.addColorStop(0, '#c2c8d2');
  matrixGrad.addColorStop(0.5, '#f4f6fa');
  matrixGrad.addColorStop(1, '#a8b0c0');
  ctx.fillStyle = matrixGrad;
  ctx.beginPath();
  ctx.arc(cx, cy, size * 0.122, 0, Math.PI * 2);
  ctx.arc(cx, cy, size * 0.098, 0, Math.PI * 2, true);
  ctx.fill();

  // Código técnico IFPI en el anillo de matriz
  ctx.save();
  ctx.fillStyle = 'rgba(40, 45, 55, 0.65)';
  ctx.font = '600 13px "PP Neue Montreal", monospace';
  drawCurvedText(
    ctx,
    'IFPI L024 · 44.1kHz 24-BIT MASTER RECORDING · DADC AUSTRIA',
    cx,
    cy,
    size * 0.111,
    -Math.PI / 2,
    1.2,
    false
  );
  ctx.restore();

  // 3. Portada impresa en serigrafía dentro del área de impresión (radio 0.24 a 0.974)
  ctx.save();
  ctx.beginPath();
  ctx.arc(cx, cy, size * 0.486, 0, Math.PI * 2);
  ctx.arc(cx, cy, size * 0.122, 0, Math.PI * 2, true);
  ctx.clip('evenodd');

  if (loadedImg) {
    ctx.save();
    ctx.imageSmoothingEnabled = true;
    ctx.imageSmoothingQuality = 'high';
    // Contraste profundo y saturación equilibrada para emular la riqueza cromática serigráfica de A24
    ctx.filter = 'saturate(1.22) contrast(1.12)';
    const iw = loadedImg.naturalWidth || loadedImg.width;
    const ih = loadedImg.naturalHeight || loadedImg.height;
    const minDim = Math.min(iw, ih);
    const sx = (iw - minDim) / 2;
    const sy = (ih - minDim) / 2;
    ctx.drawImage(loadedImg, sx, sy, minDim, minDim, 0, 0, size, size);
    ctx.restore();
  } else {
    const grad = ctx.createRadialGradient(cx, cy, size * 0.1, cx, cy, size * 0.5);
    grad.addColorStop(0, '#2a2a28');
    grad.addColorStop(1, '#111111');
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, size, size);
  }

  // Trama táctil de serigrafía (micro-stipple overlay en canvas)
  const stippleCanvas = document.createElement('canvas');
  stippleCanvas.width = 128;
  stippleCanvas.height = 128;
  const sCtx = stippleCanvas.getContext('2d')!;
  const sImg = sCtx.createImageData(128, 128);
  const sData = sImg.data;
  for (let i = 0; i < 128 * 128; i++) {
    const v = Math.random() > 0.5 ? 255 : 0;
    const idx = i * 4;
    sData[idx] = v;
    sData[idx + 1] = v;
    sData[idx + 2] = v;
    sData[idx + 3] = Math.round(Math.random() * 16 + 6);
  }
  sCtx.putImageData(sImg, 0, 0);
  const stipplePat = ctx.createPattern(stippleCanvas, 'repeat');
  if (stipplePat) {
    ctx.save();
    ctx.globalCompositeOperation = 'overlay';
    ctx.fillStyle = stipplePat;
    ctx.fillRect(0, 0, size, size);
    ctx.restore();
  }

  // 4. Tipografía perimetral curvada de archivo oficial A24 / Miquel Gil
  ctx.save();
  ctx.fillStyle = 'rgba(255, 255, 255, 0.94)';
  ctx.font = '600 32px "PP Neue Montreal", Arial, sans-serif';

  // Arco superior exterior: TÍTULO · AÑO · ARXIU ÒPTIC MIQUEL GIL
  const topText = `${title.toUpperCase()} · ${year} · ARXIU ÒPTIC MIQUEL GIL`;
  drawCurvedText(ctx, topText, cx, cy, size * 0.462, -Math.PI / 2, 2.2, false);

  // Arco inferior exterior: COMPACT DISC DIGITAL AUDIO · STEREO · SGAE · CÓDIGO ARCHIVO
  ctx.font = '500 24px "PP Neue Montreal", Arial, sans-serif';
  ctx.fillStyle = 'rgba(255, 255, 255, 0.88)';
  const catalogCode = `MG-${String(index + 1).padStart(3, '0')}`;
  const bottomText = `COMPACT DISC DIGITAL AUDIO · STEREO · SGAE · ${catalogCode}`;
  drawCurvedText(ctx, bottomText, cx, cy, size * 0.462, Math.PI / 2, 2.0, true);

  ctx.restore();

  // Línea perimetral circular fina delimitadora de la zona serigrafiada
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(cx, cy, size * 0.484, 0, Math.PI * 2);
  ctx.stroke();

  // Línea interior circular de encaje con el buje
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.55)';
  ctx.lineWidth = 1.5;
  ctx.beginPath();
  ctx.arc(cx, cy, size * 0.124, 0, Math.PI * 2);
  ctx.stroke();

  ctx.restore(); // Cierre del clip serigráfico

  const tex = new THREE.CanvasTexture(c);
  tex.colorSpace = THREE.SRGBColorSpace;
  tex.anisotropy = renderer.capabilities.getMaxAnisotropy();
  tex.generateMipmaps = true;
  tex.minFilter = THREE.LinearMipmapLinearFilter;
  tex.magFilter = THREE.LinearFilter;
  tex.needsUpdate = true;
  return tex;
}

// ----------------------------------------------------------------------------
// 6. MATERIALES FÍSICOS REUTILIZABLES (MeshPhysicalMaterial)
// ----------------------------------------------------------------------------
export function createDiscFrontMaterial(
  printMaps: SilkscreenPrintMaps,
  map?: THREE.Texture | null
): THREE.MeshPhysicalMaterial {
  return new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    map: map || null,
    roughness: 0.36,
    metalness: 0.04,
    normalMap: printMaps.normalMap,
    normalScale: new THREE.Vector2(0.42, 0.42),
    roughnessMap: printMaps.roughnessMap,
    clearcoat: 0.82,
    clearcoatRoughness: 0.08,
    envMapIntensity: 0.88,
    side: THREE.FrontSide
  });
}

export function createDiscBackMaterial(
  backMaps: OpticalBackMaps
): THREE.MeshPhysicalMaterial {
  return new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#282e3d'),
    map: backMaps.colorMap,
    roughness: 0.22,
    metalness: 0.96,
    roughnessMap: backMaps.roughnessMap,
    normalMap: backMaps.normalMap,
    normalScale: new THREE.Vector2(0.52, 0.52),
    clearcoat: 0.70,
    clearcoatRoughness: 0.05,
    iridescence: 1.0,
    iridescenceIOR: 1.86,
    iridescenceThicknessRange: [140, 900],
    envMapIntensity: 1.65,
    side: THREE.FrontSide
  });
}

export function createHubMaterial(): THREE.MeshPhysicalMaterial {
  return new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    transparent: true,
    opacity: 0.52,
    roughness: 0.12,
    metalness: 0.06,
    clearcoat: 1.0,
    clearcoatRoughness: 0.06,
    envMapIntensity: 1.6,
    depthWrite: false
  });
}

export function createFrostMaterial(): THREE.MeshPhysicalMaterial {
  return new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#f0f1f5'),
    transparent: true,
    opacity: 0.78,
    roughness: 0.46,
    metalness: 0.04,
    clearcoat: 0.65,
    clearcoatRoughness: 0.22,
    depthWrite: false
  });
}

export function createMatrixMaterial(matrixMap: THREE.Texture): THREE.MeshPhysicalMaterial {
  return new THREE.MeshPhysicalMaterial({
    color: new THREE.Color('#e4e8f0'),
    map: matrixMap,
    roughness: 0.18,
    metalness: 0.92,
    clearcoat: 0.85,
    clearcoatRoughness: 0.08,
    iridescence: 0.42,
    iridescenceIOR: 1.65,
    iridescenceThicknessRange: [180, 560],
    envMapIntensity: 1.65
  });
}

export function createEdgeMaterial(): THREE.MeshPhysicalMaterial {
  return new THREE.MeshPhysicalMaterial({
    color: 0xffffff,
    roughness: 0.04,
    metalness: 0.55,
    clearcoat: 0.85,
    clearcoatRoughness: 0.04,
    iridescence: 0.35,
    iridescenceIOR: 1.52,
    iridescenceThicknessRange: [160, 480],
    envMapIntensity: 1.8
  });
}

// ----------------------------------------------------------------------------
// 7. HELPER GEOMETRÍAS REUTILIZABLES (UV Remapping y Lathe de anillos concéntricos)
// ----------------------------------------------------------------------------
export function remapRingUVs(geo: THREE.RingGeometry, outerR: number) {
  const pos = geo.attributes.position;
  const uvs = geo.attributes.uv;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    uvs.setXY(i, x / (outerR * 2) + 0.5, y / (outerR * 2) + 0.5);
  }
  uvs.needsUpdate = true;
}

export function buildAnnulusLatheGeo(innerR: number, outerR: number, h: number): THREE.BufferGeometry {
  const pts = [
    new THREE.Vector2(innerR, -h),
    new THREE.Vector2(outerR, -h),
    new THREE.Vector2(outerR, h),
    new THREE.Vector2(innerR, h),
    new THREE.Vector2(innerR, -h)
  ];
  const geo = new THREE.LatheGeometry(pts, 180);
  geo.rotateX(Math.PI / 2);
  const pos = geo.attributes.position;
  const uvs = geo.attributes.uv;
  for (let i = 0; i < pos.count; i++) {
    const x = pos.getX(i);
    const y = pos.getY(i);
    uvs.setXY(i, x * 0.5 + 0.5, y * 0.5 + 0.5);
  }
  return geo;
}
