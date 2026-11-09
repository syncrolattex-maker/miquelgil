"use client";

import React, { useEffect, useRef, useState } from "react";
import Link from "next/link";
import * as THREE from "three";
import * as CANNON from "cannon-es";
import { EffectComposer } from "three/examples/jsm/postprocessing/EffectComposer.js";
import { RenderPass } from "three/examples/jsm/postprocessing/RenderPass.js";
import { SSAOPass } from "three/examples/jsm/postprocessing/SSAOPass.js";
import { OutputPass } from "three/examples/jsm/postprocessing/OutputPass.js";
import A24Nav from "@/components/A24Nav";
import { Concert, DEFAULT_CONCERTS } from "@/types/concert";
import { getConcerts, subscribeToConcerts } from "@/lib/concertsService";
import { loadVATData, VATData } from "./paperVat";
import {
  createConcertPaperMesh,
  updatePaperFrame,
  PaperMeshInstance,
} from "./paperTexture";
import "./agenda.css";

interface PaperTransformSnapshot {
  position: THREE.Vector3;
  quaternion: THREE.Quaternion;
  scale: number;
  frameIdx: number;
}

interface PaperEntity extends PaperMeshInstance {
  body: CANNON.Body;
  frameIdx: number;
  state: "closed" | "opening" | "open" | "discarding" | "grabbed" | "rolling";
  time: number;
  homePosition: THREE.Vector3;
  homeRotation: THREE.Euler;
  start: PaperTransformSnapshot | null;
  target: PaperTransformSnapshot | null;
  throw: { settleTimer: number } | null;
  grab?: { target: THREE.Vector3 };
}

function clamp01(value: number) {
  return Math.min(Math.max(value, 0), 1);
}

function easeOutCubic(t: number) {
  return 1 - Math.pow(1 - t, 3);
}

function easeInCubic(t: number) {
  return t * t * t;
}

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

function randomRange(min: number, max: number) {
  return min + Math.random() * (max - min);
}

const DESKTOP_OFFSETS: [number, number, number][] = [
  [-1.35, 0.02, -0.15],
  [-0.45, 0.02, 0.22],
  [0.45, 0.02, -0.12],
  [1.35, 0.02, 0.18],
  [-0.9, 0.02, 0.58],
  [0.9, 0.02, 0.52],
];

const MOBILE_OFFSETS: [number, number, number][] = [
  [-0.48, 0.02, -0.28],
  [0.48, 0.02, -0.22],
  [-0.52, 0.02, 0.34],
  [0.52, 0.02, 0.38],
  [0.0, 0.02, 0.06],
  [-0.38, 0.02, 0.92],
  [0.38, 0.02, 0.88],
];

