import React, { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { apiService } from '../services/apiService';
import '../styles/Home.css';

export const Home = () => {
  const { login } = useAuth();
  const [isSignup, setIsSignup] = useState(false);
  const [formData, setFormData] = useState({ username: '', email: '', password: '', role: 'BUYER' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      if (isSignup) {
        const response = await apiService.register(formData.username, formData.email, formData.password, formData.role);
        if (response && response.id) {
          login(response);
          alert(`Signup successful! Logged in as ${formData.role.toLowerCase()}.`);
          setFormData({ username: '', email: '', password: '', role: 'BUYER' });
        } else {
          setError(response?.message || 'Signup failed. Please try again.');
        }
      } else {
        const response = await apiService.login(formData.email, formData.password);
        if (response && response.id) {
          login(response);
        } else {
          setError(response?.message || response?.error || 'Login failed. Please check credentials.');
        }
      }
    } catch (err) {
      setError(err.message || 'Failed to connect to server. Make sure backend is running on port 8080.');
      console.error('Error:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="home-container">
      <div className="home-box">
        <h1>PropManage</h1>
        <h2>{isSignup ? 'Sign Up' : 'Login'}</h2>

        {error && <p className="error-message">{error}</p>}

        <form onSubmit={handleSubmit}>
          {isSignup && (
            <>
              <input
                type="text"
                name="username"
                placeholder="Username"
                value={formData.username}
                onChange={handleChange}
                required
              />
              <div className="role-section">
                <label className="role-label">Select Role:</label>
                <div className="role-options">
                  <div className="role-option">
                    <input
                      type="radio"
                      id="role-buyer"
                      name="role"
                      value="BUYER"
                      checked={formData.role === 'BUYER'}
                      onChange={handleChange}
                    />
                    <label htmlFor="role-buyer">Buyer</label>
                  </div>
                  <div className="role-option">
                    <input
                      type="radio"
                      id="role-seller"
                      name="role"
                      value="SELLER"
                      checked={formData.role === 'SELLER'}
                      onChange={handleChange}
                    />
                    <label htmlFor="role-seller">Seller</label>
                  </div>
                </div>
              </div>
            </>
          )}
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={formData.email}
            onChange={handleChange}
            required
          />
          <input
            type="password"
            name="password"
            placeholder="Password"
            value={formData.password}
            onChange={handleChange}
            required
          />
          <button type="submit" disabled={loading}>
            {loading ? 'Loading...' : isSignup ? 'Sign Up' : 'Login'}
          </button>
        </form>

        <p className="toggle-text">
          {isSignup ? 'Already have an account? ' : "Don't have an account? "}
          <button
            type="button"
            onClick={() => {
              setIsSignup(!isSignup);
              setError('');
              setFormData({ username: '', email: '', password: '', role: 'BUYER' });
            }}
            className="toggle-button"
          >
            {isSignup ? 'Login' : 'Sign Up'}
          </button>
        </p>
      </div>
    </div>
  );
};
