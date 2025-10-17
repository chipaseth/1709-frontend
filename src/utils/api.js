export const API = import.meta.env.VITE_API_URL || 'http://localhost:4000';

async function handleResponse(res) {
  const text = await res.text();
  let data = null;
  try { data = text ? JSON.parse(text) : null; } catch { data = text; }
  if (!res.ok) {
    const err = new Error(data && data.message ? data.message : `HTTP ${res.status}`);
    err.status = res.status;
    err.payload = data;
    throw err;
  }
  return data;
}

export async function apiFetch(path, options = {}) {
  const url = `${API}${path}`;
  const init = {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    credentials: options.credentials || 'same-origin',
    ...options,
  };

  // if caller passed a body object, stringify it
  if (init.body && typeof init.body === 'object') {
    init.body = JSON.stringify(init.body);
  }

  const res = await fetch(url, init);
  return handleResponse(res);
}