import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AppProvider, AppContext } from './context/AppContext';
import Login from './pages/Login';
import Onboarding from './pages/Onboarding';
import Feed from './pages/Feed';
import Bookmarks from './pages/Bookmarks';
import ChatSidebar from './components/ChatSidebar';
import './index.css';

const ProtectedRoute = ({ children }) => {
  const { user, authLoading } = React.useContext(AppContext);
  
  if (authLoading) {
    return (
      <div className="container" style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
        <p style={{ color: 'var(--text-secondary)' }}>Loading authentication...</p>
      </div>
    );
  }
  
  if (!user) return <Navigate to="/login" replace />;
  return children;
};

function AppRoutes() {
  return (
    <Routes>
      <Route path="/login" element={<Login />} />
      <Route path="/onboarding" element={
        <ProtectedRoute>
          <Onboarding />
        </ProtectedRoute>
      } />
      <Route path="/" element={
        <ProtectedRoute>
          <Feed />
        </ProtectedRoute>
      } />
      <Route path="/bookmarks" element={
        <ProtectedRoute>
          <Bookmarks />
        </ProtectedRoute>
      } />
    </Routes>
  );
}

function App() {
  return (
    <AppProvider>
      <Router>
        <AppRoutes />
        <ChatSidebar />
      </Router>
    </AppProvider>
  );
}

export default App;
