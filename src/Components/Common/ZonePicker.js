import React, { Component } from 'react'
import PropTypes from 'prop-types'
import gql from 'graphql-tag'
import { graphql } from 'react-apollo'
import CustomForm from './CustomForm'

const clientsQuery = gql`
	query queryClientsZones($domain: ID!, $search: String){
		Domain{
			one(id: $domain) {
				id
				name
				subdomains(filter: { search: [$search] } limit: 10){
					subdomains{
						id
						name
					}
				}
			}
		}
	}`

const SuggestionItem = (item, isHighlighted) => (
	<div key={item.subdomain.id} className={`row justify-content-start suggestion ${isHighlighted ? 'highlighted' : ''}`}>
		<div className="col-md-auto"><span> {item.subdomain.name}</span></div>
	</div>
)

class ClientZoneSuggest extends Component {
	constructor(props) {
		super(props)
		this.state = {}
		this.suggestResults.bind(this)
	}

	render() {
		return <CustomForm.CustomSuggest
			ref={ref => this.picker = ref}
			name="zone"
			inputProps={{ className: 'form-control', disabled: this.props.disabled }}
			itemValue={item => item.domain.id}
			items={this.suggestResults()}
			SuggestionItem={SuggestionItem}
			search={this.props.search}
			display={this.props.display}
			required={this.props.required}
			error={() => 'Debes seleccionar una zona'}
			onChange={this.props.onSearchChange}
			onItemSelected={this.props.onChange} />
	}

	suggestResults() {
		if (this.props.clientZoneQuery && this.props.clientZoneQuery.Domain && this.props.clientZoneQuery.Domain.one) {
			return this.props.clientZoneQuery.Domain.one.subdomains.subdomains.reduce((acc, subdomain) => [...acc, { subdomain, domain: { id: this.props.domain } }], [])
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

ClientZoneSuggest.propTypes = {
	required: PropTypes.bool,
	disabled: PropTypes.bool,
	onChange: PropTypes.func,
	onItemSelected: PropTypes.func,
	clientZoneQuery: PropTypes.object,
	domain: PropTypes.string,
	search: PropTypes.string,
	display: PropTypes.string,
	onSearchChange: PropTypes.func,
}

const GraphQLPicker = graphql(clientsQuery, {
	name: 'clientZoneQuery',
	skip: ({ search, domain }) => !search || search.length < 4 || !domain,
	options: () => ({ fetchPolicy: 'network-only' }),
})(ClientZoneSuggest)

class ZonePicker extends Component {
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
			{...this.props}
			ref={ref => this.picker = ref}
			domain={this.props.domain} search={this.state.search} display={this.state.display}
			required={this.props.required}
			onChange={this.onZoneChange.bind(this)}
			onSearchChange={(_, search) => this.setState({
				...this.state, search, display: search, touched: true, error: true,
			}, this.onZoneChange(null))}/>
	}


	onZoneChange(zone) {
		if (zone) {
			this.setState({
				...this.state, search: zone.subdomain.name, display: zone.subdomain.name, value: zone, error: false, touched: true,
			})
		}
		else {
			this.setState({
				...this.state, search: '', display: '', value: null, error: true, touched: true,
			})
		}
		this.props.onChange(zone)
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

ZonePicker.defaultProps = {
	onChange: () => {},
	required: false,
}

ZonePicker.propTypes = {
	domain: PropTypes.string,
	required: PropTypes.bool,
	onChange: PropTypes.func,
}

export default ZonePicker
