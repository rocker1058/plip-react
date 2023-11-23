import React, { useState, useRef } from 'react'
import DateRangePicker from '@wojtekmaj/react-daterange-picker'
import moment from 'moment'
import PropTypes from 'prop-types'

function DateRange(props) {
	const [ value, setValue ] = useState(props.dates)
	const [ showCalendar, setShowCalendar ] = useState(false)
	const dateRangeRef = useRef(null)
	return (
		<div>
			<div className="col-12 p-0 custom_datepicker" onClick={() => setShowCalendar(true)}>
				<input 
					{...props}
					style={{ backgroundColor: 'white', cursor: 'pointer' }}
					autoComplete="off" 
					id="inputInReservation" 
					type="text"
					disabled
					value={moment(value[0]).format('DD/MMM/YYYY') + ' - ' + moment(value[1]).format('DD/MMM/YYYY')} 
				/>
				<DateRangePicker
					ref={dateRangeRef}
					onChange={(dates) => {
						setValue(dates)
						props.onChange(dates)
					}}
					value={value}
					locale="es"
					isOpen={showCalendar}
					onCalendarClose={() => setShowCalendar(false)}
					className={'date-range'}
				/>
			</div>
		</div>
	)
}

DateRange.propTypes = {
	dates: PropTypes.array,
	onChange: PropTypes.func,
}

export default DateRange
