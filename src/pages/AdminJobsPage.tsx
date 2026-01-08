import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { AlertCircle, Edit2 } from 'lucide-react'
import '../styles/admin.css'

interface JobOrder {
  id: string
  vehicle_id: string
  description: string
  status: string
  created_at: string
  vehicles: { make: string; model: string; license_plate: string }
  profiles: { full_name: string }
}

export function AdminJobsPage() {
  const [jobs, setJobs] = useState<JobOrder[]>([])
  const [selectedStatus, setSelectedStatus] = useState<string>('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    loadJobs()
  }, [selectedStatus])

  const loadJobs = async () => {
    let query = supabase.from('job_orders').select('*, vehicles(make, model, license_plate), profiles(full_name)').order('created_at', { ascending: false })

    if (selectedStatus) {
      query = query.eq('status', selectedStatus)
    }

    const { data } = await query
    setJobs(data || [])
  }

  const updateStatus = async (jobId: string, newStatus: string) => {
    setLoading(true)
    try {
      const { error } = await supabase.from('job_orders').update({ status: newStatus }).eq('id', jobId)
      if (error) throw error
      loadJobs()
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const getStatusColor = (status: string) => {
    const colors: Record<string, string> = {
      'received': '#3b82f6',
      'diagnosis': '#f59e0b',
      'in_progress': '#8b5cf6',
      'completed': '#10b981',
      'cancelled': '#ef4444'
    }
    return colors[status] || '#6b7280'
  }

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1>Manage Job Orders</h1>
        <div className="filters">
          <select value={selectedStatus} onChange={(e) => setSelectedStatus(e.target.value)}>
            <option value="">All Statuses</option>
            <option value="received">Received</option>
            <option value="diagnosis">Diagnosis</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>
      </div>

      {jobs.length === 0 ? (
        <div className="empty-state">
          <AlertCircle size={40} />
          <p>No job orders found</p>
        </div>
      ) : (
        <div className="jobs-table">
          <table>
            <thead>
              <tr>
                <th>Vehicle</th>
                <th>Customer</th>
                <th>Description</th>
                <th>Status</th>
                <th>Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {jobs.map(job => (
                <tr key={job.id}>
                  <td>{job.vehicles?.make} {job.vehicles?.model}</td>
                  <td>{job.profiles?.full_name}</td>
                  <td>{job.description.substring(0, 50)}...</td>
                  <td>
                    <span className="status-badge" style={{ backgroundColor: getStatusColor(job.status) }}>
                      {job.status}
                    </span>
                  </td>
                  <td>{new Date(job.created_at).toLocaleDateString()}</td>
                  <td>
                    <select onChange={(e) => updateStatus(job.id, e.target.value)} disabled={loading} className="status-select">
                      <option value={job.status}>Update Status</option>
                      <option value="diagnosis">Diagnosis</option>
                      <option value="in_progress">In Progress</option>
                      <option value="completed">Completed</option>
                      <option value="cancelled">Cancelled</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  )
}
