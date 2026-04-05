import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../features/auth/hooks/useAuth'
import './Navbar.css'

export default function Navbar() {
  const [search, setSearch] = useState('')
  const [menuOpen, setMenuOpen] = useState(false)
  const { currentUser, logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = async () => {
    await logout()
    setMenuOpen(false)
    navigate('/login')
  }

  const handleSearch = (e) => {
    e.preventDefault()
    if (search.trim()) navigate(`/listings?search=${encodeURIComponent(search.trim())}`)
  }

  return (
    <nav className="navbar">
      <div className="navbar-inner">

        {/* LEFT: Brand + Explore */}
        <div className="navbar-left">
          <Link to="/listings" className="brand">
            <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/>
              <polyline points="9 22 9 12 15 12 15 22"/>
            </svg>
            <span>Stayo</span>
          </Link>

          <Link to="/listings" className="nav-link">Explore</Link>
        </div>

        {/* CENTER: Search */}
        <form className="search-form" onSubmit={handleSearch}>
          <div className="search-box">
            <svg className="search-icon" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/>
            </svg>
            <input
              type="text"
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search stays, cities, places..."
              className="search-input"
              autoComplete="off"
            />
            <button type="submit" className="search-btn">Search</button>
          </div>
        </form>

        {/* RIGHT */}
        <div className="navbar-right">
          <Link to="/listings/new" className="host-link">List your place</Link>

          {!currentUser ? (
            <>
              <Link to="/login" className="btn btn-outline">Login</Link>
              <Link to="/signup" className="btn btn-primary">Sign up</Link>
            </>
          ) : (
            <div className="dropdown">
              <button className="user-btn" onClick={() => setMenuOpen(o => !o)}>
                <div className="avatar">{currentUser.username?.[0]?.toUpperCase()}</div>
                <span className="username">{currentUser.username}</span>
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                  <polyline points="6 9 12 15 18 9"/>
                </svg>
              </button>
              {menuOpen && (
                <div className="dropdown-menu">
                  <Link to="/profile" className="dropdown-item" onClick={() => setMenuOpen(false)}>My Profile</Link>
                  <div className="dropdown-divider" />
                  <button
                    className="dropdown-item danger"
                    onClick={handleLogout}
                  >
                    Logout
                  </button>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Mobile toggle */}
        <button className="mobile-toggle" onClick={() => setMenuOpen(o => !o)}>
          <span /><span /><span />
        </button>
      </div>
    </nav>
  )
}