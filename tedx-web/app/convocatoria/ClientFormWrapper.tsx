"use client";
import { useEffect, useState } from "react";
import ConvocatoriaForm from "./Form";

export default function ClientFormWrapper() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return <ConvocatoriaForm />;
}
