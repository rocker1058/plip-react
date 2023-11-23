import React, { useEffect, useMemo } from 'react'
import PropTypes from 'prop-types'

const { $ } = window

function useModal({ identifier = '', visible, setVisible, clean }) {
	const hide = (reset = false, callback = () => { }) => {
		if (reset) {
			clean()
		}
		$(`#${identifier}`).on('hidden.bs.modal', (e) => {
			callback()
			$(e.currentTarget).unbind()
		})
		$(`#${identifier}`).modal('hide')
		setVisible(false)
	}

	useEffect(() => {
		if(visible) {
			$(`#${identifier}`).modal()
		}
		else {
			hide()
		}
	}, [ visible ])

	const ModalFooter = function({ children }) {

	}

	const Modal = function({ children, size = 'lg', footer = [] }) {
		return 	<div className="modal fade" id={identifier} data-backdrop="static" tabIndex="-1" role="dialog" aria-labelledby="exampleModalLabel" aria-hidden="true">
			<div className={`modal-dialog modal-${size}`} role="document">
				<div className="modal-content">
					<div className="modal-header">
						<button onClick={() => hide(true)} className="close">
							<span aria-hidden="true">&times;</span>
						</button>
					</div>
					<div className="modal-body">
						{children}
					</div>
				</div>
				{footer &&
					<div className="modal-footer">{footer}</div>
				}
			</div>
		</div>
	}

	Modal.propTypes = {
		children: PropTypes.object,
		footer: PropTypes.object,
		size: PropTypes.string,
	}

	return useMemo(() => ({ Modal, hide }), [ identifier ])
}

export default useModal