"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { motion, useMotionValue, useMotionValueEvent, useSpring, useTransform } from "framer-motion";
import logoBlack from "../media/logo-black.png";
import MobileNav from "./MobileNav";

export default function ScrollAwareHeader() {
  const rawProgress = useMotionValue(0);
  const hideProgress = useSpring(rawProgress, { stiffness: 66, damping: 24, mass: 0.7 });
  const [headerInteractive, setHeaderInteractive] = useState(true);
  const [fabInteractive, setFabInteractive] = useState(false);
  const headerInteractiveRef = useRef(true);
  const fabInteractiveRef = useRef(false);

  const headerY = useTransform(hideProgress, [0, 1], ["0%", "-112%"]);
  const headerOpacity = useTransform(hideProgress, [0, 0.75, 1], [1, 0.36, 0]);
  const fabOpacity = useTransform(hideProgress, [0, 0.18, 1], [0, 0, 1]);
  const fabY = useTransform(hideProgress, [0, 1], [20, 0]);

  useMotionValueEvent(hideProgress, "change", (value) => {
    const nextHeaderInteractive = value < 0.96;
    if (nextHeaderInteractive !== headerInteractiveRef.current) {
      headerInteractiveRef.current = nextHeaderInteractive;
      setHeaderInteractive(nextHeaderInteractive);
    }

    const nextFabInteractive = value > 0.14;
    if (nextFabInteractive !== fabInteractiveRef.current) {
      fabInteractiveRef.current = nextFabInteractive;
      setFabInteractive(nextFabInteractive);
    }
  });

  useEffect(() => {
    const trigger = document.getElementById("compartimos-section");

    if (!trigger) {
      rawProgress.set(0);
      return;
    }

    let raf = 0;

    const onScroll = () => {
      if (raf) return;
      raf = window.requestAnimationFrame(() => {
        const rect = trigger.getBoundingClientRect();
        const start = window.innerHeight * 0.72;
        const end = window.innerHeight * 0.24;
        const raw = (start - rect.top) / (start - end);
        const clamped = Math.max(0, Math.min(1, raw));
        const eased = clamped * clamped * (3 - 2 * clamped);
        rawProgress.set(eased);
        raf = 0;
      });
    };

    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);

    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (raf) window.cancelAnimationFrame(raf);
    };
  }, [rawProgress]);

  return (
    <>
      <motion.header
        className="fixed inset-x-0 top-0 z-50 border-b border-white/10 bg-white text-black shadow-sm transform-gpu transition-[box-shadow] duration-500"
        style={{
          y: headerY,
          opacity: headerOpacity,
          pointerEvents: headerInteractive ? "auto" : "none",
        }}
      >
        <nav
          className="relative mx-auto flex w-full max-w-[88rem] items-center justify-between px-4 py-1.5 sm:px-6 sm:py-1"
          aria-label="Navegacion principal"
        >
          <Link href="#inicio" className="flex items-center">
            <Image src={logoBlack} alt="TEDx Avenida Bolivar" className="h-14 w-auto sm:h-[4.5rem]" priority unoptimized />
          </Link>

          <ul className="hidden items-center gap-6 text-base font-medium md:flex">
            <li>
              <Link className="transition hover:text-[var(--color-ted-red)]" href="#inicio">
                Inicio
              </Link>
            </li>
            <li>
              <Link className="transition hover:text-[var(--color-ted-red)]" href="/acerca">
                Acerca de
              </Link>
            </li>
            <li>
              <Link className="transition hover:text-[rgb(230,0,30)]" href="/patrocinios">
                Patrocinadores
              </Link>
            </li>
          </ul>

          <MobileNav />
        </nav>
      </motion.header>

      {fabInteractive ? (
        <motion.div
          className="fixed right-4 top-4 z-[70] transform-gpu"
          style={{
            y: fabY,
            opacity: fabOpacity,
            pointerEvents: "auto",
          }}
        >
          <MobileNav
            hideOnDesktop={false}
            containerClassName=""
            buttonClassName="rounded-full bg-transparent text-white hover:bg-white/10"
          />
        </motion.div>
      ) : null}
    </>
  );
}
