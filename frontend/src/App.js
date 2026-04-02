import React, { useState, useEffect } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Home } from './pages/Home';
import { AdminDashboard } from './pages/AdminDashboard';
import { SellerDashboard } from './pages/SellerDashboard';
import { BuyerDashboard } from './pages/BuyerDashboard';
import { SettingsModal } from './components/SettingsModal';
import { FAQModal } from './components/FAQModal';
import './styles/Dashboard.css';
import './App.css';

const Dashboard = ({ user, logout, theme, toggleTheme }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);
  const [showSettings, setShowSettings] = useState(false);
  const [showFAQ, setShowFAQ] = useState(false);

  const renderDashboard = () => {
    if (user.role === 'ADMIN') return <AdminDashboard />;
    if (user.role === 'SELLER') return <SellerDashboard />;
    if (user.role === 'BUYER') return <BuyerDashboard />;
  };

  return (
    <>
      <div className="dashboard">
        <div className="dashboard-header">
          <h1 className="site-title-header">PropManage</h1>
          <div className="user-profile">
            <div className="user-icon" onClick={() => setDropdownOpen(!dropdownOpen)}>
              {user.username.charAt(0).toUpperCase()}
            </div>
            <div className="user-info">
              <p>{user.username}</p>
              <p>{user.role}</p>
            </div>
            <div className={`dropdown-menu ${dropdownOpen ? 'active' : ''}`}>
              <button onClick={() => { setShowSettings(true); setDropdownOpen(false); }} style={{ width: '100%', textAlign: 'left', padding: '12px 16px' }}>
                ⚙️ Settings
              </button>
              <button onClick={() => { toggleTheme(); setDropdownOpen(false); }} style={{ width: '100%', textAlign: 'left', padding: '12px 16px' }}>
                {theme === 'dark' ? '☀️ Light Mode' : '🌙 Dark Mode'}
              </button>
              <button onClick={() => { setShowFAQ(true); setDropdownOpen(false); }} style={{ width: '100%', textAlign: 'left', padding: '12px 16px' }}>
                ❓ Help & FAQ
              </button>
              <hr style={{ margin: '8px 0', border: 'none', borderTop: '1px solid var(--border)' }} />
              <button onClick={logout} style={{ width: '100%', textAlign: 'left', padding: '12px 16px', color: '#f44336' }}>
                🚪 Logout
              </button>
            </div>
          </div>
        </div>
        {renderDashboard()}
      </div>
      <SettingsModal isOpen={showSettings} onClose={() => setShowSettings(false)} />
      <FAQModal isOpen={showFAQ} onClose={() => setShowFAQ(false)} />
    </>
  );
};

const AppContent = () => {
  const { user, isAuthenticated, logout } = useAuth();
  const [theme, setTheme] = useState('dark');

  useEffect(() => {
    const savedTheme = localStorage.getItem('theme') || 'dark';
    setTheme(savedTheme);
    document.documentElement.setAttribute('data-theme', savedTheme);
  }, []);

  const toggleTheme = () => {
    const newTheme = theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
    localStorage.setItem('theme', newTheme);
    document.documentElement.setAttribute('data-theme', newTheme);
  };

  return (
    <div className="App">
      {isAuthenticated ? (
        <Dashboard user={user} logout={logout} theme={theme} toggleTheme={toggleTheme} />
      ) : (
        <Home />
      )}
    </div>
  );
};

function App() {
  return (
    <AuthProvider>
      <AppContent />
    </AuthProvider>
  );
}

export default App;
