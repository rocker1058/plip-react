import React, { useEffect, useState, useContext } from 'react'
import PropTypes from 'prop-types'
import { useMutation, useQuery } from 'react-apollo'

import { CustomForm, TagInput, useModal, NotyfContext } from '../../../Common'
import { UPDATE_KEY, GET_KEY } from '../GraphQL'

function EditKeyModal({ visible, setVisible, onKeyUpdated, keyId }) {
	const notyf = useContext(NotyfContext)
	const [ name, setName ] = useState(null)
	const [ tags, setTags ] = useState([])
	const [ errors, setErrors ] = useState({})
	const [ loading, setLoading ] = useState(false)
	const { data } = useQuery(GET_KEY, { variables: { id: keyId }, skip: !keyId })

	const resetModal = () => {
		setErrors({})
		setName(null)
		setTags([])
	}

	const [ updateKey ] = useMutation(UPDATE_KEY, {
		onCompleted: (data) => {
			setLoading(false)
			hide(true)
			notyf.open({
				type: 'success',
				message: 'La credencial ha sido actualizada exitosamente',
			})
			onKeyUpdated(data.Key.updateKey)
		},
		onError: () => {
			setLoading(false)
			notyf.open({
				type: 'error',
				message: 'Error al actualizar credencial. Intenta de nuevo más tarde',
			})
		},
	})

	const onSubmit = (e) => {
		e.preventDefault()
		setLoading(true)
		updateKey({
			variables: {
				id: keyId,
				key: {
					name,
					tags,
				},
			},
		})
	}

	useEffect(() => {
		if (data) {
			setName(data.Key.key.name)
			setTags(data.Key.key.tags)
		}
	}, [ visible, data ])

	useEffect(() => {
		if (name === '') {
			setErrors({ ...errors, name: 'Debes ingresar un nombre válido' })
		}
		else {
			const { name, ...newErrors } = errors
			setErrors(newErrors)
		}
	}, [ name ])

	const { Modal, hide } = useModal({ identifier: 'editKeyModal', visible, setVisible, clean: resetModal })
	
	return (
		<Modal>
			<div className="container">
				<div className="col-12">
					<h2 className="text-center">Editar Credencial</h2>
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
						<small><b>Nota:</b> Los cambios de tags solo serán reflejados en futuras facturas. No se verán aplicados en facturas ya creadas.</small>
					</div>
					<CustomForm.LoadingButton loading={loading} onClick={onSubmit} className="btn btn-lg btn-primary btn-block">Actualizar credencial</CustomForm.LoadingButton>
				</div>
			</div>
		</Modal>
	)
}

EditKeyModal.propTypes = {
	company: PropTypes.string,
	location: PropTypes.string,
	onKeyUpdated: PropTypes.func,
	visible: PropTypes.bool,
	setVisible: PropTypes.func,
	keyId: PropTypes.string,
}

export default EditKeyModal
