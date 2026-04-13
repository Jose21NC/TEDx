"use client";

import { useEffect, useMemo, useState } from "react";

type Dot = {
  top: number;
  size: number;
  drift: number;
  speed: number;
  delay: number;
};

function makeDots(seed: number, count: number): Dot[] {
  const dots: Dot[] = [];
  let value = seed;
  for (let index = 0; index < count; index += 1) {
    value = (value * 9301 + 49297) % 233280;
    const rand = value / 233280;
    dots.push({
      top: 6 + rand * 88,
      size: 2 + rand * 3.8,
      drift: 8 + rand * 24,
      speed: 0.15 + rand * 0.45,
      delay: rand * Math.PI * 2,
    });
  }
  return dots;
}

export default function SideScrollParticles() {
  const [scrollY, setScrollY] = useState(0);

  const leftDots = useMemo(() => makeDots(17, 30), []);
  const rightDots = useMemo(() => makeDots(37, 30), []);

  useEffect(() => {
    const onScroll = () => setScrollY(window.scrollY || 0);
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    return () => window.removeEventListener("scroll", onScroll);
  }, []);

  return (
    <section aria-hidden="true" className="relative h-16 overflow-hidden md:h-20">
      <div className="pointer-events-none absolute inset-y-0 left-0 w-[16%] md:w-[11%]">
        {leftDots.map((dot, index) => {
          const y = Math.sin(scrollY * dot.speed * 0.01 + dot.delay) * dot.drift;
          return (
            <span
              key={`left-${index}`}
              className="absolute"
              style={{
                top: `${dot.top}%`,
                left: `${6 + (index % 5) * 16}%`,
                transform: `translate3d(0, ${y}px, 0)`,
              }}
            >
              <span
                className="block animate-soft-breathe rounded-full bg-white/40"
                style={{
                  width: `${dot.size}px`,
                  height: `${dot.size}px`,
                  opacity: 0.28 + (index % 4) * 0.14,
                  boxShadow: "0 0 18px rgba(255,255,255,0.2)",
                  animationDuration: `${5.5 + (index % 6) * 0.8}s`,
                  animationDelay: `${(index % 7) * 0.35}s`,
                }}
              />
            </span>
          );
        })}
      </div>

      <div className="pointer-events-none absolute inset-y-0 right-0 w-[16%] md:w-[11%]">
        {rightDots.map((dot, index) => {
          const y = Math.cos(scrollY * dot.speed * 0.01 + dot.delay) * dot.drift;
          return (
            <span
              key={`right-${index}`}
              className="absolute"
              style={{
                top: `${dot.top}%`,
                right: `${6 + (index % 5) * 16}%`,
                transform: `translate3d(0, ${y}px, 0)`,
              }}
            >
              <span
                className="block animate-soft-breathe rounded-full bg-white/40"
                style={{
                  width: `${dot.size}px`,
                  height: `${dot.size}px`,
                  opacity: 0.28 + (index % 4) * 0.14,
                  boxShadow: "0 0 18px rgba(255,255,255,0.2)",
                  animationDuration: `${5.8 + (index % 6) * 0.85}s`,
                  animationDelay: `${(index % 7) * 0.33}s`,
                }}
              />
            </span>
          );
        })}
      </div>

      <div className="absolute inset-x-0 top-1/2 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
    </section>
  );
}
