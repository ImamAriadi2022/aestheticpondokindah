import React from "react";
import { ArrowLeft, LucideIcon } from "lucide-react";
import { cn } from "@/core/utils/utils";

export interface PageHeaderProps {
  title: string;
  onBack?: () => void;
  backUrl?: string;
  actions?: React.ReactNode;
  className?: string;
}

export function PageHeader({
  title,
  onBack,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div
      className={cn(
        "flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-[#F1F5F9]",
        className
      )}
    >
      <div className="flex items-center gap-3">
        {onBack && (
          <button
            type="button"
            onClick={onBack}
            className="w-8 h-8 rounded-xl bg-[#F8FAFC] hover:bg-[#F1F5F9] border border-[#E2E8F0] flex items-center justify-center text-[#475569] hover:text-[#0F172A] transition-colors cursor-pointer shrink-0"
            title="Kembali"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>
        )}
        <h1 className="text-xl font-bold text-[#0F172A] tracking-tight">
          {title}
        </h1>
      </div>

      {actions && (
        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          {actions}
        </div>
      )}
    </div>
  );
}
