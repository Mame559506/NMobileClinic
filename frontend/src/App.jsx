import { Routes, Route, Navigate } from 'react-router-dom'
import { useAuth } from './context/AuthContext'
import Layout from './components/layout/Layout'
import LoadingSpinner from './components/common/LoadingSpinner'

// Auth Pages
import Login from './pages/auth/Login'
import Register from './pages/auth/Register'
import ForgotPassword from './pages/auth/ForgotPassword'

// Customer Pages
import CustomerDashboard from './pages/customer/Dashboard'
import Products from './pages/customer/Products'
import ProductDetails from './pages/customer/ProductDetails'
import Cart from './pages/customer/Cart'
import Checkout from './pages/customer/Checkout'
import Orders from './pages/customer/Orders'
import OrderDetails from './pages/customer/OrderDetails'
import TrackOrder from './pages/customer/TrackOrder'
import Profile from './pages/customer/Profile'
import Repairs from './pages/customer/Repairs'
import Payments from './pages/customer/Payments'

// Admin Pages
import AdminDashboard from './pages/admin/Dashboard'
import ManageUsers from './pages/admin/ManageUsers'
import ManageProducts from './pages/admin/ManageProducts'
import ManageOrders from './pages/admin/ManageOrders'
import PaymentVerification from './pages/admin/PaymentVerification'
import Inventory from './pages/admin/Inventory'
import Reports from './pages/admin/Reports'
import ManageRepairs from './pages/admin/ManageRepairs'
import BankSettings from './pages/admin/BankSettings'
import AdminProfile from './pages/admin/Profile'
import TechDashboard from './pages/technician/Dashboard'
import TechRepairs from './pages/technician/Repairs'
import TechProfile from './pages/technician/Profile'

const ProtectedRoute = ({ children, allowedRoles = [] }) => {
  const { user, loading } = useAuth()
  if (loading) return <LoadingSpinner />
  if (!user) return <Navigate to="/login" replace />
  if (allowedRoles.length > 0 && !allowedRoles.includes(user.role)) {
    if (user.role === 'admin' || user.role === 'manager') return <Navigate to="/admin/dashboard" replace />
    if (user.role === 'technician') return <Navigate to="/technician/dashboard" replace />
    return <Navigate to="/dashboard" replace />
  }
  return children
}

const PublicRoute = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) return <LoadingSpinner />
  if (user) {
    if (user.role === 'admin' || user.role === 'manager') return <Navigate to="/admin/dashboard" replace />
    if (user.role === 'technician') return <Navigate to="/technician/dashboard" replace />
    return <Navigate to="/dashboard" replace />
  }
  return children
}

const CustomerRoute = ({ children }) => (
  <ProtectedRoute allowedRoles={['customer']}>
    <Layout>{children}</Layout>
  </ProtectedRoute>
)

// Verified-only route — unverified customers get redirected to profile
const VerifiedRoute = ({ children }) => {
  const { user, loading } = useAuth()
  if (loading) return <LoadingSpinner />
  if (!user) return <Navigate to="/login" replace />
  if (user.role !== 'customer') return <Navigate to="/dashboard" replace />
  if (!user.is_verified) return <Navigate to="/profile?verify=1" replace />
  return <Layout>{children}</Layout>
}

const AdminRoute = ({ children, roles = ['admin', 'manager'] }) => (
  <ProtectedRoute allowedRoles={roles}>
    <Layout>{children}</Layout>
  </ProtectedRoute>
)

const TechRoute = ({ children }) => (
  <ProtectedRoute allowedRoles={['technician', 'admin', 'manager']}>
    <Layout>{children}</Layout>
  </ProtectedRoute>
)

function App() {
  return (
    <Routes>
      {/* Public */}
      <Route path="/login" element={<PublicRoute><Login /></PublicRoute>} />
      <Route path="/register" element={<PublicRoute><Register /></PublicRoute>} />
      <Route path="/forgot-password" element={<PublicRoute><ForgotPassword /></PublicRoute>} />
      <Route path="/track-order/:orderNumber?" element={<TrackOrder />} />

      {/* Customer */}
      <Route path="/" element={<CustomerRoute><CustomerDashboard /></CustomerRoute>} />
      <Route path="/dashboard" element={<CustomerRoute><CustomerDashboard /></CustomerRoute>} />
      <Route path="/products" element={<CustomerRoute><Products /></CustomerRoute>} />
      <Route path="/products/:id" element={<CustomerRoute><ProductDetails /></CustomerRoute>} />
      <Route path="/cart" element={<VerifiedRoute><Cart /></VerifiedRoute>} />
      <Route path="/checkout" element={<VerifiedRoute><Checkout /></VerifiedRoute>} />
      <Route path="/orders" element={<VerifiedRoute><Orders /></VerifiedRoute>} />
      <Route path="/orders/:id" element={<VerifiedRoute><OrderDetails /></VerifiedRoute>} />
      <Route path="/profile" element={<CustomerRoute><Profile /></CustomerRoute>} />
      <Route path="/repairs" element={<CustomerRoute><Repairs /></CustomerRoute>} />
      <Route path="/payments" element={<VerifiedRoute><Payments /></VerifiedRoute>} />

      {/* Admin */}
      <Route path="/admin/dashboard" element={<AdminRoute><AdminDashboard /></AdminRoute>} />
      <Route path="/admin/users" element={<AdminRoute roles={['admin']}><ManageUsers /></AdminRoute>} />
      <Route path="/admin/products" element={<AdminRoute><ManageProducts /></AdminRoute>} />
      <Route path="/admin/orders" element={<AdminRoute><ManageOrders /></AdminRoute>} />
      <Route path="/admin/payments" element={<AdminRoute><PaymentVerification /></AdminRoute>} />
      <Route path="/admin/inventory" element={<AdminRoute><Inventory /></AdminRoute>} />
      <Route path="/admin/reports" element={<AdminRoute><Reports /></AdminRoute>} />
      <Route path="/admin/repairs" element={<AdminRoute><ManageRepairs /></AdminRoute>} />
      <Route path="/admin/bank-settings" element={<AdminRoute><BankSettings /></AdminRoute>} />
      <Route path="/admin/profile" element={<AdminRoute><AdminProfile /></AdminRoute>} />

      {/* Technician */}
      <Route path="/technician/dashboard" element={<TechRoute><TechDashboard /></TechRoute>} />
      <Route path="/technician/repairs" element={<TechRoute><TechRepairs /></TechRoute>} />
      <Route path="/technician/profile" element={<TechRoute><TechProfile /></TechRoute>} />

      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  )
}

export default App
