import { FaBars, FaMobileAlt, FaSignOutAlt } from 'react-icons/fa'
import { useAuth } from '../../context/AuthContext'
import { useNavigate } from 'react-router-dom'

const Topbar = ({ onMenuClick }) => {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const initials = user ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() : 'U'

  const profilePath = user?.role === 'admin' || user?.role === 'manager'
    ? '/admin/profile'
    : '/profile'

  return (
    <div className="topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
        <button onClick={onMenuClick}
          style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', color: 'var(--dark)' }}
          className="menu-toggle">
          <FaBars />
        </button>
        <h2 style={{ fontSize: 20, fontWeight: 600, color: 'var(--dark)' }}>
          <FaMobileAlt style={{ color: 'var(--primary)', marginRight: 8 }} />
          NancyMobile
        </h2>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
        <div onClick={() => navigate(profilePath)}
          style={{ display: 'flex', alignItems: 'center', gap: 8, cursor: 'pointer' }}>
          {user?.profileImage
            ? <img src={user.profileImage} alt="avatar" style={{ width: 36, height: 36, borderRadius: '50%', objectFit: 'cover' }} />
            : <div className="user-avatar">{initials}</div>
          }
          <div className="topbar-user-name">
            <div style={{ fontWeight: 600, fontSize: 14 }}>{user?.firstName} {user?.lastName}</div>
            <div style={{ fontSize: 12, color: 'var(--gray)' }}>
              {user?.role === 'admin' ? 'Administrator' : user?.role === 'manager' ? 'Manager' : user?.role === 'technician' ? 'Technician' : 'Customer'}
            </div>
          </div>
        </div>
        <button onClick={logout}
          title="Logout"
          style={{ background: 'none', border: '1px solid #ddd', borderRadius: 6, padding: '6px 10px', cursor: 'pointer', color: 'var(--danger)', display: 'flex', alignItems: 'center', gap: 5, fontSize: 13 }}>
          <FaSignOutAlt />
          <span className="topbar-user-name">Logout</span>
        </button>
      </div>
    </div>
  )
}

export default Topbar
