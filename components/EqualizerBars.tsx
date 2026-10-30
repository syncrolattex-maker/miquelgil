"use client";

import React, { useEffect, useState } from "react";
import "./EqualizerBars.css";

interface EqualizerBarsProps {
  barCount?: number;
  active?: boolean;
}

export default function EqualizerBars({
  barCount = 48,
  active = true,
}: EqualizerBarsProps) {
  const [heights, setHeights] = useState<number[]>([]);

  useEffect(() => {
    // Generate initial rhythmic wave
    const initial = Array.from({ length: barCount }, (_, i) => {
      const base = Math.sin((i / barCount) * Math.PI) * 28;
      const variation = ((i % 5) + 1) * 3;
      return Math.max(6, Math.min(44, Math.round(base + variation)));
    });
    setHeights(initial);

    if (!active) return;

    const interval = setInterval(() => {
      setHeights((prev) =>
        prev.map((h, i) => {
          const rand = Math.random() * 26 - 13;
          const curve = Math.sin(((i + Date.now() / 1000) / barCount) * Math.PI * 2) * 12;
          return Math.max(6, Math.min(44, Math.round(h * 0.7 + (22 + rand + curve) * 0.3)));
        })
      );
    }, 180);

    return () => clearInterval(interval);
  }, [barCount, active]);

  return (
    <div className="cassette-equalizer" aria-hidden="true">
      {heights.map((h, idx) => (
        <span
          key={idx}
          className="cassette-eq-bar"
          style={{ height: `${h}px` }}
        />
      ))}
    </div>
  );
}
