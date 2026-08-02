import React, { useState, useRef } from "react";
import { RefreshCw } from "lucide-react";

interface PullToRefreshProps {
  onRefresh: () => Promise<void> | void;
  children: React.ReactNode;
}

export const PullToRefresh: React.FC<PullToRefreshProps> = ({ onRefresh, children }) => {
  const [pullDistance, setPullDistance] = useState<number>(0);
  const [isRefreshing, setIsRefreshing] = useState<boolean>(false);
  const touchStartY = useRef<number>(0);
  const containerRef = useRef<HTMLDivElement>(null);

  const PULL_THRESHOLD = 70;

  const handleTouchStart = (e: React.TouchEvent) => {
    const scrollTop = containerRef.current?.scrollTop || window.scrollY || 0;
    if (scrollTop === 0) {
      touchStartY.current = e.touches[0].clientY;
    } else {
      touchStartY.current = 0;
    }
  };

  const handleTouchMove = (e: React.TouchEvent) => {
    if (touchStartY.current === 0 || isRefreshing) return;
    const currentY = e.touches[0].clientY;
    const distance = currentY - touchStartY.current;

    if (distance > 0) {
      setPullDistance(Math.min(distance * 0.4, 90));
    }
  };

  const handleTouchEnd = async () => {
    if (pullDistance >= PULL_THRESHOLD && !isRefreshing) {
      setIsRefreshing(true);
      setPullDistance(50);
      try {
        await onRefresh();
      } finally {
        setIsRefreshing(false);
        setPullDistance(0);
      }
    } else {
      setPullDistance(0);
    }
    touchStartY.current = 0;
  };

  return (
    <div
      ref={containerRef}
      onTouchStart={handleTouchStart}
      onTouchMove={handleTouchMove}
      onTouchEnd={handleTouchEnd}
      className="relative min-h-full"
    >
      {/* Pull Indicator Header */}
      <div
        className="w-full flex items-center justify-center transition-all duration-200 overflow-hidden"
        style={{ height: `${pullDistance}px` }}
      >
        <div className="flex items-center gap-2 text-xs font-semibold text-[#A37E28]">
          <RefreshCw className={`w-4 h-4 text-[#C59E3F] ${isRefreshing ? "animate-spin" : ""}`} />
          <span>{isRefreshing ? "Memperbarui Data..." : pullDistance >= PULL_THRESHOLD ? "Lepaskan untuk Memperbarui" : "Tarik untuk Memperbarui"}</span>
        </div>
      </div>

      {children}
    </div>
  );
};
