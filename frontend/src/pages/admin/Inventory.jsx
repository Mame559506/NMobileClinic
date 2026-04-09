import { useState, useEffect } from 'react'
import { FaWarehouse, FaExclamationTriangle, FaBoxes } from 'react-icons/fa'
import { Link } from 'react-router-dom'
import api from '../../services/api'

export default function Inventory() {
  const [products, setProducts] = useState([])
  const [loading, setLoading] = useState(true)
  const [filter, setFilter] = useState('all')

  useEffect(() => {
    api.get('/products?limit=200').then(r => {
      if (r.data.success) setProducts(r.data.products || [])
    }).catch(() => {}).finally(() => setLoading(false))
  }, [])

  const lowStock = products.filter(p => p.stock_quantity > 0 && p.stock_quantity <= 10)
  const outOfStock = products.filter(p => p.stock_quantity === 0)

  const filtered = filter === 'low' ? lowStock : filter === 'out' ? outOfStock : products

  const stockBadge = qty => {
    if (qty === 0) return <span className="out-of-stock">Out of Stock</span>
    if (qty <= 10) return <span className="low-stock">Low Stock</span>
    return <span className="in-stock">In Stock</span>
  }

  return (
    <div className="page">
      <div style={{ display:'flex', justifyContent:'space-between', alignItems:'center', marginBottom:20 }}>
        <h2 style={{ margin:0 }}><FaWarehouse style={{ marginRight:8, color:'var(--primary)' }} />Inventory</h2>
        <Link to="/admin/products" className="btn"><FaBoxes style={{ marginRight:6 }} />Manage Products</Link>
      </div>

      <div className="stats-grid" style={{ marginBottom:20 }}>
        {[
          { label:'Total Products', value:products.length, color:'primary', f:'all' },
          { label:'Low Stock', value:lowStock.length, color:'warning', f:'low' },
          { label:'Out of Stock', value:outOfStock.length, color:'danger', f:'out' },
        ].map(s => (
          <div key={s.label} className="stat-card" style={{ cursor:'pointer', border: filter === s.f ? '2px solid var(--primary)' : '2px solid transparent' }}
            onClick={() => setFilter(s.f)}>
            <div className={'stat-icon ' + s.color}><FaWarehouse /></div>
            <div className="stat-info"><h3>{s.value}</h3><p>{s.label}</p></div>
          </div>
        ))}
      </div>

      {lowStock.length > 0 && (
        <div style={{ background:'rgba(248,150,30,0.1)', border:'1px solid var(--warning)', borderRadius:8, padding:'12px 16px', marginBottom:20, display:'flex', alignItems:'center', gap:10 }}>
          <FaExclamationTriangle style={{ color:'var(--warning)' }} />
          <span style={{ color:'var(--warning)', fontWeight:500 }}>{lowStock.length} product{lowStock.length > 1 ? 's' : ''} need restocking.</span>
          <Link to="/admin/products" style={{ marginLeft:'auto', color:'var(--warning)', fontWeight:600, fontSize:13 }}>Restock in Products </Link>
        </div>
      )}

      <div style={{ display:'flex', gap:8, marginBottom:16 }}>
        {[['all','All'],['low','Low Stock'],['out','Out of Stock']].map(([val, label]) => (
          <button key={val} onClick={() => setFilter(val)}
            style={{ padding:'7px 14px', borderRadius:6, border:'1px solid', fontSize:13, cursor:'pointer', background: filter === val ? 'var(--primary)' : 'white', color: filter === val ? 'white' : 'var(--dark)', borderColor: filter === val ? 'var(--primary)' : '#ddd' }}>
            {label}
          </button>
        ))}
      </div>

      <div className="table-container">
        <div className="table-responsive">
          <table className="data-table">
            <thead>
              <tr><th>Product</th><th>Category</th><th>Price (ETB)</th><th>Stock Qty</th><th>Status</th></tr>
            </thead>
            <tbody>
              {loading ? (
                <tr><td colSpan="5" style={{ textAlign:'center', padding:30 }}>Loading...</td></tr>
              ) : filtered.length === 0 ? (
                <tr><td colSpan="5" style={{ textAlign:'center', padding:30, color:'var(--gray)' }}>No products found.</td></tr>
              ) : filtered.map(p => (
                <tr key={p.id} style={{ background: p.stock_quantity === 0 ? 'rgba(247,37,133,0.03)' : p.stock_quantity <= 10 ? 'rgba(248,150,30,0.03)' : 'white' }}>
                  <td style={{ fontWeight:500 }}>{p.name}</td>
                  <td>{p.category_name || '-'}</td>
                  <td style={{ fontWeight:600 }}>ETB {parseFloat(p.price).toFixed(2)}</td>
                  <td style={{ fontWeight:700, color: p.stock_quantity === 0 ? 'var(--danger)' : p.stock_quantity <= 10 ? 'var(--warning)' : 'inherit' }}>
                    {p.stock_quantity}
                  </td>
                  <td>{stockBadge(p.stock_quantity)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  )
}
