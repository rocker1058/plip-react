import React, { Component } from 'react'
import CalendarWidget from 'react-calendar'
import moment from 'moment'
import PropTypes from 'prop-types'

class DatePicker extends Component {
	constructor(props, defaultProps) {
		super(props, defaultProps)
		this.state = {
			date: props.date,
			isOpen: false,
		}
	}

	componentDidUpdate(prevProps) {
		if (prevProps.date !== this.props.date) {
			this.setState({ date: this.props.date })
		}
	}

	componentDidMount() {
		document.addEventListener('mousedown', this.onClick.bind(this))
	}

	componentWillUnmount() {
		document.removeEventListener('mousedown', this.onClick.bind(this))
	}

	onClick(event) {
		if (this.wrapper && !this.wrapper.contains(event.target)) {
			this.closeCalendar()
		}
	}

	render() {
		return (
			<div className="col-12 p-0 custom_datepicker" ref={ref => this.wrapper = ref}>
				<input {...this.props} autoComplete="off" id="inputInReservation" type="text" onFocus={this.onFocus.bind(this)} value={moment(this.state.date).isValid() ? moment(this.state.date).format('DD/MMM/YYYY') : this.state.date} onChange={this.cleanInput.bind(this)}/>
				{this.state.isOpen &&
					<CalendarWidget {...this.props.calendarProps} locale="es" className={`dateinput ${this.state.isOpen ? 'focused' : ''} `} onChange={this.onCalendarWidgetChange.bind(this)} value={moment(this.state.date).isValid() ? moment(this.state.date).toDate() : moment().toDate()} />
				}
			</div>
		)
	}

	cleanInput() {
		this.setState({ isOpen: false, date: '' })
		this.props.onChange('')
	}

	closeCalendar() {
		this.setState({ ...this.state, isOpen: false })
	}

	onFocus() {
		this.setState({ ...this.state, isOpen: !this.state.isOpen })
	}

	onCalendarWidgetChange(date) {
		this.setState({ isOpen: false, date })
		this.props.onChange(moment(date))
	}
}

DatePicker.defaultProps = {
	date: moment(),
}

DatePicker.propTypes = {
	onChange: PropTypes.func,
	value: PropTypes.string,
	calendarProps: PropTypes.object,
	date: PropTypes.string,
}

export default DatePicker
