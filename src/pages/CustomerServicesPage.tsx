import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { Plus, AlertCircle } from 'lucide-react'
import '../styles/services.css'

interface Vehicle {
  id: string
  make: string
  model: string
  year: number
  license_plate: string
}

interface JobOrder {
  id: string
  vehicle_id: string
  description: string
  status: string
  created_at: string
}

export function CustomerServicesPage() {
  const { user } = useAuth()
  const [vehicles, setVehicles] = useState<Vehicle[]>([])
  const [jobs, setJobs] = useState<JobOrder[]>([])
  const [selectedVehicle, setSelectedVehicle] = useState('')
  const [description, setDescription] = useState('')
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    if (!user) return
    loadData()
  }, [user])

  const loadData = async () => {
    const [vehiclesRes, jobsRes] = await Promise.all([
      supabase.from('vehicles').select('*').eq('customer_id', user?.id),
      supabase.from('job_orders').select('*').eq('customer_id', user?.id).order('created_at', { ascending: false })
    ])
    setVehicles(vehiclesRes.data || [])
    setJobs(jobsRes.data || [])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedVehicle || !description) return

    setLoading(true)
    try {
      const { error } = await supabase.from('job_orders').insert({
        vehicle_id: selectedVehicle,
        customer_id: user?.id,
        description,
        status: 'received'
      })
      if (error) throw error
      setDescription('')
      setSelectedVehicle('')
      setShowForm(false)
      loadData()
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
    <div className="services-page">
      <div className="page-header">
        <h1>Mechanic Services</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          <Plus size={18} />
          Book Service
        </button>
      </div>

      {showForm && (
        <div className="form-card">
          <h2>Book Repair Service</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label>Select Vehicle</label>
              <select value={selectedVehicle} onChange={(e) => setSelectedVehicle(e.target.value)} required>
                <option value="">Choose a vehicle...</option>
                {vehicles.map(v => (
                  <option key={v.id} value={v.id}>
                    {v.year} {v.make} {v.model} - {v.license_plate}
                  </option>
                ))}
              </select>
            </div>
            <div className="form-group">
              <label>Issue Description</label>
              <textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Describe the issue with your vehicle..."
                required
              />
            </div>
            <div className="form-actions">
              <button type="submit" disabled={loading} className="btn-primary">
                Submit Request
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="jobs-list">
        <h2>Your Service Requests</h2>
        {jobs.length === 0 ? (
          <div className="empty-state">
            <AlertCircle size={40} />
            <p>No service requests yet</p>
          </div>
        ) : (
          <div className="jobs-grid">
            {jobs.map(job => (
              <div key={job.id} className="job-card">
                <div className="job-header">
                  <h3>Service Request</h3>
                  <span className="status-badge" style={{ backgroundColor: getStatusColor(job.status) }}>
                    {job.status}
                  </span>
                </div>
                <p className="job-description">{job.description}</p>
                <p className="job-date">
                  {new Date(job.created_at).toLocaleDateString()}
                </p>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
