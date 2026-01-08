import { useState, useEffect } from 'react'
import { supabase } from '../lib/supabase'
import { Plus, AlertCircle } from 'lucide-react'
import '../styles/admin.css'

interface RentalCar {
  id: string
  make: string
  model: string
  year: number
  car_type: string
  daily_rate: number
  license_plate: string
  available: boolean
}

export function AdminFleetPage() {
  const [cars, setCars] = useState<RentalCar[]>([])
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    make: '',
    model: '',
    year: new Date().getFullYear(),
    car_type: '',
    daily_rate: 0,
    license_plate: ''
  })

  useEffect(() => {
    loadCars()
  }, [])

  const loadCars = async () => {
    const { data } = await supabase.from('rental_cars').select('*').order('created_at', { ascending: false })
    setCars(data || [])
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    try {
      const { error } = await supabase.from('rental_cars').insert({
        ...formData,
        available: true
      })
      if (error) throw error
      setFormData({
        make: '',
        model: '',
        year: new Date().getFullYear(),
        car_type: '',
        daily_rate: 0,
        license_plate: ''
      })
      setShowForm(false)
      loadCars()
    } catch (err) {
      console.error(err)
    }
  }

  const toggleAvailability = async (carId: string, currentStatus: boolean) => {
    try {
      const { error } = await supabase.from('rental_cars').update({ available: !currentStatus }).eq('id', carId)
      if (error) throw error
      loadCars()
    } catch (err) {
      console.error(err)
    }
  }

  return (
    <div className="admin-page">
      <div className="page-header">
        <h1>Fleet Management</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          <Plus size={18} />
          Add Vehicle
        </button>
      </div>

      {showForm && (
        <div className="form-card">
          <h2>Add New Vehicle</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-row">
              <div className="form-group">
                <label>Make</label>
                <input
                  type="text"
                  value={formData.make}
                  onChange={(e) => setFormData({...formData, make: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Model</label>
                <input
                  type="text"
                  value={formData.model}
                  onChange={(e) => setFormData({...formData, model: e.target.value})}
                  required
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Year</label>
                <input
                  type="number"
                  value={formData.year}
                  onChange={(e) => setFormData({...formData, year: Number(e.target.value)})}
                  required
                />
              </div>
              <div className="form-group">
                <label>License Plate</label>
                <input
                  type="text"
                  value={formData.license_plate}
                  onChange={(e) => setFormData({...formData, license_plate: e.target.value})}
                  required
                />
              </div>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Car Type</label>
                <input
                  type="text"
                  value={formData.car_type}
                  onChange={(e) => setFormData({...formData, car_type: e.target.value})}
                  required
                />
              </div>
              <div className="form-group">
                <label>Daily Rate (₦)</label>
                <input
                  type="number"
                  value={formData.daily_rate}
                  onChange={(e) => setFormData({...formData, daily_rate: Number(e.target.value)})}
                  required
                />
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" className="btn-primary">Add Vehicle</button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">Cancel</button>
            </div>
          </form>
        </div>
      )}

      {cars.length === 0 ? (
        <div className="empty-state">
          <AlertCircle size={40} />
          <p>No vehicles in fleet</p>
        </div>
      ) : (
        <div className="fleet-grid">
          {cars.map(car => (
            <div key={car.id} className="fleet-card">
              <div className="fleet-info">
                <h3>{car.year} {car.make} {car.model}</h3>
                <p><strong>License:</strong> {car.license_plate}</p>
                <p><strong>Type:</strong> {car.car_type}</p>
                <p><strong>Rate:</strong> ₦{car.daily_rate.toLocaleString()}/day</p>
              </div>
              <button
                onClick={() => toggleAvailability(car.id, car.available)}
                className={`availability-toggle ${car.available ? 'available' : 'unavailable'}`}
              >
                {car.available ? 'Available' : 'Unavailable'}
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
