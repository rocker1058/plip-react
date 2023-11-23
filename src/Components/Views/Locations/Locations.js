import React, { useContext, useState, useEffect } from 'react'
import { Link, useHistory } from 'react-router-dom'
import PropTypes from 'prop-types'
import ContentLoader from 'react-content-loader'
import swal from 'sweetalert'
import { useQuery, useMutation } from 'react-apollo'
import spanishLocale from 'i18n-iso-countries/langs/es.json' 
import countries from 'i18n-iso-countries'
import { GET_LOCATIONS, DELETE_LOCATION } from './GraphQL'
import { NotyfContext, usePermissionManager } from '../../Common'

import emptyImage from '../../../Assets/img/undraw_security_o890.svg'

countries.registerLocale(spanishLocale)

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

function EmptyContent({ callbacks }) {
	return (
		<div className="col-12 card emptytable">
			<div className="row justify-content-center" onClick={() => callbacks.onCreateLocation()}>
				<div className="col-4">
					<img className="img-fluid" src={emptyImage} />
				</div>
				<div className="w-100 d-block"></div>
				<div className="col-10 col-sm-6 col-md-4">
					<h5 className="text-center">NO HAS AÑADIDO NINGUNA SUCURSAL</h5>
					<p className="text-center">Usa éste modulo, Haz click para agregar <br className="d-none d-lg-block"></br>una nueva sucursal al sistema</p>
				</div>
			</div>
		</div>
	)
}

EmptyContent.propTypes = {
	callbacks: PropTypes.object,
}

function LocationItem({ company, location, onLocationEdit, onLocationDelete, canExecuteAction }){
	const [ canEdit, setCanEdit ] = useState(false)
	const [ canDelete, setCanDelete ] = useState(false)
	const [ permissions, setPermissions ] = useState([])

	const evaluatePermissions = async () => {
		const editable = await canExecuteAction(location.id, 'editLocation')
		const deleteable = await canExecuteAction(location.id, 'deleteLocation')
		setCanEdit(editable)
		setCanDelete(deleteable)
		setPermissions([ editable, deleteable ])
	}

	useEffect(() => {
		evaluatePermissions()
	}, [])

	return (
		<tr style={{ height: '70px' }}>
			<td></td>
			<td className="clickable"><Link to={`/establecimientos/${company}/sucursales/${location.id}`}>{location.name}</Link></td>
			<td>{countries.getName(location.address.country, 'es')}</td>
			<td>{location.address.region}</td>
			<td>{location.address.city}</td>
			<td>{location.address.address}</td>
			<td>{location.tags.map(tag => <div key={tag} className="badge badge-secondary">{tag}</div>)}</td>
			<td>
				<div className="dropdown">
					{permissions.some(permission => permission === true) && 
					<>
						<button className="btn btn-white dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
								···
						</button>
						<div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
							{canEdit && <a className="dropdown-item" onClick={() => onLocationEdit(location)}>Editar</a>}
							{canDelete && <a className="dropdown-item warning" onClick={() => onLocationDelete(location)}>Eliminar</a>}
							<a className="dropdown-item warning" rel="noopener noreferrer" target="_blank" href={`https://www.google.com/maps/search/?api=1&query=${location.address.coordinates.latitude},${location.address.coordinates.longitude}`}>Ver en mapa</a>
						</div>
					</>
					}
				</div>
			</td>
		</tr>
	)
}

LocationItem.propTypes = {
	company: PropTypes.string,
	location: PropTypes.object,
	onLocationEdit: PropTypes.func,
	onLocationDelete: PropTypes.func,
	canExecuteAction: PropTypes.func,
}

function LocationsTable({ company, locations, token, limit, callbacks }) {
	return (
		<div className="col-12 custom-table">
			<div className="table-responsive">
				<table className="table">
					<thead>
						<tr>
							<th scope="col"></th>
							<th scope="col">Nombre</th>
							<th scope="col">País</th>
							<th scope="col">Región</th>
							<th scope="col">Ciudad</th>
							<th scope="col">Dirección</th>
							<th scope="col">Tags</th>
							<th scope="col">···</th>
						</tr>
					</thead>
					<tbody>
						{locations.map(location => <LocationItem key={location.id} company={company} location={location} {...callbacks} />)}
					</tbody>
				</table>
			</div>
			{ token && locations.length >= limit &&
				<div className="row justify-content-center more">
					<div className="col-12 text-center">
						<button onClick={() => callbacks.fetchMore(token)} className="btn btn-lightblue">Mostrar más</button>
					</div>
				</div>
			}
		</div>
	)
}

