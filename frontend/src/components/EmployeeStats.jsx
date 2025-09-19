import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { employeeAPI } from '../services/api';
import './EmployeeStats.css';

const EmployeeStats = () => {
  const { isAuthenticated, loading: authLoading } = useAuth();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (isAuthenticated && !authLoading) {
      // Add a small delay to ensure auth state is fully settled
      const timer = setTimeout(() => {
        fetchStats();
      }, 100);
      
      return () => clearTimeout(timer);
    }
  }, [isAuthenticated, authLoading]);

  const fetchStats = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check if we have authentication before making the request
      const token = localStorage.getItem('token');
      if (!token) {
        setError('Authentication required');
        return;
      }
      
      const response = await employeeAPI.getStats();
      setStats(response.data.data);
      
      // Let's also update any parent components that might be listening
      if (window.dispatchEvent) {
        window.dispatchEvent(new CustomEvent('statsUpdated', { 
          detail: response.data.data 
        }));
      }
    } catch (error) {
      setError('Failed to fetch statistics');
      console.error('Fetch stats error:', error);
      
      // If it's an authentication error, show more specific message
      if (error.response?.status === 401) {
        setError('Authentication failed. Please login again.');
      }
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="stats-loading">
        <div className="loading-spinner"></div>
        <p>Loading statistics...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="stats-error">
        <p>{error}</p>
        <button onClick={fetchStats} className="retry-btn">
          Retry
        </button>
      </div>
    );
  }

  const statusCards = [
    {
      title: 'Total Employees',
      value: stats?.overview?.total || 0,
      icon: '👥',
      gradient: 'var(--primary-gradient)',
      bgColor: 'rgba(102, 126, 234, 0.1)'
    },
    {
      title: 'Active Employees',
      value: stats?.overview?.active || 0,
      icon: '✅',
      gradient: 'var(--success-gradient)',
      bgColor: 'rgba(72, 187, 120, 0.1)'
    },
    {
      title: 'Inactive Employees',
      value: stats?.overview?.inactive || 0,
      icon: '⏸️',
      gradient: 'var(--warning-gradient)',
      bgColor: 'rgba(237, 137, 54, 0.1)'
    },
    {
      title: 'Terminated',
      value: stats?.overview?.terminated || 0,
      icon: '❌',
      gradient: 'var(--danger-gradient)',
      bgColor: 'rgba(245, 101, 101, 0.1)'
    }
  ];

  return (
    <div className="stats-container">
      <div className="stats-header">
        <div className="header-actions">
          <button onClick={fetchStats} className="refresh-btn" title="Refresh data">
            <span>🔄</span> Refresh Data
          </button>
        </div>
      </div>

      <div className="stats-grid">
        {statusCards.map((card, index) => {
          // Define color schemes for each card type
          const colorSchemes = [
            { bg: '#EBF5FF', border: '#3182CE', text: '#2C5282', iconBg: '#BEE3F8' }, // Total - Blue
            { bg: '#F0FFF4', border: '#38A169', text: '#276749', iconBg: '#C6F6D5' }, // Active - Green
            { bg: '#FFFAF0', border: '#DD6B20', text: '#9C4221', iconBg: '#FEEBC8' }, // Inactive - Orange
            { bg: '#FFF5F5', border: '#E53E3E', text: '#9B2C2C', iconBg: '#FED7D7' }, // Terminated - Red
          ];
          
          const scheme = colorSchemes[index];
          
          return (
            <div
              key={index}
              className="stat-card"
              style={{
                background: scheme.bg,
                borderLeft: `4px solid ${scheme.border}`,
                boxShadow: `0 4px 20px rgba(0, 0, 0, 0.08)`
              }}
            >
              <div
                className="stat-icon"
                style={{
                  background: scheme.iconBg,
                  color: scheme.border,
                  boxShadow: `0 4px 10px rgba(0, 0, 0, 0.1)`
                }}
              >
                {card.icon}
              </div>
              <div className="stat-content">
                <h3 className="stat-title" style={{ color: scheme.text }}>
                  {card.title}
                </h3>
                <p className="stat-value" data-value={card.value} style={{ color: scheme.text }}>
                  {card.value.toLocaleString()}
                </p>
                <div 
                  className={`stat-change ${index === 1 ? 'positive' : ''}`}
                >
                  <span className="change-icon">
                    {index === 1 ? '↗' : '→'}
                  </span>
                  <span className="change-text">
                    {index === 1 ? '+12.5%' : '0%'} from last month
                  </span>
                </div>
              </div>
              <div className="stat-indicator" style={{ background: scheme.border }}></div>
            </div>
          );
        })}
      </div>

      {stats?.departments && stats.departments.length > 0 && (
        <div className="department-section">
          <div className="section-header">
            <h2>Department Distribution</h2>
            <p className="section-subtitle">Employee breakdown by department</p>
          </div>
          <div className="department-grid">
            {stats.departments.map((dept, index) => (
              <div 
                key={index} 
                className="department-card"
                style={{
                  borderLeft: `4px solid ${
                    ['#667eea', '#48bb78', '#ed8936', '#f56565', '#4299e1', '#9f7aea'][index % 6]
                  }`
                }}
              >
                <div className="department-header">
                  <div className="department-info">
                    <h4>{dept._id}&nbsp;</h4>
                    <p className="department-subtitle">{dept.count} employees</p>
                  </div>
                  <span className="employee-count">{dept.count}</span>
                </div>
                <div className="department-metrics">
                  <div className="metric-item">
                    <span className="metric-label">Avg Salary</span>
                    <span className="metric-value">
                      ${dept.avgSalary?.toLocaleString() || 'N/A'}
                    </span>
                  </div>
                  {dept.avgAge && (
                    <div className="metric-item">
                      <span className="metric-label">Avg Age</span>
                      <span className="metric-value">{Math.round(dept.avgAge)} years</span>
                    </div>
                  )}
                </div>
                <div className="department-progress">
                  <div className="progress-bar">
                    <div
                      className="progress-fill"
                      style={{
                        width: `${(dept.count / stats.overview.total * 100).toFixed(1)}%`,
                        background: ['var(--primary-gradient)', 'var(--success-gradient)', 'var(--warning-gradient)', 
                                     'var(--danger-gradient)', 'var(--secondary-gradient)'][index % 5]
                      }}
                    ></div>
                  </div>
                  <span className="progress-text">
                    {(dept.count / stats.overview.total * 100).toFixed(1)}% of workforce
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="stats-summary">
        <div className="section-header">
          <h2>Performance Metrics</h2>
          <p className="section-subtitle">Key workforce indicators and trends</p>
        </div>
        
        <div className="summary-grid">
          <div className="summary-card">
            <div className="card-header">
              <h4>Workforce Health</h4>
              <span className="card-icon">📈</span>
            </div>
            <div className="metric-grid">
              <div className="metric-item large">
                <span className="metric-label">Active Rate</span>
                <span className="metric-value large">
                  {stats?.overview?.total
                    ? ((stats.overview.active / stats.overview.total) * 100).toFixed(1)
                    : 0}%
                </span>
                <div className="metric-trend positive">
                  <span className="trend-icon">📈</span>
                  <span>+2.3% this month</span>
                </div>
              </div>
              <div className="metric-item">
                <span className="metric-label">Retention Rate</span>
                <span className="metric-value">92.5%</span>
                <div className="metric-trend positive">
                  <span className="trend-icon">✅</span>
                  <span>Above target</span>
                </div>
              </div>
              <div className="metric-item">
                <span className="metric-label">Avg Tenure</span>
                <span className="metric-value">3.2 years</span>
                <div className="metric-trend neutral">
                  <span className="trend-icon">➡️</span>
                  <span>Stable</span>
                </div>
              </div>
            </div>
          </div>

          <div className="summary-card">
            <div className="card-header">
              <h4>Key Metrics</h4>
              <span className="card-icon">📊</span>
            </div>
            <div className="metric-grid">
              <div className="metric-item">
                <span className="metric-label">Total Departments</span>
                <span className="metric-value">{stats?.departments?.length || 0}</span>
              </div>
              <div className="metric-item">
                <span className="metric-label">New Hires (30d)</span>
                <span className="metric-value">8</span>
                <div className="metric-trend positive">
                  <span className="trend-icon">➕</span>
                  <span>+3 from last month</span>
                </div>
              </div>
              <div className="metric-item">
                <span className="metric-label">Avg Salary</span>
                <span className="metric-value">$72,500</span>
              </div>
              <div className="metric-item">
                <span className="metric-label">Diversity Score</span>
                <span className="metric-value">87%</span>
                <div className="metric-trend positive">
                  <span className="trend-icon">⭐</span>
                  <span>Excellent</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default EmployeeStats;