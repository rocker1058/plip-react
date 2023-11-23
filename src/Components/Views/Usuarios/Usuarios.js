import React, { useState, useEffect, useContext } from 'react'
import PropTypes from 'prop-types'
import { useDispatch } from 'react-redux'
import ContentLoader from 'react-content-loader'
import { useQuery, useMutation } from 'react-apollo'

import { SET_NAVBAR_PROPERTIES, SET_SIDEBAR_PROPERTIES } from '../../../Redux/Actions'
import { RangeFormatter, usePermissionManager, NotyfContext } from '../../Common'
import { GET_MOBILE_USERS, ENABLE_MOBILE_USER, DISABLE_MOBILE_USER } from './GraphQL'
import { VerifyUserModal } from './Modals'
import establecimientoIcon from '../../../Assets/img/mobile-icon.svg'
import emptyImage from '../../../Assets/img/noResultIcon.svg'

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
					<h5 className="text-center">NINGÚN USUARIO SE HA REGISTRADO</h5>
				</div>
			</div>
		</div>
	)
}

function UserItem({ user, onUserDisable, onUserEnable, canExecuteAction }){
	const [ canEnableDisable, setCanEnableDisable ] = useState(false)

	const permissions = [ canEnableDisable ]
	const report = RangeFormatter.formatLength(user.report ? user.report.paperSaved : 0)

	const verifyPermission = async () => {
		const permission = await canExecuteAction('enableDisablePliPUser')
		setCanEnableDisable(permission)
	}
	
	useEffect(() => {
		verifyPermission()
	}, [])

	return (
		<tr style={{ height: '70px' }}>
			<td className="success">{user.enabled ? '' : 'Deshabilitado'}</td>
			<td>{user.name}</td>
			<td>{user.email}</td>
			<td>{user.report ? user.report.points : 0}</td>
			<td>{report.number} {report.unit}</td>
			{permissions.some(permission => permission === true) && <td>
				<div className="dropdown">
					<button className="btn btn-white dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
							···
					</button>
					<div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
						{user.enabled && <a className="dropdown-item" onClick={() => onUserDisable(user)}>Deshabilitar</a>}
						{!user.enabled && <a className="dropdown-item" onClick={() => onUserEnable(user)}>Habilitar</a>}
					</div>
				</div>
			</td>
			}
		</tr>
	)
}

UserItem.propTypes = {
	user: PropTypes.object,
	onUserDisable: PropTypes.func,
	onUserEnable: PropTypes.func,
	canExecuteAction: PropTypes.func,
}

function UsersTable({ users, token, limit = 50, callbacks }) {
	return (
		<div className="col-12 custom-table">
			<div className="table-responsive">
				<table className="table">
					<thead>
						<tr>
							<th scope="col"></th>
							<th scope="col">Nombre</th>
							<th scope="col">Email</th>
							<th scope="col">Puntos plip</th>
							<th scope="col">Papel ahorrado</th>
						</tr>
					</thead>
					<tbody>
						{users.map(user => <UserItem key={user.id} user={user} {...callbacks}/>)}
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
	)
}

UsersTable.propTypes = {
	users: PropTypes.array,
	token: PropTypes.string,
	loadMore: PropTypes.func,
	callbacks: PropTypes.object,
	limit: PropTypes.number,
}

