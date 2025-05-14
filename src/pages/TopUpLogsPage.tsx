import React, { useEffect, useState } from 'react';
import { getTopUps } from '../services/supabase';
import { TopUpData } from '../types';
import Card from '../components/common/Card';
import DataTable from '../components/common/DataTable';
import { Column } from '../components/common/DataTable';


const TopUpLogsPage: React.FC = () => {
  const [topUps, setTopUps] = useState<TopUpData[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    console.log('Current topUps state:', topUps);
  }, [topUps]);

  useEffect(() => {
    const fetchTopUps = async () => {
      try {
        const data = await getTopUps();
        console.log('Fetched top-up logs from DB:', data);
        setTopUps(data);
      } catch (err) {
        setError('Failed to fetch top-up logs');
        console.error('Error fetching top-up logs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchTopUps();
  }, []);

  console.log('Top-up in final state:', topUps);

  const columns = [
    {
      header: 'Index',
      accessor: (topUp: TopUpData, index: number) => topUps.indexOf(topUp) + 1,
    },
    {
      header: 'User Name',
      accessor: (topUp: TopUpData) => topUp.userName
    },
    {
      header: 'Amount',
      accessor: (topUp: TopUpData) => `$${topUp.amount.toFixed(2)}`
    },
    {
      header: 'User Balance',
      accessor: (topUp: TopUpData) => `$${topUp.userBalance?.toFixed(2) || '0.00'}`
    },
    {
      header: 'Admin Balance',
      accessor: (topUp: TopUpData) => `$${topUp.adminNewRecharge}`          
    },
    {
      header: 'Remarks',
      accessor: (topUp: TopUpData) => topUp.remarks
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
        <DataTable<TopUpData>
          columns={columns as Column<TopUpData>[]}
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