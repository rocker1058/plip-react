import React, { useContext, useState, useEffect } from 'react'
import { Link, useHistory } from 'react-router-dom'
import PropTypes from 'prop-types'
import ContentLoader from 'react-content-loader'
import swal from 'sweetalert'
import { useQuery, useMutation } from 'react-apollo'
import moment from 'moment'

import { GET_BUSINESS_LINES, DELETE_BUSINESS_LINE } from './GraphQL'
import { NotyfContext, usePermissionManager } from '../../Common'

import emptyImage from '../../../Assets/img/undraw_security_o890.svg'

const ListLoader = props => (
	<ContentLoader
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
)

function EmptyContent() {
	return (
		<div className="col-12 card emptytable">
			<div className="row justify-content-center">
				<div className="col-4">
					<img className="img-fluid" src={emptyImage} />
				</div>
				<div className="w-100 d-block"></div>
				<div className="col-10 col-sm-6 col-md-4">
					<h5 className="text-center">NO HAS AÑADIDO NINGUNA LÍNEA DE NEGOCIO</h5>
					<p className="text-center">Usa éste modulo, Haz click para agregar <br className="d-none d-lg-block"></br>una nueva línea de negocio en el establecimiento</p>
				</div>
			</div>
		</div>
	)
}

EmptyContent.propTypes = {
	callbacks: PropTypes.object,
}

function BusinessLineItem({ company, businessLine, onBusinessLineEdit, onBusinessLineDelete, canExecuteAction }){
	const [ canEdit, setCanEdit ] = useState(false)
	const [ canDelete, setCanDelete ] = useState(false)
	const [ permissions, setPermissions ] = useState([])

	const evaluatePermissions = async () => {
		const editable = await canExecuteAction(businessLine.id, 'editBusinessLine')
		const deleteable = await canExecuteAction(businessLine.id, 'deleteBusinessLine')
		setCanEdit(editable)
		setCanDelete(deleteable)
		setPermissions([ editable, deleteable ])
	}
	useEffect(() => {
		evaluatePermissions()
	}, [])

	return (
		<tr style={{ height: '70px' }}>
			<td>{businessLine.logo && <img className="logo" src={businessLine.logo} />}</td>
			<td className="clickable"><Link to={`/establecimientos/${company}/lineasdenegocio/${businessLine.id}`}>{businessLine.name}</Link></td>
			<td>{businessLine.locationQuantity}</td>
			<td>{moment(businessLine.createdAt).format('DD/MMM/YYYY')}</td>
			<td>
				<div className="dropdown">
					{permissions.some(permission => permission === true) &&
					<>
						<button className="btn btn-white dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
								···
						</button>
						<div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
							{canEdit && <a className="dropdown-item" onClick={() => onBusinessLineEdit(businessLine)}>Editar</a>}
							{canDelete && <a className="dropdown-item warning" onClick={() => onBusinessLineDelete(businessLine)}>Eliminar</a>}
						</div>
					</>
					}
				</div>
			</td>
		</tr>
	)
}

BusinessLineItem.propTypes = {
	company: PropTypes.string,
	businessLine: PropTypes.object,
	onBusinessLineEdit: PropTypes.func,
	onBusinessLineDelete: PropTypes.func,
	canExecuteAction: PropTypes.func,
}

function BusinessLinesTable({ company, businessLines, token, limit, callbacks }) {
	return (
		<div className="col-12 custom-table">
			<div className="table-responsive">
				<table className="table">
					<thead>
						<tr>
							<th scope="col"></th>
							<th scope="col">Nombre</th>
							<th scope="col">#Sucursales</th>
							<th scope="">Fecha de creación</th>
							<th scope="col">···</th>
						</tr>
					</thead>
					<tbody>
						{businessLines.map(businessLine => <BusinessLineItem key={businessLine.id} company={company} businessLine={businessLine} {...callbacks} />)}
					</tbody>
				</table>
			</div>
			{ token && businessLines.length >= limit &&
				<div className="row justify-content-center more">
					<div className="col-12 text-center">
						<button onClick={() => callbacks.fetchMore(token)} className="btn btn-lightblue">Mostrar más</button>
					</div>
				</div>
			}
		</div>
	)
}

BusinessLinesTable.propTypes = {
	company: PropTypes.string,
	businessLines: PropTypes.array,
	token: PropTypes.string,
	loadMore: PropTypes.func,
	callbacks: PropTypes.object,
	limit: PropTypes.number,
}

