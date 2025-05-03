import React, { ReactNode } from 'react';

interface StatCardProps {
  title: string;
  value: string | number;
  icon: ReactNode;
  trend?: {
    value: number;
    isPositive: boolean;
  };
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({ 
  title, 
  value, 
  icon, 
  trend,
  className = ''
}) => {
  return (
    <div className={`bg-white rounded-lg shadow-md overflow-hidden hover:shadow-lg transition-shadow duration-300 ${className}`}>
      <div className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <p className="text-sm font-medium text-gray-500">{title}</p>
            <p className="mt-1 text-2xl font-semibold text-gray-900">{value}</p>
            
            {trend && (
              <div className="mt-1 flex items-center">
                <span className={`text-sm ${trend.isPositive ? 'text-green-600' : 'text-red-600'}`}>
                  {trend.isPositive ? '+' : ''}{trend.value}%
                </span>
                <span className="text-sm text-gray-500 ml-1">from last month</span>
              </div>
            )}
          </div>
          
          <div className="p-3 bg-gray-100 rounded-full">
            {icon}
          </div>
        </div>
      </div>
    </div>
  );
};

export default StatCard;