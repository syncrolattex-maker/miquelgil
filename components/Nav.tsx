"use client";

import { usePathname } from "next/navigation";
import PillarMenu from "./PillarMenu";

export default function Nav() {
  const pathname = usePathname();

  // No mostrar el menú flotant a la Home, /start ni /discografia (que tenen la seva pròpia navegació i HUD)
  const isDedicatedExperience =
    pathname === "/" || pathname?.startsWith("/start") || pathname?.startsWith("/discografia");
  if (isDedicatedExperience) return null;

  // Únic menú de navegació del lloc: Annnimate Pillar Menu ("Float beside it")
  return <PillarMenu />;
}
