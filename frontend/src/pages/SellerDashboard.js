import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/apiService';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import '../styles/Dashboard.css';

const generateMockAnalytics = () => {
  const data = [];
  const today = new Date();
  for(let i=6; i>=0; i--) {
      const d = new Date(today);
      d.setDate(d.getDate() - i);
      data.push({
          name: d.toLocaleDateString('en-US', { weekday: 'short' }),
          views: Math.floor(Math.random() * 50) + 15,
          favorites: Math.floor(Math.random() * 8) + 1
      });
  }
  return data;
};

export const SellerDashboard = () => {
  const { user } = useAuth();
  const [properties, setProperties] = useState([]);
  const [pendingDeals, setPendingDeals] = useState([]);
  const [balance, setBalance] = useState(0);
  const [formData, setFormData] = useState({ title: '', description: '', price: '', location: '', imageUrl: '', bedrooms: '', bathrooms: '', type: 'apartment' });
  const [imagePreview, setImagePreview] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('properties');
  const [transactions, setTransactions] = useState([]);
  const [analyticsData] = useState(generateMockAnalytics());
  const formRef = useRef(null);


  useEffect(() => {
    loadProperties();
    loadBalance();
    loadPendingDeals();
  }, []);

  const loadProperties = async () => {
    if (!user) return;
    try {
      const data = await apiService.getSellerProperties(user.id);
      console.log('Loaded seller properties:', data);
      if (Array.isArray(data)) {
        data.forEach(prop => {
          console.log(`Property ${prop.id} (${prop.title}):`, {
            hasImageUrl: !!prop.imageUrl,
            imageUrlLength: prop.imageUrl?.length,
            imageUrlPreview: prop.imageUrl?.substring?.(0, 50)
          });
        });
      }
      setProperties(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Failed to load seller properties:', err);
    }
  };

  const loadBalance = async () => {
    if (!user) return;
    try {
      const data = await apiService.getSellerBalance(user.id);
      setBalance(data.balance);
    } catch (err) {
      console.error('Failed to load balance:', err);
    }
  };

  const loadPendingDeals = async () => {
    if (!user) return;
    try {
      const deals = await apiService.getSellerPendingDeals(user.id);
      setPendingDeals(Array.isArray(deals) ? deals : []);
    } catch (err) {
      console.error('Failed to load pending deals:', err);
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


  const handleAcceptDeal = async (dealId) => {
    try {
      setLoading(true);
      await apiService.acceptDeal(dealId);
      setMessage('✓ Deal accepted!');
      setPendingDeals(pendingDeals.filter(d => d.id !== dealId));
      loadBalance();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('✗ ' + (err.message || 'Failed to accept deal'));
    } finally {
      setLoading(false);
    }
  };

  const handleRejectDeal = async (dealId) => {
    try {
      setLoading(true);
      await apiService.rejectDeal(dealId);
      setMessage('✓ Deal rejected');
      setPendingDeals(pendingDeals.filter(d => d.id !== dealId));
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('✗ Failed to reject deal');
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleImageUpload = (e) => {
    const file = e.target.files[0];
    if (file) {
      console.log('File selected:', file.name, 'Size:', file.size);

      // Check file size (max 5MB for compression)
      if (file.size > 5 * 1024 * 1024) {
        setMessage('⚠️ Image too large, will be compressed');
      }

      // Compress image
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');

        // Resize to max 600x600
        let width = img.width;
        let height = img.height;
        const maxSize = 600;

        if (width > height) {
          if (width > maxSize) {
            height = (height * maxSize) / width;
            width = maxSize;
          }
        } else {
          if (height > maxSize) {
            width = (width * maxSize) / height;
            height = maxSize;
          }
        }

        canvas.width = width;
        canvas.height = height;
        ctx.drawImage(img, 0, 0, width, height);

        // Convert to base64 with quality 0.6 for smaller size
        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.6);
        console.log('Original size:', file.size, 'bytes');
        console.log('Compressed base64 length:', compressedBase64.length, 'chars');

        if (compressedBase64.length > 1000000) {
          setMessage('⚠️ Image still large after compression, will try to save');
        }

        setFormData(prevData => {
          console.log('Setting formData with image');
          return { ...prevData, imageUrl: compressedBase64 };
        });
        setImagePreview(compressedBase64);
      };

      img.onerror = () => {
        console.error('Error loading image');
        setMessage('✗ Error processing image');
      };

      img.src = URL.createObjectURL(file);
    }
  };

  const handleAddProperty = async (e) => {
    e.preventDefault();
    if (!user) return;

    // For new properties, image is required. For updates, it's optional
    if (!editingId && !formData.imageUrl) {
      setMessage('✗ Please select an image');
      return;
    }

    try {
      setLoading(true);
      console.log('Saving property - image size:', formData.imageUrl?.length || 0);
      if (editingId) {
        // Update existing property
        console.log('Updating property', editingId);
        const result = await apiService.updateProperty(
          editingId,
          formData.title,
          formData.description,
          parseInt(formData.price),
          formData.location,
          formData.imageUrl,
          parseInt(formData.bedrooms) || 0,
          parseInt(formData.bathrooms) || 0,
          formData.type
        );
        console.log('Update result:', result);
        setMessage('✓ Property updated successfully');
      } else {
        // Add new property
        console.log('Adding new property for seller', user.id);
        const result = await apiService.addProperty(
          user.id,
          formData.title,
          formData.description,
          parseInt(formData.price),
          formData.location,
          formData.imageUrl,
          parseInt(formData.bedrooms) || 0,
          parseInt(formData.bathrooms) || 0,
          formData.type
        );
        console.log('Add result:', result);
        setMessage('✓ Property added successfully');
      }
      setFormData({ title: '', description: '', price: '', location: '', imageUrl: '', bedrooms: '', bathrooms: '', type: 'apartment' });
      setImagePreview('');
      setEditingId(null);
      setShowForm(false);
      await loadProperties();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Error saving property:', err);
      setMessage('✗ Failed to save property: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleEditProperty = (prop) => {
    setFormData({
      title: prop.title,
      description: prop.description,
      price: prop.price,
      location: prop.location,
      imageUrl: prop.imageUrl,
      bedrooms: prop.bedrooms || '',
      bathrooms: prop.bathrooms || '',
      type: prop.type || 'apartment'
    });
    setImagePreview(prop.imageUrl);
    setEditingId(prop.id);
    setShowForm(true);
    
    // Scroll to form with smooth animation
    setTimeout(() => {
      formRef.current?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 100);
  };

  const handleCancelEdit = () => {
    setFormData({ title: '', description: '', price: '', location: '', imageUrl: '', bedrooms: '', bathrooms: '', type: 'apartment' });
    setImagePreview('');
    setEditingId(null);
    setShowForm(false);
  };

  const handleDeleteProperty = async (propertyId) => {
    if (!window.confirm('Are you sure you want to delete this property?')) return;
    try {
      setLoading(true);
      await apiService.deleteProperty(propertyId);
      setMessage('✓ Property deleted successfully');
      await loadProperties();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Delete error:', err);
      setMessage('✗ Failed to delete: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-content">
      <div className="dashboard-header-row">
        <h2>Seller Dashboard</h2>
        <div className="balance-badge">
          💰 Balance: {balance}
        </div>
      </div>
      {message && <p className="message">{message}</p>}

      <div className="admin-tabs">
        <button
          className={`tab-btn ${activeTab === 'properties' ? 'active' : ''}`}
          onClick={() => { setActiveTab('properties'); }}
        >
          🏠 My Properties ({properties.length})
        </button>
        <button
          className={`tab-btn ${activeTab === 'deals' ? 'active' : ''}`}
          onClick={() => { setActiveTab('deals'); }}
        >
          💼 Buyer Requests ({pendingDeals.length}) {pendingDeals.length > 0 && '🔔'}
        </button>
        <button
          className={`tab-btn ${activeTab === 'wallet' ? 'active' : ''}`}
          onClick={() => { setActiveTab('wallet'); loadTransactions(); }}
        >
          💳 Wallet
        </button>
        <button
          className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`}
          onClick={() => { setActiveTab('analytics'); }}
        >
          📈 Analytics
        </button>
      </div>


      {activeTab === 'properties' && (
        <div>
          <button onClick={() => { editingId ? handleCancelEdit() : setShowForm(!showForm); }} className="btn-primary" style={{ padding: '12px 24px', fontSize: '0.95rem', marginBottom: '16px' }}>
            {showForm ? 'Cancel' : '+ Add Property'}
          </button>

          {showForm && (
            <form ref={formRef} onSubmit={handleAddProperty} className="form-container seller-form">
              <h3>{editingId ? '✏️ Edit Property' : '➕ Add New Property'}</h3>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                <input
                  type="text"
                  name="title"
                  placeholder="Property Title"
                  value={formData.title}
                  onChange={handleChange}
                  required
                  style={{ flex: 2 }}
                />
                <input
                  type="number"
                  name="price"
                  placeholder="Price"
                  value={formData.price}
                  onChange={handleChange}
                  required
                  style={{ flex: 1 }}
                />
              </div>
              <div style={{ display: 'flex', gap: '12px', marginBottom: '12px' }}>
                <input
                  type="text"
                  name="location"
                  placeholder="Location"
                  value={formData.location}
                  onChange={handleChange}
                  required
                  style={{ flex: 2 }}
                />
                <div style={{ flex: 1, display: 'flex', gap: '8px' }}>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>Bedrooms</label>
                    <input
                      type="number"
                      name="bedrooms"
                      placeholder="Beds"
                      value={formData.bedrooms}
                      onChange={handleChange}
                      required
                      style={{ width: '100%', padding: '12px' }}
                    />
                  </div>
                  <div style={{ flex: 1 }}>
                    <label style={{ fontSize: '0.7rem', color: 'var(--text-muted)', marginBottom: '4px', display: 'block' }}>Bathrooms</label>
                    <input
                      type="number"
                      name="bathrooms"
                      placeholder="Baths"
                      value={formData.bathrooms}
                      onChange={handleChange}
                      required
                      style={{ width: '100%', padding: '12px' }}
                    />
                  </div>
                </div>
              </div>
              <div style={{ marginBottom: '12px' }}>
                <div style={{ display: 'flex', gap: '6px', flexWrap: 'nowrap' }}>
                  {['apartment', 'house', 'villa', 'townhouse'].map((type) => (
                    <button
                      key={type}
                      type="button"
                      onClick={() => setFormData({ ...formData, type })}
                      style={{
                        flex: '1',
                        padding: '10px 4px',
                        fontSize: '0.75rem',
                        borderRadius: '6px',
                        border: '1px solid var(--border)',
                        background: formData.type === type ? 'var(--grad-aurora)' : 'var(--surface-3)',
                        color: formData.type === type ? 'white' : 'var(--text-muted)',
                        textTransform: 'capitalize',
                        cursor: 'pointer',
                        whiteSpace: 'nowrap'
                      }}
                    >
                      {type === 'apartment' ? 'Apt' : type === 'townhouse' ? 'Town' : type}
                    </button>
                  ))}
                </div>
              </div>
              <textarea
                name="description"
                placeholder="Brief property description..."
                value={formData.description}
                onChange={handleChange}
                required
                style={{ width: '100%', marginBottom: '12px' }}
              />
              <div className="image-upload-section">
                <h4>{editingId ? '✏️ Update Property Image' : 'Add Property Image'}</h4>
                <div className="image-input-group">
                  <label htmlFor="imageFile" className="file-upload-label">
                    📁 Choose Image from Computer
                  </label>
                  <input
                    id="imageFile"
                    type="file"
                    accept="image/*"
                    onChange={handleImageUpload}
                    className="file-input"
                  />
                </div>
                <p className="divider">OR</p>
                <input
                  type="text"
                  name="imageUrl"
                  placeholder="Paste online image URL (https://...)"
                  value={formData.imageUrl}
                  onChange={handleChange}
                  className="url-input"
                />
                {imagePreview && (
                  <div className="image-preview" style={{ marginTop: '12px' }}>
                    <p style={{ fontSize: '0.85rem', marginBottom: '8px' }}>✓ Image Preview:</p>
                    <img src={imagePreview} alt="Preview" style={{ 
                      width: '100%', 
                      maxWidth: '180px', 
                      height: '110px', 
                      objectFit: 'cover', 
                      borderRadius: '8px',
                      border: '1px solid var(--border)'
                    }} />
                  </div>
                )}
              </div>
              <button type="submit" disabled={loading || (!editingId && !formData.imageUrl)}>
                {loading ? (editingId ? 'Updating...' : 'Adding...') : (editingId ? 'Update Property' : 'Add Property')}
              </button>
            </form>
          )}

          <h3 style={{ marginBottom: '16px' }}>Your Properties ({properties.length})</h3>
          <div className="properties-grid">
            {properties.length === 0 ? (
              <p>No properties yet</p>
            ) : (
              properties.map(prop => (
                <div key={prop.id} className="property-card">
                  {prop.imageUrl ? (
                    <img src={prop.imageUrl} alt={prop.title} className="property-image" onError={(e) => {
                      console.error('Image load error for', prop.id, e);
                      e.target.style.display = 'none';
                    }} />
                  ) : (
                    <div className="property-image-placeholder">📷 No Image</div>
                  )}
                  <h4>{prop.title}</h4>
                  <p>{prop.description}</p>
                  <p><strong>₹ {prop.price.toLocaleString()}</strong> - {prop.location}</p>
                  <p style={{ display: 'flex', gap: '15px', color: '#666', fontSize: '0.9em', margin: '5px 0' }}>
                    <span>🛏️ {prop.bedrooms || 0} Beds</span>
                    <span>🛁 {prop.bathrooms || 0} Baths</span>
                    <span style={{ textTransform: 'capitalize' }}>🏠 {prop.type || 'N/A'}</span>
                  </p>
                  <p>{prop.sold ? '❌ Sold' : '✓ Available'}</p>
                  <div className="property-actions">
                    <button onClick={() => handleEditProperty(prop)} disabled={loading} className="btn-edit">
                      ✏️ Edit
                    </button>
                    <button onClick={() => handleDeleteProperty(prop.id)} disabled={loading} className="btn-delete">
                      🗑️ Delete
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      )}

      {activeTab === 'deals' && (
        <div>
          {pendingDeals.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '40px', color: '#999' }}>
              <p style={{ fontSize: '16px' }}>✨ No pending buyer requests at the moment</p>
            </div>
          ) : (
            <div style={{
              backgroundColor: '#fff3cd',
              padding: '20px',
              borderRadius: '8px',
              borderLeft: '5px solid #ffc107'
            }}>
              <h3 style={{ marginTop: 0 }}>📋 Buyer Requests ({pendingDeals.length})</h3>
              {pendingDeals.map(deal => (
                <div key={deal.id} style={{
                  backgroundColor: 'white',
                  padding: '15px',
                  marginBottom: '15px',
                  borderRadius: '6px',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  border: '1px solid #ddd',
                  boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
                }}>
                  <div style={{ flex: 1 }}>
                    <p style={{ margin: '0 0 5px 0', fontWeight: 'bold', fontSize: '16px' }}>
                      🏠 Property: <strong style={{ color: '#333' }}>{deal.property?.title}</strong>
                    </p>
                    <p style={{ margin: '0 0 5px 0' }}>
                      👤 Buyer: <strong>{deal.buyer?.username}</strong>
                    </p>
                    <p style={{ margin: '0', color: '#ff6b6b', fontWeight: 'bold' }}>
                      💰 Amount: ₹{deal.amount} Credits
                    </p>
                  </div>
                  <div style={{ display: 'flex', gap: '8px' }}>
                    <button
                      onClick={() => handleAcceptDeal(deal.id)}
                      disabled={loading}
                      style={{
                        padding: '10px 18px',
                        backgroundColor: '#4CAF50',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                      }}
                    >
                      ✓ Accept
                    </button>
                    <button
                      onClick={() => handleRejectDeal(deal.id)}
                      disabled={loading}
                      style={{
                        padding: '10px 18px',
                        backgroundColor: '#f44336',
                        color: 'white',
                        border: 'none',
                        borderRadius: '4px',
                        cursor: 'pointer',
                        fontWeight: 'bold'
                      }}
                    >
                      ✕ Reject
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
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
          <div className="table-view">
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
                        <span className={`badge ${tx.type === 'CREDIT' ? 'badge-seller' : 'badge-admin'}`}>
                          {tx.type}
                        </span>
                      </td>
                      <td style={{ fontWeight: 'bold', color: tx.type === 'CREDIT' ? '#10b981' : '#ef4444' }}>
                        {tx.type === 'CREDIT' ? '+ ' : '- '}₹{tx.amount.toLocaleString()}
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

      {activeTab === 'analytics' && (
        <div className="analytics-section">
          <h3 style={{ marginBottom: '24px' }}>Property Performance (Last 7 Days)</h3>
          <div style={{ background: 'var(--surface-2)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border)', height: '400px' }}>
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analyticsData} margin={{ top: 10, right: 30, left: 0, bottom: 0 }}>
                <defs>
                  <linearGradient id="colorViews" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#8884d8" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#8884d8" stopOpacity={0}/>
                  </linearGradient>
                  <linearGradient id="colorFavs" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#82ca9d" stopOpacity={0.8}/>
                    <stop offset="95%" stopColor="#82ca9d" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                <XAxis dataKey="name" stroke="var(--text-muted)" />
                <YAxis stroke="var(--text-muted)" />
                <Tooltip 
                  contentStyle={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)', borderRadius: '8px', color: 'var(--text-main)' }}
                  itemStyle={{ fontWeight: 'bold' }}
                />
                <Area type="monotone" dataKey="views" name="Views" stroke="#8884d8" fillOpacity={1} fill="url(#colorViews)" />
                <Area type="monotone" dataKey="favorites" name="Favorites" stroke="#82ca9d" fillOpacity={1} fill="url(#colorFavs)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
          
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px', marginTop: '24px' }}>
            <div style={{ background: 'var(--surface-2)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <h4 style={{ margin: '0 0 10px 0', color: 'var(--text-muted)' }}>Total Views</h4>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0, color: '#8884d8' }}>
                    {analyticsData.reduce((acc, curr) => acc + curr.views, 0)}
                </p>
            </div>
            <div style={{ background: 'var(--surface-2)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <h4 style={{ margin: '0 0 10px 0', color: 'var(--text-muted)' }}>Total Favorites</h4>
                <p style={{ fontSize: '2rem', fontWeight: 'bold', margin: 0, color: '#82ca9d' }}>
                    {analyticsData.reduce((acc, curr) => acc + curr.favorites, 0)}
                </p>
            </div>
          </div>
        </div>
      )}
    </div>

  );
};
