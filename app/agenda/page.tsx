import Footer from "@/components/Footer";
import { socials } from "@/lib/site";
import { SocialIcon } from "@/components/Icons";

export const metadata = { title: "Agenda — Miquel Gil" };

export default function Agenda() {
  return (
    <main className="page">
      <section className="section section--black">
        <div className="center-page">
          <div className="reveal">
            <p className="kicker">Properes actuacions</p>
            <h1 className="display display--big">Agenda</h1>
          </div>

          <p className="agenda-note reveal">
            A causa de l&apos;actual situació, tots els actes queden suspesos fins
            a nova ordre.
          </p>

          <div className="reveal">
            <p className="body-copy muted" style={{ marginBottom: 20 }}>
              Pots seguir-nos a través de les xarxes socials. Gràcies.
            </p>
            <div className="streaming__links">
              {socials.map((s) => (
                <a
                  key={s.name}
                  href={s.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  aria-label={s.name}
                >
                  <SocialIcon icon={s.icon} />
                </a>
              ))}
            </div>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
