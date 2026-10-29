"use client";

import React, { useEffect, useRef } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import "./RectangleTextReveal.css";

if (typeof window !== "undefined") {
  gsap.registerPlugin(ScrollTrigger);
}

export interface RectangleTextRevealProps {
  lines: (string | React.ReactNode)[];
  color?: string;
  direction?: "left" | "right";
  duration?: number;
  delay?: number;
  stagger?: number;
  immediate?: boolean;
  className?: string;
  lineClassName?: string;
  tag?: "h1" | "h2" | "h3" | "h4" | "p" | "div";
}

export default function RectangleTextReveal({
  lines,
  color = "#FF0000",
  direction = "left",
  duration = 0.85,
  delay = 0,
  stagger = 0.08,
  immediate = false,
  className = "",
  lineClassName = "",
  tag = "div",
}: RectangleTextRevealProps) {
  const containerRef = useRef<HTMLElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;

    const ctx = gsap.context(() => {
      const isReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
      if (isReduced) {
        gsap.set(containerRef.current?.querySelectorAll(".rectangle_text_reveal_line") || [], {
          autoAlpha: 1,
          x: 0,
        });
        gsap.set(containerRef.current?.querySelectorAll(".rectangle_text_reveal_overlay") || [], {
          scaleX: 0,
        });
        return;
      }

      const overlays = containerRef.current?.querySelectorAll<HTMLElement>(
        ".rectangle_text_reveal_overlay"
      );
      const lineElements = containerRef.current?.querySelectorAll<HTMLElement>(
        ".rectangle_text_reveal_line"
      );

      if (!overlays?.length || !lineElements?.length) return;

      const isLeft = direction === "left";
      const origin = isLeft ? "left center" : "right center";
      const initialX = isLeft ? 80 : -80;

      // Initial state: Annnimate official setup
      gsap.set(overlays, {
        scaleX: 1,
        transformOrigin: origin,
        backgroundColor: color,
        force3D: true,
        willChange: "transform",
      });

      gsap.set(lineElements, {
        x: initialX,
        autoAlpha: 0,
        force3D: true,
        willChange: "transform, opacity",
      });

      const tl = gsap.timeline(
        immediate
          ? { delay: delay }
          : {
              scrollTrigger: {
                trigger: containerRef.current,
                start: "top 88%",
                toggleActions: "play none none none",
                invalidateOnRefresh: true,
              },
              delay: delay,
            }
      );

      tl.to(overlays, {
        scaleX: 0,
        duration: duration,
        ease: "expo.inOut",
        stagger: stagger,
        force3D: true,
      });

      tl.to(
        lineElements,
        {
          x: 0,
          autoAlpha: 1,
          duration: duration,
          ease: "expo.out",
          stagger: stagger,
          force3D: true,
          onComplete: () => {
            gsap.set(overlays, { clearProps: "willChange" });
            gsap.set(lineElements, { clearProps: "willChange" });
          },
        },
        "<+60%"
      );
    }, containerRef);

    return () => ctx.revert();
  }, [color, direction, duration, delay, stagger, immediate]);

  const ContainerTag = (tag || "div") as "h1" | "h2" | "h3" | "h4" | "p" | "div";

  return (
    <ContainerTag
      ref={containerRef as any}
      className={`rectangle_text_reveal_container ${className}`}
      data-anm-rectangle-reveal
    >
      {lines.map((line, idx) => (
        <span key={idx} className="rectangle_text_reveal_line_wrapper">
          <span className={`rectangle_text_reveal_line ${lineClassName}`}>
            {line}
          </span>
          <span
            className="rectangle_text_reveal_overlay"
            style={{ backgroundColor: color }}
            aria-hidden="true"
          />
        </span>
      ))}
    </ContainerTag>
  );
}
