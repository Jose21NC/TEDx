"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
import logoBlack from "../media/logo-black.png";
import MobileNav from "../components/MobileNav";
import { motion } from "framer-motion";
import { getClientDb } from "../../lib/firebaseClient";
import { collection, addDoc, serverTimestamp } from "firebase/firestore";
import { subscribeNewsletter } from "../../lib/notifications";

export default function RegistroPage() {
  const [mounted, setMounted] = useState(false);
  const [nombre, setNombre] = useState("");
  const [correo, setCorreo] = useState("");
  const [telefono, setTelefono] = useState("");
  const [cargo, setCargo] = useState("");
  const [edad, setEdad] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState("");
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  const [motivo, setMotivo] = useState("");

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const newErrors: Record<string, string> = {};
    setSubmitError("");

    if (!nombre.trim()) newErrors.nombre = "El nombre completo es obligatorio.";
    if (!correo.trim()) newErrors.correo = "El correo electrónico es obligatorio.";
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(correo.trim())) {
      newErrors.correo = "Formato de correo electrónico inválido.";
    }
    if (!telefono.trim()) newErrors.telefono = "El número telefónico es obligatorio.";
    else {
      const digits = telefono.replace(/\D/g, "");
      if (digits.length < 8) {
        newErrors.telefono = "Ingresa un número telefónico válido (mínimo 8 dígitos).";
      }
    }
    if (!edad.trim()) newErrors.edad = "La edad es obligatoria.";
    else if (!/^\d+$/.test(edad.trim())) newErrors.edad = "La edad debe ser un número entero.";
    if (!cargo.trim()) newErrors.cargo = "El cargo o profesión es obligatorio.";
    if (!motivo.trim()) newErrors.motivo = "Por favor dinos por qué te gustaría asistir.";
    else if (motivo.trim().split(/\s+/).length > 100) {
      newErrors.motivo = "El motivo debe tener un máximo de 100 palabras.";
    }

    setErrors(newErrors);
    if (Object.keys(newErrors).length > 0) return;

    try {
      setIsSubmitting(true);
      const db = getClientDb();
      const col = collection(db, "preregistrosEntradas");
      await addDoc(col, {
        id: crypto.randomUUID(),
        nombre: nombre.trim(),
        correo: correo.trim(),
        telefono: telefono.trim(),
        cargo: cargo.trim(),
        edad: Number(edad.trim()),
        motivo: motivo.trim(),
        createdAt: serverTimestamp(),
        createdAtIso: new Date().toISOString()
      });

      try {
        await subscribeNewsletter(correo.trim());
      } catch (newsletterErr) {
        console.error("Error subscribing to newsletter:", newsletterErr);
      }

      setShowSuccessModal(true);
      setNombre("");
      setCorreo("");
      setTelefono("");
      setCargo("");
      setEdad("");
      setMotivo("");
    } catch (err: any) {
      console.error("Error saving pre-registration:", err);
      setSubmitError("No se pudo completar el pre-registro. Intenta nuevamente en unos momentos.");
    } finally {
      setIsSubmitting(false);
    }
  }

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
            <li>
              <Link className="transition hover:text-[var(--color-ted-red)]" href="/voluntarios">
                Voluntarios
              </Link>
            </li>
          </ul>
          <MobileNav />
        </nav>
      </header>

      <section className="mx-auto w-full max-w-6xl px-4 pb-12 pt-6 md:px-6 md:pb-20 md:pt-10">
        <div className="grid grid-cols-1 items-stretch gap-0 md:grid-cols-2 rounded-3xl overflow-hidden border border-white/5 shadow-2xl">
          {/* Left Info Column */}
          <aside className="flex items-stretch">
            <motion.div
              initial={{ opacity: 0, x: -30 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.8, ease: "easeOut" }}
              className="flex w-full flex-col bg-[#0f0e0f] p-6 text-white md:p-12 justify-between"
            >
              <div className="flex flex-col gap-8">
                <div className="w-full text-left">
                  <h1 className="text-[clamp(2.4rem,4vw,3.5rem)] font-black leading-[0.95] tracking-[-0.06em] text-white mb-2">
                    Pre-registro de <br />
                    <span className="text-[var(--color-ted-red)]">Entradas</span>
                  </h1>
                  <div className="h-1.5 w-16 bg-[var(--color-ted-red)] rounded-full mt-4" />
                </div>

                <div className="space-y-5 text-left text-base leading-relaxed text-white/80">
                  <p>
                    Sé parte de una experiencia transformadora. Bajo nuestro lema oficial, <span className="font-semibold text-white">"El Arte de Reinventar"</span>, reuniremos ideas que están redefiniendo el futuro de Nicaragua.
                  </p>

                  <div className="bg-white/[0.03] border border-white/10 p-5 rounded-2xl space-y-3">
                    <h3 className="text-sm font-bold text-[var(--color-ted-red)] tracking-wider uppercase">NOTAS IMPORTANTES</h3>
                    <ul className="space-y-2 text-sm">
                      <li className="flex items-start gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-ted-red)] mt-1.5 shrink-0" />
                        <span>El pre-registro <span className="font-semibold text-white">no garantiza</span> la obtención de una entrada para el evento.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-ted-red)] mt-1.5 shrink-0" />
                        <span>En caso de ser seleccionado/a, te enviaremos un correo electrónico con un <span className="font-semibold text-white">código único y exclusivo</span>.</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <span className="h-1.5 w-1.5 rounded-full bg-[var(--color-ted-red)] mt-1.5 shrink-0" />
                        <span>Con dicho código podrás realizar el canje oficial de tu entrada de forma completamente gratuita.</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/5 flex flex-col gap-1">
                <p className="text-gray-500 text-xs font-mono uppercase tracking-widest">El Arte de Reinventar</p>
                <p className="text-gray-600 text-[10px] uppercase tracking-widest">TEDxAvenidaBolivar 2026</p>
              </div>
            </motion.div>
          </aside>

          {/* Right Form Column */}
          <motion.div
            initial={{ opacity: 0, x: 30 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.8, ease: "easeOut", delay: 0.1 }}
            className="w-full"
          >
            <div className="flex h-full flex-col bg-white p-6 text-black md:p-12">
              <div className="mb-6 flex flex-col items-center">
                <Image src={logoBlack} alt="TEDx Avenida Bolivar" className="h-16 w-auto md:h-20" />
                <p className="mt-2 text-center text-xs text-gray-500 max-w-xs">
                  Completa tu solicitud para participar en la selección de entradas de esta edición.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-5 flex-1 flex flex-col justify-center">
                <div>
                  <label className="block text-sm font-semibold text-gray-700">Nombre Completo *</label>
                  <input
                    type="text"
                    value={nombre}
                    onChange={(e) => setNombre(e.target.value)}
                    className={`mt-1 block w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-[var(--color-ted-red)]/20 ${
                      errors.nombre ? "border-red-600 focus:border-red-600" : "border-gray-300 focus:border-[var(--color-ted-red)]"
                    }`}
                    placeholder="Ej. Juan Pérez"
                  />
                  {errors.nombre && <p className="mt-1 text-xs text-red-600 font-medium">{errors.nombre}</p>}
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700">Correo Electrónico *</label>
                    <input
                      type="email"
                      value={correo}
                      onChange={(e) => setCorreo(e.target.value)}
                      className={`mt-1 block w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-[var(--color-ted-red)]/20 ${
                        errors.correo ? "border-red-600 focus:border-red-600" : "border-gray-300 focus:border-[var(--color-ted-red)]"
                      }`}
                      placeholder="ejemplo@correo.com"
                    />
                    {errors.correo && <p className="mt-1 text-xs text-red-600 font-medium">{errors.correo}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700">Teléfono *</label>
                    <input
                      type="tel"
                      value={telefono}
                      onChange={(e) => setTelefono(e.target.value)}
                      className={`mt-1 block w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-[var(--color-ted-red)]/20 ${
                        errors.telefono ? "border-red-600 focus:border-red-600" : "border-gray-300 focus:border-[var(--color-ted-red)]"
                      }`}
                      placeholder="8888-8888"
                    />
                    {errors.telefono && <p className="mt-1 text-xs text-red-600 font-medium">{errors.telefono}</p>}
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                  <div>
                    <label className="block text-sm font-semibold text-gray-700">Edad *</label>
                    <input
                      type="number"
                      min="0"
                      value={edad}
                      onChange={(e) => setEdad(e.target.value)}
                      className={`mt-1 block w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-[var(--color-ted-red)]/20 ${
                        errors.edad ? "border-red-600 focus:border-red-600" : "border-gray-300 focus:border-[var(--color-ted-red)]"
                      }`}
                      placeholder="Ej. 25"
                    />
                    {errors.edad && <p className="mt-1 text-xs text-red-600 font-medium">{errors.edad}</p>}
                  </div>

                  <div>
                    <label className="block text-sm font-semibold text-gray-700">Cargo o Profesión *</label>
                    <input
                      type="text"
                      value={cargo}
                      onChange={(e) => setCargo(e.target.value)}
                      className={`mt-1 block w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-[var(--color-ted-red)]/20 ${
                        errors.cargo ? "border-red-600 focus:border-red-600" : "border-gray-300 focus:border-[var(--color-ted-red)]"
                      }`}
                      placeholder="Ej. Estudiante / Diseñador"
                    />
                    {errors.cargo && <p className="mt-1 text-xs text-red-600 font-medium">{errors.cargo}</p>}
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-semibold text-gray-700">
                    ¿Por qué te gustaría asistir a esta edición? *
                  </label>
                  <textarea
                    value={motivo}
                    onChange={(e) => setMotivo(e.target.value)}
                    rows={4}
                    maxLength={600}
                    className={`mt-1 block w-full rounded-xl border px-4 py-2.5 text-sm outline-none transition focus:ring-2 focus:ring-[var(--color-ted-red)]/20 ${
                      errors.motivo ? "border-red-600 focus:border-red-600" : "border-gray-300 focus:border-[var(--color-ted-red)]"
                    }`}
                    placeholder="Compártenos qué te motiva de esta edición (máximo 100 palabras)..."
                  />
                  {errors.motivo && <p className="mt-1 text-xs text-red-600 font-medium">{errors.motivo}</p>}
                </div>

                {submitError && (
                  <div className="rounded-xl border border-red-200 bg-red-50 p-3.5 text-xs text-red-700 font-medium">
                    {submitError}
                  </div>
                )}

                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full rounded-xl bg-[var(--color-ted-red)] px-5 py-3 font-bold text-white shadow-lg transition hover:bg-[#c00020] active:scale-[0.98] disabled:opacity-50 flex items-center justify-center gap-2"
                  >
                    {isSubmitting ? (
                      <>
                        <span className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white"></span>
                        <span>Procesando...</span>
                      </>
                    ) : (
                      "Completar Pre-registro"
                    )}
                  </button>
                </div>
              </form>
            </div>
          </motion.div>
        </div>
      </section>

      {/* Success Modal */}
      {showSuccessModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="absolute inset-0 bg-black/70 backdrop-blur-sm" onClick={() => setShowSuccessModal(false)} />
          <div className="relative w-full max-w-md rounded-2xl border border-green-200 bg-white p-6 text-center shadow-2xl text-black">
            <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-full bg-green-50 text-green-600">
              <svg fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor" className="h-7 w-7">
                <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12c0 1.268-.63 2.39-1.593 3.068a3.745 3.745 0 01-1.043 3.296 3.745 3.745 0 01-3.296 1.043A3.745 3.745 0 0112 21c-1.268 0-2.39-.63-3.068-1.593a3.746 3.746 0 01-3.296-1.043 3.745 3.745 0 01-1.043-3.296A3.745 3.745 0 013 12c0-1.268.63-2.39 1.593-3.068a3.745 3.745 0 011.043-3.296 3.746 3.746 0 013.296-1.043A3.746 3.746 0 0112 3c1.268 0 2.39.63 3.068 1.593a3.746 3.746 0 013.296 1.043 3.746 3.746 0 011.043 3.296A3.745 3.745 0 0121 12z" />
              </svg>
            </div>
            <h3 className="mb-2 text-xl font-bold text-green-900">Pre-registro Exitoso</h3>
            <p className="mb-4 text-sm text-gray-600 leading-relaxed">
              Tus datos han sido registrados en nuestra base de datos para la selección.
            </p>
            <div className="rounded-xl bg-gray-50 border border-gray-150 p-4 mb-6 text-xs text-gray-500 text-left leading-relaxed">
              <span className="font-bold text-gray-700 block mb-1">Recuerda:</span>
              Este registro no asegura una entrada. Si tu solicitud es seleccionada, te enviaremos un correo electrónico con un código de canje gratuito.
            </div>
            <button
              type="button"
              onClick={() => setShowSuccessModal(false)}
              className="w-full inline-flex justify-center rounded-xl bg-gray-900 px-5 py-3 font-semibold text-white hover:bg-gray-800 transition active:scale-[0.98]"
            >
              Entendido
            </button>
          </div>
        </div>
      )}
    </main>
  );
}
