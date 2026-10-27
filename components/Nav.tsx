"use client";

import { usePathname } from "next/navigation";
import PillarMenu from "./PillarMenu";

export default function Nav() {
  const pathname = usePathname();

  // No mostrar el menú a la Home ("/")
  const isHome = pathname === "/";
  if (isHome) return null;

  // Únic menú de navegació del lloc: Annnimate Pillar Menu ("Float beside it")
  return <PillarMenu />;
}
