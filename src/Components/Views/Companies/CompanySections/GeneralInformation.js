import React, { useState, useEffect, forwardRef, useImperativeHandle, useRef } from 'react'
import PropTypes from 'prop-types'
import PhoneInput, { isValidPhoneNumber, parsePhoneNumber } from 'react-phone-number-input'
import spanishLocale from 'i18n-iso-countries/langs/es.json' 
import countries from 'i18n-iso-countries'
import { CropImage, GoogleMapsSuggestion } from '../../../Common'

countries.registerLocale(spanishLocale)

const conditions = {
	image: {
		condition: (image) => {
			return image instanceof Blob && image instanceof String || Object.keys(image || {}).length === 0 || image === null
		},
		message: 'Debes ingresar un logo del establecimiento',
		errorValue: {},
	},
	legalName: {
		condition: (legalName) => legalName === '',
		message: 'Debes ingresar un nombre válido',
		errorValue: '',
	},
	name: {
		condition: (name) => name === '',
		message: 'Debes ingresar un nombre válido',
		errorValue: '',
	},
	nit: {
		condition: (nit) => nit === '',
		message: 'Debes ingresar un nit válido',
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

const GeneralInformation = forwardRef(({ onPropertyChange, image, legalName, name, nit, phone, phoneDetail, address, addressDetail }, ref) => {
	const [ errors, setErrors ] = useState({})
	const [ addressText, setAddressText ] = useState('')
	const imageRef = useRef()
	useImperativeHandle(ref, () => ({
		reset: () => {
			setErrors({})
			imageRef.current.reset()
		},
		validate: () => {
			const values = { image, legalName, name, nit, phone, address }
			const newErrors = Object.keys(conditions).reduce((acc, key) =>{
				const { condition, message, errorValue } = conditions[key]
				if (condition(values[key] === undefined ? errorValue : values[key])) {
					return { ...acc, [key]: message }
				}
				return acc
			}, {})
			setErrors(newErrors)
			return newErrors
		},
	}))

	useEffect(() => {
		if (address && address.address) {
			setAddressText(address.address)
		}
	}, [ address ])

	useEffect(() => {
		const values = { image, legalName, name, nit, phone, address }
		const newErrors = Object.keys(conditions).reduce((acc, key) =>{
			const { condition, message } = conditions[key]
			if (values[key] !== undefined && condition(values[key])) {
				return { ...acc, [key]: message }
			}
			return acc
		}, {})
		setErrors(newErrors)
	}, [ image, legalName, name, nit, phone, address ])

	return (
		<div className="row">
			<div className="col-md-12">
				<div className="form-group row justify-content-center">
					<div className="col-md-4">
						<label className="mb-3">Logo (Sugerimos 1000 px o más en cada lado de la imágen)</label>
						<CropImage
							ref={imageRef}
							width={500} height={500} aspect={1}
							onResult={value => onPropertyChange('image', value)}
							value={image}
							message="Da click aquí para agregar el logo del establecimiento"
						/>
						{errors.image && <span style={{ color: 'red' }}>{errors.image}</span>}
					</div>
				</div>
			</div>
			<div className="col-md-6">
				<div className="form-group">
					<label className="col-form-label text-sm-right" htmlFor="inputName">Razón o denominación social</label>
					<input
						className="form-control"
						placeholder="Razón o denominación social"
						name="legalName"
						value={legalName || ''}
						onChange={e => onPropertyChange('legalName', e.target.value)}
					/>
					{errors.legalName && <span style={{ color: 'red' }}>{errors.legalName}</span>}
				</div>
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
					<label className="col-form-label text-sm-right" htmlFor="inputNit">NIT</label>
					<input
						className="form-control"
						placeholder="NIT"
						name="nit"
						value={nit || ''}
						onChange={e => onPropertyChange('nit', e.target.value)}
					/>
					{errors.nit && <span style={{ color: 'red' }}>{errors.nit}</span>}
				</div>
				<div className="form-group">
					<label className="col-form-label text-sm-right" htmlFor="inputName">Teléfono</label>
					<PhoneInput numberInputProps={{ className: 'form-control', placeholder: 'Teléfono' }} onChange={value => onPropertyChange('phone', value)} value={phone} defaultCountry='CO' country={isValidPhoneNumber(phone || '') ? parsePhoneNumber(phone || '').country : ''} countries={[ 'CO' ]} />
					{errors.phone && <span style={{ color: 'red' }}>{errors.phone}</span>}
				</div>
				<div className="form-group">
					<label className="col-form-label text-sm-right" htmlFor="inputName">Detalle del teléfono</label>
					<input
						className="form-control"
						placeholder="Extensión"
						name="phoneDetail"
						value={phoneDetail || ''}
						onChange={e => onPropertyChange('phoneDetail', e.target.value)}
					/>
				</div>
			</div>
			<div className="col-md-6">
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
					<label className="col-form-label text-sm-right" htmlFor="inputName">Detalle de la dirección</label>
					<input
						className="form-control"
						placeholder="Edificio, Local, Centro comercial"
						name="addressDetail"
						value={addressDetail || ''}
						onChange={e => onPropertyChange('addressDetail', e.target.value)}
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
			</div>
		</div>
	)
})

GeneralInformation.propTypes = {
	className: PropTypes.string,
	onErrorsChange: PropTypes.func,
	onPropertyChange: PropTypes.func,
	image: PropTypes.object, 
	legalName: PropTypes.string,
	name: PropTypes.string,
	nit: PropTypes.string,
	phone: PropTypes.string,
	address: PropTypes.object,
	addressDetail: PropTypes.string,
	phoneDetail: PropTypes.string,
}

export default GeneralInformation