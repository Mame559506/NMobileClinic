import { useState, useEffect } from 'react'
import { FaCreditCard, FaCheckCircle, FaClock, FaTimesCircle } from 'react-icons/fa'
import api from '../../services/api'

const bankLabel = (m) => {
  const map = { cbe: 'CBE', abyssinia: 'Bank of Abyssinia', awash: 'Awash Bank', bank_transfer: 'Bank Transfer' }
  return map[m] || m || '-'
}

export default function Payments() {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    api.get('/payments').then(r => {
      if (r.data.success) setPayments(r.data.payments || [])
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const statusIcon = (s) => {
    if (s === 'completed') return <FaCheckCircle style={{ color: '#28a745', marginRight: 5 }} />
    if (s === 'rejected') return <FaTimesCircle style={{ color: 'var(--danger)', marginRight: 5 }} />
    return <FaClock style={{ color: 'var(--warning)', marginRight: 5 }} />
  }

  const statusClass = (s) => {
    if (s === 'completed') return 'status-badge status-completed'
    if (s === 'rejected') return 'status-badge status-cancelled'
    return 'status-badge status-pending'
  }

  return (
    <div className="page">
      <h2 style={{ marginBottom: 20 }}><FaCreditCard style={{ marginRight: 8, color: 'var(--primary)' }} />My Payments</h2>
      <div className="card">
        <div className="card-header"><h3 className="card-title">Payment History</h3></div>
        {loading ? <p>Loading...</p> : payments.length === 0 ? (
          <p style={{ color: 'var(--gray)', textAlign: 'center', padding: 20 }}>No payments yet.</p>
        ) : (
          <div className="table-responsive">
            <table className="data-table">
              <thead>
                <tr><th>Order</th><th>Amount</th><th>Bank</th><th>Transaction ID</th><th>Status</th><th>Date</th></tr>
              </thead>
              <tbody>
                {payments.map(p => (
                  <tr key={p.id}>
                    <td>{p.order_number || `#${p.order_id}`}</td>
                    <td style={{ fontWeight: 600 }}>ETB {parseFloat(p.amount).toFixed(2)}</td>
                    <td>{bankLabel(p.method)}</td>
                    <td>
                      {p.transaction_id
                        ? <code style={{ background: '#f0f0f0', padding: '2px 6px', borderRadius: 4, fontSize: 12 }}>{p.transaction_id}</code>
                        : <span style={{ color: 'var(--warning)', fontSize: 12 }}>Awaiting submission</span>}
                    </td>
                    <td>
                      <span className={statusClass(p.status)}>
                        {statusIcon(p.status)}{p.status}
                      </span>
                    </td>
                    <td>{new Date(p.created_at).toLocaleDateString()}</td>
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
