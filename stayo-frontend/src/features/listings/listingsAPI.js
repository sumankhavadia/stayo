import api from '../../services/api'

export async function getListings() {
  return api('/listings')
}

export async function getListingById(id) {
  return api(`/listings/${id}`)
}

export async function createListing(payload) {
  return api('/listings', {
    method: 'POST',
    body: payload,
  })
}

export async function updateListing(id, payload) {
  return api(`/listings/${id}`, {
    method: 'PUT',
    body: payload,
  })
}

export async function deleteListing(id) {
  return api(`/listings/${id}`, {
    method: 'DELETE',
  })
}
