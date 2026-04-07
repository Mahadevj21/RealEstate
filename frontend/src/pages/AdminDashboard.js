import React, { useState, useEffect } from 'react';
import { apiService } from '../services/apiService';
import { BarChart, Bar, Cell, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
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
  const [growthData, setGrowthData] = useState([]);
  const [platformStats, setPlatformStats] = useState({ totalUsers: 0, activeListings: 0, completedDeals: 0, pendingApproval: 0 });
  const [reportData, setReportData] = useState(null);

  useEffect(() => {
    loadUsers();
    loadProperties();
    loadBalance();
    loadDeals();
    loadAnalytics();
  }, []);

  const showMessage = (msg) => {
    setMessage(msg);
    setTimeout(() => setMessage(''), 3000);
  };

  const loadAnalytics = async () => {
    try {
      const stats = await apiService.getPlatformStats();
      const growth = await apiService.getPlatformGrowth();
      setPlatformStats(stats);
      setGrowthData(growth);
    } catch (err) {
      console.error('Analytics load error', err);
    }
  };

  const loadUsers = async () => {
    try {
      setLoading(true);
      const response = await apiService.getAllUsers();
      setUsers(response);
    } catch (err) {
      showMessage('✗ Failed to load users');
    } finally {
      setLoading(false);
    }
  };

  const loadProperties = async () => {
    try {
      const response = await apiService.getAdminProperties();
      setProperties(Array.isArray(response) ? response : []);
    } catch (err) {
      showMessage('✗ Failed to load properties');
    }
  };

  const loadBalance = async () => {
    try {
      const data = await apiService.getAdminBalance();
      setBalance(data.balance);
      setAdminId(data.id);
      if (data.id) loadTransactions(data.id);
    } catch (err) {
      console.error('Failed to load admin balance:', err);
    }
  };

  const loadTransactions = async (userId) => {
    try {
      const txData = await apiService.getTransactionHistory(userId);
      setTransactions(Array.isArray(txData) ? [...txData].reverse() : []);
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

  const loadReport = async () => {
    try {
      const data = await apiService.getReportSummary();
      setReportData(data);
    } catch (err) {
      showMessage('✗ Failed to load report');
    }
  };

  const handleBlockUser = async (userId) => {
    try {
      setLoading(true);
      await apiService.blockUser(userId);
      setUsers(users.map(u => u.id === userId ? { ...u, blocked: true } : u));
      showMessage('✓ User blocked successfully');
    } catch (err) {
      showMessage('✗ Failed to block user');
    } finally {
      setLoading(false);
    }
  };

  const handleUnblockUser = async (userId) => {
    try {
      setLoading(true);
      await apiService.unblockUser(userId);
      setUsers(users.map(u => u.id === userId ? { ...u, blocked: false } : u));
      showMessage('✓ User unblocked successfully');
    } catch (err) {
      showMessage('✗ Failed to unblock user');
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteProperty = async (propertyId) => {
    if (!window.confirm('Are you sure you want to delete this property?')) return;
    try {
      setLoading(true);
      await apiService.deleteProperty(propertyId);
      showMessage('✓ Property deleted successfully');
      await loadProperties();
    } catch (err) {
      showMessage('✗ Failed to delete: ' + (err.message || 'Unknown error'));
    } finally {
      setLoading(false);
    }
  };

  const handleApproveProperty = async (propertyId) => {
    try {
      setLoading(true);
      await apiService.approveProperty(propertyId);
      setProperties(properties.map(p => p.id === propertyId ? { ...p, approved: true } : p));
      showMessage('✓ Property approved — now visible to buyers');
    } catch (err) {
      showMessage('✗ Failed to approve property');
    } finally {
      setLoading(false);
    }
  };

  const handleRejectProperty = async (propertyId) => {
    try {
      setLoading(true);
      await apiService.rejectProperty(propertyId);
      setProperties(properties.map(p => p.id === propertyId ? { ...p, approved: false } : p));
      showMessage('✓ Property rejected — hidden from buyers');
    } catch (err) {
      showMessage('✗ Failed to reject property');
    } finally {
      setLoading(false);
    }
  };

  const pendingCount = properties.filter(p => !p.approved && !p.sold).length;

  return (
    <div className="dashboard-content">
      <div className="dashboard-header-row">
        <h2>Admin Dashboard</h2>
        <div className="balance-badge">
          💰 ₹{balance.toLocaleString()}
        </div>
      </div>
      {message && <p className="message">{message}</p>}

      <div className="admin-tabs">
        <button className={`tab-btn ${activeTab === 'users' ? 'active' : ''}`} onClick={() => setActiveTab('users')}>
          👥 Manage Users
        </button>
        <button className={`tab-btn ${activeTab === 'properties' ? 'active' : ''}`} onClick={() => setActiveTab('properties')}>
          🏠 Manage Properties {pendingCount > 0 && <span className="pending-badge">{pendingCount}</span>}
        </button>
        <button className={`tab-btn ${activeTab === 'deals' ? 'active' : ''}`} onClick={() => setActiveTab('deals')}>
          💼 Completed Deals
        </button>
        <button className={`tab-btn ${activeTab === 'wallet' ? 'active' : ''}`} onClick={() => setActiveTab('wallet')}>
          💳 Wallet &amp; Transactions
        </button>
        <button className={`tab-btn ${activeTab === 'analytics' ? 'active' : ''}`} onClick={() => setActiveTab('analytics')}>
          📈 Analytics
        </button>
        <button className={`tab-btn ${activeTab === 'reports' ? 'active' : ''}`} onClick={() => { setActiveTab('reports'); loadReport(); }}>
          📋 Reports
        </button>
      </div>

      {/* ── Users Tab ── */}
      {activeTab === 'users' && (
        <div className="users-section">
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
            <h3>User Management</h3>
            <button onClick={async () => {
              if(!window.confirm('Recharge all users with ₹5,00,000?')) return;
              try {
                setLoading(true);
                await apiService.rechargeAllUsers(500000);
                showMessage('✓ All users recharged with ₹5,00,000');
                loadUsers();
                loadBalance();
              } catch (err) { showMessage('✗ Recharge failed'); }
              finally { setLoading(false); }
            }} className="btn-primary" style={{ padding: '8px 16px', fontSize: '0.85rem' }}>
              ⚡ Global Recharge (Test)
            </button>
          </div>
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th><th>Username</th><th>Email</th><th>Role</th><th>Status</th><th>Actions</th>
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
                      <button onClick={() => handleUnblockUser(u.id)} disabled={loading} className="btn-unblock">Unblock</button>
                    ) : (
                      <button onClick={() => handleBlockUser(u.id)} disabled={loading} className="btn-block">Block</button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {/* ── Properties Tab ── */}
      {activeTab === 'properties' && (
        <div className="properties-section">
          <h3>Property Management ({properties.length} properties)</h3>
          <div style={{ display: 'flex', gap: '12px', marginBottom: '16px', flexWrap: 'wrap' }}>
            <span style={{ padding: '4px 12px', borderRadius: '20px', background: '#e8f5e9', color: '#2e7d32', fontSize: '0.85rem' }}>
              ✅ Approved: {properties.filter(p => p.approved).length}
            </span>
            <span style={{ padding: '4px 12px', borderRadius: '20px', background: '#fff3e0', color: '#e65100', fontSize: '0.85rem' }}>
              ⏳ Pending: {pendingCount}
            </span>
            <span style={{ padding: '4px 12px', borderRadius: '20px', background: '#fce4ec', color: '#880e4f', fontSize: '0.85rem' }}>
              🏷️ Sold: {properties.filter(p => p.sold).length}
            </span>
          </div>
          <div className="properties-grid">
            {properties.map(p => (
              <div key={p.id} className="property-card-admin" style={{ position: 'relative' }}>
                {/* Approval status badge */}
                <div style={{
                  position: 'absolute', top: '10px', left: '10px', zIndex: 2,
                  padding: '3px 10px', borderRadius: '20px', fontSize: '0.75rem', fontWeight: 700,
                  background: p.sold ? '#455a64' : p.approved ? '#2e7d32' : '#e65100',
                  color: '#fff'
                }}>
                  {p.sold ? '🏷️ Sold' : p.approved ? '✅ Approved' : '⏳ Pending'}
                </div>
                {p.imageUrl && (
                  <img src={p.imageUrl} alt={p.title} className="property-image" />
                )}
                <div className="property-info" style={{ padding: '20px' }}>
                  <h4 style={{ margin: '0' }}>{p.title}</h4>
                  <p className="price" style={{ padding: '4px 0 8px' }}>₹{p.price.toLocaleString()}</p>
                  <p className="location" style={{ padding: '0', marginBottom: '4px' }}>📍 {p.location}</p>
                  <p style={{ padding: '0', color: 'var(--text-muted)', fontSize: '0.85rem' }}>Seller: {p.seller?.username}</p>
                </div>
                <div className="card-footer" style={{ display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
                  {!p.sold && !p.approved && (
                    <button onClick={() => handleApproveProperty(p.id)} disabled={loading} className="btn-unblock">
                      ✅ Approve
                    </button>
                  )}
                  {!p.sold && p.approved && (
                    <button onClick={() => handleRejectProperty(p.id)} disabled={loading} className="btn-block">
                      ❌ Reject
                    </button>
                  )}
                  <button onClick={() => handleDeleteProperty(p.id)} disabled={loading} className="btn-delete">
                    🗑️ Delete
                  </button>
                </div>
              </div>
            ))}
          </div>
          {properties.length === 0 && <p>No properties found</p>}
        </div>
      )}

      {/* ── Deals Tab ── */}
      {activeTab === 'deals' && (
        <div className="deals-section">
          <h3>Completed Deals ({deals.length})</h3>
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Deal ID</th><th>Property</th><th>Buyer</th><th>Seller</th><th>Amount</th><th>Status</th><th>Completed At</th>
                </tr>
              </thead>
              <tbody>
                {deals.length === 0 ? (
                  <tr><td colSpan="7" style={{ textAlign: 'center' }}>No completed deals yet</td></tr>
                ) : (
                  deals.map(deal => (
                    <tr key={deal.id}>
                      <td>{deal.id}</td>
                      <td>{deal.property?.title}</td>
                      <td>{deal.buyer?.username}</td>
                      <td>{deal.seller?.username}</td>
                      <td style={{ color: '#4CAF50', fontWeight: 'bold' }}>₹{deal.amount}</td>
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

      {/* ── Wallet Tab ── */}
      {activeTab === 'wallet' && (
        <div className="wallet-section">
          <h3>Wallet &amp; Transaction History</h3>
          <div className="balance-display">
            <h4>Current Balance</h4>
            <p>₹{balance.toLocaleString()}</p>
          </div>
          <h4>Transaction History</h4>
          <div style={{ overflowX: 'auto' }}>
            <table className="admin-table">
              <thead>
                <tr>
                  <th>ID</th><th>Type</th><th>Amount</th><th>Status</th><th>Description</th><th>Date</th>
                </tr>
              </thead>
              <tbody>
                {transactions.length === 0 ? (
                  <tr><td colSpan="6" style={{ textAlign: 'center' }}>No transactions yet</td></tr>
                ) : (
                  transactions.map(tx => (
                    <tr key={tx.id}>
                      <td>{tx.id}</td>
                      <td>
                        <span style={{
                          padding: '3px 8px', borderRadius: '4px',
                          background: tx.type === 'CREDIT' ? '#c8e6c9' : '#ffcdd2',
                          color: tx.type === 'CREDIT' ? '#2e7d32' : '#c62828',
                          fontWeight: 600
                        }}>
                          {tx.type === 'CREDIT' ? '+' : '-'}₹{tx.amount}
                        </span>
                      </td>
                      <td style={{ fontWeight: 'bold', color: tx.type === 'CREDIT' ? '#4CAF50' : '#f44336' }}>
                        ₹{tx.amount}
                      </td>
                      <td>
                        <span style={{
                          padding: '2px 8px', borderRadius: '4px', fontSize: '0.8rem',
                          background: tx.status === 'SUCCESS' ? '#e8f5e9' : tx.status === 'FAILED' ? '#fce4ec' : '#fff3e0',
                          color: tx.status === 'SUCCESS' ? '#2e7d32' : tx.status === 'FAILED' ? '#880e4f' : '#e65100'
                        }}>
                          {tx.status || 'SUCCESS'}
                        </span>
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
          <h3 style={{ marginBottom: '24px' }}>Platform Activity Overview</h3>
          <div className="stats-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))', gap: '16px', marginBottom: '24px' }}>
            {[
              { label: 'TOTAL USERS', value: platformStats.totalUsers, color: '#8884d8' },
              { label: 'ACTIVE LISTINGS', value: platformStats.activeListings, color: '#82ca9d' },
              { label: 'PENDING APPROVAL', value: platformStats.pendingApproval ?? 0, color: '#ffa726' },
              { label: 'DEALS COMPLETED', value: platformStats.completedDeals, color: 'var(--primary)' },
              { label: 'TOTAL VOLUME', value: `₹${(platformStats.totalVolume || 0).toLocaleString()}`, color: '#ffc107' },
            ].map(s => (
              <div key={s.label} className="stat-card" style={{ background: 'var(--surface-2)', padding: '16px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                <h4 style={{ margin: '0 0 8px 0', color: 'var(--text-muted)', fontSize: '0.8rem' }}>{s.label}</h4>
                <p style={{ fontSize: '1.6rem', fontWeight: 'bold', margin: 0, color: s.color }}>{s.value}</p>
              </div>
            ))}
          </div>

          {growthData.length === 0 ? (
            <div style={{ textAlign: 'center', padding: '60px', color: 'var(--text-muted)', background: 'var(--surface-2)', borderRadius: '12px', border: '1px solid var(--border)' }}>
              <p style={{ fontSize: '2rem', marginBottom: '8px' }}>📊</p>
              <p>Loading growth data...</p>
            </div>
          ) : (
            <div className="chart-container" style={{ background: 'var(--surface-2)', padding: '24px', borderRadius: '12px', border: '1px solid var(--border)', height: '360px' }}>
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={growthData} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="var(--border)" vertical={false} />
                  <XAxis dataKey="name" stroke="var(--text-muted)" />
                  <YAxis stroke="var(--text-muted)" allowDecimals={false} />
                  <Tooltip
                    contentStyle={{ backgroundColor: 'var(--surface-2)', borderColor: 'var(--border)', borderRadius: '8px', color: 'var(--text-main)' }}
                    formatter={(value, name) => [Math.round(value), name === 'signups' ? 'New Users' : 'New Listings']}
                  />
                  <Legend formatter={(value) => value === 'signups' ? 'New Users' : 'New Listings'} />
                  <Bar dataKey="signups" name="signups" fill="#8884d8" radius={[4, 4, 0, 0]} />
                  <Bar dataKey="listings" name="listings" fill="#82ca9d" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          )}
        </div>
      )}

      {/* ── Reports Tab ── */}
      {activeTab === 'reports' && (
        <div className="analytics-section">
          <h3 style={{ marginBottom: '24px' }}>Platform Summary Report</h3>
          {!reportData ? (
            <div style={{ textAlign: 'center', padding: '40px', color: 'var(--text-muted)' }}>
              <p>Loading report...</p>
            </div>
          ) : (
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
              {[
                { label: 'Total Users', value: reportData.totalUsers, icon: '👥', color: '#8884d8' },
                { label: 'Buyers', value: reportData.buyers, icon: '🛒', color: '#82ca9d' },
                { label: 'Sellers', value: reportData.sellers, icon: '🏠', color: '#ffa726' },
                { label: 'Total Properties', value: reportData.totalProperties, icon: '🏘️', color: 'var(--primary)' },
                { label: 'Available', value: reportData.availableProperties, icon: '✅', color: '#26a69a' },
                { label: 'Sold', value: reportData.soldProperties, icon: '🏷️', color: '#ef5350' },
                { label: 'Pending Approval', value: reportData.pendingApproval, icon: '⏳', color: '#ffa726' },
                { label: 'Completed Deals', value: reportData.completedDeals, icon: '💼', color: '#5c6bc0' },
                { label: 'Transaction Volume', value: `₹${(reportData.totalTransactionVolume || 0).toLocaleString()}`, icon: '💰', color: '#ffc107' },
                { label: 'Brokerage Revenue', value: `₹${(reportData.brokerageRevenue || 0).toLocaleString()}`, icon: '📊', color: '#ab47bc' },
              ].map(item => (
                <div key={item.label} style={{ background: 'var(--surface-2)', padding: '20px', borderRadius: '12px', border: '1px solid var(--border)' }}>
                  <div style={{ fontSize: '1.8rem', marginBottom: '8px' }}>{item.icon}</div>
                  <h4 style={{ margin: '0 0 6px', color: 'var(--text-muted)', fontSize: '0.8rem' }}>{item.label.toUpperCase()}</h4>
                  <p style={{ fontSize: '1.5rem', fontWeight: 'bold', margin: 0, color: item.color }}>{item.value}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
