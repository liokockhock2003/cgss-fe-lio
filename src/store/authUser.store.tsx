import { Loading2 } from '@/components/Loading'
import { axios } from '@/utilities/axios-instance'
import { ReactNode, useContext, useState, useEffect, useMemo } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { AuthUser } from './authUser.context'

function useAuthUser() {
  const context = useContext(AuthUser)
  if (!context) {
    throw new Error(`useAuthUser must be used within a AuthUser`)
  }

  return context
}

function AuthUserProvider(props: { children: ReactNode }) {
  const navigate = useNavigate()
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState(false)
  const [authUser, setAuthUser] = useState(undefined)

  const getMe = async () => {
    setLoading(true)
    setError(false)

    try {
      const response = await axios.get('/v1/me')
      setAuthUser(response.data)
    } catch (e) {
      setError(true)
      navigate('/login')
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    if (localStorage.getItem('token')) {
      getMe()
    } else {
      navigate('/login', { replace: true })
    }
  }, [navigate])

  const value = useMemo(() => ({
    authUser,
    setAuthUser,
    ignorePermission: false
  }), [authUser])

  if (loading) return <Loading2 />
  if (error) return <Navigate to='/login' />

  return authUser ? <AuthUser.Provider value={value} {...props} /> : <Loading2 />
}

export { AuthUserProvider, useAuthUser }
