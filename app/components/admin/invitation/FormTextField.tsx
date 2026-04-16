"use client";

interface FormTextFieldProps {
  name: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  required?: boolean;
  className?: string;
}

export default function FormTextField({
  name,
  label,
  placeholder,
  value,
  onChange,
  required = false,
  className = "",
}: FormTextFieldProps) {
  return (
    <div className={className}>
      <label className="block text-[10px] font-bold uppercase tracking-[0.15em] text-gray-500 mb-2">
        {label}
      </label>
      <input
        name={name}
        value={value}
        required={required}
        type={name === "correo" ? "email" : "text"}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-[#121212] text-white p-4 border border-gray-700/60 rounded-xl focus:border-[var(--color-ted-red)] outline-none transition-all placeholder:text-gray-500 shadow-inner"
        placeholder={placeholder}
      />
    </div>
  );
}