LocationsTable.propTypes = {
	company: PropTypes.string,
	locations: PropTypes.array,
	token: PropTypes.string,
	loadMore: PropTypes.func,
	callbacks: PropTypes.object,
	limit: PropTypes.number,
}

function Locations({ company, businessLine }) {
	const history = useHistory()
	const { hasPermissionInLocation, hasPermissionInCompany } = usePermissionManager()
	const notyf = useContext(NotyfContext)
	const [ limit ] = useState(100)
	const [ locations, setLocations ] = useState([])
	const [ inputSearch, setInputSearch ] = useState('')
	const [ searchTimeout, setSearchTimeout ] = useState(null)
	const [ search, setSearch ] = useState(null)
	const [ loading, setLoading ] = useState(true)
	const { data, fetchMore } = useQuery(GET_LOCATIONS, { variables: { limit, sortBy: 'name', order:'Ascending', businessLine, ...(search ? { filter: { search } } : {}) } })
	const [ selectedLocation, setSelectedLocation ] = useState(null)

	const [ canCreateLocation, setCanCreateLocation ] = useState(false)

	const evaluatePermissions = async () => {
		const canCreate = await hasPermissionInCompany({ company, permission: 'createLocation' })
		setCanCreateLocation(canCreate)
	}
	
	useEffect(() => {
		evaluatePermissions()
	}, [ company ])

	useEffect(() => {
		if (data && data.Location) {
			setLoading(false)
			setLocations(data.Location.locations.results)
		}
	}, [ data ])

	const [ deleteLocation ] = useMutation(DELETE_LOCATION, {
		onCompleted: () => {
			setLocations(locations.filter(location => location.id !== selectedLocation))
			notyf.open({
				type: 'success',
				message: 'La sucursal ha sido eliminada exitosamente',
			})
			setSelectedLocation(null)
		},
		onError: () => {
			notyf.open({
				type: 'error',
				message: 'Se presentó un problema eliminando la sucursal. Intenta de nuevo más tarde',
			})
			setSelectedLocation(null)
		},
	})

	const callbacks = {
		onLocationEdit: ({ id }) => {
			history.push({
				pathname: `/establecimientos/${company}/sucursales/${id}/informacion`,
			})
		},
		onLocationDelete: async ({ id, name }) => {
			const value = await swal({
				text: `¿Seguro que deseas eliminar la sucursal ${name}? \n Todas las credenciales serán eliminadas y no podrán ser recuperadas.`,
				dangerMode: true,
				buttons: {
					confirm: 'Si',
					cancel: 'No',
				},
			})	
			if (value) {
				setSelectedLocation(id)
				deleteLocation({ variables: { id } })
			}
		},
		canExecuteAction: (location, permission) => hasPermissionInLocation({ location, permission } ),
		fetchMore: (token) => {
			fetchMore({
				query: GET_LOCATIONS,
				variables: { token },
				updateQuery: (previousResult, { fetchMoreResult }) => {
					return {
						Location: {
							...previousResult.Location,
							locations: {
								...previousResult.Location.locations,
								token: fetchMoreResult.Location.locations.token,
								results: [
									...previousResult.Location.locations.results,
									...fetchMoreResult.Location.locations.results,
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
			<div className="col-12">
				<div className="row my-3">
					<div className="col-12">
						<div className="row justify-content-between">
							<div className="col-md-8">
								<div className="row justify-content-end">
									<div className="col-md-8">
										{!loading && data.Location && locations.length > 0 &&<input className="form-control" placeholder="Buscar por nombre de sucursal" value={inputSearch} onChange={e => {
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
								{canCreateLocation && <Link className="btn btn-primary float-right" to={`/establecimientos/${company}/lineasdenegocio/${businessLine}/sucursales/registro`}>Agregar sucursal</Link>}
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
				{ !loading && data.Location && locations.length === 0 &&
					<div className="row px-3 mt-4 mt-lg-0">
						<EmptyContent callbacks={callbacks} />
					</div>
				}
				{ !loading && data.Location && locations.length > 0 &&
					<div className="row">
						<LocationsTable company={company} locations={locations} limit={limit} token={data.Location.locations.token} callbacks={callbacks}/>
					</div>
				}
			</div>
		</React.Fragment>
	)
}

Locations.propTypes = {
	company: PropTypes.string,
	businessLine: PropTypes.string,
}

export default Locations