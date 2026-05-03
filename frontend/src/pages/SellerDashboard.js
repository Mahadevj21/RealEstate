import React, { useState, useEffect, useRef } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/apiService';
import { PieChart, Pie, Cell, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import '../styles/Dashboard.css';

export const SellerDashboard = () => {
  const { user } = useAuth();
  const [properties, setProperties] = useState([]);
  const [pendingDeals, setPendingDeals] = useState([]);
  const [balance, setBalance] = useState(0);
  const [formData, setFormData] = useState({ title: '', description: '', price: '', location: '', imageUrl: '', bedrooms: '', bathrooms: '', type: 'apartment' });
  const [, setImagePreview] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');
  const [, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('properties');
  const [transactions, setTransactions] = useState([]);
  const [analyticsData, setAnalyticsData] = useState([]);
  const [allDeals, setAllDeals] = useState([]);
  const formRef = useRef(null);

  useEffect(() => {
    loadProperties();
    loadBalance();
    loadPendingDeals();
    loadAnalytics();
    loadAllDeals();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const loadAnalytics = async () => {
    if (!user) return;
    try {
      const data = await apiService.getSellerPerformance(user.id);
      setAnalyticsData(data);
    } catch (err) {
      console.error('Analytics fetch error', err);
    }
  };

  const loadProperties = async () => {
    if (!user) return;
    try {
      const data = await apiService.getSellerProperties(user.id);
      setProperties(Array.isArray(data) ? data : []);
    } catch (err) {
      console.error('Properties fetch error', err);
    }
  };

  const loadBalance = async () => {
    if (!user) return;
    try {
      const data = await apiService.getSellerBalance(user.id);
      setBalance(data.balance);
    } catch (err) {
      console.error('Balance fetch error', err);
    }
  };

  const loadPendingDeals = async () => {
    if (!user) return;
    try {
      const deals = await apiService.getSellerPendingDeals(user.id);
      setPendingDeals(Array.isArray(deals) ? deals : []);
    } catch (err) {
      console.error('Pending deals fetch error', err);
    }
  };

  const loadAllDeals = async () => {
    if (!user) return;
    try {
      const deals = await apiService.getAllSellerDeals(user.id);
      setAllDeals(Array.isArray(deals) ? deals : []);
    } catch (err) {
      console.error('All deals fetch error', err);
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

  const handleAcceptDeal = async (dealId) => {
    try {
      setLoading(true);
      await apiService.acceptDeal(dealId);
      setMessage('✓ Deal accepted!');
      setPendingDeals(pendingDeals.filter(d => d.id !== dealId));
      loadBalance();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('✗ ' + (err.message || 'Action failed'));
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
      setMessage('✗ Action failed');
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
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        const ctx = canvas.getContext('2d');
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

        const compressedBase64 = canvas.toDataURL('image/jpeg', 0.6);
        setFormData(prev => ({ ...prev, imageUrl: compressedBase64 }));
        setImagePreview(compressedBase64);
      };
      img.src = URL.createObjectURL(file);
    }
  };

  const handleAddProperty = async (e) => {
    e.preventDefault();
    if (!user) return;
    if (!editingId && !formData.imageUrl) {
      setMessage('✗ Image is required');
      return;
    }

    try {
      setLoading(true);
      if (editingId) {
        await apiService.updateProperty(
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
        setMessage('✓ Property updated');
      } else {
        await apiService.addProperty(
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
        setMessage('✓ Property added');
      }
      setFormData({ title: '', description: '', price: '', location: '', imageUrl: '', bedrooms: '', bathrooms: '', type: 'apartment' });
      setImagePreview('');
      setEditingId(null);
      setShowForm(false);
      await loadProperties();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('✗ Error: ' + err.message);
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
    setTimeout(() => formRef.current?.scrollIntoView({ behavior: 'smooth' }), 100);
  };

  const handleDeleteProperty = async (id) => {
    if (!window.confirm('Delete this property?')) return;
    try {
      setLoading(true);
      await apiService.deleteProperty(id);
      setMessage('✓ Deleted');
      await loadProperties();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('✗ Delete failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-content">
      <div className="dashboard-header-row">
        <h2>Seller Dashboard</h2>
        <div className="balance-badge">💰 Balance: ₹{balance.toLocaleString()}</div>
      </div>
      {message && <p className="message">{message}</p>}

      <div className="admin-tabs">
        <button className={`tab-btn ${activeTab === 'properties' ? 'active' : ''}`} onClick={() => setActiveTab('properties')}>🏠 My Properties</button>
        <button className={`tab-btn ${activeTab === 'deals' ? 'active' : ''}`} onClick={() => setActiveTab('deals')}>⏳ Requests {pendingDeals.length > 0 && '🔔'}</button>
        <button className={`tab-btn ${activeTab === 'sales' ? 'active' : ''}`} onClick={() => { setActiveTab('sales'); loadAllDeals(); }}>📋 Sales History</button>
        <button className={`tab-btn ${activeTab === 'wallet' ? 'active' : ''}`} onClick={() => { setActiveTab('wallet'); loadTransactions(); }}>💳 Wallet</button>
        <button className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => setActiveTab('analytics')}>📈 Analytics</button>
      </div>

      {activeTab === 'properties' && (
        <div>
          <button onClick={() => setShowForm(!showForm)} className="btn-primary" style={{ marginBottom: '16px' }}>
            {showForm ? 'Cancel' : '+ New Property'}
          </button>

          {showForm && (
            <form ref={formRef} onSubmit={handleAddProperty} className="form-container seller-form">
              <h3>{editingId ? 'Edit Property' : 'Add Property'}</h3>
              <div style={{ display: 'flex', gap: '12px' }}>
                <input type="text" name="title" placeholder="Title" value={formData.title} onChange={handleChange} required style={{ flex: 2 }} />
                <input type="number" name="price" placeholder="Price" value={formData.price} onChange={handleChange} required style={{ flex: 1 }} />
              </div>
              <div style={{ display: 'flex', gap: '12px', marginTop: '12px' }}>
                <input type="text" name="location" placeholder="Location" value={formData.location} onChange={handleChange} required style={{ flex: 2 }} />
                <div style={{ flex: 1, display: 'flex', gap: '8px' }}>
                   <input type="number" name="bedrooms" placeholder="Beds" value={formData.bedrooms} onChange={handleChange} required style={{ flex: 1 }} />
                   <input type="number" name="bathrooms" placeholder="Baths" value={formData.bathrooms} onChange={handleChange} required style={{ flex: 1 }} />
                </div>
              </div>
              <div className="type-row" style={{ display: 'flex', gap: '8px', margin: '12px 0' }}>
                {['apartment', 'house', 'villa', 'townhouse'].map(t => (
                  <button key={t} type="button" onClick={() => setFormData({...formData, type: t})} style={{ flex: 1, padding: '8px', background: formData.type === t ? 'var(--primary)' : 'var(--surface-3)', color: formData.type === t ? 'white' : 'var(--text-main)', border: '1px solid var(--border)', borderRadius: '6px' }}>{t}</button>
                ))}
              </div>
              <textarea name="description" placeholder="Description" value={formData.description} onChange={handleChange} required style={{ width: '100%', minHeight: '80px' }} />
              
              <div className="upload-box" style={{ marginTop: '12px', padding: '16px', border: '1px dashed var(--border)', borderRadius: '8px' }}>
                <input type="file" onChange={handleImageUpload} accept="image/*" />
                <p style={{ margin: '8px 0', fontSize: '0.8rem' }}>OR</p>
                <input type="text" name="imageUrl" placeholder="Image URL" value={formData.imageUrl} onChange={handleChange} style={{ width: '100%' }} />
              </div>

              <button type="submit" className="submit-btn" style={{ marginTop: '16px', width: '100%', padding: '12px', background: 'var(--primary)', color: 'white', border: 'none', borderRadius: '8px' }}>{editingId ? 'Update' : 'Post Property'}</button>
            </form>
          )}

          <div className="properties-grid" style={{ marginTop: '24px' }}>
            {properties.map(prop => (
              <div key={prop.id} className="property-card" style={{ position: 'relative' }}>
                {/* Sold / Available badge */}
                <div className={`badge-overlay ${prop.sold ? 'sold' : 'available'}`}>
                  {prop.sold ? 'Sold' : 'Available'}
                </div>
                {/* Approval status badge */}
                <div style={{
                  position: 'absolute', top: '10px', left: '10px', zIndex: 6,
                  padding: '4px 12px', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 800,
                  background: prop.approved ? 'rgba(46, 125, 50, 0.95)' : 'rgba(230, 81, 0, 0.95)',
                  color: 'white', border: '1px solid rgba(255,255,255,0.2)',
                  backdropFilter: 'blur(4px)'
                }}>
                  {prop.approved ? '✅ Approved' : '⏳ Pending'}
                </div>
                <img src={prop.imageUrl} alt="" className="property-image" />
                <div className="property-info" style={{ padding: '20px 20px 0' }}>
                  <h4 style={{ padding: '0' }}>{prop.title}</h4>
                  <p className="price" style={{ padding: '4px 0' }}>₹ {prop.price.toLocaleString()}</p>
                  <p style={{ padding: '0', fontSize: '0.9rem', color: 'var(--text-sub)' }}>📍 {prop.location}</p>
                </div>
                <div className="card-footer">
                  <button onClick={() => handleEditProperty(prop)} className="btn-edit">✏️ Edit</button>
                  <button onClick={() => handleDeleteProperty(prop.id)} className="btn-delete">🗑️ Delete</button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {activeTab === 'deals' && (
        <div className="deals-area">
          {pendingDeals.length === 0 ? <p>No pending requests.</p> :
            pendingDeals.map(deal => (
              <div key={deal.id} className="deal-request-card" style={{ background: 'var(--surface-2)', padding: '16px', borderRadius: '8px', display: 'flex', justifyContent: 'space-between', marginBottom: '12px' }}>
                <div>
                  <p><strong>{deal.buyer?.username}</strong> wants to buy <strong>{deal.property?.title}</strong></p>
                  <p style={{ color: 'var(--primary)', fontWeight: 'bold' }}>Offer: ₹{deal.amount.toLocaleString()}</p>
                </div>
                <div style={{ display: 'flex', gap: '8px' }}>
                  <button onClick={() => handleAcceptDeal(deal.id)} style={{ background: '#4caf50', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px' }}>Accept</button>
                  <button onClick={() => handleRejectDeal(deal.id)} style={{ background: '#f44336', color: 'white', border: 'none', padding: '8px 16px', borderRadius: '4px' }}>Reject</button>
                </div>
              </div>
            ))
          }
        </div>
      )}

      {activeTab === 'sales' && (
        <div className="deals-area">
          <h3 style={{ marginBottom: '16px' }}>Sales History ({allDeals.length} deals)</h3>
          {allDeals.length === 0 ? <p>No deals yet.</p> : (
            <div style={{ overflowX: 'auto' }}>
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Deal ID</th><th>Property</th><th>Buyer</th><th>Amount</th><th>Status</th><th>Date</th>
                  </tr>
                </thead>
                <tbody>
                  {allDeals.map(deal => (
                    <tr key={deal.id}>
                      <td>{deal.id}</td>
                      <td>{deal.property?.title}</td>
                      <td>{deal.buyer?.username}</td>
                      <td style={{ fontWeight: 'bold' }}>₹{deal.amount?.toLocaleString()}</td>
                      <td>
                        <span style={{
                          padding: '3px 10px', borderRadius: '20px', fontSize: '0.8rem', fontWeight: 600,
                          background:
                            deal.status === 'COMPLETED' ? '#e8f5e9' :
                            deal.status === 'PENDING' ? '#fff3e0' : '#fce4ec',
                          color:
                            deal.status === 'COMPLETED' ? '#2e7d32' :
                            deal.status === 'PENDING' ? '#e65100' : '#880e4f'
                        }}>
                          {deal.status}
                        </span>
                      </td>
                      <td>{deal.completedAt ? new Date(deal.completedAt).toLocaleDateString() : '—'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      )}

      {activeTab === 'wallet' && (
         <div className="wallet-area">
            <div className="wallet-header" style={{ textAlign: 'center', padding: '24px', background: 'var(--surface-2)', borderRadius: '12px', marginBottom: '24px' }}>
              <h3>Wallet Balance</h3>
              <p style={{ fontSize: '2rem', fontWeight: 'bold' }}>₹{balance.toLocaleString()}</p>
            </div>
            <table className="admin-table">
               <thead><tr><th>Description</th><th>Amount</th><th>Date</th></tr></thead>
               <tbody>
                  {transactions.map(tx => (
                    <tr key={tx.id}>
                      <td>{tx.description}</td>
                      <td style={{ color: tx.type === 'CREDIT' ? 'green' : 'red' }}>₹{tx.amount}</td>
                      <td>{new Date(tx.timestamp).toLocaleDateString()}</td>
                    </tr>
                  ))}
               </tbody>
            </table>
         </div>
      )}

      {activeTab === 'analytics' && (
        <div className="analytics-area">
          <h3 style={{ marginBottom: '20px' }}>My Performance Overview</h3>

          {/* Summary stat cards */}
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '14px', marginBottom: '24px' }}>
            {[
              { label: 'Total Listings', value: properties.length, color: '#8884d8', icon: '🏘️' },
              { label: 'Active', value: analyticsData.find(d => d.name === 'Active')?.value ?? 0, color: '#82ca9d', icon: '✅' },
              { label: 'Sold', value: analyticsData.find(d => d.name === 'Sold')?.value ?? 0, color: '#ffa726', icon: '🏷️' },
              { label: 'Total Revenue', value: `₹${allDeals.filter(d => d.status === 'COMPLETED').reduce((sum, d) => sum + (d.amount || 0), 0).toLocaleString()}`, color: '#4caf50', icon: '💰' },
            ].map(s => (
              <div key={s.label} style={{ background: 'var(--surface-2)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <div style={{ fontSize: '1.4rem', marginBottom: '6px' }}>{s.icon}</div>
                <p style={{ margin: '0 0 4px', color: 'var(--text-muted)', fontSize: '0.78rem', fontWeight: 600 }}>{s.label.toUpperCase()}</p>
                <p style={{ margin: 0, fontSize: '1.4rem', fontWeight: 'bold', color: s.color }}>{s.value}</p>
              </div>
            ))}
          </div>

          {/* Pie chart — show empty state if no data or all zeros */}
          {analyticsData.length === 0 || analyticsData.every(d => d.value === 0) ? (
            <div style={{ textAlign: 'center', padding: '60px', background: 'var(--surface-2)', borderRadius: '12px', border: '1px solid var(--border)', color: 'var(--text-muted)' }}>
              <p style={{ fontSize: '2.5rem', marginBottom: '12px' }}>📊</p>
              <p style={{ fontWeight: 600, marginBottom: '6px' }}>No Sales Data Yet</p>
              <p style={{ fontSize: '0.9rem' }}>Once your properties are sold, your performance chart will appear here.</p>
            </div>
          ) : (
            <div style={{ height: '340px', background: 'var(--surface-2)', borderRadius: '12px', padding: '20px', border: '1px solid var(--border)' }}>
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={analyticsData}
                    cx="50%"
                    cy="50%"
                    outerRadius={110}
                    label={({ name, value }) => `${name}: ${value}`}
                    dataKey="value"
                  >
                    {analyticsData.map((e, i) => <Cell key={i} fill={e.fill || '#8884d8'} />)}
                  </Pie>
                  <Tooltip formatter={(value, name) => [value, name]} />
                  <Legend />
                </PieChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}
    </div>
  );
};
