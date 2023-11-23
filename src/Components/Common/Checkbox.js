import React from 'react'
import PropTypes from 'prop-types'

function Checkbox({ checked, name, value, text, description, ...props }) {
	return (
		<div className='form-group col-sm-6 col-lg-4 col-12'>
			<label htmlFor={value} className="label-cbx">
				<input 
					id={value} 
					type="checkbox" 
					// className="invisible"
					className="mr-2"
					checked={checked}
					value={value} 
					name={name}
					{...props}
				/>
				{/* <div className="checkbox">
					<svg width="20px" height="20px" viewBox="0 0 20 20">
						<path d="M3,1 L17,1 L17,1 C18.1045695,1 19,1.8954305 19,3 L19,17 L19,17 C19,18.1045695 18.1045695,19 17,19 L3,19 L3,19 C1.8954305,19 1,18.1045695 1,17 L1,3 L1,3 C1,1.8954305 1.8954305,1 3,1 Z"></path>
						<polyline points="4 11 8 15 16 6"></polyline>
					</svg>
				</div> */}
				<span>{text}</span>
			</label>
			{description && <span className="info-icon" tabIndex="0"  data-toggle="tooltip" data-placement="top" title={description}><i className="fas fa-info-circle"></i></span>}
		</div>
	)
}

Checkbox.propTypes = {
	checked: PropTypes.bool,
	name: PropTypes.string,
	value: PropTypes.string,
	text: PropTypes.string,
	description: PropTypes.string,
}

export default Checkbox