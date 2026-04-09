import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { Link } from 'react-router-dom'
import { FaMobileAlt } from 'react-icons/fa'

export default function Register() {
  const { register } = useAuth()
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', phone: '', address: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    const result = await register(form)
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
        <h2 style={{textAlign:'center', marginBottom: 20}}>Create New Account</h2>
        {error && <p style={{color:'var(--danger)', marginBottom: 15, fontSize: 14}}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>First Name</label>
            <input className="form-control" placeholder="First name" value={form.firstName} onChange={set('firstName')} required />
          </div>
          <div className="form-group">
            <label>Last Name</label>
            <input className="form-control" placeholder="Last name" value={form.lastName} onChange={set('lastName')} required />
          </div>
          <div className="form-group">
            <label>Email Address</label>
            <input className="form-control" type="email" placeholder="Enter your email" value={form.email} onChange={set('email')} required />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input className="form-control" type="password" placeholder="Create a password (min 8 chars)" value={form.password} onChange={set('password')} required />
          </div>
          <div className="form-group">
            <label>Phone Number</label>
            <input className="form-control" placeholder="Enter your phone number" value={form.phone} onChange={set('phone')} />
          </div>
          <div className="form-group">
            <label>Address</label>
            <textarea className="form-control" placeholder="Enter your address" rows="2" value={form.address} onChange={set('address')} />
          </div>
          <button className="btn btn-block" type="submit" disabled={loading}>
            {loading ? 'Creating account...' : 'Create Account'}
          </button>
          <div style={{textAlign:'center', marginTop: 15}}>
            <p style={{color:'var(--gray)', fontSize: 14}}>
              Already have an account? <Link to="/login" style={{color:'var(--primary)'}}>Login here</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}
