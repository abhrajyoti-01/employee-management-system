import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import AuthLanding from './components/AuthLanding';
import Login from './components/Login'; // AdminLogin
import EmployeeLogin from './components/EmployeeLogin';
import EmployeeRegister from './components/EmployeeRegister';
import Register from './components/Register';
import Dashboard from './components/Dashboard';
import ProtectedRoute from './components/ProtectedRoute';
import './App.css';

function App() {
  
  return (
    <AuthProvider>
      <div className="App">
        <Router>
          <Routes>
            {/* Main authentication landing page */}
            <Route path="/auth" element={<AuthLanding />} />
            
            {/* Admin authentication */}
            <Route path="/admin-login" element={<Login />} />
            <Route path="/login" element={<Login />} /> {/* Backward compatibility */}
            <Route path="/register" element={<Register />} />
            
            {/* Employee authentication */}
            <Route path="/employee-login" element={<EmployeeLogin />} />
            <Route path="/employee-register" element={<EmployeeRegister />} />
            
            {/* Protected routes */}
            <Route 
              path="/dashboard" 
              element={
                <ProtectedRoute>
                  <Dashboard />
                </ProtectedRoute>
              } 
            />
            
            {/* Default redirects */}
            <Route path="/" element={<Navigate to="/auth" replace />} />
            <Route path="*" element={<Navigate to="/auth" replace />} />
          </Routes>
        </Router>
      </div>
    </AuthProvider>
  );
}

export default App;
