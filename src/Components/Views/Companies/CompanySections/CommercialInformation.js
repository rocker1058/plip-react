import React, { useState, useEffect, forwardRef, useImperativeHandle } from 'react'
import PropTypes from 'prop-types'
import numeral from 'numeral'
import moment from 'moment'
import { useSelector } from 'react-redux'

const conditions = {
	monthlyConsumption: {
		condition: (monthlyConsumption) => monthlyConsumption !== null && (monthlyConsumption === 0 || monthlyConsumption === ''),
		message: 'Debes ingresar el consumo mensual de papel',
		errorValue: 0,
	},
	baseMeterPrice: {
		condition: (baseMeterPrice) => baseMeterPrice !== null && (baseMeterPrice === 0 || baseMeterPrice === ''),
		message: 'Debes ingresar un valor inicial por metro',
		errorValue: 0,
	},
}

function ConsumptionTable({ isPlip, monthlyConsumption, baseMeterPrice, discounts=[], onPercentageChange }) {
	const [ items, setItems ] = useState([])
	const [ show, setShow ] = useState(20)
	useEffect(() => {
		const { items } = Array(100).fill(0).reduce((acc, _,i) => {
			const round = (value, precision) => {
				var multiplier = Math.pow(10, precision || 0)
				return Math.round(value * multiplier) / multiplier
			}
			const monthlyUsage = (monthlyConsumption * (i+1) / 100)
			const meterPrice = acc.previousMeterValue * (1 - ((discounts[i] || 0) / 100))
			const savings = (baseMeterPrice - meterPrice) * monthlyUsage
			return {
				items: [
					...acc.items, 
					{
						start: `${(i === 0 ? 0 : (i + 0.01).toFixed(2))}%`,
						end: `${(i+1).toFixed(2)}%`,
						monthlyUsage: numeral(monthlyUsage).format('0,0[.]00'),
						discount: discounts[i] || 0,
						meterPrice: round(meterPrice, 1),
						serviceFee: numeral(meterPrice * monthlyUsage).format('$0,0[.]'),
						savings: numeral(savings).format('$0,0[.]'),
						savingsPercentage: numeral(savings/(monthlyConsumption * baseMeterPrice)).format('0,0[.]00%'),
					},
				],
				previousMeterValue: meterPrice,
			}
		}, { items: [], previousMeterValue: baseMeterPrice })
		setItems(items)
	}, [ monthlyConsumption, baseMeterPrice, discounts ])
	return (
		<React.Fragment>
			<div className="row">
				<div className="col-12 custom-table">
					<div className="table-responsive">
						<table className="table">
							<thead>
								<tr>
									<th scope="col">Rango</th>
									<th scope="col">Consumo de papel (metros)</th>
									<th scope="col">Descuento</th>
									<th scope="col">Valor del metro</th>
									<th scope="col">Costo mensual servicio PliP</th>
									<th scope="col">Ahorro mensual</th>
									<th scope="col">% de ahorro</th>
								</tr>
							</thead>
							<tbody>
								{items.filter((_, i) => i < show).map((item, i) => <TableItem key={`item-${i}`} item={item} isPlip={isPlip} onPercentageChange={(value) => onPercentageChange(i, value )} />)}
							</tbody>
						</table>
					</div>
				</div>
			</div>
			{ show < 100 &&
			<div className="row justify-content-center more">
				<div className="col-12 text-center">
					<button type="button" onClick={(e) => {
						e.preventDefault()
						setShow(show + 20)
					}}
					className="btn btn-lightblue">Mostrar 20 más</button>
				</div>
			</div>
			}
		</React.Fragment>
	)
}

ConsumptionTable.propTypes = {
	monthlyConsumption: PropTypes.number,
	baseMeterPrice: PropTypes.number,
	discounts: PropTypes.array,
	onPercentageChange: PropTypes.func,
	isPlip: PropTypes.bool,
}

function TableItem({ isPlip, item, onPercentageChange }){
	return (
		<tr>
			<td scope="col">{item.start} - {item.end}</td>
			<td scope="col">{item.monthlyUsage}</td>
			<td scope="col">
				<input
					className="form-control"
					placeholder="descuento"
					name="discount"
					value={item.discount}
					onChange={e => onPercentageChange(parseFloat(e.target.value))}
					type="number"
					step={0.1}
					required
					disabled={!isPlip}
				/>
			</td>
			<td scope="col">{item.meterPrice}</td>
			<td scope="col">{item.serviceFee}</td>
			<td scope="col">{item.savings}</td>
			<td scope="col">{item.savingsPercentage}</td>
		</tr>
	)
}

TableItem.propTypes = {
	item: PropTypes.object,
	onPercentageChange: PropTypes.func,
	isPlip: PropTypes.bool,
}

