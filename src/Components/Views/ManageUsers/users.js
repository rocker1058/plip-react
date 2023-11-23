import React, { useState, useEffect, useContext } from 'react'
import PropTypes from 'prop-types'
import ContentLoader from 'react-content-loader'
import { Link, useHistory } from 'react-router-dom'
import { useSelector } from 'react-redux'
import { useQuery, useMutation } from 'react-apollo'
import swal from 'sweetalert'

import { NotyfContext, usePermissionManager } from '../../Common'
import { GET_USERS, DELETE_USER, RESEND_EMAIL } from './GraphQL'
import { CreateUserModal } from './Modals'
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
			<div className="row justify-content-center" onClick={() => callbacks.onCreateUser()}>
				<div className="col-4 col-md-1">
					<img className="img-fluid" src={emptyImage} />
				</div>
				<div className="w-100 d-block"></div>
				<div className="col-10 col-sm-6 col-md-4">
					<h5 className="text-center">NO HAS AÑADIDO NINGÚN USUARIO</h5>
					<p className="text-center">Usa éste modulo, Haz click para agregar <br className="d-none d-lg-block"></br>un nuevo usuario al establecimiento</p>
				</div>
			</div>
		</div>
	)
}

EmptyContent.propTypes = {
	callbacks: PropTypes.object,
}

function UserItem({ company, user, onUserDelete, onEmailResend, canExecuteAction }) {
	const loggedUser = useSelector(state => state.authentication.user)
	const [ canEdit, setCanEdit ] = useState(false)
	const [ canDelete, setCanDelete ] = useState(false)
	const [ canResend, setCanResend ] = useState(false)
	const [ permissions, setPermissions ] = useState([])

	const evaluatePermissions = async () => {
		const editable = await canExecuteAction('editAccess')
		const deleteable = await canExecuteAction('deleteUser')
		const resendable = await canExecuteAction('resendUserInvite')
		setCanEdit(editable)
		setCanDelete(deleteable)
		setCanResend(resendable && !user.name && !user.lastName)
		setPermissions([ resendable && !user.name && !user.lastName, deleteable ])
	}
	useEffect(() => {
		evaluatePermissions()
	}, [])

	return (
		<tr style={{ height: '70px' }}>
			<td>{user.name ? user.name : '-'} </td>
			<td>{user.lastName ? user.lastName : '-'} </td>
			<td>{user.email}</td>
			{canEdit && <td><Link to={`/establecimientos/${company}/usuarios/${user.id}`}>Ver accesos</Link></td>}
			{permissions.some(permission => permission === true) && <td>
				<div className="dropdown">
					{user.id !== loggedUser.id &&
					<>
						<button className="btn btn-white dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
							···
						</button>
						<div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
							{canDelete && <a className="dropdown-item warning" onClick={() => onUserDelete(user)}>Eliminar</a>}
							{canResend && <a className="dropdown-item warning" onClick={() => onEmailResend(user)}>Reenviar invitación</a>}
						</div>
					</>
					}
				</div>
			</td>}
		</tr>
	)
}

UserItem.propTypes = {
	company: PropTypes.string,
	user: PropTypes.object,
	onUserEdit: PropTypes.func,
	onUserDelete: PropTypes.func,
	onEmailResend: PropTypes.func,
	canExecuteAction: PropTypes.func,
}

function UsersTable({ company, users, token, limit, callbacks }){
	return (
		<div className="col-12">
			<div className="row">
				<div className="col-12 custom-table">
					<div className="table-responsive">
						<table className="table">
							<thead>
								<tr>
									<th scope="col">Nombre</th>
									<th scope="col">Apellido</th>
									<th scope="col">Email</th>
								</tr>
							</thead>
							<tbody>
								{users.map(user => <UserItem key={user.id} company={company} user={user} {...callbacks}/> )}
							</tbody>
						</table>
					</div>
					{ token && users.length >= limit &&
						<div className="row justify-content-center more">
							<div className="col-12 text-center">
								<button onClick={() => callbacks.fetchMore(token)} className="btn btn-lightblue">Mostrar más</button>
							</div>
						</div>
					}
				</div>
			</div>
		</div>
	)
	
}

