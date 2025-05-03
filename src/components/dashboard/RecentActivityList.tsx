import React from 'react';
import { formatDistanceToNow } from 'date-fns';
import { ActivityLog } from '../../types';
import Card from '../common/Card';
import { ArrowUpCircle, RefreshCw, Shield, LogIn } from 'lucide-react';

interface RecentActivityListProps {
  activities: ActivityLog[];
  isLoading: boolean;
}

const RecentActivityList: React.FC<RecentActivityListProps> = ({ activities, isLoading }) => {
  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'top-up':
        return <ArrowUpCircle size={18} className="text-green-500" />;
      case 'refund':
        return <RefreshCw size={18} className="text-red-500" />;
      case 'order-status-change':
        return <Shield size={18} className="text-blue-500" />;
      case 'login':
        return <LogIn size={18} className="text-purple-500" />;
      default:
        return <Shield size={18} className="text-gray-500" />;
    }
  };

  const getActionColor = (type: string) => {
    switch (type) {
      case 'top-up':
        return 'text-green-600';
      case 'refund':
        return 'text-red-600';
      case 'order-status-change':
        return 'text-blue-600';
      case 'login':
        return 'text-purple-600';
      default:
        return 'text-gray-600';
    }
  };

  if (isLoading) {
    return (
      <Card title="Recent Activity">
        <div className="space-y-4">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="animate-pulse flex items-start">
              <div className="h-8 w-8 bg-gray-200 rounded-full"></div>
              <div className="ml-4 flex-1">
                <div className="h-4 bg-gray-200 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-200 rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    );
  }

  return (
    <Card title="Recent Activity">
      {activities.length === 0 ? (
        <p className="text-gray-500 text-center py-4">No recent activity</p>
      ) : (
        <div className="space-y-4">
          {activities.map((activity) => (
            <div key={activity.id} className="flex items-start">
              <div className="p-2 bg-gray-100 rounded-full">
                {getActivityIcon(activity.activityType)}
              </div>
              <div className="ml-4">
                <p className="text-sm text-gray-900">
                  <span className="font-medium">{activity.adminName}</span>{' '}
                  <span className={getActionColor(activity.activityType)}>
                    {activity.activityType.replace(/-/g, ' ')}
                  </span>
                </p>
                <p className="text-sm text-gray-500">{activity.description}</p>
                <p className="text-xs text-gray-400 mt-1">
                  {formatDistanceToNow(new Date(activity.createdAt), { addSuffix: true })}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
};

export default RecentActivityList;