"use client";
import { motion } from "framer-motion";

const areas = [
  "Producción",
  "Logística",
  "Registro y atención",
  "Escenario y speakers",
  "Comunicación y redes",
  "Foto y video",
];

export default function VoluntariosAreas() {
  return (
    <section className="px-6 pb-28 md:pb-36 bg-[#171314]">
      <div className="max-w-5xl mx-auto">
        <div className="text-center mb-14">
          <h2 className="text-3xl md:text-5xl font-black text-white tracking-tighter mb-4">
            Áreas de participación
          </h2>
          <p className="text-white/60 max-w-xl mx-auto">
            Hay muchas formas de aportar. Elige el área que más resuene contigo.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
          {areas.map((area, i) => (
            <motion.div
              key={area}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ delay: i * 0.08, duration: 0.4 }}
              className="group border border-white/10 rounded-2xl p-6 md:p-8 text-center transition-all duration-300 hover:border-[var(--color-ted-red)] hover:bg-white/[0.03] cursor-default"
            >
              <p className="text-lg md:text-xl font-bold text-white/80 group-hover:text-white transition-colors">
                {area}
              </p>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}
