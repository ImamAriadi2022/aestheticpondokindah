import type { ConsultationStatus } from "@/features/doctor/consultation/types/consultation";
import { STATUS_META } from "@/features/doctor/consultation/constants/consultation";
import { cn } from "@/core/utils/utils";

interface StatusBadgeProps {
  status: ConsultationStatus;
  className?: string;
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  const meta = STATUS_META[status] ?? STATUS_META.Menunggu;
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold",
        meta.badgeClassName,
        className
      )}
    >
      <span className={cn("w-1.5 h-1.5 rounded-full", meta.dotClassName)} />
      {meta.label}
    </span>
  );
}
