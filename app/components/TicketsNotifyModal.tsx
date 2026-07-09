"use client";

import Link from "next/link";

export default function TicketsNotifyModal() {
  return (
    <Link
      href="/registro"
      className="inline-flex min-h-[3.5rem] items-center justify-center rounded-md bg-[rgb(230,0,30)] px-10 py-3 text-lg font-bold text-white transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(230,0,30,0.3)] hover:shadow-[0_0_25px_rgba(230,0,30,0.45)] text-center"
    >
      Pre-registro de Entradas
    </Link>
  );
}

