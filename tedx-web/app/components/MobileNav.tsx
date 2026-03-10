"use client";
import { useState } from "react";
import Link from "next/link";

export default function MobileNav() {
  const [open, setOpen] = useState(false);
  return (
    <div className="md:hidden relative">
      <button
        aria-label="Abrir menú"
        onClick={() => setOpen((s) => !s)}
        className="inline-flex items-center justify-center rounded-md border border-black/20 p-2 text-current bg-white/90 shadow-sm transition hover:bg-white"
      >
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <nav
        className={`absolute right-0 top-full z-30 mt-2 w-64 overflow-hidden rounded-lg border border-black/10 bg-white shadow-lg transform transition-all duration-200 ease-out origin-top ${open ? 'opacity-100 translate-y-0 scale-y-100' : 'opacity-0 -translate-y-2 scale-y-75 pointer-events-none'}`}
        aria-hidden={!open}
      >
        <ul className="flex flex-col p-2">
          <li>
            <Link href="/" onClick={() => setOpen(false)} className="block rounded-md px-3 py-2.5 text-sm font-medium text-[#222] transition hover:bg-black/5">Inicio</Link>
          </li>
          <li>
            <Link href="/acerca" onClick={() => setOpen(false)} className="block rounded-md px-3 py-2.5 text-sm font-medium text-[#222] transition hover:bg-black/5">Acerca de</Link>
          </li>
          <li>
            <Link href="/patrocinios" onClick={() => setOpen(false)} className="block rounded-md px-3 py-2.5 text-sm font-medium text-[#222] transition hover:bg-black/5">Patrocinadores</Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}
