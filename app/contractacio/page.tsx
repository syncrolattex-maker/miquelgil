import React from "react";
import InkBloomFooter from "@/components/InkBloomFooter";
import ContractacioClient from "./ContractacioClient";
import "./contractacio.css";

export const metadata = {
  title: "Contractació, Dossier i Riders — Miquel Gil",
  description:
    "Informació oficial de contractació, formats de concert (Duo, Trio, Banda, Nus), descàrrega de riders tècnics i dossier per a programadors i festivals.",
};

export default function ContractacioPage() {
  return (
    <main className="contractacio-page-container">
      <ContractacioClient />
      <InkBloomFooter
        color="#b80018"
        colorOuter="#ff0528"
        ground="transparent"
        edge="bottom"
      />
    </main>
  );
}
