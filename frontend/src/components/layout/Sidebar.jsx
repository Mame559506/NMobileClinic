import { NavLink, useNavigate } from 'react-router-dom'
import { FaMobileAlt, FaHome, FaBox, FaShoppingCart, FaClipboardList,
  FaTools, FaCreditCard, FaUser, FaSignOutAlt, FaTachometerAlt,
  FaUsers, FaBoxes, FaClipboardCheck, FaMoneyCheckAlt, FaWarehouse,
  FaChartBar, FaCog, FaUniversity } from 'react-icons/fa'
import { useAuth } from '../../context/AuthContext'
import { useCart } from '../../context/CartContext'

const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth()
  const { cart } = useCart()
  const cartCount = cart?.items?.reduce((t, i) => t + i.quantity, 0) || 0
  const isAdmin = user?.role === 'admin' || user?.role === 'manager'

  const customerLinks = [
    { to: '/dashboard', icon: <FaHome />, label: 'Dashboard' },
    { to: '/products', icon: <FaBox />, label: 'Products' },
    { to: '/cart', icon: <FaShoppingCart />, label: 'Shopping Cart', badge: cartCount },
    { to: '/orders', icon: <FaClipboardList />, label: 'My Orders' },
    { to: '/repairs', icon: <FaTools />, label: 'Repair Services' },
    { to: '/payments', icon: <FaCreditCard />, label: 'Payments' },
    { to: '/profile', icon: <FaUser />, label: 'My Profile' },
  ]

  const adminLinks = [
    { to: '/admin/dashboard', icon: <FaTachometerAlt />, label: 'Admin Dashboard' },
    { to: '/admin/users', icon: <FaUsers />, label: 'Users Management' },
    { to: '/admin/products', icon: <FaBoxes />, label: 'Products Management' },
    { to: '/admin/orders', icon: <FaClipboardCheck />, label: 'Orders Management' },
    { to: '/admin/payments', icon: <FaMoneyCheckAlt />, label: 'Payments Verification' },
    { to: '/admin/inventory', icon: <FaWarehouse />, label: 'Inventory' },
    { to: '/admin/reports', icon: <FaChartBar />, label: 'Reports & Analytics' },
    { to: '/admin/repairs', icon: <FaTools />, label: 'Repair Requests' },
    { to: '/admin/bank-settings', icon: <FaUniversity />, label: 'Bank Settings' },
    { to: '/admin/profile', icon: <FaUser />, label: 'My Profile' },
  ]

  const techLinks = [
    { to: '/technician/dashboard', icon: <FaTachometerAlt />, label: 'Dashboard' },
    { to: '/technician/repairs', icon: <FaTools />, label: 'Repair Assignments' },
    { to: '/profile', icon: <FaUser />, label: 'My Profile' },
  ]

  const links = isAdmin ? adminLinks : user?.role === 'technician' ? techLinks : customerLinks

  return (
    <div className={`sidebar ${isOpen ? 'open' : ''}`}>
      <div className="sidebar-header">
        <div className="logo">
          <FaMobileAlt /> NancyMobile
        </div>
      </div>
      <ul className="sidebar-menu">
        {links.map(({ to, icon, label, badge }) => (
          <li key={to}>
            <NavLink to={to} onClick={onClose}
              className={({ isActive }) => isActive ? 'active' : ''}>
              {icon} {label}
              {badge > 0 && <span className="menu-badge">{badge}</span>}
            </NavLink>
          </li>
        ))}
      </ul>
      <div style={{ padding: '20px', marginTop: 'auto', borderTop: '1px solid #eee' }}>
        <button className="btn btn-outline" style={{ width: '100%' }} onClick={logout}>
          <FaSignOutAlt style={{ marginRight: 8 }} /> Logout
        </button>
      </div>
    </div>
  )
}

export default Sidebar
