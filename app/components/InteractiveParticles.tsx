"use client";

import { useEffect, useRef } from "react";

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  ox: number;
  oy: number;
  size: number;
  alpha: number;
};

type InteractiveParticlesProps = {
  className?: string;
};

export default function InteractiveParticles({ className }: InteractiveParticlesProps) {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const context = canvas.getContext("2d");
    if (!context) return;

    const state = {
      width: 0,
      height: 0,
      dpr: Math.min(window.devicePixelRatio || 1, 2),
      pointer: { x: -9999, y: -9999, active: false },
      particles: [] as Particle[],
      frame: 0,
    };

    const createParticles = () => {
      const particleCount = Math.round((state.width * state.height) / 22000);
      const count = Math.max(48, Math.min(96, particleCount));

      state.particles = Array.from({ length: count }, (_, index) => {
        const x = state.width * (0.18 + ((index * 37) % 64) / 100);
        const y = state.height * (0.14 + ((index * 53) % 72) / 100);
        return {
          x,
          y,
          ox: x,
          oy: y,
          vx: (Math.random() - 0.5) * 0.45,
          vy: (Math.random() - 0.5) * 0.45,
          size: 1 + Math.random() * 1.8,
          alpha: 0.28 + Math.random() * 0.5,
        };
      });
    };

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      state.width = rect.width;
      state.height = rect.height;
      canvas.width = Math.round(rect.width * state.dpr);
      canvas.height = Math.round(rect.height * state.dpr);
      context.setTransform(state.dpr, 0, 0, state.dpr, 0, 0);
      createParticles();
    };

    const draw = () => {
      context.clearRect(0, 0, state.width, state.height);
      context.fillStyle = "rgba(255,255,255,0.015)";
      context.fillRect(0, 0, state.width, state.height);

      const pointer = state.pointer;

      for (const particle of state.particles) {
        const dx = pointer.x - particle.x;
        const dy = pointer.y - particle.y;
        const distance = Math.hypot(dx, dy) || 1;
        const influence = pointer.active ? Math.max(0, 1 - distance / 170) : 0;
        const force = influence * 1.6;

        if (pointer.active && distance < 180) {
          particle.vx -= (dx / distance) * force * 0.28;
          particle.vy -= (dy / distance) * force * 0.28;
        }

        particle.vx += (particle.ox - particle.x) * 0.0009;
        particle.vy += (particle.oy - particle.y) * 0.0009;

        particle.vx *= 0.985;
        particle.vy *= 0.985;
        particle.x += particle.vx;
        particle.y += particle.vy;

        context.beginPath();
        context.fillStyle = `rgba(255,255,255,${particle.alpha})`;
        context.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        context.fill();
      }

      for (let index = 0; index < state.particles.length; index += 1) {
        const first = state.particles[index];
        for (let next = index + 1; next < state.particles.length; next += 1) {
          const second = state.particles[next];
          const dx = first.x - second.x;
          const dy = first.y - second.y;
          const distance = Math.hypot(dx, dy);
          if (distance > 110) continue;

          const opacity = (1 - distance / 110) * 0.22;
          context.beginPath();
          context.strokeStyle = `rgba(255,255,255,${opacity})`;
          context.lineWidth = 1;
          context.moveTo(first.x, first.y);
          context.lineTo(second.x, second.y);
          context.stroke();
        }
      }

      state.frame = window.requestAnimationFrame(draw);
    };

    const handlePointerMove = (event: PointerEvent) => {
      const rect = canvas.getBoundingClientRect();
      state.pointer.x = event.clientX - rect.left;
      state.pointer.y = event.clientY - rect.top;
      state.pointer.active = true;
    };

    const handlePointerLeave = () => {
      state.pointer.active = false;
      state.pointer.x = -9999;
      state.pointer.y = -9999;
    };

    const observer = new ResizeObserver(() => resize());
    observer.observe(canvas);

    canvas.addEventListener("pointermove", handlePointerMove);
    canvas.addEventListener("pointerleave", handlePointerLeave);

    resize();
    draw();

    return () => {
      observer.disconnect();
      canvas.removeEventListener("pointermove", handlePointerMove);
      canvas.removeEventListener("pointerleave", handlePointerLeave);
      window.cancelAnimationFrame(state.frame);
    };
  }, []);

  return <canvas ref={canvasRef} className={className} aria-hidden="true" />;
}