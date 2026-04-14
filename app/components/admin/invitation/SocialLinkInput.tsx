"use client";

interface SocialLinkInputProps {
  value: string;
  onChange: (value: string) => void;
  onAdd: () => void;
  showAddButton: boolean;
}

function getSocialLabel(url: string) {
  const lower = url.toLowerCase();
  if (lower.includes("linkedin")) return "🔗 LinkedIn";
  if (lower.includes("instagram")) return "📸 Instagram";
  if (lower.includes("tiktok")) return "📱 TikTok";
  if (lower.includes("twitter") || lower.includes("x.com")) return "🐦 X / Twitter";
  return "🌐 Web / Link";
}

export default function SocialLinkInput({ value, onChange, onAdd, showAddButton }: SocialLinkInputProps) {
  return (
    <div className="relative flex items-center group">
      <span className="absolute left-3 text-[8px] font-black text-gray-600 uppercase pointer-events-none group-focus-within:text-[var(--color-ted-red)] transition-colors">
        {getSocialLabel(value)}
      </span>
      <input
        value={value}
        onChange={(e) => onChange(e.target.value)}
        className="w-full bg-black text-white p-2.5 pl-20 border border-gray-800 rounded-lg focus:border-gray-600 outline-none text-[11px] transition-all font-mono"
        placeholder="https://..."
      />
      {showAddButton && (
        <button
          type="button"
          onClick={onAdd}
          className="ml-2 px-3 py-2 bg-[#1a1a1a] border border-gray-800 rounded hover:bg-[var(--color-ted-red)] transition-colors text-white"
        >
          +
        </button>
      )}
    </div>
  );
}
