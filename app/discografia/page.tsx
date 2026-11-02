import DiscografiaClient from "./DiscografiaClient";

export const metadata = {
  title: "Miquel Gil — Arxiu Discogràfic 3D (1988–2024)",
  description: "Arxiu 3D interactiu de la discografia oficial de Miquel Gil: 10 edicions en format òptic CD 120mm policarbonat amb física de rack i tipografia cinètica.",
};

export default function Discografia() {
  return (
    <main className="w-screen h-screen overflow-hidden p-0 m-0">
      <h1 className="sr-only">Miquel Gil — Arxiu Discogràfic 3D (1988–2024)</h1>
      <DiscografiaClient />
    </main>
  );
}
