import { Link } from 'react-router-dom'

export default function ListingCard({ listing }) {
  return (
    <article>
      <h3>{listing.title}</h3>
      <p>{listing.location}</p>
      <Link to={`/listings/${listing.id}`}>View details</Link>
    </article>
  )
}
