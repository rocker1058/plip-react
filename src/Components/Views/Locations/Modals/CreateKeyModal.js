import React, { useEffect, useState, useContext } from 'react'
import PropTypes from 'prop-types'
import { useMutation } from 'react-apollo'

import { CustomForm, TagInput, useModal, NotyfContext } from '../../../Common'
import { CREATE_KEY } from '../GraphQL'

function CreateKeyModal({ visible, setVisible, onKeyCreated, company, location }) {
	const notyf = useContext(NotyfContext)
	const [ name, setName ] = useState(null)
	const [ tags, setTags ] = useState([])
	const [ errors, setErrors ] = useState({})
	const [ loading, setLoading ] = useState(false)

	const resetModal = () => {
		setErrors({})
		setName(null)
		setTags([])
	}

	const [ createKey ] = useMutation(CREATE_KEY, {
		onCompleted: (data) => {
			setLoading(false)
			hide(true)
			notyf.open({
				type: 'success',
				message: 'La credencial ha sido creada exitosamente',
			})
			onKeyCreated(data.Key.createKey)
		},
		onError: () => {
			setLoading(false)
			notyf.open({
				type: 'error',
				message: 'Error al crear nueva credencial. Intenta de nuevo más tarde',
			})
		},
	})

	const onSubmit = (e) => {
		e.preventDefault()
		setLoading(true)
		createKey({
			variables: {
				key: {
					name,
					tags,
					company,
					location,
				},
			},
		})
	}

	useEffect(() => {
		if (name === '') {
			setErrors({ ...errors, name: 'Debes ingresar un nombre válido' })
		}
		else {
			const { name, ...newErrors } = errors
			setErrors(newErrors)
		}
	}, [ name ])

	const { Modal, hide } = useModal({ identifier: 'createKeyModal', visible, setVisible, clean: resetModal })
	
	return (
		<Modal>
			<div className="container">
				<div className="col-12">
					<h2 className="text-center">Nueva Credencial</h2>
					<div className="form-group">
						<label htmlFor="inputName">Nombre</label>
						<input
							className="form-control"
							placeholder="Nombre"
							name="name"
							value={name || ''}
							onChange={e => setName(e.target.value)}
							required
						/>
						{errors.name && <span style={{ color: 'red' }}>{errors.name}</span>}
					</div>
					<div className="form-group">
						<label htmlFor="inputNit">Agrega un tag...</label>
						<TagInput tags={tags} onTagsChange={setTags}/>
					</div>
					<CustomForm.LoadingButton loading={loading} onClick={onSubmit} className="btn btn-lg btn-primary btn-block">Crear credencial</CustomForm.LoadingButton>
				</div>
			</div>
		</Modal>
	)
}

CreateKeyModal.propTypes = {
	company: PropTypes.string,
	location: PropTypes.string,
	onKeyCreated: PropTypes.func,
	visible: PropTypes.bool,
	setVisible: PropTypes.func,
}

export default CreateKeyModal
