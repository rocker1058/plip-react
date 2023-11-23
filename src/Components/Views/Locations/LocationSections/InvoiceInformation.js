import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react'
import PropTypes from 'prop-types'
import moment from 'moment'
import { useSelector } from 'react-redux'

const conditions = {
	baseMeasurement: {
		condition: (baseMeasurement) => baseMeasurement !== null && (baseMeasurement === '' || parseFloat(baseMeasurement) <= 0),
		message: 'Debes ingresar un valor mayor a 0',
		errorValue: 0,
	},
	lineMeasurement: {
		condition: (lineMeasurement) => lineMeasurement !== null && (lineMeasurement === '' || parseFloat(lineMeasurement) <= 0),
		message: 'Debes ingresar un valor mayor a 0',
		errorValue: 0,
	},
	paperType: {
		condition: (paperType) => paperType === null,
		message: 'Debes seleccionar un tipo de papel',
		errorValue: null,
	},
	invoicingCompany: {
		condition: (invoicingCompany) => invoicingCompany === null,
		message: 'Debes seleccionar un POS',
		errorValue: null,
	},
	bigHeadMeasurement: {
		condition: (bigHeadMeasurement) => bigHeadMeasurement !== null && (bigHeadMeasurement === '' || parseFloat(bigHeadMeasurement) <= 0),
		message: 'Debes ingresar un valor mayor a 0',
		errorValue: 0,
	},
	dataInvoiceMeasurement: {
		condition: (dataInvoiceMeasurement) => dataInvoiceMeasurement !== null && (dataInvoiceMeasurement === '' || parseFloat(dataInvoiceMeasurement) <= 0),
		message: 'Debes ingresar un valor mayor a 0',
		errorValue: 0,
	},
	productMeasurement: {
		condition: (productMeasurement) => productMeasurement !== null && (productMeasurement === '' || parseFloat(productMeasurement) <= 0),
		message: 'Debes ingresar un valor mayor a 0',
		errorValue: 0,
	},
	wayPayMeasurement: {
		condition: (productMeasurement) => productMeasurement !== null && (productMeasurement === '' || parseFloat(productMeasurement) <= 0),
		message: 'Debes ingresar un valor mayor a 0',
		errorValue: 0,
	},
	additionalInformationMeasurement: {
		condition: (additionalInformationMeasurement) => additionalInformationMeasurement !== null && (additionalInformationMeasurement === '' || parseFloat(additionalInformationMeasurement) <= 0),
		message: 'Debes ingresar un valor mayor a 0',
		errorValue: 0,
	},
	codeQrMeasurement: {
		condition: (codeQrMeasurement) => codeQrMeasurement !== null && (codeQrMeasurement === '' || parseFloat(codeQrMeasurement) <= 0),
		message: 'Debes ingresar un valor mayor a 0',
		errorValue: 0,
	},
	codeBarsMeasurement: {
		condition: (codeBarsMeasurement) => codeBarsMeasurement !== null && (codeBarsMeasurement === '' || parseFloat(codeBarsMeasurement) <= 0),
		message: 'Debes ingresar un valor mayor a 0',
		errorValue: 0,
	},
	footerMeasurement: {
		condition: (footerMeasurement) => footerMeasurement !== null && (footerMeasurement === '' || parseFloat(footerMeasurement) <= 0),
		message: 'Debes ingresar un valor mayor a 0',
		errorValue: 0,
	},
}

