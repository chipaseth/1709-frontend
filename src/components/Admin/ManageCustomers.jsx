import React, { useEffect, useState } from 'react';
import api from '../../utils/api'; // ✅ replaced axios import

export default function ManageCustomers() {
  const [customers, setCustomers] = useState([]);
  const [error, setError] = useState('');
  // added loading state
  const [loading, setLoading] = useState(true);

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

  if (loading) {
    return <div style={{ padding: 20, textAlign: 'center' }}>Loading customers...</div>;
  }

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
