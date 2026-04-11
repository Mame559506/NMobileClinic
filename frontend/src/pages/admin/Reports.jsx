import { useState, useEffect } from 'react'
import { FaChartBar, FaShoppingBag, FaMoneyBillWave, FaUsers } from 'react-icons/fa'
import api from '../../services/api'

export default function Reports() {
  const [stats, setStats] = useState(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/admin/dashboard/stats').then(r => {
      if (r.data.success) setStats(r.data.stats)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  return (
    <div className="page">
      <h2 style={{ marginBottom: 20 }}><FaChartBar style={{ marginRight: 8, color: 'var(--primary)' }} />Reports & Analytics</h2>

      {loading ? <p>Loading...</p> : (
        <>
          <div className="stats-grid">
            {[
              { label: 'Total Revenue', value: `ETB ${parseFloat(stats?.revenue || 0).toFixed(2)}`, icon: <FaMoneyBillWave />, color: 'success' },
              { label: 'Total Orders', value: stats?.orders || 0, icon: <FaShoppingBag />, color: 'primary' },
              { label: 'Total Users', value: stats?.users || 0, icon: <FaUsers />, color: 'warning' },
              { label: 'Pending Orders', value: stats?.pending_orders || 0, icon: <FaShoppingBag />, color: 'danger' },
            ].map((s, i) => (
              <div className="stat-card" key={i}>
                <div className={`stat-icon ${s.color}`}>{s.icon}</div>
                <div className="stat-info"><h3>{s.value}</h3><p>{s.label}</p></div>
              </div>
            ))}
          </div>

          <div className="card">
            <div className="card-header"><h3 className="card-title">Summary</h3></div>
            <p style={{ color: 'var(--gray)', padding: '10px 0' }}>
              Full chart analytics coming soon. Connect a charting library like Chart.js for visual reports.
            </p>
          </div>
        </>
      )}
    </div>
  )
}

