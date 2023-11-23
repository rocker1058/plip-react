import React, { useState, useEffect, useContext } from 'react'
import { useQuery, useMutation } from 'react-apollo'
import PropTypes from 'prop-types'
import { isEmail } from 'validator'

import { CustomForm, useModal, NotyfContext, Checkbox, useLocations, usePermissionManager, useBusinessLines, useCompanies } from '../../../Common'

import { UPDATE_USER_ACCESS, GET_ROLES, GET_PERMISSIONS, CREATE_USER } from '../GraphQL'

const categoryDict = {
	plip: 'PliP',
	company: 'Establecimiento',
	businessLine: 'Línea de negocio',
	location: 'Sucursal',
}

function PermissionsSection({ selectedPermissions = [], disabledPermissions=[], includeGlobal, type, onChange, company, reset }) {
	const { data } = useQuery(GET_PERMISSIONS, { variables: { filter: { includeGlobal, company } } })
	
	useEffect(() => {
		reset()
	}, [ type ])

	const typeCondition = (permission) => {
		if (type === 'plip') {
			return [ 'plip', 'company', 'businessLine', 'location' ].includes(permission.type)
		}
		else if (type === 'company') {
			return [ 'company', 'businessLine', 'location' ].includes(permission.type)
		}
		else if (type === 'businessLine') {
			return [ 'businessLine', 'location' ].includes(permission.type)
		}
		return permission.type === 'location'
	}

	let groups = null
	if (data) {
		groups = data.Access.permissions.results.reduce((acc, p) => {
			if (acc[p.type]) {
				acc[p.type] = {
					...acc[p.type],
					permissions: [ ...acc[p.type].permissions, p ],
				}
			}
			else {
				acc[p.type] = {
					name: p.type,
					permissions: [ p ],
				}
			}
			return acc
		}, {})
	}
	return (
		<div className='row'>
			{groups && [ 'plip', 'company', 'businessLine', 'location' ].map((g) => {
				if (groups[g] && groups[g].permissions && groups[g].permissions.filter(typeCondition).length > 0) {
					return (	<>
						<h3 className="col-12">{categoryDict[g]}</h3>
						{groups[g].permissions.filter(typeCondition).map((permission, i) => <Checkbox key={permission.id} name={`permissions.${i}`} checked={selectedPermissions.includes(permission.id)} value={permission.id} text={permission.friendlyName} description={permission.description} onChange={onChange} disabled={disabledPermissions.includes(permission.id)}/>)}
					</>)
				}
				return null
			})}
		</div>
	)
}

PermissionsSection.propTypes = {
	selectedPermissions: PropTypes.array,
	disabledPermissions: PropTypes.array,
	includeGlobal: PropTypes.bool,
	onChange: PropTypes.func,
	company: PropTypes.string,
	type: PropTypes.string,
	reset: PropTypes.func,
}

function RolesSection({ selectedRoles = [], company, includeGlobal, type, onChange, reset }) {
	const { data } = useQuery(GET_ROLES, { variables: { filter: { company, includeGlobal } } })
	const onRoleChange = (e) => onChange({
		id: e.target.value,
		checked: e.target.checked,
		permissions: data.Access.roles.results.find(role => role.id === e.target.value).permissions.map(permission => permission.id),
	})

	useEffect(() => {
		reset()
	}, [ type ])

	const typeCondition = (role) => {
		if (type === 'plip') {
			return [ 'plip', 'company' ].includes(role.type)
		}
		else if (type === 'company') {
			return [ 'company' ].includes(role.type)
		}
		else if (type === 'businessLine') {
			return [ 'businessLine' ].includes(role.type)
		}
		return role.type === 'location'
	}
	return (
		<div className='row'>
			{data && data.Access.roles.results.filter(typeCondition).map((role, i) => <Checkbox key={role.id} name={`roles.${i}`} checked={selectedRoles.includes(role.id)} value={role.id} text={role.friendlyName} description={role.description} onChange={onRoleChange}/>)}
		</div>
	)
}

RolesSection.propTypes = {
	selectedRoles: PropTypes.array,
	company: PropTypes.string,
	includeGlobal: PropTypes.bool,
	onChange: PropTypes.func,
	type: PropTypes.string,
	reset: PropTypes.func,
}