UsersTable.propTypes = {
	users: PropTypes.array,
	company: PropTypes.object,
	token: PropTypes.string,
	loadMore: PropTypes.func,
	callbacks: PropTypes.object,
	limit: PropTypes.number,
}

function UsersResults({ company }) {
	const { hasPermissionInCompany } = usePermissionManager()
	const notyf = useContext(NotyfContext)
	const [ limit ] = useState(100)
	const [ users, setUsers ] = useState([])
	const { data, fetchMore } = useQuery(GET_USERS, { variables: { company }, fetchPolicy: 'network-only' })
	const [ showCreateUserModal, setShowCreateUserModal ] = useState(false)
	const [ selectedUser, setSelectedUser ] = useState(null)
	const [ loading, setLoading ] = useState(true)
	const history = useHistory()

	const [ canCreateUser, setCreateUser ] = useState(false)

	const evaluatePermissions = async () => {
		const createUser = await hasPermissionInCompany({ company, permission: 'createUser' })
		setCreateUser(createUser)
	}

	useEffect(() => {
		evaluatePermissions()
	}, [])
	
	useEffect(() => {
		if (data && data.User) {
			setLoading(false)
			setUsers(data.User.users.results)
		}
	}, [ data ])

	const redirect = ({ id }) => history.push(`/establecimientos/${company}/usuarios/${id}`)

	const [ deleteUser ] = useMutation(DELETE_USER, {
		onCompleted: () => {
			setUsers(users.filter(user => user.id !== selectedUser))
			notyf.open({
				type: 'success',
				message: 'El usuario ha sido eliminado exitosamente',
			})
			setSelectedUser(null)
		},
		onError: () => {
			notyf.open({
				type: 'error',
				message: 'Se presentó un problema eliminando el usuario. Intenta de nuevo más tarde',
			})
			setSelectedUser(null)
		},
	})

	const [ resendEmail ] = useMutation(RESEND_EMAIL, {
		onCompleted: () => {
			notyf.open({
				type: 'success',
				message: 'Se ha reenviado el correo de invitación',
			})
		},
		onError: () => {
			notyf.open({
				type: 'error',
				message: 'Se presentó un error reenviando el correo. Intenta de nuevo más tarde',
			})
		},
	})

	const callbacks = {
		onUserDelete: async ({ id, name, lastName, email }) => {
			const value = await swal({
				text: `¿Seguro que deseas eliminar el usuario ${name && lastName ? `${name} ${lastName}` : email}?`,
				dangerMode: true,
				buttons: {
					confirm: 'Si',
					cancel: 'No',
				},
			})
			if (value) {
				setSelectedUser(id)
				deleteUser({ variables:{ id, company } })
			}
		},
		onEmailResend:({ email }) => {
			resendEmail({ variables:{ email } })
		},
		canExecuteAction: (permission) => hasPermissionInCompany({ company, permission }),
		fetchMore: (token) => {
			fetchMore({
				query: GET_USERS,
				variables: { token },
				updateQuery: (previousResult, { fetchMoreResult }) => {
					return {
						User: {
							...previousResult.User,
							users: {
								...previousResult.User.users,
								token: fetchMoreResult.User.users.token,
								results: [
									...previousResult.User.users.results,
									...fetchMoreResult.User.users.results,
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
								{canCreateUser && <button className="btn btn-primary float-right" onClick={() => setShowCreateUserModal(true)}>Vincular nuevo usuario</button>}
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
				{ !loading && data.User && users.length === 0 &&
					<div className="row px-3 mt-4 mt-lg-0">
						<EmptyContent callbacks={callbacks} />
					</div>
				}
				{ !loading && data.User && users.length > 0 &&
					<div className="row">
						<UsersTable company={company} users={users} limit={limit} token={data.User.users.token} callbacks={callbacks}/>
					</div>
				}
			</div>
			{canCreateUser && <CreateUserModal visible={showCreateUserModal} setVisible={setShowCreateUserModal} company={company} onUserCreated={redirect}/>}
		</React.Fragment>
	)
}

UsersResults.propTypes = {
	company: PropTypes.string,
}

export default UsersResults