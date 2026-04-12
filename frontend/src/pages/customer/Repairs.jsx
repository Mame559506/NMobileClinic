import { useState, useEffect } from 'react'
import { FaTools, FaPlus } from 'react-icons/fa'
import { useLanguage } from '../../context/LanguageContext'
import api from '../../services/api'
import toast from 'react-hot-toast'

export default function Repairs() {
  const [repairs, setRepairs] = useState([])
  const [loading, setLoading] = useState(true)
  const [showForm, setShowForm] = useState(false)
  const [form, setForm] = useState({ device_type: '', issue_description: '' })
  const { t } = useLanguage()

  useEffect(() => {
    api.get('/repairs').then(r => {
      if (r.data.success) setRepairs(r.data.repairs || [])
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const handleSubmit = async (e) => {
    e.preventDefault()
    try {
      const r = await api.post('/repairs', form)
      if (r.data.success) {
        setRepairs(prev => [r.data.repair, ...prev])
        setForm({ device_type: '', issue_description: '' })
        setShowForm(false)
        toast.success(t('repairSubmitted'))
      }
    } catch { toast.error('Failed to submit repair request') }
  }

  const statusClass = (s) => {
    if (s === 'completed') return 'status-badge status-completed'
    if (s === 'in-progress') return 'status-badge status-processing'
    if (s === 'cancelled') return 'status-badge status-cancelled'
    return 'status-badge status-pending'
  }

  return (
    <div className="page">
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 20 }}>
        <h2><FaTools style={{ marginRight: 8, color: 'var(--primary)' }} />{t('repairServices')}</h2>
        <button className="btn" onClick={() => setShowForm(!showForm)}>
          <FaPlus style={{ marginRight: 6 }} /> {t('newRequest')}
        </button>
      </div>

      {showForm && (
        <div className="card" style={{ marginBottom: 20 }}>
          <h3 style={{ marginBottom: 15 }}>{t('submitRepairRequest')}</h3>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>{t('deviceType')}</label>
              <input className="form-control" placeholder="e.g. iPhone 13 Pro, Samsung Galaxy S22"
                value={form.device_type} onChange={e => setForm({ ...form, device_type: e.target.value })} required />
            </div>
            <div className="form-group">
              <label>{t('issueDescription')}</label>
              <textarea className="form-control" rows="3" placeholder={t('issueDescription')}
                value={form.issue_description} onChange={e => setForm({ ...form, issue_description: e.target.value })} required />
            </div>
            <div style={{ display: 'flex', gap: 10 }}>
              <button className="btn btn-success" type="submit">{t('submitRequest')}</button>
              <button className="btn btn-outline" type="button" onClick={() => setShowForm(false)}>{t('cancel')}</button>
            </div>
          </form>
        </div>
      )}

      <div className="card">
        <div className="card-header">
          <h3 className="card-title">{t('myRepairRequests')}</h3>
        </div>
        {loading ? <p>{t('loading')}</p> : repairs.length === 0 ? (
          <p style={{ color: 'var(--gray)', textAlign: 'center', padding: 20 }}>{t('noRepairsYet')}</p>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr><th>ID</th><th>{t('deviceType')}</th><th>{t('issueDescription')}</th><th>{t('status')}</th><th>{t('estimatedCost')}</th><th>{t('date')}</th></tr>
              </thead>
              <tbody>
                {repairs.map(r => (
                  <tr key={r.id}>
                    <td>#{r.id}</td>
                    <td>{r.device_type}</td>
                    <td>{r.issue_description}</td>
                    <td><span className={statusClass(r.status)}>{r.status}</span></td>
                    <td>{r.estimated_cost ? `ETB ${r.estimated_cost}` : 'TBD'}</td>
                    <td>{new Date(r.created_at).toLocaleDateString()}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  )
}

