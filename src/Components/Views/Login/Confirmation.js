import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { Link } from 'react-router-dom'
import qs from 'query-string'
import PhoneInput, { isValidPhoneNumber, parsePhoneNumber } from 'react-phone-number-input'
import { useForm } from 'react-hook-form'
import { useDispatch } from 'react-redux'
import { confirmInvite, CustomForm } from '../../Common'
import { SET_NAVBAR_PROPERTIES, SET_SIDEBAR_PROPERTIES } from '../../../Redux/Actions'
import { Redirect } from 'react-router-dom'
import swal from 'sweetalert'

import logo from '../../../Assets/img/logo_plip_completo.png'
import homebg from '../../../Assets/img/bghome.png'

function Confirmation({ location }) {
	const dispatch = useDispatch()
	const { username, confirmation, email } = qs.parse(location.search)
	const { register, handleSubmit, errors } = useForm()
	const [ phone, setPhone ] = useState(null)
	const [ tos, setTos ] = useState(false)
	const [ isConfirmed, setIsConfirmed ] = useState(false)
	const [ loading, setLoading ] = useState(false)

	useEffect(() => {
		dispatch({ type: SET_NAVBAR_PROPERTIES, visibility: false })
		dispatch({ type: SET_SIDEBAR_PROPERTIES, visibility: false })
	}, [])

	const welcomeUser = async ({ newPassword, ...attributes }) => {
		if (Object.keys(errors).length === 0 && phone) {
			try {
				setLoading(true)
				await confirmInvite(username, confirmation, newPassword, { ...attributes, phone_number: phone })
				swal({
					text: '¡Tu registro ha sido exitoso!',
					icon: 'success',
					buttons: {
						confirm: 'Ir a la plataforma',
					},
				})
					.then(() => setIsConfirmed(true))
			}
			catch(e) {
				swal({
					title: 'Error',
					text: 'Este vínculo se encuentra vencido o es inválido. Ponte en contacto con tu administrador para solicitar uno nuevo.',
					icon: 'error',
				})
					.then(() => setIsConfirmed(true))
			}
			setLoading(false)
		}
	}

	if (isConfirmed) {
		return <Redirect to="/" />
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
						<form className="col-12 col-lg-8 mb-5" onSubmit={handleSubmit(welcomeUser)}>
							<h1 className="text-center">Completa tu perfil de PliP</h1>
							<p className="text-center">Ingresa los datos solicitados</p>
							<div className="form-group">
								<label htmlFor="inputName">Nombre</label>
								<input ref={register({ required: true })} name="name" className="form-control" type="text" required/>
							</div>
							<div className="form-group">
								<label htmlFor="inputSurname">Apellido</label>
								<input ref={register({ required: true })} name="family_name" className="form-control" type="text" required/>
							</div>
							<div className="form-group">
								<label htmlFor="exampleInputPhone">Teléfono</label>
								<PhoneInput numberInputProps={{ className: 'form-control', placeholder: 'Teléfono' }} onChange={setPhone} value={phone} defaultCountry='CO' country={isValidPhoneNumber(phone || '') ? parsePhoneNumber(phone || '').country : ''} countries={[ 'CO' ]} required />
							</div>
							<div className="form-group">
								<label htmlFor="inputSurname">Email</label>
								<input value={email} className="form-control" type="text" disabled/>
							</div>
							<div className="form-group">
								<label htmlFor="inputPassword">Contraseña</label>
								<input ref={register({ required: true, minLength: 6 })} name="newPassword" className="form-control" type="password" required/>
								{errors.newPassword && <span style={{ color: 'red' }}>La contraseña debe tener mínimo 6 caracteres</span>}
							</div>
							<div className="form-group custom-control custom-checkbox">
								<input className="custom-control-input" type="checkbox" name="privacyPolicy" checked={tos} id="privacy-check-box" onChange={e => setTos(e.target.checked)} required/>
								<label className="custom-control-label" htmlFor="privacy-check-box">Al hacer clic en crear cuenta aceptas todas las <Link to="/politica-de-privacidad">Políticas de Privacidad</Link> y los <Link to="/terminos-y-condiciones">Términos de Uso</Link> de PliP.</label>
							</div>
							<div className="row justify-content-center">
								<CustomForm.LoadingButton loading={loading} className="btn btn-primary btn-block btn-lg">Registrarse</CustomForm.LoadingButton>
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

Confirmation.propTypes = {
	location: PropTypes.object,
}

export default Confirmation
