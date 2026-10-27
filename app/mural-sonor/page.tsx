import Footer from "@/components/Footer";
import { mural } from "@/lib/site";

export const metadata = { title: "Mural Sonor — Miquel Gil" };

export default function MuralSonor() {
  return (
    <main className="page">
      <section className="section section--cream mural-hero">
        <p className="kicker">50 anys d&apos;Acció Cultural del País Valencià</p>
        <h1 className="display display--huge">Mural Sonor</h1>
        <p className="lede" style={{ marginTop: 30 }}>
          Quatre gires per a celebrar 50 anys d&apos;acció cultural del País
          Valencià.
        </p>
      </section>

      <section className="section section--cream">
        <div className="reveal" style={{ maxWidth: "70ch" }}>
          <p className="lede" style={{ maxWidth: "60ch", marginBottom: 26 }}>
            {mural.intro}
          </p>
          <p className="body-copy muted">{mural.intro2}</p>
        </div>

        {mural.shows.map((show) => (
          <article className="mural-block reveal" key={show.title}>
            <div>
              <p className="mural-block__tag">{show.tag}</p>
              <h2 className="display display--mid">{show.title}</h2>
            </div>
            <div className="mural-block__body">
              {show.body.map((p, i) => (
                <p key={i}>{p}</p>
              ))}
              <div className="contract">
                <div>Dades de contractació</div>
                {show.contract.map((line, i) => {
                  const isEmail = line.includes("@");
                  const isPhone = /—\s*\d/.test(line);
                  if (isEmail) {
                    return (
                      <div key={i}>
                        <a href={`mailto:${line}`}>{line}</a>
                      </div>
                    );
                  }
                  if (isPhone) {
                    return (
                      <div key={i}>
                        <a href={`tel:${line.replace(/\D/g, "")}`}>{line}</a>
                      </div>
                    );
                  }
                  return <div key={i}>{line}</div>;
                })}
              </div>
            </div>
          </article>
        ))}
      </section>

      <Footer />
    </main>
  );
}
