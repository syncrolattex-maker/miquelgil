import Link from "next/link";
import Footer from "@/components/Footer";

export default function NotFound() {
  return (
    <main className="page">
      <section className="section section--black maintenance">
        <div className="maintenance__inner reveal">
          <p className="kicker">Arxiu de Miquel Gil</p>
          <h1 className="display display--huge">Aquesta pàgina s&apos;ha perdut</h1>
          <p>
            El document o registre que busques no es troba en aquest enllaç. Pots
            tornar a la discografia oficial o explorar la trajectòria biogràfica.
          </p>
          <div style={{ marginTop: 40, display: "flex", gap: "16px", justifyContent: "center", flexWrap: "wrap" }}>
            <Link href="/discografia" className="btn a24-btn">
              <span className="btn__divider" aria-hidden="true" />
              <span className="btn__p-mask">
                <span className="btn__p">
                  <span>Arxiu Discogràfic ↗</span>
                </span>
              </span>
              <span className="btn__divider" aria-hidden="true" />
            </Link>

            <Link href="/biografia" className="btn a24-btn">
              <span className="btn__divider" aria-hidden="true" />
              <span className="btn__p-mask">
                <span className="btn__p">
                  <span>Trajectòria Biogràfica ↗</span>
                </span>
              </span>
              <span className="btn__divider" aria-hidden="true" />
            </Link>
          </div>
        </div>
      </section>
      <Footer />
    </main>
  );
}
