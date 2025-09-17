import { cilEnvelopeLetter, cilLockLocked, cilPeople } from '@coreui/icons'
import CIcon from '@coreui/icons-react'
import {
  CAlert,
  CButton,
  CCard,
  CCardBody,
  CCardGroup,
  CCol,
  CForm,
  CFormInput,
  CFormLabel,
  CInputGroup,
  CInputGroupText,
  CRow,
} from '@coreui/react-pro'
import image from './wooden-bridge-flooded-rain-forest-645371.jpg'

export const Component = (props) => {
  const [email, setEmail] = useState('')
  const [emailValid, setEmailValid] = useState(false)
  const [emailInvalid, setEmailInvalid] = useState(false)
  const [emailInvalidFeedback, setEmailInvalidFeedback] = useState('Email is required')
  const [password, setPassword] = useState('')
  const [passwordInvalid, setPasswordInvalid] = useState(false)
  const [passwordValid, setPasswordValid] = useState(false)
  const [passwordInvalidFeedback, setPasswordInvalidFeedback] = useState('Password is required')
  const [formValidated, setFormValidated] = useState(false)
  const [formInvalid, setFormInvalid] = useState(false)
  const [formInvalidFeedback, setFormInvalidFeedback] = useState('Email and Password do not matched')

  const onEmailChanged = (userEmail) => {
    if (userEmail === '') {
      setEmailInvalidFeedback('Field is required')
      if (formValidated) {
        setEmailInvalid(true)
        setEmailValid(false)
      }
    } else {
      setEmailInvalidFeedback('')
      if (formValidated) {
        setEmailInvalid(false)
        setEmailValid(true)
      }
    }

    if (/^[a-zA-Z0-9]+@[a-zA-Z0-9]+\.[A-Za-z]+$/.test(userEmail)) {
      setEmailInvalidFeedback('')
      if (formValidated) {
        setEmailInvalid(false)
        setEmailValid(true)
      }
    } else {
      setEmailInvalidFeedback('Please provide a valid Email address')
      if (formValidated) {
        setEmailInvalid(true)
        setEmailValid(false)
      }
    }

    setFormInvalid(false)
    setEmail(userEmail)
  }

  const onPasswordChanged = (passwd) => {
    if (passwd === '') {
      setPasswordInvalidFeedback('Field is required')
      if (formValidated) {
        setPasswordInvalid(true)
        setPasswordValid(false)
      }
    } else {
      setPasswordInvalidFeedback('')
      if (formValidated) {
        setPasswordInvalid(false)
        setPasswordValid(true)
      }
    }

    if (passwd.length < 6) {
      setPasswordInvalidFeedback('Password must be longer than 6 characters')
      if (formValidated) {
        setPasswordInvalid(true)
        setPasswordValid(false)
      }
    } else {
      setPasswordInvalidFeedback('')
      if (formValidated) {
        setPasswordInvalid(false)
        setPasswordValid(true)
      }
    }

    setFormInvalid(false)
    setPassword(passwd)
  }

  const onUserLogin = (valid) => {
    setFormValidated(true)

    if (password.length < 6 && password !== '') {
      setPasswordInvalidFeedback('Password must be longer than 6 characters')
      setPasswordInvalid(true)
      setPasswordValid(false)
      return
    }

    // if (valid) {
    //   login(email, password)
    // }
  }

  return (
    <CCardGroup style={{ height: '100vh', width: '100%' }}>
      <CCard style={{ flexGrow: '1.7' }}>
        <img src={image} alt='Logo' style={{ height: '100%', filter: ' brightness(35%)' }} />
        <img
          src='/unique_logo.png'
          alt='logo'
          style={{ position: 'absolute', color: 'white', marginLeft: '5%', height: '20%', marginTop: '2%' }}
        />
        {/* <div style={{ position: 'absolute', color: 'white', margin: '15%' }}>A CGS Logo will be here</div> */}
        <div
          style={{
            position: 'absolute',
            color: 'white',
            top: '50%',
            marginTop: '15%',
            marginLeft: '2%',
            fontSize: '73px',
          }}>
          <strong>Together We Can Restore The Planet</strong>
        </div>
      </CCard>
      <CCard className='p-4'>
        <CCardBody>
          <CForm
            noValidate
            validated={formValidated}
            onSubmit={(ev) => {
              const form = ev.currentTarget
              ev.preventDefault()
              if (form.checkValidity() === false) {
                ev.stopPropagation()
              }
              // onLogin(form.checkValidity())
            }}>
            <h2 style={{ marginLeft: '9%', paddingTop: '20%' }}>Register</h2>
            <h6 style={{ marginLeft: '9%', paddingBottom: '5%', paddingTop: '2%' }}>Create your account</h6>
            <CRow>
              <CCol md={5}>
                <label style={{ position: 'relative', left: '25%' }}>
                  <h6>First Name</h6>
                </label>
                <CInputGroup className='mb-3' style={{ position: 'relative', left: '25%' }}>
                  <CInputGroupText id='inputGroup-sizing-default'>
                    <CIcon icon={cilPeople} />
                  </CInputGroupText>
                  <CFormInput
                    style={{ color: 'black' }}
                    type='text'
                    placeholder='John'
                    autoComplete='current-email'
                    value={email}
                    valid={emailValid}
                    invalid={emailInvalid}
                    onChange={(ev) => {
                      ev.preventDefault()
                      onEmailChanged(ev.target.value)
                    }}
                    feedbackInvalid={emailInvalidFeedback}
                    required
                  />
                </CInputGroup>
              </CCol>
              <CCol md={5}>
                <label style={{ position: 'relative', left: '25%' }}>
                  <h6>Last Name</h6>
                </label>
                <CInputGroup className='mb-3' style={{ position: 'relative', left: '25%' }}>
                  <CFormInput
                    style={{ color: 'black' }}
                    type='text'
                    placeholder='Albert'
                    autoComplete='current-email'
                    value={email}
                    valid={emailValid}
                    invalid={emailInvalid}
                    onChange={(ev) => {
                      ev.preventDefault()
                      onEmailChanged(ev.target.value)
                    }}
                    feedbackInvalid={emailInvalidFeedback}
                    required
                  />
                </CInputGroup>
              </CCol>
            </CRow>

            <CFormLabel style={{ position: 'relative', left: '9%' }}>
              <h6>Email</h6>
            </CFormLabel>
            <CInputGroup className='mb-3' style={{ width: '83%', position: 'relative', left: '9%' }}>
              <CInputGroupText id='inputGroup-sizing-default'>
                <CIcon icon={cilEnvelopeLetter} />
              </CInputGroupText>
              <CFormInput
                style={{ color: 'black' }}
                type='email'
                placeholder='syafiqah1654@gmail.com'
                autoComplete='current-email'
                value={email}
                valid={emailValid}
                invalid={emailInvalid}
                onChange={(ev) => {
                  ev.preventDefault()
                  onEmailChanged(ev.target.value)
                }}
                feedbackInvalid={emailInvalidFeedback}
                required
              />
            </CInputGroup>
            <CFormLabel style={{ position: 'relative', left: '9%' }}>
              <h6>Password</h6>
            </CFormLabel>
            <CInputGroup className='mb-3' style={{ width: '83%', position: 'relative', left: '9%' }}>
              <CInputGroupText id='inputGroup-sizing-default'>
                <CIcon icon={cilLockLocked} />
              </CInputGroupText>
              <CFormInput
                style={{ placeholder: 'white' }}
                type='password'
                placeholder='************'
                autoComplete='current-password'
                value={password}
                valid={passwordValid}
                invalid={passwordInvalid}
                onChange={(ev) => {
                  ev.preventDefault()
                  onPasswordChanged(ev.target.value)
                }}
                feedbackInvalid={passwordInvalidFeedback}
                required
              />
            </CInputGroup>
            <CRow>
              <CCol
                className='text-right'
                style={{ paddingTop: '2%', fontSize: '12px', textDecoration: 'none', marginLeft: '9%' }}>
                You must fill in all field to be able to continue
              </CCol>
            </CRow>
            <CRow style={{ position: 'center' }}>
              <CCol>
                <CButton
                  type='submit'
                  className='px-4'
                  style={{
                    width: '83%',
                    position: 'relative',
                    left: '9%',
                    marginTop: '5%',
                    backgroundColor: '#044A89',
                    borderRadius: '10px',
                  }}>
                  Sign Up
                  <br />
                </CButton>
              </CCol>
            </CRow>
            <CRow>
              {formInvalid && (
                <CCardBody style={{ marginTop: '10px' }}>
                  <CAlert color='danger' dismissible>
                    {formInvalidFeedback}
                  </CAlert>
                </CCardBody>
              )}
            </CRow>
          </CForm>
        </CCardBody>
      </CCard>
    </CCardGroup>
  )
}

Component.displayName = 'Register'
