import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Layout from './components/Layout';
import Login from './pages/Login';
import Vehicles from './pages/Vehicles';
import Trips from './pages/Trips';
import Maintenance from './pages/Maintenance';
import DailyTripReport from './pages/DailyTripReport';
import MaintenanceStatusReport from './pages/MaintenanceStatusReport';

function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <Routes>
          {/* Public route */}
          <Route path="/login" element={<Login />} />

          {/* Protected routes */}
          <Route
            path="/vehicles"
            element={
              <ProtectedRoute>
                <Layout><Vehicles /></Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/trips"
            element={
              <ProtectedRoute>
                <Layout><Trips /></Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/maintenance"
            element={
              <ProtectedRoute>
                <Layout><Maintenance /></Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports/daily-trips"
            element={
              <ProtectedRoute>
                <Layout><DailyTripReport /></Layout>
              </ProtectedRoute>
            }
          />
          <Route
            path="/reports/maintenance-status"
            element={
              <ProtectedRoute>
                <Layout><MaintenanceStatusReport /></Layout>
              </ProtectedRoute>
            }
          />

          {/* Default redirect */}
          <Route path="/" element={<Navigate to="/vehicles" replace />} />
          <Route path="*" element={<Navigate to="/vehicles" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}

export default App;
