import React, { useState, useContext, useEffect } from 'react'
import PropTypes from 'prop-types'
import ContentLoader from 'react-content-loader'
import { useQuery } from 'react-apollo'
import { useMutation } from 'react-apollo'
import swal from 'sweetalert'

import { NotyfContext, usePermissionManager } from '../../Common'
import { CreateRoleModal, EditRoleModal } from './Modals'
import { GET_ROLES, DELETE_ROLE } from './GraphQL'
import emptyImage from '../../../Assets/img/noResultIcon.svg'

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
			<div className="row justify-content-center" onClick={() => callbacks.onCreateRol()}>
				<div className="col-4 col-md-1">
					<img className="img-fluid" src={emptyImage} />
				</div>
				<div className="w-100 d-block"></div>
				<div className="col-10 col-sm-6 col-md-4">
					<h5 className="text-center">NO HAS AÑADIDO NINGUN ROL</h5>
					<p className="text-center">Usa éste modulo, Haz click para agregar <br className="d-none d-lg-block"></br>un nuevo rol al establecimiento</p>
				</div>
			</div>
		</div>
	)
}

EmptyContent.propTypes = {
	callbacks: PropTypes.object,
}

function RoleItem({ role, onRoleEdit, onRoleDelete, canExecuteAction }) {
	const [ canEdit, setCanEdit ] = useState(false)
	const [ canDelete, setCanDelete ] = useState(false)
	const [ permissions, setPermissions ] = useState([])

	const evaluatePermissions = async () => {
		const editable = await canExecuteAction('editRole')
		const deleteable = await canExecuteAction('deleteRole')
		setCanEdit(editable)
		setCanDelete(deleteable)
		setPermissions([ editable, deleteable ])
	}
	useEffect(() => {
		evaluatePermissions()
	}, [])

	const typeConverter = (type) => {
		if (type === 'company' || type === 'plip') {
			return 'Compañia'
		}
		else if (type === 'businessLine') {
			return 'Línea de negocio'
		}
		else if (type === 'location') {
			return 'Sucursal'
		}
		return ''
	}

	return (
		<tr style={{ height: '70px' }}>
			<td>{role.friendlyName} </td>
			<td>{role.description} </td>
			<td>{role.isPlip ? 'PliP' : 'Comercio'}</td>
			<td>{typeConverter(role.type)}</td>
			<td>{role.permissions.length}</td>
			<td>
				{ (!role.isPlip || role.company === 'PliP') && permissions.some(permission => permission === true) &&
					<div className="dropdown">
						<button className="btn btn-white dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
								···
						</button>
							
						<div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
							{canEdit && <a className="dropdown-item" onClick={() => onRoleEdit(role)}>Editar</a>}
							{canDelete &&<a className="dropdown-item warning" onClick={() => onRoleDelete(role)}>Eliminar</a>}
						</div>
						
					</div>
				}
			</td>
		</tr>
	)
}

RoleItem.propTypes = {
	role: PropTypes.object,
	onRoleEdit: PropTypes.func,
	onRoleDelete: PropTypes.func,
	canExecuteAction: PropTypes.func,
}

function RolesTable({ roles, token, limit, callbacks }){
	return (
		<div className="col-12">
			<div className="row">
				<div className="col-12 custom-table">
					<div className="table-responsive">
						<table className="table">
							<thead>
								<tr>
									<th scope="col">Nombre</th>
									<th scope="col">Descripción</th>
									<th scope="col">Propietario</th>
									<th scope="col">Alcance</th>
									<th scope="col">Permisos</th>
								</tr>
							</thead>
							<tbody>
								{roles.map(role => <RoleItem key={role.id} role={role} {...callbacks}/> )}
							</tbody>
						</table>
						{ token && roles.length >= limit &&
							<div className="row justify-content-center more">
								<div className="col-12 text-center">
									<button onClick={() => callbacks.fetchMore(token)} className="btn btn-lightblue">Mostrar más</button>
								</div>
							</div>
						}
					</div>
				</div>
			</div>
		</div>
	)
	
}

RolesTable.propTypes = {
	roles: PropTypes.array,
	token: PropTypes.string,
	fetchMore: PropTypes.func,
	callbacks: PropTypes.object,
	limit: PropTypes.number,
}

