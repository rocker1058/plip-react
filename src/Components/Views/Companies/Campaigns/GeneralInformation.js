import React from 'react'
import PropTypes from 'prop-types'
import moment from 'moment'
import { CustomForm  } from '../../../Common'

function GeneralInformation({ generalInformation, onGeneralInformation }){

	const editInfo = (name, value) => {
		onGeneralInformation({ ...generalInformation, [name]: value  })
	}
	return(
		<div className="row justify-content-center">
			<div className="col-12 col-lg-6">
				<div className="form-group">
					<label htmlFor="inputEmail">Nombre de la campaña</label>
					<input 
						className="form-control" 
						placeholder="Nombre de la campaña"
						required
						value={generalInformation.name} 
						onChange={e => {
							const text = e.target.value
							editInfo('name', text)
						}}/>
				</div>
				<div className="form-group">
					<label htmlFor="inputEmail">Fecha y hora de inicio</label>
					<CustomForm.CustomInput
						name="start"
						className="form-control"
						type="date-time"
						defaultValue={generalInformation.start}
						placeholder="Fecha de inicio"
						onChange={(_, value) => {
							editInfo('start', value)
						}}/>
				</div>
				<div className="form-group">
					<label htmlFor="inputEmail">Fecha y hora de fin</label>
					<CustomForm.CustomInput
						dateProps={{
							minDate: moment(generalInformation.start).toDate(),
						}}
						name="start"
						className="form-control"
						type="date-time"
						defaultValue={new Date(generalInformation.end)}
						placeholder="Fecha de inicio"
						onChange={(_,value) => editInfo('end', value)}/>
				</div>
			</div>
		</div>
	)
}

GeneralInformation.propTypes = {
	generalInformation: PropTypes.object,
	companyInvoiceData: PropTypes.object,
	onGeneralInformation: PropTypes.func,
}

export default GeneralInformation