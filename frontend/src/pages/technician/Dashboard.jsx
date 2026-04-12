import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FaTools, FaSpinner, FaCheckCircle, FaInbox, FaLock } from 'react-icons/fa'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import api from '../../services/api'

export default function TechDashboard() {
  const { user } = useAuth()
  const { t } = useLanguage()
  const [stats, setStats] = useState({ assigned: 0, inProgress: 0, completed: 0, unassigned: 0 })

  const isVerified = user?.is_verified

  useEffect(() => {
    if (!isVerified) return
    api.get('/technician/stats').then(r => {
      if (r.data.success) setStats(r.data.stats)
    }).catch(() => {})
  }, [isVerified])

  const cards = [
    { label: t('myAssigned'), value: stats.assigned, icon: <FaTools />, color: 'primary' },
    { label: t('inProgress'), value: stats.inProgress, icon: <FaSpinner />, color: 'warning' },
    { label: t('completed'), value: stats.completed, icon: <FaCheckCircle />, color: 'success' },
    { label: t('unassigned'), value: stats.unassigned, icon: <FaInbox />, color: 'danger' },
  ]

  return (
    <div className="page">
      <h2 style={{ marginBottom: 20 }}>{t('welcome')}, {user?.firstName}!</h2>

      {/* Verification gate */}
      {!isVerified && (
        <div style={{
          background: 'rgba(248,150,30,0.1)', border: '1px solid var(--warning)',
          borderRadius: 8, padding: '16px 20px', marginBottom: 24,
          display: 'flex', alignItems: 'center', gap: 14
        }}>
          <FaLock style={{ color: 'var(--warning)', fontSize: 22, flexShrink: 0 }} />
          <div>
            <strong style={{ color: 'var(--warning)', display: 'block', marginBottom: 4 }}>
              {t('accountNotVerified')}
            </strong>
            <p style={{ fontSize: 13, color: 'var(--gray)', margin: 0 }}>
              {user?.verification_status === 'pending'
                ? t('verificationPending')
                : t('verificationComplete')}
            </p>
          </div>
          <Link to="/profile" className="btn" style={{ marginLeft: 'auto', whiteSpace: 'nowrap' }}>
            {t('completeProfile')}
          </Link>
        </div>
      )}

      <div className="stats-grid" style={{ opacity: isVerified ? 1 : 0.4, pointerEvents: isVerified ? 'auto' : 'none' }}>
        {cards.map((c, i) => (
          <div className="stat-card" key={i}>
            <div className={`stat-icon ${c.color}`}>{c.icon}</div>
            <div className="stat-info"><h3>{c.value}</h3><p>{c.label}</p></div>
          </div>
        ))}
      </div>

      <div className="card" style={{ textAlign: 'center', padding: 30, marginTop: 20, opacity: isVerified ? 1 : 0.4 }}>
        <FaTools style={{ fontSize: 48, color: 'var(--primary)', marginBottom: 15 }} />
        <h3 style={{ marginBottom: 10 }}>{isVerified ? t('readyToWork') : t('accountNotVerified')}</h3>
        <p style={{ color: 'var(--gray)', marginBottom: 20 }}>
          {isVerified ? t('viewAndManageRepairs') : t('verificationPending')}
        </p>
        {isVerified && <Link to="/technician/repairs" className="btn">{t('viewRepairs')}</Link>}
      </div>
    </div>
  )
}
