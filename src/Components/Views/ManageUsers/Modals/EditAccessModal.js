import React, { useState, useEffect, useContext } from 'react'
import { useQuery, useMutation } from 'react-apollo'
import PropTypes from 'prop-types'

import { CustomForm, useModal, useCompanies, useLocations, useBusinessLines, NotyfContext, Checkbox, usePermissionManager } from '../../../Common'

import { GET_ROLES, UPDATE_USER_ACCESS, GET_PERMISSIONS } from '../GraphQL'

const categoryDict = {
	plip: 'PliP',
	company: 'Establecimiento',
	businessLine: 'Línea de negocio',
	location: 'Sucursal',
}

function PermissionsSection({ selectedPermissions = [], disabledPermissions=[], includeGlobal, type, onChange, company }) {
	const { data } = useQuery(GET_PERMISSIONS, { variables: { filter: { includeGlobal, company } } })
	
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
}

function RolesSection({ selectedRoles = [], company, includeGlobal, type, onChange }) {
	const { data } = useQuery(GET_ROLES, { variables: { filter: { company, includeGlobal } } })
	const onRoleChange = (e) => onChange({
		id: e.target.value,
		checked: e.target.checked,
		permissions: data.Access.roles.results.find(role => role.id === e.target.value).permissions.map(permission => permission.id),
	})
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
	disabledRoles: PropTypes.array,
	company: PropTypes.string,
	includeGlobal: PropTypes.bool,
	onChange: PropTypes.func,
	type: PropTypes.string,
}

