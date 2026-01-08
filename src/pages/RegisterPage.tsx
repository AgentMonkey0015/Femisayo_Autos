import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { UserPlus, Wrench, Car } from 'lucide-react'
import '../styles/auth.css'

export function RegisterPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fullName, setFullName] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const navigate = useNavigate()
  const { signUp } = useAuth()

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setLoading(true)
    try {
      await signUp(email, password, fullName)
      navigate('/login')
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Registration failed')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="auth-container">
      <div className="auth-left">
        <div className="auth-branding">
          <div className="brand-logo">
            <Wrench size={48} />
            <Car size={48} />
          </div>
          <h1>Femisayo Autos</h1>
          <p>Professional Auto Repair & Rental Services</p>
        </div>
        <div className="features-list">
          <div className="feature-item">
            <Wrench size={24} />
            <span>Expert Mechanic Services</span>
          </div>
          <div className="feature-item">
            <Car size={24} />
            <span>Premium Car Rentals</span>
          </div>
        </div>
      </div>

      <div className="auth-right">
        <div className="auth-card">
          <h2>Create Account</h2>
          <form onSubmit={handleSubmit}>
            <div className="form-group">
              <label htmlFor="fullName">Full Name</label>
              <input
                id="fullName"
                type="text"
                placeholder="John Doe"
                value={fullName}
                onChange={(e) => setFullName(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="email">Email Address</label>
              <input
                id="email"
                type="email"
                placeholder="your@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                required
              />
            </div>
            <div className="form-group">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            {error && <div className="error-message">{error}</div>}
            <button type="submit" disabled={loading} className="auth-button">
              <UserPlus size={18} />
              {loading ? 'Creating account...' : 'Sign Up'}
            </button>
          </form>
          <p className="auth-link">
            Already have an account? <a href="/login">Sign in here</a>
          </p>
        </div>
      </div>
    </div>
  )
}
