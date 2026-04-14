export default function Footer() {
    return (
        <footer className="border-t border-gray-800 bg-black px-6 py-8 text-sm text-gray-300 relative z-10 mt-auto">
            <div className="mx-auto flex w-full max-w-7xl flex-col gap-4 md:flex-row md:items-center md:justify-between">
            <div className="hidden md:block">
                <p className="font-mono text-xs text-gray-500 mb-1">ESTA ES UNA VISTA PRIVADA (ADMINISTRADOR)</p>
                <p>Este evento TEDx independiente se opera bajo licencia de TED.</p>
                <p className="mt-2 text-xs text-gray-500">
                Más información sobre el programa oficial TEDx:
                <a href="https://www.ted.com/tedx/program" target="_blank" rel="noreferrer" className="ml-1 font-semibold text-[var(--color-ted-red)] underline underline-offset-4">
                    ted.com/tedx/program
                </a>
                </p>
            </div>

            <div className="md:hidden text-center">
                <p className="font-mono text-[10px] text-gray-500 mb-2">VISTA DE ADMINISTRADOR</p>
                <p className="text-xs">
                Este evento TEDx independiente se opera bajo licencia de TED.
                </p>
            </div>

            <div className="flex items-center gap-3 justify-center md:justify-end">
                <a
                href="https://instagram.com/tedxavenidabolivar"
                target="_blank"
                rel="noreferrer"
                aria-label="Instagram"
                className="rounded-full border border-gray-800 bg-gray-900 p-2 text-gray-400 transition hover:border-[var(--color-ted-red)] hover:text-white"
                >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="3" width="18" height="18" rx="5" />
                    <circle cx="12" cy="12" r="4" />
                    <circle cx="17.5" cy="6.5" r="1" fill="currentColor" stroke="none" />
                </svg>
                </a>
                <a
                href="mailto:contacto@tedxavenidabolivar.com"
                aria-label="Correo"
                className="rounded-full border border-gray-800 bg-gray-900 p-2 text-gray-400 transition hover:border-[var(--color-ted-red)] hover:text-white"
                >
                <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-5 w-5" fill="none" stroke="currentColor" strokeWidth="2">
                    <rect x="3" y="5" width="18" height="14" rx="2" />
                    <path d="M3 7l9 6 9-6" />
                </svg>
                </a>
            </div>
            </div>
        </footer>
    )
}