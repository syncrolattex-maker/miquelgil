import * as THREE from "three";
import { Concert } from "@/types/concert";
import { VATData } from "./paperVat";

const TEX_W = 1024;
const TEX_H = 1400;

const FONT_TITLE = '"PP Eiko", Georgia, serif';
const FONT_SUB = '"PP Museum", Georgia, serif';
const FONT_TEXT = '"PP Neue Montreal", -apple-system, BlinkMacSystemFont, sans-serif';

export interface PaperMeshInstance {
  mesh: THREE.Mesh;
  positionAttr: THREE.BufferAttribute;
  normalAttr: THREE.BufferAttribute;
  concert: Concert;
  index: number;
}

function drawCross(ctx: CanvasRenderingContext2D, x: number, y: number, size = 18) {
  ctx.save();
  ctx.strokeStyle = "#111111";
  ctx.lineWidth = 2;
  ctx.beginPath();
  ctx.moveTo(x - size / 2, y);
  ctx.lineTo(x + size / 2, y);
  ctx.moveTo(x, y - size / 2);
  ctx.lineTo(x, y + size / 2);
  ctx.stroke();
  ctx.restore();
}

function drawWrappedText(
  ctx: CanvasRenderingContext2D,
  text: string,
  x: number,
  y: number,
  maxWidth: number,
  lineHeight: number,
  maxLines = 4
): number {
  const words = text.split(" ");
  let line = "";
  let curY = y;
  let linesCount = 0;

  for (let i = 0; i < words.length; i++) {
    const testLine = line ? `${line} ${words[i]}` : words[i];
    const metrics = ctx.measureText(testLine);
    if (metrics.width > maxWidth && line) {
      ctx.fillText(line, x, curY);
      line = words[i];
      curY += lineHeight;
      linesCount++;
      if (linesCount >= maxLines - 1) {
        const remaining = words.slice(i).join(" ");
        letclipped = remaining;
        while (ctx.measureText(letclipped + "…").width > maxWidth && letclipped.length > 0) {
          letclipped = letclipped.slice(0, -1);
        }
        ctx.fillText(letclipped + (letclipped.length < remaining.length ? "…" : ""), x, curY);
        return curY + lineHeight;
      }
    } else {
      line = testLine;
    }
  }
  if (line) {
    ctx.fillText(line, x, curY);
    curY += lineHeight;
  }
  return curY;
}

let letclipped = "";

