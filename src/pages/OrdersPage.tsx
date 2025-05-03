import React, { useState, useEffect } from 'react';
import { getOrders, updateOrderStatus } from '../services/supabase';
import { Order, OrderStatus } from '../types';
import DataTable from '../components/common/DataTable';
import Card from '../components/common/Card';
import { RefreshCw, AlertTriangle, CheckCircle, Clock, Eye } from 'lucide-react';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import { toast } from 'react-hot-toast';

const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);

  useEffect(() => {
    const fetchOrders = async () => {
      try {
        const data = await getOrders();
        setOrders(data);
      } catch (error) {
        console.error('Error fetching orders:', error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, []);

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedOrder(null);
  };

  const handleRefund = async (orderId: string) => {
    if (!confirm('Are you sure you want to refund this order?')) return;
    
    try {
      setIsProcessing(true);
      const updatedOrder = await updateOrderStatus(orderId, 'refunded');
      
      setOrders(orders.map(order => 
        order.id === updatedOrder.id ? { ...order, status: updatedOrder.status } : order
      ));
      
      toast.success('Order refunded successfully');
      closeModal();
    } catch (error) {
      console.error('Error refunding order:', error);
      toast.error('Failed to refund order');
    } finally {
      setIsProcessing(false);
    }
  };

  const getStatusBadge = (status: OrderStatus) => {
    const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
    
    switch (status) {
      case 'approved':
        return (
          <span className={`${baseClasses} bg-green-100 text-green-800`}>
            <CheckCircle size={14} className="mr-1" />
            Approved
          </span>
        );
      case 'pending':
        return (
          <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>
            <Clock size={14} className="mr-1" />
            Pending
          </span>
        );
      case 'failed':
        return (
          <span className={`${baseClasses} bg-red-100 text-red-800`}>
            <AlertTriangle size={14} className="mr-1" />
            Failed
          </span>
        );
      case 'refunded':
        return (
          <span className={`${baseClasses} bg-blue-100 text-blue-800`}>
            <RefreshCw size={14} className="mr-1" />
            Refunded
          </span>
        );
      default:
        return <span className={`${baseClasses} bg-gray-100 text-gray-800`}>{status}</span>;
    }
  };

  const columns = [
    { header: 'Internal ID', accessor: 'internalOrderId' },
    { header: 'Supplier ID', accessor: 'supplierOrderId' },
    {
      header: 'User',
      accessor: (order: Order) => order.user?.name || 'Unknown'
    },
    {
      header: 'Game/Server',
      accessor: (order: Order) => `${order.game?.name || 'Unknown'} / ${order.server?.name || 'Unknown'}`
    },
    {
      header: 'Amount',
      accessor: (order: Order) => (
        <span className="font-medium">${order.amount.toFixed(2)}</span>
      )
    },
    {
      header: 'Status',
      accessor: (order: Order) => getStatusBadge(order.status)
    },
    {
      header: 'Date',
      accessor: (order: Order) => new Date(order.createdAt).toLocaleDateString()
    },
    {
      header: 'Actions',
      accessor: (order: Order) => (
        <Button
          variant="info"
          size="sm"
          icon={<Eye size={16} />}
          onClick={() => handleViewOrder(order)}
        >
          View
        </Button>
      )
    }
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <p className="text-sm text-gray-500">
          Total orders: {orders.length}
        </p>
      </div>

      <Card title="All Orders">
        <DataTable
          columns={columns}
          data={orders}
          keyField="id"
          isLoading={isLoading}
          emptyMessage="No orders found"
        />
      </Card>

      {selectedOrder && (
        <Modal
          isOpen={isModalOpen}
          onClose={closeModal}
          title={`Order Details: ${selectedOrder.internalOrderId}`}
          size="lg"
        >
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <h3 className="text-sm font-medium text-gray-500">Order Information</h3>
                <div className="mt-2 bg-gray-50 p-4 rounded-md">
                  <dl className="divide-y divide-gray-200">
                    <div className="py-2 flex justify-between">
                      <dt className="text-sm font-medium text-gray-500">Internal Order ID</dt>
                      <dd className="text-sm font-medium text-gray-900">{selectedOrder.internalOrderId}</dd>
                    </div>
                    <div className="py-2 flex justify-between">
                      <dt className="text-sm font-medium text-gray-500">Supplier Order ID</dt>
                      <dd className="text-sm font-medium text-gray-900">{selectedOrder.supplierOrderId}</dd>
                    </div>
                    <div className="py-2 flex justify-between">
                      <dt className="text-sm font-medium text-gray-500">Amount</dt>
                      <dd className="text-sm font-medium text-green-600">${selectedOrder.amount.toFixed(2)}</dd>
                    </div>
                    <div className="py-2 flex justify-between">
                      <dt className="text-sm font-medium text-gray-500">Status</dt>
                      <dd>{getStatusBadge(selectedOrder.status)}</dd>
                    </div>
                    <div className="py-2 flex justify-between">
                      <dt className="text-sm font-medium text-gray-500">Created</dt>
                      <dd className="text-sm font-medium text-gray-900">
                        {new Date(selectedOrder.createdAt).toLocaleString()}
                      </dd>
                    </div>
                  </dl>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500">User & Game Information</h3>
                <div className="mt-2 bg-gray-50 p-4 rounded-md">
                  <dl className="divide-y divide-gray-200">
                    <div className="py-2 flex justify-between">
                      <dt className="text-sm font-medium text-gray-500">User</dt>
                      <dd className="text-sm font-medium text-gray-900">{selectedOrder.user?.name || 'Unknown'}</dd>
                    </div>
                    <div className="py-2 flex justify-between">
                      <dt className="text-sm font-medium text-gray-500">Customer ID</dt>
                      <dd className="text-sm font-medium text-gray-900">{selectedOrder.user?.customerId || 'Unknown'}</dd>
                    </div>
                    <div className="py-2 flex justify-between">
                      <dt className="text-sm font-medium text-gray-500">Game</dt>
                      <dd className="text-sm font-medium text-gray-900">{selectedOrder.game?.name || 'Unknown'}</dd>
                    </div>
                    <div className="py-2 flex justify-between">
                      <dt className="text-sm font-medium text-gray-500">Server</dt>
                      <dd className="text-sm font-medium text-gray-900">{selectedOrder.server?.name || 'Unknown'}</dd>
                    </div>
                    <div className="py-2 flex justify-between">
                      <dt className="text-sm font-medium text-gray-500">Region</dt>
                      <dd className="text-sm font-medium text-gray-900">{selectedOrder.server?.region || 'Unknown'}</dd>
                    </div>
                  </dl>
                </div>
              </div>
            </div>

            <div>
              <h3 className="text-sm font-medium text-gray-500">Actions</h3>
              <div className="mt-2 flex space-x-3">
                {selectedOrder.status !== 'refunded' && (
                  <Button
                    variant="danger"
                    icon={<RefreshCw size={18} />}
                    onClick={() => handleRefund(selectedOrder.id)}
                    isLoading={isProcessing}
                  >
                    Refund Order
                  </Button>
                )}
                <Button variant="secondary" onClick={closeModal}>Close</Button>
              </div>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default OrdersPage;