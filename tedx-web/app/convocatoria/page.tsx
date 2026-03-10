import Image from "next/image";
import Link from "next/link";
import logoBlack from "../media/logo-black.png";
import ConvocatoriaForm from "./Form";

export default function ConvocatoriaPage() {
  return (
    <main className="min-h-screen bg-black text-white selection:bg-[var(--color-ted-red)] selection:text-white">
      <section className="mx-auto w-full max-w-5xl px-4 md:px-6 pt-6 md:pt-10">
        <div className="grid grid-cols-1 gap-0 md:grid-cols-2 items-stretch">
          {/* Left: content banner-like column (logo + convocatoria text) */}
          <aside className="flex items-stretch">
            <div className="w-full rounded-md md:rounded-l-md md:rounded-r-none bg-black p-4 md:p-10 text-white flex flex-col">
              <div className="flex-1 flex flex-col gap-6">
                <div className="w-full">
                  <img src="/media/SPEAKERS-logo.png" alt="SPEAKERS logo" className="w-80 mx-auto h-auto" />
                </div>

                <div className="prose prose-invert max-w-none text-sm leading-7 text-justify">
                  <div className="space-y-4">
                    <p>
                      TEDxAvenida Bolivar es el escenario donde convergen la historia y el futuro de Managua. Bajo nuestro lema oficial, "El Arte de Reinventar", buscamos explorar cómo la ciencia, el arte, la cultura y la educación se entrelazan para transformar los retos de nuestro entorno en soluciones brillantes.
                    </p>

                    <p>
                      No buscamos solamente historias de vida, buscamos ideas revolucionarias. Si tienes una perspectiva única que demuestra cómo los nicaragüenses estamos reconstruyendo y modernizando nuestra sociedad con los recursos que tenemos, el mundo necesita escucharte.
                    </p>

                    <p className="italic">
                      Disclaimer: Siguiendo las reglas globales de TED, las charlas no pueden tener corte religioso, político, comercial (vender productos/empresas) o de pseudociencia. Para mayor información, revisa los lineamientos de contenido en <a href="https://www.ted.com/participate/organize-a-local-tedx-event/tedx-organizer-guide/speakers-program/prepare-your-speaker/tedx-content-guidelines-details" target="_blank" rel="noreferrer" className="text-[var(--color-ted-red)] underline">TED.com</a>.
                    </p>
                  </div>

                  <h3 className="mt-4 text-base font-semibold text-[var(--color-ted-red)]">FECHAS CLAVE</h3>
                  <ul className="list-disc ml-6">
                    <li>Apertura de convocatoria: Martes 10 de marzo de 2026</li>
                    <li>Fecha máxima de postulación: Viernes 10 de abril de 2026</li>
                    <li>Audición Presencial (Open Mic): Sábado 18 de abril de 2026</li>
                  </ul>

                  <h3 className="mt-4 text-base font-semibold text-[var(--color-ted-red)]">BASES DE LA POSTULACIÓN</h3>
                  <ul className="list-disc ml-6">
                    <li>¿Quién puede postular? La convocatoria es abierta a innovadores, artistas, profesionales, estudiantes, docentes y ciudadanos en general. La participación es estrictamente individual.</li>
                    <li>El Video Pitch: Deberás grabar y enviar un video de 2 a 3 minutos máximo presentando tu idea central y cómo se alinea con el concepto de "El Arte de Reinventar".</li>
                    <li>Reglas del video:
                      <ul className="list-disc ml-6">
                        <li>No debe tener cortes ni saltos: el video debe ser un pitch grabado de corrido en una sola toma.</li>
                        <li>Cero postproducción: sin imágenes de apoyo, sin diapositivas y sin música de fondo.</li>
                        <li>Sube tu video a YouTube (en modo Oculto/No Listado) o a Google Drive. Asegúrate de que el enlace no tenga restricciones de acceso. Si el jurado no puede abrir el link, la postulación será descartada automáticamente.</li>
                      </ul>
                    </li>
                    <li>Recomendación: Cuida la iluminación y el audio de tu locación. Evita distractores de fondo. ¡Queremos que tú y tu idea sean los únicos protagonistas!</li>
                  </ul>

                  <h3 className="mt-4 text-base font-semibold text-[var(--color-ted-red)]">EL PROCESO DE SELECCIÓN</h3>
                  <ul className="list-disc ml-6">
                    <li>Si tu idea queda preseleccionada, te contactaremos por correo electrónico para invitarte al OPEN MIC presencial que se llevará a cabo el sábado 18 de abril en Managua. No se admitirán presentaciones de manera remota.</li>
                    <li>En el Open Mic, tendrás exactamente 3 minutos para presentar tu idea en vivo frente a nuestro equipo curador.</li>
                    <li>De este grupo, seleccionaremos a los speakers oficiales que se subirán al escenario de TEDxAvenida Bolivar.</li>
                  </ul>

                  <p className="mt-4 font-semibold">¿Tienes una idea que vale la pena compartir? ¡Postula aquí!</p>

                  
                </div>
              </div>
            </div>
          </aside>

          {/* Right: Form */}
          <div className="w-full">
            <div className="h-full rounded-md md:rounded-r-md md:rounded-l-none border border-gray-200 bg-white p-4 md:p-8 shadow-sm flex flex-col text-black">
              <div className="mb-6 flex justify-center">
                <Image src={logoBlack} alt="TEDx UEES" className="h-20 w-auto" />
              </div>

              <div className="flex-1">
                <ConvocatoriaForm />
              </div>
            </div>
          </div>
        </div>
      </section>

    </main>
  );
}
