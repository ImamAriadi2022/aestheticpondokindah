import * as React from "react";
import { Check, ChevronDown, X } from "lucide-react";
import { Button } from "@/shared/ui/button";
import { Popover, PopoverContent, PopoverTrigger } from "@/shared/ui/popover";
import { Badge } from "@/shared/ui/badge";

export type MultiSelectOption = {
  value: string;
  label: string;
};

type MultiSelectProps = {
  options: MultiSelectOption[];
  value: string[];
  onChange: (next: string[]) => void;
  placeholder?: string;
  disabled?: boolean;
  searchable?: boolean;
  searchPlaceholder?: string;
  className?: string;
  maxSelectedBadge?: number;
};

export function MultiSelect({
  options,
  value,
  onChange,
  placeholder = "Pilih...",
  disabled,
  searchable = true,
  searchPlaceholder = "Cari...",
  className,
  maxSelectedBadge = 2,
}: MultiSelectProps) {
  const [open, setOpen] = React.useState(false);
  const [query, setQuery] = React.useState("");

  const selectedSet = React.useMemo(() => new Set(value), [value]);

  const filtered = React.useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!searchable || !q) return options;
    return options.filter((o) => o.label.toLowerCase().includes(q));
  }, [options, query, searchable]);

  const toggle = (v: string) => {
    if (selectedSet.has(v)) {
      onChange(value.filter((x) => x !== v));
      return;
    }
    onChange([...value, v]);
  };

  const remove = (v: string) => {
    if (!selectedSet.has(v)) return;
    onChange(value.filter((x) => x !== v));
  };

  const clearAll = () => {
    onChange([]);
  };

  const selectedOptions = React.useMemo(() => {
    if (value.length === 0) return [];
    const map = new Map(options.map((o) => [o.value, o] as const));
    return value.map((v) => map.get(v)).filter(Boolean) as MultiSelectOption[];
  }, [options, value]);

  const hiddenCount = Math.max(0, selectedOptions.length - maxSelectedBadge);
  const visibleSelected = selectedOptions.slice(0, maxSelectedBadge);

  return (
    <Popover open={open} onOpenChange={(v) => !disabled && setOpen(v)}>
      <PopoverTrigger asChild>
        <Button
          type="button"
          variant="outline"
          disabled={disabled}
          className={`w-full h-10 rounded-lg border-gray-200 text-xs font-medium px-3 ${className ?? ""}`}
        >
          <div className="flex-1 flex items-center gap-2 min-w-0 overflow-hidden">
            {selectedOptions.length === 0 ? (
              <span className="text-gray-500 truncate">{placeholder}</span>
            ) : (
              <div className="flex items-center gap-1.5 flex-nowrap">
                {visibleSelected.map((o) => (
                  <Badge
                    key={o.value}
                    variant="secondary"
                    className="text-[11px] font-semibold px-2 py-0.5 rounded-md flex-shrink-0"
                    title={o.label}
                    onClick={(e) => {
                      e.preventDefault();
                      e.stopPropagation();
                    }}
                  >
                    <span className="truncate max-w-[100px]">{o.label}</span>
                    <button
                      type="button"
                      className="ml-1 rounded-sm hover:bg-black/10 flex-shrink-0"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                        remove(o.value);
                      }}
                      aria-label={`Hapus ${o.label}`}
                    >
                      <X className="w-3 h-3" />
                    </button>
                  </Badge>
                ))}
                {hiddenCount > 0 && (
                  <Badge variant="secondary" className="text-[11px] font-semibold px-2 py-0.5 rounded-md flex-shrink-0">
                    +{hiddenCount}
                  </Badge>
                )}
              </div>
            )}
          </div>
          <div className="flex items-center gap-1.5 ml-2 flex-shrink-0">
            {selectedOptions.length > 0 && (
              <button
                type="button"
                className="text-gray-400 hover:text-gray-700 p-0.5 rounded-sm"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  clearAll();
                }}
                aria-label="Hapus semua pilihan"
              >
                <X className="w-4 h-4" />
              </button>
            )}
            <ChevronDown className="w-4 h-4 text-gray-500" />
          </div>
        </Button>
      </PopoverTrigger>

      <PopoverContent className="w-[--radix-popover-trigger-width] p-2" align="start">
        {searchable && (
          <div className="p-1">
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder={searchPlaceholder}
              className="w-full h-9 px-3 rounded-md border border-gray-200 text-xs font-medium focus:outline-none focus:ring-1 focus:ring-[#c9a24a]"
            />
          </div>
        )}

        <div className="max-h-64 overflow-auto">
          {filtered.map((o) => {
            const selected = selectedSet.has(o.value);
            return (
              <button
                key={o.value}
                type="button"
                onClick={() => toggle(o.value)}
                className={`w-full flex items-center justify-between gap-3 px-3 py-2 rounded-md text-left text-xs font-semibold transition-colors ${
                  selected ? "bg-[#c9a24a]/10" : "hover:bg-gray-50"
                }`}
              >
                <span className="text-gray-700">{o.label}</span>
                {selected && <Check className="w-4 h-4 text-[#a8843a]" />}
              </button>
            );
          })}

          {filtered.length === 0 && (
            <div className="px-3 py-6 text-center text-xs text-gray-500">Tidak ada hasil</div>
          )}
        </div>
      </PopoverContent>
    </Popover>
  );
}
