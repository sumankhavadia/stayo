import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useToast } from '../../../hooks/Usetoast'
import { createListing } from '../listingsAPI'
import { useAuth } from '../../auth/hooks/useAuth'
import './ListingForm.css'

const CATEGORIES = [
  { key: 'rooms',     label: '🛏️  Rooms' },
  { key: 'cities',    label: '🏙️  Iconic Cities' },
  { key: 'mountains', label: '⛰️  Mountains' },
  { key: 'castles',   label: '🏰  Castles' },
  { key: 'pools',     label: '🏊  Amazing Pools' },
  { key: 'camping',   label: '⛺  Camping' },
  { key: 'farms',     label: '🚜  Farms' },
  { key: 'arctic',    label: '❄️  Arctic' },
  { key: 'domes',     label: '🛖  Domes' },
  { key: 'boats',     label: '⛵  Boats' },
]

export default function CreateListing({ onSubmit }) {
  const navigate = useNavigate()
  const { toast } = useToast()
  const { currentUser } = useAuth()
  const [form, setForm] = useState({
    title: '', description: '', price: '', location: '', country: '', category: ''
  })
  const [image, setImage] = useState(null)
  const [preview, setPreview] = useState(null)
  const [submitting, setSubmitting] = useState(false)

  const handleChange = e => setForm(f => ({ ...f, [e.target.name]: e.target.value }))

  const handleImage = e => {
    const file = e.target.files[0]
    if (!file) return
    setImage(file)
    setPreview(URL.createObjectURL(file))
  }

  const handleSubmit = async e => {
    e.preventDefault()
    if (!currentUser) {
      toast({ message: 'Please login first', type: 'error' })
      navigate('/login')
      return
    }

    setSubmitting(true)
    try {
      const payload = new FormData()
      Object.entries(form).forEach(([k, v]) => payload.append(k, v))
      if (image) payload.append('image', image)

      if (onSubmit) {
        await onSubmit(payload)
      } else {
        await createListing(payload)
      }

      toast({ message: 'Listing created!', type: 'success' })
      navigate('/listings')
    } catch (err) {
      toast({ message: err.message || 'Failed to create listing', type: 'error' })
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="form-page">
      <div className="form-card">
        <h2 className="form-title">Add New Listing</h2>
        <p className="form-subtitle">Share your space with the world</p>

        <form onSubmit={handleSubmit} className="listing-form">

          <div className="form-group">
            <label className="form-label">Title</label>
            <input
              className="form-input"
              type="text"
              name="title"
              placeholder="e.g. Cozy Hill Cabin with Mountain Views"
              value={form.title}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-group">
            <label className="form-label">Description</label>
            <textarea
              className="form-input form-textarea"
              name="description"
              placeholder="Describe your space..."
              rows={4}
              value={form.description}
              onChange={handleChange}
              required
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Price per night (₹)</label>
              <input
                className="form-input"
                type="number"
                name="price"
                placeholder="e.g. 3500"
                min="1"
                value={form.price}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Category</label>
              <select
                className="form-input form-select"
                name="category"
                value={form.category}
                onChange={handleChange}
                required
              >
                <option value="">Select category</option>
                {CATEGORIES.map(c => (
                  <option key={c.key} value={c.key}>{c.label}</option>
                ))}
              </select>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Location</label>
              <input
                className="form-input"
                type="text"
                name="location"
                placeholder="City, Region"
                value={form.location}
                onChange={handleChange}
                required
              />
            </div>

            <div className="form-group">
              <label className="form-label">Country</label>
              <input
                className="form-input"
                type="text"
                name="country"
                placeholder="e.g. India"
                value={form.country}
                onChange={handleChange}
                required
              />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Photo</label>
            <label className="file-upload-box">
              {preview ? (
                <img src={preview} alt="preview" className="file-preview" />
              ) : (
                <div className="file-placeholder">
                  <svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <rect x="3" y="3" width="18" height="18" rx="3"/>
                    <circle cx="8.5" cy="8.5" r="1.5"/>
                    <polyline points="21 15 16 10 5 21"/>
                  </svg>
                  <span>Click to upload image</span>
                </div>
              )}
              <input
                type="file"
                accept="image/*"
                onChange={handleImage}
                style={{ display: 'none' }}
              />
            </label>
          </div>

          <button className="form-submit" type="submit" disabled={submitting}>
            {submitting ? 'Creating...' : 'Create Listing'}
          </button>

        </form>
      </div>
    </div>
  )
}