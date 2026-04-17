"use client";

import { useState, useEffect, type FormEvent } from "react";
import { createPortal } from "react-dom";
import { subscribeNewsletter } from "../../lib/notifications";

export default function TicketsNotifyModal() {
  const [isOpen, setIsOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isOpen]);

  async function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const normalized = email.trim();
    if (!normalized || loading) return;

    setLoading(true);
    setFeedback(null);

    try {
      await subscribeNewsletter(normalized);
      setFeedback({
        type: "success",
        message: "¡Listo! Te avisaremos en cuanto las entradas estén disponibles.",
      });
      setEmail("");
      // Close after delay on success
      setTimeout(() => {
        setIsOpen(false);
        setFeedback(null);
      }, 3000);
    } catch (err: any) {
      setFeedback({
        type: "error",
        message: err.message || "No se pudo procesar la suscripción.",
      });
    } finally {
      setLoading(false);
    }
  }

  const modalContent = isOpen && (
    <div className="fixed inset-0 z-[20000] flex items-center justify-center overflow-hidden bg-black/80 p-4 transition-all animate-page-fade backdrop-blur-xl">
      {/* Overlay click to close */}
      <div
        className="absolute inset-0 cursor-default"
        onClick={() => !loading && setIsOpen(false)}
      />

      <div className="relative w-full max-w-lg overflow-hidden rounded-3xl border border-white/10 bg-[#121212] p-10 shadow-[0_30px_100px_rgba(0,0,0,0.6)] motion-safe:animate-in motion-safe:fade-in motion-safe:zoom-in-95 duration-300">
        {/* red accent at top */}
        <div className="absolute top-0 left-0 h-1.5 w-full bg-[rgb(230,0,30)]" />

        <div className="mb-8">
          <h3 className="text-3xl font-black tracking-tight text-white mb-3">¿Quieres asistir?</h3>
          <p className="text-gray-400 text-base leading-relaxed">
            Déjanos tu correo y serás la primera persona en recibir la notificación cuando las entradas salgan a la venta, además de recibir las ultimas noticias sobre TEDxAvenida Bolivar.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <div>
            <label htmlFor="notify-email" className="sr-only">Correo electrónico</label>
            <input
              id="notify-email"
              type="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="Tu correo electrónico..."
              className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white placeholder:text-gray-500 outline-none focus:border-[rgb(230,0,30)] focus:ring-1 focus:ring-[rgb(230,0,30)] transition-all text-lg"
            />
          </div>

          {feedback && (
            <p className={`text-sm font-bold ${feedback.type === 'success' ? 'text-green-400' : 'text-[rgb(230,0,30)]'}`}>
              {feedback.message}
            </p>
          )}

          <div className="flex gap-4 pt-4">
            <button
              type="button"
              disabled={loading}
              onClick={() => setIsOpen(false)}
              className="flex-1 py-4 rounded-2xl border border-white/10 text-white font-bold text-base hover:bg-white/5 transition disabled:opacity-50"
            >
              Cerrar
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 py-4 rounded-2xl bg-[rgb(230,0,30)] text-white font-bold text-base hover:brightness-110 transition disabled:opacity-50 shadow-[0_10px_30px_rgba(230,0,30,0.3)]"
            >
              {loading ? "Procesando..." : "Avisarme"}
            </button>
          </div>
        </form>

        <button
          onClick={() => setIsOpen(false)}
          className="absolute top-6 right-6 text-gray-500 hover:text-white transition p-2"
          aria-label="Cerrar modal"
        >
          <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>
      </div>
    </div>
  );

  return (
    <>
      <button
        type="button"
        onClick={() => setIsOpen(true)}
        className="inline-flex min-h-[3.5rem] items-center justify-center rounded-md bg-[rgb(230,0,30)] px-10 py-3 text-lg font-bold text-white transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(230,0,30,0.3)] hover:shadow-[0_0_25px_rgba(230,0,30,0.45)]"
      >
        Avisarme sobre las entradas
      </button>

      {isMounted ? createPortal(modalContent, document.body) : null}
    </>
  );
}
