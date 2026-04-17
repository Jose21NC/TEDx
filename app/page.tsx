import Link from "next/link";
import type { Metadata } from "next";
import ScrollAwareHeader from "./components/ScrollAwareHeader";
import ParallaxHeroSection from "./components/ParallaxHeroSection";
import SpeakersShowcase from "./components/SpeakersShowcase";
import SideScrollParticles from "./components/SideScrollParticles";
import SponsorsSection from "./components/SponsorsSection";
import SponsorsCtaSection from "./components/SponsorsCtaSection";
import TicketsNotifyModal from "./components/TicketsNotifyModal";

export const metadata: Metadata = {
  title: "TEDx Avenida Bolivar | Ideas que vale la pena compartir",
  description:
    "Evento TEDx en Managua: ideas que vale la pena compartir, voces locales y experiencias que inspiran accion.",
  alternates: {
    canonical: "/",
  },
  openGraph: {
    title: "TEDx Avenida Bolivar",
    description:
      "Evento TEDx en Managua: ideas que vale la pena compartir, voces locales y experiencias que inspiran accion.",
    url: "https://tedxavenidabolivar.com",
    siteName: "TEDx Avenida Bolivar",
    images: [
      {
        url: "/media/SPEAKERS.png",
        width: 1200,
        height: 630,
        alt: "TEDx Avenida Bolivar - Evento en Managua",
      },
    ],
    locale: "es_NI",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "TEDx Avenida Bolivar",
    description:
      "Evento TEDx en Managua: ideas que vale la pena compartir, voces locales y experiencias que inspiran accion.",
    images: ["/media/SPEAKERS.png"],
  },
};

const structuredData = {
  "@context": "https://schema.org",
  "@graph": [
    {
      "@type": "Organization",
      name: "TEDx Avenida Bolivar",
      url: "https://tedxavenidabolivar.com",
      logo: "https://tedxavenidabolivar.com/media/logo-black.png",
      sameAs: ["https://instagram.com/tedxavenidabolivar"],
    },
    {
      "@type": "WebSite",
      name: "TEDx Avenida Bolivar",
      url: "https://tedxavenidabolivar.com",
      inLanguage: "es-NI",
    },
  ],
};

