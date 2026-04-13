import Link from "next/link";

export default function SponsorInquiryModal() {
  return (
    <Link
      href="/patrocinios/solicitud"
      className="inline-flex items-center justify-center rounded-full border border-[var(--color-ted-red)] bg-[var(--color-ted-red)] px-6 py-3 text-sm font-semibold text-white transition hover:bg-[#c90022] hover:shadow-[0_0_0_4px_rgba(235,0,40,0.14)]"
    >
      Contáctanos
    </Link>
  );
}
