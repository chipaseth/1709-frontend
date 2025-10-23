import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import CustomerOrderHistory from './CustomerOrderHistory';

export default function ManageCustomers() {
  const [customers, setCustomers] = useState([]);
  const [error, setError] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  useEffect(() => {
    async function fetchCustomers() {
      // First check if backend is reachable
      try {
        const healthCheck = await api.get('/health');
        console.log('Backend health:', healthCheck.data);
        if (
          typeof healthCheck.data === 'string' &&
          healthCheck.data.toLowerCase().includes('<!doctype')
        ) {
          throw new Error(
            'Health returned HTML (frontend) — backend base URL misconfigured.'
          );
        }
      } catch (healthError) {
        console.error('Backend health check failed:', healthError);
        setError(
          'Backend is not reachable. Please make sure the backend server is running and VITE_API_BASE_URL/VITE_API_URL is set.'
        );
        return;
      }

      // Then fetch customers
      try {
        const response = await api.get('/customers');
        console.log('Customers response:', response.data);
        if (!Array.isArray(response.data)) {
          console.error('Unexpected /customers response:', response.data);
          setError(
            'Unexpected response from backend when fetching customers. Check backend API and rewrites.'
          );
          setCustomers([]);
          return;
        }
        setCustomers(response.data);
        // auto-select first customer for convenience
        if (response.data.length > 0) setSelectedCustomer(response.data[0]);
      } catch (fetchError) {
        console.error('Failed to load customers:', fetchError);
        setError('Error fetching customers from backend.');
      }
    }

    fetchCustomers();
  }, []);

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div style={{ display: 'flex', gap: 24 }}>
      <div
        style={{
          width: 320,
          background: '#111',
          padding: 16,
          borderRadius: 8,
          maxHeight: 400,
          overflowY: 'auto',
        }}
      >
        <h2 style={{ marginTop: 0 }}>Customers</h2>
        {customers.length === 0 ? (
          <div style={{ color: '#888' }}>No customers found.</div>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0 }}>
            {customers.map((customer) => (
              <li
                key={customer.id}
                onClick={() => setSelectedCustomer(customer)}
                style={{
                  padding: '10px 12px',
                  borderRadius: 6,
                  marginBottom: 8,
                  cursor: 'pointer',
                  background:
                    selectedCustomer && selectedCustomer.id === customer.id
                      ? '#222'
                      : 'transparent',
                }}
              >
                <div style={{ fontWeight: 600 }}>{customer.name}</div>
                <div style={{ fontSize: 12, color: '#999' }}>{customer.email}</div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <div style={{ flex: 1, background: '#111', padding: 16, borderRadius: 8 }}>
        {selectedCustomer ? (
          <div>
            <h2 style={{ marginTop: 0 }}>{selectedCustomer.name}</h2>
            <div style={{ color: '#aaa', marginBottom: 12 }}>{selectedCustomer.email}</div>

            <div style={{ display: 'flex', gap: 12, marginBottom: 12 }}>
              <div>
                <div style={{ fontSize: 12, color: '#888' }}>Phone</div>
                <div>{selectedCustomer.phone || '—'}</div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: '#888' }}>Orders</div>
                <div>{selectedCustomer.total_orders ?? 0}</div>
              </div>
              <div>
                <div style={{ fontSize: 12, color: '#888' }}>Joined</div>
                <div>
                  {selectedCustomer.created_at
                    ? new Date(selectedCustomer.created_at).toLocaleDateString()
                    : '—'}
                </div>
              </div>
            </div>

            <div style={{ marginBottom: 16 }}>
              <div style={{ fontSize: 12, color: '#888' }}>Address</div>
              <div style={{ whiteSpace: 'pre-wrap' }}>
                {selectedCustomer.address
                  ? typeof selectedCustomer.address === 'object'
                    ? `${selectedCustomer.address.line1 || ''}\n${selectedCustomer.address.city || ''} ${selectedCustomer.address.postal || ''}`.trim()
                    : String(selectedCustomer.address)
                  : '—'}
              </div>
            </div>

            <div style={{ marginTop: 8 }}>
              <CustomerOrderHistory customerId={selectedCustomer.id} />
            </div>
          </div>
        ) : (
          <div style={{ color: '#888' }}>Select a customer to view details</div>
        )}
      </div>
    </div>
  );
}
