import api from '../../services/api'

export function loginUser(payload) {
  return api('/auth/login', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function signupUser(payload) {
  return api('/auth/signup', {
    method: 'POST',
    body: JSON.stringify(payload),
  })
}

export function logoutUser() {
  return api('/auth/logout', {
    method: 'POST',
  })
}

export function getCurrentUser() {
  return api('/auth/me')
}
