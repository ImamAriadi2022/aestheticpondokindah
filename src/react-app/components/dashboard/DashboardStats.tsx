import { TrendingUp, TrendingDown, ArrowUpRight } from "lucide-react";

interface StatCardProps {
  title: string;
  value: string | number;
  subtitle?: string;
  trend?: "up" | "down" | "neutral";
  trendValue?: string;
  icon?: React.ElementType;
  variant?: "green" | "white";
}

function StatCard({ title, value, subtitle, trend, trendValue, icon: Icon, variant = "white" }: StatCardProps) {
  if (variant === "green") {
    return (
      <div className="bg-gradient-to-br from-[#c9a24a] to-[#a8843a] rounded-sm p-4 sm:p-5 text-white shadow-sm">
        <div className="flex items-start justify-between mb-2">
          <span className="text-sm font-medium text-white/90">{title}</span>
          <div className="w-7 h-7 sm:w-8 sm:h-8 bg-white/20 rounded-sm flex items-center justify-center">
            <ArrowUpRight className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
          </div>
        </div>
        <div className="text-xl sm:text-2xl font-bold mb-1">{value}</div>
        {subtitle && <p className="text-xs sm:text-sm text-white/80">{subtitle}</p>}
        {trend && trendValue && (
          <div className="flex items-center gap-1 mt-1.5">
            {trend === "up" ? (
              <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
            ) : (
              <TrendingDown className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-white" />
            )}
            <span className="text-xs sm:text-sm text-white/90">{trendValue}</span>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-white rounded-sm p-4 sm:p-5 shadow-sm border border-gray-100">
      <div className="flex items-start justify-between mb-2">
        <span className="text-sm font-medium text-gray-500">{title}</span>
        {Icon && (
          <div className="w-7 h-7 sm:w-8 sm:h-8 bg-gray-100 rounded-sm flex items-center justify-center">
            <Icon className="w-3.5 h-3.5 sm:w-4 sm:h-4 text-gray-600" />
          </div>
        )}
      </div>
      <div className="text-xl sm:text-2xl font-bold text-gray-900 mb-1">{value}</div>
      {subtitle && <p className="text-xs sm:text-sm text-gray-500">{subtitle}</p>}
      {trend && trendValue && (
        <div
          className={`flex items-center gap-1 mt-1.5 ${
            trend === "up" ? "text-[#a8843a]" : "text-red-500"
          }`}
        >
          {trend === "up" ? (
            <TrendingUp className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          ) : (
            <TrendingDown className="w-3.5 h-3.5 sm:w-4 sm:h-4" />
          )}
          <span className="text-xs sm:text-sm font-medium">{trendValue}</span>
        </div>
      )}
    </div>
  );
}

interface DashboardStatsProps {
  stats: StatCardProps[];
}

export default function DashboardStats({ stats }: DashboardStatsProps) {
  return (
    <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
      {stats.map((stat, index) => (
        <StatCard key={index} {...stat} />
      ))}
    </div>
  );
}
