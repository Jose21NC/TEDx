"use client";

import { useEffect, useState } from "react";
import VoluntariadoForm from "./Form";

export default function VoluntariadoFormWrapper() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return <VoluntariadoForm />;
}
