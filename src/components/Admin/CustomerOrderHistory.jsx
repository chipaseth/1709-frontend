import React, { useEffect, useState } from 'react';
import api from '../../utils/api';

export default function CustomerOrderHistory({ customerId }) {
  const [orders, setOrders] = useState([]);

  useEffect(() => {
    let mounted = true;
    if (!customerId) {
      setOrders([]);
      return;
    }

    (async () => {
      try {
        const res = await api.get(`/orders/customer/${customerId}`);
        const data = res?.data ?? [];
        if (!Array.isArray(data)) {
          console.error('Customer orders response not array:', data);
          if (mounted) setOrders([]);
          return;
        }
        if (mounted) setOrders(data);
      } catch (error) {
        console.error('Error fetching customer orders:', error);
        if (mounted) setOrders([]);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [customerId]);

  return (
    <div>
      <h3>Order History</h3>
      {(!Array.isArray(orders) || orders.length === 0) ? (
        <p style={{ color: '#888' }}>No orders found for this customer.</p>
      ) : (
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {orders.map(order => (
            <li
              key={order.id}
              style={{
                padding: '8px 0',
                borderBottom: '1px solid #333',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
              }}
            >
              <span>Order #{order.id}</span>
              <span>R{order.total}</span>
              <span
                style={{
                  padding: '2px 6px',
                  borderRadius: '4px',
                  fontSize: '12px',
                  background:
                    order.status === 'completed' ? '#4CAF50' :
                    order.status === 'cancelled' ? '#f44336' :
                    order.status === 'shipped' ? '#2196F3' :
                    order.status === 'processing' ? '#FF9800' :
                    order.status === 'paid' ? '#4CAF50' :
                    '#666'
                }}
              >
                {order.status}
              </span>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
