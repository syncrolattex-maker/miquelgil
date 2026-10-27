import { Metadata } from "next";
import BiografiaClient from "./BiografiaClient";

export const metadata: Metadata = {
  title: "Biografia | Miquel Gil — Trajectòria i Mig Segle d'Arrel",
  description:
    "Descobreix la trajectòria de Miquel Gil a través de les cinc etapes capitals de la seua carrera: des de la fundació d'Al Tall (1975), la transició amb Terminal Sur, la revolució d'Orgànic i Katà, fins a Viatger (2024).",
};

export default function BiografiaPage() {
  return <BiografiaClient />;
}
