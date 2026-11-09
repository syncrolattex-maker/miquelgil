import * as THREE from "three";
import { FBXLoader } from "three/examples/jsm/loaders/FBXLoader.js";
import { EXRLoader } from "three/examples/jsm/loaders/EXRLoader.js";

const FRAME_COUNT = 50;

export interface VATData {
  vertexCount: number;
  frameCount: number;
  indices: number[];
  uvs: number[];
  positions: Float32Array;
  normals: Float32Array;
  crumple: {
    center: [number, number, number];
    radius: number;
  };
  flat: {
    width: number;
    depth: number;
  };
}

let cachedVATPromise: Promise<VATData> | null = null;

export async function loadVATData(basePath = "/vat/"): Promise<VATData> {
  if (cachedVATPromise) return cachedVATPromise;

  cachedVATPromise = (async () => {
    const fbxLoader = new FBXLoader();
    const exrLoader = new EXRLoader();
    exrLoader.setDataType(THREE.FloatType);

    const [fbxGroup, posTex] = await Promise.all([
      fbxLoader.loadAsync(basePath + "geo/vertex_animation_textures1_mesh.fbx"),
      exrLoader.loadAsync(basePath + "tex/vertex_animation_textures1_pos.exr"),
    ]);

    let fbxMesh: THREE.Mesh | null = null;
    fbxGroup.traverse((child) => {
      if ((child as THREE.Mesh).isMesh && !fbxMesh) {
        fbxMesh = child as THREE.Mesh;
      }
    });
    if (!fbxMesh) throw new Error("No mesh found in VAT FBX");

    const geo = (fbxMesh as THREE.Mesh).geometry;
    const posAttr = geo.getAttribute("position");
    const uvAttr = geo.getAttribute("uv");
    const indexAttr = geo.getIndex();
    const vertexCount = posAttr.count;
    const vatUvAttr = geo.getAttribute("uv2") || geo.getAttribute("uv1");

    const indices: number[] = [];
    if (indexAttr) {
      for (let i = 0; i < indexAttr.count; i++) indices.push(indexAttr.getX(i));
    } else {
      for (let i = 0; i < vertexCount; i += 3) {
        const hasInvalidVatUv =
          vatUvAttr &&
          ((vatUvAttr.getX(i) === 0 && vatUvAttr.getY(i) === 0) ||
            (vatUvAttr.getX(i + 1) === 0 && vatUvAttr.getY(i + 1) === 0) ||
            (vatUvAttr.getX(i + 2) === 0 && vatUvAttr.getY(i + 2) === 0));
        if (hasInvalidVatUv) continue;
        indices.push(i, i + 1, i + 2);
      }
    }

    const uvs: number[] = [];
    if (uvAttr) {
      for (let i = 0; i < uvAttr.count; i++) {
        uvs.push(uvAttr.getX(i), uvAttr.getY(i));
      }
    }

    const posData = posTex.image.data as Float32Array;
    const texW = posTex.image.width;
    const texH = posTex.image.height;
    const channels = posData.length / (texW * texH);

    const rawFrameCount = FRAME_COUNT;
    let pointCount = vertexCount;

    if (vatUvAttr) {
      pointCount = 0;
      for (let v = 0; v < vertexCount; v++) {
        if (vatUvAttr.getX(v) === 0 && vatUvAttr.getY(v) === 0) continue;
        const col = Math.floor(vatUvAttr.getX(v) * texW);
        const row = Math.floor((1 - vatUvAttr.getY(v)) * texH);
        pointCount = Math.max(pointCount, row * texW + col + 1);
      }
    }

    const rowsPerFrame = Math.ceil(pointCount / texW);
    const vertexPointIds = new Int32Array(vertexCount);

    for (let v = 0; v < vertexCount; v++) {
      let pointId: number;
      if (vatUvAttr) {
        if (vatUvAttr.getX(v) === 0 && vatUvAttr.getY(v) === 0) {
          pointId = 0;
        } else {
          const col = Math.floor(vatUvAttr.getX(v) * texW);
          const row = Math.floor((1 - vatUvAttr.getY(v)) * texH);
          pointId = row * texW + col;
        }
      } else {
        pointId = v;
      }
      vertexPointIds[v] = Math.max(0, Math.min(pointId, pointCount - 1));
    }

    const rawPositions = new Float32Array(vertexCount * 3 * rawFrameCount);
    const totalRows = rawFrameCount * rowsPerFrame;

    for (let frame = 0; frame < rawFrameCount; frame++) {
      for (let v = 0; v < vertexCount; v++) {
        const pointId = vertexPointIds[v];
        const col = pointId % texW;
        const blockRow = Math.floor(pointId / texW);
        const row = totalRows - 1 - (frame * rowsPerFrame + blockRow);
        const pixelIdx = (row * texW + col) * channels;
        const off = (frame * vertexCount + v) * 3;

        rawPositions[off + 0] = posAttr.getX(v) - posData[pixelIdx + 0];
        rawPositions[off + 1] = posAttr.getY(v) + posData[pixelIdx + 1];
        rawPositions[off + 2] = posAttr.getZ(v) + posData[pixelIdx + 2];
      }
    }

    // Trim static frames at start/end
    const frameStride = vertexCount * 3;
    const frameDeltas: number[] = [];
    for (let frame = 0; frame < rawFrameCount - 1; frame++) {
      const a = frame * frameStride;
      const b = (frame + 1) * frameStride;
      let maxDelta = 0;
      for (let i = 0; i < frameStride; i++) {
        const d = Math.abs(rawPositions[a + i] - rawPositions[b + i]);
        if (d > maxDelta) maxDelta = d;
      }
      frameDeltas.push(maxDelta);
    }

    const MOTION_EPSILON = 1e-4;
    let firstMoving = frameDeltas.findIndex((d) => d > MOTION_EPSILON);
    let lastMoving = frameDeltas.length - 1;
    while (lastMoving >= 0 && frameDeltas[lastMoving] <= MOTION_EPSILON) {
      lastMoving--;
    }

    let frameCount = rawFrameCount;
    let positions = rawPositions;
    if (firstMoving > 0 || lastMoving < frameDeltas.length - 1) {
      if (firstMoving === -1) firstMoving = 0;
      frameCount = lastMoving + 2 - firstMoving;
      positions = rawPositions.slice(
        firstMoving * frameStride,
        (firstMoving + frameCount) * frameStride
      );
    }

    const validVerts: number[] = [];
    for (let v = 0; v < vertexCount; v++) {
      if (vatUvAttr && vatUvAttr.getX(v) === 0 && vatUvAttr.getY(v) === 0) continue;
      validVerts.push(v);
    }

    let minFX = Infinity;
    let maxFX = -Infinity;
    let minFZ = Infinity;
    let maxFZ = -Infinity;
    for (const v of validVerts) {
      const x = positions[v * 3 + 0];
      const z = positions[v * 3 + 2];
      if (x < minFX) minFX = x;
      if (x > maxFX) maxFX = x;
      if (z < minFZ) minFZ = z;
      if (z > maxFZ) maxFZ = z;
    }
    const flat = { width: maxFX - minFX, depth: maxFZ - minFZ };

    const lastOff = (frameCount - 1) * frameStride;
    let cx = 0;
    let cy = 0;
    let cz = 0;
    for (const v of validVerts) {
      cx += positions[lastOff + v * 3 + 0];
      cy += positions[lastOff + v * 3 + 1];
      cz += positions[lastOff + v * 3 + 2];
    }
    cx /= validVerts.length;
    cy /= validVerts.length;
    cz /= validVerts.length;

    const dists = new Float32Array(validVerts.length);
    for (let i = 0; i < validVerts.length; i++) {
      const v = validVerts[i];
      const dx = positions[lastOff + v * 3 + 0] - cx;
      const dy = positions[lastOff + v * 3 + 1] - cy;
      const dz = positions[lastOff + v * 3 + 2] - cz;
      dists[i] = Math.sqrt(dx * dx + dy * dy + dz * dz);
    }
    dists.sort();
    const crumple = {
      center: [cx, cy, cz] as [number, number, number],
      radius: dists[Math.floor(validVerts.length * 0.9)],
    };

    const normals = new Float32Array(vertexCount * 3 * frameCount);
    const pointNormals = new Float32Array(pointCount * 3);

    for (let frame = 0; frame < frameCount; frame++) {
      const srcOff = frame * vertexCount * 3;
      pointNormals.fill(0);

      for (let i = 0; i < indices.length; i += 3) {
        const a = indices[i] * 3;
        const b = indices[i + 1] * 3;
        const c = indices[i + 2] * 3;

        const ax = positions[srcOff + a];
        const ay = positions[srcOff + a + 1];
        const az = positions[srcOff + a + 2];
        const e1x = positions[srcOff + b] - ax;
        const e1y = positions[srcOff + b + 1] - ay;
        const e1z = positions[srcOff + b + 2] - az;
        const e2x = positions[srcOff + c] - ax;
        const e2y = positions[srcOff + c + 1] - ay;
        const e2z = positions[srcOff + c + 2] - az;

        const nx = e1y * e2z - e1z * e2y;
        const ny = e1z * e2x - e1x * e2z;
        const nz = e1x * e2y - e1y * e2x;

        for (let k = 0; k < 3; k++) {
          const pid = vertexPointIds[indices[i + k]] * 3;
          pointNormals[pid] += nx;
          pointNormals[pid + 1] += ny;
          pointNormals[pid + 2] += nz;
        }
      }

      for (let p = 0; p < pointCount; p++) {
        const o = p * 3;
        const len = Math.hypot(
          pointNormals[o],
          pointNormals[o + 1],
          pointNormals[o + 2]
        );
        if (len > 1e-10) {
          pointNormals[o] /= len;
          pointNormals[o + 1] /= len;
          pointNormals[o + 2] /= len;
        } else {
          pointNormals[o] = 0;
          pointNormals[o + 1] = 1;
          pointNormals[o + 2] = 0;
        }
      }

      for (let v = 0; v < vertexCount; v++) {
        const pid = vertexPointIds[v] * 3;
        const o = srcOff + v * 3;
        normals[o] = pointNormals[pid];
        normals[o + 1] = pointNormals[pid + 1];
        normals[o + 2] = pointNormals[pid + 2];
      }
    }

    return {
      vertexCount,
      frameCount,
      indices,
      uvs,
      positions,
      normals,
      crumple,
      flat,
    };
  })();

  return cachedVATPromise;
}
