import Image from "next/image";
import Link from "next/link";
import fs from "fs";
import path from "path";
import logoBlack from "../media/logo-black.png";
import MobileNav from "../components/MobileNav";
import SponsorInquiryModal from "../components/SponsorInquiryModal";
import SponsorsMobileCarousel from "../components/SponsorsMobileCarousel";
import logoBoreal from "../media/logoBoreal.png";
import logoWhite from "../media/logo-white.png";

export default function PatrociniosPage() {
  // Leer imágenes desde carpeta pública: public/patrocinadores
  const sponsorsDir = path.join(process.cwd(), "public", "patrocinadores");
  let sponsorFiles: string[] = [];
  try {
    sponsorFiles = fs
      .readdirSync(sponsorsDir)
      .filter((f) => /\.(png|jpe?g|webp|svg)$/i.test(f))
      .filter((f) => f !== "redJovenes.png");
  } catch (e) {
    sponsorFiles = [];
  }

  return (
    <main className="min-h-screen bg-black text-white selection:bg-[var(--color-ted-red)] selection:text-white animate-page-fade">
      <header className="border-b border-black/5 bg-white text-[#222] sticky top-0 z-20">
        <nav className="mx-auto flex w-full max-w-[88rem] items-center justify-between px-6 py-0.5">
          <Link href="/" className="flex items-center">
            <Image src={logoBlack} alt="TEDx Avenida Bolivar" className="h-[4.5rem] w-auto" />
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
        <div className="mt-10 flex flex-col items-center gap-8">
          <div className="flex flex-wrap items-center justify-center gap-6 sm:gap-8">
            <div className="relative h-16 w-[180px] px-4 sm:h-20 sm:w-[220px]">
              <Image src={logoBoreal} alt="Boreal" fill sizes="(max-width: 640px) 180px, 220px" className="object-contain" />
            </div>

            <div className="relative h-16 w-[180px] px-4 sm:h-20 sm:w-[220px]">
              <Image src="/patrocinadores/redJovenes.png" alt="Red de Comunicadores" fill sizes="(max-width: 640px) 180px, 220px" className="object-contain" />
            </div>

          </div>

          {/* Logo TEDx (desactivado por ahora.) 
          <div className="mt-6 flex w-full justify-center">
            <div className="flex w-[260px] justify-center px-4">
              <Image src={logoWhite} alt="TEDx Avenida Bolivar" className="h-28 w-auto object-contain" />
            </div>
          </div>  */}

          <div className="space-y-3 mt-8 text-center text-base text-gray-300 md:text-[17px] ">
            <p>¿Quieres sumarte como patrocinador? Da el primer paso y cuéntanos sobre tu empresa.</p>
            <SponsorInquiryModal />
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
            <p className="mt-4 max-w-[34ch] text-base font-medium leading-6 text-black/80">
              Este evento TEDx independiente se opera bajo licencia de TED.
            </p>

            <div className="mt-6 flex items-center gap-4 text-black">
              <a href="https://www.linkedin.com/company/112654503/" target="_blank" rel="noreferrer" aria-label="LinkedIn" className="transition hover:opacity-70">
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" aria-hidden="true"><path d="M4.98 3.5A2.48 2.48 0 1 0 5 8.46 2.48 2.48 0 0 0 4.98 3.5ZM3 9h4v12H3V9Zm7 0h3.84v1.64h.05c.53-1 1.82-2.05 3.75-2.05C21 8.59 21 11.28 21 14.77V21h-4v-5.53c0-1.32-.03-3.02-1.84-3.02-1.85 0-2.13 1.44-2.13 2.93V21h-4V9Z"/></svg>
              </a>
              <a href="https://instagram.com/tedxavenidabolivar" target="_blank" rel="noreferrer" aria-label="Instagram" className="transition hover:opacity-70">
                <svg viewBox="0 0 24 24" className="h-6 w-6" fill="currentColor" aria-hidden="true"><path d="M7.75 2h8.5A5.75 5.75 0 0 1 22 7.75v8.5A5.75 5.75 0 0 1 16.25 22h-8.5A5.75 5.75 0 0 1 2 16.25v-8.5A5.75 5.75 0 0 1 7.75 2Zm0 1.8A3.95 3.95 0 0 0 3.8 7.75v8.5a3.95 3.95 0 0 0 3.95 3.95h8.5a3.95 3.95 0 0 0 3.95-3.95v-8.5a3.95 3.95 0 0 0-3.95-3.95h-8.5Zm8.9 1.35a1.2 1.2 0 1 1 0 2.4 1.2 1.2 0 0 1 0-2.4ZM12 7a5 5 0 1 1 0 10 5 5 0 0 1 0-10Zm0 1.8a3.2 3.2 0 1 0 0 6.4 3.2 3.2 0 0 0 0-6.4Z"/></svg>
              </a>
            </div>
          </div>

          <div className="flex flex-col items-end space-y-2 text-right text-base font-bold text-black md:justify-self-start md:-ml-8">
            <Link href="/" className="block transition hover:opacity-70">Inicio</Link>
            <Link href="/acerca" className="block transition hover:opacity-70">Acerca de</Link>
            <Link href="/patrocinios" className="block transition hover:opacity-70">Patrocinadores</Link>
          </div>
        </div>
      </footer>
    </main>
  );
}
