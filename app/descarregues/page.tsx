import Footer from "@/components/Footer";
import { downloads } from "@/lib/site";

export const metadata = { title: "Descàrregues — Miquel Gil" };

export default function Descarregues() {
  return (
    <main className="page">
      <section className="section section--cream">
        <div className="disc-header reveal">
          <div>
            <p className="kicker">Material de premsa</p>
            <h1 className="display display--big">Descàrregues</h1>
          </div>
          <p className="body-copy muted" style={{ maxWidth: "34ch" }}>
            Dossores, fotografies, material de CD, vídeos i riders per a
            programadors i mitjans.
          </p>
        </div>

        <div className="dl-accordion reveal">
          {downloads.map((group) => (
            <details className="dl-item" key={group.title}>
              <summary>
                {group.title}
                <span className="plus">+</span>
              </summary>
              <div className="dl-item__body">
                {group.links.map((link) => (
                  <a
                    key={link.href}
                    href={link.href}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    {link.label}
                  </a>
                ))}
              </div>
            </details>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}
