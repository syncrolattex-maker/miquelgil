import Footer from "@/components/Footer";

export const metadata = { title: "Media — Miquel Gil" };

export default function Media() {
  return (
    <main className="page">
      <section className="section section--black maintenance">
        <div className="maintenance__inner reveal">
          <p className="kicker">Mitjans de comunicació</p>
          <h1 className="display display--big">Disculpeu les molèsties</h1>
          <p>
            La nostra secció de Mitjans de Comunicació està en manteniment
            temporalment. Estem treballant per millorar la vostra experiència.
            Torneu aviat per a més actualitzacions.
          </p>
          <div style={{ marginTop: 40, display: "flex", gap: 16, justifyContent: "center" }}>
            <a href="/descarregues" className="btn btn--light">
              <span>Anar a descàrregues</span>
            </a>
            <a href="/contacte" className="btn btn--light">
              <span>Contacte</span>
            </a>
          </div>
        </div>
      </section>

      <Footer />
    </main>
  );
}
