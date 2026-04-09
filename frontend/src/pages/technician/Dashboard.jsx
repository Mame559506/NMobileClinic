import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { FaTools, FaSpinner, FaCheckCircle, FaInbox } from 'react-icons/fa'
import { useAuth } from '../../context/AuthContext'
import api from '../../services/api'

export default function TechDashboard() {
  const { user } = useAuth()
  const [stats, setStats] = useState({ assigned: 0, inProgress: 0, completed: 0, unassigned: 0 })

  useEffect(() => {
    api.get('/technician/stats').then(r => {
      if (r.data.success) setStats(r.data.stats)
    }).catch(() => {})
  }, [])

  const cards = [
    { label: 'My Assigned', value: stats.assigned, icon: <FaTools />, color: 'primary' },
    { label: 'In Progress', value: stats.inProgress, icon: <FaSpinner />, color: 'warning' },
    { label: 'Completed', value: stats.completed, icon: <FaCheckCircle />, color: 'success' },
    { label: 'Unassigned', value: stats.unassigned, icon: <FaInbox />, color: 'danger' },
  ]

  return (
    <div className="page">
      <h2 style={{ marginBottom: 20 }}>Welcome, {user?.firstName}!</h2>
      <div className="stats-grid">
        {cards.map((c, i) => (
          <div className="stat-card" key={i}>
            <div className={`stat-icon ${c.color}`}>{c.icon}</div>
            <div className="stat-info"><h3>{c.value}</h3><p>{c.label}</p></div>
          </div>
        ))}
      </div>
      <div className="card" style={{ textAlign: 'center', padding: 30 }}>
        <FaTools style={{ fontSize: 48, color: 'var(--primary)', marginBottom: 15 }} />
        <h3 style={{ marginBottom: 10 }}>Ready to work?</h3>
        <p style={{ color: 'var(--gray)', marginBottom: 20 }}>View and manage your repair assignments</p>
        <Link to="/technician/repairs" className="btn">View Repairs</Link>
      </div>
    </div>
  )
}
