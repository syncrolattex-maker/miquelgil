import { BlockReveal, AnimatedTitle, AnimatedDivider } from "@/components/TextAnimations";
import AnnnimateVideoPlayer from "@/components/AnnnimateVideoPlayer";

export const metadata = { title: "Inici — Miquel Gil" };

export default function Start() {
  return (
    <main className="start-page">
      {/* SECCIÓ 1: NINETA (Fons Negre) */}
      <section className="start-section-nineta">
        <div className="start-section-nineta__video">
          <div className="video-box">
            <AnnnimateVideoPlayer
              src="/video/nineta.mp4"
              poster="/video/nineta_frame.jpg"
              title="Nineta — Videoclip Oficial"
              credits="Tubal Perales, Vicent Todolí i Enric Alepuz"
            />
          </div>
        </div>

        <div className="start-section-nineta__content">
          <BlockReveal color="#FF0000" direction="lr" delay={100} duration={650} fullWidth>
            <p className="start-desc--white">
              Per fi, ací teniu el Clip de Nineta. Un Western modern ambientat en
              un paissatge albuferenc crepuscular i distòpic. Una lluita interna que
              desemboca en bogeria.
            </p>
          </BlockReveal>

          <p className="start-credits--white">
            Tubal Perales, Vicent Todolí i Enric Alepuz
          </p>

          <AnimatedTitle
            as="p"
            text="NINETA"
            color="#FF0000"
            className="start-big-title--red"
          />
        </div>
      </section>

      {/* SECCIÓ 2: VIATGER (Fons Clar / Beige) */}
      <section className="start-section-viatger">
        <div className="start-section-viatger__content">
          <BlockReveal color="#FF0000" direction="lr" delay={150} duration={650} fullWidth>
            <p className="start-desc--black">
              No és només un àlbum; és una crida a l'ànima, una invitació a
              explorar nous horitzons i a abraçar l'essència de la vida. A través
              de lletres i melodies envoltants, Miquel Gil ens transporta a un
              univers ric en emocions i experiències. Cada cançó és un viatge en si
              mateixa, una oportunitat per perdre's en els detalls i trobar
              significat en cada nota.
            </p>
          </BlockReveal>

          <p className="start-credits--black">
            Ja pots escoltar el nou LP a les principals plataformes
          </p>

          <AnimatedTitle
            as="p"
            text="VIATGER"
            color="#FF0000"
            className="start-big-title--red"
          />
        </div>

        <div className="start-section-viatger__cover">
          <BlockReveal color="#000000" direction="rl" delay={200} duration={600}>
            <a
              href="https://open.spotify.com/intl-es/album/0nsEwLdHyVm27hZtQihPTl"
              target="_blank"
              rel="noopener noreferrer"
              className="start-album-link"
              title="Escolta el disc Viatger a Spotify"
            >
              <div className="start-album-wrapper">
                {/* Vinyl record disc that slides out on hover */}
                <div className="start-vinyl-disc" aria-hidden="true">
                  <div className="start-vinyl-grooves" />
                  <div className="start-vinyl-label">
                    <span className="start-vinyl-center" />
                  </div>
                </div>

                <div className="start-album-sleeve">
                  <img
                    decoding="async"
                    src="/images/portadaCD.webp"
                    alt="Portada disc Viatger de Miquel Gil"
                  />
                  <div className="start-album-glare" />
                </div>
              </div>
            </a>
          </BlockReveal>

          <a
            href="https://open.spotify.com/intl-es/album/0nsEwLdHyVm27hZtQihPTl"
            target="_blank"
            rel="noopener noreferrer"
            className="start-cover-sub"
          >
            <span>Pots escoltar el nou LP a les principals plataformes</span>
            <span className="start-cover-sub__arrow" aria-hidden="true">&rarr;</span>
          </a>
        </div>
      </section>

      {/* SECCIÓ 3: PRESENTACIÓ AL PRINCIPAL */}
      <section className="start-section-principal">
        <div className="start-section-principal__photo">
          <BlockReveal color="#000000" direction="rl" delay={100} duration={600}>
            <img
              decoding="async"
              src="/images/MiquelGilViatger_Principal.webp"
              alt="Miquel Gil al Teatre Principal"
            />
          </BlockReveal>
        </div>

        <div className="start-section-principal__content">
          <div className="start-big-title-stack">
            <AnimatedTitle
              as="p"
              text="PRESENTACIÓ"
              color="#000000"
              className="start-big-title--black"
              delay={0}
            />
            <AnimatedTitle
              as="p"
              text="AL"
              color="#000000"
              className="start-big-title--black"
              delay={180}
            />
            <AnimatedTitle
              as="p"
              text="PRINCIPAL"
              color="#000000"
              className="start-big-title--black"
              delay={320}
            />
          </div>

          <AnimatedDivider color="#FF0000" delay={250} />

          <BlockReveal color="#FF0000" direction="lr" delay={300} duration={700} fullWidth>
            <div className="start-desc-stack">
              <p className="start-desc--black">
                El passat dissabte, van viure una nit inoblidable al Teatre
                Principal amb la presentació del nou disc de Miquel Gil, &ldquo;Viatger&rdquo;.
                L&rsquo;atmosfera del teatre es va omplir d&rsquo;emoció i expectació.
              </p>
              <p className="start-desc--black">
                Els col·laboradors especials, entre els quals es trobaven Pep Gimeno
                &ldquo;Botifarra&rdquo;, Vicent Torrent, Maria Bertomeu &ldquo;La Maria&rdquo;, Noelia
                Llorens &ldquo;Titana&rdquo; i Borja Penalba, van aportar la seva pròpia màgia a
                la nit, enriquint les actuacions amb la seva presència única i les
                seves interpretacions brillants.
              </p>
            </div>
          </BlockReveal>
        </div>
      </section>
    </main>
  );
}
