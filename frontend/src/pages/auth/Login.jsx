import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { Link } from 'react-router-dom'
import { FaMobileAlt } from 'react-icons/fa'

export default function Login() {
  const { login } = useAuth()
  const [form, setForm] = useState({ email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const result = await login(form.email, form.password)
    if (result && !result.success) setError(result.message)
    setLoading(false)
  }

  const set = (f) => (e) => setForm({ ...form, [f]: e.target.value })

  return (
    <div className="auth-container">
      <div className="auth-card">
        <div className="auth-header">
          <h1><FaMobileAlt style={{marginRight: 8}} />NancyMobile</h1>
          <p>Mobile Accessories & Repair Services</p>
        </div>
        <h2 style={{textAlign:'center', marginBottom: 20}}>Login to Your Account</h2>
        {error && <p style={{color:'var(--danger)', marginBottom: 15, fontSize: 14}}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email Address</label>
            <input className="form-control" type="email" placeholder="Enter your email"
              value={form.email} onChange={set('email')} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input className="form-control" type="password" placeholder="Enter your password"
              value={form.password} onChange={set('password')} required />
          </div>
          <button className="btn btn-block" type="submit" disabled={loading}>
            {loading ? 'Signing in...' : 'Sign In'}
          </button>
          <div style={{textAlign:'center', marginTop: 15}}>
            <p style={{color:'var(--gray)', fontSize: 14}}>
              Don't have an account? <Link to="/register" style={{color:'var(--primary)'}}>Register here</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}
