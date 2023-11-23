import React, { useState, useEffect, useContext } from 'react'
import PropTypes from 'prop-types'
import { useDispatch } from 'react-redux'
import ContentLoader from 'react-content-loader'
import swal from 'sweetalert'
import moment from 'moment'
import { useQuery, useMutation } from 'react-apollo'

import { SET_NAVBAR_PROPERTIES, SET_SIDEBAR_PROPERTIES } from '../../../Redux/Actions'
import { usePermissionManager, NotyfContext } from '../../Common'
import { CreateKeyModal, EditKeyModal } from './Modals'
import { GET_KEYS, ENABLE_KEY, DISABLE_KEY, DELETE_KEY } from './GraphQL'
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
					<h5 className="text-center">NO HAS AÑADIDO NINGUNA CREDENCIAL</h5>
					<p className="text-center">Usa éste modulo, Haz click para agregar <br className="d-none d-lg-block"></br>una nueva credencial al sistema</p>
				</div>
			</div>
		</div>
	)
}

function KeyItem({ keyItem, onKeyEdit, onKeyDelete, onKeyEnable, onKeyDisable, canExecuteAction }) {
	const [ canEdit, setCanEdit ] = useState(false)
	const [ canDelete, setCanDelete ] = useState(false)
	const [ canEnableDisable, setCanEnableDisable ] = useState(false)
	const [ permissions, setPermissions ] = useState([])

	const evaluatePermissions = async () => {
		const editable = await canExecuteAction('editKey')
		const deleteable = await canExecuteAction('deleteKey')
		const enableDisable = await canExecuteAction('enableDisableKey')
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
			<td>{!keyItem.active ? 'Deshabilitada' : ''}</td>
			<td>{keyItem.name}</td>
			<td>{keyItem.tags.map(tag => <div key={tag} className="badge badge-secondary">{tag}</div>)}</td>
			<td>{moment(keyItem.createdAt).format('DD/MMM/YYYY')}</td>
			{permissions.some(permission => permission === true) && <td>
				<div className="dropdown">
					<button className="btn btn-white dropdown-toggle" type="button" id="dropdownMenuButton" data-toggle="dropdown" aria-haspopup="true" aria-expanded="false">
							···
					</button>
					<div className="dropdown-menu" aria-labelledby="dropdownMenuButton">
						{canEnableDisable && !keyItem.active && <a className="dropdown-item" onClick={() => onKeyEnable(keyItem)}>Habilitar</a>}
						{canEnableDisable && keyItem.active && <a className="dropdown-item" onClick={() => onKeyDisable(keyItem)}>Deshabilitar</a>}
						{canEdit && <a className="dropdown-item" onClick={() => onKeyEdit(keyItem)}>Editar</a>}
						{canDelete && <a className="dropdown-item warning" onClick={() => onKeyDelete(keyItem)}>Eliminar</a>}
					</div>
				</div>
			</td>
			}
		</tr>
	)
}

KeyItem.propTypes = {
	keyItem: PropTypes.object,
	onKeyEdit: PropTypes.func,
	onKeyEnable: PropTypes.func,
	onKeyDisable: PropTypes.func,
	onKeyDelete: PropTypes.func,
	canExecuteAction: PropTypes.func,
}

function KeysTable({ keys, token, limit, callbacks }) {
	return (
		<div className="col-12 custom-table">
			<div className="table-responsive">
				<table className="table">
					<thead>
						<tr>
							<th scope="col"></th>
							<th scope="col">Nombre</th>
							<th scope="col">Tags</th>
							<th scope="col">Fecha de creación</th>
							<th scope="col">···</th>
						</tr>
					</thead>
					<tbody>
						{keys.map(key => <KeyItem key={key.id} keyItem={key} {...callbacks} />)}
					</tbody>
				</table>
			</div>
			{ token && keys.length >= limit &&
				<div className="row justify-content-center more">
					<div className="col-12 text-center">
						<button onClick={() => callbacks.fetchMore(token)} className="btn btn-lightblue">Mostrar más</button>
					</div>
				</div>
			}
		</div>
	)
}

KeysTable.propTypes = {
	keys: PropTypes.array,
	token: PropTypes.string,
	callbacks: PropTypes.object,
	limit: PropTypes.number,
}

