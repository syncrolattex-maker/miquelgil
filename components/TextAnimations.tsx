"use client";

import React, { useEffect, useRef, useState } from "react";

interface BlockRevealProps {
  children: React.ReactNode;
  color?: string; // Hex color for the wipe block
  direction?: "lr" | "rl" | "tb" | "bt";
  delay?: number;
  duration?: number;
  className?: string;
}

export function BlockReveal({
  children,
  color = "#FF0000",
  direction = "lr",
  delay = 0,
  duration = 600,
  className = "",
}: BlockRevealProps) {
  const [revealed, setRevealed] = useState(false);
  const [animating, setAnimating] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = containerRef.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              setAnimating(true);
              setTimeout(() => {
                setRevealed(true);
              }, duration * 0.45);
              setTimeout(() => {
                setAnimating(false);
              }, duration);
            }, delay);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delay, duration]);

  return (
    <div
      ref={containerRef}
      className={`block-reveal-wrapper ${className}`}
      style={{ position: "relative", display: "inline-block", overflow: "hidden" }}
    >
      <div
        className="block-reveal-content"
        style={{
          opacity: revealed ? 1 : 0,
          transition: "opacity 0.05s ease",
        }}
      >
        {children}
      </div>
      {animating && (
        <div
          className={`block-reveal-curtain block-reveal-curtain--${direction}`}
          style={{
            position: "absolute",
            inset: 0,
            backgroundColor: color,
            zIndex: 10,
            animationDuration: `${duration}ms`,
          }}
        />
      )}
    </div>
  );
}

interface AnimatedTitleProps {
  text: string;
  color?: string;
  className?: string;
  as?: "h1" | "h2" | "h3" | "p" | "div";
  delay?: number;
}

export function AnimatedTitle({
  text,
  color = "#FF0000",
  className = "",
  as = "h1",
  delay = 0,
}: AnimatedTitleProps) {
  const [visible, setVisible] = useState(false);
  const ref = useRef<HTMLElement>(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            setTimeout(() => {
              setVisible(true);
            }, delay);
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1 }
    );

    observer.observe(el);
    return () => observer.disconnect();
  }, [delay]);

  const words = text.split(" ");
  const Tag = as as React.ElementType;

  return (
    <Tag
      ref={ref}
      className={`qodef-m-title animated-coign-title ${className}`}
      style={{ color }}
    >
      {words.map((word, wIdx) => (
        <span
          key={wIdx}
          className="qodef-e-word-holder"
          style={{
            display: "inline-block",
            whiteSpace: "nowrap",
            marginRight: "0.25em",
          }}
        >
          {word.split("").map((char, cIdx) => (
            <span
              key={cIdx}
              className="qodef-e-char-holder"
              style={{
                display: "inline-block",
                transform: visible ? "translateY(0)" : "translateY(110%)",
                opacity: visible ? 1 : 0,
                transition: `transform 0.65s cubic-bezier(0.25, 0.46, 0.45, 0.94) ${
                  (wIdx * 5 + cIdx) * 35
                }ms, opacity 0.5s ease ${(wIdx * 5 + cIdx) * 35}ms`,
                willChange: "transform, opacity",
              }}
            >
              {char}
            </span>
          ))}
        </span>
      ))}
    </Tag>
  );
}
