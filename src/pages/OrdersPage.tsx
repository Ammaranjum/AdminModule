import React, { useState, useEffect } from 'react';
import { getOrders, updateOrderStatus } from '../services/supabase';
import Card from '../components/common/Card';
import { RefreshCw, AlertTriangle, CheckCircle, Clock, Eye } from 'lucide-react';
import Modal from '../components/common/Modal';
import Button from '../components/common/Button';
import { toast } from 'react-hot-toast';

const OrdersPage: React.FC = () => {
  const [orders, setOrders] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [isLoading, setIsLoading] = useState(true);
  const [selectedOrder, setSelectedOrder] = useState<any | null>(null);
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

  const handleViewOrder = (order: any) => {
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

  const getStatusBadge = (status: string) => {
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

  // Filtered orders based on search input
  const filteredOrders = orders.filter(order => {
    if (!searchQuery.trim()) return true;
    const term = searchQuery.toLowerCase();
    return (
      order.order_id?.toLowerCase().includes(term) ||
      order.customer?.name?.toLowerCase().includes(term) ||
      order.game_name?.toLowerCase().includes(term) ||
      order.status?.toLowerCase().includes(term)
    );
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
        <h1 className="text-2xl font-bold text-gray-900">Orders</h1>
        <p className="text-sm text-gray-500">
          Total orders: {filteredOrders.length}
        </p>
      </div>

      <Card title="All Orders">
        {/* Search bar */}
        <div className="mb-4">
          <input
            type="text"
            placeholder="Search orders..."
            value={searchQuery}
            onChange={e => setSearchQuery(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-md w-full focus:outline-none focus:ring-blue-500 focus:border-blue-500"
          />
        </div>
        <div className="divide-y divide-gray-200">
          {filteredOrders.length > 0 ? (
            filteredOrders.map((order: any, idx: number) => (
              <div key={order.order_id} className="py-4 flex flex-col md:flex-row md:justify-between md:items-center">
                <div className="flex-1 space-y-1">
                  <p className="text-sm text-gray-400">#{idx + 1}</p>
                  <p className="text-sm font-medium">Order {order.order_id}</p>
                  <p className="text-sm text-gray-500">Supplier ID: {order.supplier_order_id || '-'}</p>
                  <p className="text-sm text-gray-500">Customer: {order.customer?.name || '-'}</p>
                  <p className="text-sm text-gray-500">Game: {order.game_name}</p>
                  {order.game_server_id && <p className="text-sm text-gray-500">Server: {order.game_server_id}</p>}
                </div>
                <div className="mt-2 md:mt-0 flex items-center space-x-4">
                  <span className="text-sm font-medium">${order.price?.toFixed(2) || '0.00'}</span>
                  {getStatusBadge(order.status)}
                  <Button
                    variant="info"
                    size="sm"
                    icon={<Eye size={16} />}
                    onClick={() => handleViewOrder(order)}
                  >
                    View
                  </Button>
                  {order.status !== 'refunded' && (
                    <Button
                      variant="danger"
                      size="sm"
                      icon={<RefreshCw size={18} />}
                      onClick={() => handleRefund(order.order_id)}
                      isLoading={isProcessing}
                    >
                      Refund
                    </Button>
                  )}
                </div>
              </div>
            ))
          ) : (
            <p className="text-sm text-gray-500 p-4">No orders found.</p>
          )}
        </div>
      </Card>

      {selectedOrder && (
        <Modal
          isOpen={isModalOpen}
          onClose={closeModal}
          title={`Order Details: ${selectedOrder.order_id}`}
          size="lg"
        >
          <div className="space-y-6">
            <div className="bg-white p-6 rounded-md shadow">
              <h3 className="text-lg font-semibold mb-4">Order Summary</h3>
              <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2">
                <dt className="font-medium text-gray-600">Order ID</dt>
                <dd className="text-gray-900">{selectedOrder.order_id}</dd>

                <dt className="font-medium text-gray-600">Game User ID</dt>
                <dd className="text-gray-900">{selectedOrder.game_user_id}</dd>

                <dt className="font-medium text-gray-600">Game Server ID</dt>
                <dd className="text-gray-900">{selectedOrder.game_server_id || '-'}</dd>

                <dt className="font-medium text-gray-600">Game Name</dt>
                <dd className="text-gray-900">{selectedOrder.game_name}</dd>

                <dt className="font-medium text-gray-600">User Name</dt>
                <dd className="text-gray-900">{selectedOrder.user?.name || '-'}</dd>

                <dt className="font-medium text-gray-600">Payment Method</dt>
                <dd className="text-gray-900">{selectedOrder.payment_method}</dd>

                <dt className="font-medium text-gray-600">Order Status</dt>
                <dd className="text-gray-900">{selectedOrder.status}</dd>

                <dt className="font-medium text-gray-600">Topped Up</dt>
                <dd className="text-gray-900">{selectedOrder.amount_topped_up}</dd>

                <dt className="font-medium text-gray-600">Price</dt>
                <dd className="text-gray-900">${selectedOrder.price?.toFixed(2)}</dd>

                <dt className="font-medium text-gray-600">Before Balance</dt>
                <dd className="text-gray-900">${selectedOrder.before_balance?.toFixed(2)}</dd>

                <dt className="font-medium text-gray-600">After Balance</dt>
                <dd className="text-gray-900">${selectedOrder.after_balance?.toFixed(2)}</dd>

                <dt className="font-medium text-gray-600">Created At</dt>
                <dd className="text-gray-900">{new Date(selectedOrder.created_at).toLocaleString()}</dd>

                <dt className="font-medium text-gray-600">Updated At</dt>
                <dd className="text-gray-900">{new Date(selectedOrder.updated_at).toLocaleString()}</dd>

                <dt className="font-medium text-gray-600">Transaction Number</dt>
                <dd className="text-gray-900">{selectedOrder.transaction_number || '-'}</dd>

                <dt className="font-medium text-gray-600">Invalid Code</dt>
                <dd className="text-gray-900">{selectedOrder.invalid_code || '-'}</dd>

                <dt className="font-medium text-gray-600">Region</dt>
                <dd className="text-gray-900">{/* TODO: fetch server region */ '-'}</dd>

                <dt className="font-medium text-gray-600">Supplier Response</dt>
                <dd>
                  <pre className="whitespace-pre-wrap text-xs bg-gray-100 p-2 rounded">
                    {JSON.stringify(selectedOrder.supplier_response, null, 2)}
                  </pre>
                </dd>
              </dl>
            </div>

            <div className="flex justify-end">
              <Button variant="secondary" onClick={closeModal}>Close</Button>
            </div>
          </div>
        </Modal>
      )}
    </div>
  );
};

export default OrdersPage;