export default function Home() {
  return (
    <>
      <a
        href="#contenido-principal"
        className="sr-only focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-50 focus:rounded-md focus:bg-white focus:px-4 focus:py-2 focus:text-black"
      >
        Saltar al contenido principal
      </a>
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(structuredData) }} />
      <main
        id="contenido-principal"
        className="relative min-h-dvh flex flex-col bg-[#171314] text-white selection:bg-[var(--color-ted-red)] selection:text-white"
      >
      <ScrollAwareHeader />

      <div className="animate-page-fade">

      <section
        id="inicio"
        aria-labelledby="inicio-heading"
        className="relative overflow-hidden bg-transparent px-5 pb-14 pt-28 sm:px-6 sm:pb-16 sm:pt-32 md:px-10 md:py-24"
      >
        <div className="mx-auto grid w-full max-w-[1450px] gap-10 text-center md:grid-cols-[0.92fr_1.08fr] md:items-center md:gap-14 md:text-left">
          <div className="animate-page-fade md:pl-2 lg:pl-4" style={{ animationDelay: "80ms", animationDuration: "640ms" }}>
            <div className="float-medium-slower space-y-6 md:max-w-none">
              <p className="text-[clamp(0.95rem,2vw,1.4rem)] font-semibold tracking-tight text-[#c7d8df]">
                29 de Agosto, 2026
              </p>
              <h1
                id="inicio-heading"
                className="mx-auto max-w-[12ch] text-[clamp(3.25rem,11vw,6.6rem)] font-black leading-[0.9] tracking-[-0.07em] text-white md:mx-0"
              >
                El Arte de Reinventar
              </h1>
              <p className="mx-auto max-w-[26rem] text-[clamp(1rem,2vw,1.3rem)] leading-[1.55] text-white/78 md:mx-0">
                Una experiencia TEDx con ideas que vale la pena compartir, diseñada para abrir conversación y conectar a la comunidad.
              </p>
              <div>
                <TicketsNotifyModal />
              </div>
            </div>
          </div>

          <div className="animate-page-fade relative" style={{ animationDelay: "170ms", animationDuration: "720ms" }}>
            <Link
              href="/convocatoria"
              aria-label="Abrir formulario de convocatoria para speakers"
              className="group block focus-visible:outline-none"
            >
              <div className="float-medium relative min-h-[420px] overflow-hidden rounded-sm bg-transparent transition-transform duration-300 group-hover:scale-[1.01] md:min-h-[560px]">
                <picture>
                  <source media="(max-width: 768px)" srcSet="/media/speakers_nuevo_mobile.webp" type="image/webp" />
                  <source media="(max-width: 768px)" srcSet="/media/speakers_nuevo_mobile.png" type="image/png" />
                  <source srcSet="/media/speaker_nuevo.webp" type="image/webp" />
                  <img
                    src="/media/speaker_nuevo.png"
                    alt="Call for speakers TEDx Avenida Bolivar"
                    className="h-full w-full object-cover"
                    width="2048"
                    height="2048"
                    loading="eager"
                    fetchPriority="high"
                  />
                </picture>
              </div>
            </Link>
          </div>
        </div>
      </section>

      {/*
      <section aria-label="Detalles del evento" className="px-6 pb-10 md:px-10 md:pb-14">
        <div className="mx-auto grid w-full max-w-[1450px] gap-6 md:grid-cols-3 md:gap-8">
          <div className="text-center">
            <svg className="mx-auto h-5 w-5 text-[#e24943]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <rect x="3.5" y="5.5" width="17" height="15" rx="2" />
              <path d="M3.5 9h17" />
              <path d="M8 3.5v4" />
              <path d="M16 3.5v4" />
            </svg>
            <p className="[font-family:'Neue_Haas_Grotesk_Display_Pro','Helvetica_Neue',Helvetica,Arial,sans-serif] text-sm font-semibold uppercase tracking-[0.18em] text-[#e24943]">Fecha</p>
            <p className="mt-2 text-base font-semibold text-white md:text-lg">Sabado 29 de agosto</p>
          </div>

          <div className="text-center">
            <svg className="mx-auto h-5 w-5 text-[#e24943]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <circle cx="12" cy="12" r="8.5" />
              <path d="M12 7.5v5l3 2" />
            </svg>
            <p className="[font-family:'Neue_Haas_Grotesk_Display_Pro','Helvetica_Neue',Helvetica,Arial,sans-serif] text-sm font-semibold uppercase tracking-[0.18em] text-[#e24943]">Horario</p>
            <p className="mt-2 text-base font-semibold text-white md:text-lg">Por definir</p>
          </div>

          <div className="text-center">
            <svg className="mx-auto h-5 w-5 text-[#e24943]" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" aria-hidden="true">
              <path d="M12 21s6-5.2 6-10a6 6 0 1 0-12 0c0 4.8 6 10 6 10Z" />
              <circle cx="12" cy="11" r="2.2" />
            </svg>
            <p className="[font-family:'Neue_Haas_Grotesk_Display_Pro','Helvetica_Neue',Helvetica,Arial,sans-serif] text-sm font-semibold uppercase tracking-[0.18em] text-[#e24943]">Lugar</p>
            <p className="mt-2 text-base font-semibold text-white md:text-lg">Centro cultural tino lopez guerra</p>
          </div>
        </div>
      </section>
      */}

      <SideScrollParticles />

      <SpeakersShowcase />

      <ParallaxHeroSection />

      <section
        aria-labelledby="what-is-tedx-heading"
        className="relative overflow-hidden bg-[#171314] px-6 py-20 md:px-10 md:py-28 [--tedx-title-offset:0px] md:[--tedx-title-offset:28px] [--tedx-desc-offset:0px] md:[--tedx-desc-offset:48px]"
      >
        <div className="mx-auto grid w-full max-w-[1450px] gap-12 md:grid-cols-[1fr_1.12fr] md:gap-16">
          <div className="float-soft md:pl-[var(--tedx-title-offset)]">
            <h2 id="what-is-tedx-heading" className="[font-family:Inter,system-ui,sans-serif] text-[52px] font-bold leading-[1.1] tracking-[-0.02em] text-white">
              ¿Qué es TEDx?
            </h2>
            <Link
              href="https://www.ted.com/about/programs-initiatives/tedx-program"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-8 inline-flex items-center gap-2 [font-family:Inter,system-ui,sans-serif] text-[26px] font-semibold uppercase tracking-[0.04em] text-[var(--color-ted-red)]"
            >
              Programa TEDx <span aria-hidden="true">→</span>
            </Link>
          </div>

          <div className="float-soft-slower max-w-[820px] text-justify md:pl-[var(--tedx-desc-offset)] [font-family:Inter,system-ui,sans-serif] text-[20px] leading-[1.75] text-white/86">
            Con el espiritu de ideas que vale la pena difundir, TED ha creado un programa llamado TEDx. TEDx es un programa de
            eventos locales y autoorganizados que reunen a las personas para compartir una experiencia similar a TED.
            Nuestro evento "TEDxAvenidaBolivar", donde x = evento TED organizado de forma independiente. En
            TEDxAvenidaBolivar, los TED Talks buscan generar discusion profunda y conexion en un grupo selecto invitado. Las conferencias TED ofrece lineamientos generales para el programa
            TEDx, pero cada evento TEDx, incluido el nuestro, se organiza de manera independiente.
          </div>
        </div>
      </section>

      <SponsorsSection />
      <SponsorsCtaSection />
      </div>
      </main>
    </>
  );
}