import { useAuthUser } from '@/store'
import { axios } from '@/utilities/axios-instance'
import { cilClipboard } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import { CButton, CCard, CCardBody, CCardTitle, CCol, CFormInput, CImage, CRow } from '@coreui/react-pro'

export const Component = () => {
  const { authUser } = useAuthUser()
  const [pass1, setPass1] = useState([])
  const [pass2, setPass2] = useState()
  const [checking1, setChecking1] = useState()
  const [color1, setColor1] = useState()
  const [checking2, setChecking2] = useState()
  const [color2, setColor2] = useState()

  const handleSubmit = async () => {
    try {
      const res = await axios.post(`/v1/users/${authUser.id}/reset-password`, { password: pass1 })
      setPass1('')
      setPass2('')
      alert('Password Updated Successfully')
    } catch (error) {
      alert('Failed')
      console.log('Password Failed', error)
    }
  }

  const handleChecking1 = (event) => {
    if (pass1.length > 5) {
      setChecking1('Valid Password')
      setColor1('green')
    } else {
      setChecking1('Invalid Password')
      setColor1('red')
    }
  }
  const handleChecking2 = (event) => {
    if (pass1 === pass2) {
      setChecking2('Password Matches')
      setColor2('green')
    } else {
      setChecking2('Password Does Not Match')
      setColor2('red')
    }
  }

  return (
    <CCard>
      <CRow>
        <CCol sm={3} className='bg-white text-black' style={{ paddingLeft: '2%', paddingTop: '4%' }}>
          <div className='flex justify-center'>
            <CImage width='100vw' height='100vh' className='rounded-full border' src='/unique_logo.png'></CImage>
          </div>

          <hr />
          <div style={{ textAlign: 'center' }}>
            <CRow>
              <CCol>{authUser.name}</CCol>
            </CRow>
            <CRow>
              <CCol>{authUser.email}</CCol>
            </CRow>
          </div>
          <hr />
        </CCol>
        <CCol sm={9}>
          <CCard style={{ margin: '2%' }}>
            <CCardTitle style={{ backgroundColor: '#044A89', color: 'white' }}>
              <div style={{ margin: '1%' }}>Reset Password</div>
            </CCardTitle>
            <CCardTitle className='text-4xl font-normal'>
              <strong>Reset Password</strong>
            </CCardTitle>

            <CCardBody>
              <label htmlFor='password'>
                New Password<sup style={{ color: 'red' }}>*</sup>
              </label>
              <CFormInput
                size='sm'
                placeholder='Insert New Password'
                id='password'
                aria-label='Search Phone Number'
                type='password'
                aria-describedby='button-addon2'
                style={{ borderColor: color1 }}
                onChange={(event) => setPass1(event.target.value)}
                onBlur={() => {
                  handleChecking1()
                  handleChecking2()
                }}
              />
              <div className={'pb-3'} style={{ color: color1 }}>
                {checking1}
              </div>
              <label htmlFor='confirm_password'>
                Repeat Password<sup style={{ color: 'red' }}>*</sup>
              </label>
              <CFormInput
                size='sm'
                placeholder='Repeat Password'
                id='confirm_password'
                aria-label='Search Phone Number'
                type='password'
                aria-describedby='button-addon2'
                style={{ borderColor: color2 }}
                onChange={(event) => setPass2(event.target.value)}
                onBlur={() => handleChecking2()}
              />
              <div style={{ color: color2 }}>{checking2}</div>
              <CButton
                size='sm'
                type='button'
                color='primary'
                variant='outline'
                id='button-addon2'
                style={{ marginTop: '2%', marginLeft: '89%' }}
                onClick={(e) => handleSubmit()}>
                Submit <CIcon icon={cilClipboard} />
              </CButton>
            </CCardBody>
          </CCard>
        </CCol>
      </CRow>
    </CCard>
  )
}

Component.displayName = 'Profile'
