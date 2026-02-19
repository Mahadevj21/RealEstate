import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/apiService';
import '../styles/Dashboard.css';

export const BuyerDashboard = () => {
  const { user } = useAuth();
  const [properties, setProperties] = useState([]);
  const [favorites, setFavorites] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [filterType, setFilterType] = useState('all');
  const [filterValue, setFilterValue] = useState('');
  const [selectedProperty, setSelectedProperty] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [balance, setBalance] = useState(0);
  const [showBuyDialog, setShowBuyDialog] = useState(false);
  const [buyingProperty, setBuyingProperty] = useState(null);
  const [activeTab, setActiveTab] = useState('properties');

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
      setTransactions(Array.isArray(txData) ? txData : []);
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
      let data;
      if (filterType === 'location') {
        data = await apiService.filterByLocation(filterValue);
      } else if (filterType === 'price') {
        const [min, max] = filterValue.split('-');
        data = await apiService.filterByPrice(parseInt(min), parseInt(max));
      } else {
        data = await apiService.getAvailableProperties();
      }
      setProperties(Array.isArray(data) ? data : []);
      setMessage('✓ Filter applied');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('✗ Filter failed');
    } finally {
      setLoading(false);
    }
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Buyer Dashboard</h2>
        <div style={{ fontSize: '18px', fontWeight: 'bold', padding: '10px 15px', backgroundColor: '#e8f5e9', borderRadius: '5px' }}>
          💰 Balance: {balance}
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
          <form onSubmit={handleFilter} className="filter-form">
            <select value={filterType} onChange={(e) => setFilterType(e.target.value)}>
              <option value="all">All Properties</option>
              <option value="location">Search by Location</option>
              <option value="price">Search by Price (min-max)</option>
            </select>

            {filterType === 'location' && (
              <input
                type="text"
                placeholder="Enter location"
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
              />
            )}

            {filterType === 'price' && (
              <input
                type="text"
                placeholder="e.g., 100000-500000"
                value={filterValue}
                onChange={(e) => setFilterValue(e.target.value)}
              />
            )}

            <button type="submit" disabled={loading}>{loading ? 'Filtering...' : 'Apply Filter'}</button>
          </form>
          <div className="properties-grid">
            <h3>Available Properties ({properties.length})</h3>
            {properties.length === 0 ? (
              <p>No properties found</p>
            ) : (
              properties.map(prop => (
                <div key={prop.id} className="property-card" onClick={() => setSelectedProperty(prop)} style={{cursor: 'pointer'}}>
                  {prop.imageUrl && (
                    <img src={prop.imageUrl} alt={prop.title} className="property-image" />
                  )}
                  <h4>{prop.title}</h4>
                  <p>{prop.description}</p>
                  <p><strong>₹ {prop.price.toLocaleString()}</strong> - {prop.location}</p>
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
          <h3>My Favorites ({favorites.length})</h3>
          <div className="properties-grid">
            {properties.filter(p => favorites.includes(p.id)).length === 0 ? (
              <p>No favorites yet</p>
            ) : (
              properties.filter(p => favorites.includes(p.id)).map(prop => (
                <div key={prop.id} className="property-card" onClick={() => setSelectedProperty(prop)} style={{cursor: 'pointer'}}>
                  {prop.imageUrl && (
                    <img src={prop.imageUrl} alt={prop.title} className="property-image" />
                  )}
                  <h4>{prop.title}</h4>
                  <p>{prop.location}</p>
                  <p><strong>₹ {prop.price.toLocaleString()}</strong></p>
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
          <div style={{ backgroundColor: '#f5f5f5', padding: '20px', borderRadius: '8px', marginBottom: '20px' }}>
            <h4>Current Balance</h4>
            <p style={{ fontSize: '32px', fontWeight: 'bold', color: '#4CAF50' }}>₹{balance.toLocaleString()}</p>
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
                          backgroundColor: tx.type === 'CREDIT' ? '#c8e6c9' : '#ffcdd2',
                          color: tx.type === 'CREDIT' ? '#2e7d32' : '#c62828'
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
        <div className="fullscreen-detail-view" style={{ backgroundColor: 'rgba(0,0,0,0.7)' }}>
          <div style={{
            backgroundColor: 'white',
            padding: '30px',
            borderRadius: '10px',
            textAlign: 'center',
            maxWidth: '400px',
            margin: '100px auto'
          }}>
            <h2>Confirm Purchase</h2>
            <p style={{ fontSize: '16px', marginBottom: '15px' }}>
              Property: <strong>{buyingProperty.title}</strong>
            </p>
            <p style={{ fontSize: '16px', marginBottom: '15px' }}>
              Location: <strong>{buyingProperty.location}</strong>
            </p>
            <p style={{ fontSize: '18px', color: '#ff6b6b', fontWeight: 'bold', marginBottom: '15px' }}>
              Cost: ₹{(buyingProperty.price + 100).toLocaleString()} (₹{buyingProperty.price.toLocaleString()} + ₹100 brokerage)
            </p>
            <p style={{ fontSize: '16px', marginBottom: '20px' }}>
              Current Balance: <strong>{balance}</strong>
            </p>
            {balance < (buyingProperty.price + 100) && (
              <p style={{ color: 'red', fontSize: '14px', marginBottom: '15px' }}>
                ❌ Insufficient balance. You need ₹{(buyingProperty.price + 100).toLocaleString()} credits.
              </p>
            )}
            <div style={{ display: 'flex', gap: '10px', justifyContent: 'center' }}>
              <button
                onClick={() => setShowBuyDialog(false)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: '#ddd',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                Cancel
              </button>
              <button
                onClick={handleConfirmBuy}
                disabled={loading || balance < (buyingProperty.price + 100)}
                style={{
                  padding: '10px 20px',
                  backgroundColor: balance < (buyingProperty.price + 100) ? '#ccc' : '#4CAF50',
                  color: 'white',
                  border: 'none',
                  borderRadius: '4px',
                  cursor: balance < (buyingProperty.price + 100) ? 'not-allowed' : 'pointer'
                }}
              >
                {loading ? 'Processing...' : 'Confirm Purchase'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
