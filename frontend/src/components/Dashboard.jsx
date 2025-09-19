import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { employeeAPI } from '../services/api';
import EmployeeList from './EmployeeList';
import EmployeeForm from './EmployeeForm';
import EmployeeStats from './EmployeeStats';
import './Dashboard.css';

const Dashboard = () => {
  const { user, userType, logout, isAuthenticated, loading: authLoading, isAdmin, isEmployee } = useAuth();
  const [activeTab, setActiveTab] = useState('overview');
  const [employees, setEmployees] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [showEmployeeForm, setShowEmployeeForm] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState(null);
  const [filters, setFilters] = useState({
    search: '',
    department: '',
    status: '',
    page: 1,
    limit: 10
  });
  const [pagination, setPagination] = useState({});
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [stats, setStats] = useState({ overview: { total: 0, active: 0, inactive: 0 } });

  useEffect(() => {
    // Fetch stats as soon as authentication is ready
    if (isAuthenticated && !authLoading) {
      fetchStats();
      
      // Listen for stats updates from the EmployeeStats component
      const handleStatsUpdated = (event) => {
        setStats(event.detail);
      };
      
      window.addEventListener('statsUpdated', handleStatsUpdated);
      
      return () => {
        window.removeEventListener('statsUpdated', handleStatsUpdated);
      };
    }
  }, [isAuthenticated, authLoading]);

  useEffect(() => {
    // Only fetch when the employees tab is active, auth is ready, user is admin, and we have valid credentials
    if (activeTab === 'employees' && isAuthenticated && !authLoading && isAdmin) {
      const token = localStorage.getItem('token');
      if (token) {
        // Add a small delay to ensure auth state is fully settled
        const timer = setTimeout(() => {
          fetchEmployees();
        }, 200);
        
        return () => clearTimeout(timer);
      } else {
        logout();
      }
    }
  }, [activeTab, filters, isAuthenticated, authLoading, isAdmin]);
  
  const fetchStats = async () => {
    try {
      const token = localStorage.getItem('token');
      if (!token || !isAuthenticated) return;
      
      const response = await employeeAPI.getStats();
      setStats(response.data.data);
    } catch (error) {
      console.error('Error fetching stats:', error);
    }
  };

  const fetchEmployees = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Check if we have a valid token before making the request
      const token = localStorage.getItem('token');
      if (!token) {
        setError('No authentication token found. Please login again.');
        logout();
        return;
      }
      
      // Check if we're authenticated
      if (!isAuthenticated) {
        setError('Not authenticated. Please login again.');
        logout();
        return;
      }
      
      // Filter out empty string values from filters
      const cleanFilters = Object.fromEntries(
        Object.entries(filters).filter(([key, value]) => value !== '' && value != null)
      );
      
      const response = await employeeAPI.getAll(cleanFilters);
      setEmployees(response.data.data.employees);
      setPagination(response.data.data.pagination);
    } catch (error) {
      // Handle different types of errors
      if (error.response?.status === 401) {
        setError('Authentication failed. Please login again.');
        logout();
      } else if (error.response?.status === 403) {
        setError('Access denied. Insufficient permissions.');
      } else if (error.code === 'NETWORK_ERROR') {
        setError('Network error. Please check your connection.');
      } else {
        setError('Failed to fetch employees. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleEmployeeSubmit = async (employeeData) => {
    try {
      if (editingEmployee) {
        await employeeAPI.update(editingEmployee._id, employeeData);
      } else {
        await employeeAPI.create(employeeData);
      }
      setShowEmployeeForm(false);
      setEditingEmployee(null);
      fetchEmployees();
    } catch (error) {
      throw error;
    }
  };

  const handleEmployeeEdit = (employee) => {
    setEditingEmployee(employee);
    setShowEmployeeForm(true);
  };

  const handleEmployeeDelete = async (employeeId) => {
    if (window.confirm('Are you sure you want to delete this employee?')) {
      try {
        await employeeAPI.delete(employeeId);
        fetchEmployees();
      } catch (error) {
        setError('Failed to delete employee');
      }
    }
  };

  const handleFilterChange = (newFilters) => {
    setFilters({ ...filters, ...newFilters, page: 1 });
  };

  const handlePageChange = (page) => {
    setFilters({ ...filters, page });
  };

  const handleRetryFetch = () => {
    fetchEmployees();
  };

  const renderContent = () => {
    switch (activeTab) {
      case 'overview':
        return <EmployeeStats />;
      case 'employees':
        return (
          <EmployeeList
            employees={employees}
            loading={loading}
            error={error}
            pagination={pagination}
            filters={filters}
            onFilterChange={handleFilterChange}
            onPageChange={handlePageChange}
            onEdit={handleEmployeeEdit}
            onDelete={handleEmployeeDelete}
            onAddNew={() => {
              setEditingEmployee(null);
              setShowEmployeeForm(true);
            }}
            onRetry={handleRetryFetch}
          />
        );
      default:
        return <EmployeeStats />;
    }
  };

  return (
    <div className="dashboard">
      {/* Mobile Sidebar Toggle */}
      <button
        className="mobile-sidebar-toggle"
        onClick={() => setSidebarOpen(!sidebarOpen)}
        aria-label="Open menu"
      >
        <span className="hamburger-line"></span>
        <span className="hamburger-line"></span>
        <span className="hamburger-line"></span>
      </button>

      <div className={`sidebar ${sidebarOpen ? 'open' : ''}`}>
        <div className="sidebar-header">
          <div className="logo">
            <div className="logo-icon logo-icon-enhanced">👥</div>
            <h3>HR Dashboard</h3>
          </div>
          <button
            className="sidebar-toggle"
            onClick={() => setSidebarOpen(false)}
            aria-label="Close menu"
          >
            ×
          </button>
        </div>

        <div className="sidebar-section">
          <h4 className="sidebar-section-title">DASHBOARD</h4>
          <nav className="sidebar-nav">
            <button
              className={`nav-item nav-item-primary ${activeTab === 'overview' ? 'active' : ''}`}
              onClick={() => {
                setActiveTab('overview');
                setSidebarOpen(false);
              }}
            >
              <span className="nav-icon nav-icon-dashboard">👤</span>
              <span className="nav-text">HR Dashboard</span>
            </button>
          </nav>
          
          {isAdmin && (
            <>
              <div className="sidebar-divider"></div>
              <h4 className="sidebar-section-title">MANAGEMENT</h4>
              <nav className="sidebar-nav">
                <button
                  className={`nav-item ${activeTab === 'employees' ? 'active' : ''}`}
                  onClick={() => {
                    setActiveTab('employees');
                    setSidebarOpen(false);
                  }}
                >
                  <span className="nav-icon nav-icon-employees">👥</span>
                  <span className="nav-text">Employees</span>
                  <span className="nav-badge">{stats?.overview?.total || 0}</span>
                </button>
              </nav>
            </>
          )}

          {isEmployee && (
            <>
              <div className="sidebar-divider"></div>
              <h4 className="sidebar-section-title">MY ACCOUNT</h4>
              <nav className="sidebar-nav">
                <button className="nav-item">
                  <span className="nav-icon">📋</span>
                  <span className="nav-text">My Profile</span>
                </button>
              </nav>
            </>
          )}
        </div>

        <div className="sidebar-footer">
          <div className="user-profile">
            <div className="user-avatar">
              {user?.username?.charAt(0).toUpperCase() || 'A'}
            </div>
            <div className="user-info">
              <div className="user-name">
                {user?.username || user?.email || user?.name}
              </div>
              <div className={`user-role ${userType === 'admin' ? 'admin-role' : ''}`}>
                {userType === 'admin' ? 'Administrator' : 'Employee'}
              </div>
            </div>
            {userType === 'admin' && <div className="admin-badge">Admin</div>}
          </div>
          <button className="logout-btn" onClick={logout}>
            <span className="logout-icon">🚪</span>
            <span className="logout-text">Logout</span>
            <span className="logout-arrow">→</span>
          </button>
        </div>
      </div>

      <div className="dashboard-main">
        <header className="dashboard-header">
          <div className="header-content">
            <h1 className="header-title">{activeTab === 'overview' ? 'Dashboard Overview' : 'Employee Management'}</h1>
            <p className="header-subtitle">
              {activeTab === 'overview' ? 'Welcome back! Here\'s your latest HR analytics' : 'Manage your workforce efficiently'}
            </p>
          </div>
          <div className="header-actions">
            <div className="date-display">
              {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
            </div>
          </div>
        </header>
        
        <main className="dashboard-content">
          {renderContent()}
        </main>

        {showEmployeeForm && (
          <div className="modal-overlay">
            <EmployeeForm
              employee={editingEmployee}
              onSubmit={handleEmployeeSubmit}
              onCancel={() => {
                setShowEmployeeForm(false);
                setEditingEmployee(null);
              }}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default Dashboard;