import React, { Component } from 'react'
import PropTypes from 'prop-types'
import gql from 'graphql-tag'
import { graphql } from 'react-apollo'
import CustomForm from './CustomForm'

const linesQuery = gql`
	query queryLines($brand: ID!, $search: String){
		Line{
			all(brand: $brand, filter: { search: [$search] }, limit: 10) {
				lines {
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

class LineSuggest extends Component {
	constructor(props) {
		super(props)
		this.state = {}
		this.suggestResults.bind(this)
	}

	render() {
		return <CustomForm.CustomSuggest
			ref={ref => this.picker = ref}
			name="line"
			inputProps={{ className: 'form-control', disabled: this.props.disabled }}
			itemValue={item => item.id}
			items={this.suggestResults()}
			SuggestionItem={SuggestionItem}
			search={this.props.search}
			display={this.props.display}
			required={this.props.required}
			error={() => 'Selecciona una linea'}
			onChange={this.props.onSearchChange}
			onItemSelected={this.props.onChange} />
	}

	suggestResults() {
		if (this.props.lineQuery && this.props.lineQuery.Line && this.props.lineQuery.Line.all) {
			return this.props.lineQuery.Line.all.lines
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

LineSuggest.propTypes = {
	required: PropTypes.bool,
	onChange: PropTypes.func,
	onItemSelected: PropTypes.func,
	lineQuery: PropTypes.object,
	brand: PropTypes.string,
	search: PropTypes.string,
	display: PropTypes.string,
	onSearchChange: PropTypes.func,
	disabled: PropTypes.bool,
}

const GraphQLPicker = graphql(linesQuery, {
	name: 'lineQuery',
	skip: ({ search }) => !search || search.length < 4,
	options: () => ({ fetchPolicy: 'network-only' })
})(LineSuggest)

class LinePicker extends Component {
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
			brand={this.props.brand}
			search={this.state.search} display={this.state.display}
			required={this.props.required}
			onChange={this.onLineChange.bind(this)}
			onSearchChange={(_, search) => this.setState({
				...this.state, search, display: search, touched: true, error: true,
			}, this.onLineChange(null))}/>
	}


	onLineChange(line) {
		if (line) {
			this.setState({
				...this.state, search: line.name, display: line.name, value: line, error: false, touched: true,
			})
		}
		else {
			this.setState({
				...this.state, search: '', display: '', value: null, error: true, touched: true,
			})
		}
		this.props.onChange(line)
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

LinePicker.defaultProps = {
	onChange: () => {},
	required: false,
}

LinePicker.propTypes = {
	required: PropTypes.bool,
	onChange: PropTypes.func,
	brand: PropTypes.string,
}

export default LinePicker
