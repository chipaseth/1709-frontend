import React, { useEffect, useState } from 'react';
import api from '../../utils/api';
import CustomerOrderHistory from './CustomerOrderHistory';

export default function ManageCustomers() {
  const [customers, setCustomers] = useState([]);
  const [error, setError] = useState('');
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  useEffect(() => {
    const fetchCustomers = async () => {
    try {
      setLoading(true);
      setError(null);
      console.log('Fetching customers...');

      // health check
      try {
        const healthCheck = await api.get('/health');
        console.log('Backend health:', healthCheck.data ?? healthCheck);
      } catch (healthError) {
        console.error('Backend health check failed:', healthError);
        setError('Backend is not reachable. Please make sure the backend server is running on port 4000.');
        return;
      }

      const response = await api.get('/customers');
      console.log('Customers response raw:', response);

      // Normalize response: some helpers return res.data, others return the data directly
      const data = Array.isArray(response) ? response : response?.data ?? [];
      console.log('Normalized customers data:', data);

      if (!Array.isArray(data)) {
        console.error('Unexpected /customers response shape:', response);
        setError('Unexpected response from backend when fetching customers. Check backend API and rewrites.');
        setCustomers([]);
        return;
      }

      setCustomers(data);
      if (!selectedCustomer && data.length) setSelectedCustomer(data[0]);
    } catch (err) {
      console.error('Error fetching customers:', err);
      setError(`Failed to load customers: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };
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
