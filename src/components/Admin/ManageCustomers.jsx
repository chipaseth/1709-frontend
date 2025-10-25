import React, { useEffect, useState } from 'react';
import api from '../../utils/api'; // ✅ replaced axios import
import CustomerOrderHistory from './CustomerOrderHistory';

export default function ManageCustomers() {
  const [customers, setCustomers] = useState([]);
  const [error, setError] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null); // <-- added state

  useEffect(() => {
    async function fetchCustomers() {
      setLoading(true);
      try {
        // First check if backend is reachable
        try {
          const healthCheck = await api.get('/health');
          console.log('Backend health:', healthCheck.data ?? healthCheck);
          if (
            typeof (healthCheck.data ?? healthCheck) === 'string' &&
            (healthCheck.data ?? healthCheck).toLowerCase().includes('<!doctype')
          ) {
            throw new Error(
              'Health returned HTML (frontend) — backend base URL misconfigured.'
            );
          }
        } catch (healthError) {
          console.error('Backend health check failed:', healthError);
          setError(
            'Backend is not reachable. Please make sure the backend server is running on port 4000.'
          );
          return;
        }

        // Then fetch customers
        const response = await api.get('/customers');
        console.log('Customers response raw:', response);
        const data = Array.isArray(response) ? response : response?.data ?? [];
        if (!Array.isArray(data)) {
          console.error('Unexpected /customers response:', response);
          setError(
            'Unexpected response from backend when fetching customers. Check VITE_API_BASE_URL and rewrites.'
          );
          setCustomers([]);
          return;
        }
        setCustomers(data);
      } catch (fetchError) {
        console.error('Failed to load customers:', fetchError);
        setError('Error fetching customers from backend.');
      } finally {
        setLoading(false);
      }
    }

    fetchCustomers();
  }, []);

  
  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div style={{ display: 'flex', gap: 20 }}>
      <div style={{ width: 360, maxHeight: 400, overflowY: 'auto' }}>
        <h1>Manage Customers</h1>
        <ul style={{ listStyle: 'none', padding: 0 }}>
          {customers.map((customer) => (
            <li
              key={customer.id}
              onClick={() => setSelectedCustomer(customer)} // <-- select on click
              style={{
                padding: 10,
                marginBottom: 8,
                cursor: 'pointer',
                background: selectedCustomer?.id === customer.id ? '#222' : 'transparent'
              }}
            >
              <div style={{ fontWeight: 600 }}>{customer.name}</div>
              <div style={{ fontSize: 12, color: '#888' }}>{customer.email}</div>
            </li>
          ))}
        </ul>
      </div>

      <div style={{ flex: 1 }}>
        {selectedCustomer ? (
          <div style={{ padding: 12 }}>
            <h2>{selectedCustomer.name}</h2>
            <div>{selectedCustomer.email}</div>
            <div>{selectedCustomer.phone}</div>
            <div>{selectedCustomer.total_orders} orders</div>
            <div style={{ marginTop: 12 }}>
              <CustomerOrderHistory customerId={selectedCustomer.id} /> {/* <-- render history */}
            </div>
          </div>
        ) : (
          <div style={{ padding: 12, color: '#888' }}>Select a customer to view details</div>
        )}
      </div>
    </div>
  );
}