export default function AgendaClient() {
  const mountRef = useRef<HTMLDivElement>(null);
  const [concertsList, setConcertsList] = useState<Concert[]>(DEFAULT_CONCERTS);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [activeConcert, setActiveConcert] = useState<Concert | null>(null);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);

  const openConcertByIndexRef = useRef<((index: number) => void) | null>(null);
  const closeActivePaperRef = useRef<(() => void) | null>(null);

  // Load concerts from Supabase / local cache
  useEffect(() => {
    let isMounted = true;
    getConcerts().then((data) => {
      if (isMounted && data && data.length > 0) {
        setConcertsList(data);
      }
    });

    const unsubscribe = subscribeToConcerts((updated) => {
      if (isMounted && updated && updated.length > 0) {
        setConcertsList(updated);
      }
    });

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  // Initialize Three.js + Houdini VAT + cannon-es Paper Crumble scene
  useEffect(() => {
    const container = mountRef.current;
    if (!container) return;

    let disposed = false;
    const timeouts: number[] = [];

    // 1. Scene & A24 Editorial Palette (Black / Warm Editorial Grey / Off-White)
    const scene = new THREE.Scene();
    const bgColor = "#141413";
    const floorColor = "#dedbd2";
    scene.background = new THREE.Color(bgColor);

    const FLOOR_VISUAL_Y = -0.1;
    const WALL_Z = -1.1;

    function getViewportProfile() {
      const w = window.innerWidth;
      const h = window.innerHeight;
      const isMobile = w <= 768;
      const isPortrait = w < h;

      if (isMobile) {
        return {
          isMobile: true,
          fov: isPortrait ? 47 : 42,
          camX: 0,
          camY: isPortrait ? 2.85 : 2.35,
          camZ: isPortrait ? 4.45 : 3.8,
          targetY: isPortrait ? 0.16 : 0.28,
          bounds: {
            minX: isPortrait ? -0.98 : -1.55,
            maxX: isPortrait ? 0.98 : 1.55,
            minZ: WALL_Z + 0.18,
            maxZ: isPortrait ? 1.52 : 1.58,
          },
          openRatioW: 0.91,
          openRatioH: 0.56,
          openYShift: 0.05,
        };
      }

      return {
        isMobile: false,
        fov: 40,
        camX: 0,
        camY: 2.2,
        camZ: 3.6,
        targetY: 0.35,
        bounds: {
          minX: -2.35,
          maxX: 2.35,
          minZ: WALL_Z + 0.15,
          maxZ: 1.65,
        },
        openRatioW: 0.84,
        openRatioH: 0.82,
        openYShift: 0.0,
      };
    }

    let profile = getViewportProfile();

    const camera = new THREE.PerspectiveCamera(
      profile.fov,
      window.innerWidth / window.innerHeight,
      0.01,
      100
    );
    camera.position.set(profile.camX, profile.camY, profile.camZ);
    camera.lookAt(0, profile.targetY, 0);

    const renderer = new THREE.WebGLRenderer({ antialias: true });
    renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
    renderer.setSize(window.innerWidth, window.innerHeight);
    renderer.outputColorSpace = THREE.SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = THREE.PCFSoftShadowMap;
    renderer.domElement.style.touchAction = "none";
    container.innerHTML = "";
    container.appendChild(renderer.domElement);

    // 2. Stage Floor & Backdrop Wall
    const floorMat = new THREE.MeshStandardMaterial({
      color: floorColor,
      roughness: 0.92,
      metalness: 0.0,
    });
    const floor = new THREE.Mesh(new THREE.PlaneGeometry(16, 12), floorMat);
    floor.rotation.x = -Math.PI / 2;
    floor.position.set(0, FLOOR_VISUAL_Y, 1);
    floor.receiveShadow = true;
    scene.add(floor);

    const wallMat = new THREE.MeshStandardMaterial({
      color: bgColor,
      roughness: 0.95,
      metalness: 0.0,
    });
    const wall = new THREE.Mesh(new THREE.PlaneGeometry(16, 8), wallMat);
    wall.position.set(0, FLOOR_VISUAL_Y + 4, WALL_Z);
    wall.receiveShadow = true;
    scene.add(wall);

    // 3. Studio Lighting
    const ambient = new THREE.AmbientLight(0xffffff, 1.25);
    scene.add(ambient);

    const dirLight = new THREE.DirectionalLight(0xffffff, 1.18);
    dirLight.position.set(-2, 2.6, 1.4);
    dirLight.castShadow = true;
    dirLight.shadow.mapSize.set(profile.isMobile ? 1024 : 2048, profile.isMobile ? 1024 : 2048);
    dirLight.shadow.camera.left = -4;
    dirLight.shadow.camera.right = 4;
    dirLight.shadow.camera.top = 4;
    dirLight.shadow.camera.bottom = -3;
    dirLight.shadow.camera.near = 0.1;
    dirLight.shadow.camera.far = 12;
    dirLight.shadow.bias = -0.001;
    scene.add(dirLight);

    // 4. Post-processing (SSAO creases + OutputPass)
    const composer = new EffectComposer(renderer);
    composer.addPass(new RenderPass(scene, camera));

    const ssaoPass = new SSAOPass(
      scene,
      camera,
      window.innerWidth,
      window.innerHeight
    );
    ssaoPass.kernelRadius = 0.01;
    ssaoPass.minDistance = 0.0001;
    ssaoPass.maxDistance = 0.08;
    composer.addPass(ssaoPass);
    composer.addPass(new OutputPass());

    // 5. Physics Constants & World
    const OPEN_DISTANCE = 1.5;
    const CLOSED_SCALE = profile.isMobile ? 0.78 : 0.82;
    const OPEN_DURATION = 1.1;
    const DISCARD_DURATION = 1.2;
    const ANIM_SPEED = 1.55;
    const OPEN_FRAME = 4;
    const ROLL_LINEAR_RESISTANCE = 2.6;
    const ROLL_ANGULAR_RESISTANCE = 4.5;
    const ROLL_SETTLE_SPEED = 0.018;
    const PHYSICS_STEP = 1 / 60;
    const PAPER_MASS = 0.16;
    const GRAB_LIFT = 0.5;
    const GRAB_STIFFNESS = 14;
    const GRAB_MAX_SPEED = 4.5;
    const THROW_MAX_SPEED = 3.2;
    const CLICK_DRAG_THRESHOLD_PX = profile.isMobile ? 12 : 6;
    const BOUNDS_PULL = 3.2;

    const flatSize = { width: 1, depth: 1.4 };
    let collisionRadius = 0.25;
    let restCenterY = FLOOR_VISUAL_Y + 0.25;
    let restMeshY = 0.02;
    const crumpleCenter = new THREE.Vector3(0, 0.2, 0);

    const physicsWorld = new CANNON.World({
      gravity: new CANNON.Vec3(0, -7.0, 0),
    });
    physicsWorld.allowSleep = false;
    physicsWorld.defaultContactMaterial.friction = 0.8;
    physicsWorld.defaultContactMaterial.restitution = 0.15;

    const paperMaterial = new CANNON.Material("paper");
    const floorPhysicsMaterial = new CANNON.Material("floor");
    physicsWorld.addContactMaterial(
      new CANNON.ContactMaterial(paperMaterial, floorPhysicsMaterial, {
        friction: 1.0,
        restitution: 0.12,
      })
    );
    physicsWorld.addContactMaterial(
      new CANNON.ContactMaterial(paperMaterial, paperMaterial, {
        friction: 0.6,
        restitution: 0.3,
      })
    );

    const floorBody = new CANNON.Body({
      mass: 0,
      material: floorPhysicsMaterial,
      shape: new CANNON.Plane(),
      position: new CANNON.Vec3(0, FLOOR_VISUAL_Y, 0),
      quaternion: new CANNON.Quaternion().setFromEuler(-Math.PI / 2, 0, 0),
    });
    physicsWorld.addBody(floorBody);

    const papers: PaperEntity[] = [];
    let animData: VATData | null = null;
    let activePaper: PaperEntity | null = null;

    const _crumpleOffset = new THREE.Vector3();
    function crumpleWorldOffset(scale: number, quaternion: THREE.Quaternion) {
      return _crumpleOffset
        .copy(crumpleCenter)
        .multiplyScalar(scale)
        .applyQuaternion(quaternion);
    }

    function createPaperBody(baseMesh: THREE.Mesh) {
      const off = crumpleWorldOffset(CLOSED_SCALE, baseMesh.quaternion);
      const body = new CANNON.Body({
        mass: PAPER_MASS,
        material: paperMaterial,
        shape: new CANNON.Sphere(collisionRadius),
        linearDamping: 0.15,
        angularDamping: 0.35,
        position: new CANNON.Vec3(
          baseMesh.position.x + off.x,
          baseMesh.position.y + off.y,
          baseMesh.position.z + off.z
        ),
      });
      body.quaternion.set(
        baseMesh.quaternion.x,
        baseMesh.quaternion.y,
        baseMesh.quaternion.z,
        baseMesh.quaternion.w
      );
      physicsWorld.addBody(body);
      return body;
    }

    function setPaperBodyDynamic(paper: PaperEntity, enabled: boolean) {
      const body = paper.body;
      body.type = enabled ? CANNON.Body.DYNAMIC : CANNON.Body.KINEMATIC;
      body.mass = enabled ? PAPER_MASS : 0;
      body.collisionFilterGroup = enabled ? 1 : 0;
      body.collisionFilterMask = enabled ? 1 : 0;
      if (!enabled) {
        body.velocity.set(0, 0, 0);
        body.angularVelocity.set(0, 0, 0);
        body.force.set(0, 0, 0);
        body.torque.set(0, 0, 0);
      }
      body.updateMassProperties();
      body.wakeUp();
    }

    function syncBodyToMesh(paper: PaperEntity) {
      const off = crumpleWorldOffset(paper.mesh.scale.x, paper.mesh.quaternion);
      paper.body.position.set(
        paper.mesh.position.x + off.x,
        paper.mesh.position.y + off.y,
        paper.mesh.position.z + off.z
      );
      paper.body.quaternion.set(
        paper.mesh.quaternion.x,
        paper.mesh.quaternion.y,
        paper.mesh.quaternion.z,
        paper.mesh.quaternion.w
      );
    }

    function syncMeshToBody(paper: PaperEntity, scale = CLOSED_SCALE) {
      paper.mesh.quaternion.set(
        paper.body.quaternion.x,
        paper.body.quaternion.y,
        paper.body.quaternion.z,
        paper.body.quaternion.w
      );
      const off = crumpleWorldOffset(scale, paper.mesh.quaternion);
      paper.mesh.position.set(
        paper.body.position.x - off.x,
        paper.body.position.y - off.y,
        paper.body.position.z - off.z
      );
      paper.mesh.scale.setScalar(scale);
    }

    function isOnGround(body: CANNON.Body) {
      return body.position.y <= restCenterY + 0.05;
    }

    function applyRollingResistance(body: CANNON.Body, dt: number) {
      const linearDecay = Math.exp(-ROLL_LINEAR_RESISTANCE * dt);
      const angularDecay = Math.exp(-ROLL_ANGULAR_RESISTANCE * dt);
      body.velocity.x *= linearDecay;
      body.velocity.z *= linearDecay;
      body.angularVelocity.x *= angularDecay;
      body.angularVelocity.y *= angularDecay;
      body.angularVelocity.z *= angularDecay;
    }

    function finishRollingPaper(paper: PaperEntity, maxFrame: number) {
      if (!animData) return;
      paper.state = "closed";
      paper.time = 0;
      paper.homePosition.copy(paper.mesh.position);
      paper.homeRotation.copy(paper.mesh.rotation);
      paper.frameIdx = maxFrame;
      updatePaperFrame(paper, animData, paper.frameIdx);
      syncBodyToMesh(paper);
      syncMeshToBody(paper);
    }

    function applyPhysicsBounds(dt: number) {
      const b = profile.bounds;
      const minX = b.minX + collisionRadius;
      const maxX = b.maxX - collisionRadius;
      const minZ = b.minZ + collisionRadius;
      const maxZ = b.maxZ - collisionRadius;

      for (const paper of papers) {
        if (!paper.body || paper.body.type !== CANNON.Body.DYNAMIC) continue;
        const body = paper.body;
        if (body.position.x < minX) {
          if (body.velocity.x < 0) body.velocity.x = Math.abs(body.velocity.x) * 0.42;
          body.velocity.x += BOUNDS_PULL * dt;
        } else if (body.position.x > maxX) {
          if (body.velocity.x > 0) body.velocity.x = -Math.abs(body.velocity.x) * 0.42;
          body.velocity.x -= BOUNDS_PULL * dt;
        }

        if (body.position.z < minZ) {
          if (body.velocity.z < 0) body.velocity.z = Math.abs(body.velocity.z) * 0.42;
          body.velocity.z += BOUNDS_PULL * dt;
        } else if (body.position.z > maxZ) {
          if (body.velocity.z > 0) body.velocity.z = -Math.abs(body.velocity.z) * 0.42;
          body.velocity.z -= BOUNDS_PULL * dt;
        }
      }
    }

    function captureTransform(paper: PaperEntity): PaperTransformSnapshot {
      return {
        position: paper.mesh.position.clone(),
        quaternion: paper.mesh.quaternion.clone(),
        scale: paper.mesh.scale.x,
        frameIdx: paper.frameIdx,
      };
    }

    const _viewDir = new THREE.Vector3();
    function computeOpenPose() {
      camera.getWorldDirection(_viewDir);
      const position = camera.position
        .clone()
        .addScaledVector(_viewDir, OPEN_DISTANCE);

      const yAxis = _viewDir.clone().negate();
      const zAxis = new THREE.Vector3(0, 1, 0).applyQuaternion(camera.quaternion);
      const xAxis = new THREE.Vector3().crossVectors(yAxis, zAxis);
      const quaternion = new THREE.Quaternion().setFromRotationMatrix(
        new THREE.Matrix4().makeBasis(xAxis, yAxis, zAxis)
      );

      if (profile.openYShift !== 0) {
        position.addScaledVector(zAxis, profile.openYShift);
      }

      const viewH =
        2 * Math.tan(THREE.MathUtils.degToRad(camera.fov * 0.5)) * OPEN_DISTANCE;
      const viewW = viewH * camera.aspect;
      const scale = Math.min(
        (viewH * profile.openRatioH) / flatSize.depth,
        (viewW * profile.openRatioW) / flatSize.width
      );

      return { position, quaternion, scale };
    }

    function updateOpenPose() {
      if (!activePaper) return;
      if (activePaper.state === "opening" && activePaper.target) {
        const pose = computeOpenPose();
        activePaper.target.position.copy(pose.position);
        activePaper.target.quaternion.copy(pose.quaternion);
        activePaper.target.scale = pose.scale;
      } else if (activePaper.state === "open") {
        const pose = computeOpenPose();
        activePaper.mesh.position.copy(pose.position);
        activePaper.mesh.quaternion.copy(pose.quaternion);
        activePaper.mesh.scale.setScalar(pose.scale);
      }
    }

    function initialPaperPosition(i: number) {
      const offsets = profile.isMobile ? MOBILE_OFFSETS : DESKTOP_OFFSETS;
      const b = profile.bounds;
      if (i < offsets.length) {
        return new THREE.Vector3(
          offsets[i][0] + randomRange(-0.08, 0.08),
          restMeshY,
          offsets[i][2] + randomRange(-0.08, 0.08)
        );
      }
      const margin = collisionRadius * 1.25;
      return new THREE.Vector3(
        randomRange(b.minX + margin, b.maxX - margin),
        restMeshY,
        randomRange(b.minZ + margin, b.maxZ - margin)
      );
    }

    function spawnPaper(
      concert: Concert,
      idx: number,
      total: number,
      position: THREE.Vector3,
      dropIn: boolean,
      dropHeight = randomRange(3.2, 6.4)
    ) {
      if (!animData) return;
      const maxFrame = animData.frameCount - 1;
      const base = createConcertPaperMesh(animData, concert, idx, total);
      base.mesh.castShadow = true;
      base.mesh.rotation.set(
        0,
        Math.PI + randomRange(-0.28, 0.28),
        randomRange(-0.2, 0.2)
      );
      base.mesh.position.copy(position);
      base.mesh.scale.setScalar(CLOSED_SCALE);
      scene.add(base.mesh);
      const body = createPaperBody(base.mesh);

      const paper: PaperEntity = {
        ...base,
        body,
        frameIdx: maxFrame,
        state: "closed",
        time: 0,
        homePosition: base.mesh.position.clone(),
        homeRotation: base.mesh.rotation.clone(),
        start: null,
        target: null,
        throw: null,
      };
      updatePaperFrame(paper, animData, maxFrame);
      papers.push(paper);

      if (dropIn) {
        paper.state = "rolling";
        paper.throw = { settleTimer: 0 };
        body.position.y += dropHeight;
        body.angularVelocity.set(
          randomRange(-1.6, 1.6),
          randomRange(-0.6, 0.6),
          randomRange(-1.6, 1.6)
        );
        syncMeshToBody(paper);
      }
      return paper;
    }

    function startOpen(paper: PaperEntity) {
      setPaperBodyDynamic(paper, false);
      syncMeshToBody(paper);
      paper.state = "opening";
      paper.time = 0;
      paper.start = captureTransform(paper);
      const pose = computeOpenPose();
      paper.target = {
        position: pose.position,
        quaternion: pose.quaternion,
        scale: pose.scale,
        frameIdx: OPEN_FRAME,
      };
      setActiveConcert(paper.concert);
      setActiveIndex(paper.index);
    }

    function startDiscard(paper: PaperEntity) {
      if (paper.state === "discarding" || paper.state === "rolling") return;

      const dir = new THREE.Vector3(
        randomRange(-0.85, 0.85),
        0,
        randomRange(-1.2, -0.4)
      ).normalize();

      paper.state = "discarding";
      paper.time = 0;
      paper.start = captureTransform(paper);
      setPaperBodyDynamic(paper, true);
      syncBodyToMesh(paper);
      paper.body.velocity.set(
        dir.x * randomRange(1.2, 1.8),
        randomRange(0.45, 0.85),
        dir.z * randomRange(1.2, 1.8)
      );
      paper.body.angularVelocity.set(
        randomRange(-2.4, 2.4),
        randomRange(-0.8, 0.8),
        randomRange(-2.4, 2.4)
      );
      paper.throw = { settleTimer: 0 };
    }

    openConcertByIndexRef.current = (idx: number) => {
      const targetPaper = papers.find((p) => p.index === idx);
      if (!targetPaper) return;

      if (activePaper && activePaper !== targetPaper) {
        startDiscard(activePaper);
        activePaper = null;
      }

      if (activePaper === targetPaper) {
        startDiscard(targetPaper);
        activePaper = null;
        setActiveConcert(null);
        setActiveIndex(null);
        return;
      }

      startOpen(targetPaper);
      activePaper = targetPaper;
    };

    closeActivePaperRef.current = () => {
      if (activePaper) {
        startDiscard(activePaper);
        activePaper = null;
        setActiveConcert(null);
        setActiveIndex(null);
      }
    };

    // 6. Raycasting & Pointer Interactions (Click/Tap to unfold/crumple, Drag to throw)
    const raycaster = new THREE.Raycaster();
    const pointer = new THREE.Vector2();
    const grabPlane = new THREE.Plane();
    const grabHitPoint = new THREE.Vector3();
    let pointerState: {
      paper: PaperEntity | null;
      pointerId: number;
      startX: number;
      startY: number;
      grabbing: boolean;
    } | null = null;

    function updatePointer(e: PointerEvent) {
      pointer.x = (e.clientX / window.innerWidth) * 2 - 1;
      pointer.y = -(e.clientY / window.innerHeight) * 2 + 1;
    }

    function pickPaper(e: PointerEvent): PaperEntity | null {
      updatePointer(e);
      raycaster.setFromCamera(pointer, camera);
      const hit = raycaster.intersectObjects(papers.map((p) => p.mesh));
      if (hit.length === 0) return null;
      return papers.find((p) => p.mesh === hit[0].object) || null;
    }

    function isGrabbable(paper: PaperEntity) {
      return paper.state === "closed" || paper.state === "rolling";
    }

    function beginGrab(paper: PaperEntity, e: PointerEvent) {
      if (!pointerState) return;
      pointerState.grabbing = true;
      paper.state = "grabbed";
      paper.time = 0;

      const body = paper.body;
      body.type = CANNON.Body.KINEMATIC;
      body.mass = 0;
      body.updateMassProperties();
      body.velocity.set(0, 0, 0);
      body.angularVelocity.set(0, 0, 0);
      body.collisionFilterGroup = 1;
      body.collisionFilterMask = 1;
      body.wakeUp();

      paper.grab = {
        target: new THREE.Vector3(
          body.position.x,
          restCenterY + GRAB_LIFT,
          body.position.z
        ),
      };
      updateGrabTarget(paper, e);
      renderer.domElement.style.cursor = "grabbing";
    }

    function updateGrabTarget(paper: PaperEntity, e: PointerEvent) {
      if (!paper.grab) return;
      updatePointer(e);
      raycaster.setFromCamera(pointer, camera);
      grabPlane.normal.set(0, 1, 0);
      grabPlane.constant = -(restCenterY + GRAB_LIFT);
      if (!raycaster.ray.intersectPlane(grabPlane, grabHitPoint)) return;

      const b = profile.bounds;
      paper.grab.target.set(
        Math.min(
          Math.max(grabHitPoint.x, b.minX + collisionRadius),
          b.maxX - collisionRadius
        ),
        restCenterY + GRAB_LIFT,
        Math.min(
          Math.max(grabHitPoint.z, b.minZ + collisionRadius),
          b.maxZ - collisionRadius
        )
      );
    }

    function releaseGrab(paper: PaperEntity, withThrow: boolean) {
      const body = paper.body;
      let vx = withThrow ? body.velocity.x : 0;
      let vz = withThrow ? body.velocity.z : 0;
      const speed = Math.hypot(vx, vz);
      if (speed > THROW_MAX_SPEED) {
        const k = THROW_MAX_SPEED / speed;
        vx *= k;
        vz *= k;
      }

      body.type = CANNON.Body.DYNAMIC;
      body.mass = PAPER_MASS;
      body.updateMassProperties();
      body.velocity.set(vx, 0, vz);
      body.angularVelocity.set(
        (vz / collisionRadius) * 0.6,
        0,
        (-vx / collisionRadius) * 0.6
      );
      body.wakeUp();

      paper.state = "rolling";
      paper.time = 0;
      paper.throw = { settleTimer: 0 };
      renderer.domElement.style.cursor = "grab";
    }

    function handleClick(e: PointerEvent) {
      const p = pickPaper(e);
      if (!p) {
        if (activePaper) {
          startDiscard(activePaper);
          activePaper = null;
          setActiveConcert(null);
          setActiveIndex(null);
        }
        return;
      }

      const previousActive = activePaper;
      if (previousActive) {
        startDiscard(previousActive);
        activePaper = null;
        setActiveConcert(null);
        setActiveIndex(null);
      }

      if (previousActive === p || p.state !== "closed") return;

      startOpen(p);
      activePaper = p;
    }

    const onPointerDown = (e: PointerEvent) => {
      if (!animData || pointerState) return;
      const p = pickPaper(e);
      pointerState = {
        paper: p,
        pointerId: e.pointerId,
        startX: e.clientX,
        startY: e.clientY,
        grabbing: false,
      };
      try {
        renderer.domElement.setPointerCapture(e.pointerId);
      } catch {
        // ignore synthetic events
      }

      if (p && p.state === "rolling") beginGrab(p, e);
    };

    const onPointerMove = (e: PointerEvent) => {
      if (!pointerState) {
        if (!animData || profile.isMobile) return;
        const p = pickPaper(e);
        renderer.domElement.style.cursor = p
          ? isGrabbable(p)
            ? "grab"
            : "pointer"
          : "";
        return;
      }
      if (e.pointerId !== pointerState.pointerId) return;

      if (!pointerState.grabbing) {
        const p = pointerState.paper;
        const moved = Math.hypot(
          e.clientX - pointerState.startX,
          e.clientY - pointerState.startY
        );
        if (p && isGrabbable(p) && moved > CLICK_DRAG_THRESHOLD_PX) {
          beginGrab(p, e);
        }
      }
      if (pointerState.grabbing && pointerState.paper) {
        updateGrabTarget(pointerState.paper, e);
      }
    };

    const onPointerUp = (e: PointerEvent) => {
      if (!pointerState || e.pointerId !== pointerState.pointerId) return;
      if (pointerState.grabbing && pointerState.paper) {
        releaseGrab(pointerState.paper, true);
      } else {
        handleClick(e);
      }
      pointerState = null;
    };

    const onPointerCancel = (e: PointerEvent) => {
      if (!pointerState || e.pointerId !== pointerState.pointerId) return;
      if (pointerState.grabbing && pointerState.paper) {
        releaseGrab(pointerState.paper, false);
      }
      pointerState = null;
    };

    renderer.domElement.addEventListener("pointerdown", onPointerDown);
    renderer.domElement.addEventListener("pointermove", onPointerMove);
    renderer.domElement.addEventListener("pointerup", onPointerUp);
    renderer.domElement.addEventListener("pointercancel", onPointerCancel);

    // 7. Animation Loop
    let prevTime = performance.now() / 1000;

    function updatePaperMotion(paper: PaperEntity, dt: number) {
      if (!animData) return;
      const maxFrame = animData.frameCount - 1;

      if (paper.state === "opening" && paper.start && paper.target) {
        paper.time += dt * ANIM_SPEED;
        const t = clamp01(paper.time / OPEN_DURATION);
        const e = easeOutCubic(t);
        const openEase = easeInCubic(t);

        paper.mesh.position.lerpVectors(
          paper.start.position,
          paper.target.position,
          e
        );
        paper.mesh.quaternion.slerpQuaternions(
          paper.start.quaternion,
          paper.target.quaternion,
          e
        );
        paper.mesh.scale.setScalar(lerp(paper.start.scale, paper.target.scale, e));

        paper.frameIdx = lerp(
          paper.start.frameIdx,
          paper.target.frameIdx,
          openEase
        );
        updatePaperFrame(paper, animData, paper.frameIdx);

        if (t >= 1) {
          paper.state = "open";
          paper.frameIdx = paper.target.frameIdx;
          paper.mesh.position.copy(paper.target.position);
          paper.mesh.quaternion.copy(paper.target.quaternion);
          paper.mesh.scale.setScalar(paper.target.scale);
          syncBodyToMesh(paper);
          updatePaperFrame(paper, animData, paper.frameIdx);
        }
        return;
      }

      if (paper.state === "discarding" && paper.start) {
        paper.time += dt * ANIM_SPEED;
        const t = clamp01(paper.time / DISCARD_DURATION);
        const closeEase = easeOutCubic(t);
        const scale = lerp(paper.start.scale, CLOSED_SCALE, closeEase);

        paper.frameIdx = lerp(paper.start.frameIdx, maxFrame, closeEase);
        syncMeshToBody(paper, scale);
        updatePaperFrame(paper, animData, paper.frameIdx);

        if (t >= 1) {
          paper.state = "rolling";
          paper.time = 0;
          paper.frameIdx = maxFrame;
          updatePaperFrame(paper, animData, paper.frameIdx);
        }
        return;
      }

      if (paper.state === "grabbed" && paper.grab) {
        const body = paper.body;
        const target = paper.grab.target;
        let vx = (target.x - body.position.x) * GRAB_STIFFNESS;
        let vy = (target.y - body.position.y) * GRAB_STIFFNESS;
        let vz = (target.z - body.position.z) * GRAB_STIFFNESS;
        const speed = Math.hypot(vx, vy, vz);
        if (speed > GRAB_MAX_SPEED) {
          const k = GRAB_MAX_SPEED / speed;
          vx *= k;
          vy *= k;
          vz *= k;
        }
        body.velocity.set(vx, vy, vz);
        syncMeshToBody(paper);
        return;
      }

      if (paper.state === "rolling") {
        paper.time += dt;
        const grounded = isOnGround(paper.body);
        if (grounded) applyRollingResistance(paper.body, dt);
        syncMeshToBody(paper);
        const speed =
          paper.body.velocity.lengthSquared() +
          paper.body.angularVelocity.lengthSquared() * 0.02;
        if (paper.throw) {
          paper.throw.settleTimer =
            grounded && speed < ROLL_SETTLE_SPEED
              ? paper.throw.settleTimer + dt
              : 0;
          if (paper.throw.settleTimer > 0.35) {
            finishRollingPaper(paper, maxFrame);
          }
        }
        return;
      }

      if (paper.state === "closed") {
        if (isOnGround(paper.body)) applyRollingResistance(paper.body, dt);
        syncMeshToBody(paper);
      }
    }

    function tick() {
      if (disposed) return;
      const now = performance.now() / 1000;
      const dt = now - prevTime;
      prevTime = now;

      if (animData) {
        physicsWorld.step(PHYSICS_STEP, Math.min(dt, 0.05), 3);
        applyPhysicsBounds(dt);
        for (const p of papers) {
          updatePaperMotion(p, dt);
        }
      }

      composer.render();
    }

    renderer.setAnimationLoop(tick);

    // 8. Load VAT data & drop crumpled concert papers onto the stage
    loadVATData("/vat/")
      .then((loaded) => {
        if (disposed) return;
        animData = loaded;
        flatSize.width = animData.flat.width;
        flatSize.depth = animData.flat.depth;

        crumpleCenter.fromArray(animData.crumple.center);
        collisionRadius = animData.crumple.radius * CLOSED_SCALE;
        restCenterY = FLOOR_VISUAL_Y + collisionRadius * 1.08;
        restMeshY = restCenterY - crumpleCenter.y * CLOSED_SCALE;
        floorBody.position.y = restCenterY - collisionRadius;

        setIsLoading(false);

        // On mobile spawn 12 paper balls so the narrow portrait stage stays clean and responsive;
        // on desktop spawn 18 paper balls across the wide stage.
        const totalBalls = profile.isMobile
          ? Math.max(concertsList.length * 2, 12)
          : Math.max(concertsList.length * 3, 18);

        for (let i = 0; i < totalBalls; i++) {
          const concert = concertsList[i % concertsList.length];
          const concertIdx = i % concertsList.length;
          const delay = i * 55 + randomRange(0, 80);
          const tid = window.setTimeout(() => {
            if (disposed) return;
            spawnPaper(
              concert,
              concertIdx,
              concertsList.length,
              initialPaperPosition(i),
              true,
              randomRange(3.5, 6.8)
            );
          }, delay);
          timeouts.push(tid);
        }
      })
      .catch((err) => {
        console.error("[PaperCrumble] Error loading VAT:", err);
        setIsLoading(false);
      });

    // 9. Resize & Keyboard Escape handler
    const onResize = () => {
      profile = getViewportProfile();
      camera.fov = profile.fov;
      camera.aspect = window.innerWidth / window.innerHeight;
      camera.position.set(profile.camX, profile.camY, profile.camZ);
      camera.lookAt(0, profile.targetY, 0);
      camera.updateProjectionMatrix();
      renderer.setSize(window.innerWidth, window.innerHeight);
      composer.setSize(window.innerWidth, window.innerHeight);
      updateOpenPose();
    };

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape" && activePaper) {
        startDiscard(activePaper);
        activePaper = null;
        setActiveConcert(null);
        setActiveIndex(null);
      }
    };

    window.addEventListener("resize", onResize);
    window.addEventListener("keydown", onKeyDown);

    return () => {
      disposed = true;
      timeouts.forEach((t) => clearTimeout(t));
      window.removeEventListener("resize", onResize);
      window.removeEventListener("keydown", onKeyDown);
      renderer.setAnimationLoop(null);
      renderer.domElement.removeEventListener("pointerdown", onPointerDown);
      renderer.domElement.removeEventListener("pointermove", onPointerMove);
      renderer.domElement.removeEventListener("pointerup", onPointerUp);
      renderer.domElement.removeEventListener("pointercancel", onPointerCancel);
      renderer.dispose();
    };
  }, [concertsList]);

  return (
    <div className="agenda-crumble-page">
      {/* MENÚ DE NAVEGACIÓ A24 INTEGRAT */}
      <A24Nav currentSection="/agenda/" theme="base" />

      {/* LLENÇ 3D PAPER CRUMBLE A PANTALLA COMPLETA (100VW x 100VH) */}
      <div
        ref={mountRef}
        className="agenda-crumble-canvas"
        aria-label="Agenda interactiva de concerts en 3D"
      />

      {/* CAPÇALERA EDITORIAL DISCRETA A24 */}
      <header className="agenda-crumble-hud-top">
        <div className="agenda-crumble-hud-top__left">
          <span className="agenda-crumble-kicker">
            MIQUEL GIL · AGENDA INTERACTIVA DE DIRECTES (2026 — 2027)
          </span>
          <h1 className="agenda-crumble-title">DIRECTES</h1>
        </div>

        <div className="agenda-crumble-hud-top__right">
          <span className="agenda-crumble-instruction agenda-crumble-instruction--desktop">
            CLICA UNA BOLA DE PAPER PER DESPLEGAR EL CONCERT · ARROSSEGA PER LLANÇAR
          </span>
          <span className="agenda-crumble-instruction agenda-crumble-instruction--mobile">
            TOCA UNA BOLA O UNA DATA INFERIOR PER DESPLEGAR · ARROSSEGA PER LLANÇAR
          </span>
        </div>
      </header>

      {/* INDICADOR DE CÀRREGA */}
      {isLoading && (
        <div className="agenda-crumble-loader">
          <span className="agenda-crumble-kicker">
            CARREGANT SIMULACIÓ D&apos;AGENDA EN DIRECTE...
          </span>
        </div>
      )}

      {/* ACCIONS RÀPIDES QUAN UN CONCERT ESTÀ DESPLEGAT EN PRIMER PLA */}
      {activeConcert && (
        <div className="agenda-crumble-active-bar">
          <div className="agenda-crumble-active-bar__info">
            <span className="agenda-crumble-kicker">
              {activeConcert.year} · {activeConcert.city.toUpperCase()}
            </span>
            <span className="agenda-crumble-active-bar__name">
              {activeConcert.title} — {activeConcert.venue}
            </span>
          </div>

          <div className="agenda-crumble-active-bar__actions">
            {(activeConcert.ticketUrl || activeConcert.infoUrl) && (
              <a
                href={activeConcert.ticketUrl || activeConcert.infoUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="agenda-crumble-btn"
              >
                <span>ENTRADES / INFO ↗</span>
              </a>
            )}

            <Link href="/contractacio/" className="agenda-crumble-btn">
              <span>CONTRACTACIÓ ↗</span>
            </Link>

            <button
              type="button"
              onClick={() => closeActivePaperRef.current?.()}
              className="agenda-crumble-btn"
            >
              <span>TANCAR [×]</span>
            </button>
          </div>
        </div>
      )}

      {/* BARRA INFERIOR D'ÍNDEX RÀPID DE DATES (SEMPRE ACCESSIBLE EN DESKTOP I MÒBIL) */}
      <nav
        className="agenda-crumble-dock"
        aria-label="Índex ràpid de concerts de l'agenda"
      >
        {concertsList.map((c, idx) => {
          const isSelected = activeIndex === idx;
          const num = idx + 1 < 10 ? `0${idx + 1}` : `${idx + 1}`;
          return (
            <button
              key={c.id}
              type="button"
              onClick={() => openConcertByIndexRef.current?.(idx)}
              className={`agenda-crumble-dock__item ${
                isSelected ? "is-active" : ""
              }`}
            >
              <span className="agenda-crumble-dock__num">
                {num} · {c.year}
              </span>
              <span className="agenda-crumble-dock__city">{c.city}</span>
            </button>
          );
        })}
      </nav>
    </div>
  );
}
