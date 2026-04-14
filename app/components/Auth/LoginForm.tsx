'use client';
import { useState } from "react";
import Image from "next/image";
import logoWhite from "../../media/logo-white.png";

interface LoginFormProps {
  onLoginSuccess: () => void;
}

export default function LoginForm({ onLoginSuccess }: LoginFormProps) {
  const [email, setEmail] = useState("");
  const [pass, setPass] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    // Validación contra variables de entorno
    if (
      email === process.env.NEXT_PUBLIC_EMAIL && 
      pass === process.env.NEXT_PUBLIC_PASSWORD
    ) {
      // Guardamos en sessionStorage para que no pida login al refrescar (opcional)
      sessionStorage.setItem("isAdmin", "true");
      onLoginSuccess();
    } else {
      setError("Credenciales incorrectas");
    }
  };

  return (
    <main className="min-h-dvh flex flex-col items-center justify-center bg-gray-900 px-6 font-sans">
      <div className="w-full max-w-sm bg-black border border-gray-800 p-8 rounded-2xl shadow-2xl relative overflow-hidden">
        <div className="absolute top-0 left-0 w-full h-1 bg-[var(--color-ted-red)]"></div>
        <div className="flex justify-center mb-8 mt-2">
          <Image src={logoWhite} alt="TEDx" className="h-10 w-auto" />
        </div>
        <p className="text-gray-400 text-xs font-mono text-center mb-8 uppercase tracking-widest">Portal de Revisores</p>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Correo Electrónico</label>
            <input 
              type="email" 
              value={email} 
              onChange={e => setEmail(e.target.value)} 
              className="w-full bg-[#111] border border-gray-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[var(--color-ted-red)] transition-colors placeholder-gray-700 font-mono text-sm"
              placeholder="admin@tedx.com"
              required
            />
          </div>
          <div>
            <label className="block text-xs font-bold text-gray-500 mb-1.5 uppercase tracking-wider">Contraseña</label>
            <input 
              type="password" 
              value={pass} 
              onChange={e => setPass(e.target.value)} 
              className="w-full bg-[#111] border border-gray-800 rounded-lg px-4 py-3 text-white focus:outline-none focus:border-[var(--color-ted-red)] transition-colors placeholder-gray-700 font-mono text-sm"
              placeholder="••••••••"
              required
            />
          </div>
          {error && <p className="text-[var(--color-ted-red)] text-sm font-semibold pt-1">{error}</p>}
          <button type="submit" className="w-full bg-[var(--color-ted-red)] hover:bg-[#c00020] text-white font-bold py-3.5 rounded-lg transition-colors mt-6 uppercase tracking-wider text-sm shadow-lg">
            Ingresar al Panel
          </button>
        </form>
      </div>
      <p className="mt-8 text-xs text-gray-600 font-mono">Evento Independiente operado bajo licencia TED</p>
    </main>
  );
}