import { useState } from 'react'
import { useParams } from 'react-router-dom'
import { FaSearch, FaBox, FaTruck, FaCheckCircle, FaClock } from 'react-icons/fa'
import api from '../../services/api'

export default function TrackOrder() {
  const { orderNumber: paramOrderNumber } = useParams()
  const [orderNumber, setOrderNumber] = useState(paramOrderNumber || '')
  const [order, setOrder] = useState(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')

  const track = async (e) => {
    e.preventDefault()
    if (!orderNumber.trim()) return
    setLoading(true); setError(''); setOrder(null)
    try {
      const r = await api.get('/orders/track/' + orderNumber.trim())
      if (r.data.success) setOrder(r.data.order)
      else setError('Order not found.')
    } catch {
      setError('Order not found. Please check the order number.')
    } finally { setLoading(false) }
  }

  const steps = ['pending', 'processing', 'shipped', 'delivered']
  const stepIcons = [<FaClock />, <FaBox />, <FaTruck />, <FaCheckCircle />]
  const currentStep = order ? steps.indexOf(order.status) : -1

  return (
    <div className="auth-container" style={{ background: '#f5f7fb' }}>
      <div style={{ width: '100%', maxWidth: 560 }}>
        <div className="card">
          <div className="auth-header">
            <h1 style={{ fontSize: 24 }}><FaTruck style={{ marginRight: 8 }} />Track Your Order</h1>
            <p>Enter your order number to see the status</p>
          </div>
          <form onSubmit={track}>
            <div className="form-group">
              <label>Order Number</label>
              <input className="form-control" placeholder="e.g. ORD-1234567890"
                value={orderNumber} onChange={e => setOrderNumber(e.target.value)} />
            </div>
            <button className="btn btn-block" type="submit" disabled={loading}>
              <FaSearch style={{ marginRight: 8 }} />{loading ? 'Searching...' : 'Track Order'}
            </button>
          </form>

          {error && <p style={{ color: 'var(--danger)', marginTop: 16, textAlign: 'center' }}>{error}</p>}

          {order && (
            <div style={{ marginTop: 24 }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 8 }}>
                <span style={{ fontWeight: 600 }}>#{order.order_number}</span>
                <span className={'status-badge status-' + order.status}>{order.status}</span>
              </div>
              <p style={{ color: 'var(--gray)', fontSize: 14, marginBottom: 20 }}>
                Placed on {new Date(order.created_at).toLocaleDateString()}
              </p>
              <div style={{ display: 'flex', justifyContent: 'space-between', position: 'relative' }}>
                <div style={{ position: 'absolute', top: 16, left: '10%', right: '10%', height: 2, background: '#eee', zIndex: 0 }} />
                {steps.map((step, i) => (
                  <div key={step} style={{ textAlign: 'center', zIndex: 1, flex: 1 }}>
                    <div style={{
                      width: 32, height: 32, borderRadius: '50%', margin: '0 auto 8px',
                      display: 'flex', alignItems: 'center', justifyContent: 'center',
                      background: i <= currentStep ? 'var(--primary)' : '#eee',
                      color: i <= currentStep ? 'white' : 'var(--gray)', fontSize: 14
                    }}>{stepIcons[i]}</div>
                    <span style={{ fontSize: 11, color: i <= currentStep ? 'var(--primary)' : 'var(--gray)', textTransform: 'capitalize' }}>{step}</span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
