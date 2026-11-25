import React from "react";
import { ChevronDown, LucideIcon } from "lucide-react";
import { cn } from "@/core/utils/utils";

export interface FilterOption {
  value: string;
  label: string;
}

export interface FilterDropdownProps {
  value: string;
  onChange: (value: string) => void;
  options: (string | FilterOption)[];
  labelPrefix?: string;
  icon?: LucideIcon;
  placeholder?: string;
  className?: string;
}

export function FilterDropdown({
  value,
  onChange,
  options,
  labelPrefix,
  icon: Icon,
  placeholder = "Pilih",
  className,
}: FilterDropdownProps) {
  const normalizedOptions: FilterOption[] = options.map((opt) =>
    typeof opt === "string" ? { value: opt, label: opt } : opt
  );

  return (
    <div className={cn("relative inline-flex items-center", className)}>
      <div className="flex items-center gap-1.5 h-9 bg-white border border-[#E2E8F0] hover:border-[#CBD5E1] rounded-xl px-3 text-xs font-semibold text-[#1E293B] shadow-xs transition-colors pointer-events-none">
        {Icon && <Icon className="w-3.5 h-3.5 text-[#64748B] shrink-0" />}
        {labelPrefix && (
          <span className="text-[#64748B] text-xs font-medium shrink-0">
            {labelPrefix}:
          </span>
        )}
        <span className="truncate max-w-[140px] sm:max-w-[180px]">
          {normalizedOptions.find((o) => o.value === value)?.label || placeholder}
        </span>
        <ChevronDown className="w-3.5 h-3.5 text-[#64748B] shrink-0 ml-1" />
      </div>

      <select
        value={value}
        onChange={(e) => onChange(e.target.value)}
        aria-label={labelPrefix || placeholder}
        className="absolute inset-0 w-full h-full opacity-0 cursor-pointer text-xs"
      >
        {normalizedOptions.map((opt) => (
          <option key={opt.value} value={opt.value}>
            {opt.label}
          </option>
        ))}
      </select>
    </div>
  );
}
