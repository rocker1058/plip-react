import React, { useState, useEffect } from 'react'
import PropTypes from 'prop-types'
import { useQuery } from 'react-apollo'
import { GET_BUSINESS_LINES } from './GraphQL'

function BusinessLinePicker({ company, value, onChange, ...props }) {

	const [ businessLines, setBusinessLines ] = useState([])

	const { data } = useQuery(GET_BUSINESS_LINES, { variables: { company, limit: 1000 } })

	useEffect(() => {
		if (data && data.BusinessLine) {
			setBusinessLines(data.BusinessLine.businessLines.results)
		}
	}, [ data ])

	const onSelected = (e) => {
		const selectedBusinessLines = businessLines.find(businessLine => businessLine.id === e.target.value)
		onChange(selectedBusinessLines)
	}

	return (
		<select {...props} name="businessLine" value={value} onChange={onSelected}>
			<option value="">Selecciona una línea de negocio</option>
			{businessLines.map(businessLine => <option key={businessLine.id} value={businessLine.id}>{businessLine.name}</option>)}
		</select>
	)
}

BusinessLinePicker.propTypes = {
	company: PropTypes.string,
	value: PropTypes.string,
	onChange: PropTypes.func,
}

export default BusinessLinePicker
