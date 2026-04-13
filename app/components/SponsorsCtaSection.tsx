"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import Image from "next/image";
import logoBlack from "../media/logo-black.png";
import { subscribeNewsletter } from "../../lib/notifications";

export default function SponsorsCtaSection() {
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [feedback, setFeedback] = useState("");
  // Ajusta estas dos variables para mover el circulo rojo mas arriba o mas abajo.
  // Ejemplos: "68%", "72%", "60%".
  const ARC_TOP_MOBILE = "72%";
  const ARC_TOP_DESKTOP = "65%";

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalized = email.trim();
    if (!normalized || submitting) return;

    setSubmitting(true);
    setFeedback("");

    try {
      await subscribeNewsletter(normalized);
      setEmail("");
      setFeedback("Te sumaste correctamente a las novedades de TEDx Avenida Bolivar.");
    } catch (error) {
      const message = error instanceof Error ? error.message : "No se pudo completar la suscripcion.";
      setFeedback(message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <section
      aria-labelledby="cta-comunidad-heading"
      className="relative overflow-hidden bg-[#151214] px-6 pb-8 pt-20 md:px-10 md:pb-10 md:pt-24"
      style={{
        ["--cta-arc-top" as any]: ARC_TOP_MOBILE,
        ["--cta-arc-top-md" as any]: ARC_TOP_DESKTOP,
      }}
    >
      <div
        aria-hidden="true"
        className="tedx-cta-arc pointer-events-none absolute left-1/2 top-[var(--cta-arc-top)] h-[900px] w-[260vw] rounded-[50%] bg-[var(--color-ted-red)] md:top-[var(--cta-arc-top-md)] md:h-[1060px] md:w-[2200px]"
      />

      <div className="relative z-[1] mx-auto w-full max-w-[1450px]">
        <h2 id="cta-comunidad-heading" className="sr-only">
          Conecta con TEDx Avenida Bolivar
        </h2>

        <div className="grid gap-8 md:grid-cols-3 md:gap-10">
          <article className="border-t-2 border-white/70 pt-5 md:pt-6">
            <h3 className="max-w-[16ch] text-[clamp(1.8rem,3.5vw,3.1rem)] font-black leading-[0.95] tracking-[-0.05em] text-white">
              Tienes una idea que merece ser difundida y quieres ser speaker?
            </h3>
            <Link href="/convocatoria" className="group tedx-cta-link mt-6 inline-flex items-center gap-2 text-sm font-black uppercase tracking-[0.14em] text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70">
              Convocatoria speakers <span aria-hidden="true" className="tedx-cta-link-arrow">{"->"}</span>
            </Link>
          </article>

          <article className="border-t-2 border-white/70 pt-5 md:pt-6">
            <h3 className="max-w-[16ch] text-[clamp(1.8rem,3.5vw,3.1rem)] font-black leading-[0.95] tracking-[-0.05em] text-white">
              Quieres involucrarte y sumarte como voluntario TEDx?
            </h3>
            <Link
              href="/voluntariado"
              className="group tedx-cta-link mt-6 inline-flex items-center gap-2 text-sm font-black uppercase tracking-[0.14em] text-white focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/70"
            >
              Conviertete en voluntario <span aria-hidden="true" className="tedx-cta-link-arrow">{"->"}</span>
            </Link>
          </article>

          <article className="border-t-2 border-white/70 pt-5 md:pt-6">
            <h3 className="max-w-[16ch] text-[clamp(1.8rem,3.5vw,3.1rem)] font-black leading-[0.95] tracking-[-0.05em] text-white">
              Te interesa impulsar esta edicion como sponsor TEDx?
            </h3>
            <Link href="/patrocinios/solicitud" className="group tedx-cta-link mt-6 inline-flex items-center gap-2 text-sm font-black uppercase tracking-[0.14em] text-black focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-black/70">
              Patrocina tu empresa <span aria-hidden="true" className="tedx-cta-link-arrow">{"->"}</span>
            </Link>
          </article>
        </div>

        <div className="mt-16 grid gap-8 md:mt-24 md:grid-cols-[1fr_auto] md:items-end md:gap-10">
          <p className="max-w-[20ch] pb-1 text-[clamp(1.8rem,3.6vw,3rem)] font-black leading-[1.02] tracking-[-0.04em] text-black [text-wrap:balance]">
            Dejanos tu correo y te compartimos novedades de TEDx Avenida Bolivar
          </p>

          <form onSubmit={handleSubmit} className="w-full max-w-[560px] md:justify-self-end">
            <label htmlFor="cta-email" className="block text-2xl font-black tracking-tight text-black md:text-4xl">
              Tu correo
            </label>
            <div className="mt-3 flex gap-3 border-b-[3px] border-black pb-2">
              <input
                suppressHydrationWarning
                id="cta-email"
                type="email"
                required
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="nombre@correo.com"
                className="min-w-0 flex-1 bg-transparent text-lg font-semibold text-black placeholder:text-black/65 outline-none"
              />
              <button type="submit" disabled={submitting} className="rounded-sm bg-black px-5 py-2 text-lg font-bold text-white transition hover:bg-[#1f1f1f] disabled:cursor-not-allowed disabled:opacity-70">
                {submitting ? "Enviando" : "Enviar"}
              </button>
            </div>
            <p aria-live="polite" className="mt-3 min-h-6 text-sm font-medium text-black/75">
              {feedback}
            </p>
          </form>
        </div>

        <footer className="mt-10 border-t border-black/30 pt-6 md:mt-12 md:pt-8">
          <div className="grid gap-8 md:grid-cols-[1.2fr_auto] md:items-start">
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
      </div>
    </section>
  );
}
