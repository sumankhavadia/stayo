import { useEffect, useState } from 'react'
import { Link } from 'react-router-dom'
import { getListings } from '../listingsAPI'
import './ListingsPage.css'

const CATEGORIES = [
  { key: 'all',      icon: '🔥', label: 'Trending' },
  { key: 'rooms',    icon: '🛏️', label: 'Rooms' },
  { key: 'cities',   icon: '🏙️', label: 'Iconic Cities' },
  { key: 'mountains',icon: '⛰️', label: 'Mountains' },
  { key: 'castles',  icon: '🏰', label: 'Castles' },
  { key: 'pools',    icon: '🏊', label: 'Amazing Pools' },
  { key: 'camping',  icon: '⛺', label: 'Camping' },
  { key: 'farms',    icon: '🚜', label: 'Farms' },
  { key: 'arctic',   icon: '❄️', label: 'Arctic' },
  { key: 'domes',    icon: '🛖', label: 'Domes' },
  { key: 'boats',    icon: '⛵', label: 'Boats' },
]

const FALLBACK = 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80'

export default function ListingsPage() {
  const [activeCategory, setActiveCategory] = useState('all')
  const [gstOn, setGstOn] = useState(false)
  const [listings, setListings] = useState([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState('')

  useEffect(() => {
    let ignore = false

    async function loadListings() {
      setLoading(true)
      setError('')
      try {
        const data = await getListings()
        if (!ignore) {
          setListings(Array.isArray(data) ? data : [])
        }
      } catch (err) {
        if (!ignore) {
          setListings([])
          setError(err?.message || 'Failed to load listings')
        }
      } finally {
        if (!ignore) {
          setLoading(false)
        }
      }
    }

    loadListings()
    return () => {
      ignore = true
    }
  }, [])

  const filtered = activeCategory === 'all'
    ? listings
    : listings.filter(l => l.category === activeCategory)

  const displayPrice = (price) =>
    gstOn ? Math.round(price * 1.12) : price

  return (
    <div className="listings-page">

      {/* CATEGORY + GST BAR */}
      <div className="category-bar">
        <div className="category-scroll">
          {CATEGORIES.map(cat => (
            <button
              key={cat.key}
              className={`category-item ${activeCategory === cat.key ? 'active' : ''}`}
              onClick={() => setActiveCategory(cat.key)}
            >
              <span className="cat-icon">{cat.icon}</span>
              <span className="cat-label">{cat.label}</span>
            </button>
          ))}
        </div>

        <div className="gst-box">
          <span className="gst-label">Total with GST</span>
          <label className="gst-switch">
            <input
              type="checkbox"
              checked={gstOn}
              onChange={e => setGstOn(e.target.checked)}
            />
            <span className="gst-track">
              <span className="gst-thumb" />
            </span>
          </label>
          {gstOn && <span className="gst-badge">+12%</span>}
        </div>
      </div>

      {/* GRID */}
      {loading && (
        <div className="empty-state">
          <p>Loading listings...</p>
        </div>
      )}

      {!loading && error && (
        <div className="empty-state">
          <p>{error}</p>
        </div>
      )}

      {!loading && !error && filtered.length === 0 ? (
        <div className="empty-state">
          <p>No listings found in this category.</p>
        </div>
      ) : !loading && !error ? (
        <div className="listings-grid">
          {filtered.map(listing => (
            <Link
              key={listing._id}
              to={`/listings/${listing._id}`}
              className="listing-card"
            >
              <div className="listing-img-wrap">
                <img
                  src={listing.image?.url || FALLBACK}
                  alt={listing.title}
                  className="listing-img"
                  loading="lazy"
                />
                <div className="listing-category-badge">
                  {CATEGORIES.find(c => c.key === listing.category)?.icon || '🏠'}
                </div>
              </div>
              <div className="listing-info">
                <h3 className="listing-title">{listing.title}</h3>
                <p className="listing-location">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                    <circle cx="12" cy="10" r="3"/>
                  </svg>
                  {listing.location}
                </p>
                <p className="listing-price">
                  <span className="price-amount">₹{displayPrice(listing.price).toLocaleString('en-IN')}</span>
                  <span className="price-unit">{gstOn ? ' total' : ' / night'}</span>
                </p>
              </div>
            </Link>
          ))}
        </div>
      ) : null}
    </div>
  )
}