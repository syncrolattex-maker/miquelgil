"use client";

import Link from "next/link";
import GooeyHoverReveal from "@/components/GooeyHoverReveal";
import Preloader from "@/components/Preloader";

export default function Home() {
  return (
    <>
      <Preloader />
      <main className="home">
        {/* Gooey Hover Reveal: WebGL liquid metaball cutout uncovering Miquel Gil */}
        <GooeyHoverReveal
          blobCount={256}
          blobRadius={180}
          smoothness={75}
          blobColor="#000000"
          lifetime={2.5}
          spawnDistance={40}
          threshold={0.5}
          cursorLag={0.35}
          growDuration={0.12}
          hintText="Mou el cursor per descobrir"
        >
          <div className="home__content-bg">
            <img
              decoding="async"
              src="/images/miquel_gil_inicio.jpg"
              alt="Miquel Gil"
              className="home__img"
            />
          </div>
        </GooeyHoverReveal>

        {/* Botó per accedir a la web -> porta directament a /discografia */}
        <div className="home__actions-only">
          <Link
            className="btn a24-btn home__enter-btn"
            href="/discografia/"
          >
            <span className="btn__divider" aria-hidden="true" />
            <span className="btn__p-mask">
              <span className="btn__p">
                <span>Entrar a la Web ↗</span>
              </span>
            </span>
            <span className="btn__divider" aria-hidden="true" />
          </Link>
        </div>
      </main>
    </>
  );
}
