import React, { useEffect, useState } from 'react';
import { getTopUps } from '../services/supabase';
import { TopUpData } from '../types';
import Card from '../components/common/Card';
import DataTable from '../components/common/DataTable';

const TopUpLogsPage: React.FC = () => {
  const [topUps, setTopUps] = useState<TopUpData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchTopUps = async () => {
      try {
        const data = await getTopUps();
        setTopUps(data);
      } catch (err) {
        setError('Failed to fetch top-up logs');
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchTopUps();
  }, []);

  const columns = [
    {
      header: 'Admin',
      accessor: (topUp: TopUpData) => topUp.adminName
    },
    {
      header: 'User ID',
      accessor: (topUp: TopUpData) => topUp.userId
    },
    {
      header: 'Amount',
      accessor: (topUp: TopUpData) => `$${topUp.amount.toFixed(2)}`
    },
    {
      header: 'Admin Balance',
      accessor: (topUp: TopUpData) => (
        <div className="text-sm">
          <div>Old: ${topUp.adminOldRecharge.toFixed(2)}</div>
          <div>New: ${topUp.adminNewRecharge.toFixed(2)}</div>
        </div>
      )
    },
    {
      header: 'Remarks',
      accessor: (topUp: TopUpData) => topUp.remark
    },
    {
      header: 'Date',
      accessor: (topUp: TopUpData) => new Date(topUp.createdAt).toLocaleString()
    }
  ];

  if (error) {
    return (
      <div className="p-4 bg-red-50 text-red-700 rounded-md">
        {error}
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold text-gray-900">Top-Up Logs</h1>
      </div>

      <Card title="Top-Up Logs">
        <DataTable
          columns={columns}
          data={topUps}
          keyField="id"
          isLoading={loading}
          emptyMessage="No top-up logs found"
        />
      </Card>
    </div>
  );
};

export default TopUpLogsPage; 