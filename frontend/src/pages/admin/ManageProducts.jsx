import { useState, useEffect } from 'react'
import { FaBoxes, FaPlus, FaEdit, FaTrash, FaSearch, FaExclamationTriangle, FaTimes } from 'react-icons/fa'
import api from '../../services/api'
import toast from 'react-hot-toast'

const EMPTY = { name: '', description: '', price: '', stock_quantity: '', category_id: '', brand: '', sku: '', is_featured: false, is_active: true }

function ProductModal({ editing, form, setForm, categories, onSave, onClose, saving }) {
  const set = f => e => setForm(p => ({ ...p, [f]: e.target.type === 'checkbox' ? e.target.checked : e.target.value }))
  return (
    <div style={{ position:'fixed', inset:0, background:'rgba(0,0,0,0.5)', zIndex:1000, display:'flex', alignItems:'center', justifyContent:'center', padding:16 }}
      onClick={onClose}>
      <div className="card" style={{ width:'100%', maxWidth:560, maxHeight:'90vh', overflow:'auto' }} onClick={e => e.stopPropagation()}>
        <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
          <h3 style={{ margin:0 }}>{editing ? 'Edit Product' : 'Add New Product'}</h3>
          <button onClick={onClose} style={{ background:'none', border:'none', fontSize:22, cursor:'pointer', color:'var(--gray)' }}><FaTimes /></button>
        </div>
        <form onSubmit={onSave}>
          <div className="form-group">
            <label>Product Name *</label>
            <input className="form-control" value={form.name} onChange={set('name')} required placeholder="e.g. iPhone 14 Pro Case" />
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
            <div className="form-group">
              <label>Price (ETB) *</label>
              <input className="form-control" type="number" min="0" step="0.01" value={form.price} onChange={set('price')} required placeholder="0.00" />
            </div>
            <div className="form-group">
              <label>Stock Quantity *</label>
              <input className="form-control" type="number" min="0" value={form.stock_quantity} onChange={set('stock_quantity')} required placeholder="0" />
            </div>
          </div>
          <div className="form-group">
            <label>Category</label>
            <select className="form-control" value={form.category_id} onChange={set('category_id')}>
              <option value="">-- Select Category --</option>
              {categories.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
            </select>
          </div>
          <div style={{ display:'grid', gridTemplateColumns:'1fr 1fr', gap:16 }}>
            <div className="form-group">
              <label>Brand</label>
              <input className="form-control" value={form.brand} onChange={set('brand')} placeholder="e.g. Apple" />
            </div>
            <div className="form-group">
              <label>SKU</label>
              <input className="form-control" value={form.sku} onChange={set('sku')} placeholder="e.g. IPH-CASE-001" />
            </div>
          </div>
          <div className="form-group">
            <label>Description</label>
            <textarea className="form-control" rows={3} value={form.description} onChange={set('description')} style={{ resize:'vertical' }} placeholder="Product description..." />
          </div>
          <div style={{ display:'flex', gap:24, marginBottom:20 }}>
            <label style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer', fontWeight:500 }}>
              <input type="checkbox" checked={form.is_featured} onChange={set('is_featured')} /> Featured Product
            </label>
            <label style={{ display:'flex', alignItems:'center', gap:8, cursor:'pointer', fontWeight:500 }}>
              <input type="checkbox" checked={form.is_active} onChange={set('is_active')} /> Active
            </label>
          </div>
          <div style={{ display:'flex', gap:12 }}>
            <button className="btn btn-block" type="submit" disabled={saving} style={{ flex:1 }}>
              {saving ? 'Saving...' : editing ? 'Update Product' : 'Add Product'}
            </button>
            <button type="button" className="btn btn-outline" onClick={onClose} style={{ flex:1 }}>Cancel</button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default function ManageProducts() {
  const [products, setProducts] = useState([])
  const [categories, setCategories] = useState([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState('')
  const [filter, setFilter] = useState('all')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(EMPTY)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchProducts()
    api.get('/categories').then(r => { if (r.data.success) setCategories(r.data.categories || []) }).catch(() => {})
  }, [])

  const fetchProducts = () => {
    setLoading(true)
    api.get('/products?limit=200').then(r => {
      if (r.data.success) setProducts(r.data.products || [])
    }).catch(() => toast.error('Failed to load products')).finally(() => setLoading(false))
  }

  const openCreate = () => { setEditing(null); setForm(EMPTY); setShowForm(true) }

  const openEdit = p => {
    setEditing(p.id)
    setForm({ name: p.name || '', description: p.description || '', price: p.price || '', stock_quantity: p.stock_quantity ?? '', category_id: p.category_id || '', brand: p.brand || '', sku: p.sku || '', is_featured: !!p.is_featured, is_active: p.is_active ?? true })
    setShowForm(true)
  }

  const handleSave = async e => {
    e.preventDefault()
    if (!form.name.trim()) return toast.error('Name is required')
    if (!form.price || parseFloat(form.price) < 0) return toast.error('Valid price is required')
    setSaving(true)
    try {
      const payload = { ...form, price: parseFloat(form.price), stock_quantity: parseInt(form.stock_quantity) || 0 }
      if (editing) { await api.put('/products/' + editing, payload); toast.success('Product updated') }
      else { await api.post('/products', payload); toast.success('Product added') }
      setShowForm(false); fetchProducts()
    } catch (err) { toast.error(err.response?.data?.message || 'Failed to save') }
    finally { setSaving(false) }
  }

  const handleDelete = async id => {
    if (!window.confirm('Delete this product? This cannot be undone.')) return
    try { await api.delete('/products/' + id); setProducts(p => p.filter(x => x.id !== id)); toast.success('Product deleted') }
    catch { toast.error('Failed to delete product') }
  }

  const handleToggleActive = async p => {
    try {
      await api.put('/products/' + p.id, { is_active: !p.is_active })
      setProducts(prev => prev.map(x => x.id === p.id ? { ...x, is_active: !p.is_active } : x))
      toast.success(p.is_active ? 'Product deactivated' : 'Product activated')
    } catch { toast.error('Failed to update') }
  }

  const filtered = products.filter(p => {
    const matchSearch = p.name.toLowerCase().includes(search.toLowerCase()) || (p.brand || '').toLowerCase().includes(search.toLowerCase())
    if (filter === 'low') return matchSearch && p.stock_quantity > 0 && p.stock_quantity <= 10
    if (filter === 'out') return matchSearch && p.stock_quantity === 0
    if (filter === 'inactive') return matchSearch && !p.is_active
    return matchSearch
  })

  const lowStockCount = products.filter(p => p.stock_quantity > 0 && p.stock_quantity <= 10).length
  const outOfStockCount = products.filter(p => p.stock_quantity === 0).length

  const stockBadge = qty => {
    if (qty === 0) return <span className="out-of-stock">Out of Stock</span>
    if (qty <= 10) return <span className="low-stock">Low ({qty})</span>
    return <span className="in-stock">{qty}</span>
  }

  return (
    <div className="page">
      {showForm && <ProductModal editing={editing} form={form} setForm={setForm} categories={categories} onSave={handleSave} onClose={() => setShowForm(false)} saving={saving} />}

      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20, flexWrap:'wrap', gap:12 }}>
        <h2 style={{ margin:0 }}><FaBoxes style={{ marginRight:8, color:'var(--primary)' }} />Products Management</h2>
        <button className="btn" onClick={openCreate}><FaPlus style={{ marginRight:6 }} />Add Product</button>
      </div>

      {/* Stats */}
      <div className="stats-grid" style={{ marginBottom:20 }}>
        {[
          { label:'Total Products', value:products.length, color:'primary' },
          { label:'Low Stock', value:lowStockCount, color:'warning', clickFilter:'low' },
          { label:'Out of Stock', value:outOfStockCount, color:'danger', clickFilter:'out' },
        ].map(s => (
          <div key={s.label} className="stat-card" style={{ cursor: s.clickFilter ? 'pointer' : 'default', border: filter === s.clickFilter ? '2px solid var(--primary)' : '2px solid transparent' }}
            onClick={() => s.clickFilter && setFilter(filter === s.clickFilter ? 'all' : s.clickFilter)}>
            <div className={'stat-icon ' + s.color}><FaBoxes /></div>
            <div className="stat-info"><h3>{s.value}</h3><p>{s.label}</p></div>
          </div>
        ))}
      </div>

      {/* Low stock alert */}
      {lowStockCount > 0 && (
        <div style={{ background:'rgba(248,150,30,0.1)', border:'1px solid var(--warning)', borderRadius:8, padding:'12px 16px', marginBottom:20, display:'flex', alignItems:'center', gap:10 }}>
          <FaExclamationTriangle style={{ color:'var(--warning)', flexShrink:0 }} />
          <span style={{ color:'var(--warning)', fontWeight:500 }}>{lowStockCount} product{lowStockCount > 1 ? 's' : ''} running low on stock.</span>
          <button className="btn btn-outline" style={{ marginLeft:'auto', padding:'4px 12px', fontSize:13, borderColor:'var(--warning)', color:'var(--warning)' }} onClick={() => setFilter('low')}>View</button>
        </div>
      )}

      {/* Filters + Search */}
      <div className="card" style={{ marginBottom:20, display:'flex', gap:12, alignItems:'center', flexWrap:'wrap' }}>
        <div style={{ position:'relative', flex:1, minWidth:200 }}>
          <FaSearch style={{ position:'absolute', left:12, top:'50%', transform:'translateY(-50%)', color:'var(--gray)' }} />
          <input className="form-control" style={{ paddingLeft:36 }} placeholder="Search by name or brand..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div style={{ display:'flex', gap:8 }}>
          {[['all','All'],['low','Low Stock'],['out','Out of Stock'],['inactive','Inactive']].map(([val, label]) => (
            <button key={val} onClick={() => setFilter(val)}
              style={{ padding:'8px 14px', borderRadius:6, border:'1px solid', fontSize:13, cursor:'pointer', background: filter === val ? 'var(--primary)' : 'white', color: filter === val ? 'white' : 'var(--dark)', borderColor: filter === val ? 'var(--primary)' : '#ddd' }}>
              {label}
            </button>
          ))}
        </div>
      </div>

      {/* Table */}
      <div className="table-container">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr><th>Product</th><th>Category</th><th>Price (ETB)</th><th>Stock</th><th>Featured</th><th>Status</th><th>Actions</th></tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="7" style={{ textAlign:'center', padding:30 }}>Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan="7" style={{ textAlign:'center', padding:30, color:'var(--gray)' }}>No products found.</td></tr>
              ) : filtered.map(p => (
                <tr key={p.id}>
                  <td>
                    <div style={{ fontWeight:600 }}>{p.name}</div>
                    {p.brand && <div style={{ fontSize:12, color:'var(--gray)' }}>{p.brand}{p.sku ? '  ' + p.sku : ''}</div>}
                  </td>
                  <td>{p.category_name || '-'}</td>
                  <td style={{ fontWeight:600, color:'var(--primary)' }}>ETB {parseFloat(p.price).toFixed(2)}</td>
                  <td>{stockBadge(p.stock_quantity)}</td>
                  <td>{p.is_featured ? <span style={{ color:'var(--warning)', fontWeight:600 }}> Yes</span> : <span style={{ color:'var(--gray)' }}>No</span>}</td>
                  <td>
                    <span className={'status-badge ' + (p.is_active ? 'status-completed' : 'status-cancelled')}>
                      {p.is_active ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td>
                    <div style={{ display:'flex', gap:6 }}>
                      <button className="btn" style={{ padding:'6px 10px', fontSize:12 }} title="Edit" onClick={() => openEdit(p)}><FaEdit /></button>
                      <button className={'btn ' + (p.is_active ? 'btn-outline' : 'btn-success')} style={{ padding:'6px 10px', fontSize:12 }} title={p.is_active ? 'Deactivate' : 'Activate'} onClick={() => handleToggleActive(p)}>
                        {p.is_active ? 'Off' : 'On'}
                      </button>
                      <button className="btn btn-danger" style={{ padding:'6px 10px', fontSize:12 }} title="Delete" onClick={() => handleDelete(p.id)}><FaTrash /></button>
                    </div>
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

