import React, { useState, useEffect, useContext } from 'react'
import { useQuery, useMutation } from 'react-apollo'
import PropTypes from 'prop-types'
import PhoneInput, { isValidPhoneNumber, parsePhoneNumber } from 'react-phone-number-input'

import { CustomForm, useModal, NotyfContext }from '../../../Common'
import { VERIFY_USER } from '../GraphQL'

function VerifyUserModal({ visible, setVisible, onVerifyUser }){
	const [ loadingButton, setLoadingButton ] = useState(false)
	const [ userNotFound, setUserNotFound ] = useState(false)
	const [ phone, setPhone ] = useState('')
	const [ phoneError, setPhoneError ] = useState(false)
	const notyf = useContext(NotyfContext)

	const resetModal = () => {
		setUserNotFound(false)
	}

	const { Modal, hide } = useModal({ identifier: 'verifyUserModal', visible, setVisible, clean: resetModal })
	
	const [ VerifyUser ] = useMutation(VERIFY_USER, {
		onCompleted: (data) => {
			if(data && data.User && data.User.autoVerifyUser === 'User not found'){
				setUserNotFound(true)
			}
			else{
				notyf.open({
					type: 'success',
					message: 'El usuario se ha verificado exitosamente',
				})
			}
			setLoadingButton(false)
			hide(true)
			onVerifyUser()
		},
		onError: () => {
			setLoadingButton(false)
			setUserNotFound(true)
			notyf.open({
				type: 'error',
				message: 'Error al verificar usuario. Intenta de nuevo más tarde',
			})
		},
	})

	const onSubmit = async () => {
		setUserNotFound(false)
		if(isValidPhoneNumber(phone || '')){
			setLoadingButton(true)
			VerifyUser({
				variables: {
					phoneNumber: phone,
				},
			})
		}
	}

	return (
		<Modal size={'md'}>
			<div className="container">
				<h5 className="text-left">Verificar número de teléfono de un usuario</h5>
				<div className="form-group">
					<label htmlFor="exampleInputPhone">Teléfono</label>
					<PhoneInput 
						numberInputProps={{ className: 'form-control', placeholder: 'Teléfono' }} 
						onChange={(number) => {
							setPhoneError(!isValidPhoneNumber(number || ''))
							setUserNotFound(false)
							setPhone(number || '')
						}}
						value={phone} 
						defaultCountry='CO' 
						country={isValidPhoneNumber(phone || '') ? parsePhoneNumber(phone || '').country : ''} 
						countries={[ 'CO' ]} 
						required />
					{phoneError && <p className="text-center" style={{ color: 'red' }}>Número de teléfono invalido</p>}
				</div>
				{userNotFound && <p className="text-center" style={{ color: 'red' }}>Este número de teléfono no se encuentra registrado</p>}
				<CustomForm.LoadingButton loading={loadingButton} className="btn btn-lg btn-primary btn-block button" onClick={onSubmit}>Verificar</CustomForm.LoadingButton>					
			</div>
		</Modal>
	)
}

VerifyUserModal.propTypes = {
	visible: PropTypes.bool,
	setVisible: PropTypes.func,
	onVerifyUser: PropTypes.func,
}

export default VerifyUserModal
