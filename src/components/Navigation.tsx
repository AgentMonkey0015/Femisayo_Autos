import { useAuth } from '../contexts/AuthContext'
import { Link, useNavigate } from 'react-router-dom'
import { LogOut, Wrench, Car, Menu } from 'lucide-react'
import { useState } from 'react'
import '../styles/nav.css'

export function Navigation() {
  const { user, userRole, signOut } = useAuth()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)

  const handleSignOut = async () => {
    await signOut()
    navigate('/login')
  }

  if (!user) return null

  return (
    <nav className="navbar">
      <div className="navbar-container">
        <Link to="/dashboard" className="navbar-brand">
          <Wrench size={24} />
          <Car size={24} />
          <span>Femisayo Autos</span>
        </Link>

        <button className="menu-toggle" onClick={() => setMenuOpen(!menuOpen)}>
          <Menu size={24} />
        </button>

        <div className={`navbar-menu ${menuOpen ? 'open' : ''}`}>
          {userRole === 'admin' ? (
            <div className="nav-links">
              <Link to="/dashboard">Dashboard</Link>
              <Link to="/admin/jobs">Jobs</Link>
              <Link to="/admin/bookings">Bookings</Link>
              <Link to="/admin/fleet">Fleet</Link>
            </div>
          ) : (
            <div className="nav-links">
              <Link to="/dashboard">Dashboard</Link>
              <Link to="/customer/services">Services</Link>
              <Link to="/customer/rentals">Rentals</Link>
              <Link to="/customer/profile">Profile</Link>
            </div>
          )}

          <div className="nav-user">
            <span className="user-name">{user.email}</span>
            <button onClick={handleSignOut} className="btn-logout">
              <LogOut size={18} />
              Sign Out
            </button>
          </div>
        </div>
      </div>
    </nav>
  )
}
