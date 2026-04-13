"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";

type SponsorsMobileCarouselProps = {
  files: string[];
};

export default function SponsorsMobileCarousel({ files }: SponsorsMobileCarouselProps) {
  const normalizedFiles = useMemo(() => files.filter(Boolean), [files]);
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (normalizedFiles.length <= 1) return;

    const timer = setInterval(() => {
      setIndex((prev) => (prev + 1) % normalizedFiles.length);
    }, 3000);

    return () => clearInterval(timer);
  }, [normalizedFiles.length]);

  if (normalizedFiles.length === 0) {
    return <p className="text-center text-gray-400">No hay imágenes en patrocinadores.</p>;
  }

  return (
    <div className="mx-auto flex h-20 w-full max-w-[220px] select-none items-center justify-center overflow-hidden" aria-label="Carrusel automático de patrocinadores" role="region">
      <div className="relative h-16 w-[180px] sm:h-20 sm:w-[220px]">
        <Image
          key={normalizedFiles[index]}
          src={`/patrocinadores/${normalizedFiles[index]}`}
          alt={normalizedFiles[index]}
          fill
          sizes="(max-width: 640px) 180px, 220px"
          className="object-contain"
          draggable={false}
          priority={index === 0}
        />
      </div>
    </div>
  );
}
