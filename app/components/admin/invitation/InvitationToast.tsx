"use client";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";

type ToastType = "success" | "error";

interface InvitationToastProps {
  show: boolean;
  message: string;
  type: ToastType;
}

export default function InvitationToast({ show, message, type }: InvitationToastProps) {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || !show) {
    return null;
  }

  return createPortal(
    <div className="fixed top-8 left-1/2 z-[100] w-[90%] max-w-[520px] -translate-x-1/2 px-4 pointer-events-none">
      <div className={`relative overflow-hidden rounded-2xl border-2 p-5 shadow-[0_20px_50px_rgba(0,0,0,0.45)] transition-all duration-500 ${
        type === "success"
          ? "border-green-500 bg-[#051105]"
          : "border-[var(--color-ted-red)] bg-[#110505]"
      }`} aria-live="polite">
        <div className={`flex items-center gap-4 text-white`}>
          <div className={`flex h-12 w-12 items-center justify-center rounded-full text-2xl shadow-lg ${
            type === "success"
              ? "bg-green-500 shadow-green-500/20"
              : "bg-[var(--color-ted-red)] shadow-red-500/20"
          }`}>
            {type === "success" ? "✓" : "⚠️"}
          </div>

          <div className="flex-1">
            <h4 className={`text-sm font-black uppercase tracking-[0.2em] mb-1 ${
              type === "success" ? "text-green-400" : "text-[var(--color-ted-red)]"
            }`}>
              {type === "success" ? "Confirmado" : "Atención Requerida"}
            </h4>
            <p className="text-sm font-medium text-gray-200 leading-tight">{message}</p>
          </div>
        </div>

        <div className={`absolute bottom-0 left-0 h-1 ${
          type === "success" ? "bg-green-500" : "bg-[var(--color-ted-red)]"
        }`} style={{ animation: "toast-progress 5s linear forwards" }} />
      </div>

      <style>{`@keyframes toast-progress { from { width: 100%; } to { width: 0; } }`}</style>
    </div>,
    document.body,
  );
}
