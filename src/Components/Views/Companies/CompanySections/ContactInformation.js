import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react'
import PropTypes from 'prop-types'
import PhoneInput, { isValidPhoneNumber, parsePhoneNumber } from 'react-phone-number-input'
import { isEmail } from 'validator'
import swal from 'sweetalert'

import emptyImage from '../../../../Assets/img/undraw_security_o890.svg'

const conditions = {
	name: {
		condition: (name) => name === '',
		message: 'Debes ingresar un nombre de contacto válido',
		errorValue: '',
	},
	position: {
		condition: (position) => position === '',
		message: 'Debes ingresar una posición válida',
		errorValue: '',
	},
	email: {
		condition: (email) => email === '' || (email && !isEmail(email)),
		message: 'Debes ingresar un email válido',
		errorValue: '',
	},
	phone: {
		condition: (phone) => phone === '',
		message: 'Debes ingresar un teléfono válido',
		errorValue: '',
	},
}

function ContactRow({ showNotification, onPropertyChange, onDelete, onErrorsChange, name, position, email, phone, phoneDetail, notification, index }) {
	const [ errors, setErrors ] = useState({})

	useEffect(() => {
		onErrorsChange(Object.keys(errors))
	}, [ errors ])

	useEffect(() => {
		const values = { name, position, email, phone }
		const newErrors = Object.keys(conditions).reduce((acc, key) => {
			const { condition, message } = conditions[key]
			if (condition(values[key])) {
				return { ...acc, [key]: message }
			}
			return acc
		}, {})
		setErrors(newErrors)
	}, [ name, position, email, phone ])

	return (
		<tr style={{ height: '70px' }}>
			<td>{Object.keys(errors).length > 0 && <i style={{ color: 'red' }} className="fas fa-exclamation"></i> }</td>
			<td scope="col">
				<input
					className="form-control"
					placeholder="Nombre"
					name="name"
					value={name || ''}
					onChange={e => onPropertyChange('name', e.target.value)}
				/>
				{errors.name && <span style={{ color: 'red' }}>{errors.name}</span>}
			</td>
			<td scope="col">
				<input
					className="form-control"
					placeholder="Cargo"
					name="position"
					value={position || ''}
					onChange={e => onPropertyChange('position', e.target.value)}
				/>
				{errors.position && <span style={{ color: 'red' }}>{errors.position}</span>}
			</td>
			<td scope="col">
				<input
					className="form-control"
					placeholder="Email"
					name="email"
					value={email || ''}
					onChange={e => onPropertyChange('email', e.target.value)}
				/>
				{errors.email && <span style={{ color: 'red' }}>{errors.email}</span>}
			</td>
			<td scope="col">
				<PhoneInput numberInputProps={{ className: 'form-control', placeholder: 'Teléfono' }} onChange={value => onPropertyChange('phone', value)} value={phone} defaultCountry='CO' country={isValidPhoneNumber(phone || '') ? parsePhoneNumber(phone || '').country : ''} countries={[ 'CO' ]} />
				{errors.phone && <span style={{ color: 'red' }}>{errors.phone}</span>}
			</td>
			<td scope="col">
				<input
					className="form-control"
					placeholder="Extensión"
					name="phoneDetail"
					value={phoneDetail || ''}
					onChange={e => onPropertyChange('phoneDetail', e.target.value)}
				/>
			</td>
			{
				showNotification && (
					<td scope="col">
						<input
							type='checkbox'
							style={{
								height: '22px',
								width: '100%',
							}}
							name="notification"
							checked={notification === 'true' ? true : false}
							onChange={e => onPropertyChange('notification', `${e.target.checked}`)}
						/>
						{errors.name && <span style={{ color: 'red' }}>{errors.name}</span>}
					</td>
				)
			}
			<td scope="col">
				{index !== 0 && <button type="button" className="btn btn-secondary" onClick={async (e) => {
					e.preventDefault()
					const value = await swal({
						text: '¿Seguro que deseas eliminar este contacto?',
						dangerMode: true,
						buttons: {
							confirm: 'Si',
							cancel: 'No',
						},
					})	
					if (value) {
						onDelete()
					}
				}}>Eliminar</button>
				}
			</td>
		</tr>
	)
}

ContactRow.propTypes = {
	onErrorsChange: PropTypes.func,
	onPropertyChange: PropTypes.func,
	onDelete: PropTypes.func,
	name: PropTypes.string,
	lastName: PropTypes.string,
	position: PropTypes.string,
	email: PropTypes.string,
	phone: PropTypes.string,
	phoneDetail: PropTypes.string,
	notification: PropTypes.string,
	index: PropTypes.number,
	showNotification: PropTypes.bool,
}

const ContactInformation = forwardRef(({ showNotification, onPropertyChange, contacts }, ref) => {
	const [ errors, setErrors ] = useState({})

	useImperativeHandle(ref, () => ({
		reset: () => {
			setErrors({})
		},
		validate: () => {
			onPropertyChange(contacts.map(contact => {
				return [ 'name', 'position', 'email', 'phone' ].reduce((acc, key) => {
					const { condition, errorValue } = conditions[key]
					const value = acc[key] === undefined ? errorValue : acc[key]
					if (condition(value)) {
						return { ...acc, [key]: value }
					}
					return acc
				}, contact)
			}))
			return errors
		},
	}))

	const onContactUpdate = (index, field) => {
		onPropertyChange([ ...contacts.slice(0, index), { ...contacts[index], ...field }, ...contacts.slice(index + 1) ])
	}

	const onContactDelete = (index) => {
		onPropertyChange(contacts.filter((_, i) => i !== index))
	}

	return (
		<React.Fragment>
			{contacts.length === 0 &&
				<div className="col-12 card emptytable">
					<div className="row justify-content-center">
						<div className="col-4">
							<img className="img-fluid" src={emptyImage} />
						</div>
						<div className="w-100 d-block"></div>
						<div className="col-10 col-sm-6 col-md-4">
							<h5 className="text-center">NO HAS AÑADIDO NINGÚN CONTACTO</h5>
							<p className="text-center">Puedes dejar esta tabla vacia. Podrás agregarlos en otro momento</p>
						</div>
					</div>
				</div>
			}
			{contacts.length > 0 && 
			<div className="row">
				<div className="col-12 custom-table">
					<div className="table-responsive">
						<table className="table">
							<thead>
								<tr>
									<th scope="col"></th>
									<th scope="col">Nombre</th>
									<th scope="col">Cargo</th>
									<th scope="col">Email</th>
									<th scope="col">Teléfono</th>
									<th scope="col"></th>
									{showNotification && <th scope="col">Notificación</th>}
								</tr>
							</thead>
							<tbody>
								{contacts.map((contact, i) =>
									<ContactRow
										{...contact}
										index={i}
										key={`contact-${i}`}
										showNotification={showNotification}
										onPropertyChange={(field, value) => onContactUpdate(i, { [field]: value })}
										onDelete={() => {
											onContactDelete(i)
											setErrors({})
										}}
										onErrorsChange={(contactErrors) => setErrors({ ...errors, [i]: contactErrors })}
									/>)}
							</tbody>
						</table>
					</div>
				</div>
			</div>
			}
		</React.Fragment>
	)
})

ContactInformation.propTypes = {
	onErrorsChange: PropTypes.func,
	onPropertyChange: PropTypes.func,
	contacts: PropTypes.array,
	showNotification: PropTypes.bool,
}

export default ContactInformation