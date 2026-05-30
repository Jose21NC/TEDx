import type { Metadata } from "next";
import Link from "next/link";
import Image from "next/image";
import logoBlack from "../media/logo-black.png";
import MobileNav from "../components/MobileNav";
import VoluntariosHero from "./VoluntariosHero";
import VoluntariosStatement from "./VoluntariosStatement";
import VoluntariosAreas from "./VoluntariosAreas";
import VoluntariosFinalCTA from "./VoluntariosFinalCTA";

export const metadata: Metadata = {
  title: "Voluntarios | TEDx Avenida Bolivar",
  description:
    "Únete como voluntario al primer TEDx en Managua. Sé parte del equipo que traerá ideas inspiradoras a la comunidad.",
};

export default function VoluntariosPage() {
  return (
    <main className="min-h-screen bg-[#171314] text-white selection:bg-[var(--color-ted-red)] selection:text-white animate-page-fade">
      <header className="border-b border-black/5 bg-white text-[#222] sticky top-0 z-[100]">
        <nav className="mx-auto flex w-full max-w-[88rem] items-center justify-between px-6 py-0.5">
          <Link href="/" className="flex items-center">
            <Image src={logoBlack} alt="TEDx Avenida Bolivar" className="h-[4.5rem] w-auto" />
          </Link>

          <ul className="hidden items-center gap-6 text-base font-medium md:flex">
            <li>
              <Link className="transition hover:text-[rgb(230,0,30)]" href="/">
                Inicio
              </Link>
            </li>
            <li>
              <Link className="transition hover:text-[rgb(230,0,30)]" href="/acerca">
                Acerca de
              </Link>
            </li>
            <li>
              <Link className="transition hover:text-[rgb(230,0,30)]" href="/patrocinios">
                Patrocinadores
              </Link>
            </li>
            <li>
              <Link className="transition text-[rgb(230,0,30)] font-semibold hover:text-[rgb(230,0,30)]" href="/voluntarios">
                Voluntarios
              </Link>
            </li>
          </ul>
          <MobileNav />
        </nav>
      </header>

      <VoluntariosHero />
      <VoluntariosStatement />
      <VoluntariosAreas />
      <VoluntariosFinalCTA />
    </main>
  );
}
