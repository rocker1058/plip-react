import React, { Component } from 'react'
import PropTypes from 'prop-types'
import { isEmail } from 'validator'
import PhoneInput from 'react-phone-number-input'
import moment from 'moment'
import Autocomplete from 'react-autocomplete'
import PlacesAutocomplete, {
	geocodeByAddress,
	getLatLng,
} from 'react-places-autocomplete'

import DatePicker from './DatePicker'
import DateRangePicker from './DateRangePicker'
import DateTimePicker from './DateTimePicker'

import loadingGif from '../../Assets/img/loading.gif'

export const OnlyLetterValidator = (value) => {
	const onlyLettersRegex = /^[A-zÀ-ú\s]*$/
	return value.match(onlyLettersRegex)
}

export const NotEmptyValidator = value => value.length > 0

export const OnlyNumberValidator = (value) => {
	try {
		parseFloat(value)
		return true
	}
	catch (e) {
		return false
	}
}

export const EmailValidator = value => isEmail(value)

export const UsernameValidator = (value) => {
	const usernameRegex = /\S/
	return value.match(usernameRegex)
}

export const PasswordValidator = (value) => {
	const minLength = 10
	const uppercaseMinCount = 1
	const lowercaseMinCount = 1
	const numberMinCount = 1
	const UPPERCASE_RE = /([A-Z])/g
	const LOWERCASE_RE = /([a-z])/g
	const NUMBER_RE = /([\d])/g
	const NON_REPEATING_CHAR_RE = /([\w\d])\1{2,}/g
	const uc = value.match(UPPERCASE_RE)
	const lc = value.match(LOWERCASE_RE)
	const n = value.match(NUMBER_RE)
	const nr = value.match(NON_REPEATING_CHAR_RE)
	return value.length >= minLength &&
		!nr &&
		uc && uc.length >= uppercaseMinCount &&
		lc && lc.length >= lowercaseMinCount &&
		n && n.length >= numberMinCount
}

export const PasswordConfirmationValidator = (value, password) => value === password

class CustomInput extends Component {
	constructor(props) {
		super(props)
		this.state = {
			value: this.props.defaultValue || this.props.defaultValue === 0 ? this.props.defaultValue : '',
			error: false,
			touched: false,
		}
		this.validateState.bind(this)
		this.reset.bind(this)
	}

	componentDidUpdate(prevProps) {
		if (prevProps.defaultValue !== this.props.defaultValue) {
			this.setState({ ...this.state, value: this.props.defaultValue || this.props.defaultValue === 0 ? this.props.defaultValue : '' })
		}
	}

