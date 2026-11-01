import DiscografiaClient from "./DiscografiaClient";

export const metadata = {
  title: "Discografia — Miquel Gil",
  description: "Arxiu 3D interactiu de la discografia oficial de Miquel Gil: de la música d'arrel a la fusió mediterrània (1988 — 2024).",
};

export default function Discografia() {
  return (
    <main className="w-screen h-screen overflow-hidden bg-[#141210] p-0 m-0">
      <h1 className="sr-only">Discografia Oficial de Miquel Gil — Arxiu 3D Interactiu</h1>
      <DiscografiaClient />
    </main>
  );
}
