import React from "react";
import Footer from "@/components/Footer";
import AgendaClient from "./AgendaClient";
import "./agenda.css";

export const metadata = {
  title: "Agenda de Concerts — Miquel Gil",
  description:
    "Properes dates de concerts i actuacions en directe de Miquel Gil: de la intimitat del duo amb Eduard Navarro a la força de la banda completa.",
};

export default function AgendaPage() {
  return (
    <main className="agenda-page-container">
      <AgendaClient />
      <Footer />
    </main>
  );
}
