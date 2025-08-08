import React, { useState } from "react";
import { useCart } from "./CartContext";
import { payWithPaystack } from "../utils/paystack";

export default function Checkout() {
  const { cart } = useCart();
  const [form, setForm] = useState({
    email: "",
    phone: "",
    firstName: "",
    lastName: "",
    complex: "",
    street: "",
    town: "",
    city: "",
    province: "",
    zip: ""
  });

  const subtotal = cart.reduce((sum, item) => sum + item.quantity * parseFloat(item.price.replace(/[^\d.]/g, "")), 0);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handlePayNow(e) {
    e.preventDefault();
    const publicKey = import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || "pk_test_xxxxxxxxxxxxxxxxxxxxxxxx";
    if (!form.email || !form.phone || !form.firstName || !form.lastName) {
      alert("Please fill in all required fields.");
      return;
    }
    payWithPaystack({
      email: form.email,
      amount: subtotal,
      publicKey,
      currency: "ZAR",
      metadata: {
        custom_fields: [
          { display_name: "Mobile Number", variable_name: "mobile_number", value: form.phone },
          { display_name: "Name", variable_name: "customer_name", value: `${form.firstName} ${form.lastName}` },
          { display_name: "Delivery Address", variable_name: "delivery_address", value: `${form.complex} ${form.street}, ${form.town}, ${form.city}, ${form.province}, ${form.zip}` }
        ]
      },
      onSuccess: function(response) {
        // Send order to backend after payment success
        fetch('/api/orders', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: form.email,
            name: `${form.firstName} ${form.lastName}`,
            phone: form.phone,
            address: {
              complex: form.complex,
              street: form.street,
              town: form.town,
              city: form.city,
              province: form.province,
              zip: form.zip
            },
            items: cart,
            total: subtotal,
            payment_reference: response.reference
          })
        })
        .then(res => {
          if (!res.ok) {
            throw new Error(`HTTP error! status: ${res.status}`);
          }
          return res.json();
        })
        .then(data => {
          console.log('Order saved successfully:', data);
          alert('Order placed! Reference: ' + response.reference);
          // Optionally clear cart or redirect
        })
        .catch((error) => {
          console.error('Error saving order:', error);
          alert('Order could not be saved, but payment was successful. Please contact support.');
        });
      },
      onClose: function() {
        alert('Payment window closed.');
      }
    });
  }

  return (
    <div className="checkout-container">
      {/* Contact Section */}
      <h2 className="checkout-heading">Contact</h2>
      <form className="checkout-form" onSubmit={handlePayNow} autoComplete="off">
        <div className="checkout-section">
          <input
            type="email"
            name="email"
            placeholder="customer email"
            className="checkout-input"
            value={form.email}
            onChange={handleChange}
            required
          />
          <input
            type="tel"
            name="phone"
            placeholder="phone"
            className="checkout-input"
            value={form.phone}
            onChange={handleChange}
            required
          />
          <div className="checkout-row">
            <input
              type="text"
              name="firstName"
              placeholder="first name"
              className="checkout-input half"
              value={form.firstName}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="lastName"
              placeholder="last name"
              className="checkout-input half"
              value={form.lastName}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        {/* Delivery Section */}
        <h2 className="checkout-heading">Delivery</h2>
        <div className="checkout-section">
          <div className="checkout-row">
            <input
              type="text"
              name="complex"
              placeholder="complex/flat number and name (optional)"
              className="checkout-input"
              value={form.complex}
              onChange={handleChange}
            />
            <input
              type="text"
              name="street"
              placeholder="street address"
              className="checkout-input"
              value={form.street}
              onChange={handleChange}
              required
            />
          </div>
          <div className="checkout-row">
            <input
              type="text"
              name="town"
              placeholder="town"
              className="checkout-input quarter"
              value={form.town}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="city"
              placeholder="city"
              className="checkout-input quarter"
              value={form.city}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="province"
              placeholder="province"
              className="checkout-input quarter"
              value={form.province}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="zip"
              placeholder="zip code"
              className="checkout-input quarter"
              value={form.zip}
              onChange={handleChange}
              required
            />
          </div>
        </div>

        {/* Order Summary Section */}
        <h2 className="checkout-heading">Order Summary</h2>
        <div className="checkout-summary">
          {cart.length === 0 ? (
            <div className="cart-empty">Your cart is empty.</div>
          ) : (
            cart.map((item, idx) => (
              <div className="checkout-item" key={idx}>
                <div className="checkout-img-wrap">
                  <img src={item.img} alt={item.title} className="checkout-img" />
                  <span className="checkout-qty-badge">{item.quantity}</span>
                </div>
                <span className="checkout-item-name">{item.title}</span>
                <span className="checkout-item-price">{item.price}</span>
              </div>
            ))
          )}
        </div>
        <div className="checkout-total-row">
          <span className="checkout-total-label">Total</span>
          <span className="checkout-total-value">R{subtotal.toFixed(2)}</span>
        </div>
        <button className="checkout-pay-btn" type="submit">Pay Now</button>
      </form>
    </div>
  );
}
