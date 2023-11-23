import React, { Component } from 'react'
import PropTypes from 'prop-types'
import gql from 'graphql-tag'
import { graphql } from 'react-apollo'
import CustomForm from './CustomForm'

const vehiclesQuery = gql`
	query queryVehicles($domain: ID!, $search: String){
		Vehicle{
			all(domain: $domain, filter: { search: [$search] }, limit: 10){
				vehicles{
					id
					plate
					brand{
						id
						name
					}
					line {
						id
						name
					}
					subline {
						id
						name
					}
					year
				}
			}
		}
	}`

const SuggestionItem = (item, isHighlighted) => (
	<div key={item.id} className={`row justify-content-start suggestion ${isHighlighted ? 'highlighted' : ''}`}>
		<div className="col-md-auto"><span> {item.plate} {item.brand.name} - {item.line.name}</span></div>
	</div>
)

class VehicleSuggest extends Component {
	constructor(props) {
		super(props)
		this.state = {}
		this.suggestResults.bind(this)
	}

	render() {
		return <CustomForm.CustomSuggest
			ref={ref => this.picker = ref}
			name="domain"
			inputProps={{ className: 'form-control', disabled: this.props.disabled }}
			itemValue={item => item.id}
			items={this.suggestResults()}
			SuggestionItem={SuggestionItem}
			search={this.props.search}
			display={this.props.display}
			required={this.props.required}
			error={() => 'Debes seleccionar un vehículo'}
			onChange={this.props.onSearchChange}
			onItemSelected={this.props.onChange} />
	}

	suggestResults() {
		if (this.props.vehiclesQuery && this.props.vehiclesQuery.Vehicle && this.props.vehiclesQuery.Vehicle.all) {
			return this.props.vehiclesQuery.Vehicle.all.vehicles
		}
		return []
	}

	validateState() {
		return this.picker.validateState()
	}

	reset() {
		return this.picker.reset()
	}
}

VehicleSuggest.propTypes = {
	required: PropTypes.bool,
	onChange: PropTypes.func,
	onItemSelected: PropTypes.func,
	vehiclesQuery: PropTypes.object,
	domain: PropTypes.string,
	search: PropTypes.string,
	display: PropTypes.string,
	onSearchChange: PropTypes.func,
	disabled: PropTypes.bool,
}

const GraphQLPicker = graphql(vehiclesQuery, {
	name: 'vehiclesQuery',
	skip: ({ search }) => !search || search.length < 2,
	options: () => ({ fetchPolicy: 'network-only' }),
})(VehicleSuggest)

class VehiclesPicker extends Component {
	constructor(props) {
		super(props)
		this.state = {
			value: null,
			error: false,
			touched: true,
			display: '',
			search: '',
		}
	}

	render() {
		return <GraphQLPicker
			{ ...this.props }
			ref={ref => this.picker = ref}
			domain={this.props.domain} search={this.state.search} display={this.state.display}
			required={this.props.required}
			onChange={this.onVehicleChange.bind(this)}
			onSearchChange={(_, search) => this.setState({
				...this.state, search, display: search, touched: true, error: true,
			}, this.onVehicleChange(null))}/>
	}


	onVehicleChange(vehicle) {
		if (vehicle) {
			this.setState({
				...this.state, search: vehicle.plate, display: vehicle.plate, value: vehicle, error: false, touched: true,
			})
		}
		else {
			this.setState({
				...this.state, search: '', display: '', value: null, error: true, touched: true,
			})
		}
		this.props.onChange(vehicle)
	}

	validateState() {
		this.setState({
			...this.state, error: this.state.value !== null, touched: true,
		})
		return this.picker.wrappedInstance.validateState()
	}

	reset() {
		this.setState({
			display: '', search: '', error: false, touched: false,
		})
		return this.picker.wrappedInstance.reset()
	}
}

VehiclesPicker.defaultProps = {
	onChange: () => {},
	required: false,
}

VehiclesPicker.propTypes = {
	domain: PropTypes.string,
	required: PropTypes.bool,
	onChange: PropTypes.func,
}

export default VehiclesPicker
