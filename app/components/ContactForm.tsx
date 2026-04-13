'use client';

import React, { useState } from 'react';

export default function SponsorshipForm() {
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [message, setMessage] = useState('');

    const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        setStatus('loading');

        const formData = new FormData(e.currentTarget);
        const data = {
            companyName: formData.get('companyName'),
            contactName: formData.get('contactName'),
            email: formData.get('email'),
            message: formData.get('message'),
        };

        try {
            const response = await fetch('/api/send', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(data),
            });

            if (response.ok) {
                setStatus('success');
                setMessage('¡Gracias! Hemos recibido tu postulación. Revisaremos los detalles pronto.');
                (e.target as HTMLFormElement).reset();
            } else {
                throw new Error('Error al enviar');
            }
        } catch (err) {
            setStatus('error');
            setMessage('Hubo un problema al enviar el formulario. Por favor, intenta de nuevo.');
        }
    };

    return (
        <div className="max-w-lg mx-auto p-8 bg-white shadow-xl rounded-2xl border border-gray-100">
            <h2 className="text-3xl font-bold text-gray-900 mb-2">Postulación de Patrocinio</h2>
            <p className="text-gray-600 mb-8">Únete a la comunidad <span className="text-[#eb0028] font-bold font-serif italic">TEDx</span> y ayúdanos a difundir ideas.</p>

            <form onSubmit={handleSubmit} className="space-y-5">
                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Nombre de la Empresa</label>
                    <input 
                        name="companyName" 
                        type="text" 
                        required 
                        className="w-full px-4 py-3 text-black rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#eb0028] focus:border-transparent outline-none transition"
                        placeholder="Ej. Innova Corp"
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Persona de Contacto</label>
                    <input 
                        name="contactName" 
                        type="text" 
                        required 
                        className="w-full px-4 py-3 text-black rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#eb0028] focus:border-transparent outline-none transition"
                        placeholder="Nombre completo"
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Correo Corporativo</label>
                    <input 
                        name="email" 
                        type="email" 
                        required 
                        className="w-full px-4 text-black py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#eb0028] focus:border-transparent outline-none transition"
                        placeholder="email@empresa.com"
                    />
                </div>

                <div>
                    <label className="block text-sm font-semibold text-gray-700 mb-1">Propuesta / Mensaje</label>
                    <textarea 
                        name="message" 
                        rows={4} 
                        required 
                        className="w-full text-black px-4 py-3 rounded-lg border border-gray-300 focus:ring-2 focus:ring-[#eb0028] focus:border-transparent outline-none transition"
                        placeholder="Cuéntanos cómo te gustaría colaborar..."
                    />
                </div>

                <button 
                    type="submit" 
                    disabled={status === 'loading'}
                    className={`w-full py-4 text-white font-bold rounded-lg transition shadow-lg ${
                        status === 'loading' ? 'bg-gray-400 cursor-not-allowed' : 'bg-[#eb0028] hover:bg-[#c40022]'
                    }`}
                >
                    {status === 'loading' ? 'Enviando...' : 'Enviar Postulación'}
                </button>

                {/* Feedback Messages */}
                {status === 'success' && (
                    <p className="mt-4 p-3 bg-green-50 text-green-700 rounded-md border border-green-200 text-center font-medium">
                        {message}
                    </p>
                )}
                {status === 'error' && (
                    <p className="mt-4 p-3 bg-red-50 text-red-700 rounded-md border border-red-200 text-center font-medium">
                        {message}
                    </p>
                )}
            </form>
        </div>
    );
}
