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
import PropTypes from 'prop-types'
import image from './wooden-bridge-flooded-rain-forest-645371.jpg'

const RegisterView = ({ state, callback }) => {
  useEffect(() => {
    const root = window.document.documentElement
    root.classList.add('layout-dashboard')

    return () => {
      root.classList.remove('layout-dashboard')
    }
  }, [])

  return (
    // <div className="bg-light min-vh-100 d-flex flex-row align-items-center">
    // <CContainer>
    // <CRow >
    //   <CCol>
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
            validated={state.formValidated}
            onSubmit={(ev) => {
              const form = ev.currentTarget
              ev.preventDefault()
              if (form.checkValidity() === false) {
                ev.stopPropagation()
              }
              callback.onLogin(form.checkValidity())
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
                    value={state.email}
                    valid={state.emailValid}
                    invalid={state.emailInvalid}
                    onChange={(ev) => {
                      ev.preventDefault()
                      callback.onEmailChange(ev.target.value)
                    }}
                    feedbackInvalid={state.emailInvalidFeedback}
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
                    value={state.email}
                    valid={state.emailValid}
                    invalid={state.emailInvalid}
                    onChange={(ev) => {
                      ev.preventDefault()
                      callback.onEmailChange(ev.target.value)
                    }}
                    feedbackInvalid={state.emailInvalidFeedback}
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
                value={state.email}
                valid={state.emailValid}
                invalid={state.emailInvalid}
                onChange={(ev) => {
                  ev.preventDefault()
                  callback.onEmailChange(ev.target.value)
                }}
                feedbackInvalid={state.emailInvalidFeedback}
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
                value={state.password}
                valid={state.passwordValid}
                invalid={state.passwordInvalid}
                onChange={(ev) => {
                  ev.preventDefault()
                  callback.onPasswordChange(ev.target.value)
                }}
                feedbackInvalid={state.passwordInvalidFeedback}
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
              {state.formInvalid && (
                <CCardBody style={{ marginTop: '10px' }}>
                  <CAlert color='danger' dismissible>
                    {state.formInvalidFeedback}
                  </CAlert>
                </CCardBody>
              )}
            </CRow>
          </CForm>
        </CCardBody>
      </CCard>
    </CCardGroup>
    //   </CCol>
    // </CRow>
    // </CContainer>
  )
}

RegisterView.propTypes = {
  state: PropTypes.shape({
    email: PropTypes.string,
    emailValid: PropTypes.bool,
    emailInvalid: PropTypes.bool,
    emailInvalidFeedback: PropTypes.string,
    password: PropTypes.string,
    passwordValid: PropTypes.bool,
    passwordInvalid: PropTypes.bool,
    passwordInvalidFeedback: PropTypes.string,
    formValidated: PropTypes.bool,
    formInvalid: PropTypes.bool,
    formInvalidFeedback: PropTypes.string,
    user: PropTypes.string,
  }).isRequired,
  callback: PropTypes.shape({
    onLogin: PropTypes.func,
    onEmailChange: PropTypes.func,
    onPasswordChange: PropTypes.func,
    onForgotPassword: PropTypes.func,
    setUser: PropTypes.func,
  }).isRequired,
}

export default RegisterView
