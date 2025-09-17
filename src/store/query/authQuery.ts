import { axios } from '@/utilities/axios-instance'

type LoginResponse = {
  // id: number
  accessToken: string
  refreshToken: string
  // name: string
  // username: string
  // email: string
  // cardId: null
  // staffId: null | string
  // isDeleted: boolean
  // realm: null
  // emailVerified: boolean

  // userDetail: {
  //   phoneNumber: string
  //   id: number
  //   address1: null
  //   address2: null
  //   picture: null
  // }
  // userAccessGroups: {
  //   id: number
  //   name: string
  //   priority: number
  // }[]
}

export const AuthQuery = {
  // eslint-disable-next-line
  login: ({ onSuccess, onError }: { onSuccess: (data: LoginResponse) => void; onError: (e: any) => void }) => {
    return {
      async mutationFn({ email: usernameOrEmail, password }: { email: string; password: string }) {
        return axios.post('/v1/users/login', { usernameOrEmail, password }) as Promise<{ data: LoginResponse }>
      },

      onSuccess: (response: { data: LoginResponse }) => {
        const { accessToken, refreshToken } = response.data

        localStorage.setItem('token', accessToken)
        localStorage.setItem('refresh_token', refreshToken)

        onSuccess(response.data)
      },

      onError: (error) => {
        onError(error)
      },
    }
  },
}
