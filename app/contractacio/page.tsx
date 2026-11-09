import { Metadata } from "next";
import ContractacioClient from "./ContractacioClient";

export const metadata: Metadata = {
  title: "Contractació, Formats de Directe i Riders | Miquel Gil — Oficial",
  description:
    "Informació oficial de contractació, 5 formats d'espectacle (Duo, Trio, Banda Completa, Nus amb Botifarra i Produccions Especials), riders tècnics i dossiers per a programadors.",
};

export default function ContractacioPage() {
  return <ContractacioClient />;
}
