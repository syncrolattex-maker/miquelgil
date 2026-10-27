import Footer from "@/components/Footer";

export default function NotFound() {
  return (
    <main className="page">
      <section className="section section--black maintenance">
        <div className="maintenance__inner reveal">
          <p className="kicker">Error 404</p>
          <h1 className="display display--huge">Aquesta pàgina s&apos;ha perdut</h1>
          <p>
            El camí que busques no existeix o ha canviat. Torna a l&apos;inici i
            continua el viatge.
          </p>
          <div style={{ marginTop: 40 }}>
            <a href="/start" className="btn btn--light">
              <span>Tornar a l&apos;inici</span>
            </a>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
