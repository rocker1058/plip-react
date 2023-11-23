import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { useDispatch } from 'react-redux'

import ForgotPasswordModal from './Modals/ForgotPasswordModal'
import logo from '../../../Assets/img/logo_plip_completo.png'
import homebg from '../../../Assets/img/bghome.png'
import { signIn, CustomForm } from '../../Common'
import { SET_NAVBAR_PROPERTIES, SET_SIDEBAR_PROPERTIES, LOG_IN } from '../../../Redux/Actions'

function Login() {
	const [ email, setEmail ] = useState('')
	const [ password, setPassword ] = useState('')
	const [ error, setError ] = useState(false)
	const [ visibleForgotPassword, setVisibleForgotPassword ] = useState(false)
	const [ isLoggingIn, setLoggingIn ] = useState(false)
	const dispatch = useDispatch()
	useEffect(() => {
		dispatch({ type: SET_NAVBAR_PROPERTIES, visibility: false })
		dispatch({ type: SET_SIDEBAR_PROPERTIES, visibility: false })
	}, [])

	const onLogin = (e) => {
		e.preventDefault()
		setLoggingIn(true)
		if (email && password) {
			signIn(email.toLowerCase(), password)
				.then((res) => {
					if (res.type === 'Success') {
						setLoggingIn(false)
						dispatch({ type: LOG_IN })
					}
				})
				.catch(() => {
					setLoggingIn(false)
					setError(true)
					setTimeout(() => setError(false), 5000)
				})
		}
		else {
			setLoggingIn(false)
		}
	}

	const showForgotPasswordModal = (e) => {
		e.preventDefault()
		setVisibleForgotPassword(true)
	}

	return (
		<div className="col-12 full-height login">
			<div className="row justify-content-start">
				<div className="loginForm col-12 col-lg-6">
					<div className="row justify-content-center justify-content-lg-start">
						<div className="col-6 offset-lg-2 mt-5">
							<img className="img-fluid" src={logo} alt="PliP" />
						</div>
					</div>
					<div className="row justify-content-center">
						<div className="col-12 col-sm-10 col-md-8 mt-3">
							{error && <div className="alert alert-danger" role="alert">Usuario o Contraseña incorrecta</div>}
						</div>
						<form className="col-12 col-lg-8">
							<h1 className="text-center">Ingresa a PliP</h1>
							<p className="text-center">Por favor ingresa los datos en los espacios correspondientes</p>
							<div className="form-group">
								<label htmlFor="inputEmail">Email</label>
								<CustomForm.CustomInput
									onChange={(_, value) => setEmail(value)}
									name="email" className="form-control" type="email" placeholder="Email"/>
							</div>
							<div className="form-group">
								<label htmlFor="inputPassword">Contraseña</label>
								<CustomForm.CustomInput
									onChange={(_, value) => setPassword(value)}
									name="password" className="form-control" type="password" id="inputPassword" placeholder="Contraseña"/>
							</div>
							<CustomForm.LoadingButton loading={isLoggingIn} onClick={onLogin} className="btn btn-lg btn-block btn-primary">Ingresar</CustomForm.LoadingButton>
						</form>
					</div>
					<div className="row mt-5">
						<div className="col-12 text-center">
							<a onClick={showForgotPasswordModal} className="forgot-password text-center" href="#">¿Olvidaste tu contraseña?</a>
						</div>
					</div>
				</div>
				<div className="homebg col-12 col-lg-6 px-0 d-none d-lg-block">
					<img className="img-fluid" src={homebg} alt="homebg plip" />
				</div>
			</div>
			<ForgotPasswordModal visible={visibleForgotPassword} setVisible={setVisibleForgotPassword}/>
		</div>
	)
}

Login.propTypes = {
	client: PropTypes.object,
	connector: PropTypes.object,
	dispatch: PropTypes.func,
}

export default Login