const InvoiceInformation = forwardRef(({ onPropertyChange, lineDependant, customInvoiceData = {}, lineInvoiceData = {} }, ref) => {
	const [ errors, setErrors ] = useState({})
	const [ year, setYear ] = useState(moment().get('year'))

	const [ posOptions, setPosOptions ] = useState([])

	const { isPlip } = useSelector(state => ({ isPlip: state.authentication.user.accesses[0].type.toLowerCase() === 'plip' ? true : false || false }))

	const fetchPosData = async () => {
		const response = await fetch('https://plip-assets-1o6khezd40w70.s3.amazonaws.com/POS.json')
		const data = await response.json()
		setPosOptions(data)
	}

	useEffect(() => {
		fetchPosData()
	}, [])

	useImperativeHandle(ref, () => ({
		reset: () => {
			setErrors({})
		},
		validate: () => {
			const invoiceErrors = [ moment().get('year'), moment().add(1, 'year').get('year') ].reduce((keyAcc, key) => {
				const { 
					baseMeasurement, 
					lineMeasurement, 
					paperType, 
					invoicingCompany, 
					bigHeadMeasurement,
					dataInvoiceMeasurement,
					productMeasurement,
					wayPayMeasurement,
					additionalInformationMeasurement,
					codeQrMeasurement,
					codeBarsMeasurement,
					footerMeasurement,
				} = customInvoiceData[key] || {}
				const data = { baseMeasurement, 
					lineMeasurement, 
					paperType, 
					invoicingCompany,
					bigHeadMeasurement,
					dataInvoiceMeasurement,
					productMeasurement,
					wayPayMeasurement,
					additionalInformationMeasurement,
					codeQrMeasurement,
					codeBarsMeasurement,
					footerMeasurement,
				}
				const yearErrors = Object.keys(data).reduce((acc, dataKey) => { 
					const { condition, message, errorValue } = conditions[dataKey]
					if (condition(data[dataKey] === errorValue ? undefined  : data[dataKey])) {
						return { ...acc, [dataKey]: message }
					}
					return acc
				} , {})

				if (Object.keys(yearErrors).length > 0) {
					return { ...keyAcc, [key]: yearErrors }
				}
				return keyAcc
			}, {})
			setErrors(invoiceErrors)
			return invoiceErrors
		},
	}))

	useEffect(() => {
		if (!lineDependant) {
			const invoiceErrors = [ moment().get('year'), moment().add(1, 'year').get('year') ].reduce((keyAcc, key) => {
				const { 
					baseMeasurement, 
					lineMeasurement, 
					paperType, 
					invoicingCompany, 
					bigHeadMeasurement,
					dataInvoiceMeasurement,
					productMeasurement,
					wayPayMeasurement,
					additionalInformationMeasurement,
					codeQrMeasurement,
					codeBarsMeasurement,
					footerMeasurement,
				} = customInvoiceData[key] || {}
				const data = { 
					baseMeasurement, 
					lineMeasurement, 
					paperType, 
					invoicingCompany, 
					bigHeadMeasurement,
					dataInvoiceMeasurement,
					productMeasurement,
					wayPayMeasurement,
					additionalInformationMeasurement,
					codeQrMeasurement,
					codeBarsMeasurement,
					footerMeasurement,
				}
				const yearErrors = Object.keys(data).reduce((acc, dataKey) => { 
					const { condition, message } = conditions[dataKey]
					if (condition(data[dataKey] === undefined ? undefined  : data[dataKey])) {
						return { ...acc, [dataKey]: message }
					}
					return acc
				} , {})

				if (Object.keys(yearErrors).length > 0) {
					return { ...keyAcc, [key]: yearErrors }
				}
				return keyAcc
			}, {})
			setErrors(invoiceErrors)
		}
	}, [ lineDependant, (customInvoiceData[year] || {}).baseMeasurement, (customInvoiceData[year] || {}).lineMeasurement, (customInvoiceData[year] || {}).paperType, (customInvoiceData[year] || {}).invoicingCompany ])

	const selectedInvoiceData = lineDependant ? lineInvoiceData : customInvoiceData
	const { 
		baseMeasurement, 
		lineMeasurement, 
		paperType, 
		invoicingCompany,
		bigHeadMeasurement,
		dataInvoiceMeasurement,
		productMeasurement,
		wayPayMeasurement,
		additionalInformationMeasurement,
		codeQrMeasurement,
		codeBarsMeasurement,
		footerMeasurement,
	} = selectedInvoiceData[year] || {}

	return (
		<React.Fragment>
			<div className="row justify-content-center">
				<div className="col-md-6">
					<div className="form-group row justify-content-start">
						<input
							className="mr-3"
							type="checkbox"
							name="lineDependant"
							checked={lineDependant}
							onChange={e => onPropertyChange('lineDependant', e.target.checked)}
						/>
						<label className="col-form-label" htmlFor="inputName">Utilizar medidas de la línea de negocio</label>
					</div>
					<div className="form-group row">
						<label className="col-form-label text-sm-right" htmlFor="inputName">Año</label>
						<select
							className="form-control"
							placeholder="Año"
							name="year"
							value={year}
							onChange={e => setYear(e.target.value)}
						>
							<option value={moment().get('year')}>{moment().get('year')}</option>
							<option value={moment().add(1, 'year').get('year')}>{moment().add(1, 'year').get('year')}</option>
						</select>
					</div>
					
					<div className="form-group row">
						<label className="col-form-label text-sm-right" htmlFor="inputName">Médida base (cm)</label>
						<input
							className="form-control"
							placeholder="Médida base"
							name="baseMeasurement"
							value={baseMeasurement || ''}
							disabled={lineDependant || !isPlip}
							onChange={e => onPropertyChange('customInvoiceData', {
								...customInvoiceData,
								[year]: {
									...customInvoiceData[year],
									baseMeasurement: parseFloat(e.target.value) || '',
								},
							})}
							type="number"
							step={0.1}
						/>
						{errors[year] && errors[year].baseMeasurement && <span style={{ color: 'red' }}>{errors[year].baseMeasurement}</span>}
					</div>
					<div className="form-group row">
						<label className="col-form-label text-sm-right" htmlFor="inputName">Médida de renglón (cm)</label>
						<input
							className="form-control"
							placeholder="Médida de renglón"
							name="lineMeasurement"
							value={lineMeasurement || ''}
							disabled={lineDependant || !isPlip}
							onChange={e => onPropertyChange('customInvoiceData', {
								...customInvoiceData,
								[year]: {
									...customInvoiceData[year],
									lineMeasurement: parseFloat(e.target.value) || '',
								},
							})}
							type="number"
							step={0.1}
						/>
						{errors[year] && errors[year].lineMeasurement && <span style={{ color: 'red' }}>{errors[year].lineMeasurement}</span>}
					</div>

					<div className="form-group row">
						<label className="col-form-label text-sm-right" htmlFor="inputName">Longitud línea cabezote (cm)</label>
						<input
							className="form-control"
							placeholder="Longitud línea cabezote"
							name="bigHeadMeasurement"
							value={bigHeadMeasurement || ''}
							disabled={lineDependant || !isPlip}
							onChange={e => onPropertyChange('customInvoiceData', {
								...customInvoiceData,
								[year]: {
									...customInvoiceData[year],
									bigHeadMeasurement: parseFloat(e.target.value) || '',
								},
							})}
							type="number"
							step={0.1}
						/>
						{errors[year] && errors[year].bigHeadMeasurement && <span style={{ color: 'red' }}>{errors[year].bigHeadMeasurement}</span>}
					</div>
					<div className="form-group row">
						<label className="col-form-label text-sm-right" htmlFor="inputName">Longitud línea datos de factura (cm)</label>
						<input
							className="form-control"
							placeholder="Longitud línea datos de factura"
							name="dataInvoiceMeasurement"
							value={dataInvoiceMeasurement || ''}
							disabled={lineDependant || !isPlip}
							onChange={e => onPropertyChange('customInvoiceData', {
								...customInvoiceData,
								[year]: {
									...customInvoiceData[year],
									dataInvoiceMeasurement: parseFloat(e.target.value) || '',
								},
							})}
							type="number"
							step={0.1}
						/>
						{errors[year] && errors[year].dataInvoiceMeasurement && <span style={{ color: 'red' }}>{errors[year].dataInvoiceMeasurement}</span>}
					</div>
					<div className="form-group row">
						<label className="col-form-label text-sm-right" htmlFor="inputName">Longitud línea producto (cm)</label>
						<input
							className="form-control"
							placeholder="Longitud línea producto"
							name="productMeasurement"
							value={productMeasurement || ''}
							disabled={lineDependant || !isPlip}
							onChange={e => onPropertyChange('customInvoiceData', {
								...customInvoiceData,
								[year]: {
									...customInvoiceData[year],
									productMeasurement: parseFloat(e.target.value) || '',
								},
							})}
							type="number"
							step={0.1}
						/>
						{errors[year] && errors[year].productMeasurement && <span style={{ color: 'red' }}>{errors[year].productMeasurement}</span>}
					</div>
					<div className="form-group row">
						<label className="col-form-label text-sm-right" htmlFor="inputName">Longitud línea forma de pago (cm)</label>
						<input
							className="form-control"
							placeholder="Longitud línea forma de pago"
							name="wayPayMeasurement"
							value={wayPayMeasurement || ''}
							disabled={lineDependant || !isPlip}
							onChange={e => onPropertyChange('customInvoiceData', {
								...customInvoiceData,
								[year]: {
									...customInvoiceData[year],
									wayPayMeasurement: parseFloat(e.target.value) || '',
								},
							})}
							type="number"
							step={0.1}
						/>
						{errors[year] && errors[year].wayPayMeasurement && <span style={{ color: 'red' }}>{errors[year].wayPayMeasurement}</span>}
					</div>
					<div className="form-group row">
						<label className="col-form-label text-sm-right" htmlFor="inputName">Longitud línea información adicional (cm)</label>
						<input
							className="form-control"
							placeholder="Longitud línea información adicional"
							name="additionalInformationMeasurement"
							value={additionalInformationMeasurement || ''}
							disabled={lineDependant || !isPlip}
							onChange={e => onPropertyChange('customInvoiceData', {
								...customInvoiceData,
								[year]: {
									...customInvoiceData[year],
									additionalInformationMeasurement: parseFloat(e.target.value) || '',
								},
							})}
							type="number"
							step={0.1}
						/>
						{errors[year] && errors[year].additionalInformationMeasurement && <span style={{ color: 'red' }}>{errors[year].additionalInformationMeasurement}</span>}
					</div>
					<div className="form-group row">
						<label className="col-form-label text-sm-right" htmlFor="inputName">Longitud código QR (cm)</label>
						<input
							className="form-control"
							placeholder="Longitud código QR"
							name="codeQrMeasurement"
							value={codeQrMeasurement || ''}
							disabled={lineDependant || !isPlip}
							onChange={e => onPropertyChange('customInvoiceData', {
								...customInvoiceData,
								[year]: {
									...customInvoiceData[year],
									codeQrMeasurement: parseFloat(e.target.value) || '',
								},
							})}
							type="number"
							step={0.1}
						/>
						{errors[year] && errors[year].codeQrMeasurement && <span style={{ color: 'red' }}>{errors[year].codeQrMeasurement}</span>}
					</div>
					<div className="form-group row">
						<label className="col-form-label text-sm-right" htmlFor="inputName">Longitud Código de barras (cm)</label>
						<input
							className="form-control"
							placeholder="Longitud Código de barras"
							name="codeBarsMeasurement"
							value={codeBarsMeasurement || ''}
							disabled={lineDependant || !isPlip}
							onChange={e => onPropertyChange('customInvoiceData', {
								...customInvoiceData,
								[year]: {
									...customInvoiceData[year],
									codeBarsMeasurement: parseFloat(e.target.value) || '',
								},
							})}
							type="number"
							step={0.1}
						/>
						{errors[year] && errors[year].codeBarsMeasurement && <span style={{ color: 'red' }}>{errors[year].codeBarsMeasurement}</span>}
					</div>
					<div className="form-group row">
						<label className="col-form-label text-sm-right" htmlFor="inputName">Longitud línea pie de página (cm)</label>
						<input
							className="form-control"
							placeholder="Longitud línea pie de página"
							name="footerMeasurement"
							value={footerMeasurement || ''}
							disabled={lineDependant || !isPlip}
							onChange={e => onPropertyChange('customInvoiceData', {
								...customInvoiceData,
								[year]: {
									...customInvoiceData[year],
									footerMeasurement: parseFloat(e.target.value) || '',
								},
							})}
							type="number"
							step={0.1}
						/>
						{errors[year] && errors[year].footerMeasurement && <span style={{ color: 'red' }}>{errors[year].footerMeasurement}</span>}
					</div>

					<div className="form-group row">
						<label className="col-form-label text-sm-right" htmlFor="inputName">Tipo de papel</label>
						<select
							className="form-control"
							placeholder="Tipo de papel"
							name="paperType"
							value={paperType || ''}
							disabled={lineDependant || !isPlip}
							onChange={e => onPropertyChange('customInvoiceData',{
								...customInvoiceData,
								[year]: {
									...customInvoiceData[year],
									paperType: e.target.value,
								},
							})}
						>
							<option value={''}>Selecciona el tipo de papel</option>
							<option value="thermal">Térmico</option>
							<option value="chemical">Químico</option>
							<option value="bond">Bond</option>
						</select>
						{errors[year] && errors[year].paperType && <span style={{ color: 'red' }}>{errors[year].paperType}</span>}
					</div>
					<div className="form-group row">
						<label className="col-form-label text-sm-right" htmlFor="inputName">POS</label>
						<select
							className="form-control"
							placeholder="POS"
							name="invoicingCompany"
							value={invoicingCompany || ''}
							disabled={lineDependant || !isPlip}
							onChange={e => onPropertyChange('customInvoiceData',{
								...customInvoiceData,
								[year]: {
									...customInvoiceData[year],
									invoicingCompany: e.target.value,
								},
							})}
						>
							<option value={''}>Selecciona el servicios POS</option>
							{posOptions.map(({ name, key }) => <option key={key} value={key}>{name}</option>)}
						</select>
						{errors[year] && errors[year].invoicingCompany && <span style={{ color: 'red' }}>{errors[year].invoicingCompany}</span>}
					</div>
				</div>
			</div>
		</React.Fragment>
	)
})

InvoiceInformation.propTypes = {
	onErrorsChange: PropTypes.func,
	onPropertyChange: PropTypes.func,
	lineDependant: PropTypes.bool,
	lineInvoiceData: PropTypes.object,
	customInvoiceData: PropTypes.object,
}

export default InvoiceInformation