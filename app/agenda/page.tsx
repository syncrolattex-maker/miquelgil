import { Metadata } from "next";
import AgendaClient from "./AgendaClient";

export const metadata: Metadata = {
  title: "Directes · Agenda de Concerts | Miquel Gil — Oficial",
  description:
    "Agenda interactiva de concerts i actuacions en directe de Miquel Gil: desplega cada data de gira amb l'experiència Paper Crumble 3D.",
};

export default function AgendaPage() {
  return <AgendaClient />;
}
