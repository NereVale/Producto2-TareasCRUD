const API_URL = 'http://localhost:3000';

export async function request(path, options = {}) {
  const token = localStorage.getItem('token');

  const res = await fetch(`${API_URL}${path}`, {
    ...options,
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    },
  });

  const data = await res.json().catch(() => ({}));

  if (!res.ok) {
    const error = new Error(data.error || 'Error en la petición');
    error.status = res.status;
    throw error;
  }
  return data;
}