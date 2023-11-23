import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react'
import PropTypes from 'prop-types'
import PhoneInput, { isValidPhoneNumber, parsePhoneNumber } from 'react-phone-number-input'
import spanishLocale from 'i18n-iso-countries/langs/es.json' 
import countries from 'i18n-iso-countries'
import { TagInput, GoogleMapsSuggestion } from '../../../Common'

countries.registerLocale(spanishLocale)

const conditions = {
	name: {
		condition: (name) => name === '',
		message: 'Debes ingresar un nombre válido',
		errorValue: '',
	},
	phone: {
		condition: (phone) => phone === '',
		message: 'Debes ingresar un teléfono válido',
		errorValue: '',
	},
	address: {
		condition: address => !address || (address && Object.keys(address).length <= 1),
		message: 'Debes seleccionar una dirección',
		errorValue: null,
	},
}

const GeneralInformation = forwardRef(({ onPropertyChange, name, phone, phoneDetail, address, locationDetail, tags = [] }, ref) => {
	const [ errors, setErrors ] = useState({})
	const [ addressText, setAddressText ] = useState('')
	useImperativeHandle(ref, () => ({
		reset: () => {
			setErrors({})
		},
		validate: () => {
			const values = { name, phone, address }
			const newErrors = Object.keys(conditions).reduce((acc, key) =>{
				const { condition, message, errorValue } = conditions[key]
				if (condition(values[key] === undefined ? errorValue  : values[key])) {
					return { ...acc, [key]: message }
				}
				return acc
			}, {})
			setErrors(newErrors)
			return newErrors
		},
	}))

	useEffect(() => {
		const values = { name, phone, address }
		const newErrors = Object.keys(conditions).reduce((acc, key) =>{
			const { condition, message } = conditions[key]
			if (values[key] !== undefined && condition(values[key])) {
				return { ...acc, [key]: message }
			}
			return acc
		}, {})
		setErrors(newErrors)
	}, [ name, phone, address ])

	useEffect(() => {
		if (address && address.address) {
			setAddressText(address.address)
		}
	}, [ address ])

	return (
		<div className="row justify-content-center">
			<div className="col-md-6">
				<div className="form-group">
					<label className="col-form-label text-sm-right" htmlFor="inputName">Nombre comercial</label>
					<input
						className="form-control"
						placeholder="Nombre comercial"
						name="name"
						value={name || ''}
						onChange={e => onPropertyChange('name', e.target.value)}
					/>
					{errors.name && <span style={{ color: 'red' }}>{errors.name}</span>}
				</div>
				<div className="form-group">
					<label className="col-form-label text-sm-right" htmlFor="inputName">Teléfono</label>
					<PhoneInput numberInputProps={{ className: 'form-control', placeholder: 'Teléfono' }} onChange={value => onPropertyChange('phone', value)} value={phone} defaultCountry='CO' country={isValidPhoneNumber(phone || '') ? parsePhoneNumber(phone || '').country : ''} countries={[ 'CO' ]} />
					{errors.phone && <span style={{ color: 'red' }}>{errors.phone}</span>}
				</div>
				<div className="form-group">
					<label className="col-form-label text-sm-right" htmlFor="inputName">Detalle de teléfono</label>
					<input
						className="form-control"
						placeholder="Extensión"
						name="phoneDetail"
						value={phoneDetail || ''}
						onChange={e => onPropertyChange('phoneDetail', e.target.value)}
					/>
				</div>
				<div className="form-group">
					<label htmlFor="inputAddress">Dirección</label>
					<GoogleMapsSuggestion value={addressText} onAddressChange={text => {
						setAddressText(text)
						onPropertyChange('address', null)
					}} onAddressSelected={value => {
						setAddressText(value.address)
						onPropertyChange('address', value)}
					} />
					{errors.address && <span style={{ color: 'red' }}>{errors.address}</span>}
				</div>
				<div className="form-group">
					<label className="col-form-label text-sm-right" htmlFor="inputNit">Local</label>
					<input
						className="form-control"
						placeholder="Local (si aplica)"
						name="locationDetail"
						onChange={(e) => onPropertyChange('locationDetail', e.target.value )}
						value={locationDetail || ''}
					/>
				</div>
				<div className="form-group">
					<label className="col-form-label text-sm-right" htmlFor="inputNit">País</label>
					<input
						disabled={true}
						className="form-control"
						placeholder="País"
						name="country"
						value={(address && address.country && countries.getName(address.country, 'es')) || ''}
					/>
				</div>
				<div className="form-group row">
					<div className="col-md-6">
						<label className="col-form-label text-sm-right" htmlFor="inputNit">Región</label>
						<input
							disabled={!address || Object.keys(address).length <= 1}
							className="form-control"
							placeholder="Región"
							name="region"
							value={(address && address.region) || ''}
							onChange={e => onPropertyChange('address', { ...address, region: e.target.value })}
						/>
					</div>
					<div className="col-md-6">
						<label className="col-form-label text-sm-right" htmlFor="inputNit">Ciudad</label>
						<input
							disabled={!address || Object.keys(address).length <= 1}
							className="form-control"
							placeholder="Ciudad"
							name="city"
							value={(address && address.city) || ''}
							onChange={e => onPropertyChange('address', { ...address, city: e.target.value })}
						/>
					</div>
				</div>
				<div className="form-group">
					<label htmlFor="inputNit">Agrega un tag...</label>
					<TagInput tags={tags} onTagsChange={(value) => onPropertyChange('tags', value )}/>
					<small><b>Nota:</b> Los cambios en los tags no afectarán las facturas ya generadas. Unicamente aplicarán en futuras facturas.</small>
				</div>
			</div>
		</div>
	)
})

GeneralInformation.propTypes = {
	onErrorsChange: PropTypes.func,
	onPropertyChange: PropTypes.func,
	name: PropTypes.string,
	phone: PropTypes.string,
	phoneDetail: PropTypes.string,
	address: PropTypes.object,
	locationDetail: PropTypes.string,
	tags: PropTypes.array,
	company: PropTypes.string,
	disabledBusinessLine: PropTypes.bool,
}

export default GeneralInformation