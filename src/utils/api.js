const RAW_API = import.meta.env.VITE_API_URL || 'http://localhost:4000';

function normalizeBase(base) {
  let b = base.trim();
  if (!/^https?:\/\//i.test(b)) b = 'https://' + b;
  return b.replace(/\/+$/, ''); // remove trailing slash
}

export const API = normalizeBase(RAW_API);

async function handleResponse(res) {
  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (!res.ok) {
    const err = new Error((data && data.message) || `HTTP ${res.status}`);
    err.status = res.status;
    err.payload = data;
    throw err;
  }
  return data;
}

export async function apiFetch(path, options = {}) {
  // path may be '/api/...' or 'api/...'
  const cleanPath = path.startsWith('/') ? path : '/' + path;
  const url = new URL(cleanPath, API).toString();
  const init = {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    credentials: options.credentials || 'same-origin',
    ...options,
  };
  if (init.body && typeof init.body === 'object') init.body = JSON.stringify(init.body);
  const res = await fetch(url, init);
  return handleResponse(res);
}
