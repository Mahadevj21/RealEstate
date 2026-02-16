import React, { useState } from 'react';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Home } from './pages/Home';
import { AdminDashboard } from './pages/AdminDashboard';
import { SellerDashboard } from './pages/SellerDashboard';
import { BuyerDashboard } from './pages/BuyerDashboard';
import './styles/Dashboard.css';
import './App.css';

const Dashboard = ({ user, logout }) => {
  const [dropdownOpen, setDropdownOpen] = useState(false);

  const renderDashboard = () => {
    if (user.role === 'ADMIN') return <AdminDashboard />;
    if (user.role === 'SELLER') return <SellerDashboard />;
    if (user.role === 'BUYER') return <BuyerDashboard />;
  };

  return (
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
            <button onClick={logout}>Logout</button>
          </div>
        </div>
      </div>
      {renderDashboard()}
    </div>
  );
};

const AppContent = () => {
  const { user, isAuthenticated, logout } = useAuth();

  return (
    <div className="App">
      {isAuthenticated ? (
        <Dashboard user={user} logout={logout} />
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
