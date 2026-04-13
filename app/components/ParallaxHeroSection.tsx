"use client";

import { useRef } from "react";
import Image from "next/image";
import { motion, useScroll, useSpring, useTransform } from "framer-motion";

export default function ParallaxHeroSection() {
  const sectionRef = useRef<HTMLElement | null>(null);
  const { scrollYProgress } = useScroll({
    target: sectionRef,
    offset: ["start end", "end start"],
  });

  const textTarget = useTransform(scrollYProgress, [0, 1], [-40, 50]);
  const svgTarget = useTransform(scrollYProgress, [0, 1], [-64, 78]);

  const textY = useSpring(textTarget, { stiffness: 64, damping: 18, mass: 0.5 });
  const svgY = useSpring(svgTarget, { stiffness: 62, damping: 17, mass: 0.54 });

  return (
    <section id="compartimos-section" ref={sectionRef} aria-labelledby="inicio-hero-heading" className="relative isolate overflow-hidden bg-[#171314]">
      <div
        className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_72%_48%,rgba(255,255,255,0.05),transparent_28%),radial-gradient(circle_at_84%_48%,rgba(255,255,255,0.08),transparent_16%),linear-gradient(180deg,rgba(255,255,255,0.015),transparent_22%)]"
        aria-hidden="true"
      />
      <div className="mx-auto grid min-h-[60vh] w-full max-w-[1450px] items-center gap-6 px-6 py-10 text-center md:grid-cols-[1.02fr_0.98fr] md:px-10 md:py-14 md:text-left lg:min-h-[70vh] lg:gap-10">
        <motion.div className="float-medium-slower relative z-10 order-1 mx-auto md:max-w-[740px] md:justify-self-start md:pl-0 lg:pl-2 xl:pl-8" style={{ y: textY, willChange: "transform" }}>
          <h2
            id="inicio-hero-heading"
            className="mx-auto max-w-none text-[clamp(3.6rem,13vw,5.9rem)] font-black leading-[0.84] tracking-[-0.08em] text-white md:mx-0"
          >
            <span className="block whitespace-nowrap">Compartimos</span>
            <span className="block whitespace-nowrap text-[var(--color-ted-red)]">ideas</span>
            <span className="block whitespace-nowrap">que vale la</span>
            <span className="block whitespace-nowrap">pena difundir</span>
          </h2>
        </motion.div>

        <motion.div className="float-medium relative order-2 hidden min-h-[420px] items-start justify-end md:flex" style={{ y: svgY, willChange: "transform" }}>
          <div className="relative h-[360px] w-full max-w-[560px] lg:h-[430px] lg:max-w-[640px]" aria-hidden="true">
            <Image
              src="https://cdn.prod.website-files.com/63e118320fe0876684cc169c/63f68ee0b3a8d69d6e767791_Vector.svg"
              alt=""
              fill
              sizes="(max-width: 1024px) 50vw, 640px"
              className="object-contain opacity-95"
              loading="eager"
            />
          </div>
        </motion.div>
      </div>
    </section>
  );
}
