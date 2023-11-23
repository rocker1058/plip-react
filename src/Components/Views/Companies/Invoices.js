import React, { useContext, useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { useDispatch } from 'react-redux'
import ContentLoader from 'react-content-loader'
import { useQuery, useMutation } from 'react-apollo'
import moment from 'moment'
import numeral from 'numeral'
import emptyImage from '../../../Assets/img/noResultIcon.svg'

import { NotyfContext, usePermissionManager, CustomForm, useLocations, useBusinessLines } from '../../Common'

import { SET_NAVBAR_PROPERTIES, SET_SIDEBAR_PROPERTIES } from '../../../Redux/Actions'
import { GET_INVOICES, CANCEL_INVOICE } from './GraphQL'

function ListLoader(props) {
	return <ContentLoader
		speed={2}
		primaryColor="#f3f3f3"
		secondaryColor="#ecebeb"
		className="col-12 mt-5 ContentLoader"
		{...props}>
		<rect x="0" y="0" rx="0" ry="0" width="100%" height="50" />
		<rect x="0" y="55" rx="0" ry="0" width="100%" height="50" />
		<rect x="0" y="110" rx="0" ry="0" width="100%" height="50" />
		<rect x="0" y="165" rx="0" ry="0" width="100%" height="50" />
		<rect x="0" y="220" rx="0" ry="0" width="100%" height="50" />
		<rect x="0" y="275" rx="0" ry="0" width="100%" height="50" />
		<rect x="0" y="300" rx="0" ry="0" width="100%" height="50" />
		<rect x="0" y="355" rx="0" ry="0" width="100%" height="50" />
		<rect x="0" y="410" rx="0" ry="0" width="100%" height="50" />
		<rect x="0" y="465" rx="0" ry="0" width="100%" height="50" />
		<rect x="0" y="520" rx="0" ry="0" width="100%" height="50" />
		<rect x="0" y="575" rx="0" ry="0" width="100%" height="50" />
	</ContentLoader>
}

function EmptyContent() {
	return (
		<div className="col-12 card emptytable">
			<div className="row justify-content-center">
				<div className="col-4 col-md-1">
					<img className="img-fluid" src={emptyImage} />
				</div>
				<div className="w-100 d-block"></div>
				<div className="col-10 col-sm-6 col-md-4">
					<h5 className="text-center">NO TIENES NINGUNA FACTURA EN ESTE ESTABLECIMIENTO</h5>
					<p className="text-center">Una vez emitas facturas podras visualizarlas aquí</p>
				</div>
			</div>
		</div>
	)
}

EmptyContent.propTypes = {
	callbacks: PropTypes.object,
}

function InvoiceItem({ invoice, invoices, cancelInvoice, onSetInvoices, canExecuteAction }) {
	const [ canCancelInvoice, setCanCancelInvoice ] = useState(false)
	const evaluatePermissions = async () => {
		const cancellable = await canExecuteAction()
		setCanCancelInvoice(cancellable)
	}
	useEffect(() => {
		evaluatePermissions()
	}, [])

	const onCancelInvoice = async (invoice) => {
		try{
			await cancelInvoice(invoice)
			const newInvoices = invoices.map((item) => {
				if(item.id === invoice.id){
					item.canceled = true
					return item
				}
				return item
			})
			onSetInvoices(newInvoices)
		}
		catch(e){
			console.log(e)
		}
	}
	return (
		<tr style={{ height: '70px' }}>
			<td>{invoice.number}</td>
			<td>{moment(invoice.date).format('DD/MM/YYYY')}</td>
			<td>{numeral(invoice.items).format('0,0')}</td>
			<td>{invoice.businessLine.name}</td>
			<td>{invoice.location.name}</td>
			<td>{invoice.locationTags.length > 0 ? invoice.locationTags.join(', ') : '-'}</td>
			<td>{numeral(invoice.total).format('$ 0,0[.]00') }</td>
			{!invoice.canceled && canCancelInvoice &&
				<td>
					<div className="dropdown">
						<button className="btn btn-white dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
							···
						</button>
						<div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
							<a className="dropdown-item" onClick={() => onCancelInvoice(invoice)}>Anular factura</a>
						</div>
					</div>
				</td>
			}
			{invoice.canceled &&
				<td><p className="canceledInvoice mb-0">Anulada</p></td>
			}
			{!canCancelInvoice && !invoice.canceled &&
				<td>-</td>
			}
		</tr>
	)
}

InvoiceItem.propTypes = {
	invoice: PropTypes.object,
	invoices: PropTypes.array,
	cancelInvoice: PropTypes.func,
	onSetInvoices: PropTypes.func,
	canExecuteAction: PropTypes.func,
}

function InvoicesTable({ invoices, token, callbacks, limit, onSetInvoices }) {
	return (
		<div className="col-12 custom-table">
			<div className="table-responsive">
				<table className="table">
					<thead>
						<tr>
							<th scope="col">Nº FACTURA</th>
							<th scope="col">FECHA</th>
							<th scope="col">Nº DE ITEMS</th>
							<th scope="col">LINEA DE NEGOCIO</th>
							<th scope="col">SUCURSAL</th>
							<th scope="col">TAGS</th>
							<th scope="col">TOTAL</th>
							<th scope="col">···</th>
						</tr>
					</thead>
					<tbody>
						{invoices.map(invoice => <InvoiceItem key={invoice.id} invoice={invoice} {...callbacks} invoices={invoices} onSetInvoices={onSetInvoices}/>)}
					</tbody>
				</table>
			</div>
			{ token && invoices.length >= limit &&
				<div className="row justify-content-center more">
					<div className="col-12 text-center">
						<button onClick={() => callbacks.fetchMore(token)} className="btn btn-lightblue">Mostrar más</button>
					</div>
				</div>
			}
		</div>
	)
}

InvoicesTable.propTypes = {
	invoices: PropTypes.array,
	onSetInvoices: PropTypes.func,
	token: PropTypes.string,
	loadMore: PropTypes.func,
	callbacks: PropTypes.object,
	limit: PropTypes.number,
}


function Invoices({ company, type, location: proLocation, businessLine: proBusinessLine }) {

	const dispatch = useDispatch()
	const notyf = useContext(NotyfContext)
	const [ limit ] = useState(50)
	const [ invoices, setInvoices ] = useState([])
	const [ loading, setLoading ] = useState(true)

	const [ start, setStart ] = useState(moment().startOf('month'))
	const [ end, setEnd ] = useState(moment().endOf('month'))
	const [ search, setSearch ] = useState('')
	const [ location, setLocation ] = useState(proLocation)
	const [ businessLine, setBusinessLine ] = useState(proBusinessLine)
	const { data, fetchMore } = useQuery(GET_INVOICES, { variables: { limit, filter: { company, ...(businessLine && businessLine !== '*' ? { businessLine } : {}), ...(location && location !== '*' ? { location } : {}), ...(search ? { search } : {}), startDate: start, endDate: end } } })

	const { distinctBusinessLines, distinctLocations: getDistincLocations, hasPermissionInCompany, hasPermissionInBusinessLine, hasPermissionInLocation  } = usePermissionManager()
	const distinctLocations = getDistincLocations(company, businessLine)
	const distinctLines = distinctBusinessLines(company)
	const locations = useLocations(businessLine).filter(loc => distinctLocations.includes(loc.id) || distinctLines.includes('*'))
	const businessLines = useBusinessLines(company).filter(bl => distinctLines.includes(bl.id) || distinctLines.includes('*'))

	useEffect(() => {
		dispatch({ type: SET_NAVBAR_PROPERTIES, visibility: true })
		dispatch({ type: SET_SIDEBAR_PROPERTIES, visibility: true })
	}, [])

	useEffect(() => {
		if (data && data.Invoice) {
			setLoading(false)
			setInvoices(data.Invoice.getInvoices.results)
		}
	}, [ data ])

	const [ CancelInvoice ] = useMutation(CANCEL_INVOICE, {
		onCompleted: () => {
			notyf.open({
				type: 'success',
				message: 'La factura ha sido anulada exitosamente',
			})
		},
		onError: (e) => {
			console.log(e)
			notyf.open({
				type: 'error',
				message: 'Error al anular factura. Intenta de nuevo más tarde',
			})
		},
	})

	const callbacks = {
		cancelInvoice: (invoice) => {
			console.log(invoice.id)
			CancelInvoice({
				variables: {
					id: invoice.id,
				},
			})
		},
		canExecuteAction: async () => {
			const [ invoicesPermissionCompany, invoicesPermissionBusiness, invoicesPermissionLocation ] = await Promise.all([
				hasPermissionInCompany({ company, permission: 'cancelEstablishmentInvoice' }),
				hasPermissionInBusinessLine({ businessLine, permission: 'cancelBusinessLineInvoice' }),
				hasPermissionInLocation({ location, permission: 'cancelLocationInvoice' }),
			])
			return invoicesPermissionCompany || invoicesPermissionBusiness || invoicesPermissionLocation ? true : false
		},
		fetchMore: (token) => {
			fetchMore({
				query: GET_INVOICES,
				variables: { filter: { company, ...(businessLine && businessLine !== '*' ? { businessLine } : {}), ...(location && location !== '*' ? { location } : {}), ...(search ? { search } : {}), startDate: start, endDate: end }, token },
				updateQuery: (previousResult, { fetchMoreResult }) => {
					return {
						Invoice: {
							...previousResult.Invoice,
							getInvoices: {
								...previousResult.Invoice.getInvoices,
								token: fetchMoreResult.Invoice.getInvoices.token,
								results: [
									...previousResult.Invoice.getInvoices.results,
									...fetchMoreResult.Invoice.getInvoices.results,
								],
							},
						},
					}
				},
			})
		},
	}

	return (
		<div className="col-12 mt-2">
			<div className="row justify-content-center">
				<div className="col-12 col-lg-2 form-group">
					<label className="col-form-label text-sm-right" htmlFor="inputName">Buscador</label>
					<input
						className="form-control"
						placeholder="# factura"
						name="name"
						value={search}
						onChange={e => setSearch(e.target.value)}
					/>
				</div>
				{type === 'company' &&
					<div className='col-2 form-group'>
						<label className="col-form-label text-sm-left" htmlFor="location">Líneas de negocio</label>
						<select
							className="form-control"
							name="businessLine"
							value={businessLine}
							onChange={(e) => {
								setBusinessLine(e.target.value)
								setLocation('*')
							}}>
							{distinctLines.includes('*') && <option value="*">Todas las líneas de negocio</option>}
							{businessLines.map(bl => <option key={bl.id} value={bl.id}>{bl.name}</option>)}
						</select>
					</div>
				}
				{(type === 'company' || type === 'businessLine') &&
					<div className='col-2 form-group'>
						<label className="col-form-label text-sm-left" htmlFor="location">Sucursales</label>
						<select
							className="form-control"
							name="location"
							value={location}
							disabled={!businessLine || businessLine === '*'}
							onChange={(e) => {
								setLocation(e.target.value)
							}}>
							{distinctLocations.includes('*') && <option value="*">Todas las sucursales</option>}
							{locations.map(loc => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
						</select>
					</div>
				}
				<div className="col-3 form-group">
					<label htmlFor="inputEmail">Fecha de inicio</label>
					<CustomForm.CustomInput
						name="start"
						className="form-control"
						type="date"
						defaultValue={start}
						placeholder="Fecha de inicio"
						onChange={(_, value) => setStart(value)} />
				</div>
				<div className="col-3 form-group">
					<label htmlFor="inputEmail">Fecha de fin</label>
					<CustomForm.CustomInput
						name="end"
						className="form-control"
						type="date"
						defaultValue={end}
						placeholder="Fecha de fin"
						onChange={(_, value) => setEnd(value)} />
				</div>
			</div>
			{ loading && <ListLoader style={{ height: '100%', width: '100%' }} />}
			{ !loading && data.Invoice && invoices.length === 0 &&
				<div className="row px-3 mt-4 mt-lg-0">
					<EmptyContent callbacks={callbacks} />
				</div>
			}
			{!loading && data.Invoice && invoices.length > 0 && <>
				<p className="ml-3"><strong>Total facturas:</strong> {data.Invoice.getInvoices.results.length || 0}</p>
				<div className="row px-3 mt-4">
					<InvoicesTable invoices={invoices} limit={limit} token={data.Invoice.getInvoices.token} callbacks={callbacks} onSetInvoices={setInvoices}/>
				</div>
			</>
			}
		</div>
	)
}

Invoices.propTypes = {
	company: PropTypes.string,
	location: PropTypes.string,
	businessLine: PropTypes.string,
	type: PropTypes.string,
}

export default Invoices