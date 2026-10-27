"use client";

import FluidCanvas from "@/components/FluidCanvas";
import Preloader from "@/components/Preloader";

export default function Home() {
  return (
    <>
      <Preloader />
      <main className="home">
        {/* Fondo con la imagen y el lienzo de simulación de fluidos */}
        <div className="home__content-bg">
          <img
            decoding="async"
            src="/images/viatgerO1.jpg"
            alt="Miquel Gil - Viatger"
            className="home__img"
          />
        </div>

        <FluidCanvas />

        {/* Solo el botón de entrar/acceso */}
        <div className="home__actions-only">
          <a
            className="qodef-shortcode qodef-m qodef-qi-button qodef-html--link qodef-layout--outlined qodef-type--standard qodef-size--small qodef-icon--right qodef-hover--icon-move-horizontal-short"
            href="/start"
          >
            <span className="qodef-m-text">Entrar a la Web</span>
            <span className="qodef-m-icon">
              <span className="qodef-m-icon-inner">
                <svg
                  aria-hidden="true"
                  viewBox="0 0 448 512"
                  fill="currentColor"
                  className="button-arrow-icon"
                >
                  <path d="M190.5 66.9l22.2-22.2c9.4-9.4 24.6-9.4 33.9 0L441 239c9.4 9.4 9.4 24.6 0 33.9L246.6 467.3c-9.4 9.4-24.6 9.4-33.9 0l-22.2-22.2c-9.5-9.5-9.3-25 .4-34.3L311.4 296H24c-13.3 0-24-10.7-24-24v-32c0-13.3 10.7-24 24-24h287.4L190.9 101.2c-9.8-9.3-10-24.8-.4-34.3z" />
                </svg>
              </span>
            </span>
          </a>
        </div>
      </main>
    </>
  );
}
