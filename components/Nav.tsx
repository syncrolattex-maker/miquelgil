"use client";

import { usePathname } from "next/navigation";
import PillarMenu from "./PillarMenu";

export default function Nav() {
  const pathname = usePathname();

  // No mostrar el menú a la Home ("/") ni a "/start" (que té la seva pròpia navegació A24)
  const isHomeOrStart = pathname === "/" || pathname?.startsWith("/start");
  if (isHomeOrStart) return null;

  // Únic menú de navegació del lloc: Annnimate Pillar Menu ("Float beside it")
  return <PillarMenu />;
}
