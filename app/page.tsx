import type { Metadata } from "next";
import PaperClient from "@/app/paper/PaperClient";

export const metadata: Metadata = {
  title: "Miquel Gil — Presentació Oficial i Memòria Viva",
  description:
    "Pàgina d'entrada i presentació de l'arxiu oficial de Miquel Gil: mig segle de cançó tradicional valenciana, cant d'estil i poesia contemporània amb escultura cinètica de paper.",
  alternates: {
    canonical: "/",
  },
};

export default function Home() {
  return <PaperClient />;
}
