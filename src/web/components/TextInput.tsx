"use client";

interface Props {
  value: string;
  onChange: (v: string) => void;
  placeholder?: string;
  label?: string;
  singleLine?: boolean;
  monospace?: boolean;
}

export function TextInput({ value, onChange, placeholder, label, singleLine, monospace }: Props) {
  const baseClass =
    `w-full bg-gray-900 border border-gray-700 rounded-lg px-4 py-3 text-gray-100 placeholder-gray-600 focus:outline-none focus:border-red-500 transition-colors ${monospace ? "font-mono text-sm" : ""}`;

  return (
    <div>
      {label && <label className="block text-sm font-medium text-gray-400 mb-2">{label}</label>}
      {singleLine ? (
        <input
          type="text"
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          className={baseClass}
        />
      ) : (
        <textarea
          value={value}
          onChange={e => onChange(e.target.value)}
          placeholder={placeholder}
          rows={8}
          className={`${baseClass} resize-y`}
        />
      )}
    </div>
  );
}
