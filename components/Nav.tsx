"use client";

import { usePathname } from "next/navigation";
import PillarMenu from "./PillarMenu";

export default function Nav() {
  const pathname = usePathname();

  // No mostrar el menú flotant a la Home, /start, /discografia ni /biografia (que tenen la seva pròpia navegació A24)
  const isDedicatedExperience =
    pathname === "/" ||
    pathname?.startsWith("/start") ||
    pathname?.startsWith("/discografia") ||
    pathname?.startsWith("/biografia");
  if (isDedicatedExperience) return null;

  // Únic menú de navegació del lloc: Annnimate Pillar Menu ("Float beside it")
  return <PillarMenu />;
}
