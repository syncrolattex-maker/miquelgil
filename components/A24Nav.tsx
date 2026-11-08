"use client";

import React, { useEffect, useRef, useState, useCallback } from "react";
import Link from "next/link";
import gsap from "gsap";
import "./A24Nav.css";

interface A24NavProps {
  currentSection?: string;
  theme?: "dark" | "base";
}

export const NAV_SECTIONS = [
  { title: "Inici", url: "/start", year: "01" },
  { title: "Discografia", url: "/discografia", year: "02" },
  { title: "Directes", url: "/agenda", year: "03" },
  { title: "Biografia", url: "/biografia", year: "04" },
  { title: "Contractació", url: "/contractacio", year: "05" },
  { title: "Cronologia", url: "/cronologia", year: "06" },
  { title: "Contacte", url: "/contacte", year: "07" }
];

export default function A24Nav({ currentSection = "/discografia", theme = "dark" }: A24NavProps) {
  const [menuStatus, setMenuStatus] = useState<"open" | "closed">("closed");
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [labelMode, setLabelMode] = useState<"word" | "count">("word");

  const navRef = useRef<HTMLElement>(null);
  const toggleBtnRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const scrollbarRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const labelTrackRef = useRef<HTMLSpanElement>(null);
  const wordSpanRef = useRef<HTMLSpanElement>(null);
  const countSpanRef = useRef<HTMLSpanElement>(null);

  const draggingRef = useRef(false);
  const grabOffsetRef = useRef(0);
  const pointerIdRef = useRef<number | null>(null);

  // Focus trap / escape key listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        if (dropdownOpen) {
          setDropdownOpen(false);
          toggleBtnRef.current?.focus();
        } else if (menuStatus === "open") {
          setMenuStatus("closed");
        }
      }
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [dropdownOpen, menuStatus]);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (!navRef.current) return;
      if (!navRef.current.contains(e.target as Node)) {
        setDropdownOpen(false);
        setMenuStatus("closed");
      }
    };
    document.addEventListener("click", handleClickOutside);
    return () => document.removeEventListener("click", handleClickOutside);
  }, []);

  // Update scrollbar dimensions
  const updateScrollbar = useCallback(() => {
    const scroller = scrollerRef.current;
    const thumb = thumbRef.current;
    const scrollbar = scrollbarRef.current;
    if (!scroller || !thumb || !scrollbar) return;

    const visible = scroller.clientHeight;
    const total = scroller.scrollHeight;
    if (total <= visible) {
      scrollbar.classList.add("is-disabled");
      return;
    }
    scrollbar.classList.remove("is-disabled");
    const thumbHeight = Math.max(scrollbar.clientHeight * (visible / total), 24);
    thumb.style.height = `${thumbHeight}px`;

    const maxScroll = total - visible;
    const travel = scrollbar.clientHeight - thumbHeight;
    const progress = maxScroll > 0 ? scroller.scrollTop / maxScroll : 0;
    thumb.style.transform = `translateY(${progress * travel}px)`;
  }, []);

  useEffect(() => {
    if (dropdownOpen) {
      setLabelMode("count");
      requestAnimationFrame(updateScrollbar);
      // Lock scroll while dropdown is open
      document.documentElement.style.overflow = "hidden";
    } else {
      setLabelMode("word");
      document.documentElement.style.overflow = "";
    }
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [dropdownOpen, updateScrollbar]);

  // Animate word <-> count morph
  useEffect(() => {
    const word = wordSpanRef.current;
    const count = countSpanRef.current;
    if (!word || !count) return;

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const shift = 130;

    if (prefersReducedMotion) {
      gsap.set(word, { yPercent: labelMode === "word" ? 0 : -shift });
      gsap.set(count, { yPercent: labelMode === "count" ? 0 : shift });
      return;
    }

    if (labelMode === "count") {
      gsap.to(word, { yPercent: -shift, duration: 0.45, ease: "power3.out", overwrite: "auto" });
      gsap.to(count, { yPercent: 0, duration: 0.45, ease: "power3.out", overwrite: "auto" });
    } else {
      gsap.to(word, { yPercent: 0, duration: 0.45, ease: "power3.out", overwrite: "auto" });
      gsap.to(count, { yPercent: shift, duration: 0.45, ease: "power3.out", overwrite: "auto" });
    }
  }, [labelMode]);

  // Dragging scrollbar logic
  const onPointerDownScrollbar = (e: React.PointerEvent) => {
    const thumb = thumbRef.current;
    const scrollbar = scrollbarRef.current;
    const scroller = scrollerRef.current;
    if (!thumb || !scrollbar || !scroller) return;

    e.preventDefault();
    e.stopPropagation();

    const isThumb = e.target === thumb || thumb.contains(e.target as Node);
    const thumbRect = thumb.getBoundingClientRect();
    const grabOffset = isThumb ? Math.min(thumbRect.height, Math.max(0, e.clientY - thumbRect.top)) : thumbRect.height / 2;
    grabOffsetRef.current = grabOffset;
    draggingRef.current = true;
    pointerIdRef.current = e.pointerId;
    thumb.classList.add("is-dragging");

    try {
      scrollbar.setPointerCapture(e.pointerId);
    } catch (_) {}

    const scrollbarRect = scrollbar.getBoundingClientRect();
    const travel = scrollbar.clientHeight - thumb.clientHeight;
    const maxScroll = scroller.scrollHeight - scroller.clientHeight;
    if (travel > 0 && maxScroll > 0) {
      const offset = Math.min(travel, Math.max(0, e.clientY - scrollbarRect.top - grabOffset));
      scroller.scrollTop = (offset / travel) * maxScroll;
      updateScrollbar();
    }
  };

  const onPointerMoveScrollbar = (e: React.PointerEvent) => {
    if (!draggingRef.current) return;
    const scrollbar = scrollbarRef.current;
    const scroller = scrollerRef.current;
    const thumb = thumbRef.current;
    if (!scrollbar || !scroller || !thumb) return;

    const scrollbarRect = scrollbar.getBoundingClientRect();
    const travel = scrollbar.clientHeight - thumb.clientHeight;
    const maxScroll = scroller.scrollHeight - scroller.clientHeight;
    if (travel > 0 && maxScroll > 0) {
      const offset = Math.min(travel, Math.max(0, e.clientY - scrollbarRect.top - grabOffsetRef.current));
      scroller.scrollTop = (offset / travel) * maxScroll;
      updateScrollbar();
    }
  };

  const onPointerUpScrollbar = (e: React.PointerEvent) => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    thumbRef.current?.classList.remove("is-dragging");
    try {
      scrollbarRef.current?.releasePointerCapture(e.pointerId);
    } catch (_) {}
  };

  return (
    <nav
      ref={navRef}
      data-theme-target="nav"
      data-menu-status={menuStatus}
      data-nav-dropdown={dropdownOpen ? "open" : "closed"}
      data-disc-no-drag=""
      className={`nav ${theme === "dark" ? "theme-dark" : "theme-base"}`}
      aria-label="Navegació principal"
    >
      <div className="nav-container">
        <div className="nav-bg" />
        <div className="nav-inner">
          <div className="nav-center">
            <ul className="nav-center__list">
              <li>
                <Link href="/start" className="nav-logo" aria-label="Miquel Gil Inici">
                  <img
                    src="/images/logo-W.png"
                    alt="Miquel Gil"
                    className="miquel-handwritten-logo"
                  />
                </Link>
              </li>
              <li>
                <button
                  ref={toggleBtnRef}
                  type="button"
                  data-dropdown-toggle={dropdownOpen ? "open" : "closed"}
                  className="nav-link"
                  aria-expanded={dropdownOpen}
                  aria-haspopup="true"
                  aria-controls="nav-index-dropdown"
                  id="nav-dropdown-toggle-btn"
                  onClick={(e) => {
                    e.stopPropagation();
                    setDropdownOpen(!dropdownOpen);
                  }}
                  onMouseEnter={() => {
                    if (window.matchMedia("(hover: hover) and (pointer: fine)").matches && window.innerWidth > 991) {
                      setDropdownOpen(true);
                    }
                  }}
                >
                  <span className="nav-link__label" data-nav-label="">
                    <span ref={labelTrackRef} data-nav-label-track="">
                      <span ref={wordSpanRef} data-nav-label-item="word">
                        Index
                      </span>
                      <span ref={countSpanRef} data-nav-label-item="count" aria-hidden="true">
                        {NAV_SECTIONS.length}
                      </span>
                    </span>
                  </span>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="100%"
                    viewBox="0 0 17 10"
                    fill="none"
                    className="nav-link__dropdown-icon"
                    aria-hidden="true"
                  >
                    <path
                      d="M1.5 1.5L8.5 8.5L15.5 1.5"
                      stroke="currentColor"
                      strokeWidth="1.5"
                      strokeMiterlimit="10"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>

                <div
                  ref={dropdownRef}
                  className="nav-dropdown"
                  id="nav-index-dropdown"
                  aria-hidden={!dropdownOpen}
                  onMouseLeave={() => {
                    if (window.matchMedia("(hover: hover) and (pointer: fine)").matches && window.innerWidth > 991) {
                      setDropdownOpen(false);
                    }
                  }}
                >
                  <div className="nav-dropdown__overflow">
                    <div className="nav-dropdown__overflow-inner">
                      <div
                        ref={scrollerRef}
                        className="nav-dropdown__content"
                        onScroll={updateScrollbar}
                      >
                        <div role="list" className="nav-dropdown__content-li">
                          {NAV_SECTIONS.map((sec) => {
                            const isCurrent = currentSection === sec.url || (sec.url === "/discografia" && currentSection.startsWith("/discografia"));
                            return (
                              <div key={sec.url} role="listitem" className="w-dyn-item">
                                <Link
                                  href={sec.url}
                                  className="nav-dropdown__link"
                                  data-film-status={isCurrent ? "active" : "inactive"}
                                  aria-current={isCurrent ? "page" : undefined}
                                  onClick={() => {
                                    setDropdownOpen(false);
                                    setMenuStatus("closed");
                                  }}
                                >
                                  <div className="nav-dropdown__link-bg" aria-hidden="true" />
                                  <div className="nav-dropdown__link-inner">
                                    <h2 className="nav-dropdown__link-label">{sec.title}</h2>
                                    <span data-nav-year-mask="">
                                      <span className="nav-dropdown__link-label">{sec.year}</span>
                                    </span>
                                  </div>
                                </Link>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    </div>
                  </div>
                  <div
                    ref={scrollbarRef}
                    className="nav-dropdown__scrollbar"
                    onPointerDown={onPointerDownScrollbar}
                    onPointerMove={onPointerMoveScrollbar}
                    onPointerUp={onPointerUpScrollbar}
                  >
                    <div ref={thumbRef} className="nav-dropdown__scrollbar-progress" />
                  </div>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </div>
      <div
        className="page-bg"
        onClick={() => {
          setDropdownOpen(false);
          setMenuStatus("closed");
        }}
      />
    </nav>
  );
}
