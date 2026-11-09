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
  { title: "Discografia", url: "/discografia/", year: "01" },
  { title: "Directes", url: "/agenda/", year: "02" },
  { title: "Biografia", url: "/biografia/", year: "03" },
  { title: "Contractació", url: "/contractacio/", year: "04" },
  { title: "Contacte", url: "/contacte/", year: "05" },
];

const NAV_G = {
  minThumbRatio: 0.2,
  labelDuration: 0.55,
  labelShift: 130,
  rowDuration: 0.34,
  rowYearDuration: 0.26,
  rowYearShift: 125,
};

export default function A24Nav({
  currentSection = "/discografia/",
  theme = "dark",
}: A24NavProps) {
  const [menuStatus, setMenuStatus] = useState<"open" | "closed">("closed");
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const navRef = useRef<HTMLElement>(null);
  const listRef = useRef<HTMLUListElement>(null);
  const toggleBtnRef = useRef<HTMLButtonElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const scrollerRef = useRef<HTMLDivElement>(null);
  const scrollbarRef = useRef<HTMLDivElement>(null);
  const thumbRef = useRef<HTMLDivElement>(null);
  const labelSpanRef = useRef<HTMLSpanElement>(null);
  const wordSpanRef = useRef<HTMLSpanElement>(null);
  const countSpanRef = useRef<HTMLSpanElement>(null);

  const hoverTimerRef = useRef<NodeJS.Timeout | null>(null);
  const lastHoverOpenTimeRef = useRef<number>(0);
  const draggingRef = useRef(false);
  const grabOffsetRef = useRef(0);
  const pointerIdRef = useRef<number | null>(null);
  const labelShowingRef = useRef<"word" | "count">("word");
  const labelWidthsRef = useRef<{ word: number; count: number }>({
    word: 0,
    count: 0,
  });

  const canHover = () => {
    return (
      typeof window !== "undefined" &&
      window.matchMedia("(hover: hover) and (pointer: fine)").matches &&
      window.innerWidth > 991
    );
  };

  const isSectionActive = useCallback(
    (secUrl: string) => {
      const normCurrent = currentSection.replace(/\/$/, "");
      const normSec = secUrl.replace(/\/$/, "");
      if (normCurrent === normSec) return true;
      if (normSec === "/discografia" && normCurrent.startsWith("/discografia"))
        return true;
      if (
        normSec === "/agenda" &&
        (normCurrent.startsWith("/agenda") ||
          normCurrent.startsWith("/directes"))
      )
        return true;
      return false;
    },
    [currentSection]
  );

  // Measure word & count widths for smooth width + yPercent morph
  const measureTextWidth = (el: HTMLElement) => {
    try {
      const range = document.createRange();
      range.selectNodeContents(el);
      const w = range.getBoundingClientRect().width;
      if (w > 0) return w;
    } catch (_) {}
    return el.getBoundingClientRect().width;
  };

  const refreshLabelWidths = useCallback(() => {
    const wordEl = wordSpanRef.current;
    const countEl = countSpanRef.current;
    if (!wordEl || !countEl) return;
    if (wordEl.getClientRects().length) {
      labelWidthsRef.current.word = measureTextWidth(wordEl);
      labelWidthsRef.current.count = measureTextWidth(countEl);
    }
  }, []);

  const morphNavLabel = useCallback(
    (mode: "word" | "count", immediate = false) => {
      const labelEl = labelSpanRef.current;
      const wordEl = wordSpanRef.current;
      const countEl = countSpanRef.current;
      if (!labelEl || !wordEl || !countEl) return;

      refreshLabelWidths();
      const showCount = mode === "count";
      const targetMode = showCount ? "count" : "word";
      const targetW = showCount
        ? labelWidthsRef.current.count
        : labelWidthsRef.current.word;
      const changed = labelShowingRef.current !== targetMode;
      labelShowingRef.current = targetMode;

      const prefersReducedMotion =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (prefersReducedMotion || immediate) {
        gsap.killTweensOf([labelEl, wordEl, countEl]);
        if (targetW) gsap.set(labelEl, { width: targetW });
        gsap.set(wordEl, { yPercent: showCount ? -NAV_G.labelShift : 0 });
        gsap.set(countEl, { yPercent: showCount ? 0 : NAV_G.labelShift });
        return;
      }

      if (targetW) {
        gsap.to(labelEl, {
          width: targetW,
          duration: NAV_G.labelDuration,
          ease: "power3.out",
          overwrite: "auto",
        });
      }

      if (changed) {
        gsap.to(wordEl, {
          yPercent: showCount ? -NAV_G.labelShift : 0,
          duration: NAV_G.labelDuration,
          ease: "power3.out",
          overwrite: "auto",
        });
        gsap.to(countEl, {
          yPercent: showCount ? 0 : NAV_G.labelShift,
          duration: NAV_G.labelDuration,
          ease: "power3.out",
          overwrite: "auto",
        });
      }
    },
    [refreshLabelWidths]
  );

  // Compute mobile dock width for elegant pill appearance
  const updateMobileDockWidth = useCallback(() => {
    const nav = navRef.current;
    const list = listRef.current;
    if (!nav || !list) return;

    if (window.innerWidth > 991) {
      nav.style.removeProperty("--nav-dock-width");
      return;
    }
    if (nav.getAttribute("data-nav-dropdown") === "open") return;

    const items = Array.from(list.children).filter(
      (c) => c.tagName === "LI"
    ) as HTMLElement[];
    if (!items.length) return;

    const gap = Number.parseFloat(getComputedStyle(list).columnGap) || 0;
    const widths = items.map(
      (li) =>
        ((li.firstElementChild as HTMLElement) || li).getBoundingClientRect()
          .width
    );
    const validCount = widths.filter((w) => w > 0).length;
    const sum =
      widths.reduce((a, b) => a + b, 0) + gap * Math.max(0, validCount - 1);
    if (!sum) return;

    const pad = Number.parseFloat(getComputedStyle(nav).fontSize) || 14;
    nav.style.setProperty(
      "--nav-dock-width",
      `${Math.ceil(sum + pad * 1.5)}px`
    );
  }, []);

  // Animate individual dropdown row (bidirectional plate + masked year number)
  const animateDropdownRow = useCallback(
    (linkEl: HTMLElement, fromTop: boolean, active: boolean) => {
      const background = linkEl.querySelector(
        ".nav-dropdown__link-bg"
      ) as HTMLElement | null;
      const year = linkEl.querySelector(
        "[data-nav-year-mask] > .nav-dropdown__link-label"
      ) as HTMLElement | null;
      if (!background) return;

      const prefersReducedMotion =
        typeof window !== "undefined" &&
        window.matchMedia("(prefers-reduced-motion: reduce)").matches;

      if (prefersReducedMotion) {
        background.style.transform = `scaleY(${active ? 1 : 0})`;
        if (year) {
          year.style.transform = `translate(0%, ${
            active ? 0 : NAV_G.rowYearShift
          }%)`;
        }
        return;
      }

      const curScale = Number(gsap.getProperty(background, "scaleY")) || 0;
      if ((active && curScale <= 0.001) || (!active && curScale >= 0.999)) {
        gsap.set(background, {
          transformOrigin: fromTop ? "center top" : "center bottom",
        });
      }

      gsap.to(background, {
        scaleY: active ? 1 : 0,
        duration: NAV_G.rowDuration,
        ease: "power3.out",
        overwrite: true,
      });

      if (year) {
        gsap.to(year, {
          yPercent: active ? 0 : NAV_G.rowYearShift,
          duration: NAV_G.rowYearDuration,
          ease: "power3.out",
          overwrite: true,
        });
      }
    },
    []
  );

  // Sync initial row states when currentSection changes or component mounts
  useEffect(() => {
    const dropdown = dropdownRef.current;
    if (!dropdown) return;
    const links = Array.from(
      dropdown.querySelectorAll(".nav-dropdown__link")
    ) as HTMLElement[];

    links.forEach((linkEl) => {
      const isAct = linkEl.getAttribute("data-film-status") === "active";
      const background = linkEl.querySelector(
        ".nav-dropdown__link-bg"
      ) as HTMLElement | null;
      const year = linkEl.querySelector(
        "[data-nav-year-mask] > .nav-dropdown__link-label"
      ) as HTMLElement | null;
      if (background) {
        gsap.set(background, {
          scaleY: isAct ? 1 : 0,
          transformOrigin: "center bottom",
        });
      }
      if (year) {
        gsap.set(year, { yPercent: isAct ? 0 : NAV_G.rowYearShift });
      }
    });
  }, [currentSection]);

  // Initial label setup & resize listener
  useEffect(() => {
    morphNavLabel("word", true);
    updateMobileDockWidth();

    if (typeof document !== "undefined" && (document as any).fonts?.ready) {
      (document as any).fonts.ready.then(() => {
        morphNavLabel(dropdownOpen ? "count" : "word", true);
        updateMobileDockWidth();
      });
    }

    const onResize = () => {
      morphNavLabel(dropdownOpen ? "count" : "word", true);
      updateMobileDockWidth();
    };
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, [dropdownOpen, morphNavLabel, updateMobileDockWidth]);

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

  // Click / touch outside to close
  useEffect(() => {
    const handlePointerDownOutside = (
      e: PointerEvent | MouseEvent | TouchEvent
    ) => {
      if (!navRef.current) return;
      const target = e.target as Node | null;
      if (!target) return;
      if (
        navRef.current.contains(target) ||
        toggleBtnRef.current?.contains(target)
      ) {
        return;
      }
      setDropdownOpen(false);
      setMenuStatus("closed");
    };

    document.addEventListener("pointerdown", handlePointerDownOutside);
    document.addEventListener("click", handlePointerDownOutside);
    return () => {
      document.removeEventListener("pointerdown", handlePointerDownOutside);
      document.removeEventListener("click", handlePointerDownOutside);
    };
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
    const thumbHeight = Math.max(
      scrollbar.clientHeight * (visible / total),
      24
    );
    thumb.style.height = `${thumbHeight}px`;

    const maxScroll = total - visible;
    const travel = scrollbar.clientHeight - thumbHeight;
    const progress = maxScroll > 0 ? scroller.scrollTop / maxScroll : 0;
    thumb.style.transform = `translateY(${progress * travel}px)`;
  }, []);

  useEffect(() => {
    if (dropdownOpen) {
      morphNavLabel("count");
      requestAnimationFrame(updateScrollbar);
      document.documentElement.style.overflow = "hidden";
    } else {
      morphNavLabel("word");
      document.documentElement.style.overflow = "";
      updateMobileDockWidth();
    }
    return () => {
      document.documentElement.style.overflow = "";
    };
  }, [dropdownOpen, morphNavLabel, updateScrollbar, updateMobileDockWidth]);

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
    const grabOffset = isThumb
      ? Math.min(thumbRect.height, Math.max(0, e.clientY - thumbRect.top))
      : thumbRect.height / 2;
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
      const offset = Math.min(
        travel,
        Math.max(0, e.clientY - scrollbarRect.top - grabOffset)
      );
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
      const offset = Math.min(
        travel,
        Math.max(0, e.clientY - scrollbarRect.top - grabOffsetRef.current)
      );
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

  const handleNavMouseEnter = () => {
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
    if (canHover()) {
      lastHoverOpenTimeRef.current = Date.now();
      setDropdownOpen(true);
    }
  };

  const handleNavMouseLeave = () => {
    if (canHover()) {
      hoverTimerRef.current = setTimeout(() => {
        setDropdownOpen(false);
      }, 200);
    }
  };

  const handleToggleClick = (e: React.MouseEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (hoverTimerRef.current) {
      clearTimeout(hoverTimerRef.current);
      hoverTimerRef.current = null;
    }
    const justHovered = Date.now() - lastHoverOpenTimeRef.current < 500;
    if (justHovered) {
      setDropdownOpen(true);
    } else {
      setDropdownOpen((prev) => !prev);
    }
  };

  const isPointerInTopHalf = (
    el: HTMLElement,
    ev: React.PointerEvent<HTMLAnchorElement>
  ) => {
    const rect = el.getBoundingClientRect();
    if (!rect.height) return false;
    return ev.clientY - rect.top < rect.height / 2;
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
            <ul ref={listRef} className="nav-center__list">
              <li>
                <Link
                  href="/discografia/"
                  className="nav-logo"
                  aria-label="Miquel Gil Discografia"
                >
                  <img
                    src="/images/logo-W.png"
                    alt="Miquel Gil"
                    className="miquel-handwritten-logo"
                  />
                </Link>
              </li>
              <li
                onMouseEnter={handleNavMouseEnter}
                onMouseLeave={handleNavMouseLeave}
              >
                <button
                  ref={toggleBtnRef}
                  type="button"
                  data-dropdown-toggle={dropdownOpen ? "open" : "closed"}
                  className="nav-link"
                  aria-expanded={dropdownOpen}
                  aria-haspopup="true"
                  aria-controls="nav-index-dropdown"
                  id="nav-dropdown-toggle-btn"
                  onClick={handleToggleClick}
                  onPointerDown={(e) => {
                    e.stopPropagation();
                  }}
                >
                  <span
                    ref={labelSpanRef}
                    className="nav-link__label"
                    data-nav-label=""
                  >
                    <span data-nav-label-track="">
                      <span ref={wordSpanRef} data-nav-label-item="word">
                        Index
                      </span>
                      <span
                        ref={countSpanRef}
                        data-nav-label-item="count"
                        aria-hidden="true"
                      >
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
                >
                  <div className="nav-dropdown__overflow">
                    <div className="nav-dropdown__overflow-inner">
                      <div
                        ref={scrollerRef}
                        className="nav-dropdown__content"
                        data-lenis-prevent=""
                        data-lenis-prevent-wheel=""
                        data-lenis-prevent-touch=""
                        onScroll={updateScrollbar}
                      >
                        <div role="list" className="nav-dropdown__content-li">
                          {NAV_SECTIONS.map((sec) => {
                            const isCurrent = isSectionActive(sec.url);
                            return (
                              <div
                                key={sec.url}
                                role="listitem"
                                className="w-dyn-item"
                              >
                                <Link
                                  href={sec.url}
                                  className="nav-dropdown__link"
                                  data-film-status={
                                    isCurrent ? "active" : "inactive"
                                  }
                                  aria-current={isCurrent ? "page" : undefined}
                                  onPointerEnter={(ev) => {
                                    if (canHover() && !isCurrent) {
                                      animateDropdownRow(
                                        ev.currentTarget,
                                        isPointerInTopHalf(
                                          ev.currentTarget,
                                          ev
                                        ),
                                        true
                                      );
                                    }
                                  }}
                                  onPointerLeave={(ev) => {
                                    if (canHover() && !isCurrent) {
                                      animateDropdownRow(
                                        ev.currentTarget,
                                        isPointerInTopHalf(
                                          ev.currentTarget,
                                          ev
                                        ),
                                        false
                                      );
                                    }
                                  }}
                                  onFocus={(ev) => {
                                    if (!isCurrent) {
                                      animateDropdownRow(
                                        ev.currentTarget,
                                        false,
                                        true
                                      );
                                    }
                                  }}
                                  onBlur={(ev) => {
                                    if (
                                      !isCurrent &&
                                      !ev.currentTarget.matches(":hover")
                                    ) {
                                      animateDropdownRow(
                                        ev.currentTarget,
                                        false,
                                        false
                                      );
                                    }
                                  }}
                                  onClick={() => {
                                    setDropdownOpen(false);
                                    setMenuStatus("closed");
                                  }}
                                >
                                  <div
                                    className="nav-dropdown__link-bg"
                                    aria-hidden="true"
                                  />
                                  <div className="nav-dropdown__link-inner">
                                    <h2 className="nav-dropdown__link-label">
                                      {sec.title}
                                    </h2>
                                    <span data-nav-year-mask="">
                                      <span className="nav-dropdown__link-label">
                                        {sec.year}
                                      </span>
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
                    <div
                      ref={thumbRef}
                      className="nav-dropdown__scrollbar-progress"
                    />
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
