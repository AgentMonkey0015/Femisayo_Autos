import { useState, useEffect } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { supabase } from '../lib/supabase'
import { Calendar, AlertCircle, Check } from 'lucide-react'
import '../styles/rentals.css'

interface RentalCar {
  id: string
  make: string
  model: string
  year: number
  car_type: string
  daily_rate: number
  license_plate: string
}

interface Booking {
  id: string
  car_id: string
  start_date: string
  end_date: string
  status: string
  total_amount: number
  rental_cars: RentalCar
}

export function CustomerRentalsPage() {
  const { user } = useAuth()
  const [cars, setCars] = useState<RentalCar[]>([])
  const [bookings, setBookings] = useState<Booking[]>([])
  const [selectedCar, setSelectedCar] = useState('')
  const [startDate, setStartDate] = useState('')
  const [endDate, setEndDate] = useState('')
  const [loading, setLoading] = useState(false)
  const [showForm, setShowForm] = useState(false)

  useEffect(() => {
    loadData()
  }, [user])

  const loadData = async () => {
    const [carsRes, bookingsRes] = await Promise.all([
      supabase.from('rental_cars').select('*').eq('available', true),
      supabase.from('rental_bookings').select('*, rental_cars(*)').eq('customer_id', user?.id).order('created_at', { ascending: false })
    ])
    setCars(carsRes.data || [])
    setBookings(bookingsRes.data || [])
  }

  const handleBooking = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedCar || !startDate || !endDate) return

    setLoading(true)
    try {
      const start = new Date(startDate)
      const end = new Date(endDate)
      const days = Math.ceil((end.getTime() - start.getTime()) / (1000 * 60 * 60 * 24))

      const car = cars.find(c => c.id === selectedCar)
      const totalAmount = days * (car?.daily_rate || 0)

      const { error } = await supabase.from('rental_bookings').insert({
        customer_id: user?.id,
        car_id: selectedCar,
        start_date: startDate,
        end_date: endDate,
        total_amount: totalAmount,
        status: 'pending'
      })
      if (error) throw error

      setSelectedCar('')
      setStartDate('')
      setEndDate('')
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
      'pending': '#f59e0b',
      'confirmed': '#3b82f6',
      'in_progress': '#8b5cf6',
      'completed': '#10b981',
      'cancelled': '#ef4444'
    }
    return colors[status] || '#6b7280'
  }

  return (
    <div className="rentals-page">
      <div className="page-header">
        <h1>Car Rentals</h1>
        <button onClick={() => setShowForm(!showForm)} className="btn-primary">
          <Calendar size={18} />
          Book a Car
        </button>
      </div>

      {showForm && (
        <div className="form-card">
          <h2>Reserve a Vehicle</h2>
          <form onSubmit={handleBooking}>
            <div className="form-group">
              <label>Select Car</label>
              <select value={selectedCar} onChange={(e) => setSelectedCar(e.target.value)} required>
                <option value="">Choose a vehicle...</option>
                {cars.map(car => (
                  <option key={car.id} value={car.id}>
                    {car.year} {car.make} {car.model} - ₦{car.daily_rate}/day
                  </option>
                ))}
              </select>
            </div>
            <div className="form-row">
              <div className="form-group">
                <label>Start Date</label>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  required
                />
              </div>
              <div className="form-group">
                <label>End Date</label>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  required
                />
              </div>
            </div>
            <div className="form-actions">
              <button type="submit" disabled={loading} className="btn-primary">
                Book Now
              </button>
              <button type="button" onClick={() => setShowForm(false)} className="btn-secondary">
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="rentals-section">
        <h2>Available Cars</h2>
        <div className="cars-grid">
          {cars.map(car => (
            <div key={car.id} className="car-card">
              <div className="car-info">
                <h3>{car.year} {car.make} {car.model}</h3>
                <p className="car-type">{car.car_type}</p>
                <p className="car-plate">{car.license_plate}</p>
                <p className="car-rate">₦{car.daily_rate.toLocaleString()}/day</p>
              </div>
              <button onClick={() => {setSelectedCar(car.id); setShowForm(true);}} className="btn-secondary">
                Reserve
              </button>
            </div>
          ))}
        </div>
      </div>

      <div className="bookings-section">
        <h2>Your Bookings</h2>
        {bookings.length === 0 ? (
          <div className="empty-state">
            <AlertCircle size={40} />
            <p>No bookings yet</p>
          </div>
        ) : (
          <div className="bookings-list">
            {bookings.map(booking => (
              <div key={booking.id} className="booking-card">
                <div className="booking-header">
                  <h3>{booking.rental_cars?.year} {booking.rental_cars?.make} {booking.rental_cars?.model}</h3>
                  <span className="status-badge" style={{ backgroundColor: getStatusColor(booking.status) }}>
                    {booking.status}
                  </span>
                </div>
                <div className="booking-details">
                  <p><strong>From:</strong> {new Date(booking.start_date).toLocaleDateString()}</p>
                  <p><strong>To:</strong> {new Date(booking.end_date).toLocaleDateString()}</p>
                  <p><strong>Total:</strong> ₦{booking.total_amount.toLocaleString()}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
