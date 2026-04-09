import { useState, useEffect } from 'react'
import { FaMoneyCheckAlt, FaCheck, FaTimes, FaEye, FaFileImage } from 'react-icons/fa'
import api from '../../services/api'
import toast from 'react-hot-toast'

export default function PaymentVerification() {
  const [payments, setPayments] = useState([])
  const [loading, setLoading] = useState(true)
  const [preview, setPreview] = useState(null)

  useEffect(() => {
    api.get('/admin/payments').then(r => {
      if (r.data.success) setPayments(r.data.payments || [])
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const verify = async (id, status) => {
    try {
      await api.put(`/admin/payments/${id}/verify`, { status })
      setPayments(prev => prev.map(p => p.id === id ? { ...p, status } : p))
      toast.success(`Payment ${status === 'completed' ? 'approved' : 'rejected'}`)
    } catch { toast.error('Failed to update payment') }
  }

  const statusClass = (s) => {
    if (s === 'completed') return 'status-badge status-completed'
    if (s === 'pending') return 'status-badge status-pending'
    return 'status-badge status-cancelled'
  }

  const bankLabel = (m) => {
    const map = { cbe: 'CBE', abyssinia: 'Bank of Abyssinia', awash: 'Awash Bank', bank_transfer: 'Bank Transfer' }
    return map[m] || m
  }

  return (
    <div className="page">
      <h2 style={{ marginBottom: 20 }}><FaMoneyCheckAlt style={{ marginRight: 8, color: 'var(--primary)' }} />Payments Verification</h2>

      {/* Receipt preview modal */}
      {preview && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.7)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}
          onClick={() => setPreview(null)}>
          <div style={{ background: 'white', borderRadius: 8, padding: 20, maxWidth: 600, maxHeight: '80vh', overflow: 'auto' }}>
            <img src={`http://localhost:5000${preview}`} alt="Receipt" style={{ maxWidth: '100%' }} />
          </div>
        </div>
      )}

      <div className="table-container">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr><th>ID</th><th>Order</th><th>Customer</th><th>Amount</th><th>Bank</th><th>Transaction ID</th><th>Receipt</th><th>Status</th><th>Date</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="10" style={{ textAlign: 'center', padding: 20 }}>Loading...</td></tr>
              ) : payments.length === 0 ? (
                <tr><td colSpan="10" style={{ textAlign: 'center', padding: 20, color: 'var(--gray)' }}>No payments found.</td></tr>
              ) : payments.map(p => (
                <tr key={p.id}>
                  <td>#{p.id}</td>
                  <td>{p.order_number || `#${p.order_id}`}</td>
                  <td>{p.user_email || '-'}</td>
                  <td style={{ fontWeight: 600, color: 'var(--primary)' }}>ETB {parseFloat(p.amount).toFixed(2)}</td>
                  <td>{bankLabel(p.method)}</td>
                  <td>
                    {p.transaction_id ? (
                      <code style={{ background: '#f0f0f0', padding: '2px 6px', borderRadius: 4, fontSize: 12 }}>{p.transaction_id}</code>
                    ) : <span style={{ color: 'var(--gray)', fontSize: 12 }}>Not submitted</span>}
                  </td>
                  <td>
                    {p.receipt_url ? (
                      <button className="btn" style={{ padding: '4px 8px', fontSize: 12 }}
                        onClick={() => setPreview(p.receipt_url)}>
                        <FaFileImage style={{ marginRight: 4 }} />View
                      </button>
                    ) : <span style={{ color: 'var(--gray)', fontSize: 12 }}>No receipt</span>}
                  </td>
                  <td><span className={statusClass(p.status)}>{p.status}</span></td>
                  <td>{new Date(p.created_at).toLocaleDateString()}</td>
                  <td style={{ display: 'flex', gap: 6 }}>
                    {p.status === 'pending' && p.transaction_id && (
                      <>
                        <button className="btn btn-success" style={{ padding: '5px 10px', fontSize: 12 }}
                          title="Approve" onClick={() => verify(p.id, 'completed')}>
                          <FaCheck />
                        </button>
                        <button className="btn btn-danger" style={{ padding: '5px 10px', fontSize: 12 }}
                          title="Reject" onClick={() => verify(p.id, 'rejected')}>
                          <FaTimes />
                        </button>
                      </>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
