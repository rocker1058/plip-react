import React, { useState, useEffect, useContext } from 'react'
import { Link } from 'react-router-dom'
import { useSelector } from 'react-redux'
import PropTypes from 'prop-types'
import { useQuery, useMutation } from 'react-apollo'
import { useDispatch } from 'react-redux'
import ContentLoader from 'react-content-loader'
import swal from 'sweetalert'

import { usePermissionManager, NotyfContext } from '../../Common'
import { SET_NAVBAR_PROPERTIES, SET_SIDEBAR_PROPERTIES } from '../../../Redux/Actions'
import { GET_USER, GET_COMPANY, DELETE_ACCESS, TOGGLE_ACCESS } from './GraphQL'
import { CreateAccessModal, EditAccessModal } from './Modals'
import emptyImage from '../../../Assets/img/noResultIcon.svg'

const ListLoader = props => (
	<ContentLoader
		speed={2}
		primaryColor="#f3f3f3"
		secondaryColor="#ecebeb"
		className="ContentLoader"
		{...props}>
		<rect x="0" y="0" rx="0" ry="0" width="400" height="30" />
		<rect x="0" y="35" rx="0" ry="0" width="400" height="30" />
		<rect x="0" y="70" rx="0" ry="0" width="400" height="30" />
		<rect x="0" y="105" rx="0" ry="0" width="400" height="30" />
		<rect x="0" y="140" rx="0" ry="0" width="400" height="30" />
		<rect x="0" y="175" rx="0" ry="0" width="400" height="30" />
	</ContentLoader>
)

function EmptyContent() {
	return (
		<div className="col-12 card emptytable">
			<div className="row justify-content-center">
				<div className="col-4 col-md-1">
					<img className="img-fluid" src={emptyImage}/>
				</div>
				<div className="w-100 d-block"></div>
				<div className="col-10 col-sm-6 col-md-4">
					<h5 className="text-center">NO HAS AÑADIDO NINGÚN ACCESO</h5>
				</div>
			</div>
		</div>
	)
}

EmptyContent.propTypes = {
	callbacks: PropTypes.object,
}

function AccessItem({ access, onAccessEdit, onAccessDelete, onAccessToggle, canExecuteAction, isPliP, isSameUser }) {
	const loggedUser = useSelector(state => state.authentication.user)
	const [ canEdit, setCanEdit ] = useState(false)
	const [ canDelete, setCanDelete ] = useState(false)
	const [ canEnableDisable, setCanEnableDisable ] = useState(false)
	const [ permissions, setPermissions ] = useState([])

	const evaluatePermissions = async () => {
		const editable = await canExecuteAction('editAccess')
		const deleteable = await canExecuteAction('deleteAccess')
		const enableDisable = await canExecuteAction('enableDisableAccess')
		setCanEdit(editable)
		setCanDelete(deleteable)
		setCanEnableDisable(enableDisable)
		setPermissions([ editable, deleteable, enableDisable ])
	}
	useEffect(() => {
		evaluatePermissions()
	}, [])
	return (
		<tr style={{ height: '70px' }}>
			<td><p className={`status ${access.disabled  ? 'disabled' : 'enabled'}`} title="Habilitado"></p></td>
			{isPliP && <td>{access.company.id === '*' ? 'Todos' : access.company.name} </td>}
			<td>{access.businessLine.id === '*' ? 'Todas' : access.businessLine.name} </td>
			<td>{access.location.id === '*' ? 'Todas' : access.location.name}</td>
			<td>{access.roles.length}</td>
			<td>{access.permissions.length}</td>
			{permissions.some(permission => permission === true) && !isSameUser(loggedUser.id) && 
			<td>
				<div className="dropdown">
					<>
						<button className="btn btn-white dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
							···
						</button>
						<div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
							{canEdit && <a className="dropdown-item" onClick={() => onAccessEdit(access)}>Editar</a>}
							{canEnableDisable && access.disabled && <a className="dropdown-item" onClick={() => onAccessToggle(access)}>Habilitar</a>}
							{canEnableDisable && !access.disabled && <a className="dropdown-item" onClick={() => onAccessToggle(access)}>Deshabilitar</a>}
							{canDelete && <a className="dropdown-item warning" onClick={() => onAccessDelete(access)}>Eliminar</a>}
						</div>
					</>
				</div>
			</td>}
		</tr>
	)
}