function CreateUserModal({ visible, setVisible, company, onUserCreated }){
	const isPliP = company === 'PliP'

	const notyf = useContext(NotyfContext)
	const { distinctBusinessLines, distinctLocations: getDistincLocations } = usePermissionManager()
	const [ plipCompany, setPliPCompany ] = useState('*')

	const distinctLines = distinctBusinessLines(isPliP ? plipCompany : company)
	
	const [ businessLine, setBusinessLine ] = useState('*')
	const [ location, setLocation ] = useState('*')
	const [ email, setEmail ] = useState(null)

	const distinctLocations = getDistincLocations(isPliP ? plipCompany : company, businessLine)

	const companies = useCompanies()
	const businessLines = useBusinessLines(isPliP ? plipCompany : company).filter(bl => distinctLines.includes(bl.id) || distinctLines.includes('*'))
	const locations = useLocations(businessLine).filter(loc => distinctLocations.includes(loc.id) || distinctLines.includes('*'))
	
	const [ roles, setRoles ] = useState([])
	const [ disabledPermissions, setDisabledPermissions ] = useState([])
	const [ selectedRolesPermissions, setSelectedRolePermissions ] = useState([])
	const [ permissions, setPermissions ] = useState([])
	const [ errors, setErrors ] = useState({})

	const resetModal = () => {
		setErrors({})
		setPliPCompany('*')
		setBusinessLine('*')
		setLocation('*')
		setRoles([])
		setPermissions([])
		setSelectedRolePermissions([])
		setSelectedRolePermissions([])
	}

	const { Modal, hide } = useModal({ identifier: 'createUserModal', visible, setVisible, clean: resetModal })

	useEffect(() => {
		if (permissions.length + roles.length === 0) {
			setErrors({ ...errors, access: 'Debes seleccionar al menos un permiso o rol de usuario' })
		}
		else {
			const { access, ...newErrors } = errors
			setErrors(newErrors)
		}
	}, [ permissions, roles ])

	useEffect(() => {
		if (email === '' || (email !== null && !isEmail(email))) {
			setErrors({ ...errors, email: 'Debes ingresar un email válido' })
		}
		else {
			const { email, ...newErrors } = errors
			setErrors(newErrors)
		}
	}, [ email ])

	const [ addUser ] = useMutation(CREATE_USER, {
		onCompleted: (data) => {
			updateUser({ 
				variables: {
					user: data.User.createUser.id,
					type: isPliP ? 'PliP' : 'Company',
					access: {
						company: isPliP ? plipCompany : company,
						businessLine,
						location,
						roles,
						permissions: permissions.filter(p => !selectedRolesPermissions.includes(p)),
					},
				},
			})
		},
		onError: () => {
			setLoadingButton(false)
			hide(true)
			notyf.open({
				type: 'error',
				message: 'Error al crear nuevo usuario. Intenta de nuevo más tarde',
			})
		},
	})

	const [ updateUser ] = useMutation(UPDATE_USER_ACCESS, {
		onCompleted: (data) => {
			setLoadingButton(false)
			hide()
			notyf.open({
				type: 'success',
				message: 'El usuario ha sido creado exitosamente',
			})
			onUserCreated(data.Access.assignAccessToUser)
		},
		onError: () => {
			setLoadingButton(false)
			notyf.open({
				type: 'error',
				message: 'Se presentó un error. Intenta de nuevo más tarde',
			})
		},
	})

	const [ loadingButton, setLoadingButton ] = useState(false)

	const onPliPCompanySelected = e => {
		setPliPCompany(e.target.value)
		setBusinessLine('*')
		setLocation('*')
	}

	const onBusinessLineSelected = e => {
		setLocation('*')
		setBusinessLine(e.target.value)
	}

	const onLocationSelected = e => {
		setLocation(e.target.value)
	}

	const resetCheckboxes = () => {
		setRoles([])
		setPermissions([])
		setSelectedRolePermissions([])
		setSelectedRolePermissions([])
		setDisabledPermissions([])
	}

	const onPermissionChange = (e) => {
		if (e.target.checked) {
			setPermissions([ ...permissions, e.target.value ])
		}
		else {
			setPermissions(permissions.filter(permission => permission !== e.target.value))
		}
	}

	const onRoleChange = ({ id, checked, permissions: rolePermissions = [] }) => {
		const removeFirstOccurrence = (array, permission) => {
			var index = array.indexOf(permission)
			if (index === -1) {
				return array
			}
			return array.slice(0, index).concat(array.slice(index + 1, array.length))
		}
		if (checked) {
			setRoles([ ...roles, id ])
			setDisabledPermissions([ ...disabledPermissions, ...rolePermissions ])
			setPermissions([ ...permissions, ...rolePermissions ])
			setSelectedRolePermissions([ ...selectedRolesPermissions, ...rolePermissions ])
		}
		else {
			setRoles(roles.filter(role => role !== id))
			setDisabledPermissions(rolePermissions.reduce((acc, permission) => removeFirstOccurrence(acc, permission), disabledPermissions))
			setPermissions(rolePermissions.reduce((acc, permission) => removeFirstOccurrence(acc, permission), permissions))
			setSelectedRolePermissions(rolePermissions.reduce((acc, permission) => removeFirstOccurrence(acc, permission), selectedRolesPermissions))
		}
	}

	const onSubmit = (e) => {
		e.preventDefault()
		setLoadingButton(true)
		addUser({
			variables: {
				email,
			},
		})
	}

	const getType = () => {
		if (isPliP && plipCompany === '*') {
			return 'plip'
		}
		if (businessLine === '*') {
			return 'company'
		}
		else if (businessLine !== '*' && location === '*') {
			return 'businessLine'
		}
		else if (businessLine !== '*' && location !== '*') {
			return 'location'
		}
	}

	return (
		<Modal>
			<form className="container" onSubmit={onSubmit}>
				<div className="row">
					<h2 className=" col-12 text-center">Vincular nuevo usuario</h2>
				</div>
				<div className="row justify-content-center mb-2">
					<div className="col-10">
						<span>Si el usuario no cuenta con una cuenta PliP existente, recibirá un correo con las instrucciones para confirmar su cuenta. En el caso que ya tenga una cuenta, los permisos seleccionados se verán reflejados de inmediato</span>
					</div>
				</div>
				<div className="row mb-2">
					<div className="col-sm-6 col-lg-6 col-6">
						<label className="col-form-label text-sm-left" htmlFor="inputName">Email</label>
						<input
							className="form-control"
							name="name"
							value={email || ''}
							onChange={e => setEmail(e.target.value)}
							required
						/>
						{errors.email && <span style={{ color: 'red' }}>{errors.email}</span>}
					</div>
					{ isPliP && 
						<div className='col-sm-6 col-lg-6 col-6'>
							<label className="col-form-label text-sm-left" htmlFor="location">Establecimientos</label>
							<select className="form-control" name="company" value={plipCompany} onChange={onPliPCompanySelected}>
								<option value="*">Todos los establecimientos</option>
								{companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
							</select>
						</div>
					}
					{ ((plipCompany !== '*' && isPliP) || !isPliP) && 
						<div className='col-sm-6 col-lg-6 col-6'>
							<label className="col-form-label text-sm-left" htmlFor="location">Líneas de negocio</label>
							<select className="form-control" name="businessLine" value={businessLine} onChange={onBusinessLineSelected}>
								{distinctLines.includes('*') && <option value="*">Todas las líneas de negocio</option>}
								{businessLines.map(bl => <option key={bl.id} value={bl.id}>{bl.name}</option>)}
							</select>
						</div>
					}
				</div>
				<div className="row mb-2">
					{ businessLine !== '*' && 
						<div className='col-sm-6 col-lg-6 col-6'>
							<label className="col-form-label text-sm-left" htmlFor="location">Sucursales</label>
							<select className="form-control" name="location" value={location} onChange={onLocationSelected}>
								{distinctLocations.includes('*') && <option value="*">Todas las sucursales</option>}
								{locations.map(loc => <option key={loc.id} value={loc.id}>{loc.name}</option>)}
							</select>
						</div>
					}
				</div>
				<div className="row">
					<div className='col-12'>
						<p className='line-modal'></p>
						<h2>Roles</h2>
						<RolesSection selectedRoles={roles} company={company} includeGlobal={isPliP} type={getType()} onChange={onRoleChange} reset={resetCheckboxes}/>
					</div>
					<div className='col-12'>
						<p className='line-modal'></p>
						<h2>Permisos</h2>
						<PermissionsSection selectedPermissions={permissions} disabledPermissions={disabledPermissions} includeGlobal={isPliP} type={getType()} onChange={onPermissionChange} company={company} reset={resetCheckboxes}/>
					</div>
					<div className="container-button">
						<p className='line-modal'></p>
						<CustomForm.LoadingButton loading={loadingButton} disabled={Object.keys(errors).length > 0} className="btn btn-lg btn-primary btn-block button">Crear usuario</CustomForm.LoadingButton>
					</div>
				</div>
			</form>
		</Modal>
	)
}

CreateUserModal.propTypes = {
	visible: PropTypes.bool,
	company: PropTypes.string,
	setVisible: PropTypes.func,
	onUserCreated: PropTypes.func,
}

export default CreateUserModal

