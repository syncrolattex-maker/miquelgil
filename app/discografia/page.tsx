import InkBloomFooter from "@/components/InkBloomFooter";
import DiscografiaClient from "./DiscografiaClient";
import "./discografia.css";

export const metadata = {
  title: "Discografia — Miquel Gil",
  description: "Discografia completa de Miquel Gil: de la música d'arrel a la fusió, del flamenc al jazz i la música àrab culta.",
};

export default function Discografia() {
  return (
    <main className="discografia-container">
      <DiscografiaClient />
      <InkBloomFooter
        color="#b80018"
        colorOuter="#ff0528"
        ground="transparent"
        edge="bottom"
      />
    </main>
  );
}
