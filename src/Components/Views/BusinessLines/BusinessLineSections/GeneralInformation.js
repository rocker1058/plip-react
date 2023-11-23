import React, { useState, useEffect, forwardRef, useImperativeHandle, useRef } from 'react'
import PropTypes from 'prop-types'
import { CropImage } from '../../../Common'

const conditions = {
	image: {
		condition: (image) => {
			return image instanceof Blob && image instanceof String || Object.keys(image || {}).length === 0 || image === null
		},
		message: 'Debes ingresar un logo del establecimiento',
		errorValue: {},
	},
	name: {
		condition: (name) => name === '',
		message: 'Debes ingresar un nombre válido',
		errorValue: '',
	},
}

const GeneralInformation = forwardRef(({ onPropertyChange, name, image }, ref) => {
	const [ errors, setErrors ] = useState({})
	const imageRef = useRef()
	useImperativeHandle(ref, () => ({
		reset: () => {
			setErrors({})
			imageRef.current.reset()
		},
		validate: () => {
			const values = { image,name }
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
		const values = { image, name }
		const newErrors = Object.keys(conditions).reduce((acc, key) =>{
			const { condition, message } = conditions[key]
			if (values[key] !== undefined && condition(values[key])) {
				return { ...acc, [key]: message }
			}
			return acc
		}, {})
		setErrors(newErrors)
	}, [ image, name ])

	return (
		<div className="row justify-content-center">
			<div className="col-md-12">
				<div className="form-group row justify-content-center">
					<div className="col-md-4">
						<label>Logo (Sugerimos 1000 px o más en cada lado de la imágen)</label>
						<CropImage
							ref={imageRef}
							width={500} height={500} aspect={1}
							onResult={value => onPropertyChange('image', value)}
							value={image}
							message="Da click aquí para agregar el logo de la línea de negocio"
						/>
						{errors.image && <span style={{ color: 'red' }}>{errors.image}</span>}
					</div>
				</div>
			</div>
			<div className="col-md-6">
				<div className="form-group row">
					<label className="col-form-label text-sm-right" htmlFor="inputName">Nombre</label>
					<input
						className="form-control"
						placeholder="Nombre"
						name="name"
						value={name || ''}
						onChange={e => onPropertyChange('name', e.target.value)}
					/>
					{errors.name && <span style={{ color: 'red' }}>{errors.name}</span>}
				</div>
				
			</div>
		</div>
	)
})

GeneralInformation.propTypes = {
	onErrorsChange: PropTypes.func,
	onPropertyChange: PropTypes.func,
	name: PropTypes.string,
	image: PropTypes.any,
}

export default GeneralInformation