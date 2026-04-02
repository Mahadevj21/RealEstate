import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/apiService';
import '../styles/Dashboard.css';

export const BuyerDashboard = () => {
  const { user } = useAuth();
  const [properties, setProperties] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');
  const [bedrooms, setBedrooms] = useState('');
  const [bathrooms, setBathrooms] = useState('');
  const [propertyType, setPropertyType] = useState('');
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState(0);
  const [showBuyDialog, setShowBuyDialog] = useState(false);
  const [buyingProperty, setBuyingProperty] = useState(null);
  const [activeTab, setActiveTab] = useState('properties');
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  useEffect(() => {
    loadProperties();
    loadFavorites();
    loadBalance();
  }, []);

  const loadFavorites = async () => {
    if (!user) return;
    try {
      const fav = await apiService.getFavorites(user.id);
      // API returns Property objects directly, not Favourite objects
      setFavorites(Array.isArray(fav) ? fav.map(f => f.id) : []);
    } catch (err) {
      console.error('Failed to load favorites', err);
    }
  };

  const loadTransactions = async () => {
    if (!user) return;
    try {
      const txData = await apiService.getTransactionHistory(user.id);
      setTransactions(Array.isArray(txData) ? [...txData].reverse() : []);
    } catch (err) {
      console.error('Failed to load transactions:', err);
    }
  };

  const loadProperties = async () => {
    try {
      const data = await apiService.getAvailableProperties();
      setProperties(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load properties');
    }
  };

  const loadBalance = async () => {
    if (!user) return;
    try {
      const data = await apiService.getBuyerBalance(user.id);
      setBalance(data.balance);
    } catch (err) {
      console.error('Failed to load balance');
    }
  };

  const handleBuyClick = (property) => {
    setBuyingProperty(property);
    setShowBuyDialog(true);
  };

  const handleConfirmBuy = async () => {
    if (!user || !buyingProperty) return;
    try {
      setLoading(true);
      const result = await apiService.buyProperty(buyingProperty.id, user.id);
      setMessage('✓ Buy request sent to seller! Waiting for seller approval.');
      setShowBuyDialog(false);
      setBuyingProperty(null);
      setTimeout(() => setMessage(''), 5000);
      // Reload properties to reflect sold status
      loadProperties();
    } catch (err) {
      setMessage('✗ ' + (err.message || 'Failed to send buy request'));
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      // Start with all properties
      let filtered = properties;

      // Text search
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(p =>
          p.title.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query) ||
          p.location.toLowerCase().includes(query)
        );
      }

      // Price range filter
      if (minPrice) {
        filtered = filtered.filter(p => p.price >= parseInt(minPrice));
      }
      if (maxPrice) {
        filtered = filtered.filter(p => p.price <= parseInt(maxPrice));
      }

      // Advanced filters (if backend provides these fields)
      if (bedrooms) {
        filtered = filtered.filter(p => p.bedrooms && p.bedrooms.toString() === bedrooms);
      }
      if (bathrooms) {
        filtered = filtered.filter(p => p.bathrooms && p.bathrooms.toString() === bathrooms);
      }
      if (propertyType) {
        filtered = filtered.filter(p => p.type && p.type.toLowerCase() === propertyType.toLowerCase());
      }

      setProperties(filtered);
      setMessage(`✓ Found ${filtered.length} properties`);
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('✗ Filter failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResetFilters = () => {
    setSearchQuery('');
    setMinPrice('');
    setMaxPrice('');
    setBedrooms('');
    setBathrooms('');
    setPropertyType('');
    loadProperties();
  };

  const handleAddFavorite = async (propertyId) => {
    if (!user) return;
    try {
      setLoading(true);
      await apiService.addFavorite(user.id, propertyId);
      setFavorites([...favorites, propertyId]);
      setMessage('✓ Added to favorites');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('✗ Failed to add favorite');
    } finally {
      setLoading(false);
    }
  };

  const handleRemoveFavorite = async (propertyId) => {
    if (!user) return;
    try {
      setLoading(true);
      await apiService.removeFavorite(user.id, propertyId);
      setFavorites(favorites.filter(id => id !== propertyId));
      setMessage('✓ Removed from favorites');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('✗ Failed to remove favorite');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-content">
      <div className="dashboard-header-row">
        <h2>Buyer Dashboard</h2>
        <div className="balance-badge">
          💰 {balance.toLocaleString()}
        </div>
      </div>
      {message && <p className="message">{message}</p>}

      <div className="admin-tabs">
        <button
          className={`tab-btn ${activeTab === 'properties' ? 'active' : ''}`}
          onClick={() => { setActiveTab('properties'); }}
        >
          🏠 Properties
        </button>
        <button
          className={`tab-btn ${activeTab === 'favorites' ? 'active' : ''}`}
          onClick={() => { setActiveTab('favorites'); }}
        >
          ❤ My Favorites
        </button>
        <button
          className={`tab-btn ${activeTab === 'wallet' ? 'active' : ''}`}
          onClick={() => { setActiveTab('wallet'); loadTransactions(); }}
        >
          💳 Wallet
        </button>
      </div>

      {activeTab === 'properties' && (
        <div>
          {/* Search Bar */}
          <div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginBottom: '16px' }}>
            <input
              type="text"
              placeholder="🔍 Search properties by title, location, description..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{
                flex: 1,
                padding: '12px 16px',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                backgroundColor: 'var(--surface-3)',
                color: 'var(--text-main)',
                fontSize: '0.95rem'
              }}
            />
            <button 
              type="button"
              onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              style={{
                padding: '12px 16px',
                backgroundColor: showAdvancedFilters ? 'var(--primary)' : 'var(--surface-3)',
                color: showAdvancedFilters ? 'white' : 'var(--text-main)',
                border: '1px solid var(--border)',
                borderRadius: '8px',
                cursor: 'pointer',
                fontWeight: '600',
                fontSize: '0.9rem',
                transition: 'all 0.3s ease',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}
            >
              ⚙️ {showAdvancedFilters ? 'Hide' : 'Filters'}
            </button>
          </div>

          {/* Advanced Filters - Inline Layout */}
          {showAdvancedFilters && (
            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))',
              gap: '12px',
              marginBottom: '16px',
              padding: '0'
            }}>
              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '6px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Min Price</label>
                <input
                  type="number"
                  placeholder="Min"
                  value={minPrice}
                  onChange={(e) => setMinPrice(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    backgroundColor: 'var(--surface-3)',
                    color: 'var(--text-main)',
                    fontSize: '0.9rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '6px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Max Price</label>
                <input
                  type="number"
                  placeholder="Max"
                  value={maxPrice}
                  onChange={(e) => setMaxPrice(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    backgroundColor: 'var(--surface-3)',
                    color: 'var(--text-main)',
                    fontSize: '0.9rem',
                    boxSizing: 'border-box'
                  }}
                />
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '6px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Bedrooms</label>
                <select
                  value={bedrooms}
                  onChange={(e) => setBedrooms(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    backgroundColor: 'var(--surface-3)',
                    color: 'var(--text-main)',
                    fontSize: '0.9rem',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="">Any</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3</option>
                  <option value="4">4+</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '6px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Bathrooms</label>
                <select
                  value={bathrooms}
                  onChange={(e) => setBathrooms(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    backgroundColor: 'var(--surface-3)',
                    color: 'var(--text-main)',
                    fontSize: '0.9rem',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="">Any</option>
                  <option value="1">1</option>
                  <option value="2">2</option>
                  <option value="3">3+</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '6px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Property Type</label>
                <select
                  value={propertyType}
                  onChange={(e) => setPropertyType(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    backgroundColor: 'var(--surface-3)',
                    color: 'var(--text-main)',
                    fontSize: '0.9rem',
                    boxSizing: 'border-box'
                  }}
                >
                  <option value="">Any</option>
                  <option value="apartment">Apartment</option>
                  <option value="house">House</option>
                  <option value="villa">Villa</option>
                  <option value="townhouse">Townhouse</option>
                </select>
              </div>

              <div>
                <label style={{ display: 'block', fontSize: '0.8rem', fontWeight: '600', marginBottom: '6px', color: 'var(--text-muted)', textTransform: 'uppercase' }}>Action</label>
                <button
                  type="button"
                  onClick={handleResetFilters}
                  style={{
                    width: '100%',
                    padding: '10px 12px',
                    backgroundColor: 'var(--surface-3)',
                    border: '1px solid var(--border)',
                    borderRadius: '6px',
                    color: 'var(--text-muted)',
                    cursor: 'pointer',
                    fontSize: '0.9rem',
                    fontWeight: '600',
                    transition: 'all 0.3s ease'
                  }}
                >
                  ↻ Reset
                </button>
              </div>
            </div>
          )}

          {/* Search Button - Only shows when filters visible */}
          {showAdvancedFilters && (
            <button 
              onClick={handleFilter}
              disabled={loading}
              style={{
                width: '100%',
                padding: '12px 24px',
                backgroundColor: 'var(--primary)',
                color: 'white',
                border: 'none',
                borderRadius: '8px',
                cursor: loading ? 'not-allowed' : 'pointer',
                fontWeight: '600',
                fontSize: '0.95rem',
                marginBottom: '24px',
                transition: 'all 0.3s ease'
              }}
            >
              {loading ? '🔎 Searching...' : '🔎 Apply Filters'}
            </button>
          )}
          <h3 style={{ marginBottom: '16px' }}>Available Properties ({properties.length})</h3>
          <div className="properties-grid">
            {properties.length === 0 ? (
              <p>No properties found</p>
            ) : (
              properties.map(prop => (
                <div key={prop.id} className="property-card" onClick={() => setSelectedProperty(prop)} style={{ cursor: 'pointer' }}>
                  {prop.imageUrl && (
                    <img src={prop.imageUrl} alt={prop.title} className="property-image" />
                  )}
                  <h4>{prop.title}</h4>
                  <p>{prop.description}</p>
                  <p><strong>₹ {prop.price.toLocaleString()}</strong> - {prop.location}</p>
                  <p style={{ display: 'flex', gap: '15px', color: '#666', fontSize: '0.9em', margin: '5px 0' }}>
                    <span>🛏️ {prop.bedrooms || 0} Beds</span>
                    <span>🛁 {prop.bathrooms || 0} Baths</span>
                    <span style={{ textTransform: 'capitalize' }}>🏠 {prop.type || 'N/A'}</span>
                  </p>
                  <p style={{ color: prop.sold ? 'red' : 'green', fontWeight: 'bold' }}>
                    {prop.sold ? '❌ SOLD' : '✓ Available'}
                  </p>
                  <div className="card-actions">
                    {!prop.sold && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleBuyClick(prop); }}
                        className="btn-buy"
                        disabled={loading || balance < (prop.price + 100)}
                        style={{
                          backgroundColor: balance < (prop.price + 100) ? '#ccc' : '#ff6b6b',
                          color: 'white',
                          padding: '8px 12px',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: balance < (prop.price + 100) ? 'not-allowed' : 'pointer',
                          marginRight: '5px'
                        }}
                      >
                        🛒 Buy (₹{(prop.price + 100).toLocaleString()})
                      </button>
                    )}
                    {favorites.includes(prop.id) ? (
                      <button onClick={(e) => { e.stopPropagation(); handleRemoveFavorite(prop.id); }} className="btn-fav-active">
                        ❤ Favorited
                      </button>
                    ) : (
                      <button onClick={(e) => { e.stopPropagation(); handleAddFavorite(prop.id); }} className="btn-fav">
                        ♡ Add to Favorites
                      </button>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'favorites' && (
        <div className="favorites-section">
          <h3 style={{ marginBottom: '16px' }}>My Favorites ({favorites.length})</h3>
          <div className="properties-grid">
              {properties.filter(p => favorites.includes(p.id) && !p.sold).length === 0 ? (
                <p>No available favorites</p>
            ) : (
              properties.filter(p => favorites.includes(p.id)).map(prop => (
                <div key={prop.id} className="property-card" onClick={() => setSelectedProperty(prop)} style={{ cursor: 'pointer' }}>
                  {prop.imageUrl && (
                    <img src={prop.imageUrl} alt={prop.title} className="property-image" />
                  )}
                  <h4>{prop.title}</h4>
                  <p>{prop.location}</p>
                  <p><strong>₹ {prop.price.toLocaleString()}</strong></p>
                  <p style={{ display: 'flex', gap: '15px', color: '#666', fontSize: '0.9em', margin: '5px 0' }}>
                    <span>🛏️ {prop.bedrooms || 0} Beds</span>
                    <span>🛁 {prop.bathrooms || 0} Baths</span>
                    <span style={{ textTransform: 'capitalize' }}>🏠 {prop.type || 'N/A'}</span>
                  </p>
                  <div className="card-actions">
                    {!prop.sold && (
                      <button
                        onClick={(e) => { e.stopPropagation(); handleBuyClick(prop); }}
                        className="btn-buy"
                        disabled={loading || balance < (prop.price + 100)}
                        style={{
                          backgroundColor: balance < (prop.price + 100) ? '#ccc' : '#ff6b6b',
                          color: 'white',
                          padding: '8px 12px',
                          border: 'none',
                          borderRadius: '4px',
                          cursor: balance < (prop.price + 100) ? 'not-allowed' : 'pointer',
                          marginRight: '5px'
                        }}
                      >
                        🛒 Buy (₹{(prop.price + 100).toLocaleString()})
                      </button>
                    )}
                    <button onClick={(e) => { e.stopPropagation(); handleRemoveFavorite(prop.id); }} className="btn-fav-active">
                      ❤ Remove
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'wallet' && (
        <div className="wallet-section">
          <h3>My Wallet & Transaction History</h3>
          <div className="balance-display">
            <h4>Current Balance</h4>
            <p>₹{balance.toLocaleString()}</p>
          </div>

          <h4>Transaction History</h4>
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Transaction ID</th>
                  <th>Type</th>
                  <th>Amount</th>
                  <th>Description</th>
                  <th>Date & Time</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length === 0 ? (
                  <tr>
                    <td colSpan="5" style={{ textAlign: 'center' }}>No transactions yet</td>
                  </tr>
                ) : (
                  transactions.map(tx => (
                    <tr key={tx.id}>
                      <td>{tx.id}</td>
                      <td>
                        <span style={{
                          padding: '4px 8px',
                          borderRadius: '4px',
                          backgroundColor: tx.type === 'CREDIT' ? '#2e7d32' : '#ffcdd2',
                          color: 'white',
                          fontWeight: 'bold'
                        }}>
                          {tx.type === 'CREDIT' ? '+ ' : '- '}₹{tx.amount}
                        </span>
                      </td>
                      <td style={{ fontWeight: 'bold', color: tx.type === 'CREDIT' ? '#4CAF50' : '#f44336' }}>
                        ₹{tx.amount}
                      </td>
                      <td>{tx.description}</td>
                      <td>{new Date(tx.timestamp).toLocaleString()}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {selectedProperty && (
        <div className="fullscreen-detail-view">
          <button className="fullscreen-close" onClick={() => setSelectedProperty(null)}>← Back</button>
          <div className="fullscreen-content">
            {selectedProperty.imageUrl && (
              <img src={selectedProperty.imageUrl} alt={selectedProperty.title} className="fullscreen-image" />
            )}
            <div className="fullscreen-info">
              <h1>{selectedProperty.title}</h1>
              <p className="fullscreen-price">₹ {selectedProperty.price.toLocaleString()}</p>
              <p className="fullscreen-location">📍 {selectedProperty.location}</p>
              <p className="fullscreen-location">🛏️ {selectedProperty.bedrooms || 0} Beds | 🛁 {selectedProperty.bathrooms || 0} Baths | <span style={{ textTransform: 'capitalize' }}>🏠 {selectedProperty.type || 'N/A'}</span></p>
              <p className="fullscreen-seller">👤 Seller: {selectedProperty.seller?.username}</p>
              <p className="fullscreen-status">{selectedProperty.sold ? '❌ Sold' : '✓ Available for Sale'}</p>

              <div className="fullscreen-description">
                <h2>Description</h2>
                <p>{selectedProperty.description}</p>
              </div>

              <div className="fullscreen-actions">
                {!selectedProperty.sold && (
                  <button
                    onClick={() => { handleBuyClick(selectedProperty); }}
                    disabled={loading || balance < (selectedProperty.price + 100)}
                    style={{
                      backgroundColor: balance < (selectedProperty.price + 100) ? '#ccc' : '#ff6b6b',
                      color: 'white',
                      padding: '10px 20px',
                      border: 'none',
                      borderRadius: '4px',
                      cursor: balance < (selectedProperty.price + 100) ? 'not-allowed' : 'pointer',
                      fontSize: '16px',
                      marginRight: '10px'
                    }}
                  >
                    🛒 Buy Now (₹{(selectedProperty.price + 100).toLocaleString()})
                  </button>
                )}
                {favorites.includes(selectedProperty.id) ? (
                  <button onClick={() => handleRemoveFavorite(selectedProperty.id)} className="btn-detail-fav-active" disabled={loading}>
                    ❤ Remove from Favorites
                  </button>
                ) : (
                  <button onClick={() => handleAddFavorite(selectedProperty.id)} className="btn-detail-fav" disabled={loading}>
                    ♡ Add to Favorites
                  </button>
                )}
              </div>
            </div>
          </div>
        </div>
      )}

      {showBuyDialog && buyingProperty && (
        <div className="modal-overlay">
          <div className="modal-card" style={{ maxWidth: '500px', textAlign: 'left' }}>
            {buyingProperty.imageUrl && (
              <img
                src={buyingProperty.imageUrl}
                alt={buyingProperty.title}
                style={{
                  width: '100%',
                  height: '200px',
                  objectFit: 'cover',
                  borderRadius: '8px',
                  marginBottom: '20px',
                  display: 'block'
                }}
              />
            )}
            <h2>Confirm Purchase</h2>
            <p>Property: <strong>{buyingProperty.title}</strong></p>
            <p>Location: <strong>{buyingProperty.location}</strong></p>
            <p style={{ fontSize: '1.5rem', color: 'var(--primary)', fontWeight: '900', margin: '20px 0' }}>
              Cost: ₹{(buyingProperty.price + 100).toLocaleString()}
            </p>
            <p style={{ fontSize: '0.9rem' }}>
              Tax & Brokerage: ₹100 | Your Balance: ₹{balance.toLocaleString()}
            </p>

            {balance < (buyingProperty.price + 100) && (
              <p style={{ color: 'var(--accent)', fontSize: '0.9rem', marginTop: '10px' }}>
                ⚠️ Insufficient balance for this transaction.
              </p>
            )}

            <div style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button
                onClick={() => setShowBuyDialog(false)}
                className="btn-fav"
                style={{ flex: 1, padding: '12px', fontSize: '0.95rem' }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmBuy}
                disabled={loading || balance < (buyingProperty.price + 100)}
                className="btn-buy"
                style={{ flex: 1, padding: '12px', fontSize: '0.95rem' }}
              >
                {loading ? 'Processing...' : 'Confirm'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