function BusinessLines({ company }) {
	const { hasPermissionInBusinessLine, hasPermissionInCompany } = usePermissionManager()
	const history = useHistory()
	const notyf = useContext(NotyfContext)
	const [ inputSearch, setInputSearch ] = useState('')
	const [ searchTimeout, setSearchTimeout ] = useState(null)
	const [ search, setSearch ] = useState(null)
	const [ limit ] = useState(100)
	const [ businessLines, setBusinessLines ] = useState([])
	const [ loading, setLoading ] = useState(true)
	const { data, fetchMore } = useQuery(GET_BUSINESS_LINES, { variables: { limit, company, sortBy: 'name', order:'Ascending', ...(search ? { filter: { search } } : {}) } })
	const [ selectedBusinessLine, setSelectedBusinessLine ] = useState(null)

	const [ canCreateBusinessLine, setCanCreateBusinessLine ] = useState(false)

	const evaluatePermissions = async () => {
		const canCreate = await hasPermissionInCompany({ company, permission: 'createBusinessLine' })
		setCanCreateBusinessLine(canCreate)
	}
	
	useEffect(() => {
		evaluatePermissions()
	}, [])

	useEffect(() => {
		if (data && data.BusinessLine) {
			setLoading(false)
			setBusinessLines(data.BusinessLine.businessLines.results)
		}
	}, [ data ])

	const [ deleteBusinessLine ] = useMutation(DELETE_BUSINESS_LINE, {
		onCompleted: () => {
			setBusinessLines(businessLines.filter(businessLine => businessLine.id !== selectedBusinessLine))
			notyf.open({
				type: 'success',
				message: 'La línea de negocio ha sido eliminada exitosamente',
			})
			setSelectedBusinessLine(null)
		},
		onError: (e) => {
			let error = {
				type: 'error',
				message: 'Se presentó un problema eliminando la línea de negocio. Intenta de nuevo más tarde',
			}
			if (e.graphQLErrors[0].code === 'ExistingLocations') {
				error = {
					...error, message: 'Debes desasociar todas las sucursales de la linea de negocio para poderla eliminar',
				}
			}
			notyf.open(error)
			setSelectedBusinessLine(null)
		},
	})

	const callbacks = {
		onBusinessLineEdit: ({ id }) => {
			history.push({
				pathname: `/establecimientos/${company}/lineasdenegocio/${id}/informacion`,
			})
		},
		onBusinessLineDelete: async ({ id, name }) => {
			const value = await swal({
				text: `¿Seguro que deseas eliminar la línea de negocio ${name}?`,
				dangerMode: true,
				buttons: {
					confirm: 'Si',
					cancel: 'No',
				},
			})	
			if (value) {
				setSelectedBusinessLine(id)
				deleteBusinessLine({ variables: { id } })
			}
		},
		canExecuteAction: (businessLine, permission) => hasPermissionInBusinessLine({ businessLine, permission }),
		fetchMore: (token) => {
			fetchMore({
				query: GET_BUSINESS_LINES,
				variables: { company, token },
				updateQuery: (previousResult, { fetchMoreResult }) => {
					return {
						BusinessLine: {
							...previousResult.BusinessLine,
							businessLines: {
								...previousResult.BusinessLine.businessLines,
								token: fetchMoreResult.BusinessLine.businessLines.token,
								results: [
									...previousResult.BusinessLine.businessLines.results,
									...fetchMoreResult.BusinessLine.businessLines.results,
								],
							},
						},
					}
				},
			})
		},
	}

	return (
		<React.Fragment>
			<div className="col-12 my-3">
				<div className="row mb-3">
					<div className="col-12">
						<div className="row justify-content-between">
							<div className="col-md-8">
								<div className="row justify-content-end">
									<div className="col-md-8">
										{!loading && data.BusinessLine && businessLines.length > 0 &&
											<input className="form-control" placeholder="Bucar por nombre de línea de negocio" value={inputSearch} onChange={e => {
												const text = e.target.value
												setInputSearch(text)
												if(searchTimeout) {
													clearTimeout(searchTimeout)
												}
												setSearchTimeout(setTimeout(() => {
													setSearch(text)
												}, 1000))
											}}/>
										}
									</div>
								</div>
							</div>
							<div className="col-6 col-md-4 btn-options">
								{canCreateBusinessLine && <Link className="btn btn-primary float-right" to={`/establecimientos/${company}/lineasdenegocio/registro`}>Crear línea de negocio</Link>}
							</div>
						</div>
					</div>
				</div>
				{ loading &&
					<div className="row">
						<div className="col-12">
							<ListLoader style={{ height: '100%', width: '100%' }} />
						</div>
					</div>
				}
				{ !loading && data.BusinessLine && businessLines.length === 0 &&
					<div className="row px-3 mt-4 mt-lg-0">
						<EmptyContent callbacks={callbacks} />
					</div>
				}
				{ !loading && data.BusinessLine && businessLines.length > 0 &&
					<div className="row">
						<BusinessLinesTable company={company} businessLines={businessLines} limit={limit} token={data.BusinessLine.businessLines.token} callbacks={callbacks}/>
					</div>
				}
			</div>
		</React.Fragment>
	)
}

BusinessLines.propTypes = {
	company: PropTypes.string,
}

export default BusinessLines