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
      <footer className="disco-footer">
        <p className="disco-footer-copyright">
          © 2026 Miquel Gil — Tots els drets reservats
        </p>
      </footer>
    </main>
  );
}
