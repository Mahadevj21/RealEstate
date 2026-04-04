import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/apiService';
import { MapContainer, TileLayer, Marker, Popup } from 'react-leaflet';
import L from 'leaflet';
import '../styles/Dashboard.css';

const cityCoordinates = {
  mumbai: [19.0760, 72.8777],
  delhi: [28.7041, 77.1025],
  bangalore: [12.9716, 77.5946],
  chennai: [13.0827, 80.2707],
  kochi: [9.9312, 76.2673],
  pune: [18.5204, 73.8567],
  hyderabad: [17.3850, 78.4867],
  kolkata: [22.5726, 88.3639],
  ahmedabad: [23.0225, 72.5714]
};

const getPropertyLocation = (prop) => {
  const locStr = (prop.location || '').toLowerCase();
  for (const city in cityCoordinates) {
    if (locStr.includes(city)) {
      return [
        cityCoordinates[city][0] + (Math.random() - 0.5) * 0.05,
        cityCoordinates[city][1] + (Math.random() - 0.5) * 0.05
      ];
    }
  }
  return [21.1458 + (prop.id % 10) * 0.5, 79.0882 + (prop.id % 5) * 0.5];
};

const createPriceIcon = (price) => {
  return L.divIcon({
    className: 'custom-price-pin',
    html: `<div style="background:var(--grad-aurora);color:white;padding:6px 12px;border-radius:20px;font-weight:700;white-space:nowrap;box-shadow:0 4px 6px rgba(0,0,0,0.3); font-size: 0.85rem; border: 2px solid white;">₹${(price/100000).toFixed(1)}L</div>`,
    iconAnchor: [30, 15] 
  });
};

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
  const [viewMode, setViewMode] = useState('grid');

  useEffect(() => {
    loadProperties();
    loadFavorites();
    loadBalance();
  }, []);

  const loadFavorites = async () => {
    if (!user) return;
    try {
      const fav = await apiService.getFavorites(user.id);
      setFavorites(Array.isArray(fav) ? fav.map(f => f.id) : []);
    } catch (err) {
      console.error('Favorites fetch error', err);
    }
  };

  const loadTransactions = async () => {
    if (!user) return;
    try {
      const txData = await apiService.getTransactionHistory(user.id);
      setTransactions(Array.isArray(txData) ? [...txData].reverse() : []);
    } catch (err) {
      console.error('Transactions fetch error', err);
    }
  };

  const loadProperties = async () => {
    try {
      const data = await apiService.getAvailableProperties();
      setProperties(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Properties fetch error', err);
    }
  };

  const loadBalance = async () => {
    if (!user) return;
    try {
      const data = await apiService.getBuyerBalance(user.id);
      setBalance(data.balance);
    } catch (err) {
      console.error('Balance fetch error', err);
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
      await apiService.buyProperty(buyingProperty.id, user.id);
      setMessage('✓ Request sent! Waiting for approval.');
      setShowBuyDialog(false);
      setBuyingProperty(null);
      setTimeout(() => setMessage(''), 5000);
      loadProperties();
    } catch (err) {
      setMessage('✗ ' + (err.message || 'Action failed'));
    } finally {
      setLoading(false);
    }
  };

  const handleFilter = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let filtered = properties;
      if (searchQuery.trim()) {
        const query = searchQuery.toLowerCase();
        filtered = filtered.filter(p =>
          p.title.toLowerCase().includes(query) ||
          p.description.toLowerCase().includes(query) ||
          p.location.toLowerCase().includes(query)
        );
      }
      if (minPrice) filtered = filtered.filter(p => p.price >= parseInt(minPrice));
      if (maxPrice) filtered = filtered.filter(p => p.price <= parseInt(maxPrice));
      if (bedrooms) filtered = filtered.filter(p => p.bedrooms && p.bedrooms.toString() === bedrooms);
      if (bathrooms) filtered = filtered.filter(p => p.bathrooms && p.bathrooms.toString() === bathrooms);
      if (propertyType) filtered = filtered.filter(p => p.type && p.type.toLowerCase() === propertyType.toLowerCase());

      setProperties(filtered);
      setMessage(`✓ Found ${filtered.length} properties`);
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('✗ Filter error');
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
      setMessage('✗ Action failed');
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
      setMessage('✗ Action failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-content">
      <div className="dashboard-header-row">
        <h2>Buyer Dashboard</h2>
        <div className="balance-badge">💰 {balance.toLocaleString()}</div>
      </div>
      {message && <p className="message">{message}</p>}

      <div className="admin-tabs">
        <button className={`tab-btn ${activeTab === 'properties' ? 'active' : ''}`} onClick={() => setActiveTab('properties')}>🏠 Properties</button>
        <button className={`tab-btn ${activeTab === 'favorites' ? 'active' : ''}`} onClick={() => setActiveTab('favorites')}>❤ My Favorites</button>
        <button className={`tab-btn ${activeTab === 'wallet' ? 'active' : ''}`} onClick={() => { setActiveTab('wallet'); loadTransactions(); }}>💳 Wallet</button>
      </div>

      {activeTab === 'properties' && (
        <div className="section-container">
          <div className="search-bar-row" style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            <input
              type="text"
              placeholder="Search properties..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="search-input"
              style={{ flex: 1, padding: '12px', borderRadius: '8px', border: '1px solid var(--border)' }}
            />
            <button
               className="filter-toggle-btn"
               onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
               style={{ padding: '12px', borderRadius: '8px', border: '1px solid var(--border)', background: showAdvancedFilters ? 'var(--primary)' : 'var(--surface-3)', color: showAdvancedFilters ? 'white' : 'var(--text-main)' }}
            >
              ⚙️ {showAdvancedFilters ? 'Hide' : 'Filters'}
            </button>
          </div>

          {showAdvancedFilters && (
            <div className="filters-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '12px', marginBottom: '16px' }}>
              <input type="number" placeholder="Min Price" value={minPrice} onChange={(e) => setMinPrice(e.target.value)} style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border)' }} />
              <input type="number" placeholder="Max Price" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border)' }} />
              <select value={bedrooms} onChange={(e) => setBedrooms(e.target.value)} style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border)' }}>
                <option value="">Bedrooms: Any</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3</option>
                <option value="4">4+</option>
              </select>
              <select value={bathrooms} onChange={(e) => setBathrooms(e.target.value)} style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border)' }}>
                <option value="">Bathrooms: Any</option>
                <option value="1">1</option>
                <option value="2">2</option>
                <option value="3">3+</option>
              </select>
              <select value={propertyType} onChange={(e) => setPropertyType(e.target.value)} style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border)' }}>
                <option value="">Type: Any</option>
                <option value="apartment">Apartment</option>
                <option value="house">House</option>
                <option value="villa">Villa</option>
                <option value="townhouse">Townhouse</option>
              </select>
              <button onClick={handleResetFilters} style={{ padding: '10px', borderRadius: '6px', border: '1px solid var(--border)', cursor: 'pointer' }}>↻ Reset</button>
              <button onClick={handleFilter} className="apply-filters-btn" style={{ gridColumn: '1 / -1', padding: '12px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px' }}>Apply Filters</button>
            </div>
          )}

          <div className="view-mode-row" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
            <h3 style={{ margin: 0 }}>Discover Properties ({properties.length})</h3>
            <div className="view-controls" style={{ background: 'var(--surface-2)', padding: '4px', borderRadius: '8px' }}>
              <button onClick={() => setViewMode('grid')} style={{ padding: '6px 12px', border: 'none', background: viewMode === 'grid' ? 'var(--primary)' : 'transparent', color: viewMode === 'grid' ? 'white' : 'var(--text-main)', borderRadius: '4px' }}>Grid</button>
              <button onClick={() => setViewMode('map')} style={{ padding: '6px 12px', border: 'none', background: viewMode === 'map' ? 'var(--primary)' : 'transparent', color: viewMode === 'map' ? 'white' : 'var(--text-main)', borderRadius: '4px' }}>Map</button>
            </div>
          </div>

          {viewMode === 'map' ? (
            <div className="map-view-container" style={{ height: '500px', borderRadius: '12px', overflow: 'hidden', border: '1px solid var(--border)' }}>
              <MapContainer center={[20.5937, 78.9629]} zoom={5} style={{ height: '100%', width: '100%' }}>
                <TileLayer url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png" attribution='&copy; OpenStreetMap contributors' />
                {properties.map(prop => (
                  <Marker key={prop.id} position={getPropertyLocation(prop)} icon={createPriceIcon(prop.price)}>
                    <Popup>
                      <div className="popup-card" onClick={() => setSelectedProperty(prop)} style={{ cursor: 'pointer' }}>
                        <h4 style={{ margin: '0' }}>{prop.title}</h4>
                        <p style={{ margin: '4px 0', fontWeight: 'bold', color: 'var(--primary)' }}>₹ {prop.price.toLocaleString()}</p>
                        <button className="view-details-btn" style={{ width: '100%', padding: '6px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '4px' }}>View Details</button>
                      </div>
                    </Popup>
                  </Marker>
                ))}
              </MapContainer>
            </div>
          ) : (
            <div className="properties-grid">
              {properties.map(prop => (
                <div key={prop.id} className="property-card" onClick={() => setSelectedProperty(prop)}>
                  {prop.imageUrl && <img src={prop.imageUrl} alt={prop.title} className="property-image" />}
                  <div className="card-body">
                    <h4>{prop.title}</h4>
                    <p className="price-tag">₹ {prop.price.toLocaleString()} — {prop.location}</p>
                    <div className="specs row">🛏️ {prop.bedrooms || 0} Beds • 🛁 {prop.bathrooms || 0} Baths</div>
                    <div className="card-footer-btns" style={{ marginTop: '12px', display: 'flex', gap: '8px' }}>
                      {!prop.sold && (
                        <button onClick={(e) => { e.stopPropagation(); handleBuyClick(prop); }} disabled={balance < (prop.price + 100)} className="buy-btn-small" style={{ flex: 1, padding: '8px', background: '#ff6767', color: 'white', border: 'none', borderRadius: '4px' }}>Buy</button>
                      )}
                      <button onClick={(e) => { e.stopPropagation(); favorites.includes(prop.id) ? handleRemoveFavorite(prop.id) : handleAddFavorite(prop.id); }} className="fav-btn-toggle" style={{ padding: '8px' }}>{favorites.includes(prop.id) ? '❤️' : '🤍'}</button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      {activeTab === 'favorites' && (
        <div className="favorites-grid properties-grid">
           {properties.filter(p => favorites.includes(p.id)).length === 0 ? <p>No favorites saved yet.</p> :
            properties.filter(p => favorites.includes(p.id)).map(prop => (
              <div key={prop.id} className="property-card" onClick={() => setSelectedProperty(prop)}>
                {prop.imageUrl && <img src={prop.imageUrl} alt={prop.title} className="property-image" />}
                <h4>{prop.title}</h4>
                <p>₹ {prop.price.toLocaleString()}</p>
                <button onClick={(e) => { e.stopPropagation(); handleRemoveFavorite(prop.id); }}>Remove</button>
              </div>
            ))
           }
        </div>
      )}

      {activeTab === 'wallet' && (
        <div className="wallet-area">
          <div className="wallet-header-card" style={{ background: 'var(--surface-2)', padding: '24px', borderRadius: '12px', textAlign: 'center', marginBottom: '24px' }}>
            <h3 style={{ margin: 0, color: 'var(--text-muted)' }}>Wallet Balance</h3>
            <p style={{ fontSize: '2.5rem', fontWeight: 'bold', margin: '8px 0' }}>₹{balance.toLocaleString()}</p>
          </div>
          <table className="admin-table">
            <thead>
              <tr><th>Transaction</th><th>Type</th><th>Amount</th><th>Date</th></tr>
            </thead>
            <tbody>
              {transactions.map(tx => (
                <tr key={tx.id}>
                  <td>{tx.description}</td>
                  <td>{tx.type}</td>
                  <td style={{ color: tx.type === 'CREDIT' ? '#4caf50' : '#f44336' }}>₹{tx.amount}</td>
                  <td>{new Date(tx.timestamp).toLocaleDateString()}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {selectedProperty && (
        <div className="fullscreen-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'var(--bg-main)', zIndex: 1000, overflowY: 'auto', padding: '24px' }}>
          <button onClick={() => setSelectedProperty(null)} style={{ marginBottom: '20px', padding: '10px 20px', cursor: 'pointer' }}>← Back to Dashboard</button>
          <div className="detail-container" style={{ display: 'grid', gridTemplateColumns: 'minmax(300px, 1fr) 1fr', gap: '32px' }}>
            <img src={selectedProperty.imageUrl} alt={selectedProperty.title} style={{ width: '100%', borderRadius: '12px' }} />
            <div className="detail-info">
              <h1>{selectedProperty.title}</h1>
              <p style={{ fontSize: '1.5rem', color: 'var(--primary)', fontWeight: 'bold' }}>₹ {selectedProperty.price.toLocaleString()}</p>
              <p>📍 {selectedProperty.location}</p>
              <p>🛏️ {selectedProperty.bedrooms} Beds | 🛁 {selectedProperty.bathrooms} Baths</p>
              <div className="desc-box" style={{ margin: '24px 0', borderTop: '1px solid var(--border)', paddingTop: '24px' }}>
                <h3>Description</h3>
                <p>{selectedProperty.description}</p>
              </div>
              {!selectedProperty.sold && (
                <button onClick={() => handleBuyClick(selectedProperty)} className="buy-prime-btn" style={{ padding: '16px 32px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '1.1rem' }}>Buy Now</button>
              )}
            </div>
          </div>
        </div>
      )}

      {showBuyDialog && buyingProperty && (
        <div className="modal-overlay" style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 2000 }}>
          <div className="modal-card" style={{ background: 'var(--surface-1)', padding: '32px', borderRadius: '16px', maxWidth: '400px', width: '90%' }}>
            <h2>Confirm Purchase</h2>
            <p>Purchase "{buyingProperty.title}" for INR {(buyingProperty.price + 100).toLocaleString()} (including brokerage)?</p>
            <div className="modal-actions" style={{ display: 'flex', gap: '12px', marginTop: '24px' }}>
              <button onClick={() => setShowBuyDialog(false)} style={{ flex: 1, padding: '12px' }}>Cancel</button>
              <button onClick={handleConfirmBuy} className="btn-buy" style={{ flex: 1, padding: '12px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px' }}>Confirm Buy</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};
