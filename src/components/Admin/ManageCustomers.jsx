// ...existing code...
import React, { useEffect, useState } from 'react';
import api from '../../utils/api';

export default function ManageCustomers() {
  const [customers, setCustomers] = useState([]);
  const [error, setError] = useState('');

  useEffect(() => {
    async function fetchCustomers() {
      // First check if backend is reachable
      try {
        const health = await api.get('/health'); // api returns the parsed body
        console.log('Backend health:', health);
        if (typeof health === 'string' && health.toLowerCase().includes('<!doctype')) {
          throw new Error('Health returned HTML (frontend) — backend base URL misconfigured.');
        }
      } catch (healthError) {
        console.error('Backend health check failed:', healthError);
        setError('Backend is not reachable. Please make sure VITE_API_URL is set and backend is deployed.');
        return;
      }

      // Then fetch customers
      try {
        const data = await api.get('/customers'); // data is the parsed response body
        console.log('Customers response:', data);
        if (!Array.isArray(data)) {
          console.error('Unexpected /customers response:', data);
          setError('Unexpected response from backend when fetching customers. Check backend logs.');
          setCustomers([]);
          return;
        }
        setCustomers(data);
      } catch (fetchError) {
        console.error('Failed to load customers:', fetchError, { status: fetchError.status, payload: fetchError.payload });
        setError('Error fetching customers from backend. See console for details.');
      }
    }

    fetchCustomers();
  }, []);

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div>
      <h1>Manage Customers</h1>
      <ul>
        {customers.map((customer) => (
          <li key={customer.id}>{customer.name}</li>
        ))}
      </ul>
    </div>
  );
}
// ...existing code...