	render() {
		if (this.props.type === 'phone') {
			return (
				<div className={`custom-input phone-input ${this.state.error ? 'phone-error' : ''} ${this.state.value !== '' ? 'valid' : ''}`}>
					<PhoneInput placeholder={this.props.placeholder} value={this.state.value} onChange={this.onPhoneNumberChange.bind(this)} country={this.props.country} countries={this.props.countries} />
					{((this.state.error && this.state.touched) || this.props.customError.length > 0) && this.props.error &&
						<div className="error">
							{this.props.error(this.props.customError)}
						</div>
					}
				</div>
			)
		}

		if (this.props.type === 'date') {
			return (
				<div className={`custom-input date-input ${this.state.value !== '' ? 'valid' : ''}`}>
					<DatePicker {...this.props.dateProps} className={`${this.props.className}  ${((this.state.error && this.state.touched) || this.props.customError.length > 0) ? 'is-invalid' : ''}`} date={this.state.value} onChange={this.onDateChanged.bind(this)} />
					{((this.state.error && this.state.touched) || this.props.customError.length > 0) && this.props.error &&
						<div className="error">
							{this.props.error(this.props.customError)}
						</div>
					}
				</div>
			)
		}

		if (this.props.type === 'date-range') {
			return (
				<div className={`custom-input date-input ${this.state.value !== '' ? 'valid' : ''}`}>
					<DateRangePicker {...this.props.dateProps} className={`${this.props.className}  ${((this.state.error && this.state.touched) || this.props.customError.length > 0) ? 'is-invalid' : ''}`} dates={this.state.value} onChange={this.props.onChange}/>
					{((this.state.error && this.state.touched) || this.props.customError.length > 0) && this.props.error &&
						<div className="error">
							{this.props.error(this.props.customError)}
						</div>
					}
				</div>
			)
		}
		
		if (this.props.type === 'date-time') {
			return (
				<div className={`custom-input date-input ${this.state.value !== '' ? 'valid' : ''}`}>
					<DateTimePicker {...this.props.dateProps} className={`${this.props.className}  ${((this.state.error && this.state.touched) || this.props.customError.length > 0) ? 'is-invalid' : ''}`} date={this.state.value} onChange={this.onDateChanged.bind(this)}/>
					{((this.state.error && this.state.touched) || this.props.customError.length > 0) && this.props.error &&
						<div className="error">
							{this.props.error(this.props.customError)}
						</div>
					}
				</div>
			)
		}

		if (this.props.type === 'textarea') {
			return (
				<div className="custom-input">
					<textarea rows={this.props.rows} className={`${this.props.className} ${this.state.value !== '' ? 'valid' : ''} ${((this.state.error && this.state.touched) || this.props.customError.length > 0) ? 'is-invalid' : ''}`} placeholder={this.props.placeholder} value={this.state.value} onChange={this.onChange.bind(this)} ></textarea>
					{((this.state.error && this.state.touched) || this.props.customError.length > 0) && this.props.error &&
						<div className="error">
							{this.props.error(this.props.customError)}
						</div>
					}
				</div>
			)
		}

		if (this.props.type === 'address') {
			return (
				<PlacesAutocomplete
					value={this.state.value}
					onChange={this.onAddressChange.bind(this)}
					onSelect={this.handleSelect.bind(this)}
				>
					{({
						getInputProps, suggestions, getSuggestionItemProps, loading,
					}) => (
						<div className="custom-input">
							<input value={this.state.value ? 'una direccion' : ''}
								{
									...getInputProps({
										placeholder: this.props.placeholder,
										className: `${this.props.className} ${this.state.value !== '' ? 'valid' : ''} ${((this.state.error && this.state.touched) || this.props.customError.length > 0) ? 'is-invalid' : ''}`,
									})}
							/>
							<div className="autocomplete-dropdown-container">
								{loading && <div>Loading...</div>}
								{suggestions.map((suggestion) => {
									const className = suggestion.active ? 'suggestion-item--active' : 'suggestion-item'
									const style = suggestion.active ? { backgroundColor: '#fafafa', cursor: 'pointer' } : { backgroundColor: '#ffffff', cursor: 'pointer' }
									return (
										<div key={suggestion.id} {...getSuggestionItemProps(suggestion, { className, style })}>
											<span>{suggestion.description}</span>
										</div>)
								})}
							</div>
							{((this.state.error && this.state.touched) || this.props.customError.length > 0) && this.props.error &&
								<div className="invalid-feedback error">
									{this.props.error(this.props.customError)}
								</div>
							}
						</div>
					)}
				</PlacesAutocomplete>
			)
		}

		return (
			<div className="custom-input">
				<input type={this.props.type} {...this.props.inputProps} className={`${this.props.className} ${this.state.value !== '' ? 'valid' : ''} ${((this.state.error && this.state.touched) || this.props.customError.length > 0) ? 'is-invalid' : ''}`} placeholder={this.props.placeholder} value={this.state.value} onChange={this.onChange.bind(this)} />
				{((this.state.error && this.state.touched) || this.props.customError.length > 0) && this.props.error &&
					<div className="invalid-feedback error">
						{this.props.error(this.props.customError)}
					</div>
				}
			</div>
		)
	}

	onChange(e) {
		return new Promise((resolve) => {
			const { value } = e.target
			this.setState({
				value,
				error: (this.props.required && (!value || value.length === 0)) || (this.props.validator && !this.props.validator(value)),
				touched: true,
			}, () => {
				this.props.onChange(this.props.name, value)
				resolve({ name: this.props.name, value })
			})
		})
	}

