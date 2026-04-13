import Image from "next/image";
import Link from "next/link";
import logoBlack from "../media/logo-black.png";
import MobileNav from "../components/MobileNav";
import VoluntariadoFormWrapper from "./ClientFormWrapper";

export default function VoluntariadoPage() {
  return (
    <main className="min-h-screen bg-black text-white selection:bg-[var(--color-ted-red)] selection:text-white">
      <header className="sticky top-0 z-20 border-b border-black/5 bg-white text-[#222]">
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
              <Link className="transition hover:text-[var(--color-ted-red)]" href="/patrocinios">
                Patrocinadores
              </Link>
            </li>
          </ul>
          <MobileNav />
        </nav>
      </header>

      <section className="mx-auto w-full max-w-6xl px-4 pb-6 pt-6 md:px-6 md:pb-10 md:pt-10">
        <div className="grid grid-cols-1 items-stretch gap-0 md:grid-cols-2">
          <aside className="flex items-stretch">
            <div className="flex w-full flex-col rounded-md bg-black p-4 text-white md:rounded-l-md md:rounded-r-none md:p-10">
              <div className="flex flex-1 flex-col gap-6">
                <div className="w-full text-center">
                  <h1 className="text-[clamp(2.4rem,6vw,4rem)] font-black leading-[0.88] tracking-[-0.06em] text-white">
                    Voluntariado TEDx
                  </h1>
                </div>

                <div className="space-y-5 text-justify text-sm leading-7 text-white/90">
                  <p>
                    Queremos construir una experiencia TEDx memorable con personas que tengan energia, compromiso y ganas de servir.
                    Si deseas aportar tu tiempo y talento, completa este formulario para postularte como voluntario/a.
                  </p>

                  <p>
                    Nuestro equipo revisara cada solicitud para asignar roles segun disponibilidad, habilidades y necesidades del evento.
                    Valoramos perfiles diversos: organizacion, atencion al publico, produccion, comunicacion y soporte en sitio.
                  </p>

                  <p>
                    El evento principal se realizara el sabado 29 de agosto. Sin embargo, la organizacion y coordinacion comienzan antes,
                    por lo que tomaremos en cuenta la disponibilidad previa para reuniones, preparacion y tareas de produccion.
                  </p>

                  <p className="italic text-white/75">
                    Esta aplicacion no garantiza seleccion automatica. Nos pondremos en contacto por correo con las personas
                    preseleccionadas para continuar el proceso.
                  </p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-base font-semibold text-[var(--color-ted-red)]">AREAS DE APOYO</h3>
                  <ul className="list-disc space-y-2 pl-6 text-sm leading-7 text-white/90">
                    <li>Registro y atencion a asistentes</li>
                    <li>Logistica y produccion general</li>
                    <li>Backstage de speakers</li>
                    <li>Contenido y cobertura digital</li>
                  </ul>
                </div>
              </div>
            </div>
          </aside>

          <div className="w-full">
            <div className="flex h-full flex-col rounded-md border border-gray-200 bg-white p-4 text-black shadow-sm md:rounded-r-md md:rounded-l-none md:p-8">
              <div className="mb-6 flex justify-center">
                <Image src={logoBlack} alt="TEDx Avenida Bolivar" className="h-16 w-auto md:h-20" />
              </div>

              <div className="flex-1">
                <VoluntariadoFormWrapper />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}
