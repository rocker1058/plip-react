import React, { useState, useRef } from 'react'
import DateTimePicker from 'react-datetime-picker'
import moment from 'moment'
import PropTypes from 'prop-types'

function DateTime(props) {
	const [ value, setValue ] = useState(props.date)
	const [ showCalendar, setShowCalendar ] = useState(false)
	const dateRangeRef = useRef(null)
	return (
		<div>
			<div className="col-12 p-0 custom_datepicker" onClick={() => setShowCalendar(true)}>
				<DateTimePicker
					{...props}
					ref={dateRangeRef}
					onChange={(date) => {
						setValue(date)
						props.onChange(date)
					}}
					value={moment(value).isValid() ? moment(value).toDate() : moment().toDate()}
					locale="es-ES"
					isOpen={showCalendar}
					onCalendarClose={() => setShowCalendar(false)}
					amPmAriaLabel="AM/PM"
					format="dd-MM-y h:mm a"
					clearIcon={null}
					calendarIcon={null}
					disableClock={true}
					className={[ props.className, 'date-time' ]}
				/>
			</div>
		</div>
	)
}

DateTime.propTypes = {
	date: PropTypes.array,
	onChange: PropTypes.func,
	className: PropTypes.string,
}

export default DateTime
