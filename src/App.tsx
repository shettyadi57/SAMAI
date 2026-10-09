import React from 'react';
import { BrowserRouter, Routes, Route, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { DataProvider } from './context/DataContext';

import { Navbar } from './components/layout/Navbar';
import { Sidebar } from './components/layout/Sidebar';
import { SafetyCopilot } from './components/copilot/SafetyCopilot';

import { LoginPage } from './pages/LoginPage';
import { CitizenDashboard } from './pages/CitizenDashboard';
import { CitizenReportPage } from './pages/CitizenReportPage';
import { AuthorityDashboard } from './pages/AuthorityDashboard';
import { AuthorityReportsPage } from './pages/AuthorityReportsPage';
import { AuthorityHotspotsPage } from './pages/AuthorityHotspotsPage';
import { AuthorityAnalyticsPage } from './pages/AuthorityAnalyticsPage';
import { RiskPredictorPage } from './pages/RiskPredictorPage';
import { ProfilePage } from './pages/ProfilePage';

// Route protection for Authority
const AuthorityRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { user, role, isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (role !== 'authority') {
    return <Navigate to="/citizen/dashboard" replace />;
  }
  return <>{children}</>;
};

// Route protection for authenticated user
const ProtectedRoute: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  return <>{children}</>;
};

// App Layout Wrapper
const AppLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const location = useLocation();
  const isLoginPage = location.pathname === '/login';

  if (isLoginPage) {
    return <>{children}</>;
  }

  return (
    <div className="min-h-screen flex flex-col bg-navy-950 font-sans">
      <Navbar />
      <div className="flex-1 flex overflow-hidden">
        <Sidebar />
        <main className="flex-1 flex flex-col min-w-0 overflow-hidden relative">
          {children}
        </main>
      </div>
      <SafetyCopilot />
    </div>
  );
};

// Root index redirector
const RootRedirect: React.FC = () => {
  const { role, isAuthenticated } = useAuth();
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }
  if (role === 'authority') {
    return <Navigate to="/authority/dashboard" replace />;
  }
  return <Navigate to="/citizen/dashboard" replace />;
};

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <DataProvider>
        <BrowserRouter>
          <AppLayout>
            <Routes>
              {/* Root */}
              <Route path="/" element={<RootRedirect />} />

              {/* Login */}
              <Route path="/login" element={<LoginPage />} />

              {/* Citizen Routes */}
              <Route
                path="/citizen/dashboard"
                element={
                  <ProtectedRoute>
                    <CitizenDashboard />
                  </ProtectedRoute>
                }
              />
              <Route
                path="/citizen/report"
                element={
                  <ProtectedRoute>
                    <CitizenReportPage />
                  </ProtectedRoute>
                }
              />

              {/* Authority Routes (Protected for Authority role) */}
              <Route
                path="/authority/dashboard"
                element={
                  <AuthorityRoute>
                    <AuthorityDashboard />
                  </AuthorityRoute>
                }
              />
              <Route
                path="/authority/reports"
                element={
                  <AuthorityRoute>
                    <AuthorityReportsPage />
                  </AuthorityRoute>
                }
              />
              <Route
                path="/authority/hotspots"
                element={
                  <AuthorityRoute>
                    <AuthorityHotspotsPage />
                  </AuthorityRoute>
                }
              />
              <Route
                path="/authority/analytics"
                element={
                  <AuthorityRoute>
                    <AuthorityAnalyticsPage />
                  </AuthorityRoute>
                }
              />
              <Route
                path="/authority/predictor"
                element={
                  <AuthorityRoute>
                    <RiskPredictorPage />
                  </AuthorityRoute>
                }
              />
              <Route
                path="/predictor"
                element={
                  <ProtectedRoute>
                    <RiskPredictorPage />
                  </ProtectedRoute>
                }
              />

              {/* Profile Route */}
              <Route
                path="/profile"
                element={
                  <ProtectedRoute>
                    <ProfilePage />
                  </ProtectedRoute>
                }
              />

              {/* Catch-all */}
              <Route path="*" element={<RootRedirect />} />
            </Routes>
          </AppLayout>
        </BrowserRouter>
      </DataProvider>
    </AuthProvider>
  );
};

export default App;
