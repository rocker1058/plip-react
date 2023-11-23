import React, { Component } from 'react'
import PropTypes from 'prop-types'
import gql from 'graphql-tag'
import { graphql } from 'react-apollo'
import CustomForm from './CustomForm'

const brandsQuery = gql`
	query queryBrands($search: String){
		Brand{
			all(filter: { search: [$search] }, limit: 10) {
				brands {
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

class BrandSuggest extends Component {
	constructor(props) {
		super(props)
		this.state = {}
		this.suggestResults.bind(this)
	}

	render() {
		return <CustomForm.CustomSuggest
			ref={ref => this.picker = ref}
			name="brand"
			inputProps={{ className: 'form-control' }}
			itemValue={item => item.id}
			items={this.suggestResults()}
			SuggestionItem={SuggestionItem}
			search={this.props.search}
			display={this.props.display}
			required={this.props.required}
			error={() => 'Selecciona una marca'}
			onChange={this.props.onSearchChange}
			onItemSelected={this.props.onChange} />
	}

	suggestResults() {
		if (this.props.brandQuery && this.props.brandQuery.Brand && this.props.brandQuery.Brand.all) {
			return this.props.brandQuery.Brand.all.brands
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

BrandSuggest.propTypes = {
	required: PropTypes.bool,
	onChange: PropTypes.func,
	onItemSelected: PropTypes.func,
	brandQuery: PropTypes.object,
	domain: PropTypes.string,
	search: PropTypes.string,
	display: PropTypes.string,
	onSearchChange: PropTypes.func,
}

const GraphQLPicker = graphql(brandsQuery, {
	name: 'brandQuery',
	skip: ({ search }) => !search || search.length < 4,
	options: () => ({ fetchPolicy: 'network-only' })
})(BrandSuggest)

class BrandPicker extends Component {
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
			search={this.state.search} display={this.state.display}
			required={this.props.required}
			onChange={this.onBrandChange.bind(this)}
			onSearchChange={(_, search) => this.setState({
				...this.state, search, display: search, touched: true, error: true,
			}, this.onBrandChange(null))}/>
	}


	onBrandChange(brand) {
		if (brand) {
			this.setState({
				...this.state, search: brand.name, display: brand.name, value: brand, error: false, touched: true,
			})
		}
		else {
			this.setState({
				...this.state, search: '', display: '', value: null, error: true, touched: true,
			})
		}
		this.props.onChange(brand)
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

BrandPicker.defaultProps = {
	onChange: () => {},
	required: false,
}

BrandPicker.propTypes = {
	required: PropTypes.bool,
	onChange: PropTypes.func,
}

export default BrandPicker
