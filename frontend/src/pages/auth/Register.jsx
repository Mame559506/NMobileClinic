import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import { Link } from 'react-router-dom'
import { FaMobileAlt, FaGlobe } from 'react-icons/fa'

export default function Register() {
  const { register } = useAuth()
  const { lang, switchLang, t } = useLanguage()
  const [form, setForm] = useState({ firstName: '', lastName: '', email: '', password: '', phone: '', address: '', role: 'customer' })
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
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6, background: '#f5f5f5', borderRadius: 8, padding: '4px 8px' }}>
            <FaGlobe style={{ color: 'var(--primary)', fontSize: 13 }} />
            {[{ code: 'en', label: 'EN' }, { code: 'om', label: 'OM' }, { code: 'am', label: 'አማ' }].map(({ code, label }) => (
              <button key={code} onClick={() => switchLang(code)}
                style={{ background: lang === code ? 'var(--primary)' : 'transparent', color: lang === code ? 'white' : 'var(--dark)', border: 'none', borderRadius: 5, padding: '3px 8px', fontSize: 12, fontWeight: 600, cursor: 'pointer' }}>
                {label}
              </button>
            ))}
          </div>
        </div>
        <div className="auth-header">
          <h1><FaMobileAlt style={{ marginRight: 8 }} />NancyMobile</h1>
          <p>Mobile Accessories & Repair Services</p>
        </div>
        <h2 style={{ textAlign: 'center', marginBottom: 20 }}>{t('createAccount')}</h2>
        {error && <p style={{ color: 'var(--danger)', marginBottom: 15, fontSize: 14 }}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>{t('firstName')}</label>
            <input className="form-control" placeholder={t('firstName')} value={form.firstName} onChange={set('firstName')} required />
          </div>
          <div className="form-group">
            <label>{t('lastName')}</label>
            <input className="form-control" placeholder={t('lastName')} value={form.lastName} onChange={set('lastName')} required />
          </div>
          <div className="form-group">
            <label>{t('emailAddress')}</label>
            <input className="form-control" type="email" placeholder={t('emailAddress')} value={form.email} onChange={set('email')} required />
          </div>
          <div className="form-group">
            <label>{t('password')}</label>
            <input className="form-control" type="password" placeholder={t('password')} value={form.password} onChange={set('password')} required />
          </div>
          <div className="form-group">
            <label>{t('phoneNumber')}</label>
            <input className="form-control" placeholder={t('phoneNumber')} value={form.phone} onChange={set('phone')} />
          </div>
          <div className="form-group">
            <label>{t('address')}</label>
            <textarea className="form-control" placeholder={t('address')} rows="2" value={form.address} onChange={set('address')} />
          </div>
          <div className="form-group">
            <label>{t('registerAs')}</label>
            <select className="form-control" value={form.role} onChange={set('role')}>
              <option value="customer">{t('customer')}</option>
              <option value="technician">{t('technician')}</option>
            </select>
          </div>
          <button className="btn btn-block" type="submit" disabled={loading}>
            {loading ? t('creatingAccount') : t('createAccount')}
          </button>
          <div style={{ textAlign: 'center', marginTop: 15 }}>
            <p style={{ color: 'var(--gray)', fontSize: 14 }}>
              {t('alreadyHaveAccount')} <Link to="/login" style={{ color: 'var(--primary)' }}>{t('loginHere')}</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}
