import { useState, useEffect } from 'react'
import { FaUniversity, FaSave, FaToggleOn, FaToggleOff } from 'react-icons/fa'
import { useLanguage } from '../../context/LanguageContext'
import api from '../../services/api'
import toast from 'react-hot-toast'

export default function BankSettings() {
  const [banks, setBanks] = useState([])
  const [loading, setLoading] = useState(true)
  const [editing, setEditing] = useState(null)
  const [editForm, setEditForm] = useState({})
  const { t } = useLanguage()

  useEffect(() => {
    api.get('/admin/bank-settings').then(r => {
      if (r.data.success) setBanks(r.data.banks)
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const startEdit = (bank) => {
    setEditing(bank.id)
    setEditForm({ bank_name: bank.bank_name, account_number: bank.account_number, account_name: bank.account_name, is_active: bank.is_active })
  }

  const saveEdit = async (id) => {
    try {
      const r = await api.put(`/admin/bank-settings/${id}`, editForm)
      if (r.data.success) {
        setBanks(prev => prev.map(b => b.id === id ? r.data.bank : b))
        setEditing(null)
        toast.success('Bank settings updated')
      }
    } catch { toast.error('Failed to update') }
  }

  const toggleActive = async (bank) => {
    try {
      const r = await api.put(`/admin/bank-settings/${bank.id}`, { ...bank, is_active: !bank.is_active })
      if (r.data.success) {
        setBanks(prev => prev.map(b => b.id === bank.id ? r.data.bank : b))
        toast.success(`Bank ${!bank.is_active ? 'enabled' : 'disabled'}`)
      }
    } catch { toast.error('Failed to update') }
  }

  const set = (f) => (e) => setEditForm({ ...editForm, [f]: e.target.value })

  return (
    <div className="page">
      <h2 style={{ marginBottom: 20 }}><FaUniversity style={{ marginRight: 8, color: 'var(--primary)' }} />{t('bankSettings')}</h2>
      <p style={{ color: 'var(--gray)', marginBottom: 20 }}>{t('bankSettingsDesc')}</p>

      {loading ? <p>{t('loading')}</p> : banks.map(bank => (
        <div className="card" key={bank.id} style={{ marginBottom: 15 }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
            <div style={{ flex: 1 }}>
              {editing === bank.id ? (
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 15 }}>
                  <div className="form-group">
                    <label>{t('bankName')}</label>
                    <input className="form-control" value={editForm.bank_name} onChange={set('bank_name')} />
                  </div>
                  <div className="form-group">
                    <label>{t('accountName')}</label>
                    <input className="form-control" value={editForm.account_name} onChange={set('account_name')} />
                  </div>
                  <div className="form-group">
                    <label>{t('accountNumber')}</label>
                    <input className="form-control" value={editForm.account_number} onChange={set('account_number')} />
                  </div>
                </div>
              ) : (
                <div>
                  <h3 style={{ marginBottom: 8, display: 'flex', alignItems: 'center', gap: 10 }}>
                    {bank.bank_name}
                    <span className={`status-badge ${bank.is_active ? 'status-completed' : 'status-cancelled'}`}>
                      {bank.is_active ? t('active') : t('inactive')}
                    </span>
                  </h3>
                  <p style={{ color: 'var(--gray)', fontSize: 14 }}>{t('accountNumber')}: <strong>{bank.account_number}</strong></p>
                  <p style={{ color: 'var(--gray)', fontSize: 14 }}>{t('accountName')}: <strong>{bank.account_name}</strong></p>
                </div>
              )}
            </div>
            <div style={{ display: 'flex', gap: 8, marginLeft: 20 }}>
              {editing === bank.id ? (
                <>
                  <button className="btn btn-success" style={{ padding: '8px 16px' }} onClick={() => saveEdit(bank.id)}>
                    <FaSave style={{ marginRight: 6 }} />{t('save')}
                  </button>
                  <button className="btn btn-outline" style={{ padding: '8px 16px' }} onClick={() => setEditing(null)}>{t('cancel')}</button>
                </>
              ) : (
                <>
                  <button className="btn" style={{ padding: '8px 16px' }} onClick={() => startEdit(bank)}>{t('edit')}</button>
                  <button className="btn btn-outline" style={{ padding: '8px 16px' }} onClick={() => toggleActive(bank)}>
                    {bank.is_active ? <FaToggleOn style={{ color: '#28a745' }} /> : <FaToggleOff style={{ color: 'var(--gray)' }} />}
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}
