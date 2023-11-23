import React, { useState, useContext, useEffect } from 'react'
import { useQuery, useMutation } from 'react-apollo'
import PropTypes from 'prop-types'

import { CustomForm, useModal, NotyfContext, Checkbox } from '../../../Common'
import { CREATE_ROLE, GET_PERMISSIONS } from '../GraphQL'

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
	type: PropTypes.string,
	onChange: PropTypes.func,
	company: PropTypes.string,
}

function CreateRoleModal({ visible, setVisible, company, onRoleCreated }){
	const notyf = useContext(NotyfContext)

	const [ loadingButton, setLoadingButton ] = useState(false)

	const [ errors, setErrors ] = useState({})

	const [ name, setName ] = useState('')

	const [ description, setDescription ] = useState('')

	const [ type, setType ] = useState('company')

	const [ permissions, setPermissions ] = useState([])
	
	const resetModal = () => {
		setErrors({})
		setName('')
		setDescription('')
		setPermissions([])
	}

	// Validaciones
	useEffect(() => {
		if (!name || name.length === 0) {
			setErrors({ ...errors, name: 'Debes ingresar un nombre' })
		}
		else {
			const { name, ...newErrors } = errors
			setErrors(newErrors)
		}
	}, [ name ])

	useEffect(() => {
		if (!description || description.length === 0) {
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

	const { Modal, hide } = useModal({ identifier: 'newRoleModal', visible, setVisible, clean: resetModal })

	const [ createRole ] = useMutation(CREATE_ROLE, {
		onCompleted: (data) => {
			setLoadingButton(false)
			onRoleCreated(data.Access.createRoleInCompany)
			notyf.open({
				type: 'success',
				message: 'El rol ha sido creado exitosamente',
			})
			hide(true)
		},
		onError: () => {
			setLoadingButton(false)
			notyf.open({
				type: 'error',
				message: 'Se presentó un error creando el rol. Intenta de nuevo más tarde',
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
		createRole({
			variables: {
				company,
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
					<h2 className=" col-12 text-center">Crear nuevo rol de usuario</h2>
				</div>
				<div className="row">
					<div className="form-group col-12">
						<label className="row col-form-label text-sm-left" htmlFor="inputName">Nombre</label>
						<div className="row">
							<input
								className="form-control"
								name="name"
								value={name}
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
								value={description}
								onChange={e => setDescription(e.target.value)}
								required
							/>
							{errors.description && <span style={{ color: 'red' }}>{errors.description}</span>}
						</div>
					</div>
					<div className="form-group col-12">
						<label className="row col-form-label text-sm-left" htmlFor="inputName">Alcance</label>
						<div className="row">
							<select className="form-control" name="type" value={type} onChange={e => setType(e.target.value)} required>
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
						<CustomForm.LoadingButton loading={loadingButton} disabled={Object.keys(errors).length > 0 || !name || !description} className="btn btn-lg btn-primary btn-block button">Crear rol</CustomForm.LoadingButton>
					</div>
				</div>
			</form>
		</Modal>
	)
}

CreateRoleModal.propTypes = {
	visible: PropTypes.bool,
	setVisible: PropTypes.func,
	company: PropTypes.string,
	onRoleCreated: PropTypes.func,
}

export default CreateRoleModal
