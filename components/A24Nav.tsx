"use client";

import React from "react";
import MorphingPillNav, {
  MorphingPillNavProps,
  NAV_LINKS,
} from "./MorphingPillNav";

export interface A24NavProps extends MorphingPillNavProps {}

// Backward compatibility for any external imports
export const NAV_SECTIONS = NAV_LINKS.map((link) => ({
  title: link.title,
  url: link.url,
  year: link.id,
}));

export default function A24Nav(props: A24NavProps) {
  return <MorphingPillNav {...props} />;
}

export { MorphingPillNav };
