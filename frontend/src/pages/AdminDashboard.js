import React, { useState, useEffect } from 'react';
import { apiService } from '../services/apiService';
import '../styles/Dashboard.css';

export const AdminDashboard = () => {
  const [users, setUsers] = useState([]);
  const [properties, setProperties] = useState([]);
  const [deals, setDeals] = useState([]);
  const [balance, setBalance] = useState(0);
  const [adminId, setAdminId] = useState(null);
  const [transactions, setTransactions] = useState([]);
  const [activeTab, setActiveTab] = useState('users');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadUsers();
    loadProperties();
    loadBalance();
    loadDeals();
  }, []);

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAllUsers();
      setUsers(response);
    } catch (err) {
      setMessage('✗ Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const loadProperties = async () => {
    try {
      const response = await apiService.getProperties();
      setProperties(response);
    } catch (err) {
      setMessage('✗ Failed to load properties');
    }
  };

  const loadBalance = async () => {
    try {
      const data = await apiService.getAdminBalance();
      setBalance(data.balance);
      setAdminId(data.id);
      // Load transactions for admin
      if (data.id) {
        loadTransactions(data.id);
      }
    } catch (err) {
      console.error('Failed to load admin balance:', err);
    }
  };

  const loadTransactions = async (userId) => {
    try {
      const txData = await apiService.getTransactionHistory(userId);
      setTransactions(Array.isArray(txData) ? txData : []);
    } catch (err) {
      console.error('Failed to load transactions:', err);
    }
  };

  const loadDeals = async () => {
    try {
      const dealsData = await apiService.getCompletedDeals();
      setDeals(Array.isArray(dealsData) ? dealsData : []);
    } catch (err) {
      console.error('Failed to load deals:', err);
    }
  };

  const handleBlockUser = async (userId) => {
    try {
      setLoading(true);
      await apiService.blockUser(userId);
      setUsers(users.map(u => u.id === userId ? { ...u, blocked: true } : u));
      setMessage('✓ User blocked successfully');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('✗ Failed to block user');
    } finally {
      setLoading(false);
    }
  };

  const handleUnblockUser = async (userId) => {
    try {
      setLoading(true);
      await apiService.unblockUser(userId);
      setUsers(users.map(u => u.id === userId ? { ...u, blocked: false } : u));
      setMessage('✓ User unblocked successfully');
      setTimeout(() => setMessage(''), 3000);
    } catch (err) {
      setMessage('✗ Failed to unblock user');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProperty = async (propertyId) => {
    if (window.confirm('Are you sure you want to delete this property?')) {
      try {
        setLoading(true);
        await apiService.deleteProperty(propertyId);
        setProperties(properties.filter(p => p.id !== propertyId));
        setMessage('✓ Property deleted successfully');
        setTimeout(() => setMessage(''), 3000);
      } catch (err) {
        setMessage('✗ Failed to delete property');
      } finally {
        setLoading(false);
      }
    }
  };

  return (
    <div className="dashboard-content">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
        <h2>Admin Dashboard</h2>
        <div style={{ fontSize: '18px', fontWeight: 'bold', padding: '10px 15px', backgroundColor: '#e8f5e9', borderRadius: '5px' }}>
          💰 Balance: {balance}
        </div>
      </div>
      {message && <p className="message">{message}</p>}

      <div className="admin-tabs">
        <button 
          className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`}
          onClick={() => setActiveTab('users')}
        >
          👥 Manage Users
        </button>
        <button 
          className={`tab-btn ${activeTab === 'properties' ? 'active' : ''}`}
          onClick={() => setActiveTab('properties')}
        >
          🏠 Manage Properties
        </button>
        <button 
          className={`tab-btn ${activeTab === 'deals' ? 'active' : ''}`}
          onClick={() => setActiveTab('deals')}
        >
          💼 Completed Deals
        </button>
        <button 
          className={`tab-btn ${activeTab === 'wallet' ? 'active' : ''}`}
          onClick={() => setActiveTab('wallet')}
        >
          💳 Wallet & Transactions
        </button>
      </div>

      {activeTab === 'users' && (
        <div className="users-section">
          <h3>User Management</h3>
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Email</th>
                <th>Role</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map(u => (
                <tr key={u.id}>
                  <td>{u.id}</td>
                  <td>{u.username}</td>
                  <td>{u.email}</td>
                  <td><span className="badge">{u.role}</span></td>
                  <td>{u.blocked ? '🔒 Blocked' : '✓ Active'}</td>
                  <td>
                    {u.blocked ? (
                      <button onClick={() => handleUnblockUser(u.id)} disabled={loading} className="btn-unblock">
                        Unblock
                      </button>
                    ) : (
                      <button onClick={() => handleBlockUser(u.id)} disabled={loading} className="btn-block">
                        Block
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {activeTab === 'properties' && (
        <div className="properties-section">
          <h3>Property Management ({properties.length} properties)</h3>
          <div className="properties-grid">
            {properties.map(p => (
              <div key={p.id} className="property-card-admin">
                {p.imageUrl && (
                  <img src={p.imageUrl} alt={p.title} className="property-image" />
                )}
                <div className="property-info">
                  <h4>{p.title}</h4>
                  <p className="price">₹{p.price.toLocaleString()}</p>
                  <p className="location">📍 {p.location}</p>
                  <p className="seller">Seller: {p.seller?.username}</p>
                  <p className="status">{p.sold ? '❌ Sold' : '✓ Available'}</p>
                  <button 
                    onClick={() => handleDeleteProperty(p.id)} 
                    disabled={loading}
                    className="btn-delete"
                  >
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
          {properties.length === 0 && <p>No properties found</p>}
        </div>
      )}

      {activeTab === 'deals' && (
        <div className="deals-section">
          <h3>Completed Deals ({deals.length})</h3>
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Deal ID</th>
                  <th>Property</th>
                  <th>Buyer</th>
                  <th>Seller</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Completed At</th>
                </tr>
              </thead>
              <tbody>
                {deals.length === 0 ? (
                  <tr>
                    <td colSpan="7" style={{ textAlign: 'center' }}>No completed deals yet</td>
                  </tr>
                ) : (
                  deals.map(deal => (
                    <tr key={deal.id}>
                      <td>{deal.id}</td>
                      <td>{deal.property?.title}</td>
                      <td>{deal.buyer?.username}</td>
                      <td>{deal.seller?.username}</td>
                      <td style={{ color: '#4CAF50', fontWeight: 'bold' }}>{deal.amount}</td>
                      <td><span className="badge" style={{ backgroundColor: '#4CAF50' }}>{deal.status}</span></td>
                      <td>{deal.completedAt ? new Date(deal.completedAt).toLocaleDateString() : '-'}</td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {activeTab === 'wallet' && (
        <div className="wallet-section">
          <h3>Wallet & Transaction History</h3>
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
    </div>
  );
};
