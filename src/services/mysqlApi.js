const apiUrl =
  import.meta.env.VITE_API_URL ||
  (import.meta.env.DEV ? 'http://localhost:3333/api' : '/api');
const tokenKey = 'mamma_mia_token';

export const hasMysqlApiConfig = Boolean(apiUrl);

export function getMysqlToken() {
  return window.localStorage.getItem(tokenKey);
}

export function setMysqlToken(token) {
  if (token) {
    window.localStorage.setItem(tokenKey, token);
    return;
  }

  window.localStorage.removeItem(tokenKey);
}

async function request(path, options = {}) {
  if (!hasMysqlApiConfig) {
    throw new Error('API MySQL nao configurada.');
  }

  const token = getMysqlToken();

  const response = await fetch(`${apiUrl}${path}`, {
    headers: {
      'Content-Type': 'application/json',
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
      ...options.headers,
    },
    ...options,
  });

  const data = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(data?.error || 'Erro na API MySQL.');
  }

  return data;
}

export function checkMysqlHealth() {
  return request('/health');
}

export function signInMysql(email, password) {
  return request('/auth/login', {
    method: 'POST',
    body: JSON.stringify({ email, password }),
  });
}

export function signUpMysql(payload) {
  return request('/auth/register', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function fetchMysqlMe() {
  return request('/auth/me');
}

export function fetchMysqlCategories() {
  return request('/categories');
}

export function fetchMysqlCatalog() {
  return request('/products');
}

export function fetchMysqlOrders() {
  return request('/orders');
}

export function fetchMysqlMyOrders() {
  return request('/my-orders');
}

export function createMysqlOrder(payload) {
  return request('/orders', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function updateMysqlOrderStatus(orderId, status) {
  return request(`/orders/${orderId}/status`, {
    method: 'PATCH',
    body: JSON.stringify({ status }),
  });
}

export function createMysqlCategory(payload) {
  return request('/categories', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}

export function createMysqlProduct(payload) {
  return request('/products', {
    method: 'POST',
    body: JSON.stringify(payload),
  });
}
