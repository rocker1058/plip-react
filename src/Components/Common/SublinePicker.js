import React, { Component } from 'react'
import PropTypes from 'prop-types'
import gql from 'graphql-tag'
import { graphql } from 'react-apollo'
import CustomForm from './CustomForm'

const sublinesQuery = gql`
	query querySublines($line: ID!, $search: String){
		Subline{
			all(line: $line, filter: { search: [$search] }, limit: 10) {
				sublines {
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

class SublineSuggest extends Component {
	constructor(props) {
		super(props)
		this.state = {}
		this.suggestResults.bind(this)
	}

	render() {
		return <CustomForm.CustomSuggest
			ref={ref => this.picker = ref}
			name="subline"
			inputProps={{ className: 'form-control', disabled: this.props.disabled }}
			itemValue={item => item.id}
			items={this.suggestResults()}
			SuggestionItem={SuggestionItem}
			search={this.props.search}
			display={this.props.display}
			required={this.props.required}
			error={() => 'Selecciona una sublinea'}
			onChange={this.props.onSearchChange}
			onItemSelected={this.props.onChange} />
	}

	suggestResults() {
		if (this.props.sublineQuery && this.props.sublineQuery.Subline && this.props.sublineQuery.Subline.all) {
			return this.props.sublineQuery.Subline.all.sublines
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

SublineSuggest.propTypes = {
	required: PropTypes.bool,
	onChange: PropTypes.func,
	onItemSelected: PropTypes.func,
	sublineQuery: PropTypes.object,
	brand: PropTypes.string,
	search: PropTypes.string,
	display: PropTypes.string,
	onSearchChange: PropTypes.func,
	disabled: PropTypes.bool,
}

const GraphQLPicker = graphql(sublinesQuery, {
	name: 'sublineQuery',
	skip: ({ search }) => !search || search.length < 4,
	options: () => ({ fetchPolicy: 'network-only' }),
})(SublineSuggest)

class SublinePicker extends Component {
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
			line={this.props.line}
			search={this.state.search} display={this.state.display}
			required={this.props.required}
			onChange={this.onSublineChange.bind(this)}
			onSearchChange={(_, search) => this.setState({
				...this.state, search, display: search, touched: true, error: true,
			}, this.onSublineChange(null))}/>
	}


	onSublineChange(subline) {
		if (subline) {
			this.setState({
				...this.state, search: subline.name, display: subline.name, value: subline, error: false, touched: true,
			})
		}
		else {
			this.setState({
				...this.state, search: '', display: '', value: null, error: true, touched: true,
			})
		}
		this.props.onChange(subline)
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

SublinePicker.defaultProps = {
	onChange: () => {},
	required: false,
}

SublinePicker.propTypes = {
	required: PropTypes.bool,
	onChange: PropTypes.func,
	line: PropTypes.string,
}

export default SublinePicker