const CommercialInformation = forwardRef(({ onPropertyChange, invoiceData = {} }, ref) => {
	const [ errors, setErrors ] = useState({})
	const [ year, setYear ] = useState(moment().get('year'))
	const [ isEditing, setEditing ] = useState(false)
	const [ isEditingBaseValue, setEditingBaseValue ] = useState(false)
	
	const { isPlip } = useSelector(state => ({ isPlip: state.authentication.user.accesses[0].type.toLowerCase() === 'plip' ? true : false || false }))

	useImperativeHandle(ref, () => ({
		reset: () => {
			setErrors({})
		},
		validate: () => {
			const errors = [ moment().get('year'), moment().add(1, 'year').get('year') ].reduce((keyAcc, key) => {
				const { monthlyConsumption, baseMeterPrice } = invoiceData[key] || {}
				const data = { monthlyConsumption, baseMeterPrice }
				const errors = Object.keys(data).reduce((acc, dataKey) => { 
					const { condition, message, errorValue } = conditions[dataKey]
					if (condition(data[dataKey] === undefined ? errorValue  : data[dataKey])) {
						return { ...acc, [dataKey]: message }
					}
					return acc
				} , {})
				return { ...keyAcc, [key]: errors }
			}, {})
			setErrors(errors)
			return errors
		},
	}))

	useEffect(() => {
		const errors = [ moment().get('year'), moment().add(1, 'year').get('year') ].reduce((keyAcc, key) => {
			const { monthlyConsumption, baseMeterPrice } = invoiceData[key] || {}
			const data = { monthlyConsumption, baseMeterPrice }
			const errors = Object.keys(data).reduce((acc, dataKey) => { 
				const { condition, message } = conditions[dataKey]
				if (condition(data[dataKey] === undefined ? undefined  : data[dataKey])) {
					return { ...acc, [dataKey]: message }
				}
				return acc
			} , {})
			return { ...keyAcc, [key]: errors }
		}, {})
		setErrors(errors)
	}, [ invoiceData ])

	const updateItemPercentage = (index, value) => {
		if (!discounts || discounts.length === 0) {
			onPropertyChange(year, 'discounts', Array(100).fill(0).map((val, i) => i >= index ? value : val ))
		}
		else {
			onPropertyChange(year, 'discounts', discounts.map((val, i) => i >= index ? value : val ) )
		}
	}

	const { monthlyConsumption, baseMeterPrice, discounts } = invoiceData[year] || {}

	return (
		<React.Fragment>
			<div className="row">
				<div className="col-md-4">
					<div className="form-group row">
						<label className="col-form-label text-sm-right" htmlFor="inputName">Año</label>
						<select
							className="form-control"
							placeholder="Año"
							name="year"
							value={year}
							onChange={e => setYear(e.target.value)}
							required
							disabled={!isPlip}
						>
							<option value={moment().get('year')}>{moment().get('year')}</option>
							<option value={moment().add(1, 'year').get('year')}>{moment().add(1, 'year').get('year')}</option>
						</select>
					</div>
				</div>
				<div className="col-md-4">
					<div className="form-group">
						<label className="col-form-label text-sm-right" htmlFor="inputName">Consumo mensual de papel (metros)</label>
						<input
							className={`form-control ${isEditing ? 'd-none' : ''}`}
							value={numeral(monthlyConsumption || 0).format('0,0[.]00')}
							onFocus={() => setEditing(!isEditing)}
							disabled={!isPlip}
						/>
						<input
							className={`form-control ${!isEditing ? 'd-none' : ''}`}
							placeholder="Consumo mensual en metros"
							name="monthlyConsumption"
							value={monthlyConsumption || ''}
							onBlur={() => setEditing(!isEditing)}
							onChange={e => onPropertyChange(year, 'monthlyConsumption', parseFloat(e.target.value) || '')}
							type="number"
							step={0.1}
							disabled={!isPlip}
						/>
						{errors[year] && errors[year].monthlyConsumption && <span style={{ color: 'red' }}>{errors[year].monthlyConsumption}</span>}
					</div>
				</div>
				<div className="col-md-4">
					<div className="form-group">
						<label className="col-form-label text-sm-right" htmlFor="inputName">Valor inicial por metro</label>
						<input
							className={`form-control ${isEditingBaseValue? 'd-none' : ''}`}
							value={numeral(baseMeterPrice || 0).format('$ 0,0[.]00')}
							onFocus={() => setEditingBaseValue(!isEditingBaseValue)}
							disabled={!isPlip}
						/>
						<input
							className={`form-control ${!isEditingBaseValue ? 'd-none' : ''}`}
							placeholder="Valor inicial por metro"
							name="baseMeterPrice"
							value={baseMeterPrice || ''}
							onBlur={() => setEditingBaseValue(!isEditingBaseValue)}
							onChange={e => onPropertyChange(year, 'baseMeterPrice', parseFloat(e.target.value) || '')}
							type="number"
							step={0.1}
							disabled={!isPlip}
						/>
						{errors[year] && errors[year].baseMeterPrice && <span style={{ color: 'red' }}>{errors[year].baseMeterPrice}</span>}
					</div>
				</div>
			</div>
			{monthlyConsumption !== undefined && baseMeterPrice !== undefined &&
				<ConsumptionTable
					monthlyConsumption={monthlyConsumption}
					baseMeterPrice={baseMeterPrice}
					discounts={discounts || Array(100).fill(0)}
					onPercentageChange={(i, value) => updateItemPercentage(i, value)}
					isPlip={isPlip}
				/>}
		</React.Fragment>
	)
})

CommercialInformation.propTypes = {
	onErrorsChange: PropTypes.func,
	onPropertyChange: PropTypes.func,
	invoiceData: PropTypes.object,
}

export default CommercialInformation