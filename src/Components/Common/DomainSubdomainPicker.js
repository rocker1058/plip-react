import React, { Component } from 'react'
import gql from 'graphql-tag'
import { graphql } from 'react-apollo'
import PropTypes from 'prop-types'
import CustomForm from './CustomForm'

const domainSubdomainQuery = gql`
	query queryDomains($type: DomainTypeEnum!, $search: String){
		Domain{
			all(type: $type, filter: { search: [$search] } limit: 10){
				domains{
					id
					name
					subdomains{
						subdomains{
							id
							name
						}
					}
				}
			}
		}
	}`


const SuggestionItem = (item, isHighlighted) => (
	<div key={item.subdomain.id} className={`row justify-content-start suggestion ${isHighlighted ? 'highlighted' : ''}`}>
		<div className="col-md-auto"><span> {item.domain.name} - {item.subdomain.name} </span></div>
	</div>
)

class DomainSubdomainSuggest extends Component {
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
			itemValue={item => item.domain.id}
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
		if (this.props.domainSubdomainQuery && this.props.domainSubdomainQuery.Domain && this.props.domainSubdomainQuery.Domain.all && this.props.domainSubdomainQuery.Domain.all.domains) {
			return this.props.domainSubdomainQuery.Domain.all.domains.reduce((acc, { subdomains, ...domain }) => [...acc, ...subdomains.subdomains.map(subdomain => ({ subdomain, domain }))], [])
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

DomainSubdomainSuggest.propTypes = {
	required: PropTypes.bool,
	onChange: PropTypes.func,
	onItemSelected: PropTypes.func,
	domainSubdomainQuery: PropTypes.object,
	domain: PropTypes.string,
	search: PropTypes.string,
	display: PropTypes.string,
	onSearchChange: PropTypes.func,
	type: PropTypes.string,
}

const GraphQLPicker = graphql(domainSubdomainQuery, {
	name: 'domainSubdomainQuery',
	skip: ({ search }) => !search || search.length < 4,
	options: () => ({ fetchPolicy: 'network-only' })
})(DomainSubdomainSuggest)

class DomainSubdomainPicker extends Component {
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
				...this.state, search: domain.name, display: `${domain.domain.name} - ${domain.subdomain.name}`, value: domain, error: false, touched: true,
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

DomainSubdomainPicker.defaultProps = {
	onChange: () => {},
	required: false,
}

DomainSubdomainPicker.propTypes = {
	type: PropTypes.string,
	required: PropTypes.bool,
	onChange: PropTypes.func,
}

export default DomainSubdomainPicker
