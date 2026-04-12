import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FaTruck, FaLock } from 'react-icons/fa'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import api from '../../services/api'
import toast from 'react-hot-toast'

export default function DeliveryTasks() {
  const { user } = useAuth()
  const { t } = useLanguage()
  const [jobs, setJobs] = useState([])
  const [loading, setLoading] = useState(true)
  const isVerified = user?.is_verified

  useEffect(() => {
    if (!isVerified) { setLoading(false); return }
    api.get('/delivery/jobs').then(r => {
      if (r.data.success) setJobs(r.data.jobs)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [isVerified])

  const updateStatus = async (id, status) => {
    try {
      const r = await api.put(`/delivery/jobs/${id}`, { status })
      if (r.data.success) {
        setJobs(prev => prev.map(j => j.id === id ? r.data.job : j))
        toast.success('Status updated')
      }
    } catch { toast.error('Failed to update') }
  }

  const statusClass = (s) => {
    if (s === 'completed') return 'status-badge status-completed'
    if (s === 'in-progress') return 'status-badge status-processing'
    if (s === 'cancelled') return 'status-badge status-cancelled'
    return 'status-badge status-pending'
  }

  if (!isVerified) return (
    <div className="page">
      <h2 style={{ marginBottom: 20 }}><FaTruck style={{ marginRight: 8, color: 'var(--primary)' }} />Tasks</h2>
      <div style={{ background: 'rgba(248,150,30,0.1)', border: '1px solid var(--warning)', borderRadius: 8, padding: '24px 20px', display: 'flex', alignItems: 'center', gap: 16 }}>
        <FaLock style={{ color: 'var(--warning)', fontSize: 28, flexShrink: 0 }} />
        <div>
          <strong style={{ color: 'var(--warning)', display: 'block', marginBottom: 6 }}>{t('accountNotVerified')}</strong>
          <p style={{ fontSize: 13, color: 'var(--gray)', margin: 0 }}>{user?.verification_status === 'pending' ? t('verificationPending') : t('verificationComplete')}</p>
        </div>
        <Link to="/delivery/profile" className="btn" style={{ marginLeft: 'auto' }}>{t('completeProfile')}</Link>
      </div>
    </div>
  )

  const pending = jobs.filter(j => j.status === 'pending')
  const active = jobs.filter(j => j.status === 'in-progress')

  return (
    <div className="page">
      <h2 style={{ marginBottom: 20 }}><FaTruck style={{ marginRight: 8, color: 'var(--primary)' }} />Delivery Tasks</h2>

      {active.length > 0 && (
        <div className="card" style={{ marginBottom: 20, border: '2px solid var(--primary)' }}>
          <div className="card-header"><h3 className="card-title">Active ({active.length})</h3></div>
          {active.map(j => <JobCard key={j.id} job={j} onUpdate={updateStatus} statusClass={statusClass} />)}
        </div>
      )}

      <div className="card">
        <div className="card-header"><h3 className="card-title">Pending ({pending.length})</h3></div>
        {loading ? <p style={{ padding: 20 }}>{t('loading')}</p> : pending.length === 0
          ? <p style={{ color: 'var(--gray)', textAlign: 'center', padding: 20 }}>No pending tasks.</p>
          : pending.map(j => <JobCard key={j.id} job={j} onUpdate={updateStatus} statusClass={statusClass} />)
        }
      </div>
    </div>
  )
}

function JobCard({ job, onUpdate, statusClass }) {
  return (
    <div style={{ padding: '16px 20px', borderBottom: '1px solid #eee' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', flexWrap: 'wrap', gap: 10 }}>
        <div>
          <div style={{ fontWeight: 600, marginBottom: 4 }}>Order: {job.order_number || `#${job.order_id}`}</div>
          <div style={{ fontSize: 13, color: 'var(--gray)' }}>Customer: {job.customer_first} {job.customer_last} {job.customer_phone && `· ${job.customer_phone}`}</div>
          <div style={{ fontSize: 13, color: 'var(--gray)', marginTop: 4 }}>Deliver to: {job.delivery_address || job.shipping_address || '—'}</div>
          {job.notes && <div style={{ fontSize: 12, color: 'var(--gray)', marginTop: 4 }}>Note: {job.notes}</div>}
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 8 }}>
          <span className={statusClass(job.status)}>{job.status}</span>
          <div style={{ display: 'flex', gap: 6 }}>
            {job.status === 'pending' && (
              <button className="btn btn-success" style={{ fontSize: 12, padding: '5px 12px' }} onClick={() => onUpdate(job.id, 'in-progress')}>
                Start
              </button>
            )}
            {job.status === 'in-progress' && (
              <button className="btn btn-success" style={{ fontSize: 12, padding: '5px 12px' }} onClick={() => onUpdate(job.id, 'completed')}>
                Complete
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
