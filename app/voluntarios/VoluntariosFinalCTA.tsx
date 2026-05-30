import Link from "next/link";

export default function VoluntariosFinalCTA() {
  return (
    <section className="px-6 py-28 md:py-36 bg-[radial-gradient(circle_at_center,rgba(230,0,30,0.12),transparent_60%)]">
      <div className="max-w-3xl mx-auto text-center">
        <h2 className="text-4xl md:text-6xl font-black text-white tracking-tighter mb-6">
          ¿Listo para sumarte?
        </h2>
        <p className="text-white/60 mb-10 text-lg">
          Completa tu solicitud y nos pondremos en contacto contigo.
        </p>
        <Link
          href="/voluntariado"
          className="inline-block bg-[var(--color-ted-red)] hover:bg-[#c00020] text-white font-bold px-10 py-4 rounded-full text-lg transition-all duration-300 hover:scale-105 shadow-lg shadow-red-900/30"
        >
          Completa tu solicitud
        </Link>
      </div>
    </section>
  );
}
