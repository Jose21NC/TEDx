"use client";

import { useRef, useMemo, useState, useEffect } from "react";
import dynamic from "next/dynamic";
import { ref, uploadBytes, getDownloadURL } from "firebase/storage";
import { getClientStorage } from "../../lib/firebaseClient";

// Import Quill dynamically to avoid SSR issues
const ReactQuill = dynamic(
  async () => {
    const { default: RQ } = await import("react-quill-new");
    return RQ;
  },
  { ssr: false, loading: () => <div className="h-80 w-full animate-pulse bg-white/5 rounded-2xl border border-white/10" /> }
);

import "react-quill-new/dist/quill.snow.css";

interface RichTextEditorProps {
  value: string;
  onChange: (content: string) => void;
  placeholder?: string;
}

export default function RichTextEditor({ value, onChange, placeholder }: RichTextEditorProps) {
  const quillRef = useRef<any>(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [mounted, setMounted] = useState(false);
  
  // Performance optimization: Local state for immediate typing feedback
  const [internalValue, setInternalValue] = useState(value);

  useEffect(() => {
    setMounted(true);
  }, []);

  // Sync internal value ONLY if external value changes from parent (not during typing)
  useEffect(() => {
    if (value !== internalValue) {
      setInternalValue(value);
    }
  }, [value]);

  // Debounce the parent onChange call to avoid heavy re-renders
  useEffect(() => {
    const timer = setTimeout(() => {
      if (internalValue !== value) {
        onChange(internalValue);
      }
    }, 500);
    return () => clearTimeout(timer);
  }, [internalValue, onChange, value]);

  useEffect(() => {
    if (isFullscreen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [isFullscreen]);

  const imageHandler = () => {
    const input = document.createElement("input");
    input.setAttribute("type", "file");
    input.setAttribute("accept", "image/*");
    input.click();

    input.onchange = async () => {
      const file = input.files?.[0];
      if (file) {
        try {
          const storage = getClientStorage();
          const storageRef = ref(storage, `newsletter-assets/${Date.now()}_${file.name}`);
          const snapshot = await uploadBytes(storageRef, file);
          const url = await getDownloadURL(snapshot.ref);

          const quill = quillRef.current.getEditor();
          const range = quill.getSelection();
          quill.insertEmbed(range ? range.index : 0, "image", url);
        } catch (error) {
          console.error("Error uploading image to newsletter:", error);
          alert("No se pudo subir la imagen.");
        }
      }
    };
  };

  const modules = useMemo(() => ({
    toolbar: {
      container: [
        [{ header: [1, 2, false] }],
        ["bold", "italic", "underline", "strike"],
        [{ list: "ordered" }, { list: "bullet" }],
        [{ align: [] }],
        ["link", "image"],
        ["clean"],
      ],
      handlers: {
        image: imageHandler,
      },
    },
  }), []);

  const formats = [
    "header",
    "bold",
    "italic",
    "underline",
    "strike",
    "list",
    "align",
    "link",
    "image",
  ];

  if (!mounted) return <div className="h-80 w-full bg-white/5 rounded-2xl border border-white/10" />;

  return (
    <div className={`rich-text-editor-container bg-white text-black transition-all ${isFullscreen ? "fixed inset-0 !z-[999999] flex flex-col h-screen w-screen bg-white" : "relative rounded-2xl overflow-hidden border border-white/10"}`}>
      
      {/* Custom Fullscreen Button */}
      <button
        type="button"
        onClick={() => setIsFullscreen(!isFullscreen)}
        className={`absolute top-3 right-4 z-[10] rounded-lg p-2 transition-all flex items-center gap-2 text-[10px] font-bold uppercase tracking-wider ${isFullscreen ? "bg-[#e6001e] text-white hover:bg-[#c40019] shadow-xl" : "bg-black/5 text-gray-400 hover:bg-black/10 hover:text-black"}`}
        title={isFullscreen ? "Cerrar pantalla completa" : "Pantalla completa"}
      >
        <span>{isFullscreen ? "Cerrar" : "Agrandar"}</span>
        {isFullscreen ? (
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M6 18L18 6M6 6l12 12" /></svg>
        ) : (
          <svg className="h-3.5 w-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M4 8V4m0 0h4M4 4l5 5m11-1V4m0 0h-4m4 0l-5 5M4 16v4m0 0h4m-4 0l5-5m11 5v-4m0 4h-4m4 0l-5-5" /></svg>
        )}
      </button>

      <ReactQuill
        ref={quillRef}
        theme="snow"
        value={internalValue}
        onChange={setInternalValue}
        modules={modules}
        formats={formats}
        placeholder={placeholder}
        className={`${isFullscreen ? "flex-1 ql-fullscreen" : "h-96"}`}
      />
      <style jsx global>{`
        .ql-toolbar.ql-snow {
          border: none !important;
          background: #f8f8f8 !important;
          padding: 14px 18px !important;
          padding-right: 100px !important; 
          border-bottom: 1px solid #eeeeee !important;
        }
        .ql-container.ql-snow {
          border: none !important;
          font-family: 'Inter', system-ui, sans-serif !important;
          font-size: 16px !important;
        }
        .ql-editor {
          min-height: 200px !important;
          padding: 40px !important;
          max-width: 900px !important;
          margin: 0 auto !important;
          color: #111 !important;
        }
        .ql-editor.ql-blank::before {
          color: #999 !important;
          font-style: normal !important;
          left: 40px !important;
        }
        ${isFullscreen ? `
          .ql-container {
            background: #ffffff !important;
            flex: 1 !important;
            display: flex !important;
            flex-direction: column !important;
            overflow-y: auto !important;
            height: calc(100vh - 54px) !important;
          }
          .ql-editor {
            flex: 1 !important;
            background: white !important;
            min-height: 100% !important;
            box-shadow: 0 0 50px rgba(0,0,0,0.03) !important;
          }
        ` : ''}
      `}</style>
    </div>
  );
}
