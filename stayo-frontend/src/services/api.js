const API_BASE_URL = import.meta.env.VITE_API_URL || '/api'

export default async function api(path, options = {}) {
  const isFormData = options.body instanceof FormData
  const headers = {
    ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
    ...(options.headers || {}),
  }

  const response = await fetch(`${API_BASE_URL}${path}`, {
    credentials: 'include',
    headers,
    ...options,
  })

  if (!response.ok) {
    let message = `Request failed: ${response.status}`
    try {
      const errData = await response.json()
      if (errData?.message) message = errData.message
    } catch {
      // Keep fallback error message when response isn't JSON
    }
    throw new Error(message)
  }

  if (response.status === 204) return null
  return response.json()
}
