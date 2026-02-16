import React, { useState, useEffect } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/apiService';
import '../styles/Dashboard.css';

export const SellerDashboard = () => {
  const { user } = useAuth();
  const [properties, setProperties] = useState([]);
  const [pendingDeals, setPendingDeals] = useState([]);
  const [balance, setBalance] = useState(0);
  const [formData, setFormData] = useState({ title: '', description: '', price: '', location: '', imageUrl: '' });
  const [imagePreview, setImagePreview] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState('properties');

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
      if (file.size > 5*1024*1024) {
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
          formData.imageUrl
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
          formData.imageUrl
        );
        console.log('Add result:', result);
        setMessage('✓ Property added successfully');
      }
      setFormData({ title: '', description: '', price: '', location: '', imageUrl: '' });
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
      imageUrl: prop.imageUrl
    });
    setImagePreview(prop.imageUrl);
    setEditingId(prop.id);
    setShowForm(true);
  };

  const handleCancelEdit = () => {
    setFormData({ title: '', description: '', price: '', location: '', imageUrl: '' });
    setImagePreview('');
    setEditingId(null);
    setShowForm(false);
  };

  const handleDeleteProperty = async (propertyId) => {
    console.log('Delete clicked for property:', propertyId);
    try {
      setLoading(true);
      console.log('Calling deleteProperty API...');
      const result = await apiService.deleteProperty(propertyId);
      console.log('Delete result:', result);
      setMessage('✓ Property deleted successfully');
      await loadProperties();
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      console.error('Delete error:', err);
      setMessage('✗ Failed to delete property: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="dashboard-content">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Seller Dashboard</h2>
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
          🏠 My Properties ({properties.length})
        </button>
        <button 
          className={`tab-btn ${activeTab === 'deals' ? 'active' : ''}`}
          onClick={() => { setActiveTab('deals'); }}
        >
          💼 Buyer Requests ({pendingDeals.length}) {pendingDeals.length > 0 && '🔔'}
        </button>
      </div>

      {activeTab === 'properties' && (
        <div>
          <button onClick={() => { editingId ? handleCancelEdit() : setShowForm(!showForm); }} className="btn-primary">
            {showForm ? 'Cancel' : '+ Add Property'}
          </button>

          {showForm && (
            <form onSubmit={handleAddProperty} className="form-container seller-form">
              <h3>{editingId ? '✏️ Edit Property' : '➕ Add New Property'}</h3>
              <input
                type="text"
                name="title"
                placeholder="Property Title"
                value={formData.title}
                onChange={handleChange}
                required
              />
              <textarea
                name="description"
                placeholder="Description"
                value={formData.description}
                onChange={handleChange}
                required
              />
              <input
                type="number"
                name="price"
                placeholder="Price"
                value={formData.price}
                onChange={handleChange}
                required
              />
              <input
                type="text"
                name="location"
                placeholder="Location"
                value={formData.location}
                onChange={handleChange}
                required
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
                  <div className="image-preview">
                    <p>✓ Image Preview:</p>
                    <img src={imagePreview} alt="Preview" />
                  </div>
                )}
              </div>
              <button type="submit" disabled={loading || (!editingId && !formData.imageUrl)}>
                {loading ? (editingId ? 'Updating...' : 'Adding...') : (editingId ? 'Update Property' : 'Add Property')}
              </button>
            </form>
          )}

          <div className="properties-grid">
            <h3>Your Properties ({properties.length})</h3>
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
    </div>
  );
};
