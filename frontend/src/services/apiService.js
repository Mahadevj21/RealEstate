const API_BASE_URL = 'http://localhost:8080';

// ── Token helpers ────────────────────────────────────────────────────────────
const getToken = () => localStorage.getItem('token');

const authHeaders = () => {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
};

const handle = (r) =>
  r.ok ? r.json() : r.text().then((t) => { throw new Error(t || r.statusText); });

// For DELETE endpoints that may return 204 No Content
const handleDelete = async (r) => {
  if (!r.ok) {
    const error = await r.text();
    throw new Error(error || `Delete failed with status ${r.status}`);
  }
  if (r.status === 204) return true;
  try { return await r.json(); } catch (e) { return true; }
};

export const apiService = {

  // ── Auth (public — no token required) ─────────────────────────────────────
  register: (username, email, password, role) =>
    fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password, role }),
    }).then(handle),

  login: (email, password) =>
    fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    }).then(handle),

  updateProfile: (userId, username, email, password) =>
    fetch(`${API_BASE_URL}/auth/profile/${userId}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({ username, email, password }),
    }).then(handle),

  // ── Properties ────────────────────────────────────────────────────────────
  getProperties: () =>
    fetch(`${API_BASE_URL}/properties`, { headers: authHeaders() }).then(handle),

  addProperty: (sellerId, title, description, price, location, imageUrl, bedrooms, bathrooms, type) =>
    fetch(`${API_BASE_URL}/properties/add/${sellerId}`, {
      method: 'POST',
      headers: authHeaders(),
      body: JSON.stringify({ title, description, price, location, imageUrl, bedrooms, bathrooms, type }),
    }).then(handle),

  deleteProperty: (propertyId) =>
    fetch(`${API_BASE_URL}/properties/${propertyId}`, {
      method: 'DELETE',
      headers: authHeaders(),
    }).then(handleDelete),

  updateProperty: (propertyId, title, description, price, location, imageUrl, bedrooms, bathrooms, type) =>
    fetch(`${API_BASE_URL}/properties/${propertyId}`, {
      method: 'PUT',
      headers: authHeaders(),
      body: JSON.stringify({ title, description, price, location, imageUrl, bedrooms, bathrooms, type }),
    }).then(handle),

  // ── Buyer ─────────────────────────────────────────────────────────────────
  getAvailableProperties: () =>
    fetch(`${API_BASE_URL}/buyer/available`, { headers: authHeaders() }).then(handle),

  searchProperties: (keyword) =>
    fetch(`${API_BASE_URL}/buyer/search?keyword=${encodeURIComponent(keyword)}`, { headers: authHeaders() }).then(handle),

  filterByLocation: (location) =>
    fetch(`${API_BASE_URL}/buyer/filter/location?location=${location}`, { headers: authHeaders() }).then(handle),

  filterByPrice: (minPrice, maxPrice) =>
    fetch(`${API_BASE_URL}/buyer/filter/price?minPrice=${minPrice}&maxPrice=${maxPrice}`, { headers: authHeaders() }).then(handle),

  advancedFilter: (location = '', minPrice = 0, maxPrice = 999999999, sold = false) =>
    fetch(`${API_BASE_URL}/buyer/filter/advanced?location=${location}&minPrice=${minPrice}&maxPrice=${maxPrice}&sold=${sold}`, { headers: authHeaders() })
      .then(handle),

  addFavorite: (buyerId, propertyId) =>
    fetch(`${API_BASE_URL}/buyer/${buyerId}/favourites/${propertyId}`, {
      method: 'POST',
      headers: authHeaders(),
    }).then(handle),

  getFavorites: (buyerId) =>
    fetch(`${API_BASE_URL}/buyer/${buyerId}/favourites`, { headers: authHeaders() }).then(handle),

  removeFavorite: (buyerId, propertyId) =>
    fetch(`${API_BASE_URL}/buyer/${buyerId}/favourites/${propertyId}`, {
      method: 'DELETE',
      headers: authHeaders(),
    }).then(handle),

  buyProperty: (propertyId, buyerId) =>
    fetch(`${API_BASE_URL}/buyer/buy/${propertyId}/buyer/${buyerId}`, {
      method: 'POST',
      headers: authHeaders(),
    }).then(handle),

  getBuyerBalance: (buyerId) =>
    fetch(`${API_BASE_URL}/buyer/${buyerId}/balance`, { headers: authHeaders() }).then(handle),

  getBuyerDeals: (buyerId) =>
    fetch(`${API_BASE_URL}/buyer/${buyerId}/deals`, { headers: authHeaders() }).then(handle),

  // ── Seller ────────────────────────────────────────────────────────────────
  getSellerBalance: (sellerId) =>
    fetch(`${API_BASE_URL}/seller/${sellerId}/balance`, { headers: authHeaders() }).then(handle),

  getSellerProperties: (sellerId) =>
    fetch(`${API_BASE_URL}/seller/${sellerId}/properties`, { headers: authHeaders() }).then(handle),

  getSellerPendingDeals: (sellerId) =>
    fetch(`${API_BASE_URL}/seller/${sellerId}/pending-deals`, { headers: authHeaders() }).then(handle),

  getAllSellerDeals: (sellerId) =>
    fetch(`${API_BASE_URL}/seller/${sellerId}/all-deals`, { headers: authHeaders() }).then(handle),

  acceptDeal: (dealId) =>
    fetch(`${API_BASE_URL}/seller/deals/${dealId}/accept`, {
      method: 'POST',
      headers: authHeaders(),
    }).then(handle),

  rejectDeal: (dealId) =>
    fetch(`${API_BASE_URL}/seller/deals/${dealId}/reject`, {
      method: 'POST',
      headers: authHeaders(),
    }).then(handle),

  getSellerPerformance: (sellerId) =>
    fetch(`${API_BASE_URL}/seller/${sellerId}/analytics/performance`, { headers: authHeaders() }).then(handle),

  // ── Admin ─────────────────────────────────────────────────────────────────
  getAllUsers: () =>
    fetch(`${API_BASE_URL}/admin/users`, { headers: authHeaders() }).then(handle),

  blockUser: (userId) =>
    fetch(`${API_BASE_URL}/admin/users/${userId}/block`, {
      method: 'PUT',
      headers: authHeaders(),
    }).then(handle),

  unblockUser: (userId) =>
    fetch(`${API_BASE_URL}/admin/users/${userId}/unblock`, {
      method: 'PUT',
      headers: authHeaders(),
    }).then(handle),

  getAdminProperties: () =>
    fetch(`${API_BASE_URL}/admin/properties`, { headers: authHeaders() }).then(handle),

  approveProperty: (propertyId) =>
    fetch(`${API_BASE_URL}/admin/properties/${propertyId}/approve`, {
      method: 'PUT',
      headers: authHeaders(),
    }).then(handle),

  rejectProperty: (propertyId) =>
    fetch(`${API_BASE_URL}/admin/properties/${propertyId}/reject`, {
      method: 'PUT',
      headers: authHeaders(),
    }).then(handle),

  getCompletedDeals: () =>
    fetch(`${API_BASE_URL}/admin/deals`, { headers: authHeaders() }).then(handle),

  getAdminBalance: () =>
    fetch(`${API_BASE_URL}/admin/balance`, { headers: authHeaders() }).then(handle),

  getPlatformStats: () =>
    fetch(`${API_BASE_URL}/admin/analytics/stats`, { headers: authHeaders() }).then(handle),

  getPlatformGrowth: () =>
    fetch(`${API_BASE_URL}/admin/analytics/growth`, { headers: authHeaders() }).then(handle),

  getReportSummary: () =>
    fetch(`${API_BASE_URL}/admin/reports/summary`, { headers: authHeaders() }).then(handle),

  rechargeAllUsers: (amount) =>
    fetch(`${API_BASE_URL}/admin/balance/recharge-all?amount=${amount}`, {
      method: 'PUT',
      headers: authHeaders(),
    }).then(handle),

  // ── Wallet & Transactions ──────────────────────────────────────────────────
  getWalletBalance: (userId) =>
    fetch(`${API_BASE_URL}/wallet/${userId}/balance`, { headers: authHeaders() }).then(handle),

  getTransactionHistory: (userId) =>
    fetch(`${API_BASE_URL}/wallet/${userId}/transactions`, { headers: authHeaders() }).then(handle),

  getTransaction: (transactionId) =>
    fetch(`${API_BASE_URL}/wallet/transaction/${transactionId}`, { headers: authHeaders() }).then(handle),

  updateTransactionStatus: (transactionId, status) =>
    fetch(`${API_BASE_URL}/wallet/transaction/${transactionId}/status?status=${status}`, {
      method: 'PUT',
      headers: authHeaders(),
    }).then(handle),
};
