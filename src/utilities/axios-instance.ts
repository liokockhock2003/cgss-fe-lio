import _axios from 'axios'
import { jwtDecode } from 'jwt-decode'
import { redirect } from 'react-router-dom'
import { getCurrentTenant } from './get-current-tenant.ts'

const instance = _axios.create({ baseURL: '/api', withCredentials: false })

instance.interceptors.request.use(
  (req) => {
    const token = localStorage.getItem('token')
    req['headers']['x-tenant-id'] = getCurrentTenant()
    req['headers']['authorization'] = token ? `${token}` : ''
    req['headers']['Access-Control-Allow-Origin'] = '*'
    req['headers']['Access-Control-Allow-Methods'] = 'GET,PUT,POST,DELETE,PATCH,OPTIONS'

    // if there is params.filter in request body, then stringify it for loopback req object
    if (req?.params?.filter) {
      req.params.filter = JSON.stringify(req.params.filter)
    }

    return req
  },
  (error) => {
    console.warn('axios.request.error :\n' + error)
    return Promise.reject(error)
  },
)

let retryTimes = 0
instance.interceptors.response.use(
  (res) => res,
  async (error) => {
    const originalRequest = error.config
    let isExpired

    if (localStorage.getItem('token')) {
      const token = localStorage.getItem('token')
      const decoded = jwtDecode(token)
      isExpired = Date.now() >= decoded.exp * 1000
    }

    // Retry
    if (error.response?.status === 401 && !originalRequest._retry && isExpired && retryTimes < 3) {
      retryTimes++
      originalRequest._retry = true
      originalRequest.headers.authorization = await refreshTokenApi()

      return axios(originalRequest).then(() => (retryTimes = 0))
    }

    // if localStorage empty
    if (error.response?.status === 401) {
      localStorage.removeItem('token')
      localStorage.removeItem('refresh_token')
      window.location.assign('/login')
    }

    console.warn('axios.response.error:\n', error)
    return Promise.reject(error)
  },
)

// NEED TO UPDATE, CAUSING CIRCULAR REQUEST
export const refreshTokenApi = async () => {
  const authorization = localStorage.getItem('refresh_token')

  try {
    const _response = await fetch(`/api/v1/refresh-tokens`, {
      headers: { authorization },
    })

    if (!_response.ok) {
      throw new Error('Network response was not ok')
    }

    const data = await _response.json()

    const userStorage = {
      token: data.accessToken ?? '',
      reToken: data.refreshToken ?? '',
      name: data.name ? data.name : '',
      uid: data.uid ? data.uid : '',
      role: data.role ? data.role : '',
      contact: data.contact ? data.contact : '',
      created: data.created,
    }

    localStorage.setItem('token', userStorage.token)
    localStorage.setItem('refresh_token', userStorage.reToken)

    redirect('/emission/dashboard')

    return userStorage.token
  } catch (err) {
    console.error(err)
    throw err
  }
}

export const axios = instance
