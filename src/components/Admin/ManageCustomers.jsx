// ...existing code...
import React, { useEffect, useState } from 'react';
import api from '../../utils/api'; // ✅ replaced axios import

export default function ManageCustomers() {
  const [customers, setCustomers] = useState([]);
  const [error, setError] = useState('');

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
          'Backend is not reachable. Please make sure the backend server is running on port 4000.'
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
            'Unexpected response from backend when fetching customers. Check VITE_API_BASE_URL and rewrites.'
          );
          setCustomers([]);
          return;
        }
        setCustomers(response.data);
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
