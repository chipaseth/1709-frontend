import React, { useState } from "react";
import { useCart } from "./CartContext";
import { payWithPaystack } from "../utils/paystack";
import api from "../utils/api"; // ✅ Fixed import — default export, no {}

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
    zip: "",
  });

  const subtotal = cart.reduce(
    (sum, item) => sum + item.quantity * parseFloat(item.price.replace(/[^\d.]/g, "")),
    0
  );

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  function handlePayNow(e) {
    e.preventDefault();
    const publicKey =
      import.meta.env.VITE_PAYSTACK_PUBLIC_KEY || "pk_test_xxxxxxxxxxxxxxxxxxxxxxxx";

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
          {
            display_name: "Mobile Number",
            variable_name: "mobile_number",
            value: form.phone,
          },
          {
            display_name: "Name",
            variable_name: "customer_name",
            value: `${form.firstName} ${form.lastName}`,
          },
          {
            display_name: "Delivery Address",
            variable_name: "delivery_address",
            value: `${form.complex} ${form.street}, ${form.town}, ${form.city}, ${form.province}, ${form.zip}`,
          },
        ],
      },
      onSuccess: function (response) {
        const sanitizedItems = cart.map((i) => ({
          id: i.id,
          title: i.title,
          price: i.price,
          quantity: i.quantity,
        }));

        // ✅ Use axios instance to send order to backend
        api
          .post("/api/orders", {
            email: form.email,
            name: `${form.firstName} ${form.lastName}`,
            phone: form.phone,
            address: {
              complex: form.complex,
              street: form.street,
              town: form.town,
              city: form.city,
              province: form.province,
              zip: form.zip,
            },
            items: sanitizedItems,
            total: subtotal,
            payment_reference: response.reference,
          })
          .then((res) => {
            console.log("Order saved successfully:", res.data);
            alert("Order placed! Reference: " + response.reference);
          })
          .catch((err) => {
            console.error("Error saving order:", err);
            alert(
              "Order could not be saved, but payment was successful. Please contact support."
            );
          });
      },

      onClose: function () {
        alert("Payment window closed.");
      },
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
            placeholder="Customer Email"
            className="checkout-input"
            value={form.email}
            onChange={handleChange}
            required
          />
          <input
            type="tel"
            name="phone"
            placeholder="Phone"
            className="checkout-input"
            value={form.phone}
            onChange={handleChange}
            required
          />
          <div className="checkout-row">
            <input
              type="text"
              name="firstName"
              placeholder="First Name"
              className="checkout-input half"
              value={form.firstName}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="lastName"
              placeholder="Last Name"
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
              placeholder="Complex/Flat Number And Name (Optional)"
              className="checkout-input"
              value={form.complex}
              onChange={handleChange}
            />
            <input
              type="text"
              name="street"
              placeholder="Street Address"
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
              placeholder="Town"
              className="checkout-input quarter"
              value={form.town}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="city"
              placeholder="City"
              className="checkout-input quarter"
              value={form.city}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="province"
              placeholder="Province"
              className="checkout-input quarter"
              value={form.province}
              onChange={handleChange}
              required
            />
            <input
              type="text"
              name="zip"
              placeholder="Zip Code"
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
        <button className="checkout-pay-btn" type="submit">
          Pay Now
        </button>
      </form>
    </div>
  );
}
