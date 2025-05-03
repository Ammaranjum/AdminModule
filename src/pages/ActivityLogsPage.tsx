import React, { useState, useEffect } from 'react';
import { getActivityLogs } from '../services/supabase';
import { ActivityLog, ActivityType } from '../types';
import Card from '../components/common/Card';
import DataTable from '../components/common/DataTable';
import { formatDistanceToNow } from 'date-fns';
import { ArrowUpCircle, RefreshCw, Shield, LogIn } from 'lucide-react';

const ActivityLogsPage: React.FC = () => {
  const [logs, setLogs] = useState<ActivityLog[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const data = await getActivityLogs();
        setLogs(data);
      } catch (error) {
        console.error('Error fetching activity logs:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchLogs();
  }, []);

  const getActivityTypeIcon = (type: ActivityType) => {
    switch (type) {
      case 'top-up':
        return <ArrowUpCircle size={16} className="text-green-500" />;
      case 'refund':
        return <RefreshCw size={16} className="text-red-500" />;
      case 'order-status-change':
        return <Shield size={16} className="text-blue-500" />;
      case 'login':
        return <LogIn size={16} className="text-purple-500" />;
      default:
        return <Shield size={16} className="text-gray-500" />;
    }
  };

  const getActivityTypeLabel = (type: ActivityType) => {
    switch (type) {
      case 'top-up':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            Top-up
          </span>
        );
      case 'refund':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            Refund
          </span>
        );
      case 'order-status-change':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            Order Status Change
          </span>
        );
      case 'login':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            Login
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {type}
          </span>
        );
    }
  };

  const columns = [
    {
      header: 'Activity Type',
      accessor: (log: ActivityLog) => (
        <div className="flex items-center">
          <span className="mr-2">{getActivityTypeIcon(log.activityType)}</span>
          {getActivityTypeLabel(log.activityType)}
        </div>
      )
    },
    {
      header: 'Admin',
      accessor: (log: ActivityLog) => (
        <span className="font-medium">{log.adminName}</span>
      )
    },
    { header: 'Description', accessor: 'description' },
    {
      header: 'Time',
      accessor: (log: ActivityLog) => (
        <span title={new Date(log.createdAt).toLocaleString()}>
          {formatDistanceToNow(new Date(log.createdAt), { addSuffix: true })}
        </span>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Activity Logs</h1>
        <p className="text-sm text-gray-500">
          Total logs: {logs.length}
        </p>
      </div>

      <Card title="All Activities">
        <DataTable
          columns={columns}
          data={logs}
          keyField="id"
          isLoading={isLoading}
          emptyMessage="No activity logs found"
        />
      </Card>
    </div>
  );
};

export default ActivityLogsPage;