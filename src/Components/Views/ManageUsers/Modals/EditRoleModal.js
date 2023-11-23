import React, { useState, useEffect, useContext } from 'react'
import { useQuery, useMutation } from 'react-apollo'
import PropTypes from 'prop-types'

import { CustomForm, Checkbox, useModal, NotyfContext } from '../../../Common'
import { GET_PERMISSIONS, GET_ROLE, UPDATE_ROLE } from '../GraphQL'

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
		if (type === 'company') {
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

function EditRoleModal({ visible, setVisible, roleId, onRoleUpdated, company }){

	const notyf = useContext(NotyfContext)

	const [ loadingButton, setLoadingButton ] = useState(false)

	const [ errors, setErrors ] = useState({})

	const [ name, setName ] = useState(null)

	const [ description, setDescription ] = useState(null)

	const [ type, setType ] = useState('company')

	const [ permissions, setPermissions ] = useState([])

	const { data } = useQuery(GET_ROLE, { variables: { id: roleId }, skip: !roleId })

	const resetModal = () => {
		setErrors({})
		setName(null)
		setDescription(null)
		setType('global')
		setPermissions([])
	}

	useEffect(() => {
		if (data && data.Access) {
			setName(data.Access.role.name)
			setDescription(data.Access.role.description)
			setPermissions(data.Access.role.permissions.map(permission => permission.id))
			setType(data.Access.role.type)
		}
	}, [ visible, data ])

	// Validaciones
	useEffect(() => {
		if (name === '' || (name && name.length === 0)) {
			setErrors({ ...errors, name: 'Debes ingresar un nombre' })
		}
		else {
			const { name, ...newErrors } = errors
			setErrors(newErrors)
		}
	}, [ name ])

	useEffect(() => {
		if (description === '' || (description && description.length === 0)) {
			setErrors({ ...errors, description: 'Debes ingresar una descripción' })
		}
		else {
			const { description, ...newErrors } = errors
			setErrors(newErrors)
		}
	}, [ description ])

	useEffect(() => {
		if (permissions.length === 0) {
			setErrors({ ...errors, permissions: 'Debes seleccionar al menos un permiso' })
		}
		else {
			const { permissions, ...newErrors } = errors
			setErrors(newErrors)
		}
	}, [ permissions ])

	const { Modal, hide } = useModal({ identifier: 'editRoleModal', visible, setVisible, clean: resetModal })

	const [ updateRole ] = useMutation(UPDATE_ROLE, {
		onCompleted: (data) => {
			setLoadingButton(false)
			onRoleUpdated(data.Access.updateRole)
			notyf.open({
				type: 'success',
				message: 'El rol ha sido actualizado exitosamente',
			})
			hide(true)
		},
		onError: () => {
			setLoadingButton(false)
			notyf.open({
				type: 'error',
				message: 'Se presentó un error actualizando el rol. Intenta de nuevo más tarde',
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

	const onSubmit = (e) => {
		e.preventDefault()
		setLoadingButton(true)
		updateRole({
			variables: {
				id: roleId,
				role: {
					name,
					description,
					type,
					permissions,
				},
			},	
		})
	}
	return (
		<Modal>
			<form className="container" onSubmit={onSubmit}>
				<div className="row">
					<h2 className=" col-12 text-center">Editar rol de usuario</h2>
				</div>
				<div className="row">
					<div className="form-group col-12">
						<label className="row col-form-label text-sm-left" htmlFor="inputName">Nombre</label>
						<div className="row">
							<input
								className="form-control"
								name="name"
								value={name || ''}
								onChange={e => setName(e.target.value)}
								required
							/>
							{errors.name && <span style={{ color: 'red' }}>{errors.name}</span>}
						</div>
					</div>
					<div className="form-group col-12">
						<label className="row col-form-label text-sm-left" htmlFor="inputName">Descripción</label>
						<div className="row">
							<input
								className="form-control"
								name="description"
								value={description || ''}
								onChange={e => setDescription(e.target.value)}
								required
							/>
							{errors.description && <span style={{ color: 'red' }}>{errors.description}</span>}
						</div>
					</div>
					<div className="form-group col-12">
						<label className="row col-form-label text-sm-left" htmlFor="inputName">Tipo</label>
						<div className="row">
							<select className="form-control" name="type" value={type} disabled={true} required>
								<option value="company">Establecimiento</option>
								<option value="businessLine">Línea de negocio</option>
								<option value="location">Sucursal</option>
							</select>
						</div>
					</div>
					<div className='form-group col-12 px-0'>
						<p className='line-modal'></p>
						<h2>Permisos</h2>
						<PermissionsSection selectedPermissions={permissions} includeGlobal={company === 'PliP'} type={company === 'PliP' && type === 'company' ? 'plip' : type} onChange={onPermissionChange} company={company}/>
					</div>
					<div className="container-button">
						<p className='line-modal'></p>
						<CustomForm.LoadingButton loading={loadingButton} disabled={Object.keys(errors).length > 0} className="btn btn-lg btn-primary btn-block button">Actualizar rol</CustomForm.LoadingButton>
					</div>
				</div>
			</form>
		</Modal>
	)
	
}

EditRoleModal.propTypes = {
	roleId: PropTypes.string,
	visible: PropTypes.bool,
	setVisible: PropTypes.func,
	onRoleUpdated: PropTypes.func,
	onClose: PropTypes.func,
	company: PropTypes.string,
}

export default EditRoleModal
