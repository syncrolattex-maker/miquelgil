import StartClient from "./StartClient";
import "./start.css";

export const metadata = {
  title: "Inici // Arxiu Sonor — Miquel Gil",
  description:
    "Arxiu sonor i experiència interactiva de Miquel Gil: Nineta, Viatger en vinil 33 RPM i directe històric al Teatre Principal.",
};

export default function Start() {
  return (
    <main className="start-page">
      <StartClient />
    </main>
  );
}
