import Image from "next/image";
import Link from "next/link";
import logoBlack from "../media/logo-black.png";
import MobileNav from "../components/MobileNav";

export default function AcercaPage() {
  return (
    <main className="min-h-screen bg-white text-[#1f1f1f] selection:bg-[var(--color-ted-red)] selection:text-white animate-page-fade">
      <header className="border-b border-black/5 bg-white text-[#222] sticky top-0 z-20">
        <nav className="mx-auto flex w-full max-w-[88rem] items-center justify-between px-6 py-0.5">
          <Link href="/" className="flex items-center">
            <Image src={logoBlack} alt="TEDx Avenida Bolivar" className="h-[4.5rem] w-auto" />
          </Link>

          <ul className="hidden items-center gap-6 text-sm font-medium md:flex">
            <li>
              <Link className="transition hover:text-[var(--color-ted-red)]" href="/">
                Inicio
              </Link>
            </li>
            <li>
              <Link className="font-semibold text-[var(--color-ted-red)]" href="/acerca">
                Acerca de
              </Link>
            </li>
            <li>
              <Link className="transition hover:text-[var(--color-ted-red)]" href="/patrocinios">
                Patrocinadores
              </Link>
            </li>
          </ul>
          <MobileNav />
        </nav>
      </header>

      <section className="mx-auto w-full max-w-7xl px-6 pb-16 pt-12">
        <div className="max-w-5xl mx-auto">
          <h1 className="text-4xl text-center font-extrabold tracking-tight md:text-5xl">Acerca de</h1>

          <div className="mt-10 space-y-5">
            <h2 className="text-2xl font-bold tracking-tight">¿Qué es TEDx?</h2>
            <p className="text-lg leading-8 text-gray-700 text-justify">
              Con el objetivo de descubrir y difundir ideas, TED ha creado un programa llamado TEDx. TEDx
              es un programa de eventos locales autoorganizados que reúne a personas para compartir una
              experiencia similar a la de TED. Nuestro evento se llama TEDxAvenidaBolivar, donde x =
              evento TED organizado de forma independiente. En nuestro evento TEDxAvenidaBolivar, las
              charlas TED en video y las presentaciones en vivo se combinan para generar un debate
              profundo y conectar en un grupo pequeño. La Conferencia TED proporciona una guía general
              para el programa TEDx, pero cada evento TEDx, incluido el nuestro, se organiza de forma
              independiente.
            </p>
            <p className="text-lg leading-8 text-gray-700 text-justify">
              Más información sobre el programa oficial TEDx:
              <Link
                href="https://www.ted.com/about/programs-initiatives/tedx-program"
                target="_blank"
                className="ml-2 font-semibold text-[var(--color-ted-red)] underline underline-offset-4"
              >
                ted.com/about/programs-initiatives/tedx-program
              </Link>
            </p>
          </div>

          <div className="mt-14 space-y-5">
            <h2 className="text-2xl font-bold tracking-tight">Acerca de TEDx, x = evento organizado de forma independiente</h2>
            <p className="text-lg leading-8 text-gray-700 text-justify">
              Con el objetivo de descubrir y difundir ideas, TEDx es un programa de eventos locales y
              autoorganizados que reúne a personas para compartir una experiencia similar a la de TED. En
              un evento TEDx, las charlas TED en video y los ponentes en vivo se combinan para generar un
              profundo debate y conectar. Estos eventos locales y autoorganizados se denominan TEDx,
              donde x = evento TED organizado de forma independiente. La Conferencia TED proporciona una
              guía general para el programa TEDx, pero cada evento TEDx es autoorganizado. (Sujeto a
              ciertas normas y regulaciones).
            </p>
          </div>

          <div className="mt-14 space-y-5">
            <h2 className="text-2xl font-bold tracking-tight">Acerca de TED</h2>
            <p className="text-lg leading-8 text-gray-700 text-justify">
              TED es una organización sin fines de lucro e imparcial dedicada a descubrir, debatir y
              difundir ideas que generen conversación, profundicen la comprensión e impulsen cambios
              significativos. Nuestra organización se dedica a la curiosidad, la razón, el asombro y la
              búsqueda del conocimiento, sin una agenda definida. Recibimos a personas de todas las
              disciplinas y culturas que buscan una comprensión más profunda del mundo y conectar con los
              demás, e invitamos a todos a participar con ideas y a activarlas en su comunidad.
            </p>
            <p className="text-lg leading-8 text-gray-700 text-justify">
              TED comenzó en 1984 como una conferencia donde convergen la tecnología, el entretenimiento y
              el diseño, pero hoy abarca una multitud de comunidades e iniciativas mundiales que exploran
              todo, desde la ciencia y los negocios hasta la educación, las artes y los problemas
              globales. Además de las charlas TED seleccionadas de nuestras conferencias anuales y
              publicadas en TED.com, producimos podcasts originales, series de videos cortos, lecciones
              educativas animadas (TED-Ed) y programas de televisión que se traducen a más de 100 idiomas
              y se distribuyen a través de asociaciones en todo el mundo. Cada año, miles de eventos TEDx
              organizados de forma independiente. A través del Proyecto Audaz, TED ha ayudado a catalizar
              $6.6 mil millones en fondos para proyectos que apoyan soluciones audaces a los desafíos más
              urgentes del mundo, trabajando para hacer del mundo un lugar más bello, sostenible y justo.
              En 2020, TED lanzó Countdown, una iniciativa para acelerar las soluciones a la crisis
              climática y movilizar un movimiento por un futuro con cero emisiones netas. En 2023, TED
              lanzó TED Democracy para impulsar un nuevo tipo de conversación centrada en caminos
              realistas hacia un futuro más dinámico y equitativo.
            </p>
            <p className="text-lg leading-8 text-gray-700 text-justify">Sigue a TED en Facebook, Instagram, LinkedIn, TikTok y X.</p>
          </div>
        </div>
      </section>

      <footer className="border-t border-black/30 bg-[var(--color-ted-red)] px-6 py-8 md:py-10">
        <div className="mx-auto grid w-full max-w-[1450px] gap-8 md:grid-cols-[1.2fr_auto] md:items-start">
          <div>
            <Image
              src={logoBlack}
              alt="TEDx Avenida Bolivar"
              className="h-12 w-auto [filter:grayscale(1)_brightness(0)_saturate(0)] md:h-14"
            />
            <p className="mt-4 max-w-[34ch] text-base font-medium leading-6 text-white/90">
              Este evento TEDx independiente se opera bajo licencia de TED.
            </p>

            <div className="mt-6 flex items-center gap-4 text-white">
              <a href="https://www.linkedin.com/company/112654503/" target="_blank" rel="noreferrer" aria-label="LinkedIn" className="transition hover:opacity-70">
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" aria-hidden="true"><path d="M4.98 3.5A2.48 2.48 0 1 0 5 8.46 2.48 2.48 0 0 0 4.98 3.5ZM3 9h4v12H3V9Zm7 0h3.84v1.64h.05c.53-1 1.82-2.05 3.75-2.05C21 8.59 21 11.28 21 14.77V21h-4v-5.53c0-1.32-.03-3.02-1.84-3.02-1.85 0-2.13 1.44-2.13 2.93V21h-4V9Z"/></svg>
              </a>
              <a href="https://instagram.com/tedxavenidabolivar" target="_blank" rel="noreferrer" aria-label="Instagram" className="transition hover:opacity-70">
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" aria-hidden="true"><path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2Zm0 1.8A3.95 3.95 0 0 0 3.8 7.75v8.5a3.95 3.95 0 0 0 3.95 3.95h8.5a3.95 3.95 0 0 0 3.95-3.95v-8.5a3.95 3.95 0 0 0-3.95-3.95h-8.5Zm8.9 1.35a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 1.8a3.2 3.2 0 1 0 0 6.4 3.2 3.2 0 0 0 0-6.4Z"/></svg>
              </a>
            </div>
          </div>

          <div className="flex flex-col items-end space-y-2 text-right text-base font-bold text-white md:justify-self-start md:-ml-8">
            <Link href="/" className="block transition hover:opacity-70">Inicio</Link>
            <Link href="/acerca" className="block transition hover:opacity-70">Acerca de</Link>
            <Link href="/patrocinios" className="block transition hover:opacity-70">Patrocinadores</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
