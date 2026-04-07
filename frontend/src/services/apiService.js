const API_BASE_URL = 'http://localhost:8080';

export const apiService = {

  // ── Auth ──────────────────────────────────────────────────────────
  register: (username, email, password, role) =>
    fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password, role }),
    }).then(r => r.ok ? r.json() : r.text().then(t => { throw new Error(t || r.statusText) })),

  login: (email, password) =>
    fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    }).then(r => r.ok ? r.json() : r.text().then(t => { throw new Error(t || r.statusText) })),

  updateProfile: (userId, username, email, password) =>
    fetch(`${API_BASE_URL}/auth/profile/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password }),
    }).then(r => r.ok ? r.json() : r.text().then(t => { throw new Error(t || r.statusText) })),

  // ── Properties (public) ───────────────────────────────────────────
  getProperties: () =>
    fetch(`${API_BASE_URL}/properties`).then(r => r.ok ? r.json() : r.text().then(t => { throw new Error(t || r.statusText) })),

  addProperty: (sellerId, title, description, price, location, imageUrl, bedrooms, bathrooms, type) =>
    fetch(`${API_BASE_URL}/properties/add/${sellerId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, price, location, imageUrl, bedrooms, bathrooms, type }),
    }).then(r => r.ok ? r.json() : r.text().then(t => { throw new Error(t || r.statusText) })),

  deleteProperty: async (propertyId) => {
    const response = await fetch(`${API_BASE_URL}/properties/${propertyId}`, {
      method: 'DELETE',
      headers: { 'Content-Type': 'application/json' },
    });
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || `Delete failed with status ${response.status}`);
    }
    if (response.status === 204) return true;
    try { return await response.json(); } catch (e) { return true; }
  },

  updateProperty: (propertyId, title, description, price, location, imageUrl, bedrooms, bathrooms, type) =>
    fetch(`${API_BASE_URL}/properties/${propertyId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, price, location, imageUrl, bedrooms, bathrooms, type }),
    }).then(r => r.ok ? r.json() : r.text().then(t => { throw new Error(t || r.statusText) })),

  // ── Buyer ─────────────────────────────────────────────────────────
  getAvailableProperties: () =>
    fetch(`${API_BASE_URL}/buyer/available`).then(r => r.ok ? r.json() : r.text().then(t => { throw new Error(t || r.statusText) })),

  searchProperties: (keyword) =>
    fetch(`${API_BASE_URL}/buyer/search?keyword=${encodeURIComponent(keyword)}`).then(r => r.ok ? r.json() : r.text().then(t => { throw new Error(t || r.statusText) })),

  filterByLocation: (location) =>
    fetch(`${API_BASE_URL}/buyer/filter/location?location=${location}`).then(r => r.ok ? r.json() : r.text().then(t => { throw new Error(t || r.statusText) })),

  filterByPrice: (minPrice, maxPrice) =>
    fetch(`${API_BASE_URL}/buyer/filter/price?minPrice=${minPrice}&maxPrice=${maxPrice}`).then(r => r.ok ? r.json() : r.text().then(t => { throw new Error(t || r.statusText) })),

  advancedFilter: (location = '', minPrice = 0, maxPrice = 999999999, sold = false) =>
    fetch(`${API_BASE_URL}/buyer/filter/advanced?location=${location}&minPrice=${minPrice}&maxPrice=${maxPrice}&sold=${sold}`)
      .then(r => r.ok ? r.json() : r.text().then(t => { throw new Error(t || r.statusText) })),

  addFavorite: (buyerId, propertyId) =>
    fetch(`${API_BASE_URL}/buyer/${buyerId}/favourites/${propertyId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }).then(r => r.ok ? r.json() : r.text().then(t => { throw new Error(t || r.statusText) })),

  getFavorites: (buyerId) =>
    fetch(`${API_BASE_URL}/buyer/${buyerId}/favourites`).then(r => r.ok ? r.json() : r.text().then(t => { throw new Error(t || r.statusText) })),

  removeFavorite: (buyerId, propertyId) =>
    fetch(`${API_BASE_URL}/buyer/${buyerId}/favourites/${propertyId}`, {
      method: 'DELETE',
    }).then(r => r.ok ? r.json() : r.text().then(t => { throw new Error(t || r.statusText) })),

  buyProperty: (propertyId, buyerId) =>
    fetch(`${API_BASE_URL}/buyer/buy/${propertyId}/buyer/${buyerId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }).then(r => r.ok ? r.json() : r.text().then(t => { throw new Error(t || r.statusText) })),

  getBuyerBalance: (buyerId) =>
    fetch(`${API_BASE_URL}/buyer/${buyerId}/balance`).then(r => r.ok ? r.json() : r.text().then(t => { throw new Error(t || r.statusText) })),

  getBuyerDeals: (buyerId) =>
    fetch(`${API_BASE_URL}/buyer/${buyerId}/deals`).then(r => r.ok ? r.json() : r.text().then(t => { throw new Error(t || r.statusText) })),

  // ── Seller ────────────────────────────────────────────────────────
  getSellerBalance: (sellerId) =>
    fetch(`${API_BASE_URL}/seller/${sellerId}/balance`).then(r => r.ok ? r.json() : r.text().then(t => { throw new Error(t || r.statusText) })),

  getSellerProperties: (sellerId) =>
    fetch(`${API_BASE_URL}/seller/${sellerId}/properties`).then(r => r.ok ? r.json() : r.text().then(t => { throw new Error(t || r.statusText) })),

  getSellerPendingDeals: (sellerId) =>
    fetch(`${API_BASE_URL}/seller/${sellerId}/pending-deals`).then(r => r.ok ? r.json() : r.text().then(t => { throw new Error(t || r.statusText) })),

  getAllSellerDeals: (sellerId) =>
    fetch(`${API_BASE_URL}/seller/${sellerId}/all-deals`).then(r => r.ok ? r.json() : r.text().then(t => { throw new Error(t || r.statusText) })),

  acceptDeal: (dealId) =>
    fetch(`${API_BASE_URL}/seller/deals/${dealId}/accept`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }).then(r => r.ok ? r.json() : r.text().then(t => { throw new Error(t || r.statusText) })),

  rejectDeal: (dealId) =>
    fetch(`${API_BASE_URL}/seller/deals/${dealId}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }).then(r => r.ok ? r.json() : r.text().then(t => { throw new Error(t || r.statusText) })),

  getSellerPerformance: (sellerId) =>
    fetch(`${API_BASE_URL}/seller/${sellerId}/analytics/performance`).then(r => r.ok ? r.json() : r.text().then(t => { throw new Error(t || r.statusText) })),

  // ── Admin ─────────────────────────────────────────────────────────
  getAllUsers: () =>
    fetch(`${API_BASE_URL}/admin/users`).then(r => r.ok ? r.json() : r.text().then(t => { throw new Error(t || r.statusText) })),

  blockUser: (userId) =>
    fetch(`${API_BASE_URL}/admin/users/${userId}/block`, { method: 'PUT' }).then(r => r.ok ? r.json() : r.text().then(t => { throw new Error(t || r.statusText) })),

  unblockUser: (userId) =>
    fetch(`${API_BASE_URL}/admin/users/${userId}/unblock`, { method: 'PUT' }).then(r => r.ok ? r.json() : r.text().then(t => { throw new Error(t || r.statusText) })),

  getAdminProperties: () =>
    fetch(`${API_BASE_URL}/admin/properties`).then(r => r.ok ? r.json() : r.text().then(t => { throw new Error(t || r.statusText) })),

  approveProperty: (propertyId) =>
    fetch(`${API_BASE_URL}/admin/properties/${propertyId}/approve`, { method: 'PUT' }).then(r => r.ok ? r.json() : r.text().then(t => { throw new Error(t || r.statusText) })),

  rejectProperty: (propertyId) =>
    fetch(`${API_BASE_URL}/admin/properties/${propertyId}/reject`, { method: 'PUT' }).then(r => r.ok ? r.json() : r.text().then(t => { throw new Error(t || r.statusText) })),

  getCompletedDeals: () =>
    fetch(`${API_BASE_URL}/admin/deals`).then(r => r.ok ? r.json() : r.text().then(t => { throw new Error(t || r.statusText) })),

  getAdminBalance: () =>
    fetch(`${API_BASE_URL}/admin/balance`).then(r => r.ok ? r.json() : r.text().then(t => { throw new Error(t || r.statusText) })),

  getPlatformStats: () =>
    fetch(`${API_BASE_URL}/admin/analytics/stats`).then(r => r.ok ? r.json() : r.text().then(t => { throw new Error(t || r.statusText) })),

  getPlatformGrowth: () =>
    fetch(`${API_BASE_URL}/admin/analytics/growth`).then(r => r.ok ? r.json() : r.text().then(t => { throw new Error(t || r.statusText) })),

  getReportSummary: () =>
    fetch(`${API_BASE_URL}/admin/reports/summary`).then(r => r.ok ? r.json() : r.text().then(t => { throw new Error(t || r.statusText) })),

  rechargeAllUsers: (amount) =>
    fetch(`${API_BASE_URL}/admin/balance/recharge-all?amount=${amount}`, { method: 'PUT' }).then(r => r.ok ? r.json() : r.text().then(t => { throw new Error(t || r.statusText) })),

  // ── Wallet & Transactions ─────────────────────────────────────────
  getWalletBalance: (userId) =>
    fetch(`${API_BASE_URL}/wallet/${userId}/balance`).then(r => r.ok ? r.json() : r.text().then(t => { throw new Error(t || r.statusText) })),

  getTransactionHistory: (userId) =>
    fetch(`${API_BASE_URL}/wallet/${userId}/transactions`).then(r => r.ok ? r.json() : r.text().then(t => { throw new Error(t || r.statusText) })),

  getTransaction: (transactionId) =>
    fetch(`${API_BASE_URL}/wallet/transaction/${transactionId}`).then(r => r.ok ? r.json() : r.text().then(t => { throw new Error(t || r.statusText) })),

  updateTransactionStatus: (transactionId, status) =>
    fetch(`${API_BASE_URL}/wallet/transaction/${transactionId}/status?status=${status}`, {
      method: 'PUT',
    }).then(r => r.ok ? r.json() : r.text().then(t => { throw new Error(t || r.statusText) })),
};
