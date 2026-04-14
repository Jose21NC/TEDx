"use client";
import Link from "next/link";
import Image from "next/image";
import { usePathname } from "next/navigation";
import logoBlack from "../../media/logo-black.png";
import MobileNav from "../MobileNav";

const Pages = [
    { name: "Inicio", href: "/" },
    { name: "Panel Admin", href: "/admin" },
    { name: "Invitaciones", href: "/admin/invitations" }
];

export default function Header({ logout }: { logout: () => void }) {
    const pathname = usePathname();

    const isActive = (href: string) => {
        if (!pathname) return false;

        const cleanPathname = pathname === "/" ? "/" : pathname.replace(/\/$/, "");
        const cleanHref = href === "/" ? "/" : href.replace(/\/$/, "");

        if (cleanHref === "/") return cleanPathname === "/";

        return cleanPathname === cleanHref;
    };

    return (
        <header className="border-b border-black/5 bg-black text-[#222] sticky top-0 z-20 shadow-md">
            <nav className="relative mx-auto flex w-full max-w-[88rem] items-center justify-between px-6 py-0.5">
                <Link href="/" className="flex items-center">
                    <Image src={logoBlack} alt="TEDx Avenida Bolivar" className="h-[4.5rem] w-auto brightness-0 invert" priority />
                </Link>

                <ul className="hidden items-center gap-6 text-base font-medium md:flex text-white">
                    {Pages.map((page) => {
                        const active = isActive(page.href);
                        return (
                            <li key={page.href}>
                                <Link 
                                    href={page.href}
                                    className={`transition-all duration-200 ${
                                        active 
                                        ? 'text-[var(--color-ted-red)] font-bold' 
                                        : 'hover:text-[var(--color-ted-red)] text-gray-300'
                                    }`}
                                >
                                    {page.name}
                                </Link>
                            </li>
                        );
                    })}
                    <li>
                        <button 
                            onClick={logout} 
                            className="text-[10px] bg-red-600 hover:bg-red-700 transition-colors px-3 py-1 rounded font-bold uppercase tracking-tighter"
                        >
                            Cerrar Sesión
                        </button>
                    </li>
                </ul>
                <MobileNav />
            </nav>
        </header>
    );
}