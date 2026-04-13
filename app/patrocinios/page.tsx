import Image from "next/image";
import Link from "next/link";
import fs from "fs";
import path from "path";
import logoBlack from "../media/logo-black.png";
import MobileNav from "../components/MobileNav";
import SponsorsMobileCarousel from "../components/SponsorsMobileCarousel";
import logoBoreal from "../media/logoBoreal.png";
import logoWhite from "../media/logo-white.png";
import SponsorshipForm from "../components/ContactForm";

export default function PatrociniosPage() {
  // Leer imágenes desde carpeta pública: public/patrocinadores
  const sponsorsDir = path.join(process.cwd(), "public", "patrocinadores");
  let sponsorFiles: string[] = [];
  try {
    sponsorFiles = fs.readdirSync(sponsorsDir).filter((f) => /\.(png|jpe?g|webp|svg)$/i.test(f));
  } catch (e) {
    sponsorFiles = [];
  }

  return (
    <main className="min-h-screen bg-black text-white selection:bg-[var(--color-ted-red)] selection:text-white animate-page-fade">
      <header className="border-b border-black/5 bg-white text-[#222] sticky top-0 z-20">
        <nav className="mx-auto flex w-full max-w-[88rem] items-center justify-between px-6 py-0.5">
          <Link href="/" className="flex items-center">
            <Image src={logoBlack} alt="TEDx Avenida Bolivar" className="h-[4.5rem] w-auto" priority />
          </Link>

          <ul className="hidden items-center gap-6 text-base font-medium md:flex">
            <li>
              <Link className="transition hover:text-[var(--color-ted-red)]" href="/">
                Inicio
              </Link>
            </li>
            <li>
              <Link className="transition hover:text-[var(--color-ted-red)]" href="/acerca">
                Acerca de
              </Link>
            </li>
            <li>
              <Link className="font-semibold text-[var(--color-ted-red)]" href="/patrocinios">
                Patrocinadores
              </Link>
            </li>
          </ul>
          <MobileNav />
        </nav>
      </header>

      <section className="mx-auto w-full max-w-7xl px-6 py-28">
        <h2 className="text-center text-2xl font-semibold tracking-tight md:text-3xl">Agradecemos a nuestros patrocinadores</h2>

        <div className="mt-12 hidden w-full flex-wrap items-center justify-center gap-12 py-12 md:flex">
          {sponsorFiles.length > 0 ? (
            sponsorFiles.map((file) => (
              <div key={file} className="flex items-center justify-center">
                <img src={`/patrocinadores/${file}`} alt={file} className="max-h-20 w-auto object-contain" />
              </div>
            ))
          ) : (
            <p className="text-center text-gray-400">No hay más imágenes en /public/patrocinadores — coloca las imágenes ahí.</p>
          )}
        </div>

        <div className="mt-8 md:hidden">
          <SponsorsMobileCarousel files={sponsorFiles} />
        </div>

        <h2 className="mt-12 text-center text-2xl font-semibold tracking-tight md:text-3xl">Con el apoyo de</h2>
          <div className="mt-10 flex items-center justify-center flex-col gap-6">
            <div className="max-w-[220px] w-full px-4">
              <Image src={logoBoreal} alt="Boreal" className="w-full h-auto object-contain" />
            </div>

            <div className="mt-6">
              <Image src={logoWhite} alt="TEDx Avenida Bolivar" className="h-32 w-auto" />
            </div>

            <SponsorshipForm />

            <div className="text-center text-sm text-gray-300 mt-2">
              <p>¿Quieres sumarte como patrocinador? <a href="mailto:contacto@tedxavenidabolivar.com" className="text-white underline">Contáctanos</a>.</p>
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