function RolesResults({ company }) {
	const { hasPermissionInCompany } = usePermissionManager()
	const notyf = useContext(NotyfContext)
	const [ limit ] = useState(100)
	const [ roles, setRoles ] = useState([])
	const { data, fetchMore } = useQuery(GET_ROLES, { variables: { filter: { company, includeGlobal: true }, limit, orderBy: 'name', order: 'Ascending' } })
	const [ showCreateRoleModal, setShowCreateRoleModal ] = useState(false)
	const [ showEditRoleModal, setShowEditRoleModal ] = useState(false)
	const [ selectedRole, setSelectedRole ] = useState(null)
	const [ loading, setLoading ] = useState(true)

	const [ canCreateRole, setCreateRole ] = useState(false)
	const [ canEditRole, setCanEditRole ] = useState(false)

	const evaluatePermissions = async () => {
		const createRole = await hasPermissionInCompany({ company, permission: 'createRole' })
		const editRole = await hasPermissionInCompany({ company, permission: 'editRole' })
		setCreateRole(createRole)
		setCanEditRole(editRole)
	}

	useEffect(() => {
		evaluatePermissions()
	}, [])

	useEffect(() => {
		if (data && data.Access) {
			setLoading(false)
			setRoles(data.Access.roles.results)
		}
	}, [ data ])

	const [ deleteRole ] = useMutation(DELETE_ROLE, {
		onCompleted: () => {
			setRoles(roles.filter(role => role.id !== selectedRole))
			notyf.open({
				type: 'success',
				message: 'El rol ha sido eliminado exitosamente',
			})
			setSelectedRole(null)
		},
		onError: () => {
			notyf.open({
				type: 'error',
				message: 'Se presentó un problema eliminando el rol. Intenta de nuevo más tarde',
			})
			setSelectedRole(null)
		},
	})

	const appendRole = (role) => setRoles([ ...roles, role ])

	const updateRole = (role) => {
		const index = roles.map(role => role.id).indexOf(role.id)
		setRoles([ ...roles.slice(0, index), role,...roles.slice( index + 1) ])
	}

	const callbacks = {
		onRoleEdit: ({ id }) => {
			setSelectedRole(id)
			setShowEditRoleModal(true)
		},
		onRoleDelete: async ({ id, name }) => {
			const value = await swal({
				text: `¿Seguro que deseas eliminar el rol ${name}?`,
				dangerMode: true,
				buttons: {
					confirm: 'Si',
					cancel: 'No',
				},
			})
			if (value) {
				setSelectedRole(id)
				deleteRole({ variables:{ id } })
			}
		},
		canExecuteAction: (permission) => hasPermissionInCompany({ company, permission }),
		fetchMore: (token) => {
			fetchMore({
				query: GET_ROLES,
				variables: { token },
				updateQuery: (previousResult, { fetchMoreResult }) => {
					return {
						Access: {
							...previousResult.Access,
							roles: {
								...previousResult.Access.roles,
								token: fetchMoreResult.Access.roles.token,
								results: [
									...previousResult.Access.roles.results,
									...fetchMoreResult.Access.roles.results,
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
			<div className="col-12 px-0">
				<div className="row">
					<div className="col-12">
						<div className="row justify-content-end m-3">
							<div className="col-6 col-md-6 btn-options">
								{canCreateRole && <button className="btn btn-primary float-right" onClick={() => setShowCreateRoleModal(true)}>Crear nuevo Rol</button>}
							</div>
						</div>
					</div>
				</div>
				{
					loading &&
					<div className="row">
						<div className="col-12">
							<ListLoader style={{ height: '100%', width: '100%' }} />
						</div>
					</div>
				}
				{
					!loading && data.Access && roles.length === 0 &&
					<div className="row px-3 mt-4 mt-lg-0">
						<EmptyContent callbacks={callbacks}/>
					</div>
				}
				{!loading && data.Access && roles.length > 0 &&
					<RolesTable roles={roles.map(role => ({ ...role, company }))} limit={limit} token={data.Access.roles.token} callbacks={callbacks}/>
				}
			</div>
			{canCreateRole && <CreateRoleModal visible={showCreateRoleModal} setVisible={setShowCreateRoleModal} company={company} onRoleCreated={appendRole}/>}
			{canEditRole && <EditRoleModal visible={showEditRoleModal} setVisible={setShowEditRoleModal} company={company} roleId={selectedRole} onRoleUpdated={updateRole} />}
		</React.Fragment>
	)
}

RolesResults.propTypes = {
	company: PropTypes.string,
}

export default RolesResults