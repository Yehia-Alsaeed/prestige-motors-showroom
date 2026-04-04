import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import MainLayout from './components/layouts/MainLayout';
import AdminLayout from './components/layouts/AdminLayout';

import Home from './pages/Home';
import About from './pages/About';
import Contact from './pages/Contact';
import Cars from './pages/Cars';
import UsedCars from './pages/UsedCars';
import CarDetails from './pages/CarDetails';
import Login from './pages/Login';
import Register from './pages/Register';
import CustomerDashboard from './pages/CustomerDashboard';
import SubmitListing from './pages/SubmitListing';

import AdminDashboard from './pages/admin/AdminDashboard';
import ManageCars from './pages/admin/ManageCars';
import ManageReservations from './pages/admin/ManageReservations';
import ManageCustomers from './pages/admin/ManageCustomers';
import AdminLogin from './pages/admin/AdminLogin';
import NotFound from './pages/NotFound';
import { AuthProvider, useAuth } from './context/AuthContext';
import { Toaster } from 'react-hot-toast';

const ProtectedRoute = ({ children, adminOnly = false }: { children: React.ReactElement, adminOnly?: boolean }) => {
  const { user, role } = useAuth();
  
  if (!user) return <Navigate to="/login" />;
  if (adminOnly && role !== 'admin') return <Navigate to="/" />;
  
  return children;
};

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Toaster position="top-right" toastOptions={{
          style: {
            background: '#161A20',
            color: '#F5F7FA',
            border: '1px solid #3A4250'
          }
        }} />
        <Routes>
          {/* Customer Routes */}
          <Route element={<MainLayout />}>
            <Route path="/" element={<Home />} />
            <Route path="/cars" element={<Cars />} />
            <Route path="/used-cars" element={<UsedCars />} />
            <Route path="/cars/:id" element={<CarDetails />} />
            <Route path="/about" element={<About />} />
            <Route path="/contact" element={<Contact />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
            
            <Route path="/dashboard" element={
              <ProtectedRoute><CustomerDashboard /></ProtectedRoute>
            } />
            <Route path="/sell-your-car" element={
              <ProtectedRoute><SubmitListing /></ProtectedRoute>
            } />
          </Route>

          {/* Admin Routes */}
          <Route path="/admin/login" element={<AdminLogin />} />
          <Route path="/admin" element={<ProtectedRoute adminOnly><AdminLayout /></ProtectedRoute>}>
            <Route index element={<AdminDashboard />} />
            <Route path="cars" element={<ManageCars />} />
            <Route path="reservations" element={<ManageReservations />} />
            <Route path="approvals" element={<ManageCustomers />} />
          </Route>
          
          {/* Catch-all Route */}
          <Route path="*" element={<NotFound />} />
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
