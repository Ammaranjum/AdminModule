import React from "react";
import {
  Users,
  DollarSign,
  Package,
  AlertTriangle,
  Clock,
  ArrowUpCircle,
} from "lucide-react";
import StatCard from "../common/StatCard";
import { DashboardStats } from "../../types";

interface DashboardCardsProps {
  stats: DashboardStats;
  isLoading: boolean;
}

const DashboardCards: React.FC<DashboardCardsProps> = ({
  stats,
  isLoading,
}) => {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {[...Array(6)].map((_, index) => (
          <div
            key={index}
            className="bg-white rounded-lg shadow-md p-6 animate-pulse"
          >
            <div className="flex items-center justify-between">
              <div>
                <div className="h-3 bg-gray-200 rounded w-24 mb-2"></div>
                <div className="h-6 bg-gray-200 rounded w-16 mb-2"></div>
                <div className="h-2 bg-gray-200 rounded w-32"></div>
              </div>
              <div className="w-12 h-12 bg-gray-200 rounded-full"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
      <StatCard
        title="Total Users"
        value={stats.totalUsers}
        icon={<Users size={24} className="text-blue-600" />}
        trend={{ value: 12, isPositive: true }}
      />

      <StatCard
        title="Total Sales"
        value={`$${stats.totalSales.toFixed(2)}`}
        icon={<DollarSign size={24} className="text-green-600" />}
        trend={{ value: 8.5, isPositive: true }}
      />

      <StatCard
        title="Total Orders"
        value={stats.totalOrders}
        icon={<Package size={24} className="text-indigo-600" />}
        trend={{ value: 5, isPositive: true }}
      />

      <StatCard
        title="Failed Orders"
        value={stats.failedOrders}
        icon={<AlertTriangle size={24} className="text-red-600" />}
        trend={{ value: 2, isPositive: false }}
      />

      <StatCard
        title="Pending Orders"
        value={stats.pendingOrders}
        icon={<Clock size={24} className="text-yellow-600" />}
      />

      <StatCard
        title="Total Top-ups"
        value={`$${stats.totalTopUps.toFixed(2)}`}
        icon={<ArrowUpCircle size={24} className="text-cyan-600" />}
        trend={{ value: 15, isPositive: true }}
      />
    </div>
  );
};

export default DashboardCards;