function Users() {
	const { hasPermissionInCompany } = usePermissionManager()
	const notyf = useContext(NotyfContext)
	const [ users, setUsers ] = useState([])
	const [ selectedUser, setSelectedUser ] = useState(null)
	const [ inputSearch, setInputSearch ] = useState('')
	const [ searchTimeout, setSearchTimeout ] = useState(null)
	const [ search, setSearch ] = useState(null)
	const [ showVerifyUserModal, setShowVerifyUserModal ] = useState(false)
	const [ limit ] = useState(60)
	const [ loading, setLoading ] = useState(true)
	const dispatch = useDispatch()
	const { data, fetchMore } = useQuery(GET_MOBILE_USERS, { variables: { limit, sortBy: 'name', ...(search ? { filter: { search } } : {}) } })

	useEffect(() => {
		dispatch({ type: SET_NAVBAR_PROPERTIES, visibility: true })
		dispatch({ type: SET_SIDEBAR_PROPERTIES, visibility: true })
	}, [])

	useEffect(() => {
		if (data && data.User) {
			setLoading(false)
			setUsers(data.User.mobileUsers.results)
		}
	}, [ data ])

	const updateUser = (user) => {
		const index = users.map(user => user.id).indexOf(user.id)
		setUsers([ ...users.slice(0, index), user,...users.slice( index + 1) ])
	}

	const [ enableUser ] = useMutation(ENABLE_MOBILE_USER, {
		onCompleted: () => {
			updateUser({ ...selectedUser, enabled: true })
			notyf.open({
				type: 'success',
				message: 'El usuario ha sido habilitado',
			})
			setSelectedUser(null)
		},
		onError: () => {
			notyf.open({
				type: 'error',
				message: 'Se presentó un problema habilitando el usuario. Intenta de nuevo más tarde',
			})
		},
	})

	const [ disableUser ] = useMutation(DISABLE_MOBILE_USER, {
		onCompleted: () => {
			updateUser({ ...selectedUser, enabled: false })
			notyf.open({
				type: 'success',
				message: 'La credencial ha sido deshabilitada',
			})
			setSelectedUser(null)
		},
		onError: () => {
			notyf.open({
				type: 'error',
				message: 'Se presentó un problema deshabilitando la credencial. Intenta de nuevo más tarde',
			})
		},
	})

	const callbacks = {
		onUserEnable: async(user) => {
			setSelectedUser(user)
			enableUser({ variables: { id: user.id } })
		},
		onUserDisable: async(user) => {
			setSelectedUser(user)
			disableUser({ variables: { id: user.id } })
		},
		canExecuteAction: (permission) => hasPermissionInCompany({ company: 'PliP',  permission }),
		fetchMore: (token) => {
			fetchMore({
				query: GET_MOBILE_USERS,
				variables: { token },
				updateQuery: (previousResult, { fetchMoreResult }) => {
					return {
						User: {
							...previousResult.User,
							mobileUsers: {
								...previousResult.User.mobileUsers,
								token: fetchMoreResult.User.mobileUsers.token,
								results: [
									...previousResult.User.mobileUsers.results,
									...fetchMoreResult.User.mobileUsers.results,
								],
							},
						},
					}
				},
			})
		},
	}
	
	const onVerifyUser = () => {
		setShowVerifyUserModal(false)
	}
	return (
		<React.Fragment>
			<div className="col-12 my-3">
				<div className="row mt-lg-4 justify-content-start">
					<div className="col-12 col-md-4">
						<div className="row">
							<img className="pageIcon" src={establecimientoIcon} />
							<h1>Usuarios app</h1>
						</div>
					</div>
					<div className="col-md-4">
						<input className="form-control" placeholder="Ingresa tu criterio de búsqueda" value={inputSearch} onChange={e => {
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
					<div className="col-md-4 text-right">
						<button className="btn btn-outline-primary mr-2" onClick={() => setShowVerifyUserModal(true)}>Verificar usuario</button>
						{showVerifyUserModal && <VerifyUserModal visible={showVerifyUserModal} setVisible={setShowVerifyUserModal} onVerifyUser={onVerifyUser}/>}

					</div>
				</div>
			</div>
			<div className="col-12">
				{
					loading &&
					<div className="row">
						<div className="col-12">
							<ListLoader style={{ height: '100%', width: '100%' }} />
						</div>
					</div>
				}
				{
					!loading && data.User && users.length === 0 &&
					<div className="row px-3 mt-3 mt-lg-0">
						<EmptyContent />
					</div>
				}
				{
					!loading && data.User && users.length > 0 &&
					<div className="row">
						<UsersTable users={users} limit={50} token={data.User.mobileUsers.token} callbacks={callbacks} />
					</div>
				}
			</div>
		</React.Fragment>
	)
}

export default Users
