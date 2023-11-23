import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import qs from 'query-string'
import { useHistory } from 'react-router-dom'
import { useForm } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import { forgotPasswordConfirmation, CustomForm } from '../Common'
import { SET_NAVBAR_PROPERTIES, SET_SIDEBAR_PROPERTIES } from '../../Redux/Actions'
import swal from 'sweetalert'

import logo from '../../Assets/img/logo_plip_completo.png'
import homebg from '../../Assets/img/bghome.png'

function ResetPassword({ location }) {
	const history = useHistory()
	const dispatch = useDispatch()
	const { username, code } = qs.parse(location.search)
	const { register, handleSubmit, errors, getValues } = useForm()
	const [ loading, setLoading ] = useState(false)

	useEffect(() => {
		dispatch({ type: SET_NAVBAR_PROPERTIES, visibility: false })
		dispatch({ type: SET_SIDEBAR_PROPERTIES, visibility: false })
	}, [])
    
	useEffect(() => {
        
	})

	const resetPassword = async ({ newPassword }) => {
		try {
			setLoading(true)
			await forgotPasswordConfirmation(username, code, newPassword)
			swal({
				text: '¡Se ha reasignado tu contraseña exitosamente!',
				icon: 'success',
				buttons: {
					confirm: 'Iniciar sesión',
				},
			})
				.then(() => history.push('/'))
		}
		catch(e) {
			swal({
				title: 'Error',
				text: 'Este vínculo se encuentra vencido o es inválido. Intenta recuperar contraseña de nuevo',
				icon: 'error',
			})
				.then(() => history.push('/'))
		}
		setLoading(false)
	
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
						<form className="col-12 col-lg-8 mb-5" onSubmit={handleSubmit(resetPassword)}>
							<h1 className="text-center">Asigna tu contraseña de PliP</h1>
							<p className="text-center">Ingresa los datos solicitados</p>
							<div className="form-group">
								<label htmlFor="inputPassword">Contraseña</label>
								<input ref={register({ required: true, minLength: 6 })} name="newPassword" className="form-control" type="password" required/>
								{errors.newPassword && <span style={{ color: 'red' }}>La contraseña debe tener mínimo 6 caracteres</span>}
							</div>
							<div className="form-group">
								<label htmlFor="inputPassword">Confirmación de contraseña</label>
								<input ref={register({ required: true, minLength: 6, validate: value => value === getValues().newPassword })} name="newPasswordVerification" className="form-control" type="password" required/>
								{errors.newPasswordVerification && <span style={{ color: 'red' }}>Las contraseñas deben coincidir</span>}
							</div>
							<div className="row justify-content-center">
								<CustomForm.LoadingButton loading={loading} className="btn btn-primary btn-block btn-lg">Cambiar contraseña</CustomForm.LoadingButton>
							</div>
						</form>
					</div>
				</div>
				<div className="homebg col-12 col-lg-6 px-0 d-none d-lg-block">
					<img className="img-fluid" src={homebg} alt="homebg plip" />
				</div>
			</div>
		</div>
	)
}

ResetPassword.propTypes = {
	location: PropTypes.object,
}

export default ResetPassword
