import React from 'react';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { AuthProvider, useAuth } from './context/AuthContext';
import { GameProvider } from './context/GameContext';

// Layouts
import AdminLayout from './components/layout/AdminLayout';

// Pages
import LoginPage from './pages/LoginPage';
import DashboardPage from './pages/DashboardPage';
import UsersPage from './pages/UsersPage';
import OrdersPage from './pages/OrdersPage';
import TopUpPage from './pages/TopUpPage';
import GamesPage from './pages/GamesPage';
import ActivityLogsPage from './pages/ActivityLogsPage';
import TopUpLogsPage from './pages/TopUpLogsPage';
import PurchasePage from './pages/PurchasePage';

// Protected route component
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { admin, loading } = useAuth();
  
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-600"></div>
      </div>
    );
  }
  
  if (!admin) {
    return <Navigate to="/login" />;
  }
  
  return <>{children}</>;
};

const AppRoutes: React.FC = () => {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/login" element={<LoginPage />} />
        
        <Route 
          path="/admin" 
          element={
            <ProtectedRoute>
              <AdminLayout />
            </ProtectedRoute>
          }
        >
          <Route path="dashboard" element={<DashboardPage />} />
          <Route path="users" element={<UsersPage />} />
          <Route path="orders" element={<OrdersPage />} />
          <Route path="purchase" element={<PurchasePage />} />
          <Route path="topup" element={<TopUpPage />} />
          <Route path="topups" element={<TopUpLogsPage />} />
          <Route path="games" element={<GamesPage />} />
          <Route path="activity" element={<ActivityLogsPage />} />
          <Route index element={<Navigate to="/admin/dashboard" replace />} />
        </Route>
        
        <Route path="/" element={<Navigate to="/admin/dashboard" replace />} />
        <Route path="*" element={<Navigate to="/admin/dashboard" replace />} />
      </Routes>
    </BrowserRouter>
  );
};

function App() {
  return (
    <AuthProvider>
      <GameProvider>
        <AppRoutes />
        <Toaster position="top-right" />
      </GameProvider>
    </AuthProvider>
  );
}

export default App;