"use client";

import { useEffect, useMemo, useState } from "react";

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
    <div className="relative h-24 w-full select-none overflow-hidden" aria-label="Carrusel automático de patrocinadores" role="region">
      {normalizedFiles.map((file, fileIndex) => (
        <div
          key={file}
          className={`absolute inset-0 flex items-center justify-center transition-all duration-700 ease-in-out ${fileIndex === index ? "opacity-100 scale-100" : "opacity-0 scale-[0.985]"}`}
          aria-hidden={fileIndex !== index}
        >
          <img src={`/patrocinadores/${file}`} alt={file} className="max-h-20 w-auto object-contain" draggable={false} />
        </div>
      ))}
    </div>
  );
}