export function renderConcertPaperCanvas(
  canvas: HTMLCanvasElement,
  concert: Concert,
  idx: number,
  total: number
) {
  const ctx = canvas.getContext("2d");
  if (!ctx) return;

  const padX = 88;
  const contentW = TEX_W - padX * 2;

  // 1. Editorial paper background with subtle grid
  ctx.fillStyle = "#f4f2ec";
  ctx.fillRect(0, 0, TEX_W, TEX_H);

  ctx.strokeStyle = "rgba(17, 17, 17, 0.065)";
  ctx.lineWidth = 1.5;
  const gridStep = 64;
  ctx.beginPath();
  for (let x = gridStep / 2; x <= TEX_W; x += gridStep) {
    ctx.moveTo(x, 0);
    ctx.lineTo(x, TEX_H);
  }
  for (let y = gridStep / 2; y <= TEX_H; y += gridStep) {
    ctx.moveTo(0, y);
    ctx.lineTo(TEX_W, y);
  }
  ctx.stroke();

  // Outer editorial border & corner vector crosses
  ctx.strokeStyle = "rgba(17, 17, 17, 0.28)";
  ctx.lineWidth = 2;
  ctx.strokeRect(52, 52, TEX_W - 104, TEX_H - 104);

  drawCross(ctx, 52, 52, 22);
  drawCross(ctx, TEX_W - 52, 52, 22);
  drawCross(ctx, 52, TEX_H - 52, 22);
  drawCross(ctx, TEX_W - 52, TEX_H - 52, 22);

  // 2. Top Kicker Row
  const numStr = idx + 1 < 10 ? `0${idx + 1}` : `${idx + 1}`;
  const totStr = total < 10 ? `0${total}` : `${total}`;

  ctx.fillStyle = "rgba(17, 17, 17, 0.62)";
  ctx.font = `400 22px ${FONT_SUB}`;
  ctx.textBaseline = "alphabetic";
  ctx.fillText(`MIQUEL GIL · AGENDA DE DIRECTES`, padX, 118);

  const rightKicker = `DATA ${numStr} / ${totStr}`;
  const rkWidth = ctx.measureText(rightKicker).width;
  ctx.fillText(rightKicker, TEX_W - padX - rkWidth, 118);

  // Divider 1
  ctx.fillStyle = "rgba(17, 17, 17, 0.25)";
  ctx.fillRect(padX, 142, contentW, 2);

  // 3. Giant Year + Status pill
  ctx.fillStyle = "#111111";
  ctx.font = `500 132px ${FONT_TITLE}`;
  ctx.fillText(concert.year || "2026", padX, 278);

  // Status & Format on the right of the year
  ctx.textAlign = "right";
  ctx.fillStyle = "rgba(17, 17, 17, 0.58)";
  ctx.font = `400 21px ${FONT_SUB}`;
  ctx.fillText((concert.badge || concert.format).toUpperCase(), TEX_W - padX, 210);

  ctx.fillStyle = "#111111";
  ctx.font = `500 24px ${FONT_TEXT}`;
  ctx.fillText((concert.statusText || "CONCERT EN DIRECTE").toUpperCase(), TEX_W - padX, 250);
  ctx.textAlign = "left";

  // Divider 2
  ctx.fillStyle = "#111111";
  ctx.fillRect(padX, 312, contentW, 2.5);

  // 4. Monumental Concert Title (PP Eiko Uppercase)
  const titleUpper = concert.title.toUpperCase();
  ctx.fillStyle = "#111111";
  let titleFontSize = 72;
  ctx.font = `500 ${titleFontSize}px ${FONT_TITLE}`;
  while (ctx.measureText(titleUpper).width > contentW * 1.85 && titleFontSize > 48) {
    titleFontSize -= 4;
    ctx.font = `500 ${titleFontSize}px ${FONT_TITLE}`;
  }

  const afterTitleY = drawWrappedText(
    ctx,
    titleUpper,
    padX,
    398,
    contentW,
    titleFontSize * 1.08,
    3
  );

  // Subtitle: Format
  const subY = afterTitleY + 18;
  ctx.fillStyle = "rgba(17, 17, 17, 0.68)";
  ctx.font = `400 26px ${FONT_SUB}`;
  ctx.fillText(`FORMAT ESCÈNIC: ${concert.format.toUpperCase()}`, padX, subY);

  // Divider 3
  const gridTopY = subY + 36;
  ctx.fillStyle = "rgba(17, 17, 17, 0.24)";
  ctx.fillRect(padX, gridTopY, contentW, 2);

  // 5. Tabular Metadata Grid (CIUTAT, ESPAI / RECINTE, DATA I HORA)
  const row1Y = gridTopY + 46;
  ctx.fillStyle = "rgba(17, 17, 17, 0.52)";
  ctx.font = `400 20px ${FONT_SUB}`;
  ctx.fillText("CIUTAT / TERRITORI", padX, row1Y);
  ctx.fillText("DATA PROGRAMADA", padX + contentW * 0.52, row1Y);

  ctx.fillStyle = "#111111";
  ctx.font = `500 30px ${FONT_TEXT}`;
  ctx.fillText(concert.city, padX, row1Y + 40);
  ctx.fillText(concert.dateStr, padX + contentW * 0.52, row1Y + 40);

  const divMidY = row1Y + 68;
  ctx.fillStyle = "rgba(17, 17, 17, 0.16)";
  ctx.fillRect(padX, divMidY, contentW, 1.5);

  const row2Y = divMidY + 44;
  ctx.fillStyle = "rgba(17, 17, 17, 0.52)";
  ctx.font = `400 20px ${FONT_SUB}`;
  ctx.fillText("RECINTE / AUDITORI", padX, row2Y);

  ctx.fillStyle = "#111111";
  ctx.font = `500 32px ${FONT_TITLE}`;
  ctx.fillText(concert.venue.toUpperCase(), padX, row2Y + 42);

  const divDescY = row2Y + 72;
  ctx.fillStyle = "rgba(17, 17, 17, 0.24)";
  ctx.fillRect(padX, divDescY, contentW, 2);

  // 6. Editorial Synopsis / Description
  const descLabelY = divDescY + 44;
  ctx.fillStyle = "rgba(17, 17, 17, 0.65)";
  ctx.font = `500 20px ${FONT_TEXT}`;
  ctx.fillText("SINOPSI DEL CONCERT & REPERTORI", padX, descLabelY);

  ctx.fillStyle = "#000000";
  ctx.font = `400 28px ${FONT_TEXT}`;
  drawWrappedText(
    ctx,
    concert.description,
    padX,
    descLabelY + 46,
    contentW,
    40,
    5
  );

  // 7. Bottom Footer Stamp
  const footerLineY = TEX_H - 155;
  ctx.fillStyle = "#111111";
  ctx.fillRect(padX, footerLineY, contentW, 2);

  ctx.fillStyle = "#111111";
  ctx.font = `500 23px ${FONT_TITLE}`;
  ctx.fillText("MIQUELGIL.COM · ARXIU D'ESCENARIS", padX, footerLineY + 46);

  ctx.textAlign = "right";
  ctx.fillStyle = "rgba(17, 17, 17, 0.62)";
  ctx.font = `400 20px ${FONT_SUB}`;
  ctx.fillText("CLICA PER TANCAR I TORNAR A L'ESCENARI", TEX_W - padX, footerLineY + 46);
  ctx.textAlign = "left";
}

