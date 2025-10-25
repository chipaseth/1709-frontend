import React, { useEffect, useState } from "react";
import api from "../../utils/api";
import CustomerOrderHistory from "./CustomerOrderHistory";

export default function ManageCustomers() {
  const [customers, setCustomers] = useState([]);
  const [error, setError] = useState("");
  const [selectedCustomer, setSelectedCustomer] = useState(null);

  useEffect(() => {
    async function fetchCustomers() {
      // First check if backend is reachable

      try {
        const healthCheck = await api.get("/health");
        console.log("Backend health:", healthCheck.data);
        if (
          typeof healthCheck.data === "string" &&
          healthCheck.data.toLowerCase().includes("<!doctype")
        ) {
          throw new Error(
            "Health returned HTML (frontend) — backend base URL misconfigured."
          );
        }
      } catch (healthError) {
        console.error("Backend health check failed:", healthError);
        setError(
          "Backend is not reachable. Please make sure the backend server is running and VITE_API_BASE_URL/VITE_API_URL is set."
        );
        return;
      }

      // Then fetch customers
      try {
        const response = await api.get("/customers");
        console.log("Customers response:", response.data);
        if (!Array.isArray(response.data)) {
          console.error("Unexpected /customers response:", response.data);
          setError(
            "Unexpected response from backend when fetching customers. Check backend API and rewrites."
          );
          setCustomers([]);
          return;
        }
        setCustomers(response.data);
        // auto-select first customer for convenience
        if (response.data.length > 0) setSelectedCustomer(response.data[0]);
      } catch (fetchError) {
        console.error("Failed to load customers:", fetchError);
        setError("Error fetching customers from backend.");
      }
    }

    fetchCustomers();
  }, []);

  if (error) {
    return <div className="error">{error}</div>;
  }

  return (
    <div style={{ display: "flex", gap: 20 }}>
      <div style={{ width: 360, maxHeight: 400, overflowY: "auto" }}>
        <h1>Manage Customers</h1>
        <ul style={{ listStyle: "none", padding: 0 }}>
          {customers.map((customer) => (
            <li
              key={customer.id}
              onClick={() => setSelectedCustomer(customer)} // <-- select on click
              style={{
                padding: 10,
                marginBottom: 8,
                cursor: "pointer",
                background:
                  selectedCustomer?.id === customer.id ? "#222" : "transparent",
              }}
            >
              <div style={{ fontWeight: 600 }}>{customer.name}</div>
              <div style={{ fontSize: 12, color: "#888" }}>
                {customer.email}
              </div>
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
              <CustomerOrderHistory customerId={selectedCustomer.id} />{" "}
              {/* <-- render history */}
            </div>
          </div>
        ) : (
          <div style={{ padding: 12, color: "#888" }}>
            Select a customer to view details
          </div>
        )}
      </div>
    </div>
  );
}