	onPhoneNumberChange(number) {
		if (number) {
			return this.onChange({ target: { value: number } })
		}
		return Promise.resolve({})
	}

	onAddressChange(address) {
		return new Promise(resolve => this.setState({
			value: address,
			error: (this.props.required && (!address || address.length === 0)) || (this.props.validator && !this.props.validator(address)),
			touched: true,
		}, () => resolve()))
	}

	handleSelect(address) {
		return geocodeByAddress(address)
			.then((results) => {
				return getLatLng(results[0])
					.then(({ lat: latitude, lng: longitude }) => ({
						city: (results[0].address_components.find(c => c.types.includes('locality')) || results[0].address_components.find(c => c.types.includes('administrative_area_level_2')) || results[0].address_components.find(c => c.types.includes('administrative_area_level_1'))).short_name,
						country: results[0].address_components.find(c => c.types.includes('country')).short_name,
						address: results[0].formatted_address,
						tags: results[0].address_components.map(c => c.long_name),
						latitude,
						longitude,
					}))
			})
			.then((result) => {
				this.setState({
					value: result.address,
					error: false,
					touched: true,
				})
				this.props.onChange(this.props.name, result)
			})
	}

	onDateChanged(date) {
		return this.onChange({ target: { value: moment(date).isValid() ? date.toISOString() : '' } })
	}

	validateState() {
		if (this.props.type === 'address') {
			return this.handleSelect(this.state.value)
		}
		return this.onChange({ target: { value: this.state.value } })
	}

	reset() {
		return new Promise((resolve) => {
			this.setState({
				value: this.props.defaultValue || '',
				error: false,
				touched: false,
			}, () => {
				this.props.onChange(this.props.name, (this.props.defaultValue || ''))
				resolve({ name: this.props.name, value: this.state.value })
			})
		})
	}
}

CustomInput.defaultProps = {
	customError: '',
	onChange: () => {},
}

CustomInput.propTypes = {
	validator: PropTypes.func,
	name: PropTypes.string.isRequired,
	className: PropTypes.string,
	error: PropTypes.func,
	placeholder: PropTypes.string,
	required: PropTypes.bool,
	defaultValue: PropTypes.any,
	type: PropTypes.string,
	country: PropTypes.string,
	countries: PropTypes.array,
	onChange: PropTypes.func,
	customError: PropTypes.string,
	rows: PropTypes.string,
	dateProps: PropTypes.object,
	inputProps: PropTypes.object,
}

class CustomSelect extends Component {
	constructor(props) {
		super(props)
		this.state = {
			value: this.props.defaultValue || '0',
			error: false,
			touched: false,
		}
		this.validateState.bind(this)
		this.reset.bind(this)
	}

	componentDidUpdate(prevProps) {
		if (prevProps.defaultValue !== this.props.defaultValue) {
			this.setState({ ...this.state, value: this.props.defaultValue || this.props.defaultValue === 0 ? this.props.defaultValue : '' })
		}
	}

	render() {
		return (
			<div className="custom-input">
				<select className={`${this.props.className} valid ${this.state.error && this.state.touched ? 'is-invalid' : ''}`} {...this.props.inputProps} name={this.props.name} value={this.state.value} onChange={this.onChange.bind(this)}>
					<option value="0">{this.props.emptyOption}</option>
					{this.props.children}
				</select>
				{this.state.error && this.state.touched &&
					<div className="invalid-feedback error">
						{this.props.error(this.props.customError)}
					</div>
				}
			</div>
		)
	}

	onChange(e) {
		return new Promise((resolve) => {
			const { value } = e.target
			this.setState({
				value,
				error: this.props.required && value === '0',
				touched: true,
			}, () => {
				this.props.onChange(this.props.name, value)
				resolve({ name: this.props.name, value })
			})
		})
	}

	validateState() {
		return this.onChange({ target: { value: this.state.value } })
	}

	reset() {
		return new Promise((resolve) => {
			this.setState({
				value: this.props.defaultValue || '0',
				error: false,
				touched: false,
			}, () => {
				this.props.onChange(this.props.name, (this.props.defaultValue || '0'))
				resolve({ name: this.props.name, value: this.state.value })
			})
		})
	}
}

