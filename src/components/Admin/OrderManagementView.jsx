// ...existing code...
import React, { useEffect, useState } from 'react';
import { apiFetch } from '../../utils/api'; // ✅ replaced axios import

export default function OrderManagementView() {
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    fetchOrders();
  }, [filter]);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching orders...');

      // ✅ Health check using apiFetch
      try {
        const health = await apiFetch('/api/health');
        console.log('Backend health:', health);
        if (typeof health === 'string' && health.toLowerCase().includes('<!doctype')) {
          throw new Error('Health returned HTML (frontend) — backend base URL may be misconfigured.');
        }
      } catch (healthError) {
        console.error('Backend health check failed:', healthError);
        setError('Backend is not reachable. Check VITE_API_URL and that backend is deployed and accessible.');
        setLoading(false);
        return;
      }

      // ✅ Fetch orders
      let path = '/api/orders';
      if (filter !== 'all') path += `?status=${filter}`;
      const data = await apiFetch(path);
      console.log('Orders response:', data);

      if (!Array.isArray(data)) {
        console.error('Unexpected orders response (not an array):', data);
        setError('Unexpected response from backend when fetching orders.');
        setOrders([]);
        return;
      }

      setOrders(data);
    } catch (error) {
      console.error('Error fetching orders:', error);
      setError(`Failed to load orders: ${error.message}`);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      await apiFetch(`/api/orders/${id}/status`, { method: 'PATCH', body: { status } });
      setOrders((orders) => orders.map((o) => (o.id === id ? { ...o, status } : o)));
    } catch (error) {
      console.error('Error updating order status:', error);
      alert('Failed to update order status');
    }
  };

  if (loading)
    return <div style={{ textAlign: 'center', padding: '20px' }}>Loading orders...</div>;

  if (error)
    return (
      <div style={{ color: '#ff6b6b', textAlign: 'center', padding: '20px' }}>
        {error}
      </div>
    );

  return (
    <div>
      <h2 style={{ marginBottom: 16 }}>Order Management</h2>
      <div style={{ marginBottom: 16 }}>
        <select
          value={filter}
          onChange={(e) => setFilter(e.target.value)}
          style={{
            padding: '8px 12px',
            borderRadius: '4px',
            border: '1px solid #333',
            background: '#222',
            color: '#fff',
          }}
        >
          <option value="all">All Orders</option>
          <option value="pending">Pending</option>
          <option value="paid">Paid</option>
          <option value="processing">Processing</option>
          <option value="shipped">Shipped</option>
          <option value="completed">Completed</option>
          <option value="cancelled">Cancelled</option>
        </select>
      </div>

      {orders.length === 0 ? (
        <div style={{ textAlign: 'center', padding: '20px', color: '#888' }}>
          No orders found. Orders will appear here after customers place them.
        </div>
      ) : (
        <div style={{ overflowX: 'auto' }}>
          <table
            style={{
              width: '100%',
              borderCollapse: 'collapse',
              background: '#222',
              borderRadius: '6px',
            }}
          >
            <thead>
              <tr style={{ borderBottom: '1px solid #333' }}>
                <th style={{ padding: '12px', textAlign: 'left' }}>Order ID</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Customer</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Total</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Status</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Date</th>
                <th style={{ padding: '12px', textAlign: 'left' }}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {orders.map((order) => (
                <tr key={order.id} style={{ borderBottom: '1px solid #333' }}>
                  <td style={{ padding: '12px' }}>#{order.id}</td>
                  <td style={{ padding: '12px' }}>{order.customer_name}</td>
                  <td style={{ padding: '12px' }}>R{order.total}</td>
                  <td style={{ padding: '12px' }}>
                    <span
                      style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        fontSize: '12px',
                        background:
                          order.status === 'completed'
                            ? '#4CAF50'
                            : order.status === 'cancelled'
                            ? '#f44336'
                            : order.status === 'shipped'
                            ? '#2196F3'
                            : order.status === 'processing'
                            ? '#FF9800'
                            : order.status === 'paid'
                            ? '#4CAF50'
                            : '#666',
                      }}
                    >
                      {order.status}
                    </span>
                  </td>
                  <td style={{ padding: '12px' }}>
                    {new Date(order.created_at).toLocaleDateString()}
                  </td>
                  <td style={{ padding: '12px' }}>
                    <select
                      value={order.status}
                      onChange={(e) => updateStatus(order.id, e.target.value)}
                      style={{
                        padding: '4px 8px',
                        borderRadius: '4px',
                        border: '1px solid #333',
                        background: '#333',
                        color: '#fff',
                      }}
                    >
                      {['pending', 'paid', 'processing', 'shipped', 'completed', 'cancelled'].map(
                        (s) => (
                          <option key={s} value={s}>
                            {s}
                          </option>
                        )
                      )}
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
// ...existing code...
