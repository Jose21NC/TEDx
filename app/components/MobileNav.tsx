"use client";
import { useRef, useState } from "react";
import Link from "next/link";

type MobileNavProps = {
  hideOnDesktop?: boolean;
  containerClassName?: string;
  buttonClassName?: string;
};

export default function MobileNav({
  hideOnDesktop = true,
  containerClassName = "",
  buttonClassName = "",
}: MobileNavProps) {
  const [open, setOpen] = useState(false);
  const buttonRef = useRef<HTMLButtonElement | null>(null);

  const containerBase = `${hideOnDesktop ? "md:hidden" : ""} relative ${containerClassName}`.trim();
  const buttonBase =
    "inline-flex min-h-11 min-w-11 items-center justify-center rounded-md border-0 bg-transparent p-2 text-current shadow-none transition hover:bg-black/5 active:scale-95";

  function closeMenu() {
    buttonRef.current?.focus();
    setOpen(false);
  }

  return (
    <div className={containerBase}>
      <button
        ref={buttonRef}
        aria-label="Abrir menú"
        aria-expanded={open}
        aria-controls="mobile-navigation"
        onClick={() => setOpen((s) => !s)}
        className={`${buttonBase} ${buttonClassName}`.trim()}
      >
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
      </button>

      <nav
        id="mobile-navigation"
        className={`absolute right-0 top-full z-30 mt-2 w-64 overflow-hidden rounded-lg border border-black/10 bg-white shadow-lg transform transition-all duration-200 ease-out origin-top ${open ? 'opacity-100 translate-y-0 scale-y-100' : 'opacity-0 -translate-y-2 scale-y-75 pointer-events-none'}`}
        aria-hidden={!open}
      >
        <ul className="flex flex-col p-2">
          <li>
            <Link href="/" onClick={closeMenu} className="block rounded-md px-3 py-2.5 text-sm font-medium text-[#222] transition hover:bg-black/5">Inicio</Link>
          </li>
          <li>
            <Link href="/acerca" onClick={closeMenu} className="block rounded-md px-3 py-2.5 text-sm font-medium text-[#222] transition hover:bg-black/5">Acerca de</Link>
          </li>
          <li>
            <Link href="/patrocinios" onClick={closeMenu} className="block rounded-md px-3 py-2.5 text-sm font-medium text-[#222] transition hover:bg-black/5">Patrocinadores</Link>
          </li>
        </ul>
      </nav>
    </div>
  );
}