CustomSelect.defaultProps = {
	customError: '',
	onChange: () => {},
}

CustomSelect.propTypes = {
	name: PropTypes.string.isRequired,
	className: PropTypes.string,
	error: PropTypes.func,
	emptyOption: PropTypes.string,
	required: PropTypes.bool,
	defaultValue: PropTypes.any,
	onChange: PropTypes.func,
	customError: PropTypes.any,
	children: PropTypes.array,
	inputProps: PropTypes.object,
}

class CustomSuggest extends Component {
	constructor(props) {
		super(props)
		this.state = {
			value: null,
			error: false,
			touched: false,
		}
		this.onChange.bind(this)
		this.validateState.bind(this)
		this.reset.bind(this)
	}

	render() {
		const { className, ...inputProps } = this.props.inputProps
		return (
			<div className="form-group custom-input custom-suggest">
				<Autocomplete
					getItemValue={this.props.itemValue}
					inputProps={{
						className: `${className} ${this.state.error && this.state.touched ? 'is-invalid' : ''}`,
						...inputProps,
						onFocus: () => this.setState({ focused: true }),
						onBlur: () => this.setState({ focused: false }),
					}}
					items={this.props.items}
					open={this.props.items.length > 0 && this.props.search !== '' && this.state.focused}
					renderItem={this.props.SuggestionItem}
					value={this.props.display}
					onChange={(e) => {
						this.props.onChange(this.props.name, e.target.value)
						this.onChange(null)
					}}
					onSelect={(_, item) => {
						this.setState({ ...this.state, focused: false })
						this.onChange(item)
					}}
					menuStyle={{
						overflow: 'hidden',
						zIndex: 1000,
						borderRadius: '3px',
						boxShadow: '0 2px 12px rgba(0, 0, 0, 0.1)',
						background: 'rgba(255, 255, 255, 0.9)',
						padding: '2px 0',
					}}
				/>
				{this.state.error && this.state.touched &&
					<div className="error">
						{this.props.error(this.props.customError)}
					</div>
				}
			</div>
		)
	}

	onChange(value) {
		return new Promise((resolve) => {
			this.setState({
				value,
				error: this.props.required && !value,
				touched: true,
			}, () => {
				if (value) {
					this.props.onItemSelected(value)
					resolve({ name: this.props.name, value })
				}
				else {
					resolve({ name: this.props.name, value: null })
				}
			})
		})
	}

	validateState() {
		return this.onChange(this.state.value)
	}

	reset() {
		return new Promise((resolve) => {
			this.setState({
				value: null,
				error: false,
				touched: false,
			}, () => {
				this.props.onChange(this.props.name, '')
				this.props.onItemSelected(null)
				resolve({ name: this.props.name, value: this.state.value })
			})
		})
	}
}

CustomSuggest.propTypes = {
	name: PropTypes.string.isRequired,
	error: PropTypes.func,
	inputProps: PropTypes.object,
	itemValue: PropTypes.func,
	items: PropTypes.array,
	SuggestionItem: PropTypes.func,
	search: PropTypes.string,
	display: PropTypes.string,
	required: PropTypes.bool,
	defaultValue: PropTypes.any,
	onChange: PropTypes.func,
	onItemSelected: PropTypes.func,
	customError: PropTypes.any,
}

class LoadingButton extends Component {
	render() {
		const { loading, disabled, ...buttonProps } = this.props
		return (
			<button {...buttonProps} disabled={loading || disabled}>
				{!this.props.loading &&
					this.props.children
				}
				{this.props.loading && <img style={{ width: '20px', height: '20px' }} className="loader" src={loadingGif} />}
			</button>
		)
	}
}

LoadingButton.propTypes = {
	loading: PropTypes.bool,
	disabled: PropTypes.bool,
	children: PropTypes.string,
}

export default {
	LoadingButton, CustomInput, CustomSelect, CustomSuggest, OnlyLetterValidator, EmailValidator, PasswordValidator, PasswordConfirmationValidator, UsernameValidator, OnlyNumberValidator, NotEmptyValidator,
}
