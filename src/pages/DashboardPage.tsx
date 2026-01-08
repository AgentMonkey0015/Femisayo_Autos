import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { Wrench, Car, FileText, DollarSign, Plus } from 'lucide-react'
import '../styles/dashboard.css'

export function DashboardPage() {
  const { user, userRole } = useAuth()
  const [stats, setStats] = useState({
    activeJobs: 0,
    bookings: 0,
    invoices: 0,
    totalSpent: 0
  })

  useEffect(() => {
    if (!user) return

    const loadStats = async () => {
      if (userRole === 'admin') {
        const [jobs, bookings, invoices] = await Promise.all([
          supabase.from('job_orders').select('id', { count: 'exact' }),
          supabase.from('rental_bookings').select('id', { count: 'exact' }),
          supabase.from('invoices').select('total')
        ])

        const totalInvoices = invoices.data?.reduce((sum, inv) => sum + Number(inv.total), 0) || 0
        setStats({
          activeJobs: jobs.count || 0,
          bookings: bookings.count || 0,
          invoices: invoices.data?.length || 0,
          totalSpent: totalInvoices
        })
      } else {
        const [jobs, bookings, invoices] = await Promise.all([
          supabase.from('job_orders').select('id', { count: 'exact' }).eq('customer_id', user.id),
          supabase.from('rental_bookings').select('id', { count: 'exact' }).eq('customer_id', user.id),
          supabase.from('invoices').select('total').eq('customer_id', user.id)
        ])

        const totalSpent = invoices.data?.reduce((sum, inv) => sum + Number(inv.total), 0) || 0
        setStats({
          activeJobs: jobs.count || 0,
          bookings: bookings.count || 0,
          invoices: invoices.data?.length || 0,
          totalSpent
        })
      }
    }

    loadStats()
  }, [user, userRole])

  return (
    <div className="dashboard-page">
      <div className="dashboard-header">
        <div>
          <h1>Dashboard</h1>
          <p>Welcome to Femisayo Autos</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card">
          <div className="stat-icon mechanic">
            <Wrench size={24} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Active Jobs</p>
            <p className="stat-value">{stats.activeJobs}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon rental">
            <Car size={24} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Bookings</p>
            <p className="stat-value">{stats.bookings}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon invoice">
            <FileText size={24} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Invoices</p>
            <p className="stat-value">{stats.invoices}</p>
          </div>
        </div>

        <div className="stat-card">
          <div className="stat-icon payment">
            <DollarSign size={24} />
          </div>
          <div className="stat-content">
            <p className="stat-label">Total {userRole === 'admin' ? 'Revenue' : 'Spent'}</p>
            <p className="stat-value">₦{stats.totalSpent.toLocaleString()}</p>
          </div>
        </div>
      </div>

      <div className="dashboard-actions">
        {userRole === 'admin' ? (
          <>
            <a href="/admin/jobs" className="action-button">
              <Wrench size={18} />
              Manage Jobs
            </a>
            <a href="/admin/bookings" className="action-button">
              <Car size={18} />
              Manage Bookings
            </a>
            <a href="/admin/fleet" className="action-button">
              <Plus size={18} />
              Fleet Management
            </a>
          </>
        ) : (
          <>
            <a href="/customer/services" className="action-button">
              <Wrench size={18} />
              Book Repair
            </a>
            <a href="/customer/rentals" className="action-button">
              <Car size={18} />
              Rent a Car
            </a>
            <a href="/customer/history" className="action-button">
              <FileText size={18} />
              View History
            </a>
          </>
        )}
      </div>
    </div>
  )
}
