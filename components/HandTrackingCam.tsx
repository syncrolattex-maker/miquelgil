"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import "./HandTrackingCam.css";

interface HandTrackingCamProps {
  onGestureChange: (gesture: "open" | "fist") => void;
  currentVideoState: "playing" | "paused";
}

export default function HandTrackingCam({
  onGestureChange,
  currentVideoState,
}: HandTrackingCamProps) {
  const containerRef = useRef<HTMLDivElement | null>(null);
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  const [hasCamera, setHasCamera] = useState<boolean>(false);
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [isLoadingModel, setIsLoadingModel] = useState<boolean>(true);
  const [detectedGesture, setDetectedGesture] = useState<"open" | "fist" | "none">("none");
  const [isMinimized, setIsMinimized] = useState<boolean>(false);

  // Dragging state
  const [pos, setPos] = useState<{ x: number; y: number }>({ x: 24, y: 24 });
  const isDraggingRef = useRef<boolean>(false);
  const dragStartRef = useRef<{ mouseX: number; mouseY: number; startX: number; startY: number }>({
    mouseX: 0,
    mouseY: 0,
    startX: 0,
    startY: 0,
  });

  // Resizing state
  const [size, setSize] = useState<{ width: number; height: number }>({ width: 280, height: 210 });
  const isResizingRef = useRef<boolean>(false);
  const resizeStartRef = useRef<{ mouseX: number; mouseY: number; startW: number; startH: number }>({
    mouseX: 0,
    mouseY: 0,
    startW: 280,
    startH: 210,
  });

  const lastGestureRef = useRef<"open" | "fist" | "none">("none");
  const animFrameIdRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const handsInstanceRef = useRef<any>(null);

  // Position window initially in the bottom-right corner once client mounted
  useEffect(() => {
    if (typeof window !== "undefined") {
      const initialW = Math.min(290, window.innerWidth - 48);
      const initialH = Math.round(initialW * 0.75);
      setSize({ width: initialW, height: initialH });
      setPos({
        x: Math.max(16, window.innerWidth - initialW - 28),
        y: Math.max(16, window.innerHeight - initialH - 28),
      });
    }
  }, []);

  // Helper to load external scripts dynamically
  const loadScript = useCallback((src: string): Promise<void> => {
    return new Promise((resolve, reject) => {
      if (document.querySelector(`script[src="${src}"]`)) {
        resolve();
        return;
      }
      const script = document.createElement("script");
      script.src = src;
      script.crossOrigin = "anonymous";
      script.async = true;
      script.onload = () => resolve();
      script.onerror = (err) => reject(err);
      document.head.appendChild(script);
    });
  }, []);

  // Classify Open Hand vs Closed Fist based on 21 MediaPipe landmarks
  const processLandmarks = useCallback(
    (landmarks: Array<{ x: number; y: number; z: number }>) => {
      if (!landmarks || landmarks.length < 21) return;

      const wrist = landmarks[0];
      const dist = (p1: any, p2: any) => Math.hypot(p1.x - p2.x, p1.y - p2.y);

      // Check the 4 long fingers
      const fingers = [
        { tip: 8, pip: 6, mcp: 5 }, // Index
        { tip: 12, pip: 10, mcp: 9 }, // Middle
        { tip: 16, pip: 14, mcp: 13 }, // Ring
        { tip: 20, pip: 18, mcp: 17 }, // Pinky
      ];

      let extendedCount = 0;
      for (const f of fingers) {
        const dTipWrist = dist(landmarks[f.tip], wrist);
        const dPipWrist = dist(landmarks[f.pip], wrist);
        const dTipMcp = dist(landmarks[f.tip], landmarks[f.mcp]);
        const dPipMcp = dist(landmarks[f.pip], landmarks[f.mcp]);

        if (dTipWrist > dPipWrist * 1.12 && dTipMcp > dPipMcp * 0.95) {
          extendedCount++;
        }
      }

      // Check Thumb
      const thumbTip = landmarks[4];
      const thumbMcp = landmarks[2];
      const pinkyMcp = landmarks[17];
      if (dist(thumbTip, pinkyMcp) > dist(thumbMcp, pinkyMcp) * 1.15) {
        extendedCount++;
      }

      let gesture: "open" | "fist" | "none" = "none";
      if (extendedCount >= 3) {
        gesture = "open";
      } else if (extendedCount <= 1) {
        gesture = "fist";
      }

      setDetectedGesture(gesture);

      // Fire gesture event if it changed
      if (gesture !== lastGestureRef.current) {
        lastGestureRef.current = gesture;
        if (gesture === "open" || gesture === "fist") {
          onGestureChange(gesture);
        }
      }
    },
    [onGestureChange]
  );

  // Draw hand skeleton on canvas
  const drawSkeleton = useCallback(
    (landmarks: Array<{ x: number; y: number; z: number }>, gesture: "open" | "fist" | "none") => {
      const canvas = canvasRef.current;
      if (!canvas) return;
      const ctx = canvas.getContext("2d");
      if (!ctx) return;

      const w = canvas.width;
      const h = canvas.height;

      ctx.clearRect(0, 0, w, h);

      if (!landmarks || landmarks.length < 21) return;

      // Bone connections
      const connections = [
        // Palm
        [0, 1], [0, 5], [5, 9], [9, 13], [13, 17], [0, 17],
        // Thumb
        [1, 2], [2, 3], [3, 4],
        // Index
        [5, 6], [6, 7], [7, 8],
        // Middle
        [9, 10], [10, 11], [11, 12],
        // Ring
        [13, 14], [14, 15], [15, 16],
        // Pinky
        [17, 18], [18, 19], [19, 20],
      ];

      // Color scheme based on gesture
      let strokeColor = "#ffffff";
      let glowColor = "rgba(255, 255, 255, 0.4)";
      let jointColor = "#ffffff";

      if (gesture === "open") {
        strokeColor = "#10b981"; // Emerald
        glowColor = "rgba(16, 185, 129, 0.6)";
        jointColor = "#a7f3d0";
      } else if (gesture === "fist") {
        strokeColor = "#ef4444"; // Crimson
        glowColor = "rgba(239, 68, 68, 0.6)";
        jointColor = "#fecaca";
      }

      // Draw bones
      ctx.save();
      ctx.lineWidth = 2.5;
      ctx.lineCap = "round";
      ctx.lineJoin = "round";
      ctx.strokeStyle = strokeColor;
      ctx.shadowColor = glowColor;
      ctx.shadowBlur = 8;

      for (const [startIdx, endIdx] of connections) {
        const start = landmarks[startIdx];
        const end = landmarks[endIdx];
        ctx.beginPath();
        // Since video is mirrored via scaleX(-1), landmarks coords match directly
        ctx.moveTo(start.x * w, start.y * h);
        ctx.lineTo(end.x * w, end.y * h);
        ctx.stroke();
      }

      // Draw joints
      ctx.shadowBlur = 4;
      for (let i = 0; i < landmarks.length; i++) {
        const pt = landmarks[i];
        const isTip = i === 4 || i === 8 || i === 12 || i === 16 || i === 20;
        const radius = isTip ? 4.5 : 3.0;

        ctx.beginPath();
        ctx.arc(pt.x * w, pt.y * h, radius, 0, Math.PI * 2);
        ctx.fillStyle = isTip ? strokeColor : jointColor;
        ctx.fill();
        ctx.lineWidth = 1;
        ctx.strokeStyle = "#000000";
        ctx.stroke();
      }
      ctx.restore();
    },
    []
  );

  // Initialize MediaPipe Hands & Camera
  const startCamera = async () => {
    setCameraError(null);
    try {
      // 1. Get webcam stream
      const stream = await navigator.mediaDevices.getUserMedia({
        video: {
          width: { ideal: 640 },
          height: { ideal: 480 },
          facingMode: "user",
        },
        audio: false,
      });

      streamRef.current = stream;
      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        await videoRef.current.play();
      }
      setHasCamera(true);

      // 2. Load MediaPipe scripts
      setIsLoadingModel(true);
      await loadScript("https://cdn.jsdelivr.net/npm/@mediapipe/camera_utils/camera_utils.js");
      await loadScript("https://cdn.jsdelivr.net/npm/@mediapipe/hands/hands.js");

      const Hands = (window as any).Hands;
      if (!Hands) {
        throw new Error("MediaPipe Hands SDK could not be initialized");
      }

      const hands = new Hands({
        locateFile: (file: string) => `https://cdn.jsdelivr.net/npm/@mediapipe/hands/${file}`,
      });

      hands.setOptions({
        maxNumHands: 1,
        modelComplexity: 1,
        minDetectionConfidence: 0.5,
        minTrackingConfidence: 0.5,
      });

      hands.onResults((results: any) => {
        if (results.multiHandLandmarks && results.multiHandLandmarks.length > 0) {
          const landmarks = results.multiHandLandmarks[0];
          processLandmarks(landmarks);
          drawSkeleton(landmarks, lastGestureRef.current);
        } else {
          setDetectedGesture("none");
          lastGestureRef.current = "none";
          // Clear canvas
          if (canvasRef.current) {
            const ctx = canvasRef.current.getContext("2d");
            ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
          }
        }
      });

      handsInstanceRef.current = hands;
      setIsLoadingModel(false);

      // Frame detection loop
      const checkFrame = async () => {
        if (
          videoRef.current &&
          videoRef.current.readyState >= 2 &&
          handsInstanceRef.current &&
          !videoRef.current.paused
        ) {
          try {
            await handsInstanceRef.current.send({ image: videoRef.current });
          } catch (_) {}
        }
        animFrameIdRef.current = requestAnimationFrame(checkFrame);
      };

      animFrameIdRef.current = requestAnimationFrame(checkFrame);
    } catch (err: any) {
      console.warn("Hand tracking cam initialization:", err);
      setCameraError(err.message || "Camera access denied or unavailable");
      setIsLoadingModel(false);
    }
  };

  const stopCamera = () => {
    if (animFrameIdRef.current) {
      cancelAnimationFrame(animFrameIdRef.current);
      animFrameIdRef.current = null;
    }
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
    if (videoRef.current) {
      videoRef.current.srcObject = null;
    }
    if (canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      ctx?.clearRect(0, 0, canvasRef.current.width, canvasRef.current.height);
    }
    setHasCamera(false);
    setDetectedGesture("none");
  };

  // Clean up on unmount
  useEffect(() => {
    return () => {
      if (animFrameIdRef.current) cancelAnimationFrame(animFrameIdRef.current);
      if (streamRef.current) streamRef.current.getTracks().forEach((t) => t.stop());
    };
  }, []);

  // Dragging handlers
  const handlePointerDownDrag = (e: React.PointerEvent) => {
    if ((e.target as HTMLElement).closest(".cam-ctrl-btn")) return;
    isDraggingRef.current = true;
    dragStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      startX: pos.x,
      startY: pos.y,
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMoveDrag = (e: React.PointerEvent) => {
    if (!isDraggingRef.current) return;
    const dx = e.clientX - dragStartRef.current.mouseX;
    const dy = e.clientY - dragStartRef.current.mouseY;

    const maxX = Math.max(0, window.innerWidth - size.width);
    const maxY = Math.max(0, window.innerHeight - (isMinimized ? 44 : size.height));

    setPos({
      x: Math.max(0, Math.min(maxX, dragStartRef.current.startX + dx)),
      y: Math.max(0, Math.min(maxY, dragStartRef.current.startY + dy)),
    });
  };

  const handlePointerUpDrag = (e: React.PointerEvent) => {
    isDraggingRef.current = false;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch (_) {}
  };

  // Resizing handlers
  const handlePointerDownResize = (e: React.PointerEvent) => {
    e.stopPropagation();
    isResizingRef.current = true;
    resizeStartRef.current = {
      mouseX: e.clientX,
      mouseY: e.clientY,
      startW: size.width,
      startH: size.height,
    };
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  };

  const handlePointerMoveResize = (e: React.PointerEvent) => {
    if (!isResizingRef.current) return;
    const dw = e.clientX - resizeStartRef.current.mouseX;
    const dh = e.clientY - resizeStartRef.current.mouseY;

    const newW = Math.max(220, Math.min(480, resizeStartRef.current.startW + dw));
    const newH = Math.max(165, Math.min(360, resizeStartRef.current.startH + dh));

    setSize({ width: newW, height: newH });
  };

  const handlePointerUpResize = (e: React.PointerEvent) => {
    isResizingRef.current = false;
    try {
      (e.target as HTMLElement).releasePointerCapture(e.pointerId);
    } catch (_) {}
  };

  // Manual gesture triggers for testing without a camera
  const triggerManual = (gesture: "open" | "fist") => {
    setDetectedGesture(gesture);
    lastGestureRef.current = gesture;
    onGestureChange(gesture);
  };

  return (
    <div
      ref={containerRef}
      className={`floating-cam-window ${isMinimized ? "is-minimized" : ""}`}
      style={{
        transform: `translate3d(${pos.x}px, ${pos.y}px, 0)`,
        width: isMinimized ? 220 : size.width,
        height: isMinimized ? "auto" : size.height,
      }}
    >
      {/* Header bar (drag handle) */}
      <div
        className="floating-cam-header"
        onPointerDown={handlePointerDownDrag}
        onPointerMove={handlePointerMoveDrag}
        onPointerUp={handlePointerUpDrag}
      >
        <div className="cam-header-left">
          <span className="cam-drag-grip" title="Arrossega per moure">
            ⋮⋮
          </span>
          <span
            className={`cam-status-dot ${
              detectedGesture === "open"
                ? "is-open"
                : detectedGesture === "fist"
                ? "is-fist"
                : hasCamera
                ? "is-active"
                : "is-idle"
            }`}
          />
          <span className="cam-title">HAND TRACKING</span>
        </div>

        <div className="cam-header-right">
          <button
            type="button"
            className="cam-ctrl-btn"
            onClick={() => setIsMinimized((prev) => !prev)}
            title={isMinimized ? "Expandir càmera" : "Minimitzar càmera"}
            aria-label="Minimitzar"
          >
            {isMinimized ? "□" : "—"}
          </button>
        </div>
      </div>

      {/* Main body (video + skeleton canvas + gesture indicators) */}
      {!isMinimized && (
        <div className="floating-cam-body">
          {hasCamera ? (
            <>
              {/* Mirrored webcam stream */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className="cam-video-feed"
              />

              {/* Hand skeleton drawing layer */}
              <canvas
                ref={canvasRef}
                width={size.width}
                height={size.height - 34}
                className="cam-skeleton-canvas"
              />

              {/* Status pill overlay */}
              <div className="cam-gesture-badge">
                {isLoadingModel ? (
                  <span className="badge-loading">CARREGANT IA...</span>
                ) : detectedGesture === "open" ? (
                  <span className="badge-gesture badge-open">🖐 MÀ OBERTA (PLAY)</span>
                ) : detectedGesture === "fist" ? (
                  <span className="badge-gesture badge-fist">✊ PUNY TANCAT (PAUSA)</span>
                ) : (
                  <span className="badge-gesture badge-none">MOSTRA LA MÀ A CÀMERA</span>
                )}
              </div>
            </>
          ) : (
            <div className="cam-placeholder">
              <div className="placeholder-content">
                <div className="cam-icon">📹</div>
                <p className="placeholder-text">
                  {cameraError ? cameraError : "Activa la càmera per controlar el vídeo amb la mà"}
                </p>
                <button
                  type="button"
                  className="cam-enable-btn"
                  onClick={startCamera}
                >
                  ACTIVAR CÀMERA
                </button>
              </div>
            </div>
          )}

          {/* Quick manual simulation toolbar */}
          <div className="cam-fallback-toolbar">
            <span className="fallback-label">Test manual:</span>
            <button
              type="button"
              className={`test-gesture-btn ${detectedGesture === "open" ? "active-open" : ""}`}
              onClick={() => triggerManual("open")}
              title="Simula Mà Oberta (Play)"
            >
              🖐 Play
            </button>
            <button
              type="button"
              className={`test-gesture-btn ${detectedGesture === "fist" ? "active-fist" : ""}`}
              onClick={() => triggerManual("fist")}
              title="Simula Puny Tancat (Pausa)"
            >
              ✊ Pausa
            </button>
            {hasCamera && (
              <button
                type="button"
                className="cam-toggle-stream-btn"
                onClick={stopCamera}
                title="Aturar càmera"
              >
                ✕
              </button>
            )}
          </div>

          {/* Resize handle */}
          <div
            className="cam-resize-handle"
            onPointerDown={handlePointerDownResize}
            onPointerMove={handlePointerMoveResize}
            onPointerUp={handlePointerUpResize}
            title="Arrossega per redimensionar"
          >
            ◢
          </div>
        </div>
      )}
    </div>
  );
}
