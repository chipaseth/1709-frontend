import React, { useState, useRef, useEffect } from 'react';

export default function OverlayNav() {
  const [open, setOpen] = useState(false);
  const overlayRef = useRef(null);

  // Close overlay on ESC key
  useEffect(() => {
    function handleKeyDown(e) {
      if (e.key === 'Escape' && open) setOpen(false);
    }
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [open]);

  // Close overlay on click outside
  function handleOverlayClick(e) {
    if (e.target === overlayRef.current) setOpen(false);
  }

  // Restart CSS animations on open
  useEffect(() => {
    if (open && overlayRef.current) {
      const logo = overlayRef.current.querySelector('.logo-animate');
      if (logo) {
        logo.style.animation = 'none';
        void logo.offsetWidth;
        logo.style.animation = '';
      }
      overlayRef.current.querySelectorAll('.link-item').forEach((el) => {
        el.style.animation = 'none';
        void el.offsetWidth;
        el.style.animation = '';
      });
      const emailBtn = overlayRef.current.querySelector('.email-btn');
      const textBtn = overlayRef.current.querySelector('.text-btn');
      if (emailBtn && textBtn) {
        emailBtn.style.animation = 'none';
        textBtn.style.animation = 'none';
        void emailBtn.offsetWidth;
        void textBtn.offsetWidth;
        emailBtn.style.animation = '';
        textBtn.style.animation = '';
      }
    }
  }, [open]);

  return (
    <>
      {/* Nav Toggle Button */}
      <button
        className={`nav-toggle${open ? ' active' : ''}`}
        aria-label={open ? 'Close navigation' : 'Open navigation'}
        onClick={() => setOpen((v) => !v)}
        type="button"
      >
        {/* Logo instead of ☰ */}
  <span className="icon menu">
    <img 
      src="/images/1709logo2.jpg" 
      alt="Menu Logo" 
      className="nav-logo" 
    />
  </span>
        <span className="icon close">&#10005;</span>
      </button>

      {/* Overlay */}
      <div
        className={`overlay${open ? ' open' : ''}`}
        ref={overlayRef}
        onClick={handleOverlayClick}
      >
        <a href="/">
          <img src="/images/1709logo.jpg" alt="Utopia Logo" className="logo-animate" />
        </a>
        <div className="links">
          <a href="/tour/" className="link-item">TOUR</a>
          <a href="/department" className="link-item">Department of Street Affairs</a>
          <a href="/shop" className="link-item" target="_blank" rel="noopener noreferrer">SHOP</a>
          <a href="/explore/" className="link-item">Activist Mix Tape</a>
        </div>
        <div className="actions">
          <button className="email-btn">EMAIL</button>
          <button className="text-btn">TEXT</button>
        </div>
      </div>
    </>
  );
}