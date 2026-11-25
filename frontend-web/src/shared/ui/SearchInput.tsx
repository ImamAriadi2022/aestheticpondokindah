import React from "react";
import { Search, X } from "lucide-react";
import { cn } from "@/core/utils/utils";

export interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onClear?: () => void;
  className?: string;
}

export function SearchInput({
  value,
  onChange,
  placeholder = "Cari data...",
  onClear,
  className,
}: SearchInputProps) {
  const handleClear = () => {
    onChange("");
    if (onClear) onClear();
  };

  return (
    <div className={cn("relative w-full sm:w-64 md:w-72 shrink-0", className)}>
      <Search className="w-4 h-4 text-[#94A3B8] absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none" />
      <input
        type="text"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full h-9 pl-9 pr-8 bg-white border border-[#E2E8F0] rounded-xl text-xs text-[#1E293B] placeholder:text-[#94A3B8] focus:outline-hidden focus:border-[#C9A24A] focus:ring-1 focus:ring-[#C9A24A]/20 transition-all shadow-xs"
      />
      {value && (
        <button
          type="button"
          onClick={handleClear}
          className="absolute right-2.5 top-1/2 -translate-y-1/2 text-[#94A3B8] hover:text-[#475569] p-0.5 rounded-full transition-colors cursor-pointer"
          title="Hapus pencarian"
        >
          <X className="w-3.5 h-3.5" />
        </button>
      )}
    </div>
  );
}
