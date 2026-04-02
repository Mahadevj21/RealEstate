const API_BASE_URL = 'http://localhost:8080';

export const apiService = {
  register: (username, email, password, role) =>
    fetch(`${API_BASE_URL}/auth/register`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password, role }),
    }).then(r => r.json()),

  login: (email, password) =>
    fetch(`${API_BASE_URL}/auth/login`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ email, password }),
    }).then(r => r.json()),

  getProperties: () =>
    fetch(`${API_BASE_URL}/properties`).then(r => r.json()),

  addProperty: (sellerId, title, description, price, location, imageUrl) => {
    console.log('Adding property - imageUrl length:', imageUrl?.length || 0);
    return fetch(`${API_BASE_URL}/properties/add/${sellerId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, price, location, imageUrl }),
    }).then(r => {
      console.log('Add property response status:', r.status);
      if (!r.ok) throw new Error(`Add failed with status ${r.status}`);
      return r.json();
    });
  },

  deleteProperty: async (propertyId) => {
    const response = await fetch(`${API_BASE_URL}/properties/${propertyId}`, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${localStorage.getItem('token')}`
      }
    });
    console.log('Delete response status:', response.status);
    if (!response.ok) {
      const error = await response.text();
      throw new Error(error || `Delete failed with status ${response.status}`);
    }
    // Handle both 204 No Content and 200 OK responses
    if (response.status === 204) {
      return true;
    }
    try {
      return await response.json();
    } catch (e) {
      return true;
    }
  },

  updateProperty: (propertyId, title, description, price, location, imageUrl) => {
    console.log('Updating property - imageUrl length:', imageUrl?.length || 0);
    return fetch(`${API_BASE_URL}/properties/${propertyId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title, description, price, location, imageUrl }),
    }).then(r => {
      console.log('Update property response status:', r.status);
      if (!r.ok) throw new Error(`Update failed with status ${r.status}`);
      return r.json();
    });
  },

  addFavorite: (buyerId, propertyId) =>
    fetch(`${API_BASE_URL}/buyer/${buyerId}/favourites/${propertyId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }).then(r => r.json()),

  getFavorites: (buyerId) =>
    fetch(`${API_BASE_URL}/buyer/${buyerId}/favourites`).then(r => r.json()),

  removeFavorite: (buyerId, propertyId) =>
    fetch(`${API_BASE_URL}/buyer/${buyerId}/favourites/${propertyId}`, { method: 'DELETE' }).then(r => r.json()),

  filterByLocation: (location) =>
    fetch(`${API_BASE_URL}/buyer/filter/location?location=${location}`).then(r => r.json()),

  filterByPrice: (minPrice, maxPrice) =>
    fetch(`${API_BASE_URL}/buyer/filter/price?minPrice=${minPrice}&maxPrice=${maxPrice}`).then(r => r.json()),

  getAvailableProperties: () =>
    fetch(`${API_BASE_URL}/buyer/available`).then(r => r.json()),

  getAllUsers: () =>
    fetch(`${API_BASE_URL}/admin/users`).then(r => r.json()),

  blockUser: (userId) =>
    fetch(`${API_BASE_URL}/admin/users/${userId}/block`, { method: 'PUT' }).then(r => r.json()),

  unblockUser: (userId) =>
    fetch(`${API_BASE_URL}/admin/users/${userId}/unblock`, { method: 'PUT' }).then(r => r.json()),

  // Deal endpoints
  buyProperty: (propertyId, buyerId) =>
    fetch(`${API_BASE_URL}/buyer/buy/${propertyId}/buyer/${buyerId}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }).then(r => r.json()),

  getBuyerBalance: (buyerId) =>
    fetch(`${API_BASE_URL}/buyer/${buyerId}/balance`).then(r => r.json()),

  getSellerBalance: (sellerId) =>
    fetch(`${API_BASE_URL}/seller/${sellerId}/balance`).then(r => r.json()),

  getAdminBalance: () =>
    fetch(`${API_BASE_URL}/admin/balance`).then(r => r.json()),

  getBuyerDeals: (buyerId) =>
    fetch(`${API_BASE_URL}/buyer/${buyerId}/deals`).then(r => r.json()),

  getSellerPendingDeals: (sellerId) =>
    fetch(`${API_BASE_URL}/seller/${sellerId}/pending-deals`).then(r => r.json()),

  acceptDeal: (dealId) =>
    fetch(`${API_BASE_URL}/seller/deals/${dealId}/accept`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }).then(r => r.json()),

  rejectDeal: (dealId) =>
    fetch(`${API_BASE_URL}/seller/deals/${dealId}/reject`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
    }).then(r => r.json()),

  getCompletedDeals: () =>
    fetch(`${API_BASE_URL}/admin/deals`).then(r => r.json()),

  // Wallet and Transaction endpoints
  getWalletBalance: (userId) =>
    fetch(`${API_BASE_URL}/wallet/${userId}/balance`).then(r => r.json()),

  getTransactionHistory: (userId) =>
    fetch(`${API_BASE_URL}/wallet/${userId}/transactions`).then(r => r.json()),

  getTransaction: (transactionId) =>
    fetch(`${API_BASE_URL}/wallet/transaction/${transactionId}`).then(r => r.json()),

  // Seller properties
  getSellerProperties: (sellerId) =>
    fetch(`${API_BASE_URL}/seller/${sellerId}/properties`).then(r => r.json()),

  // Profile endpoints
  updateProfile: (userId, username, email, password) =>
    fetch(`${API_BASE_URL}/auth/profile/${userId}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ username, email, password })
    }).then(r => {
      if (!r.ok) throw new Error('Failed to update profile');
      return r.json();
    }),
};
