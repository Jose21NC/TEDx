"use client";

import { useEffect, useState } from "react";
import SponsorInquiryForm from "./Form";

export default function SponsorInquiryFormWrapper() {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted) return null;

  return <SponsorInquiryForm />;
}