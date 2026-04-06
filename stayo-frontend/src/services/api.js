function normalizeApiBaseUrl(baseUrl) {
  const trimmed = (baseUrl || '').trim().replace(/\/$/, '')
  if (!trimmed) return '/api'
  if (trimmed.endsWith('/api')) return trimmed
  if (trimmed.startsWith('http://') || trimmed.startsWith('https://') || trimmed.startsWith('/')) {
    return `${trimmed}/api`
  }
  return `/api`
}

const API_BASE_URL = normalizeApiBaseUrl(import.meta.env.VITE_API_URL)

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

  const contentType = response.headers.get('content-type') || ''
  const isJson = contentType.includes('application/json')

  if (!response.ok) {
    let message = `Request failed: ${response.status}`
    if (isJson) {
      try {
        const errData = await response.json()
        if (errData?.message) message = errData.message
      } catch {
        // Keep fallback error message when response isn't valid JSON
      }
    } else {
      try {
        const text = await response.text()
        if (text && text.toLowerCase().includes('<!doctype')) {
          message = 'Received HTML instead of JSON. Check VITE_API_URL and backend deployment URL.'
        }
      } catch {
        // Keep fallback error message
      }
    }
    throw new Error(message)
  }

  if (response.status === 204) return null
  if (!isJson) {
    throw new Error('Expected JSON response but received non-JSON content.')
  }

  return response.json()
}
