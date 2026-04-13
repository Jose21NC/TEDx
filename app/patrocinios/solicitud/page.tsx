import Image from "next/image";
import Link from "next/link";
import logoBlack from "../../media/logo-black.png";
import SponsorInquiryFormWrapper from "./ClientFormWrapper";

export default function PatrociniosSolicitudPage() {
  return (
    <main className="min-h-screen bg-black text-white selection:bg-[var(--color-ted-red)] selection:text-white">
      <section className="mx-auto w-full max-w-6xl px-4 pb-6 pt-6 md:px-6 md:pb-10 md:pt-10">
        <div className="grid grid-cols-1 gap-0 md:grid-cols-2 items-stretch">
          <aside className="flex items-stretch">
            <div className="flex w-full flex-col rounded-md bg-black p-4 text-white md:rounded-l-md md:rounded-r-none md:p-10">
              <div className="flex-1 flex flex-col gap-6">
                <div className="w-full">
                  <img src="/media/SPONSORS_LOGO.webp" alt="TEDx Avenida Bolívar" className="mx-auto h-24 w-auto md:h-28 object-contain" />
                </div>

                <div className="space-y-5 text-sm leading-7 text-justify text-white/90">
                  <p>
                    TEDx Avenida Bolívar busca aliados que quieran sumar valor a una experiencia de ideas, comunidad y proyección.
                    Si tu empresa desea apoyar el evento, aquí puedes compartirnos tu información y la forma en que te gustaría participar.
                  </p>

                  <p>
                    Queremos que esta colaboración sea clara y útil para ambas partes. Por eso incluimos opciones de patrocinio en efectivo,
                    en especie y propuestas personalizadas, para adaptarnos a lo que mejor represente a tu marca.
                  </p>

                  <p className="italic text-white/75">
                    El formulario está pensado para iniciar la conversación. Después de enviarlo, nuestro equipo revisará la información y
                    se pondrá en contacto contigo para dar seguimiento.
                  </p>
                </div>

                <div className="space-y-4">
                  <h3 className="text-base font-semibold text-[var(--color-ted-red)]">FORMAS DE PATROCINIO</h3>
                  <ul className="list-disc space-y-2 pl-6 text-sm leading-7 text-white/90">
                    <li>Efectivo: apoyo monetario directo para producción, logística y activaciones.</li>
                    <li>En especie: bienes o servicios como impresión, alimentos, transporte o producción.</li>
                    <li>Personalizado: una propuesta diseñada contigo según tus objetivos o capacidades.</li>
                  </ul>
                </div>

                <div className="rounded-md border border-white/10 bg-white/5 p-4 text-sm text-white/80">
                  <p className="font-semibold text-white">Siguiente paso</p>
                  <p className="mt-2 leading-6">
                    Completa el formulario del lado derecho con los datos de tu empresa y del encargado de contacto.
                  </p>
                </div>
              </div>

              <div className="mt-8 hidden text-sm text-white/60 md:block">
                <p>
                  Si prefieres volver a la sección de patrocinadores, puedes regresar desde aquí:
                  <Link href="/patrocinios" className="ml-1 font-semibold text-[var(--color-ted-red)] underline underline-offset-4">
                    patrocinios
                  </Link>
                </p>
              </div>
            </div>
          </aside>

          <div className="w-full">
            <div className="flex h-full flex-col rounded-md border border-gray-200 bg-white p-4 text-black shadow-sm md:rounded-r-md md:rounded-l-none md:p-8">
              <div className="mb-6 flex justify-center">
                <Image src={logoBlack} alt="TEDx Avenida Bolívar" className="h-16 w-auto md:h-20" />
              </div>

              <div className="flex-1">
                <SponsorInquiryFormWrapper />
              </div>
            </div>
          </div>
        </div>
      </section>
    </main>
  );
}