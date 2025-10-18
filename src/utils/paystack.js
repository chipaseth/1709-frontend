function loadPaystackScript() {
  if (window.PaystackPop) return Promise.resolve();
  return new Promise((resolve, reject) => {
    const s = document.createElement('script');
    s.src = 'https://js.paystack.co/v1/inline.js';
    s.async = true;
    s.onload = () => window.PaystackPop ? resolve() : reject(new Error('Paystack failed to initialize'));
    s.onerror = () => reject(new Error('Failed to load Paystack script'));
    document.head.appendChild(s);
  });
}

export async function payWithPaystack({ email, amount, metadata, onSuccess, onClose, publicKey, currency = 'USD' }) {
  try {
    await loadPaystackScript();
  } catch (err) {
    alert('Payment failed to initialize: ' + err.message);
    return;
  }

  if (!window.PaystackPop) {
    alert('Paystack not available');
    return;
  }

  const handler = window.PaystackPop.setup({
    key: publicKey,
    email,
    amount: Math.round(amount * 100),
    currency,
    ref: '' + Math.floor(Math.random() * 1e9 + 1),
    metadata,
    callback: (response) => {
      try { onSuccess && onSuccess(response); } catch (e) { console.error(e); }
    },
    onClose: () => { onClose && onClose(); }
  });

  handler.openIframe();
}
