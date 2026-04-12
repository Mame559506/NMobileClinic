import { useState } from 'react'
import { useAuth } from '../../context/AuthContext'
import { useLanguage } from '../../context/LanguageContext'
import { Link } from 'react-router-dom'
import { FaMobileAlt, FaGlobe } from 'react-icons/fa'

export default function Login() {
  const { login } = useAuth()
  const { lang, switchLang, t } = useLanguage()
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
        <h2 style={{ textAlign: 'center', marginBottom: 20 }}>{t('loginTitle')}</h2>
        {error && <p style={{ color: 'var(--danger)', marginBottom: 15, fontSize: 14 }}>{error}</p>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>{t('emailAddress')}</label>
            <input className="form-control" type="email" placeholder={t('emailAddress')}
              value={form.email} onChange={set('email')} required />
          </div>
          <div className="form-group">
            <label>{t('password')}</label>
            <input className="form-control" type="password" placeholder={t('password')}
              value={form.password} onChange={set('password')} required />
          </div>
          <button className="btn btn-block" type="submit" disabled={loading}>
            {loading ? t('signingIn') : t('signIn')}
          </button>
          <div style={{ textAlign: 'center', marginTop: 15 }}>
            <p style={{ color: 'var(--gray)', fontSize: 14 }}>
              {t('noAccount')} <Link to="/register" style={{ color: 'var(--primary)' }}>{t('registerHere')}</Link>
            </p>
          </div>
        </form>
      </div>
    </div>
  )
}
