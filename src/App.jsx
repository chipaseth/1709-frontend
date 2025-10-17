import React from 'react';
import { BrowserRouter as Router, Routes, Route, useLocation } from 'react-router-dom';
import OverlayNav from './components/OverlayNav';
import Header from './components/Header';
import ProductGrid from './components/ProductGrid';
import Tour from './components/Tour';
import Footer from './components/Footer';
import ProductDetails from './components/ProductDetails';
import Checkout from './components/Checkout';

import CartOverlay from './components/CartOverlay';
import { CartProvider } from './components/CartContext';
import DepartmentCarousel from './components/DepartmentCarousel';
import AdminDashboard from './components/Admin/AdminDashboard';

function Home() {
  return (
    <main className="center-img-wrap">
      <a href="/shop">
      <img className="center-img" alt="1709hero" src="/images/1709hero.jpg" />
      </a>
    </main>
  );
}

function Shop() {
  return (
    <main>
      <a href="/">
      <img 
        src="/images/1709logo.jpg" 
        alt="Shop" 
        style={{ 
          display: 'block', 
          margin: '40px auto 0', 
          maxWidth: '200px' // adjust size if needed
        }} 
      />
      </a>
      <ProductGrid />
      <Footer />
    </main>
  );
}


function TourPage(){
  return(
    <main>
      <img 
        src="/images/1709logo.jpg" 
        alt="Shop" 
        style={{ 
          display: 'block', 
          margin: '40px auto 0', 
          maxWidth: '200px' // adjust size if needed
        }} 
      />
      <Tour />
    </main>
  )
}

function AppContent() {
  const location = useLocation();
  const isProductPage = location.pathname.startsWith("/product");
  const isShopPage = location.pathname === "/shop";
  const isCheckoutPage = location.pathname === "/checkout";
  const isAdminPage = location.pathname === "/admin";

  return (
    <CartProvider>
      <>
        {!isProductPage && !isShopPage && !isCheckoutPage && !isAdminPage && <OverlayNav />}
        {!isProductPage && !isCheckoutPage && !isAdminPage && <Header />}
        <Routes>
          <Route path="/" element={<Home />} />
          <Route path="/shop" element={<Shop />} />
          <Route path="/tour" element={<TourPage />} />
          <Route path="/product/:id" element={<ProductDetails />} />
          <Route path="/checkout" element={<Checkout />} />
          <Route path="/admin" element={<AdminDashboard />} />
          <Route path="/department" element={<DepartmentCarousel />} />
        </Routes>
      </>
      <CartOverlay />
    </CartProvider>
  );
}

export default function App() {
  return (
    <Router>
      <AppContent />
    </Router>
  );
}