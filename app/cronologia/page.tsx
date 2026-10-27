import Footer from "@/components/Footer";
import data from "@/lib/cronologia.json";

export const metadata = { title: "Cronologia — Miquel Gil" };

type YearEntry = { year: string; events: string[] };

export default function Cronologia() {
  const years = data as YearEntry[];

  return (
    <main className="page">
      <section className="section section--cream">
        <div className="disc-header reveal">
          <div>
            <p className="kicker">1974 — 2010</p>
            <h1 className="display display--big">Cronologia</h1>
          </div>
          <p className="body-copy muted" style={{ maxWidth: "34ch" }}>
            Quaranta anys de concerts, gires, discos i col·laboracions. Un
            recorregut per la trajectòria artística de Miquel Gil.
          </p>
        </div>

        <div className="timeline">
          {years.map((entry) => (
            <section className="year reveal" key={entry.year}>
              <div className="year__num">{entry.year}</div>
              <div className="year__body">
                {entry.events.map((ev, i) => (
                  <p className="ev" key={i}>
                    <span>{ev}</span>
                  </p>
                ))}
              </div>
            </section>
          ))}
        </div>
      </section>

      <Footer />
    </main>
  );
}
