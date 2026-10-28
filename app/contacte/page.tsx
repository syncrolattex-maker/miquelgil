import type { Metadata } from "next";
import SandReveal from "@/components/SandReveal";
import "./contacte.css";

export const metadata: Metadata = {
  title: "Contacte — Miquel Gil",
  description:
    "Si vols posar-te en contacte amb mi, pots fer-ho a través de les diferents opcions: Management i xarxes socials.",
};

export default function ContactePage() {
  return (
    <main className="contacte-page-root">
      <div className="contacte-main-wrapper">
        {/* Columna esquerra / Inferior mòbil: Mantell d'arena de platja interactiu */}
        <section className="contacte-content-col" aria-label="Informació de contacte">
          <SandReveal className="contacte-sand-full" starterCue={true} brushSize={80}>
            <div className="contacte-text-block">
              <h2 className="contacte-subtitle">
                Si vols posar-te en contacte amb mi, pots fer-ho a través de les diferents opcions.
              </h2>

              {/* Graella d'opcions de contacte: Management i Xarxes en Graphik */}
              <div className="contacte-info-grid">
                <div className="contacte-info-block contacte-info-block--mgmt">
                  <span className="contacte-block-label">Management:</span>
                  <a
                    href="mailto:managementgusma@gmail.com"
                    className="contacte-email-link"
                    title="Enviar correu a Management"
                  >
                    managementgusma@gmail.com
                  </a>
                </div>

                <div className="contacte-info-block contacte-info-block--web">
                  <span className="contacte-block-label">A la web:</span>
                  <div className="contacte-social-list">
                    <a
                      href="https://www.facebook.com/miquelgil.oficial"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="contacte-social-link"
                    >
                      Facebook
                    </a>
                    <a
                      href="https://www.instagram.com/miquelgil.oficial/"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="contacte-social-link"
                    >
                      Instagram
                    </a>
                    <a
                      href="https://twitter.com/miquelgil_ofic"
                      target="_blank"
                      rel="noopener noreferrer"
                      className="contacte-social-link"
                    >
                      Twitter
                    </a>
                  </div>
                </div>
              </div>
            </div>
          </SandReveal>
        </section>

        {/* Columna dreta: Fotografia de Miquel Gil a la platja (sense gens d'arena) amb degradat suau cap a blanc */}
        <aside
          className="contacte-photo-col"
          role="img"
          aria-label="Miquel Gil caminant per la vora de la mar a la platja"
        />
      </div>
    </main>
  );
}