function Keys({ company, location }) {
	const { hasPermissionInLocation } = usePermissionManager()
	const dispatch = useDispatch()
	const notyf = useContext(NotyfContext)
	const [ limit ] = useState(100)
	const [ keys, setKeys ] = useState([])
	const { data, fetchMore } = useQuery(GET_KEYS, { variables: { location } })
	const [ showCreateKeyModal, setShowCreateKeyModal ] = useState(false)
	const [ selectedKey, setSelectedKey ] = useState(null)
	const [ showEditKeyModal, setShowEditKeyModal ] = useState(false)
	const [ loading, setLoading ] = useState(true)
	const [ inputSearch, setInputSearch ] = useState('')

	const [ canEditKey, setCanEditKey ] = useState(false)
	const [ canCreateKey, setCanCreateKey ] = useState(false)

	const evaluatePermissions = async () => {
		const editKey = await hasPermissionInLocation({ location, permission: 'editKey' })
		const createKey = await hasPermissionInLocation({ location, permission: 'createKey' })
		setCanEditKey(editKey)
		setCanCreateKey(createKey)
	}
	
	useEffect(() => {
		dispatch({ type: SET_NAVBAR_PROPERTIES, visibility: true })
		dispatch({ type: SET_SIDEBAR_PROPERTIES, visibility: true })
		evaluatePermissions()
	}, [])

	useEffect(() => {
		if (data && data.Key) {
			setLoading(false)
			setKeys(data.Key.keys.results)
		}
	}, [ data ])

	const appendKey = (key) => {
		setKeys([ ...keys, { ...key, active: true } ])
		const link = document.createElement('a')
		link.href = `data:text;base64,${Buffer.from(`nombre: ${key.name}\ntoken: ${key.token}\nsecret: ${key.secret}`).toString('base64')}`
		link.style = 'display:none'
		link.download = `credenciales-${key.name}-${moment().format('DD/MMM/YYYY')}.txt`
		link.target = '_blank'
		link.click()
	}

	const updateKey = (key) => {
		const index = keys.map(key => key.id).indexOf(key.id)
		setKeys([ ...keys.slice(0, index), key,...keys.slice( index + 1) ])
	}

	const [ deleteKey ] = useMutation(DELETE_KEY, {
		onCompleted: () => {
			setKeys(keys.filter(key => key.id !== selectedKey))
			notyf.open({
				type: 'success',
				message: 'La credencial ha sido eliminada exitosamente',
			})
			setSelectedKey(null)
		},
		onError: () => {
			notyf.open({
				type: 'error',
				message: 'Se presentó un problema eliminando la credencial. Intenta de nuevo más tarde',
			})
			setSelectedKey(null)
		},
	})

	const [ enableKey ] = useMutation(ENABLE_KEY, {
		onCompleted: (data) => {
			updateKey(data.Key.enableKey)
			notyf.open({
				type: 'success',
				message: 'La credencial ha sido habilitada',
			})
			setSelectedKey(null)
		},
		onError: () => {
			notyf.open({
				type: 'error',
				message: 'Se presentó un problema habilitando la credencial. Intenta de nuevo más tarde',
			})
			setSelectedKey(null)
		},
	})

	const [ disableKey ] = useMutation(DISABLE_KEY, {
		onCompleted: (data) => {
			updateKey(data.Key.disableKey)
			notyf.open({
				type: 'success',
				message: 'La credencial ha sido deshabilitada',
			})
			setSelectedKey(null)
		},
		onError: () => {
			notyf.open({
				type: 'error',
				message: 'Se presentó un problema deshabilitando la credencial. Intenta de nuevo más tarde',
			})
			setSelectedKey(null)
		},
	})
	const callbacks = {
		onKeyEdit: ({ id }) => {
			setSelectedKey(id)
			setShowEditKeyModal(true)
		},
		onKeyDelete: async ({ id, name }) => {
			const value = await swal({
				text: `¿Seguro que deseas eliminar la credencial ${name}?`,
				dangerMode: true,
				buttons: {
					confirm: 'Si',
					cancel: 'No',
				},
			})	
			if (value) {
				setSelectedKey(id)
				deleteKey({ variables: { id } })
			}
		},
		onKeyEnable: async({ id }) => {
			enableKey({ variables: { id } })
		},
		onKeyDisable: async({ id }) => {
			disableKey({ variables: { id } })
		},
		canExecuteAction: (permission) => hasPermissionInLocation({ location, permission }),
		fetchMore: (token) => {
			fetchMore({
				query: GET_KEYS,
				variables: { token },
				updateQuery: (previousResult, { fetchMoreResult }) => {
					return {
						Key: {
							...previousResult.Key,
							keys: {
								...previousResult.Key.keys,
								token: fetchMoreResult.Key.keys.token,
								results: [
									...previousResult.Key.keys.results,
									...fetchMoreResult.Key.keys.results,
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
					<div className="col-12 col-md-4">
					</div>
					<div className="col-md-4">
						{!loading && data.Key && keys.length > 0 && 
							<input className="form-control" placeholder="Buscar credenciales por nombre o tag" value={inputSearch} onChange={e => {
								const text = e.target.value
								setInputSearch(text)
							}}/>
						}
					</div>
					<div className="col-6 col-md-4 btn-options">
						<div className="row justify-content-end">
							<div className="col-6 col-md-6 btn-options">
								{canCreateKey && <button className="btn btn-primary float-right" onClick={() => setShowCreateKeyModal(true)}>Agregar credencial</button>}
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
					!loading && data.Key && keys.length === 0 &&
					<div className="row px-3 mt-3 mt-lg-0">
						<EmptyContent />
					</div>
				}
				{
					!loading && data.Key && keys.length > 0 &&
					<div className="row">
						<KeysTable keys={inputSearch ? keys.filter(k => k.name.toLowerCase().includes(inputSearch.toLowerCase()) || k.tags.map(t => t.toLowerCase()).find(t => t.includes(inputSearch.toLowerCase()))) : keys} limit={limit} token={data.Key.keys.token} callbacks={callbacks} />
					</div>
				}
			</div>
			{canCreateKey && <CreateKeyModal visible={showCreateKeyModal} setVisible={setShowCreateKeyModal} company={company} location={location} onKeyCreated={appendKey} />}
			{canEditKey && <EditKeyModal visible={showEditKeyModal} setVisible={setShowEditKeyModal} keyId={selectedKey} onKeyUpdated={updateKey} />}
		</React.Fragment>
	)
}

Keys.propTypes = {
	location: PropTypes.string,
	company: PropTypes.string,
}

export default Keys