function EditUserModal({ visible, setVisible, user, company, access: userAccess, onAccessUpdated }){
	const isPliP = company === 'PliP'

	const notyf = useContext(NotyfContext)
	const { distinctBusinessLines, distinctLocations: getDistincLocations } = usePermissionManager()
	const [ plipCompany, setPliPCompany ] = useState('*')

	const distinctLines = distinctBusinessLines(isPliP ? plipCompany : company)
	
	const [ businessLine, setBusinessLine ] = useState('*')
	const [ location, setLocation ] = useState('*')

	const distinctLocations = getDistincLocations(isPliP ? plipCompany : company, businessLine)

	const companies = useCompanies()
	const businessLines = useBusinessLines(isPliP ? plipCompany : company).filter(bl => distinctLines.includes(bl.id) || distinctLines.includes('*'))
	const locations = useLocations(businessLine).filter(loc => distinctLocations.includes(loc.id) || distinctLines.includes('*'))
	
	const [ access, setAccess ] = useState(userAccess)
	const [ loadingButton, setLoadingButton ] = useState(false)
	const [ roles, setRoles ] = useState([])
	const [ disabledPermissions, setDisabledPermissions ] = useState([])
	const [ disabledRoles, setDisabledRoles ] = useState([])
	const [ selectedRolesPermissions, setSelectedRolePermissions ] = useState([])
	const [ permissions, setPermissions ] = useState([])
	const [ disabled, setDisabled ] = useState(true)

	const resetModal = () => {
		setAccess(null)
		setDisabled(true)
	}
	
	const { Modal } = useModal({ identifier: 'editUserModal', visible, setVisible, clean: resetModal })

	useEffect(() => {
		if (userAccess) {
			setAccess(userAccess)
			if (isPliP) {
				setPliPCompany(userAccess.company.id)
			}
			setBusinessLine(userAccess.businessLine.id)
			setLocation(userAccess.location.id)
			setRoles((userAccess.roles || []).map(role => role.id))
			const rolesPermissions = (userAccess.roles || []).reduce((acc, role) => [ ...acc, ...role.permissions ], []).map(permission => permission.id)
			const accessPermissions = [ ...rolesPermissions, ...(userAccess.permissions || []).map(p => p.id) ]
			setDisabledRoles([])
			setDisabledPermissions(rolesPermissions)
			setPermissions(accessPermissions)
			setSelectedRolePermissions(rolesPermissions)
		}
		else {
			setBusinessLine('*')
			setLocation('*')
			setRoles([])
			setDisabledPermissions([])
			setDisabledRoles([])
			setPermissions([])
			setSelectedRolePermissions([])
		}
	}, [ userAccess, visible ])

	useEffect(() => {
		const accessPermissions = access ? (access.permissions || []).map(permission => permission.id) : []
		const accessRoles = access ? (access.roles || []).map(role => role.id) : []
		const permissionsExist = permissions.length === accessPermissions.length && permissions.every(permission => accessPermissions.includes(permission))
		const rolesExist = roles.length === accessRoles.length && roles.every(role => accessRoles.includes(role))
		setDisabled(permissionsExist && rolesExist)
	}, [ roles, permissions ])

	const [ updateAccess ] = useMutation(UPDATE_USER_ACCESS, {
		onCompleted: () => {
			setLoadingButton(false)
			notyf.open({
				type: 'success',
				message: 'Los cambios han sido guardados exitosamente',
			})
			onAccessUpdated()
		},
		onError: () => {
			setLoadingButton(false)
			notyf.open({
				type: 'error',
				message: 'Se presentó un error. Intenta de nuevo más tarde',
			})
		},
	})

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
		updateAccess({
			variables: {
				user,
				access: {
					company: isPliP ? plipCompany: company,
					businessLine,
					location,
					roles,
					permissions: permissions.filter(p => ![ ...selectedRolesPermissions ].includes(p)),
				},
				type: access.type,
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
					<h1 className="col-12 text-center">Actualización de accesos</h1>
				</div>
				{ isPliP && 
					<div className="row mb-2">
						<div className='col-sm-6 col-lg-6 col-6'>
							<label className="col-form-label text-sm-left" htmlFor="location">Establecimientos</label>
							<select className="form-control" name="company" value={plipCompany} disabled>
								<option value="*">Todos los establecimientos</option>
								{companies.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
							</select>
						</div>
						{ ((plipCompany !== '*' && isPliP) || !isPliP) && 
							<div className='col-sm-6 col-lg-6 col-6'>
								<label className="col-form-label text-sm-left" htmlFor="location">Líneas de negocio</label>
								<select className="form-control" name="businessLine" value={businessLine} disabled>
									{distinctLines.includes('*') && <option value="*">Todas las líneas de negocio</option>}
									{businessLines.map(bl => <option key={bl.id} value={bl.id}>{bl.name}</option>)}
								</select>
							</div>
						}
					</div>
				}
				<div className="row mb-2">
					{ businessLine !== '*' && 
						<div className='col-sm-6 col-lg-6 col-6'>
							<label className="col-form-label text-sm-left" htmlFor="location">Sucursales</label>
							<select className="form-control" name="location" value={location} disabled>
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
						<RolesSection selectedRoles={roles} company={company} type={getType()} disabledRoles={disabledRoles} includeGlobal={isPliP} onChange={onRoleChange}/>
					</div>
					<div className='col-12'>
						<p className='line-modal'></p>
						<h2>Permisos</h2>
						<PermissionsSection selectedPermissions={permissions} company={company} type={getType()} disabledPermissions={disabledPermissions} includeGlobal={isPliP} onChange={onPermissionChange}/>
					</div>
					<div className="container-button">
						<p className='line-modal'></p>
						<CustomForm.LoadingButton loading={loadingButton} disabled={disabled} className="btn btn-lg btn-primary btn-block button">Actualizar acceso</CustomForm.LoadingButton>
					</div>
				</div>
			</form>
		</Modal>
	)
}

EditUserModal.propTypes = {
	access: PropTypes.object,
	user: PropTypes.string,
	visible: PropTypes.bool,
	setVisible: PropTypes.func,
	company: PropTypes.string,
	onAccessUpdated: PropTypes.func,
}

export default EditUserModal
