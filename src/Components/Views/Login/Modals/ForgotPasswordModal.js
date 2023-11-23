import React, { useEffect, useState, useContext } from 'react'
import PropTypes from 'prop-types'
import { isEmail } from 'validator'
import { CustomForm, sendVerificationCode, NotyfContext, useModal } from '../../../Common'

function ForgotPasswordModal({ visible, setVisible }) {
	const notyf = useContext(NotyfContext)
	const [ email, setEmail ] = useState(null)
	const [ errors, setErrors ] = useState({})
	const [ loading, setLoading ] = useState(false)

	useEffect(() => {
		if (email === '' || (email !== null && !isEmail(email))) {
			setErrors({ ...errors, email: 'Debes ingresar un email válido' })
		}
		else {
			const { email, ...newErrors } = errors
			setErrors(newErrors)
		}
	}, [ email ])

	const resetModal = () => {
		setErrors({})
		setEmail(null)
	}

	const { Modal, hide } = useModal({ identifier: 'resetPassword', visible, setVisible, clean: resetModal })

	const onSubmit = async (e) => {
		e.preventDefault()
		setLoading(true)
		try {
			await sendVerificationCode(email)
			setLoading(false)
			notyf.open({
				type: 'success',
				message: 'Se han enviado las instrucciones de cambio de contraseña al correo ingresado',
			})
			hide(true)
		}
		catch(e) {
			setLoading(false)
			notyf.open({
				type: 'error',
				message: 'Error enviando verificación. Verifica que el correo ingresado sea correcto.',
			})
		}

	}

	return (
		<Modal size='md' >
			<div className="container">
				<form className="col-12">
					<h2 className="text-center">¿Olvidaste tu contraseña</h2>
					<p>Introduce tu dirección de correo electrónico y te enviaremos un enlace para restablecer tu contraseña.</p>
					<div className="form-group">
						<label className="col-sm-12" htmlFor="inputEmail">Email</label>
						<div className="col-sm-12">
							<input
								className="form-control"
								placeholder="Email"
								name="email"
								value={email || ''}
								onChange={e => setEmail(e.target.value)}
								required
							/>
							{errors.email && <span style={{ color: 'red' }}>{errors.email}</span>}
						</div>
					</div>
					<CustomForm.LoadingButton loading={loading} onClick={onSubmit} className="btn btn-lg btn-primary btn-block">Recuperar contraseña</CustomForm.LoadingButton>
				</form>
			</div>
		</Modal>
	)
}

ForgotPasswordModal.propTypes = {
	visible: PropTypes.bool,
	setVisible: PropTypes.func,
}

export default ForgotPasswordModal
