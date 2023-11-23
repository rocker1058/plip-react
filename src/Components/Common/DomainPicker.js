import React, { Component } from 'react'
import PropTypes from 'prop-types'
import gql from 'graphql-tag'
import { graphql } from 'react-apollo'
import CustomForm from './CustomForm'

const domainsQuery = gql`
	query queryDomains($type: DomainTypeEnum!){
		Domain{
			all( type: $type, limit: 10){
				domains{
					id
					name
				}
			}
		}
	}`

const SuggestionItem = (item, isHighlighted) => (
	<div key={item.id} className={`row justify-content-start suggestion ${isHighlighted ? 'highlighted' : ''}`}>
		<div className="col-md-auto"><span> {item.name}</span></div>
	</div>
)

class DomainSuggest extends Component {
	constructor(props) {
		super(props)
		this.state = {}
		this.suggestResults.bind(this)
	}

	render() {
		return <CustomForm.CustomSuggest
			ref={ref => this.picker = ref}
			name="domain"
			inputProps={{ className: 'form-control' }}
			itemValue={item => item.id}
			items={this.suggestResults()}
			SuggestionItem={SuggestionItem}
			search={this.props.search}
			display={this.props.display}
			required={this.props.required}
			error={() => `Debes seleccionar ${this.props.type === 'Workshop' ? 'un taller' : 'un cliente'}`}
			onChange={this.props.onSearchChange}
			onItemSelected={this.props.onChange} />
	}

	suggestResults() {
		if (this.props.domainsQuery && this.props.domainsQuery.Domain && this.props.domainsQuery.Domain.all) {
			return this.props.domainsQuery.Domain.all.domains
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

DomainSuggest.propTypes = {
	required: PropTypes.bool,
	onChange: PropTypes.func,
	onItemSelected: PropTypes.func,
	domainsQuery: PropTypes.object,
	domain: PropTypes.string,
	search: PropTypes.string,
	display: PropTypes.string,
	onSearchChange: PropTypes.func,
	type: PropTypes.string,
}

const GraphQLPicker = graphql(domainsQuery, {
	name: 'domainsQuery',
	skip: ({ search }) => !search || search.length < 4,
	options: () => ({ fetchPolicy: 'network-only' }),
})(DomainSuggest)

class DomainPicker extends Component {
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
			ref={ref => this.picker = ref}
			type={this.props.type} search={this.state.search} display={this.state.display}
			required={this.props.required}
			onChange={this.onDomainChange.bind(this)}
			onSearchChange={(_, search) => this.setState({
				...this.state, search, display: search, touched: true, error: true,
			}, this.onDomainChange(null))}/>
	}


	onDomainChange(domain) {
		if (domain) {
			this.setState({
				...this.state, search: domain.name, display: domain.name, value: domain, error: false, touched: true,
			})
		}
		else {
			this.setState({
				...this.state, search: '', display: '', value: null, error: true, touched: true,
			})
		}
		this.props.onChange(domain)
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

DomainPicker.defaultProps = {
	onChange: () => {},
	required: false,
}

DomainPicker.propTypes = {
	type: PropTypes.string,
	required: PropTypes.bool,
	onChange: PropTypes.func,
}

export default DomainPicker
