import React, { useState, useEffect } from 'react';
import { getDashboardStats } from '../services/supabase';
import { DashboardStats } from '../types';
import DashboardCards from '../components/dashboard/DashboardCards';
import RecentActivityList from '../components/dashboard/RecentActivityList';
import OrdersChart from '../components/charts/OrdersChart';
import SalesChart from '../components/charts/SalesChart';

const DashboardPage: React.FC = () => {
  const [stats, setStats] = useState<DashboardStats>({
    totalUsers: 0,
    totalOrders: 0,
    totalSales: 0,
    failedOrders: 0,
    pendingOrders: 0,
    totalTopUps: 0,
    recentActivity: []
  });
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const data = await getDashboardStats();
        setStats(data);
      } catch (error) {
        console.error('Error fetching dashboard stats:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchStats();
  }, []);

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-sm text-gray-500">
          Last updated: {new Date().toLocaleString()}
        </p>
      </div>

      <DashboardCards stats={stats} isLoading={isLoading} />
      
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <OrdersChart />
        <SalesChart />
      </div>
      
      <RecentActivityList activities={stats.recentActivity} isLoading={isLoading} />
    </div>
  );
};

export default DashboardPage;