export function createConcertPaperMesh(
  animData: VATData,
  concert: Concert,
  idx: number,
  total: number
): PaperMeshInstance {
  const { vertexCount, indices, uvs, positions, normals } = animData;

  const geometry = new THREE.BufferGeometry();

  const positionArray = new Float32Array(vertexCount * 3);
  for (let i = 0; i < vertexCount * 3; i++) {
    positionArray[i] = positions[i];
  }
  const positionAttr = new THREE.BufferAttribute(positionArray, 3);
  positionAttr.setUsage(THREE.DynamicDrawUsage);
  geometry.setAttribute("position", positionAttr);

  const normalArray = new Float32Array(vertexCount * 3);
  for (let i = 0; i < vertexCount * 3; i++) {
    normalArray[i] = normals[i];
  }
  const normalAttr = new THREE.BufferAttribute(normalArray, 3);
  normalAttr.setUsage(THREE.DynamicDrawUsage);
  geometry.setAttribute("normal", normalAttr);

  const uvArray = new Float32Array(uvs.length);
  for (let i = 0; i < uvs.length; i++) {
    uvArray[i] = uvs[i];
  }
  geometry.setAttribute("uv", new THREE.BufferAttribute(uvArray, 2));

  const indexArray = new Uint16Array(indices);
  geometry.setIndex(new THREE.BufferAttribute(indexArray, 1));

  const canvas = document.createElement("canvas");
  canvas.width = TEX_W;
  canvas.height = TEX_H;
  renderConcertPaperCanvas(canvas, concert, idx, total);

  const texture = new THREE.CanvasTexture(canvas);
  texture.colorSpace = THREE.SRGBColorSpace;
  texture.rotation = Math.PI;
  texture.center.set(0.5, 0.5);
  texture.repeat.set(1, -1);

  if (typeof document !== "undefined" && document.fonts) {
    document.fonts.ready.then(() => {
      renderConcertPaperCanvas(canvas, concert, idx, total);
      texture.needsUpdate = true;
    });
  }

  const material = new THREE.MeshStandardMaterial({
    map: texture,
    roughness: 0.88,
    metalness: 0.0,
    side: THREE.DoubleSide,
  });

  const mesh = new THREE.Mesh(geometry, material);

  return {
    mesh,
    positionAttr,
    normalAttr,
    concert,
    index: idx,
  };
}

export function updatePaperFrame(
  paper: PaperMeshInstance,
  animData: VATData,
  frameIdx: number
) {
  const { vertexCount, frameCount, positions, normals } = animData;
  const { positionAttr, normalAttr } = paper;

  const len = vertexCount * 3;
  const clamped = Math.max(0, Math.min(frameIdx, frameCount - 1));
  const f0 = Math.floor(clamped);
  const t = clamped - f0;
  const off0 = f0 * len;

  const posArray = positionAttr.array as Float32Array;
  const nrmArray = normalAttr.array as Float32Array;

  if (t < 1e-6) {
    for (let i = 0; i < len; i++) {
      posArray[i] = positions[off0 + i];
      nrmArray[i] = normals[off0 + i];
    }
  } else {
    const f1 = Math.min(frameCount - 1, f0 + 1);
    const off1 = f1 * len;
    const s = 1 - t;
    for (let i = 0; i < len; i++) {
      posArray[i] = positions[off0 + i] * s + positions[off1 + i] * t;
      nrmArray[i] = normals[off0 + i] * s + normals[off1 + i] * t;
    }
  }

  positionAttr.needsUpdate = true;
  normalAttr.needsUpdate = true;

  paper.mesh.geometry.computeBoundingSphere();
  paper.mesh.geometry.computeBoundingBox();
}
