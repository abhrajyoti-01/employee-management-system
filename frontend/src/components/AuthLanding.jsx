import React from 'react';
import { Link } from 'react-router-dom';
import './Auth.css';

const AuthLanding = () => {
  return (
    <div className="auth-container">
      <div className="auth-landing-wrapper">
        <div className="auth-card auth-landing-card">
          <div className="auth-header">
            <div className="logo-container">
              <div className="logo-icon">👥</div>
            </div>
            <h1>Employee Management</h1>
            <p className="auth-subtitle">Please select login type</p>
          </div>
          
          <div className="auth-options">
            <div className="auth-option admin-option">
              <div className="option-icon">⚙️</div>
              <h3>Administrator</h3>
              <p>Manage employees and system settings</p>
              <Link to="/admin-login" className="auth-button primary">
                Admin Login
              </Link>
            </div>
            
            <div className="auth-option employee-option">
              <div className="option-icon">👤</div>
              <h3>Employee Portal</h3>
              <p>Access your employee account</p>
              <div className="employee-buttons">
                <Link to="/employee-login" className="auth-button secondary">
                  Employee Login
                </Link>
                <Link to="/employee-register" className="auth-button outline">
                  Create Account
                </Link>
              </div>
            </div>
          </div>
          
          <div className="auth-footer">
            <p>Secure • Reliable • Professional</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AuthLanding;
