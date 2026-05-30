"use client";
import { motion } from "framer-motion";

export default function VoluntariosStatement() {
  return (
    <section className="px-6 py-28 md:py-36 bg-[#171314]">
      <div className="max-w-4xl mx-auto text-center">
        <motion.p
          initial={{ opacity: 0, y: 24 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          transition={{ duration: 0.6 }}
          className="text-2xl md:text-4xl font-bold text-white/90 leading-relaxed"
        >
          Managua merece conversaciones que cambien perspectivas.
          <span className="text-[var(--color-ted-red)]"> Tú puedes ayudar a que suceda.</span>
        </motion.p>
      </div>
    </section>
  );
}
