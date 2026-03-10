import Image from "next/image";
import Link from "next/link";
import logoBlack from "./media/logo-black.png";
import MobileNav from "./components/MobileNav";

export default function Home() {
  return (
    <main className="min-h-dvh flex flex-col bg-black text-white selection:bg-[var(--color-ted-red)] selection:text-white animate-page-fade">
      <header className="border-b border-black/5 bg-white text-[#222] sticky top-0 z-20">
        <nav className="relative mx-auto flex w-full max-w-[88rem] items-center justify-between px-6 py-0.5">
          <Link href="#inicio" className="flex items-center">
            <Image src={logoBlack} alt="TEDx Avenida Bolivar" className="h-[4.5rem] w-auto" priority />
          </Link>

          <ul className="hidden items-center gap-6 text-base font-medium md:flex">
            <li>
              <Link className="transition hover:text-[var(--color-ted-red)]" href="#inicio">
                Inicio
              </Link>
            </li>
            <li>
              <Link className="transition hover:text-[var(--color-ted-red)]" href="/acerca">
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

      <section id="inicio" className="mx-auto -mt-8 flex w-full max-w-none md:max-w-7xl flex-1 items-center justify-center px-4 md:px-6 py-12 md:py-20 bg-black">
        <div className="w-full max-w-7xl">
          {/* Banner de convocatoria: imagen colocada en public/media/convocatoria.jpg */}
          <div className="mx-auto w-full h-[68vh] min-h-[480px] max-h-[760px] md:h-[520px] max-w-full overflow-hidden bg-black rounded-sm transition-all duration-300">
            <Link href="/convocatoria" className="block w-full h-full">
              <picture>
                <source media="(max-width: 640px)" srcSet="/media/SPEAKERS-mobile.png" />
                <img src="/media/SPEAKERS.png" alt="Banner convocatoria" className="w-full h-full object-cover" />
              </picture>
            </Link>
          </div>
        </div>
      </section>

      <div className="h-14 md:h-0 bg-black" aria-hidden="true" />

      <footer className="border-t border-gray-800 bg-black px-6 py-8 text-sm text-gray-300">
          <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="hidden md:block">
            <p>Este evento TEDx independiente se opera bajo licencia de TED.</p>
            <p className="mt-2">
              Más información sobre el programa oficial TEDx:
              <a href="https://www.ted.com/tedx/program" target="_blank" rel="noreferrer" className="ml-1 font-semibold text-[var(--color-ted-red)] underline underline-offset-4">
                ted.com/tedx/program
              </a>
            </p>
          </div>

          {/* On mobile: single paragraph combining both lines and centered icons */}
          <div className="md:hidden text-center">
            <p>
              Este evento TEDx independiente se opera bajo licencia de TED. Más información sobre el programa oficial TEDx: 
              <a href="https://www.ted.com/tedx/program" target="_blank" rel="noreferrer" className="ml-1 font-semibold text-[var(--color-ted-red)] underline underline-offset-4">
                ted.com/tedx/program
              </a>
            </p>
          </div>

          <div className="flex items-center gap-3 justify-center md:justify-end">
            <a
              href="https://instagram.com/tedxavenidabolivar"
              target="_blank"
              rel="noreferrer"
              aria-label="Instagram"
              className="rounded-full border border-white/30 p-2 text-white transition hover:border-[var(--color-ted-red)] hover:text-[var(--color-ted-red)]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="3" width="18" height="18" rx="5" />
                <circle cx="12" cy="12" r="4" />
                <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
              </svg>
            </a>
            <a
              href="mailto:contacto@tedxavenidabolivar.com"
              aria-label="Correo"
              className="rounded-full border border-white/30 p-2 text-white transition hover:border-[var(--color-ted-red)] hover:text-[var(--color-ted-red)]"
            >
              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                <rect x="3" y="5" width="18" height="14" rx="2" />
                <path d="M3 7l9 6 9-6" />
              </svg>
            </a>
          </div>
        </div>
      </footer>
    </main>
  );
}