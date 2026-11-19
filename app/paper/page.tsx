import type { Metadata } from "next";
import PaperClient from "./PaperClient";

export const metadata: Metadata = {
  title: "Miquel Gil — Presentació Oficial i Memòria Viva",
  description:
    "Pàgina de presentació de l'arxiu oficial de Miquel Gil: mig segle de cançó tradicional valenciana, cant d'estil i poesia contemporània amb escultura cinètica i control gestual per càmera.",
};

export default function PaperPage() {
  return <PaperClient />;
}
