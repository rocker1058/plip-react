import React, { useState, useEffect, useContext } from 'react'
import { useDispatch } from 'react-redux'
import { useForm } from 'react-hook-form'
import { NotyfContext, CustomForm, resetPassword } from '../Common'
import { SET_NAVBAR_PROPERTIES, SET_SIDEBAR_PROPERTIES } from '../../Redux/Actions'

function ChangePassword(){
	const dispatch = useDispatch()
	const notyf = useContext(NotyfContext)
	const [ loading, setLoading ] = useState(false)
	const { register, handleSubmit, errors } = useForm()
	useEffect(() => {
		dispatch({ type: SET_NAVBAR_PROPERTIES, visibility: true })
		dispatch({ type: SET_SIDEBAR_PROPERTIES, visibility: true })
	}, [])

	const changePassword = async ({ currentPassword, newPassword }) => {
		setLoading(true)
		try {
			await resetPassword(currentPassword, newPassword)
			notyf.open({
				type: 'success',
				message: 'Tu contraseña ha sido actualizada exitosamente',
			})
		}
		catch(e) {
			notyf.open({
				type: 'error',
				message: 'Error cambiando tu contraseña. Verifica los campos diligenciados',
			})
		}
		setLoading(false)
	}

	return (
		<div className="col-4 mt-2">
			<h1 className="text-left">Cambiar contraseña</h1>
			<form onSubmit={handleSubmit(changePassword)}>
				<div className="form-group">
					<label htmlFor="inputPassword">Contraseña actual</label>
					<input ref={register({ required: true })} name="currentPassword" className="form-control" type="password" required/>
					<label htmlFor="inputPassword">Nueva constraseña</label>
					<input ref={register({ required: true, minLength: 6 })} name="newPassword" className="form-control" type="password" required/>
					{errors.newPassword && <span style={{ color: 'red' }}>La contraseña debe tener mínimo 6 caracteres</span>}
				</div>
				<div className="row justify-content-center">
					<CustomForm.LoadingButton loading={loading} className="btn btn-primary btn-lg">Cambiar contraseña</CustomForm.LoadingButton>
				</div>
			</form>	
		</div>
	)
}

export default ChangePassword
