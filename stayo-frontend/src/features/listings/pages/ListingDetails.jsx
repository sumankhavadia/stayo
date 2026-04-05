import { useState, useEffect, useRef } from 'react'
import { useParams, useNavigate, Link } from 'react-router-dom'
import { useAuth } from '../../auth/hooks/useAuth'
import { useToast } from '../../../hooks/Usetoast'
import { deleteListing, getListingById } from '../listingsAPI'
import mapboxgl from 'mapbox-gl'
import 'mapbox-gl/dist/mapbox-gl.css'
import './ListingDetails.css'

const FALLBACK = 'https://images.unsplash.com/photo-1505691938895-1758d7feb511?auto=format&fit=crop&w=800&q=80'

const StarRating = ({ value, onChange }) => (
  <div className="star-rating">
    {[1, 2, 3, 4, 5].map(star => (
      <button
        key={star}
        type="button"
        className={`star ${value >= star ? 'filled' : ''}`}
        onClick={() => onChange?.(star)}
      >
        ★
      </button>
    ))}
  </div>
)

const StarDisplay = ({ value }) => (
  <div className="star-display">
    {[1, 2, 3, 4, 5].map(star => (
      <span key={star} className={`star ${value >= star ? 'filled' : ''}`}>★</span>
    ))}
  </div>
)

export default function ListingDetails({ listing, onDelete, onReviewSubmit, onReviewDelete }) {
  const { id } = useParams()
  const { currentUser } = useAuth()
  const { toast } = useToast()
  const navigate = useNavigate()
  const mapRef = useRef(null)
  const [rating, setRating] = useState(0)
  const [comment, setComment] = useState('')
  const [submitting, setSubmitting] = useState(false)
  const [listingData, setListingData] = useState(listing || null)
  const [loading, setLoading] = useState(!listing)

  useEffect(() => {
    setListingData(listing || null)
    setLoading(!listing)
  }, [listing])

  useEffect(() => {
    let active = true

    async function loadListing() {
      if (listing || !id) return
      try {
        const data = await getListingById(id)
        if (!active) return
        setListingData(data)
      } catch {
        if (!active) return
        toast({ message: 'Unable to load listing details', type: 'error' })
      } finally {
        if (active) setLoading(false)
      }
    }

    loadListing()
    return () => {
      active = false
    }
  }, [id, listing, toast])

  const isOwner = currentUser && listingData?.owner &&
    (listingData.owner._id === currentUser._id || listingData.owner === currentUser._id)

  useEffect(() => {
    if (!listingData?.geometry?.coordinates || !mapRef.current) return
    const [lng, lat] = listingData.geometry.coordinates
    const token = import.meta.env.VITE_MAP_TOKEN
    if (!token) return

    mapboxgl.accessToken = token
    const map = new mapboxgl.Map({
      container: mapRef.current,
      style: 'mapbox://styles/mapbox/dark-v11',
      center: [lng, lat],
      zoom: 10,
    })
    new mapboxgl.Marker({ color: '#e8c547' })
      .setLngLat([lng, lat])
      .setPopup(new mapboxgl.Popup().setText(listingData.location))
      .addTo(map)
    return () => map.remove()
  }, [listingData])

  const handleDelete = async () => {
    if (!confirm('Delete this listing?')) return
    try {
      if (onDelete) {
        await onDelete()
      } else {
        await deleteListing(listingData._id)
      }
      toast({ message: 'Listing deleted', type: 'success' })
      navigate('/listings')
    } catch (err) {
      toast({ message: err.message || 'Unable to delete listing', type: 'error' })
    }
  }

  const handleReviewSubmit = async (e) => {
    e.preventDefault()
    if (!rating) return toast({ message: 'Please select a rating', type: 'error' })
    setSubmitting(true)
    await onReviewSubmit?.({ rating, comment })
    toast({ message: 'Review submitted!', type: 'success' })
    setRating(0)
    setComment('')
    setSubmitting(false)
  }

  if (loading || !listingData) return (
    <div className="details-loading">
      <div className="spinner" />
    </div>
  )

  return (
    <div className="details-page">
      <div className="details-container">

        {/* IMAGE */}
        <div className="details-img-wrap">
          <img
            src={listingData.image?.url || FALLBACK}
            alt={listingData.title}
            className="details-img"
          />
        </div>

        <div className="details-body">

          {/* HEADER */}
          <div className="details-header">
            <div>
              <h1 className="details-title">{listingData.title}</h1>
              <p className="details-location">
                <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                  <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z"/>
                  <circle cx="12" cy="10" r="3"/>
                </svg>
                {listingData.location}, {listingData.country}
              </p>
              <p className="details-owner">
                Hosted by <strong>{listingData.owner?.username || 'Unknown'}</strong>
              </p>
            </div>
            <div className="details-price-box">
              <span className="details-price">₹{listingData.price?.toLocaleString('en-IN')}</span>
              <span className="details-price-unit">/ night</span>
            </div>
          </div>

          {/* DESCRIPTION */}
          <p className="details-description">{listingData.description}</p>

          {/* OWNER ACTIONS */}
          {isOwner && (
            <div className="owner-actions">
              <Link to={`/listings/${listingData._id}/edit`} className="btn-edit">Edit listing</Link>
              <button className="btn-delete" onClick={handleDelete}>Delete</button>
            </div>
          )}

          <div className="details-divider" />

          {/* MAP */}
          <div className="map-section">
            <h3 className="section-title">Where you'll be</h3>
            <div ref={mapRef} className="map-box" />
          </div>

          <div className="details-divider" />

          {/* REVIEW FORM */}
          {currentUser && (
            <>
              <h3 className="section-title">Write a Review</h3>
              <form className="review-form" onSubmit={handleReviewSubmit}>
                <div className="form-group">
                  <label className="form-label">Rating</label>
                  <StarRating value={rating} onChange={setRating} />
                </div>
                <div className="form-group">
                  <label className="form-label">Comment</label>
                  <textarea
                    className="review-textarea"
                    rows={4}
                    placeholder="Share your experience..."
                    value={comment}
                    onChange={e => setComment(e.target.value)}
                    required
                  />
                </div>
                <button className="btn-submit" type="submit" disabled={submitting}>
                  {submitting ? 'Submitting...' : 'Submit Review'}
                </button>
              </form>
              <div className="details-divider" />
            </>
          )}

          {/* REVIEWS */}
          <h3 className="section-title">
            All Reviews
            <span className="review-count">{listingData.reviews?.length || 0}</span>
          </h3>

          {(!listingData.reviews || listingData.reviews.length === 0) ? (
            <p className="no-reviews">No reviews yet. Be the first!</p>
          ) : (
            <div className="reviews-grid">
              {listingData.reviews.map(review => (
                <div key={review._id} className="review-card">
                  <div className="review-header">
                    <div className="review-avatar">
                      {review.author?.username?.[0]?.toUpperCase() || 'A'}
                    </div>
                    <div>
                      <p className="review-author">@{review.author?.username || 'Anonymous'}</p>
                      <p className="review-date">
                        {new Date(review.createdAt).toLocaleDateString('en-IN')}
                      </p>
                    </div>
                  </div>
                  <StarDisplay value={review.rating} />
                  <p className="review-comment">{review.comment}</p>
                  {currentUser && review.author &&
                    (review.author._id === currentUser._id || review.author === currentUser._id) && (
                    <button
                      className="review-delete"
                      onClick={() => onReviewDelete?.(review._id)}
                    >
                      Delete
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}

        </div>
      </div>
    </div>
  )
}