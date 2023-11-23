import React, { Component } from 'react'
import PropTypes from 'prop-types'
import Autocomplete from 'react-autocomplete'

class CustomSuggest extends Component {
	constructor(props) {
		super(props)
		const suggestions = props.defaultValue ? props.suggestions.filter(t => props.defaultValue.includes(t.id)) : []
		this.state = {
			value: suggestions || [],
			search: '',
			focused: false,
			error: false,
			touched: false,
		}
		this.suggestItems.bind(this)
		this.validateState.bind(this)
		this.reset.bind(this)
	}

	handleScroll() {
		this.setState({ focused: false })
	}

	componentDidMount() {
		window.addEventListener('scroll', this.handleScroll.bind(this), { passive: true })
	}

	componentWillUnmount() {
		window.removeEventListener('scroll', this.handleScroll.bind(this))
	}

	render() {
		return (
			<div className="col-12 filter-search">
				<div className="row input-holder">
					<Autocomplete
						getItemValue={item => item.text}
						inputProps={{
							className: `${this.props.className} ${this.state.error ? 'is-invalid' : ''}`,
							placeholder: this.props.placeholder,
							onFocus: () => this.setState({ focused: true }),
							onBlur: () => this.setState({ focused: false }),
							onKeyPress: this.handleEnter.bind(this),
						}}
						items={this.suggestItems()}
						open={this.state.search.length > 0 && this.state.focused}
						renderItem={this.props.suggestionComponent}
						// renderItem={(item, isHighlighted) =>
						// 	<div key={item.text} className={`row justify-content-start suggestion ${isHighlighted ? 'highlighted' : ''}`}>
						// 		<div className="col-md-auto"><span> {item.text} </span></div>
						// 	</div>
						// }
						value={this.state.search}
						onChange={e => this.setState({ search: e.target.value, focused: true })}
						onSelect={this.props.onSelected}
						menuStyle={{
							overflow: 'hidden',
							zIndex: 1000,
						}}
					/>
					{(this.state.error && this.state.touched) && this.props.error &&
						<div className="error">
							{this.state.error}
						</div>
					}
				</div>
			</div>
		)
	}

	suggestItems() {
		const filteredSuggestions = this.props.suggestions.filter(t => t.text.toLowerCase().includes(this.state.search.toLocaleLowerCase()))
		return filteredSuggestions
	}

	handleEnter(e) {
		if (e.key === 'Enter') {
			this.handleAddition(e.target.value)
		}
	}

	handleDelete(tag) {
		this.setState({ ...this.state, value: this.state.value.filter(t => t.text !== tag.text) }, () => this.onChange())
	}

	handleAddition(tag) {
		const suggestion = this.props.suggestions.find(t => t.text.toLowerCase() === tag.toLowerCase())
		if (suggestion) {
			this.onChange()
			this.setState({
				...this.state,
				search: '',
				value: [...this.state.value, suggestion],
				suggestions: this.props.suggestions.filter(t => t.text.toLowerCase() !== tag.toLowerCase()),
			}, () => this.onChange())
		}
	}

	onChange() {
		this.setState({
			touched: true,
			error: this.props.error(this.state.value.map(item => item.text)),
		}, () => this.props.onChange(this.props.name, this.state.value.map(item => item.text)))
	}

	validateState() {
		this.onChange()
	}

	reset() {
		this.setState({
			value: this.props.defaultValue || [],
			error: false,
			touched: false,
		})
	}
}

CustomSuggest.propTypes = {
	name: PropTypes.string.isRequired,
	className: PropTypes.string,
	error: PropTypes.func,
	defaultValue: PropTypes.array,
	onChange: PropTypes.func,
	suggestions: PropTypes.array.isRequired,
	placeholder: PropTypes.string,
	suggestionComponent: PropTypes.func,
	onSelected: PropTypes.func,
}

export default CustomSuggest