AccessItem.propTypes = {
	isPliP: PropTypes.bool,
	access: PropTypes.object,
	onAccessToggle: PropTypes.func,
	onAccessEdit: PropTypes.func,
	onAccessDelete: PropTypes.func,
	canExecuteAction: PropTypes.func,
	isSameUser: PropTypes.bool,
}

function AccessesTable({ accesses, callbacks }){
	return (
		<div className="col-12">
			<div className="row">
				<div className="col-12 custom-table">
					<div className="table-responsive">
						<table className="table">
							<thead>
								<tr>
									<th scope="col">Estado</th>
									{callbacks.isPliP && <th scope="col">Establecimiento</th>}
									<th scope="col">Línea de negocio</th>
									<th scope="col">Sucursal</th>
									<th scope="col">#Roles</th>
									<th scope="col">#Permisos</th>
								</tr>
							</thead>
							<tbody>
								{accesses.map(access => <AccessItem key={access.id} access={access} {...callbacks}/> )}
							</tbody>
						</table>
					</div>
				</div>
			</div>
		</div>
	)
	
}

AccessesTable.propTypes = {
	accesses: PropTypes.array,
	callbacks: PropTypes.object,
}

function UserAccesses({ match }) {
	const isPliP = match.params.id === 'PliP'
	const user = match.params.userId
	const [ accesses, setAccesses ] = useState([])
	const { hasPermissionInCompany } = usePermissionManager()
	const dispatch = useDispatch()
	const [ loading, setLoading ] = useState(true)
	const [ showCreateAccessModal, setShowCreateAccessModal ] = useState(false)
	const [ showEditAccessModal, setShowEditAccessModal ] = useState(false)
	const [ selectedAccess, setSelectedAccess ] = useState(null)
	const notyf = useContext(NotyfContext)

	const { data: userData } = useQuery(GET_USER, { variables: { id: user } })
	const { data: companyData } = useQuery(GET_COMPANY, { variables: { id: match.params.id }, skip: isPliP })
	console.log({ userData })
	const [ canCreateAccess, setCreateAccess ] = useState(false)
	const [ canEditAccess, setCanEditAccess ] = useState(false)

	const evaluatePermissions = async () => {
		const createAccess = await hasPermissionInCompany({ company: match.params.id, permission: 'createAccess' })
		const editAccess = await hasPermissionInCompany({ company: match.params.id, permission: 'editAccess' })
		setCreateAccess(createAccess)
		setCanEditAccess(editAccess)
	}

	useEffect(() => {
		evaluatePermissions()
	}, [])

	useEffect(() => {
		dispatch({ type: SET_NAVBAR_PROPERTIES, visibility: true })
		dispatch({ type: SET_SIDEBAR_PROPERTIES, visibility: true })
	}, [])

	useEffect(() => {
		if (userData && userData.User) {
			setLoading(false)
			setAccesses(userData.User.user.accesses.filter(access => ((isPliP && access.type === 'PliP') || (!isPliP && (access.company.id === '*' || access.company.id === match.params.id)))))
		}
	}, [ userData ])

	const [ deleteAccess ] = useMutation(DELETE_ACCESS, {
		onCompleted: () => {
			setAccesses(accesses.filter(access => access.id !== selectedAccess.id))
			notyf.open({
				type: 'success',
				message: 'El acceso ha sido eliminado exitosamente',
			})
			setSelectedAccess(null)
		},
		onError: () => {
			notyf.open({
				type: 'error',
				message: 'Se presentó un problema eliminando el acceso. Intenta de nuevo más tarde',
			})
			setSelectedAccess(null)
		},
	})

	const [ toggleAccess ] = useMutation(TOGGLE_ACCESS, {
		onCompleted: () => {
			notyf.open({
				type: 'success',
				message: 'El acceso ha sido actualizado exitosamente',
			})
			setSelectedAccess(null)
		},
		onError: () => {
			notyf.open({
				type: 'error',
				message: 'Se presentó un problema actualizando el acceso. Intenta de nuevo más tarde',
			})
		},
	})

	const onAccessCreated = () => {
		setSelectedAccess(null)
		setShowCreateAccessModal(false)
	}

	const onAccessUpdated = () => {
		setSelectedAccess(null)
		setShowEditAccessModal(false)
	}

	const callbacks = {
		onAccessEdit: (access) => {
			setSelectedAccess(access)
			setShowEditAccessModal(true)
		},
		onAccessDelete: async (access) => {
			const value = await swal({
				text: '¿Seguro que deseas eliminar este acceso?',
				dangerMode: true,
				buttons: {
					confirm: 'Si',
					cancel: 'No',
				},
			})
			if (value) {
				setSelectedAccess(access)
				deleteAccess({ variables:{ id: access.id } })
			}
		},
		onAccessToggle: async (access) => {
			toggleAccess({ variables: { id: access.id } })
		},
		canExecuteAction: (permission) => hasPermissionInCompany({ company: match.params.id, permission }),
		isPliP,
		isSameUser: id => id === user,
	}

	return (
		<React.Fragment>
			<div className="col-12 mt-2">
				<div className="row">
					<div className="col-md-6">
						<nav aria-label="breadcrumb">
							<ol className="breadcrumb">
								{<li className="breadcrumb-item">{!isPliP ? <Link to={`/establecimientos/${match.params.id}`}>{companyData ? companyData.Company.company.name : 'PliP'}</Link> : 'PliP'}</li>}
								<li className="breadcrumb-item"><Link to={`/establecimientos/${match.params.id}/usuarios`}>Usuarios</Link></li>
								<li className="breadcrumb-item">{ userData && userData.User && userData.User.user.name && userData.User.user.lastName ? `${userData.User.user.name} ${userData.User.user.lastName}` : (userData && userData.User.user.email) || ''}</li>
							</ol>
						</nav>
					</div>
					<div className="col-6">
						<div className="row justify-content-end m-3">
							<div className="col-6 col-md-6 btn-options">
								{canCreateAccess && <button className="btn btn-primary float-right" onClick={() => setShowCreateAccessModal(true)}>Crear nuevo acceso</button>}
							</div>
						</div>
					</div>
				</div>
				<div className="cliente margins pt-0">
					{ loading &&
					<div className="row">
						<div className="col-12">
							<ListLoader style={{ height: '100%', width: '100%' }} />
						</div>
					</div>
					}
					{ !loading && userData.User && accesses.length === 0 &&
					<div className="row px-3 mt-4 mt-lg-0">
						<EmptyContent />
					</div>
					}
					{ !loading && userData.User && accesses.length > 0 &&
					<div className="row">
						<AccessesTable accesses={accesses} callbacks={callbacks}/>
					</div>
					}
				</div>
			</div>
			{canCreateAccess && <CreateAccessModal visible={showCreateAccessModal} setVisible={setShowCreateAccessModal} company={match.params.id} user={user} onAccessCreated={onAccessCreated}/>}
			{canEditAccess && <EditAccessModal visible={showEditAccessModal} setVisible={setShowEditAccessModal} company={match.params.id} access={selectedAccess} user={user} onAccessUpdated={onAccessUpdated}/>}
		</React.Fragment>
	)
}

UserAccesses.propTypes = {
	dispatch: PropTypes.func,
	client: PropTypes.func,
	user: PropTypes.object,
	match: PropTypes.object,
	props: PropTypes.object,
}

export default UserAccesses
