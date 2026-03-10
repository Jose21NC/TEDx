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
            <Image src={logoBlack} alt="TEDx Avenida Bolivar" className="h-[4.5rem] w-auto" priority />
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
                href="https://www.ted.com/tedx/program"
                target="_blank"
                className="ml-2 font-semibold text-[var(--color-ted-red)] underline underline-offset-4"
              >
                ted.com/tedx/program
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

      <footer className="border-t border-gray-800 bg-black px-6 py-8 text-sm text-gray-300">
        <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="hidden md:block">
            <p>Este evento TEDx independiente se opera bajo licencia de TED.</p>
            <p className="mt-2">
              Más información sobre el programa oficial TEDx:
              <Link href="https://www.ted.com/tedx/program" target="_blank" className="ml-1 font-semibold text-[var(--color-ted-red)] underline underline-offset-4">
                ted.com/tedx/program
              </Link>
            </p>
          </div>

          <div className="md:hidden text-center">
            <p>
              Este evento TEDx independiente se opera bajo licencia de TED. Más información sobre el programa oficial TEDx:
              <Link href="https://www.ted.com/tedx/program" target="_blank" className="ml-1 font-semibold text-[var(--color-ted-red)] underline underline-offset-4">
                ted.com/tedx/program
              </Link>
            </p>
          </div>

          <div className="flex items-center justify-center gap-3 md:justify-end">
            <Link
              href="https://instagram.com/tedxavenidabolivar"
              target="_blank"
              aria-label="Instagram"
              className="rounded-full border border-white/30 p-2 text-white transition hover:border-[var(--color-ted-red)] hover:text-[var(--color-ted-red)]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
              </svg>
            </Link>
            <Link
              href="mailto:contacto@tedxavenidabolivar.com"
              aria-label="Correo"
              className="rounded-full border border-white/30 p-2 text-white transition hover:border-[var(--color-ted-red)] hover:text-[var(--color-ted-red)]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="M3 7l9 6 9-6" />
              </svg>
            </Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
