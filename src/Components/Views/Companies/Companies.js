import React, { useContext, useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { useDispatch } from 'react-redux'
import { Link } from 'react-router-dom'
import ContentLoader from 'react-content-loader'
import { useQuery, useMutation } from 'react-apollo'
import swal from 'sweetalert'

import { NotyfContext, usePermissionManager } from '../../Common'

import { SET_NAVBAR_PROPERTIES, SET_SIDEBAR_PROPERTIES, SET_TITLE } from '../../../Redux/Actions'
import { GET_COMPANIES, DELETE_COMPANY } from './GraphQL'
import establecimientoIcon from '../../../Assets/img/establecimientos-icon.svg'
import emptyImage from '../../../Assets/img/noResultIcon.svg'

function ListLoader(props){
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

function EmptyContent({ callbacks }) {
	return (
		<div className="col-12 card emptytable">
			<div className="row justify-content-center" onClick={() => callbacks.onCreateCompany()}>
				<div className="col-4 col-md-1">
					<img className="img-fluid" src={emptyImage} />
				</div>
				<div className="w-100 d-block"></div>
				<div className="col-10 col-sm-6 col-md-4">
					<h5 className="text-center">NO HAS AÑADIDO NINGUN ESTABLECIMIENTO</h5>
					<p className="text-center">Usa éste modulo, Haz click para agregar <br className="d-none d-lg-block"></br>un nuev establecimiento al sistema</p>
				</div>
			</div>
		</div>
	)
}

EmptyContent.propTypes = {
	callbacks: PropTypes.object,
}

function CompanyItem({ company, onCompanyEdit, onCompanyDelete, canExecuteAction }) {
	const [ canEdit, setCanEdit ] = useState(false)
	const [ canDelete, setCanDelete ] = useState(false)
	const [ permissions, setPermissions ] = useState([])

	const evaluatePermissions = async () => {
		const editable = await canExecuteAction(company.id, 'editCompany')
		const deleteable = await canExecuteAction(company.id, 'deleteCompany')
		setCanEdit(editable)
		setCanDelete(deleteable)
		setPermissions([ editable, deleteable ])
	}
	useEffect(() => {
		evaluatePermissions()
	}, [])
	
	return (
		<tr style={{ height: '70px' }}>
			<td>{company.logo && <Link to={`/establecimientos/${company.id}`}><img className="logo" src={company.logo}/></Link>}</td>
			<td className="clickable"><Link to={`/establecimientos/${company.id}`}>{company.name}</Link></td>
			<td>{company.legalName}</td>
			<td>{company.document ? `${company.document.type} ${company.document.number}` : '-'}</td>
			<td>{company.phone}</td>
			{permissions.some(permission => permission === true) && <td>
				<div className="dropdown">
					<button className="btn btn-white dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
							···
					</button>
					<div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
						{canEdit && <a className="dropdown-item" onClick={() => onCompanyEdit(company)}>Editar</a>}
						{canDelete && <a className="dropdown-item warning" onClick={() => onCompanyDelete(company)}>Eliminar</a>}
					</div>
				</div>
			</td>
			}
		</tr>
	)
}

CompanyItem.propTypes = {
	company: PropTypes.object,
	onCompanyEdit: PropTypes.func,
	onCompanyDelete: PropTypes.func,
	canExecuteAction: PropTypes.func,
}

function CompaniesTable({ companies, token, limit, callbacks }) {
	return (
		<div className="col-12 custom-table">
			<div className="table-responsive">
				<table className="table">
					<thead>
						<tr>
							<th scope="col"></th>
							<th scope="col">Nombre comercial</th>
							<th scope="col">Razón Social</th>
							<th scope="col">NIT</th>
							<th scope="col">Teléfono</th>
							<th scope="col">···</th>
						</tr>
					</thead>
					<tbody>
						{companies.map(company => <CompanyItem key={company.id} company={company} {...callbacks}/>)}
					</tbody>
				</table>
			</div>
			{ token && companies.length >= limit &&
				<div className="row justify-content-center more">
					<div className="col-12 text-center">
						<button onClick={() => callbacks.fetchMore(token)} className="btn btn-lightblue">Mostrar más</button>
					</div>
				</div>
			}
		</div>
	)
}

CompaniesTable.propTypes = {
	companies: PropTypes.array,
	token: PropTypes.string,
	loadMore: PropTypes.func,
	callbacks: PropTypes.object,
	limit: PropTypes.number,
}

function Companies({ history }) {
	const { hasPermissionInCompany } = usePermissionManager()
	const dispatch = useDispatch()
	const notyf = useContext(NotyfContext)
	const [ limit ] = useState(100)
	const [ companies, setCompanies ] = useState([])
	const [ inputSearch, setInputSearch ] = useState('')
	const [ searchTimeout, setSearchTimeout ] = useState(null)
	const [ search, setSearch ] = useState(null)
	const [ loading, setLoading ] = useState(true)
	const { data, fetchMore } = useQuery(GET_COMPANIES, { variables: { sortBy: 'name', limit, ...(search ? { filter: { search } } : {} ) } })
	const [ selectedCompany, setSelectedCompany ] = useState(null)

	useEffect(() => {
		dispatch({ type: SET_NAVBAR_PROPERTIES, visibility: true })
		dispatch({ type: SET_SIDEBAR_PROPERTIES, visibility: true })
		dispatch({ type: SET_TITLE, title: 'Establecimientos' })
	}, [])

	useEffect(() => {
		if (data && data.Company) {
			setLoading(false)
			setCompanies(data.Company.companies.results)
		}
	}, [ data ])

	const [ deleteCompany ] = useMutation(DELETE_COMPANY, {
		onCompleted: () => {
			setCompanies(companies.filter(company => company.id !== selectedCompany))
			notyf.open({
				type: 'success',
				message: 'El establecimiento ha sido eliminado exitosamente',
			})
			setSelectedCompany(null)
		},
		
		onError: (e) => {
			let error = {
				type: 'error',
				message: 'Se presentó un problema eliminando el establecimiento. Intenta de nuevo más tarde',
			}
			if (e.graphQLErrors[0].code === 'ExistingBusinessLines') {
				error = {
					...error, message: 'Debes eliminar todas las líneas de negocio para poder eliminar el establecimiento',
				}
			}
			notyf.open(error)
			setSelectedCompany(null)
		},
	})
	const callbacks = {
		onCompanyEdit: ({ id }) => {
			history.push({
				pathname: `/establecimientos/${id}/informacion`,
			})
		},
		onCompanyDelete: async ({ id, name }) => {
			const value = await swal({
				text: `¿Seguro que deseas eliminar el establecimiento ${name}?`,
				dangerMode: true,
				buttons: {
					confirm: 'Si',
					cancel: 'No',
				},
			})	
			if (value) {
				setSelectedCompany(id)
				deleteCompany({ variables: { id } })
			}
		},
		canExecuteAction: (company, permission) => hasPermissionInCompany({ company, permission }),
		fetchMore: (token) => {
			fetchMore({
				query: GET_COMPANIES,
				variables: { token },
				updateQuery: (previousResult, { fetchMoreResult }) => {
					return {
						Company: {
							...previousResult.Company,
							companies: {
								...previousResult.Company.companies,
								token: fetchMoreResult.Company.companies.token,
								results: [
									...previousResult.Company.companies.results,
									...fetchMoreResult.Company.companies.results,
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
			<div className="col-12 mt-2">
				<div className="row px-3  mt-lg-4 justify-content-between">
					<div className="col-12 col-md-4">
						<div className="row">
							<img className="pageIcon" src={establecimientoIcon} />
							<h1>Establecimientos</h1>
						</div>
					</div>
					{!loading && data.Company && companies.length > 0 &&
						<div className="col-md-4">
							<input className="form-control" placeholder="Buscar por nombre de establecimiento" value={inputSearch} onChange={e => {
								const text = e.target.value
								setInputSearch(text)
								if(searchTimeout) {
									clearTimeout(searchTimeout)
								}
								setSearchTimeout(setTimeout(() => {
									setSearch(text)
								}, 1000))
							}}/>
						</div>
					}
					<div className="col-6 col-md-4 btn-options">
						{hasPermissionInCompany({ company: 'PliP', permission: 'createCompany' }) && <Link className="btn btn-primary float-right" to="/establecimientos/registro">Agregar establecimiento</Link>}
					</div>
				</div>
				{ loading && <ListLoader style={{ height: '100%', width: '100%' }} />}
				{ !loading && data.Company && companies.length === 0 &&
					<div className="row px-3 mt-4 mt-lg-0">
						<EmptyContent callbacks={callbacks} />
					</div>
				}
				{ !loading && data.Company && companies.length > 0 &&
					<div className="row px-3 mt-4">
						<CompaniesTable companies={companies} limit={limit} token={data.Company.companies.token} callbacks={callbacks}/>
					</div>
				}
			</div>
			{/* {hasPermission('PliP', null, 'editCompany') && <EditCompanyModal visible={showEditCompanyModal} setVisible={visible => {
				setShowEditCompanyModal(visible)
				if (!visible) setSelectedCompany(false)
			}} companyId={selectedCompany} onCompanyUpdated={updateCompany}/>} */}
		</React.Fragment>
	)
}

Companies.propTypes = {
	history: PropTypes.object,
}

export default Companies
