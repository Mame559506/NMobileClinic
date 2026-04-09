import { FaBars, FaMobileAlt } from 'react-icons/fa'
import { useAuth } from '../../context/AuthContext'

const Topbar = ({ onMenuClick }) => {
  const { user } = useAuth()
  const initials = user ? `${user.firstName?.[0] || ''}${user.lastName?.[0] || ''}`.toUpperCase() : 'U'

  return (
    <div className="topbar">
      <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
        <button onClick={onMenuClick}
          style={{ background: 'none', border: 'none', fontSize: 20, cursor: 'pointer', display: 'none' }}
          className="menu-toggle">
          <FaBars />
        </button>
        <h2 style={{ fontSize: 20, fontWeight: 600, color: 'var(--dark)' }}>
          <FaMobileAlt style={{ color: 'var(--primary)', marginRight: 8 }} />
          NancyMobile
        </h2>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <div className="user-avatar">{initials}</div>
        <div>
          <div style={{ fontWeight: 600, fontSize: 14 }}>{user?.firstName} {user?.lastName}</div>
          <div style={{ fontSize: 12, color: 'var(--gray)' }}>
            {user?.role === 'admin' ? 'Administrator' : user?.role === 'manager' ? 'Manager' : 'Customer'}
          </div>
        </div>
      </div>
    </div>
  )
}

export default Topbar
